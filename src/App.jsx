import { useState, useEffect, useCallback } from "react";
import { PLANS }    from "./data/plans.js";
import { EXERCISES } from "./data/exercises.js";
import { loadStore, saveStore, getDayExercises } from "./data/store.js";
import Nav           from "./components/Nav.jsx";
import Home          from "./components/Home.jsx";
import ActiveWorkout from "./components/ActiveWorkout.jsx";
import Progress      from "./components/Progress.jsx";
import Programs      from "./components/Programs.jsx";
import RestTimer     from "./components/RestTimer.jsx";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";

export default function App() {
  const [view,      setView]    = useState("home");
  const [store,     setStore]   = useState(loadStore);
  const [session,   setSession] = useState(null);   // in-progress workout
  const [showTimer, setTimer]   = useState(false);

  // Persist on every store change
  useEffect(() => { saveStore(store); }, [store]);

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
        exId:  e.exId,
        sets:  Array.from({ length: e.sets }, () => ({ weight: "", reps: "", completed: false })),
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
          si === setIdx ? { ...s, completed: true } : s
        );
        return { ...ex, sets };
      });
      return { ...prev, exercises };
    });
  }, []);

  // ── Finish workout → save log ─────────────────────────────────────────────
  function finishWorkout() {
    if (!session) return;
    const durationSecs = Math.round((Date.now() - session.startTime) / 1000);
    const plan = PLANS[store.activePlanId];
    const nextDayIdx = plan
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

    setStore(prev => ({
      ...prev,
      nextDayIdx,
      logs: [...(prev.logs || []), log],
    }));
    setSession(null);
    setView("home");
  }

  function cancelWorkout() {
    setSession(null);
    setView("home");
  }

  // ── Swap exercise in current session ─────────────────────────────────────
  function swapExercise(exIdx, newExId) {
    if (!session) return;
    const originalExId = session.exercises[exIdx]?.exId;
    const newEx        = EXERCISES[newExId];
    if (!newEx) return;

    // Update session
    setSession(prev => {
      if (!prev) return prev;
      const exercises = prev.exercises.map((ex, ei) => {
        if (ei !== exIdx) return ex;
        return {
          ...ex,
          exId: newExId,
          sets: Array.from({ length: ex.sets.length }, () => ({
            weight: "", reps: "", completed: false,
          })),
          restSecs: newEx.restSecs,
        };
      });
      return { ...prev, exercises };
    });

    // Persist swap so it's remembered for future sessions
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
      <div style={{ fontFamily: FONT, background: "#F5F5F0", minHeight: "100vh" }}>
        <ActiveWorkout
          session={session}
          exercises={EXERCISES}
          logs={store.logs || []}
          onUpdateSet={updateSet}
          onCompleteSet={completeSet}
          onFinish={finishWorkout}
          onCancel={cancelWorkout}
          onSwapExercise={swapExercise}
        />
        {showTimer && <RestTimer onClose={() => setTimer(false)}/>}
      </div>
    );
  }

  return (
    <div style={{
      background: "#F5F5F0",
      minHeight: "100vh",
      fontFamily: FONT,
    }}>
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
          // If switching to workout tab with active session, resume it
          if (v === "workout" && hasSession) { setView("workout"); return; }
          // If switching to workout tab without session, start one
          if (v === "workout" && !hasSession) { startWorkout(); return; }
          setView(v);
        }}
        hasActiveSession={hasSession}
      />
    </div>
  );
}
