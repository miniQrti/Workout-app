import { useCallback, useEffect, useMemo, useState } from "react";
import { useApp } from "./store/appState";
import { PLANS } from "./data/plans";
import { EXERCISES, exerciseName } from "./data/exercises";
import { detectNewPRs } from "./store/selectors";
import { sessionTonnageKg } from "./store/analytics";
import type { ActiveSession, WorkoutLog } from "./types";
import { uuid } from "./lib/id";
import { displayWeight, formatCompact, fromKg } from "./lib/units";
import { formatDuration } from "./lib/dates";
import { LangContext, localize, makeT, useLang } from "./i18n";
import { Button, Modal } from "./ui/kit";
import { IconChart, IconCheck, IconGear, IconGrid, IconHome } from "./ui/icons";
import Home from "./pages/Home";
import Workout from "./pages/Workout";
import Progress from "./pages/Progress";
import Programs from "./pages/Programs";
import Settings from "./pages/Settings";

type View = "home" | "progress" | "programs" | "settings";

interface Summary {
  log: WorkoutLog;
  newPRs: { exerciseId: string; weightKg: number; reps: number }[];
}

// ── Summary modal ─────────────────────────────────────────────────────────────

function SummaryModal({ summary, onClose }: { summary: Summary; onClose: () => void }) {
  const { state } = useApp();
  const { t } = useLang();
  const unit = state.settings.unit;
  const { log, newPRs } = summary;

  const setsDone = log.exercises.reduce((a, e) => a + e.sets.filter((s) => s.completed).length, 0);
  const tonnage = sessionTonnageKg(log);

  const stats = [
    { value: formatDuration(log.durationSecs), label: t("summary.duration") },
    { value: String(log.exercises.length), label: t("summary.exercises") },
    { value: String(setsDone), label: t("summary.sets") },
    { value: tonnage > 0 ? `${formatCompact(fromKg(tonnage, unit))} ${unit}` : "—", label: t("summary.volume") },
  ];

  return (
    <Modal>
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "var(--accent-soft)", border: "3px solid var(--accent)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          color: "var(--accent)", marginBottom: 12,
        }}>
          <IconCheck size={34} />
        </div>
        <div style={{ fontSize: 21, fontWeight: 800 }}>{t("summary.title")}</div>
        <div style={{ fontSize: 14, color: "var(--text-2)", marginTop: 4 }}>{log.dayName}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: "var(--bg)", borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
            <div style={{ fontSize: 19, fontWeight: 700 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {newPRs.length > 0 && (
        <div style={{ background: "var(--gold-soft)", borderRadius: 12, padding: "12px 14px", marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)", marginBottom: 6 }}>
            {t("summary.new_prs")}
          </div>
          {newPRs.map((pr) => (
            <div key={pr.exerciseId} style={{ fontSize: 13, color: "var(--gold)", marginBottom: 2 }}>
              {exerciseName(pr.exerciseId)} — {displayWeight(pr.weightKg, state.settings.unit)} {state.settings.unit} × {pr.reps}
            </div>
          ))}
        </div>
      )}

      <Button block variant="primary" onClick={onClose}>{t("common.done")}</Button>
    </Modal>
  );
}

// ── Bottom navigation ─────────────────────────────────────────────────────────

function BottomNav({ view, onNavigate }: { view: View; onNavigate: (v: View) => void }) {
  const { t } = useLang();
  const items: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: "home", label: t("nav.home"), icon: <IconHome size={21} /> },
    { id: "progress", label: t("nav.progress"), icon: <IconChart size={21} /> },
    { id: "programs", label: t("nav.programs"), icon: <IconGrid size={21} /> },
    { id: "settings", label: t("nav.settings"), icon: <IconGear size={21} /> },
  ];
  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => onNavigate(item.id)}>
          {item.icon}
          {item.label}
        </button>
      ))}
    </nav>
  );
}

// ── Theme application ─────────────────────────────────────────────────────────

function useApplyTheme() {
  const { state } = useApp();
  const { theme, accent } = state.settings;

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.accent = accent;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      root.dataset.theme = theme === "system" ? (media.matches ? "dark" : "light") : theme;
    };
    apply();
    if (theme === "system") {
      media.addEventListener("change", apply);
      return () => media.removeEventListener("change", apply);
    }
    return undefined;
  }, [theme, accent]);
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const { state, dispatch, index } = useApp();
  const [view, setView] = useState<View>("home");
  const [inWorkout, setInWorkout] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);

  useApplyTheme();

  const lang = state.settings.lang;
  const langValue = useMemo(() => ({ lang, t: makeT(lang) }), [lang]);

  const startWorkout = useCallback((dayIdx: number) => {
    const plan = PLANS[state.settings.activePlanId];
    const day = plan?.days[dayIdx % (plan?.days.length || 1)];
    if (!plan || !day) return;

    const session: ActiveSession = {
      id: uuid(),
      planId: plan.id,
      dayId: day.id,
      dayName: localize(day.name, lang),
      startedAt: new Date().toISOString(),
      warmupDone: [],
      exercises: day.exercises.map((pe) => {
        const ex = EXERCISES[pe.exerciseId];
        return {
          exerciseId: pe.exerciseId,
          targetSets: pe.sets,
          targetReps: pe.reps,
          restSecs: pe.restSecs || ex?.restSecs || 90,
          feel: null,
          sets: Array.from({ length: pe.sets }, () => ({ weightKg: null, reps: null, completed: false })),
        };
      }),
    };
    dispatch({ type: "startSession", session });
    dispatch({ type: "settings", patch: { nextDayIdx: dayIdx } });
    setInWorkout(true);
  }, [state.settings.activePlanId, lang, dispatch]);

  const finishWorkout = useCallback((log: WorkoutLog) => {
    const plan = PLANS[state.settings.activePlanId];
    const dayCount = plan?.days.length ?? 1;
    const currentIdx = plan?.days.findIndex((d) => d.id === log.dayId) ?? 0;
    const nextDayIdx = ((currentIdx >= 0 ? currentIdx : 0) + 1) % dayCount;

    const newPRs = detectNewPRs(index, log);
    dispatch({ type: "finishSession", log, nextDayIdx });
    setInWorkout(false);
    setView("home");
    setSummary({ log, newPRs });
  }, [state.settings.activePlanId, index, dispatch]);

  if (!state.loaded) {
    return (
      <LangContext.Provider value={langValue}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)" }}>
          <div style={{ width: 28, height: 28, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <style>{"@keyframes spin { to { transform: rotate(360deg) } }"}</style>
        </div>
      </LangContext.Provider>
    );
  }

  const showWorkout = inWorkout && state.session !== null;

  return (
    <LangContext.Provider value={langValue}>
      {showWorkout ? (
        <Workout
          onFinished={finishWorkout}
          onExit={() => { setInWorkout(false); setView("home"); }}
        />
      ) : (
        <>
          {view === "home" && (
            <Home onStart={startWorkout} onResume={() => setInWorkout(true)} />
          )}
          {view === "progress" && <Progress />}
          {view === "programs" && <Programs />}
          {view === "settings" && <Settings />}
          <BottomNav view={view} onNavigate={setView} />
        </>
      )}

      {summary && <SummaryModal summary={summary} onClose={() => setSummary(null)} />}
    </LangContext.Provider>
  );
}
