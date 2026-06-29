import React, { useState, useEffect, useRef, useCallback } from "react";
import { getLastSession } from "../data/store.js";
import { useTheme, FONT } from "../theme.js";

// ── Icons ──────────────────────────────────────────────────────────────────────

function IconBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15,18 9,12 15,6"/>
    </svg>
  );
}

function IconSwap() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 16V4m0 0L3 8m4-4l4 4"/>
      <path d="M17 8v12m0 0l4-4m-4 4l-4-4"/>
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20,6 9,17 4,12"/>
    </svg>
  );
}

function IconInfo() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="8" strokeWidth="3"/>
      <line x1="12" y1="12" x2="12" y2="16"/>
    </svg>
  );
}

// ── Elapsed timer ──────────────────────────────────────────────────────────────

function ElapsedTimer({ startTime }) {
  const C = useTheme();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  const label = h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;

  return (
    <span style={{ fontSize: 13, color: C.text2, fontVariantNumeric: "tabular-nums" }}>
      {label}
    </span>
  );
}

// ── Rest banner ────────────────────────────────────────────────────────────────

function RestBanner({ restSecs, onDismiss }) {
  const C = useTheme();
  const [left,    setLeft]    = useState(restSecs);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setLeft(l => {
        if (l <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          if (navigator.vibrate) navigator.vibrate([300, 100, 300]);
          setTimeout(onDismiss, 900);
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, onDismiss]);

  const pct  = restSecs > 0 ? (restSecs - left) / restSecs : 0;
  const m    = Math.floor(left / 60);
  const s    = left % 60;
  const done = left === 0;

  function toggleRunning() {
    if (done) return;
    setRunning(r => !r);
  }

  return (
    <div style={{
      position: "fixed", bottom: 72, left: 0, right: 0,
      zIndex: 50, padding: "0 12px", pointerEvents: "none",
    }}>
      <div style={{
        background: done ? C.greenLight : C.surface,
        border: `1px solid ${done ? C.green : C.border}`,
        borderRadius: 14, padding: "10px 14px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
        pointerEvents: "all", overflow: "hidden", position: "relative",
      }}>
        {/* Progress bar fills as time elapses */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: C.surface2,
        }}>
          <div style={{
            height: "100%", width: `${pct * 100}%`,
            background: done ? C.green : C.green,
            transition: running ? "width 0.95s linear" : "none",
            borderRadius: 2,
          }}/>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Play/Pause/Done button */}
            <button
              onClick={toggleRunning}
              disabled={done}
              style={{
                width: 38, height: 38, borderRadius: "50%",
                background: done ? C.green : running ? C.greenLight : C.green,
                border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, cursor: done ? "default" : "pointer",
              }}
            >
              {done ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="#fff" strokeWidth="2.8" strokeLinecap="round">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
              ) : running ? (
                /* Pause icon */
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke={C.green} strokeWidth="2.5" strokeLinecap="round">
                  <line x1="6" y1="4" x2="6" y2="20"/>
                  <line x1="18" y1="4" x2="18" y2="20"/>
                </svg>
              ) : (
                /* Play icon */
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5,3 19,12 5,21"/>
                </svg>
              )}
            </button>

            <div>
              <div style={{ fontSize: 11, color: C.text2, fontWeight: 500, marginBottom: 1 }}>
                {done ? "Rest complete — go!" : running ? "Resting" : "Rest Timer"}
              </div>
              <div style={{
                fontSize: 20, fontWeight: 700,
                color: done ? C.green : C.text1,
                fontVariantNumeric: "tabular-nums", lineHeight: 1,
              }}>
                {done ? "✓" : `${m}:${String(s).padStart(2, "0")}`}
              </div>
            </div>
          </div>

          <button
            onClick={onDismiss}
            style={{
              padding: "8px 14px", borderRadius: 8,
              border: `1px solid ${C.border}`,
              background: C.surface2, color: C.text2,
              fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: FONT,
            }}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Swap modal ─────────────────────────────────────────────────────────────────

function SwapModal({ exercise, exercises, onSwap, onClose }) {
  const C = useTheme();
  const primaryMuscle = exercise.primaryMuscle || null;

  const candidates = Object.values(exercises).filter(ex => {
    if (ex.id === exercise.id) return false;
    return ex.primaryMuscle === primaryMuscle;
  });

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
        zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center",
        fontFamily: FONT,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.surface, borderRadius: "20px 20px 0 0",
          padding: "20px 16px calc(env(safe-area-inset-bottom) + 20px)",
          width: "100%", maxHeight: "65vh",
          display: "flex", flexDirection: "column", gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: C.text1 }}>Swap exercise</div>
            <div style={{ fontSize: 12, color: C.text2, marginTop: 2 }}>
              Same muscle group as {exercise.name}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36, height: 36, borderRadius: "50%",
              border: `1px solid ${C.border}`, background: C.surface2,
              color: C.text2, fontSize: 20, display: "flex",
              alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          {candidates.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "24px 0",
              color: C.text3, fontSize: 13,
            }}>
              No alternative exercises found for this muscle group.
            </div>
          ) : (
            candidates.map(ex => (
              <button
                key={ex.id}
                onClick={() => { onSwap(ex.id); onClose(); }}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "13px 14px",
                  background: C.surface2,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12, cursor: "pointer", textAlign: "left",
                  width: "100%", fontFamily: FONT,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: C.text1 }}>{ex.name}</div>
                  {ex.equipment && (
                    <div style={{ fontSize: 12, color: C.text2, marginTop: 2, textTransform: "capitalize" }}>
                      {ex.equipment}
                    </div>
                  )}
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke={C.text3} strokeWidth="2" strokeLinecap="round">
                  <polyline points="9,18 15,12 9,6"/>
                </svg>
              </button>
            ))
          )}
        </div>

        <button
          onClick={onClose}
          style={{
            width: "100%", padding: "14px", fontSize: 15, fontWeight: 500,
            borderRadius: 12, border: `1px solid ${C.border}`,
            background: C.surface2, color: C.text1, cursor: "pointer", fontFamily: FONT,
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Weight stepper ─────────────────────────────────────────────────────────────

function WeightStepper({ value, disabled, onChange }) {
  const C = useTheme();

  function step(delta) {
    const cur = parseFloat(value) || 0;
    const next = Math.max(0, Math.round((cur + delta) * 10) / 10);
    onChange(String(next));
  }

  const btnStyle = {
    width: 30, height: 36, borderRadius: 7, padding: 0, flexShrink: 0,
    border: `1px solid ${C.border}`,
    background: disabled ? C.bg : C.surface2,
    color: disabled ? C.text3 : C.text1,
    fontSize: 16, fontWeight: 700, cursor: disabled ? "default" : "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: FONT,
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      <button style={btnStyle} disabled={disabled} onClick={() => step(-5)}>−</button>
      <input
        type="number"
        inputMode="decimal"
        placeholder="lb"
        value={value || ""}
        disabled={disabled}
        onChange={e => onChange(e.target.value)}
        style={{
          flex: 1, padding: "7px 4px", borderRadius: 7, textAlign: "center",
          border: `1px solid ${disabled ? C.border : C.inputBorder}`,
          background: disabled ? C.bg : C.surface,
          color: C.text1, minWidth: 0,
          fontFamily: FONT, fontSize: 14,
        }}
      />
      <button style={btnStyle} disabled={disabled} onClick={() => step(+5)}>+</button>
    </div>
  );
}

// ── Exercise card ──────────────────────────────────────────────────────────────

function ExerciseCard({
  exIdx, exEntry, exercise, exercises, lastSession,
  onUpdateSet, onCompleteSet, onSwap,
}) {
  const C = useTheme();
  const [expanded, setExpanded] = useState(true);
  const [showSwap, setShowSwap] = useState(false);

  if (!exercise) return null;

  const sets     = exEntry.sets || [];
  const allDone  = sets.length > 0 && sets.every(s => s.completed);
  const someDone = sets.some(s => s.completed);
  const lastSets = lastSession ? lastSession.sets || [] : [];
  const isTime   = !!exercise.isTime;

  return (
    <>
      <div style={{
        background: allDone ? C.greenLight : C.surface,
        border: `1px solid ${allDone ? C.green : C.border}`,
        borderRadius: 14, marginBottom: 10, overflow: "hidden",
        transition: "border-color 0.2s, background 0.2s",
      }}>
        {/* Header */}
        <div
          onClick={() => setExpanded(e => !e)}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "13px 14px", cursor: "pointer", userSelect: "none",
          }}
        >
          <div style={{
            width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
            background: allDone ? C.green : someDone ? C.green + "66" : C.border,
            border: `2px solid ${allDone ? C.green : someDone ? C.green : C.text3}`,
            transition: "all 0.2s",
          }}/>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{
                fontSize: 15, fontWeight: 600,
                color: allDone ? C.greenDark : C.text1,
              }}>
                {exercise.name}
              </span>
              {exercise.primaryMuscle && (
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 6,
                  background: C.greenLight, color: C.green,
                  textTransform: "capitalize", letterSpacing: "0.03em",
                }}>
                  {exercise.primaryMuscle}
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: C.text2, marginTop: 2 }}>
              {sets.filter(s => s.completed).length}/{sets.length} sets done
              {exercise.restSecs && (
                <span style={{ color: C.text3 }}> · {exercise.restSecs}s rest</span>
              )}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              onClick={e => { e.stopPropagation(); setShowSwap(true); }}
              style={{
                width: 34, height: 34, borderRadius: 8,
                border: `1px solid ${C.border}`,
                background: C.surface2,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: C.text2, flexShrink: 0,
              }}
              title="Swap exercise"
            >
              <IconSwap/>
            </button>
            <span style={{
              fontSize: 11, color: C.text3,
              display: "inline-block",
              transform: expanded ? "rotate(180deg)" : "none",
              transition: "transform 0.2s",
            }}>▼</span>
          </div>
        </div>

        {/* Body */}
        {expanded && (
          <div style={{ padding: "0 14px 14px", borderTop: `1px solid ${C.border}` }}>
            {/* Tip */}
            {exercise.tip && (
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 8,
                marginTop: 10, marginBottom: 12,
                background: C.isDark ? "#0D1F3C" : "#EFF6FF",
                border: `1px solid ${C.isDark ? "#1E3A5F" : "#BFDBFE"}`,
                borderRadius: 8, padding: "8px 10px",
              }}>
                <div style={{ color: "#3B82F6", flexShrink: 0, marginTop: 1 }}>
                  <IconInfo/>
                </div>
                <div style={{ fontSize: 12, color: C.isDark ? "#93C5FD" : "#1D4ED8", lineHeight: 1.5 }}>
                  {exercise.tip}
                </div>
              </div>
            )}

            {/* Machine settings */}
            {exercise.settings && (
              <div style={{
                fontSize: 11, color: C.text2, background: C.surface2,
                borderRadius: 6, padding: "5px 9px", marginBottom: 10,
                border: `1px solid ${C.border}`, display: "inline-block",
              }}>
                ⚙ {exercise.settings}
              </div>
            )}

            {/* Column headers */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "22px 72px 1fr 56px 36px",
              gap: "4px 6px",
              marginBottom: 6,
              alignItems: "center",
            }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.text3, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Set
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.green, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Prev
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.text3, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {isTime ? "Seconds" : "Weight"}
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.text3, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {isTime ? "" : "Reps"}
              </div>
              <div/>
            </div>

            {/* Set rows */}
            {sets.map((set, setIdx) => {
              const prevSet  = lastSets[setIdx] || null;
              const prevLabel = prevSet
                ? isTime
                  ? `${prevSet.weight ?? prevSet.w ?? ""}s`
                  : `${prevSet.weight ?? prevSet.w ?? ""}×${prevSet.reps ?? prevSet.r ?? ""}`
                : null;
              const completed = set.completed;

              return (
                <div
                  key={setIdx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "22px 72px 1fr 56px 36px",
                    gap: "4px 6px",
                    alignItems: "center",
                    marginBottom: 8,
                    opacity: completed ? 0.6 : 1,
                    transition: "opacity 0.2s",
                  }}
                >
                  {/* Set number */}
                  <span style={{ fontSize: 12, color: C.text3, fontWeight: 500 }}>
                    {setIdx + 1}
                  </span>

                  {/* Previous (tap to fill) */}
                  <div
                    onClick={() => {
                      if (!prevLabel || !prevSet) return;
                      const w = String(prevSet.weight ?? prevSet.w ?? "");
                      const r = String(prevSet.reps ?? prevSet.r ?? "");
                      if (w) onUpdateSet(exIdx, setIdx, "weight", w);
                      if (r && !isTime) onUpdateSet(exIdx, setIdx, "reps", r);
                    }}
                    style={{
                      fontSize: 12, fontWeight: 500,
                      color: prevLabel ? C.green : C.text3,
                      padding: "6px 6px", borderRadius: 6,
                      background: prevLabel ? C.greenLight : "transparent",
                      border: prevLabel ? `1px solid ${C.green}44` : "1px solid transparent",
                      minHeight: 34, display: "flex", alignItems: "center",
                      cursor: prevLabel ? "pointer" : "default",
                      userSelect: "none", lineHeight: 1.2,
                    }}
                  >
                    {prevLabel || "—"}
                  </div>

                  {/* Weight (stepper or plain for timed) */}
                  {isTime ? (
                    <input
                      type="number"
                      inputMode="decimal"
                      placeholder="sec"
                      value={set.weight || ""}
                      disabled={completed}
                      onChange={e => onUpdateSet(exIdx, setIdx, "weight", e.target.value)}
                      style={{
                        padding: "7px 6px", borderRadius: 7, textAlign: "center",
                        border: `1px solid ${completed ? C.border : C.inputBorder}`,
                        background: completed ? C.bg : C.surface,
                        color: C.text1, width: "100%",
                        fontFamily: FONT, fontSize: 14,
                      }}
                    />
                  ) : (
                    <WeightStepper
                      value={set.weight}
                      disabled={completed}
                      onChange={v => onUpdateSet(exIdx, setIdx, "weight", v)}
                    />
                  )}

                  {/* Reps */}
                  {isTime ? (
                    <div/>
                  ) : (
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="reps"
                      value={set.reps || ""}
                      disabled={completed}
                      onChange={e => onUpdateSet(exIdx, setIdx, "reps", e.target.value)}
                      style={{
                        padding: "7px 4px", borderRadius: 7, textAlign: "center",
                        border: `1px solid ${completed ? C.border : C.inputBorder}`,
                        background: completed ? C.bg : C.surface,
                        color: C.text1, width: "100%",
                        fontFamily: FONT, fontSize: 14,
                      }}
                    />
                  )}

                  {/* Complete button */}
                  <button
                    onClick={() => onCompleteSet(exIdx, setIdx)}
                    style={{
                      width: 36, height: 36, borderRadius: "50%",
                      border: `2px solid ${completed ? C.green : C.border}`,
                      background: completed ? C.green : C.surface,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", color: completed ? "#fff" : C.text3,
                      transition: "all 0.18s", flexShrink: 0,
                    }}
                  >
                    <IconCheck/>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showSwap && (
        <SwapModal
          exercise={exercise}
          exercises={exercises}
          onSwap={newExId => onSwap(exIdx, newExId)}
          onClose={() => setShowSwap(false)}
        />
      )}
    </>
  );
}

// ── ActiveWorkout ──────────────────────────────────────────────────────────────

export default function ActiveWorkout({
  session,
  exercises,
  logs,
  onUpdateSet,
  onCompleteSet,
  onFinish,
  onCancel,
  onSwapExercise,
}) {
  const C = useTheme();
  const [restBanner, setRestBanner] = useState(null);

  const handleCompleteSet = useCallback((exIdx, setIdx) => {
    onCompleteSet(exIdx, setIdx);
    const exEntry  = session.exercises[exIdx];
    const ex       = exercises[exEntry?.exId];
    const restSecs = ex?.restSecs || exEntry?.restSecs || 60;
    setRestBanner({ restSecs, key: Date.now() });
  }, [onCompleteSet, session, exercises]);

  const dismissBanner = useCallback(() => setRestBanner(null), []);

  const totalSets = (session.exercises || []).reduce(
    (acc, ex) => acc + (ex.sets?.length || 0), 0
  );
  const completedSets = (session.exercises || []).reduce(
    (acc, ex) => acc + (ex.sets?.filter(s => s.completed).length || 0), 0
  );
  const progress    = totalSets > 0 ? completedSets / totalSets : 0;
  const allComplete = totalSets > 0 && completedSets === totalSets;

  return (
    <div style={{
      background: C.bg, minHeight: "100vh", fontFamily: FONT, position: "relative",
    }}>
      {/* Sticky header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 30,
        background: C.surface,
        borderBottom: `1px solid ${C.border}`,
        boxShadow: C.isDark ? "none" : "0 1px 8px rgba(0,0,0,0.06)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "12px 16px 10px",
          paddingTop: "calc(12px + env(safe-area-inset-top))",
        }}>
          <button
            onClick={onCancel}
            style={{
              width: 38, height: 38, borderRadius: 10,
              border: `1px solid ${C.border}`,
              background: C.surface2,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: C.text1, flexShrink: 0,
            }}
            aria-label="Cancel workout"
          >
            <IconBack/>
          </button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.text1, lineHeight: 1.2 }}>
              {session.dayName || "Active Workout"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 1 }}>
              <ElapsedTimer startTime={session.startTime}/>
              <span style={{ fontSize: 12, color: C.text3 }}>·</span>
              <span style={{ fontSize: 12, color: C.text2 }}>
                {completedSets}/{totalSets} sets
              </span>
            </div>
          </div>

          <button
            onClick={onFinish}
            style={{
              padding: "9px 14px", borderRadius: 10,
              border: `1px solid ${allComplete ? C.green : C.border}`,
              background: allComplete ? C.green : C.surface2,
              color: allComplete ? "#fff" : C.text2,
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              fontFamily: FONT, transition: "all 0.2s", flexShrink: 0,
            }}
          >
            Finish
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: C.surface2, margin: "0 16px 12px" }}>
          <div style={{
            height: "100%", width: `${progress * 100}%`,
            background: C.green, borderRadius: 2, transition: "width 0.4s ease",
          }}/>
        </div>
      </div>

      {/* Exercise list */}
      <div style={{ padding: "14px 14px 130px" }}>
        {(session.exercises || []).map((exEntry, exIdx) => {
          const exercise = exercises[exEntry.exId];
          return (
            <ExerciseCard
              key={exEntry.exId + "-" + exIdx}
              exIdx={exIdx}
              exEntry={exEntry}
              exercise={exercise}
              exercises={exercises}
              lastSession={getLastSession(logs || [], exEntry.exId)}
              onUpdateSet={onUpdateSet}
              onCompleteSet={handleCompleteSet}
              onSwap={onSwapExercise}
            />
          );
        })}

        {session.exercises?.length === 0 && (
          <div style={{
            textAlign: "center", padding: "48px 24px",
            color: C.text3, fontSize: 14,
          }}>
            No exercises in this session.
          </div>
        )}
      </div>

      {/* Rest banner */}
      {restBanner && (
        <RestBanner
          key={restBanner.key}
          restSecs={restBanner.restSecs}
          onDismiss={dismissBanner}
        />
      )}

      {/* Sticky finish footer */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 20,
        background: C.surface,
        borderTop: `1px solid ${C.border}`,
        padding: "12px 16px calc(12px + env(safe-area-inset-bottom))",
      }}>
        <button
          onClick={onFinish}
          style={{
            width: "100%", padding: "15px 0",
            borderRadius: 14, border: "none",
            background: allComplete ? C.green : C.green + "CC",
            color: "#fff", fontSize: 16, fontWeight: 700,
            cursor: "pointer", fontFamily: FONT,
            boxShadow: allComplete ? `0 4px 16px ${C.green}55` : "none",
            transition: "all 0.2s",
          }}
        >
          {allComplete ? "Finish Workout ✓" : `Finish Workout (${completedSets}/${totalSets} sets)`}
        </button>
      </div>
    </div>
  );
}
