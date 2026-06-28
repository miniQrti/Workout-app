import React, { useState, useEffect, useRef, useCallback } from "react";
import { getLastSession } from "../data/store.js";

const COLORS = {
  bg: "#F5F5F0",
  surface: "#FFFFFF",
  green: "#16A97C",
  greenDark: "#0D7A59",
  greenLight: "#E8F8F2",
  orange: "#F97316",
  orangeLight: "#FFF4ED",
  text1: "#111111",
  text2: "#6B7280",
  text3: "#9CA3AF",
  border: "rgba(0,0,0,0.07)",
  red: "#EF4444",
};

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";

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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
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
    <span style={{ fontSize: 13, color: COLORS.text2, fontVariantNumeric: "tabular-nums" }}>
      {label}
    </span>
  );
}

// ── Inline rest timer banner ───────────────────────────────────────────────────

function RestBanner({ restSecs, onDismiss }) {
  const [left, setLeft] = useState(restSecs);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setLeft(l => {
        if (l <= 1) {
          clearInterval(intervalRef.current);
          if (navigator.vibrate) navigator.vibrate([300, 100, 300]);
          setTimeout(onDismiss, 800);
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [onDismiss]);

  const pct = restSecs > 0 ? left / restSecs : 0;
  const m = Math.floor(left / 60);
  const s = left % 60;
  const label = `${m}:${String(s).padStart(2, "0")}`;
  const done = left === 0;

  return (
    <div style={{
      position: "fixed",
      bottom: 72,
      left: 0,
      right: 0,
      zIndex: 50,
      padding: "0 12px",
      pointerEvents: "none",
    }}>
      <div style={{
        background: done ? COLORS.greenLight : COLORS.surface,
        border: `1px solid ${done ? COLORS.green : COLORS.border}`,
        borderRadius: 14,
        padding: "10px 14px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.13)",
        pointerEvents: "all",
        overflow: "hidden",
        position: "relative",
      }}>
        {/* progress bar track */}
        <div style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          height: 3,
          background: COLORS.bg,
        }}>
          <div style={{
            height: "100%",
            width: `${pct * 100}%`,
            background: done ? COLORS.green : COLORS.green,
            transition: "width 0.95s linear",
            borderRadius: 2,
          }}/>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: done ? COLORS.green : COLORS.greenLight,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              {done
                ? <IconCheck style={{ color: "#fff" }}/>
                : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke={COLORS.green} strokeWidth="2.2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="9"/>
                    <polyline points="12,7 12,12 15,14"/>
                  </svg>
                )
              }
            </div>
            <div>
              <div style={{ fontSize: 11, color: COLORS.text2, fontWeight: 500, marginBottom: 1 }}>
                {done ? "Rest complete — go!" : "Rest"}
              </div>
              <div style={{
                fontSize: 20, fontWeight: 700, color: done ? COLORS.green : COLORS.text1,
                fontVariantNumeric: "tabular-nums", lineHeight: 1,
              }}>
                {done ? "✓" : label}
              </div>
            </div>
          </div>
          <button
            onClick={onDismiss}
            style={{
              padding: "7px 14px", borderRadius: 8,
              border: `1px solid ${COLORS.border}`,
              background: COLORS.bg, color: COLORS.text2,
              fontSize: 13, fontWeight: 500, cursor: "pointer",
              fontFamily: FONT,
            }}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Swap exercise modal ────────────────────────────────────────────────────────

function SwapModal({ exercise, exercises, onSwap, onClose }) {
  const primaryMuscle = exercise.primaryMuscle || exercise.type || null;

  // Find exercises with the same primary muscle group, excluding the current one
  const candidates = Object.values(exercises).filter(ex => {
    if (ex.id === exercise.id || ex.exId === exercise.exId) return false;
    return ex.primaryMuscle === primaryMuscle || ex.type === primaryMuscle;
  });

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
        zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center",
        fontFamily: FONT,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: COLORS.surface, borderRadius: "20px 20px 0 0",
          padding: "20px 16px 32px", width: "100%",
          maxHeight: "65vh", display: "flex", flexDirection: "column", gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: COLORS.text1 }}>Swap exercise</div>
            <div style={{ fontSize: 12, color: COLORS.text2, marginTop: 2 }}>
              Same muscle group as {exercise.name}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: "50%",
              border: `1px solid ${COLORS.border}`, background: COLORS.bg,
              color: COLORS.text2, fontSize: 18, display: "flex",
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
              color: COLORS.text3, fontSize: 13,
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
                  background: COLORS.bg,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 12, cursor: "pointer", textAlign: "left",
                  width: "100%", fontFamily: FONT,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: COLORS.text1 }}>{ex.name}</div>
                  {ex.equipment && (
                    <div style={{ fontSize: 12, color: COLORS.text2, marginTop: 2 }}>{ex.equipment}</div>
                  )}
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke={COLORS.text3} strokeWidth="2" strokeLinecap="round">
                  <polyline points="9,18 15,12 9,6"/>
                </svg>
              </button>
            ))
          )}
        </div>

        <button
          onClick={onClose}
          style={{
            width: "100%", padding: 13, fontSize: 15, fontWeight: 500,
            borderRadius: 12, border: `1px solid ${COLORS.border}`,
            background: COLORS.bg, color: COLORS.text1, cursor: "pointer",
            fontFamily: FONT,
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Exercise card ──────────────────────────────────────────────────────────────

function ExerciseCard({ exIdx, exEntry, exercise, lastSession, onUpdateSet, onCompleteSet, onSwap }) {
  const [expanded, setExpanded] = useState(true);
  const [showSwap, setShowSwap] = useState(false);

  if (!exercise) return null;

  const sets = exEntry.sets || [];
  const allDone = sets.length > 0 && sets.every(s => s.completed);
  const someDone = sets.some(s => s.completed);
  const lastSets = lastSession ? lastSession.sets || [] : [];

  const isTime = !!exercise.isTime;

  const muscleBadgeColor = exercise.type === "core"
    ? { bg: "#FAEEDA", border: "#FAC775", text: "#854F0B" }
    : { bg: "#E6F1FB", border: "#85B7EB", text: "#185FA5" };

  return (
    <>
      <div style={{
        background: allDone ? COLORS.greenLight : COLORS.surface,
        border: `1px solid ${allDone ? COLORS.green : COLORS.border}`,
        borderRadius: 14,
        marginBottom: 10,
        overflow: "hidden",
        transition: "border-color 0.2s, background 0.2s",
      }}>
        {/* Card header */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "13px 14px",
            cursor: "pointer", userSelect: "none",
            background: allDone ? COLORS.greenLight : "transparent",
          }}
          onClick={() => setExpanded(e => !e)}
        >
          {/* Completion indicator dot */}
          <div style={{
            width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
            background: allDone ? COLORS.green : someDone ? COLORS.green + "66" : COLORS.border,
            border: `2px solid ${allDone ? COLORS.green : someDone ? COLORS.green : COLORS.text3}`,
            transition: "all 0.2s",
          }}/>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{
                fontSize: 15, fontWeight: 600,
                color: allDone ? COLORS.greenDark : COLORS.text1,
              }}>
                {exercise.name}
              </span>
              {/* Muscle badge */}
              {(exercise.primaryMuscle || exercise.type) && (
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: "2px 7px",
                  borderRadius: 6,
                  background: muscleBadgeColor.bg,
                  border: `1px solid ${muscleBadgeColor.border}`,
                  color: muscleBadgeColor.text,
                  textTransform: "capitalize",
                  letterSpacing: "0.03em",
                }}>
                  {exercise.primaryMuscle || exercise.type}
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: COLORS.text2, marginTop: 2 }}>
              {sets.filter(s => s.completed).length}/{sets.length} sets done
              {exercise.restSecs && (
                <span style={{ color: COLORS.text3 }}> · {exercise.restSecs}s rest</span>
              )}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Swap button */}
            <button
              onClick={e => { e.stopPropagation(); setShowSwap(true); }}
              style={{
                width: 32, height: 32, borderRadius: 8,
                border: `1px solid ${COLORS.border}`,
                background: COLORS.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: COLORS.text2, flexShrink: 0,
              }}
              title="Swap exercise"
            >
              <IconSwap/>
            </button>
            {/* Expand chevron */}
            <span style={{
              fontSize: 11, color: COLORS.text3,
              display: "inline-block",
              transform: expanded ? "rotate(180deg)" : "none",
              transition: "transform 0.2s",
            }}>▼</span>
          </div>
        </div>

        {/* Card body */}
        {expanded && (
          <div style={{ padding: "0 14px 14px", borderTop: `1px solid ${COLORS.border}` }}>
            {/* Tip box */}
            {exercise.tip && (
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 8,
                marginTop: 10, marginBottom: 12,
                background: "#EFF6FF", border: "1px solid #BFDBFE",
                borderRadius: 8, padding: "8px 10px",
              }}>
                <div style={{ color: "#3B82F6", flexShrink: 0, marginTop: 1 }}>
                  <IconInfo/>
                </div>
                <div style={{ fontSize: 12, color: "#1D4ED8", lineHeight: 1.5 }}>
                  {exercise.tip}
                </div>
              </div>
            )}

            {/* Machine settings */}
            {exercise.settings && (
              <div style={{
                fontSize: 11, color: COLORS.text2, background: COLORS.bg,
                borderRadius: 6, padding: "5px 9px", marginBottom: 10,
                border: `1px solid ${COLORS.border}`,
                display: "inline-block",
              }}>
                ⚙ {exercise.settings}
              </div>
            )}

            {/* Set table header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "36px 1fr 80px 72px 38px",
              gap: "4px 6px",
              marginBottom: 6,
              alignItems: "center",
            }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: COLORS.text3, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Set
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: COLORS.green, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Previous
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: COLORS.text3, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {isTime ? "Seconds" : "Weight"}
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: COLORS.text3, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {isTime ? "" : "Reps"}
              </div>
              <div/>
            </div>

            {/* Set rows */}
            {sets.map((set, setIdx) => {
              const prevSet = lastSets[setIdx] || null;
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
                    gridTemplateColumns: "36px 1fr 80px 72px 38px",
                    gap: "4px 6px",
                    alignItems: "center",
                    marginBottom: 7,
                    opacity: completed ? 0.65 : 1,
                    transition: "opacity 0.2s",
                  }}
                >
                  {/* Set number */}
                  <span style={{ fontSize: 12, color: COLORS.text3, fontWeight: 500 }}>
                    {setIdx + 1}
                  </span>

                  {/* Previous */}
                  <div style={{
                    fontSize: 12, fontWeight: 500,
                    color: prevLabel ? COLORS.green : COLORS.text3,
                    padding: "6px 8px", borderRadius: 6,
                    background: prevLabel ? COLORS.greenLight : "transparent",
                    border: prevLabel ? `1px solid ${COLORS.green}44` : "1px solid transparent",
                    minHeight: 32, display: "flex", alignItems: "center",
                    cursor: prevLabel ? "pointer" : "default",
                    userSelect: "none",
                  }}
                    onClick={() => {
                      if (!prevLabel || !prevSet) return;
                      const w = String(prevSet.weight ?? prevSet.w ?? "");
                      const r = String(prevSet.reps ?? prevSet.r ?? "");
                      if (w) onUpdateSet(exIdx, setIdx, "weight", w);
                      if (r && !isTime) onUpdateSet(exIdx, setIdx, "reps", r);
                    }}
                  >
                    {prevLabel || "—"}
                  </div>

                  {/* Weight input */}
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder={isTime ? "sec" : "lb"}
                    value={set.weight || ""}
                    disabled={completed}
                    onChange={e => onUpdateSet(exIdx, setIdx, "weight", e.target.value)}
                    style={{
                      padding: "7px 8px", borderRadius: 8,
                      border: `1px solid ${completed ? COLORS.border : "rgba(0,0,0,0.18)"}`,
                      background: completed ? COLORS.bg : COLORS.surface,
                      color: COLORS.text1, width: "100%",
                      fontFamily: FONT, fontSize: 14,
                    }}
                  />

                  {/* Reps input (or blank for timed) */}
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
                        padding: "7px 8px", borderRadius: 8,
                        border: `1px solid ${completed ? COLORS.border : "rgba(0,0,0,0.18)"}`,
                        background: completed ? COLORS.bg : COLORS.surface,
                        color: COLORS.text1, width: "100%",
                        fontFamily: FONT, fontSize: 14,
                      }}
                    />
                  )}

                  {/* Complete button */}
                  <button
                    onClick={() => onCompleteSet(exIdx, setIdx)}
                    style={{
                      width: 34, height: 34, borderRadius: "50%",
                      border: `2px solid ${completed ? COLORS.green : COLORS.border}`,
                      background: completed ? COLORS.green : COLORS.surface,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", color: completed ? "#fff" : COLORS.text3,
                      transition: "all 0.18s",
                      flexShrink: 0,
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
          exercises={{}}
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
  const [restBanner, setRestBanner] = useState(null);
  // restBanner: { restSecs, key } | null

  const handleCompleteSet = useCallback((exIdx, setIdx) => {
    onCompleteSet(exIdx, setIdx);
    // find rest duration
    const exEntry = session.exercises[exIdx];
    const ex = exercises[exEntry?.exId];
    const restSecs = ex?.restSecs || exEntry?.restSecs || 60;
    setRestBanner({ restSecs, key: Date.now() });
  }, [onCompleteSet, session, exercises]);

  const dismissBanner = useCallback(() => setRestBanner(null), []);

  // Progress
  const totalSets = (session.exercises || []).reduce((acc, ex) => acc + (ex.sets?.length || 0), 0);
  const completedSets = (session.exercises || []).reduce(
    (acc, ex) => acc + (ex.sets?.filter(s => s.completed).length || 0), 0
  );
  const progress = totalSets > 0 ? completedSets / totalSets : 0;
  const allComplete = totalSets > 0 && completedSets === totalSets;

  return (
    <div style={{
      background: COLORS.bg,
      minHeight: "100vh",
      fontFamily: FONT,
      position: "relative",
    }}>
      {/* Sticky header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 30,
        background: COLORS.surface,
        borderBottom: `1px solid ${COLORS.border}`,
        boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "12px 16px 10px",
        }}>
          {/* Back / cancel */}
          <button
            onClick={onCancel}
            style={{
              width: 36, height: 36, borderRadius: 10,
              border: `1px solid ${COLORS.border}`,
              background: COLORS.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: COLORS.text1, flexShrink: 0,
            }}
            aria-label="Cancel workout"
          >
            <IconBack/>
          </button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text1, lineHeight: 1.2 }}>
              {session.dayName || "Active Workout"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 1 }}>
              <ElapsedTimer startTime={session.startTime}/>
              <span style={{ fontSize: 12, color: COLORS.text3 }}>·</span>
              <span style={{ fontSize: 12, color: COLORS.text2 }}>
                {completedSets}/{totalSets} sets
              </span>
            </div>
          </div>

          {/* Finish button (compact in header) */}
          <button
            onClick={onFinish}
            style={{
              padding: "8px 14px", borderRadius: 10,
              border: `1px solid ${allComplete ? COLORS.green : COLORS.border}`,
              background: allComplete ? COLORS.green : COLORS.bg,
              color: allComplete ? "#fff" : COLORS.text2,
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              fontFamily: FONT,
              transition: "all 0.2s",
              flexShrink: 0,
            }}
          >
            Finish
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: COLORS.bg, margin: "0 16px 12px" }}>
          <div style={{
            height: "100%",
            width: `${progress * 100}%`,
            background: COLORS.green,
            borderRadius: 2,
            transition: "width 0.4s ease",
          }}/>
        </div>
      </div>

      {/* Scrollable exercise list */}
      <div style={{ padding: "14px 14px 120px" }}>
        {(session.exercises || []).map((exEntry, exIdx) => {
          const exercise = exercises[exEntry.exId];
          return (
            <ExerciseCard
              key={exEntry.exId + "-" + exIdx}
              exIdx={exIdx}
              exEntry={exEntry}
              exercise={exercise}
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
            color: COLORS.text3, fontSize: 14,
          }}>
            No exercises in this session.
          </div>
        )}
      </div>

      {/* Inline rest timer banner */}
      {restBanner && (
        <RestBanner
          key={restBanner.key}
          restSecs={restBanner.restSecs}
          onDismiss={dismissBanner}
        />
      )}

      {/* Sticky footer — Finish Workout */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 20,
        background: COLORS.surface,
        borderTop: `1px solid ${COLORS.border}`,
        padding: "12px 16px calc(12px + env(safe-area-inset-bottom))",
      }}>
        <button
          onClick={onFinish}
          style={{
            width: "100%", padding: "14px 0",
            borderRadius: 14,
            border: "none",
            background: allComplete ? COLORS.green : COLORS.green + "CC",
            color: "#fff",
            fontSize: 16, fontWeight: 700,
            cursor: "pointer", fontFamily: FONT,
            boxShadow: allComplete ? `0 4px 16px ${COLORS.green}55` : "none",
            transition: "all 0.2s",
          }}
        >
          {allComplete ? "Finish Workout ✓" : `Finish Workout (${completedSets}/${totalSets} sets)`}
        </button>
      </div>
    </div>
  );
}
