import { useMemo, useState } from "react";
import { useApp } from "../store/appState";
import { allExercises, getExercise, resolveExerciseName } from "../data/exerciseResolver";
import { MUSCLE_GROUPS, muscleGroupOf, muscleLabel } from "../data/muscles";
import { normalizePlan, removeDayFromPlan, validatePlan } from "../data/planResolver";
import ExerciseForm from "../components/ExerciseForm";
import type { Plan, PlanDay, RotationSlot } from "../types";
import { uuid } from "../lib/id";
import { localize, useLang } from "../i18n";
import { Button, Card, Chip, EmptyState, Input, Modal, Segmented, SectionLabel, Sheet, Stepper } from "../ui/kit";
import { IconChevronDown, IconChevronUp, IconX } from "../ui/icons";
import PlanPreview from "../components/PlanPreview";

type Difficulty = Plan["difficulty"];
type Goal = Plan["goal"];

const DIFFICULTIES: Difficulty[] = ["beginner", "intermediate", "advanced"];
const GOALS: Goal[] = ["strength", "hypertrophy", "fatLoss", "endurance", "functional-longevity"];
const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

/** Fresh draft: one empty day plus a Mon/Wed/Fri workout week referencing it. */
function blankPlan(): Plan {
  const dayId = uuid();
  return {
    id: uuid(),
    name: "",
    tagline: { en: "" },
    difficulty: "beginner",
    daysPerWeek: 3,
    estimatedMins: 0,
    goal: "strength",
    schedule: {
      cycleLength: 7,
      rotation: [
        { type: "workout", dayId },
        { type: "rest" },
        { type: "workout", dayId },
        { type: "rest" },
        { type: "workout", dayId },
        { type: "rest" },
        { type: "rest" },
      ],
    },
    days: [{ id: dayId, name: { en: "Day 1" }, warmup: [], exercises: [] }],
  };
}

/** Deep clone so editing a draft never mutates the stored plan until Save. */
function clonePlan(plan: Plan): Plan {
  return JSON.parse(JSON.stringify(plan)) as Plan;
}

function move<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const next = arr.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item!);
  return next;
}

export default function PlanBuilder({
  initial, onClose,
}: {
  /** Existing plan to edit, or null to create a new one. */
  initial: Plan | null;
  onClose: () => void;
}) {
  const { state, dispatch } = useApp();
  const { t, lang } = useLang();
  const [draft, setDraft] = useState<Plan>(() => (initial ? clonePlan(initial) : blankPlan()));
  const [pickerDay, setPickerDay] = useState<number | null>(null);
  const [slotPicker, setSlotPicker] = useState<number | null>(null);
  const [filter, setFilter] = useState("");
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [creatingExercise, setCreatingExercise] = useState(false);

  const errors = useMemo(() => validatePlan(draft, state.settings), [draft, state.settings]);
  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(initial ?? blankPlan()),
    [draft, initial]
  );

  // ── Day + exercise mutations ────────────────────────────────────────────────
  const patchDay = (dayIdx: number, fn: (d: PlanDay) => PlanDay) =>
    setDraft((p) => ({ ...p, days: p.days.map((d, i) => (i === dayIdx ? fn(d) : d)) }));

  const addDay = () =>
    setDraft((p) => ({
      ...p,
      days: [...p.days, { id: uuid(), name: { en: `Day ${p.days.length + 1}` }, warmup: [], exercises: [] }],
    }));

  const deleteDay = (dayIdx: number) =>
    setDraft((p) => removeDayFromPlan(p, p.days[dayIdx]!.id));

  const reorderDay = (dayIdx: number, dir: -1 | 1) =>
    setDraft((p) => ({ ...p, days: move(p.days, dayIdx, dayIdx + dir) }));

  const addExercise = (dayIdx: number, exerciseId: string) => {
    const ex = getExercise(exerciseId, state.settings);
    if (!ex) return;
    patchDay(dayIdx, (d) => ({
      ...d,
      exercises: [...d.exercises, { exerciseId, sets: ex.defaultSets, reps: ex.defaultReps, restSecs: ex.restSecs }],
    }));
  };

  const removeExercise = (dayIdx: number, exIdx: number) =>
    patchDay(dayIdx, (d) => ({ ...d, exercises: d.exercises.filter((_, i) => i !== exIdx) }));

  const reorderExercise = (dayIdx: number, exIdx: number, dir: -1 | 1) =>
    patchDay(dayIdx, (d) => ({ ...d, exercises: move(d.exercises, exIdx, exIdx + dir) }));

  const patchExercise = (dayIdx: number, exIdx: number, key: "sets" | "reps" | "restSecs", value: number) =>
    patchDay(dayIdx, (d) => ({
      ...d,
      exercises: d.exercises.map((pe, i) => (i === exIdx ? { ...pe, [key]: value } : pe)),
    }));

  const setSlot = (slotIdx: number, slot: RotationSlot) =>
    setDraft((p) => ({
      ...p,
      schedule: { ...p.schedule, rotation: p.schedule.rotation.map((s, i) => (i === slotIdx ? slot : s)) },
    }));

  // ── Save ────────────────────────────────────────────────────────────────────
  const save = (activate: boolean) => {
    if (errors.length > 0) return;
    const plan = normalizePlan(draft);
    dispatch({ type: "upsertPlan", plan });
    if (activate) dispatch({ type: "settings", patch: { activePlanId: plan.id, nextDayIdx: 0 } });
    onClose();
  };

  const tryClose = () => (dirty ? setConfirmDiscard(true) : onClose());

  // Exercises available in the picker: same catalogue, grouped by muscle group,
  // excluding ones already on the day, with an optional text filter.
  const pickerGroups = useMemo(() => {
    if (pickerDay === null) return [];
    const chosen = new Set(draft.days[pickerDay]!.exercises.map((pe) => pe.exerciseId));
    const q = filter.trim().toLowerCase();
    return MUSCLE_GROUPS.map((group) => ({
      group,
      items: allExercises(state.settings).filter(
        (e) =>
          muscleGroupOf(e.primaryMuscle) === group &&
          !chosen.has(e.id) &&
          (q === "" || e.name.toLowerCase().includes(q))
      ),
    })).filter((g) => g.items.length > 0);
  }, [pickerDay, draft.days, filter, state.settings]);

  return (
    <div className="page" style={{ paddingBottom: "calc(20px + env(safe-area-inset-bottom))" }}>
      {/* Header */}
      <div className="page-header">
        <button onClick={tryClose} className="btn btn-ghost btn-sm" style={{ color: "var(--text-2)", padding: 6 }}>
          <IconX size={20} />
        </button>
        <div style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>
          {initial ? t("builder.title_edit") : t("builder.title_new")}
        </div>
        <Button small variant="primary" disabled={errors.length > 0} onClick={() => save(false)}>
          {t("common.save")}
        </Button>
      </div>

      <div className="page-body">
        {/* ── Details ─────────────────────────────────────────────────────── */}
        <SectionLabel>{t("builder.details")}</SectionLabel>
        <Card>
          <Input
            placeholder={t("builder.name_placeholder")}
            value={draft.name}
            onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
          />
          <Input
            style={{ marginTop: 8 }}
            placeholder={t("builder.tagline_placeholder")}
            value={draft.tagline.en}
            onChange={(e) => setDraft((p) => ({ ...p, tagline: { en: e.target.value } }))}
          />
          <div style={{ marginTop: 12, fontSize: 12, color: "var(--text-2)", marginBottom: 4 }}>{t("builder.difficulty")}</div>
          <Segmented<Difficulty>
            options={DIFFICULTIES.map((d) => ({ value: d, label: t(`programs.difficulty.${d}`) }))}
            value={draft.difficulty}
            onChange={(difficulty) => setDraft((p) => ({ ...p, difficulty }))}
          />
          <div style={{ marginTop: 12, fontSize: 12, color: "var(--text-2)", marginBottom: 4 }}>{t("builder.goal")}</div>
          <Segmented<Goal>
            options={GOALS.map((g) => ({ value: g, label: t(`builder.goal.${g}`) }))}
            value={GOALS.includes(draft.goal) ? draft.goal : "strength"}
            onChange={(goal) => setDraft((p) => ({ ...p, goal }))}
          />
        </Card>

        {/* ── Days ────────────────────────────────────────────────────────── */}
        <SectionLabel>{t("builder.days")}</SectionLabel>
        {draft.days.map((day, dayIdx) => (
          <Card key={day.id}>
            <div className="row" style={{ gap: 8 }}>
              <Input
                style={{ flex: 1 }}
                placeholder={t("builder.day_name")}
                value={day.name.en}
                onChange={(e) => patchDay(dayIdx, (d) => ({ ...d, name: { en: e.target.value } }))}
              />
              <Button small variant="ghost" disabled={dayIdx === 0} onClick={() => reorderDay(dayIdx, -1)} aria-label={t("builder.move_up")}>
                <IconChevronUp size={16} />
              </Button>
              <Button small variant="ghost" disabled={dayIdx === draft.days.length - 1} onClick={() => reorderDay(dayIdx, 1)} aria-label={t("builder.move_down")}>
                <IconChevronDown size={16} />
              </Button>
              <Button small variant="ghost" style={{ color: "var(--red)" }} onClick={() => deleteDay(dayIdx)} aria-label={t("builder.delete_day")}>
                <IconX size={16} />
              </Button>
            </div>

            {day.exercises.length === 0 && <EmptyState>{t("builder.no_exercises")}</EmptyState>}

            {day.exercises.map((pe, exIdx) => (
              <div key={`${pe.exerciseId}-${exIdx}`} style={{ borderTop: "1px solid var(--border)", paddingTop: 8, marginTop: 8 }}>
                <div className="row" style={{ gap: 6 }}>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{resolveExerciseName(pe.exerciseId, state.settings)}</span>
                  <Button small variant="ghost" disabled={exIdx === 0} onClick={() => reorderExercise(dayIdx, exIdx, -1)} aria-label={t("builder.move_up")}>
                    <IconChevronUp size={15} />
                  </Button>
                  <Button small variant="ghost" disabled={exIdx === day.exercises.length - 1} onClick={() => reorderExercise(dayIdx, exIdx, 1)} aria-label={t("builder.move_down")}>
                    <IconChevronDown size={15} />
                  </Button>
                  <Button small variant="ghost" style={{ color: "var(--red)" }} onClick={() => removeExercise(dayIdx, exIdx)} aria-label={t("builder.remove")}>
                    <IconX size={15} />
                  </Button>
                </div>
                <Stepper label={t("builder.sets")} value={pe.sets} min={1} max={10}
                  onChange={(v) => patchExercise(dayIdx, exIdx, "sets", v)} />
                <Stepper label={t("builder.reps")} value={pe.reps} min={1} max={60}
                  onChange={(v) => patchExercise(dayIdx, exIdx, "reps", v)} />
                <Stepper label={t("builder.rest")} value={pe.restSecs} min={0} max={240} step={15}
                  onChange={(v) => patchExercise(dayIdx, exIdx, "restSecs", v)} />
              </div>
            ))}

            <Button block variant="ghost" small style={{ marginTop: 10 }} onClick={() => { setFilter(""); setPickerDay(dayIdx); }}>
              + {t("builder.add_exercise")}
            </Button>
          </Card>
        ))}
        <Button block onClick={addDay}>+ {t("builder.add_day")}</Button>

        {/* ── Weekly schedule ─────────────────────────────────────────────── */}
        <SectionLabel>{t("builder.rotation")}</SectionLabel>
        <Card>
          {draft.schedule.rotation.map((slot, i) => {
            const label = slot.type === "workout"
              ? localize(draft.days.find((d) => d.id === slot.dayId)?.name, lang) || "?"
              : slot.type === "cardio" ? t("programs.cardio") : t("programs.rest");
            return (
              <div key={i} className="row" style={{ padding: "8px 0", borderTop: i === 0 ? "none" : "1px solid var(--border)" }}>
                <span style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "var(--text-2)" }}>
                  {t(`builder.weekday.${WEEKDAYS[i]}`)}
                </span>
                <Button small variant={slot.type === "workout" ? "primary" : "default"} onClick={() => setSlotPicker(i)}>
                  {label}
                </Button>
              </div>
            );
          })}
        </Card>

        {/* ── Live preview ────────────────────────────────────────────────── */}
        <SectionLabel>{t("programs.preview")}</SectionLabel>
        <Card>
          <PlanPreview plan={normalizePlan(draft)} showDemoLinks={false} />
        </Card>

        {/* ── Errors ──────────────────────────────────────────────────────── */}
        {errors.length > 0 && (
          <Card>
            <div style={{ fontSize: 12, color: "var(--red)", fontWeight: 600, marginBottom: 4 }}>{t("builder.fix_first")}</div>
            {errors.map((key) => (
              <div key={key} style={{ fontSize: 12, color: "var(--text-2)" }}>• {t(key)}</div>
            ))}
          </Card>
        )}

        <Button block variant="primary" disabled={errors.length > 0} onClick={() => save(true)}>
          {t("builder.save_activate")}
        </Button>
      </div>

      {/* Exercise picker */}
      {pickerDay !== null && (
        <Sheet onClose={() => setPickerDay(null)}>
          <div className="card-title" style={{ marginBottom: 10 }}>{t("builder.pick_exercise")}</div>
          <Input placeholder={t("builder.search")} value={filter} onChange={(e) => setFilter(e.target.value)} />
          <Button block variant="ghost" small style={{ marginTop: 8 }} onClick={() => setCreatingExercise(true)}>
            + {t("customex.add")}
          </Button>
          <div className="fade-list" style={{ marginTop: 12 }}>
            {pickerGroups.length === 0 && <EmptyState>{t("builder.no_matches")}</EmptyState>}
            {pickerGroups.map((g) => (
              <div key={g.group}>
                <SectionLabel>{t(`muscle.${g.group}`)}</SectionLabel>
                {g.items.map((e) => (
                  <button
                    key={e.id}
                    className="btn btn-block"
                    style={{ justifyContent: "space-between", marginTop: 6 }}
                    onClick={() => { addExercise(pickerDay, e.id); setPickerDay(null); }}
                  >
                    <span>{e.name}</span>
                    <Chip>{muscleLabel(e.primaryMuscle, lang)}</Chip>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </Sheet>
      )}

      {/* Create custom exercise from within the picker */}
      {creatingExercise && (
        <ExerciseForm
          initial={null}
          onClose={() => setCreatingExercise(false)}
          onSave={(exercise) => {
            dispatch({ type: "upsertExercise", exercise });
            if (pickerDay !== null) {
              patchDay(pickerDay, (d) => ({
                ...d,
                exercises: [...d.exercises, { exerciseId: exercise.id, sets: exercise.defaultSets, reps: exercise.defaultReps, restSecs: exercise.restSecs }],
              }));
            }
            setCreatingExercise(false);
            setPickerDay(null);
          }}
        />
      )}

      {/* Weekday slot picker */}
      {slotPicker !== null && (
        <Sheet onClose={() => setSlotPicker(null)}>
          <div className="card-title" style={{ marginBottom: 12 }}>
            {t(`builder.weekday.${WEEKDAYS[slotPicker]}`)}
          </div>
          <div className="fade-list">
            <Button block onClick={() => { setSlot(slotPicker, { type: "rest" }); setSlotPicker(null); }}>
              {t("programs.rest")}
            </Button>
            <Button block onClick={() => { setSlot(slotPicker, { type: "cardio" }); setSlotPicker(null); }}>
              {t("programs.cardio")}
            </Button>
            {draft.days.map((d) => (
              <Button key={d.id} block variant="primary"
                onClick={() => { setSlot(slotPicker, { type: "workout", dayId: d.id }); setSlotPicker(null); }}>
                {localize(d.name, lang) || t("builder.day_name")}
              </Button>
            ))}
          </div>
        </Sheet>
      )}

      {/* Discard confirm */}
      {confirmDiscard && (
        <Modal onClose={() => setConfirmDiscard(false)}>
          <div className="card-title">{t("builder.discard_title")}</div>
          <div style={{ fontSize: 13, color: "var(--text-2)", margin: "6px 0 16px" }}>{t("builder.discard_body")}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button block onClick={() => setConfirmDiscard(false)}>{t("common.cancel")}</Button>
            <Button block variant="danger" onClick={onClose}>{t("builder.discard")}</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
