import { useState, useEffect, useCallback } from "react";
import { PLANS }    from "./data/plans.js";
import { EXERCISES } from "./data/exercises.js";
import { loadStore, saveStore, getDayExercises, getPR, exportWorkoutCSV, shareOrDownloadCSV } from "./data/store.js";
import { ThemeContext, buildTheme, useTheme, FONT, ACCENT_OPTIONS } from "./theme.js";
import Home          from "./components/Home.jsx";
import ActiveWorkout from "./components/ActiveWorkout.jsx";
import Progress      from "./components/Progress.jsx";
import Programs      from "./components/Programs.jsx";
import Profile       from "./components/Profile.jsx";
import RestTimer     from "./components/RestTimer.jsx";
import { HISTORICAL_LOGS } from "./data/historicalLogs.js";

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

// ── Hamburger menu ────────────────────────────────────────────────────────────

function HamburgerMenu({ view, onNavigate, store, onUpdateStore, plans, exercises, onClose }) {
  const C      = useTheme();
  const unit   = store.unit   || "lbs";
  const theme  = store.theme  || "light";
  const accent = store.accent || "green";
  const hasLogs = (store.logs || []).length > 0;

  async function handleExport() {
    const csv = exportWorkoutCSV(store.logs, exercises, plans, unit);
    if (!csv) return;
    await shareOrDownloadCSV(csv, `workout-log-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  const NAV = [
    {
      id: "home", label: "Home",
      icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    },
    {
      id: "progress", label: "Progress",
      icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    },
    {
      id: "programs", label: "Programs",
      icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    },
    {
      id: "timer", label: "Rest Timer",
      icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    },
    {
      id: "profile", label: "Profile",
      icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    },
  ];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
        zIndex: 300, display: "flex", alignItems: "flex-end",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.surface, borderRadius: "20px 20px 0 0",
          padding: "20px 16px calc(env(safe-area-inset-bottom) + 24px)",
          width: "100%", fontFamily: FONT,
          maxHeight: "88vh", overflowY: "auto",
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border, margin: "0 auto 20px" }} />
        <div style={{ fontSize: 17, fontWeight: 700, color: C.text1, marginBottom: 16 }}>Menu</div>

        {/* Navigation */}
        <div style={{ fontSize: 12, color: C.text2, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Navigate</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
          {NAV.map(item => {
            const isActive = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); onClose(); }}
                style={{
                  display: "flex", alignItems: "center", gap: 9,
                  padding: "13px 14px", borderRadius: 12, cursor: "pointer",
                  background: isActive ? C.greenLight : C.surface2,
                  color: isActive ? C.green : C.text1,
                  border: isActive ? `1.5px solid ${C.green}` : `1px solid ${C.border}`,
                  fontSize: 14, fontWeight: 600, fontFamily: FONT, textAlign: "left",
                  transition: "all 0.15s",
                }}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </div>

        <div style={{ height: 1, background: C.border, marginBottom: 20 }} />

        {/* Weight Unit */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: C.text2, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Weight Unit</div>
          <div style={{ display: "flex", gap: 10 }}>
            {["lbs", "kg"].map(u => (
              <button key={u} onClick={() => onUpdateStore({ unit: u })} style={{
                flex: 1, padding: "13px 0", borderRadius: 10, cursor: "pointer",
                fontSize: 15, fontWeight: 600, fontFamily: FONT,
                background: unit === u ? C.greenLight : C.surface2,
                color:      unit === u ? C.green : C.text2,
                border: unit === u ? `1.5px solid ${C.green}` : `1px solid ${C.border}`,
                transition: "all 0.15s",
              }}>{u}</button>
            ))}
          </div>
        </div>

        {/* Appearance */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: C.text2, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Appearance</div>
          <div style={{ display: "flex", gap: 10 }}>
            {[{ value: "light", label: "Light", icon: "☀️" }, { value: "dark", label: "Dark", icon: "🌙" }].map(opt => (
              <button key={opt.value} onClick={() => onUpdateStore({ theme: opt.value })} style={{
                flex: 1, padding: "12px 0", borderRadius: 10, cursor: "pointer",
                fontSize: 14, fontWeight: 600, fontFamily: FONT,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                background: theme === opt.value ? C.greenLight : C.surface2,
                color:      theme === opt.value ? C.green : C.text2,
                border: theme === opt.value ? `1.5px solid ${C.green}` : `1px solid ${C.border}`,
                transition: "all 0.15s",
              }}>
                <span style={{ fontSize: 16 }}>{opt.icon}</span>{opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Accent Color */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: C.text2, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Accent Color</div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {ACCENT_OPTIONS.map(opt => {
              const isActive = accent === opt.key;
              return (
                <button key={opt.key} onClick={() => onUpdateStore({ accent: opt.key })} style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: opt.color,
                  border: isActive ? `3px solid ${C.text1}` : "3px solid transparent",
                  boxShadow: isActive ? `0 0 0 2px ${opt.color}` : "none",
                  cursor: "pointer", padding: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s", flexShrink: 0,
                }}>
                  {isActive && (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M3.5 9L7.5 13L14.5 5.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              );
            })}
            <div style={{ marginLeft: 4, fontSize: 13, fontWeight: 600, color: C.text1 }}>
              {ACCENT_OPTIONS.find(a => a.key === accent)?.label || "Green"}
            </div>
          </div>
        </div>

        {/* Data */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: C.text2, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Data</div>
          <button onClick={hasLogs ? handleExport : undefined} disabled={!hasLogs} style={{
            width: "100%", padding: "13px 16px", borderRadius: 10,
            cursor: hasLogs ? "pointer" : "default", fontSize: 14, fontWeight: 600, fontFamily: FONT,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: C.surface2, color: hasLogs ? C.text1 : C.text3,
            border: `1px solid ${C.border}`, opacity: hasLogs ? 1 : 0.5,
          }}>
            <span>Export Workout Log (CSV)</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
          {!hasLogs && <div style={{ fontSize: 12, color: C.text3, marginTop: 6, paddingLeft: 2 }}>Complete a workout to enable export</div>}
        </div>

        <button onClick={onClose} style={{
          width: "100%", padding: "14px 0", borderRadius: 12,
          border: `1px solid ${C.border}`, background: C.surface2, color: C.text1,
          fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: FONT,
        }}>
          Close
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
  const [showMenu,  setMenu]    = useState(false);

  function navigate(id) {
    if (id === "timer") { setTimer(true); return; }
    setView(id);
  }

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
      warmup:    day.warmup || [],
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

  const updateFeel = useCallback((exIdx, feel) => {
    setSession(prev => {
      if (!prev) return prev;
      const exercises = prev.exercises.map((ex, ei) =>
        ei === exIdx ? { ...ex, feel } : ex
      );
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
        feel: e.feel || null,
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

  // ── Import historical logs (one-time) ────────────────────────────────────
  function importHistory() {
    setStore(prev => {
      const existing = new Set((prev.logs || []).map(l => l.id));
      const toAdd = HISTORICAL_LOGS.filter(l => !existing.has(l.id));
      const merged = [...toAdd, ...(prev.logs || [])];
      merged.sort((a, b) => new Date(a.startedAt) - new Date(b.startedAt));
      return { ...prev, logs: merged, historicalImported: true };
    });
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
            onUpdateFeel={updateFeel}
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
            onOpenMenu={() => setMenu(true)}
          />
        )}

        {view === "progress" && (
          <Progress
            store={store}
            exercises={EXERCISES}
            plans={PLANS}
            onOpenMenu={() => setMenu(true)}
          />
        )}

        {view === "programs" && (
          <Programs
            store={store}
            plans={PLANS}
            exercises={EXERCISES}
            onSelectPlan={selectPlan}
            onUpdateStore={updateStore}
            onOpenMenu={() => setMenu(true)}
          />
        )}

        {view === "profile" && (
          <Profile
            store={store}
            onOpenMenu={() => setMenu(true)}
            onImportHistory={importHistory}
          />
        )}

        {showMenu && (
          <HamburgerMenu
            view={view}
            onNavigate={navigate}
            store={store}
            onUpdateStore={updateStore}
            plans={PLANS}
            exercises={EXERCISES}
            onClose={() => setMenu(false)}
          />
        )}

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
