import { useState, useEffect, useCallback } from "react";
import { PLANS }    from "./data/plans.js";
import { EXERCISES } from "./data/exercises.js";
import { loadStore, saveStore, getDayExercises, getPR } from "./data/store.js";
import { ThemeContext, buildTheme, useTheme, FONT } from "./theme.js";
import Nav           from "./components/Nav.jsx";
import Home          from "./components/Home.jsx";
import ActiveWorkout from "./components/ActiveWorkout.jsx";
import Progress      from "./components/Progress.jsx";
import Programs      from "./components/Programs.jsx";
import RestTimer     from "./components/RestTimer.jsx";

// ── Workout summary modal ─────────────────────────────────────────────────────

function WorkoutSummary({ summary, onClose }) {
  const C = useTheme();
  const { durationSecs, log, newPRs } = summary;

  const totalSets     = log.exercises.reduce((acc, ex) => acc + (ex.sets?.length || 0), 0);
  const completedSets = log.exercises.reduce(
    (acc, ex) => acc + (ex.sets?.filter(s => s.completed !== false).length || 0), 0
  );
  const m = Math.floor(durationSecs / 60);
  const s = durationSecs % 60;
  const durationLabel = `${m}:${String(s).padStart(2, "0")}`;

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.65)",
      zIndex: 500,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px",
      fontFamily: FONT,
    }}>
      <div style={{
        background: C.surface, borderRadius: 24,
        padding: "28px 24px",
        width: "100%", maxWidth: 360,
        boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
      }}>
        {/* Check circle */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{
            width: 76, height: 76, borderRadius: "50%",
            background: C.greenLight,
            border: `3px solid ${C.green}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 14px",
          }}>
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
              <path d="M7 19L15.5 27.5L31 11" stroke={C.green} strokeWidth="3.5"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text1 }}>
            Workout Complete!
          </div>
          <div style={{ fontSize: 14, color: C.text2, marginTop: 4 }}>
            {log.dayName}
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          gap: 10, marginBottom: newPRs.length > 0 ? 16 : 20,
        }}>
          {[
            { value: durationLabel, label: "Duration" },
            { value: log.exercises.length, label: "Exercises" },
            { value: completedSets, label: "Sets Done" },
          ].map(({ value, label }) => (
            <div key={label} style={{
              background: C.bg, borderRadius: 12,
              padding: "12px 8px", textAlign: "center",
            }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.text1 }}>{value}</div>
              <div style={{ fontSize: 11, color: C.text2, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* New PRs */}
        {newPRs.length > 0 && (
          <div style={{
            background: C.orangeLight, borderRadius: 12,
            padding: "12px 14px", marginBottom: 20,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.orange, marginBottom: 6 }}>
              🏆 New Personal Records!
            </div>
            {newPRs.map((pr, i) => (
              <div key={i} style={{
                fontSize: 13, color: C.orange,
                marginBottom: i < newPRs.length - 1 ? 4 : 0,
              }}>
                {pr.name} — {pr.weight} × {pr.reps}
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            width: "100%", padding: "15px 0",
            borderRadius: 14, border: "none",
            background: C.green, color: "#fff",
            fontSize: 16, fontWeight: 700, cursor: "pointer",
            fontFamily: FONT,
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [view,      setView]    = useState("home");
  const [store,     setStore]   = useState(loadStore);
  const [session,   setSession] = useState(null);
  const [showTimer, setTimer]   = useState(false);
  const [summary,   setSummary] = useState(null);

  // Persist on every store change
  useEffect(() => { saveStore(store); }, [store]);

  // Apply dark/light mode and color-scheme to document root
  useEffect(() => {
    document.documentElement.dataset.theme = store.theme || "light";
  }, [store.theme]);

  const theme = buildTheme(store.theme || "light", store.accent || "green");

  const updateStore = useCallback((partial) => {
    setStore(prev => ({ ...prev, ...partial }));
  }, []);

  // ── Start a new workout ───────────────────────────────────────────────────
  function startWorkout() {
    const plan   = PLANS[store.activePlanId];
    if (!plan) return;
    const dayIdx = (store.nextDayIdx || 0) % plan.days.length;
    const day    = plan.days[dayIdx];
    const exList = getDayExercises(plan, dayIdx, store.swaps);

    setSession({
      planId:    store.activePlanId,
      dayIdx,
      dayName:   day.name,
      startTime: Date.now(),
      exercises: exList.map(e => ({
        exId:     e.exId,
        sets:     Array.from({ length: e.sets }, () => ({ weight: "", reps: "", completed: false })),
        restSecs: e.restSecs,
      })),
    });
    setView("workout");
  }

  // ── Set mutation helpers ──────────────────────────────────────────────────
  const updateSet = useCallback((exIdx, setIdx, field, value) => {
    setSession(prev => {
      if (!prev) return prev;
      const exercises = prev.exercises.map((ex, ei) => {
        if (ei !== exIdx) return ex;
        const sets = ex.sets.map((s, si) =>
          si === setIdx ? { ...s, [field]: value } : s
        );
        return { ...ex, sets };
      });
      return { ...prev, exercises };
    });
  }, []);

  const completeSet = useCallback((exIdx, setIdx) => {
    setSession(prev => {
      if (!prev) return prev;
      const exercises = prev.exercises.map((ex, ei) => {
        if (ei !== exIdx) return ex;
        const sets = ex.sets.map((s, si) =>
          si === setIdx ? { ...s, completed: !s.completed } : s
        );
        return { ...ex, sets };
      });
      return { ...prev, exercises };
    });
  }, []);

  // ── Finish workout → save log → show summary ──────────────────────────────
  function finishWorkout() {
    if (!session) return;
    const durationSecs = Math.round((Date.now() - session.startTime) / 1000);
    const plan         = PLANS[store.activePlanId];
    const nextDayIdx   = plan
      ? ((store.nextDayIdx || 0) + 1) % plan.days.length
      : 0;

    const log = {
      id:          Date.now().toString(),
      startedAt:   new Date(session.startTime).toISOString(),
      completedAt: new Date().toISOString(),
      planId:      session.planId,
      dayIdx:      session.dayIdx,
      dayName:     session.dayName,
      durationSecs,
      exercises:   session.exercises.map(e => ({
        exId: e.exId,
        sets: e.sets,
      })),
    };

    const prevLogs = store.logs || [];
    const newLogs  = [...prevLogs, log];

    // Detect new PRs
    const newPRs = [];
    for (const ex of session.exercises) {
      const oldBest = getPR(prevLogs, ex.exId);
      const newBest = getPR(newLogs, ex.exId);
      if (newBest && (!oldBest || newBest.weight > oldBest.weight)) {
        const exercise = EXERCISES[ex.exId];
        if (exercise) newPRs.push({ name: exercise.name, weight: newBest.weight, reps: newBest.reps });
      }
    }

    setStore(prev => ({ ...prev, nextDayIdx, logs: newLogs }));
    setSession(null);
    setView("home");
    setSummary({ durationSecs, log, newPRs });
  }

  function cancelWorkout() {
    setSession(null);
    setView("home");
  }

  // ── Swap exercise ─────────────────────────────────────────────────────────
  function swapExercise(exIdx, newExId) {
    if (!session) return;
    const originalExId = session.exercises[exIdx]?.exId;
    const newEx        = EXERCISES[newExId];
    if (!newEx) return;

    setSession(prev => {
      if (!prev) return prev;
      const exercises = prev.exercises.map((ex, ei) => {
        if (ei !== exIdx) return ex;
        return {
          ...ex,
          exId:     newExId,
          sets:     Array.from({ length: ex.sets.length }, () => ({
            weight: "", reps: "", completed: false,
          })),
          restSecs: newEx.restSecs,
        };
      });
      return { ...prev, exercises };
    });

    if (originalExId) {
      const swapKey = `${session.planId}:${session.dayIdx}:${originalExId}`;
      setStore(prev => ({
        ...prev,
        swaps: { ...(prev.swaps || {}), [swapKey]: newExId },
      }));
    }
  }

  // ── Plan switching ────────────────────────────────────────────────────────
  function selectPlan(planId) {
    updateStore({ activePlanId: planId, nextDayIdx: 0 });
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const hasSession = !!session;

  if (view === "workout" && session) {
    return (
      <ThemeContext.Provider value={theme}>
        <div style={{ fontFamily: FONT, background: theme.bg, minHeight: "100vh" }}>
          <ActiveWorkout
            session={session}
            exercises={EXERCISES}
            logs={store.logs || []}
            unit={store.unit || "lbs"}
            onUpdateSet={updateSet}
            onCompleteSet={completeSet}
            onFinish={finishWorkout}
            onCancel={cancelWorkout}
            onSwapExercise={swapExercise}
          />
          {showTimer && <RestTimer onClose={() => setTimer(false)}/>}
        </div>
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={theme}>
      <div style={{ background: theme.bg, minHeight: "100vh", fontFamily: FONT }}>
        {view === "home" && (
          <Home
            store={store}
            plans={PLANS}
            exercises={EXERCISES}
            onStartWorkout={startWorkout}
            onContinueSession={hasSession ? () => setView("workout") : null}
            onUpdateStore={updateStore}
          />
        )}

        {view === "progress" && (
          <Progress
            store={store}
            exercises={EXERCISES}
            plans={PLANS}
          />
        )}

        {view === "programs" && (
          <Programs
            store={store}
            plans={PLANS}
            exercises={EXERCISES}
            onSelectPlan={selectPlan}
            onUpdateStore={updateStore}
          />
        )}

        <Nav
          view={view}
          onChange={v => {
            if (v === "workout" && hasSession) { setView("workout"); return; }
            if (v === "workout" && !hasSession) { startWorkout(); return; }
            setView(v);
          }}
          hasActiveSession={hasSession}
        />

        {/* Session summary modal */}
        {summary && (
          <WorkoutSummary
            summary={summary}
            onClose={() => setSummary(null)}
          />
        )}
      </div>
    </ThemeContext.Provider>
  );
}
