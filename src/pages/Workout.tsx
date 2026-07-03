import { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "../store/appState";
import { demoUrl, EXERCISES, exerciseName } from "../data/exercises";
import { PLANS } from "../data/plans";
import { SUBSTITUTIONS, EXERCISE_OVERRIDES, COOLDOWN } from "../data/coach";
import { muscleGroupOf } from "../data/muscles";
import { suggestProgression } from "../store/progression";
import { lastEntry } from "../store/selectors";
import type { DraftExercise, Feel, SetLog, WorkoutLog } from "../types";
import { displayWeight, parseWeightInput } from "../lib/units";
import { formatDuration } from "../lib/dates";
import { uuid } from "../lib/id";
import { localize, useLang } from "../i18n";
import { Button, Chip, Input, Modal, Sheet } from "../ui/kit";
import { IconCheck, IconChevronDown, IconChevronUp, IconSwap, IconX } from "../ui/icons";

// ── Inputs that keep local text while dispatching parsed values ───────────────

function WeightInput({
  kg, unit, onChange,
}: { kg: number | null; unit: "kg" | "lb"; onChange: (kg: number | null) => void }) {
  const [text, setText] = useState(kg !== null ? String(displayWeight(kg, unit)) : "");
  const lastKg = useRef(kg);

  useEffect(() => {
    if (kg !== lastKg.current) {
      lastKg.current = kg;
      setText(kg !== null ? String(displayWeight(kg, unit)) : "");
    }
  }, [kg, unit]);

  return (
    <Input
      inputMode="decimal"
      placeholder="—"
      value={text}
      onChange={(e) => {
        const v = e.target.value;
        setText(v);
        const parsed = parseWeightInput(v, unit);
        lastKg.current = parsed;
        onChange(parsed);
      }}
    />
  );
}

function RepsInput({
  value, onChange,
}: { value: number | null; onChange: (v: number | null) => void }) {
  const [text, setText] = useState(value !== null ? String(value) : "");
  const last = useRef(value);

  useEffect(() => {
    if (value !== last.current) {
      last.current = value;
      setText(value !== null ? String(value) : "");
    }
  }, [value]);

  return (
    <Input
      inputMode="numeric"
      placeholder="—"
      value={text}
      onChange={(e) => {
        const v = e.target.value;
        setText(v);
        const n = parseInt(v, 10);
        const parsed = Number.isFinite(n) && n >= 1 ? n : null;
        last.current = parsed;
        onChange(parsed);
      }}
    />
  );
}

// ── Rest timer (timestamp-based — survives backgrounding) ─────────────────────

interface Rest {
  endsAt: number;
  total: number;
}

function RestBanner({ rest, onSkip, onExtend, lifted }: {
  rest: Rest;
  onSkip: () => void;
  onExtend: () => void;
  /** Raised above the focus-mode footer. */
  lifted: boolean;
}) {
  const { t } = useLang();
  const [, force] = useState(0);
  const doneAtRef = useRef<number | null>(null);

  const remaining = Math.max(0, Math.ceil((rest.endsAt - Date.now()) / 1000));
  const done = remaining === 0;

  useEffect(() => {
    const iv = setInterval(() => force((n) => n + 1), 300);
    return () => clearInterval(iv);
  }, [rest]);

  useEffect(() => {
    if (done && doneAtRef.current !== rest.endsAt) {
      doneAtRef.current = rest.endsAt;
      try { navigator.vibrate?.([200, 100, 200]); } catch { /* unsupported */ }
      const to = setTimeout(onSkip, 4000);
      return () => clearTimeout(to);
    }
    return undefined;
  }, [done, rest.endsAt, onSkip]);

  const frac = Math.min(1, remaining / rest.total);

  return (
    <div style={{
      position: "fixed", left: 12, right: 12,
      bottom: lifted ? "calc(86px + env(safe-area-inset-bottom))" : "calc(12px + env(safe-area-inset-bottom))",
      zIndex: 200,
      background: done ? "var(--accent)" : "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 16,
      boxShadow: "var(--shadow)",
      padding: "12px 16px",
      display: "flex", alignItems: "center", gap: 14,
    }}>
      <svg width="44" height="44" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r="19" fill="none" stroke={done ? "rgba(255,255,255,0.35)" : "var(--surface-2)"} strokeWidth="4" />
        <circle cx="22" cy="22" r="19" fill="none"
          stroke={done ? "#fff" : "var(--accent)"} strokeWidth="4"
          strokeDasharray={`${frac * 119.4} 119.4`}
          strokeLinecap="round" transform="rotate(-90 22 22)" />
      </svg>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: done ? "rgba(255,255,255,0.85)" : "var(--text-2)" }}>
          {done ? t("workout.rest_done") : t("workout.resting")}
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, color: done ? "#fff" : "var(--text-1)", fontVariantNumeric: "tabular-nums" }}>
          {formatDuration(remaining)}
        </div>
      </div>
      {!done && (
        <Button small onClick={onExtend}>+30s</Button>
      )}
      <Button small onClick={onSkip} style={done ? { background: "rgba(255,255,255,0.2)", color: "#fff", border: "none" } : undefined}>
        {t("workout.skip")}
      </Button>
    </div>
  );
}

// ── Exercise card ─────────────────────────────────────────────────────────────

function ExerciseCard({
  ex, exIdx, onStartRest, onOpenSwap,
}: {
  ex: DraftExercise;
  exIdx: number;
  onStartRest: (secs: number) => void;
  onOpenSwap: () => void;
}) {
  const { state, dispatch, index } = useApp();
  const { t, lang } = useLang();
  const unit = state.settings.unit;
  const info = EXERCISES[ex.exerciseId];
  const timed = info?.repType === "seconds";

  const prev = useMemo(() => lastEntry(index, ex.exerciseId), [index, ex.exerciseId]);
  const suggestion = useMemo(
    () => (info ? suggestProgression(index, info, ex.targetReps, unit) : null),
    [index, info, ex.targetReps, unit]
  );
  const override = EXERCISE_OVERRIDES[ex.exerciseId];
  const note = state.settings.machineNotes[ex.exerciseId] ?? "";
  const doneCount = ex.sets.filter((s) => s.completed).length;

  const feels: Feel[] = ["easy", "good", "hard", "tough"];

  function fillSuggestion() {
    if (!suggestion) return;
    ex.sets.forEach((s, si) => {
      if (s.weightKg === null && !s.completed) {
        dispatch({ type: "updateSet", exIdx, setIdx: si, patch: { weightKg: suggestion.weightKg } });
      }
    });
  }

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        width: "100%", padding: "14px 16px",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)" }}>
            {exerciseName(ex.exerciseId)}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>
            {ex.targetSets} × {ex.targetReps}{timed ? ` ${t("common.secs")}` : ""} · {t("workout.rest")} {formatDuration(ex.restSecs)}
          </div>
        </div>
        {doneCount === ex.sets.length && ex.sets.length > 0
          ? <Chip tone="accent"><IconCheck size={12} /> {doneCount}/{ex.sets.length}</Chip>
          : <Chip>{doneCount}/{ex.sets.length}</Chip>}
      </div>

      {(
        <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Coach suggestion */}
          {suggestion && (
            <button onClick={fillSuggestion} style={{
              background: "var(--accent-soft)", color: "var(--accent)",
              border: "none", borderRadius: 10, padding: "9px 12px",
              fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "left",
            }}>
              → {displayWeight(suggestion.weightKg, unit)} {unit} · {t(suggestion.reasonKey, suggestion.reasonVars)}
            </button>
          )}
          {override?.warning && (
            <div style={{ fontSize: 12, color: "var(--gold)" }}>⚠ {localize(override.warning, lang)}</div>
          )}

          {/* Sets */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="set-row" style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600 }}>
              <span />
              <span style={{ textAlign: "center" }}>{t("workout.prev")}</span>
              <span style={{ textAlign: "center" }}>{t("workout.weight", { unit })}</span>
              <span style={{ textAlign: "center" }}>{timed ? t("workout.seconds") : t("workout.reps")}</span>
              <span />
            </div>
            {ex.sets.map((set, si) => {
              const prevSet = prev?.sets[si];
              return (
                <div key={si} className="set-row">
                  <span className="idx">{si + 1}</span>
                  <span style={{ fontSize: 12, color: "var(--text-3)", textAlign: "center" }}>
                    {prevSet
                      ? `${prevSet.weightKg !== null ? displayWeight(prevSet.weightKg, unit) : "–"}×${prevSet.reps}`
                      : "—"}
                  </span>
                  <WeightInput
                    kg={set.weightKg}
                    unit={unit}
                    onChange={(weightKg) => dispatch({ type: "updateSet", exIdx, setIdx: si, patch: { weightKg } })}
                  />
                  <RepsInput
                    value={set.reps}
                    onChange={(reps) => dispatch({ type: "updateSet", exIdx, setIdx: si, patch: { reps } })}
                  />
                  <button
                    className={`set-check${set.completed ? " done" : ""}`}
                    onClick={() => {
                      const completing = !set.completed;
                      if (completing && set.reps === null) {
                        // checking an unfilled set logs the target automatically
                        dispatch({ type: "updateSet", exIdx, setIdx: si, patch: { reps: ex.targetReps } });
                      }
                      dispatch({ type: "toggleSet", exIdx, setIdx: si });
                      if (completing) onStartRest(ex.restSecs);
                    }}
                  >
                    <IconCheck size={18} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Feel */}
          <div>
            <div style={{ fontSize: 12, color: "var(--text-2)", fontWeight: 600, marginBottom: 6 }}>
              {t("workout.feel")}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {feels.map((f) => (
                <button key={f}
                  onClick={() => dispatch({ type: "setFeel", exIdx, feel: ex.feel === f ? null : f })}
                  className="btn btn-sm"
                  style={ex.feel === f
                    ? { background: "var(--accent-soft)", color: "var(--accent)", borderColor: "var(--accent)", flex: 1 }
                    : { flex: 1 }}
                >
                  {t(`feel.${f}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Machine note */}
          <div>
            <div style={{ fontSize: 12, color: "var(--text-2)", fontWeight: 600, marginBottom: 6 }}>
              {t("workout.machine_note")}
            </div>
            <Input
              value={note}
              placeholder={t("workout.machine_note_hint")}
              onChange={(e) => dispatch({ type: "machineNote", exerciseId: ex.exerciseId, note: e.target.value })}
            />
          </div>

          {/* Tip + demo + swap */}
          {info?.tip && (
            <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>
              <span style={{ fontWeight: 700 }}>{t("workout.tip")}: </span>
              {localize(info.tip, lang)}
            </div>
          )}
          <div style={{ display: "flex", gap: 4 }}>
            <a
              href={demoUrl(exerciseName(ex.exerciseId))}
              target="_blank" rel="noopener noreferrer"
              className="btn btn-ghost btn-sm"
              style={{ color: "var(--text-2)", textDecoration: "none" }}
            >
              ▶ {t("workout.watch_demo")}
            </a>
            <Button small variant="ghost" onClick={onOpenSwap} style={{ color: "var(--text-2)" }}>
              <IconSwap size={14} /> {t("workout.swap")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Compact list row (tap to focus) ───────────────────────────────────────────

function ExerciseRow({ ex, onFocus }: { ex: DraftExercise; onFocus: () => void }) {
  const { t } = useLang();
  const done = ex.sets.length > 0 && ex.sets.every((s) => s.completed);
  const needsFeel = done && !ex.feel;
  const doneCount = ex.sets.filter((s) => s.completed).length;

  return (
    <button
      onClick={onFocus}
      className="card"
      style={{
        width: "100%", cursor: "pointer", textAlign: "left",
        display: "flex", alignItems: "center", gap: 12,
        padding: "14px 16px",
        background: done ? (needsFeel ? "var(--gold-soft)" : "var(--accent-soft)") : "var(--surface)",
        borderColor: done ? (needsFeel ? "var(--gold)" : "var(--accent)") : "var(--border)",
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>
          {exerciseName(ex.exerciseId)}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>
          {needsFeel
            ? t("workout.feel")
            : `${doneCount}/${ex.sets.length} · ${ex.targetSets} × ${ex.targetReps}`}
        </div>
      </div>
      {done && !needsFeel && <span style={{ color: "var(--accent)" }}><IconCheck size={18} /></span>}
      <span style={{ color: "var(--text-3)", fontSize: 18 }}>›</span>
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Workout({
  onFinished, onExit,
}: {
  onFinished: (log: WorkoutLog) => void;
  onExit: () => void;
}) {
  const { state, dispatch } = useApp();
  const { t, lang } = useLang();
  const session = state.session;

  // Focus mode: one exercise fills the screen, no scrolling mid-workout.
  // Starts focused on the first incomplete exercise; null = list overview.
  const [focusIdx, setFocusIdx] = useState<number | null>(() => {
    const exs = state.session?.exercises ?? [];
    const idx = exs.findIndex((e) => e.sets.some((s) => !s.completed));
    return idx >= 0 ? idx : null;
  });
  const [rest, setRest] = useState<Rest | null>(null);
  const [swapFor, setSwapFor] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<"discard" | "incomplete" | null>(null);

  const counts = useMemo(() => {
    if (!session) return { logged: 0, total: 0, done: 0 };
    let logged = 0, total = 0, done = 0;
    for (const ex of session.exercises) {
      for (const s of ex.sets) {
        total++;
        if (s.reps !== null) logged++;
        if (s.completed) done++;
      }
    }
    return { logged, total, done };
  }, [session]);

  if (!session) return null;

  const allSetsDone = counts.total > 0 && counts.done === counts.total;
  const cooldownComplete = session.cooldownDone.length >= COOLDOWN.length;

  function buildLog(): WorkoutLog | null {
    if (!session) return null;
    const exercises = session.exercises
      .map((ex) => ({
        exerciseId: ex.exerciseId,
        feel: ex.feel,
        sets: ex.sets
          .filter((s): s is typeof s & { reps: number } => s.reps !== null && s.reps >= 1)
          .map((s): SetLog => ({ weightKg: s.weightKg, reps: s.reps, completed: s.completed })),
      }))
      .filter((ex) => ex.sets.length > 0);
    if (exercises.length === 0) return null;
    const now = new Date();
    return {
      id: uuid(),
      planId: session.planId,
      dayId: session.dayId,
      dayName: session.dayName,
      startedAt: session.startedAt,
      completedAt: now.toISOString(),
      durationSecs: Math.max(0, Math.round((now.getTime() - new Date(session.startedAt).getTime()) / 1000)),
      exercises,
    };
  }

  function tryFinish() {
    const log = buildLog();
    if (!log) { setConfirm("discard"); return; }
    if (counts.logged < counts.total || !cooldownComplete) { setConfirm("incomplete"); return; }
    onFinished(log);
  }

  function tryExit() {
    if (counts.logged > 0) setConfirm("discard");
    else { dispatch({ type: "discardSession" }); onExit(); }
  }

  const swapEx = swapFor !== null ? session.exercises[swapFor] : undefined;
  const swapOptions = useMemo(() => {
    if (!swapEx) return [];
    const current = EXERCISES[swapEx.exerciseId];
    const ranked = SUBSTITUTIONS[swapEx.exerciseId] ?? [];
    const rankedIds = new Set(ranked.map((r) => r.exerciseId));
    const sameGroup = current
      ? Object.values(EXERCISES).filter(
          (e) =>
            e.id !== swapEx.exerciseId &&
            !rankedIds.has(e.id) &&
            muscleGroupOf(e.primaryMuscle) === muscleGroupOf(current.primaryMuscle)
        )
      : [];
    return [
      ...ranked.map((r) => ({ id: r.exerciseId, reason: localize(r.reason, lang) })),
      ...sameGroup.map((e) => ({ id: e.id, reason: "" })),
    ];
  }, [swapEx, lang]);

  return (
    <div className="page" style={{ paddingBottom: (focusIdx !== null ? 90 : 20) + (rest ? 90 : 0) + 70 }}>
      {/* Header */}
      <div className="page-header">
        <button onClick={tryExit} className="btn btn-ghost btn-sm" style={{ color: "var(--text-2)", padding: 6 }}>
          <IconX size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{session.dayName}</div>
          <div style={{ fontSize: 12, color: "var(--text-2)" }}>
            {t("workout.progress", { done: counts.done, total: counts.total })}
          </div>
        </div>
        <Button
          small
          variant={allSetsDone && !cooldownComplete ? "default" : "primary"}
          onClick={tryFinish}
          style={allSetsDone && !cooldownComplete
            ? { background: "var(--gold-soft)", color: "var(--gold)", borderColor: "var(--gold)" }
            : undefined}
        >
          {allSetsDone && !cooldownComplete ? t("workout.cooldown_first") : t("workout.finish")}
        </Button>
      </div>

      {/* List mode — compact overview, tap a row to focus */}
      {focusIdx === null && (
        <div className="page-body">
          <WarmupCard />

          {session.exercises.map((ex, i) => (
            <ExerciseRow key={`${i}-${ex.exerciseId}`} ex={ex} onFocus={() => setFocusIdx(i)} />
          ))}

          <CooldownCard autoExpand={allSetsDone && !cooldownComplete} />
        </div>
      )}

      {/* Focus mode — single exercise, navigator + progress dots */}
      {focusIdx !== null && session.exercises[focusIdx] && (
        <div className="page-body" style={{ paddingBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setFocusIdx(null)}
              className="btn btn-ghost btn-sm"
              style={{ color: "var(--text-2)", padding: "4px 0" }}
            >
              ‹ {t("workout.all")}
            </button>
            <div style={{ flex: 1 }} />
            <Button small disabled={focusIdx === 0} onClick={() => setFocusIdx(focusIdx - 1)}>‹</Button>
            <span style={{ fontSize: 12, color: "var(--text-2)", minWidth: 40, textAlign: "center" }}>
              {focusIdx + 1} / {session.exercises.length}
            </span>
            <Button small disabled={focusIdx === session.exercises.length - 1} onClick={() => setFocusIdx(focusIdx + 1)}>›</Button>
          </div>

          {/* Progress dots */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {session.exercises.map((e, i) => {
              const done = e.sets.length > 0 && e.sets.every((s) => s.completed);
              const noFeel = done && !e.feel;
              const active = i === focusIdx;
              return (
                <div
                  key={i}
                  onClick={() => setFocusIdx(i)}
                  style={{
                    width: active ? 22 : 8, height: 8, borderRadius: 4,
                    background: done ? (noFeel ? "var(--gold)" : "var(--accent)") : active ? "var(--accent)" : "var(--border)",
                    cursor: "pointer", transition: "all 0.2s", flexShrink: 0,
                  }}
                />
              );
            })}
          </div>

          <ExerciseCard
            key={`${focusIdx}-${session.exercises[focusIdx].exerciseId}`}
            ex={session.exercises[focusIdx]}
            exIdx={focusIdx}
            onStartRest={(secs) => setRest({ endsAt: Date.now() + secs * 1000, total: secs })}
            onOpenSwap={() => setSwapFor(focusIdx)}
          />
        </div>
      )}

      {/* Focus-mode sticky footer: next exercise, or back to the list */}
      {focusIdx !== null && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
          background: "var(--surface)", borderTop: "1px solid var(--border)",
          padding: "12px 16px calc(12px + env(safe-area-inset-bottom))",
        }}>
          {focusIdx < session.exercises.length - 1 ? (
            <Button block variant="primary" onClick={() => setFocusIdx(focusIdx + 1)}>
              {t("workout.next_exercise")}
            </Button>
          ) : (
            <Button block variant={allSetsDone && !cooldownComplete ? "default" : "primary"}
              style={allSetsDone && !cooldownComplete
                ? { background: "var(--gold-soft)", color: "var(--gold)", borderColor: "var(--gold)" }
                : undefined}
              onClick={() => {
                if (allSetsDone && !cooldownComplete) setFocusIdx(null); // list auto-opens the cooldown
                else tryFinish();
              }}
            >
              {allSetsDone && !cooldownComplete ? t("workout.cooldown_first") : t("workout.finish")}
            </Button>
          )}
        </div>
      )}

      {rest && (
        <RestBanner
          rest={rest}
          lifted={focusIdx !== null}
          onSkip={() => setRest(null)}
          onExtend={() => setRest((r) => (r ? { endsAt: r.endsAt + 30_000, total: r.total + 30 } : r))}
        />
      )}

      {/* Swap sheet */}
      {swapFor !== null && swapEx && (
        <Sheet onClose={() => setSwapFor(null)}>
          <div className="card-title">{t("workout.swap_for", { name: exerciseName(swapEx.exerciseId) })}</div>
          <div className="fade-list" style={{ marginTop: 12 }}>
            {swapOptions.length === 0 && <div style={{ color: "var(--text-2)", fontSize: 13 }}>{t("workout.swap_none")}</div>}
            {swapOptions.map((opt) => (
              <button key={opt.id} className="btn btn-block" style={{ justifyContent: "flex-start", flexDirection: "column", alignItems: "flex-start", gap: 2 }}
                onClick={() => {
                  dispatch({ type: "swapExercise", exIdx: swapFor, exerciseId: opt.id });
                  setSwapFor(null);
                }}
              >
                <span>{exerciseName(opt.id)}</span>
                {opt.reason && <span style={{ fontSize: 12, fontWeight: 400, color: "var(--text-2)" }}>{opt.reason}</span>}
              </button>
            ))}
          </div>
        </Sheet>
      )}

      {/* Confirm dialogs */}
      {confirm === "discard" && (
        <Modal onClose={() => setConfirm(null)}>
          <div className="card-title">{t("workout.discard_title")}</div>
          <div style={{ fontSize: 13, color: "var(--text-2)", margin: "6px 0 16px" }}>
            {t("workout.discard_body", { count: counts.logged })}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button block onClick={() => setConfirm(null)}>{t("workout.keep_going")}</Button>
            <Button block variant="danger" onClick={() => {
              setConfirm(null);
              dispatch({ type: "discardSession" });
              onExit();
            }}>{t("workout.discard")}</Button>
          </div>
        </Modal>
      )}
      {confirm === "incomplete" && (
        <Modal onClose={() => setConfirm(null)}>
          <div className="card-title">{t("workout.incomplete_title")}</div>
          <div style={{ fontSize: 13, color: "var(--text-2)", margin: "6px 0 16px", display: "flex", flexDirection: "column", gap: 4 }}>
            {counts.logged < counts.total && (
              <span>• {t("workout.sets_missing", { count: counts.total - counts.logged })}</span>
            )}
            {!cooldownComplete && <span>• {t("workout.cooldown_missing")}</span>}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button block onClick={() => setConfirm(null)}>{t("workout.keep_going")}</Button>
            <Button block variant="primary" onClick={() => {
              setConfirm(null);
              const log = buildLog();
              if (log) onFinished(log);
            }}>{t("workout.finish_anyway")}</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Cooldown checklist (auto-expands once every set is done) ──────────────────

function CooldownCard({ autoExpand }: { autoExpand: boolean }) {
  const { state, dispatch } = useApp();
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const session = state.session;

  useEffect(() => {
    if (autoExpand) {
      setOpen(true);
      const id = setTimeout(
        () => ref.current?.scrollIntoView({ behavior: "smooth", block: "center" }),
        350
      );
      return () => clearTimeout(id);
    }
    return undefined;
  }, [autoExpand]);

  if (!session) return null;
  const done = session.cooldownDone.length;

  return (
    <div ref={ref} className="card" style={{ padding: 0, overflow: "hidden" }}>
      <button onClick={() => setOpen((o) => !o)}
        style={{ width: "100%", padding: "13px 16px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, textAlign: "left", fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>
          {t("workout.cooldown")}
        </div>
        <Chip tone={done >= COOLDOWN.length ? "accent" : "default"}>{done}/{COOLDOWN.length}</Chip>
        <span style={{ color: "var(--text-3)" }}>{open ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}</span>
      </button>
      {open && (
        <div style={{ padding: "0 16px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
          {COOLDOWN.map((c, i) => {
            const checked = session.cooldownDone.includes(i);
            return (
              <button key={i} onClick={() => dispatch({ type: "toggleCooldown", idx: i })}
                style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}>
                <span className={`set-check${checked ? " done" : ""}`} style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0 }}>
                  <IconCheck size={14} />
                </span>
                <span style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: checked ? "var(--text-3)" : "var(--text-1)", textDecoration: checked ? "line-through" : "none" }}>
                    {localize(c.name, lang)}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text-3)", display: "block" }}>{localize(c.detail, lang)}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Warmup checklist ──────────────────────────────────────────────────────────

function WarmupCard() {
  const { state, dispatch } = useApp();
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const session = state.session;
  if (!session) return null;

  const warmup = PLANS[session.planId]?.days.find((d) => d.id === session.dayId)?.warmup ?? [];
  if (warmup.length === 0) return null;

  const done = session.warmupDone.length;

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <button onClick={() => setOpen((o) => !o)}
        style={{ width: "100%", padding: "13px 16px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, textAlign: "left", fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>
          {t("workout.warmup")}
        </div>
        <Chip tone={done === warmup.length ? "accent" : "default"}>{done}/{warmup.length}</Chip>
        <span style={{ color: "var(--text-3)" }}>{open ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}</span>
      </button>
      {open && (
        <div style={{ padding: "0 16px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
          {warmup.map((w, i) => {
            const checked = session.warmupDone.includes(i);
            return (
              <button key={i} onClick={() => dispatch({ type: "toggleWarmup", idx: i })}
                style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}>
                <span className={`set-check${checked ? " done" : ""}`} style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0 }}>
                  <IconCheck size={14} />
                </span>
                <span style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: checked ? "var(--text-3)" : "var(--text-1)", textDecoration: checked ? "line-through" : "none" }}>
                    {localize(w.name, lang)}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text-3)", display: "block" }}>{localize(w.detail, lang)}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
