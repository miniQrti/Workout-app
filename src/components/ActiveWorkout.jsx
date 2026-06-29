import React, { useState, useEffect, useRef, useCallback } from "react";
import { getLastSession, getProgressionSuggestion } from "../data/store.js";
import { useTheme, FONT } from "../theme.js";
import { MACHINE_SETTINGS } from "../data/historicalLogs.js";

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

const REST_PRESETS = [
  { label: "1:00", secs: 60 },
  { label: "1:30", secs: 90 },
  { label: "2:00", secs: 120 },
  { label: "3:00", secs: 180 },
];

function RestBanner({ restSecs, onDismiss }) {
  const C = useTheme();
  const [duration, setDuration] = useState(restSecs);
  const [left,     setLeft]     = useState(restSecs);
  const [running,  setRunning]  = useState(false);
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

  const pct  = duration > 0 ? (duration - left) / duration : 0;
  const m    = Math.floor(left / 60);
  const s    = left % 60;
  const done = left === 0;

  function toggleRunning() {
    if (done) return;
    setRunning(r => !r);
  }

  function pickPreset(secs) {
    clearInterval(intervalRef.current);
    setRunning(false);
    setDuration(secs);
    setLeft(secs);
  }

  return (
    <div style={{
      position: "fixed", bottom: 72, left: 0, right: 0,
      zIndex: 50, padding: "0 10px", pointerEvents: "none",
    }}>
      <div style={{
        background: done ? C.greenLight : C.surface,
        border: `2px solid ${done ? C.green : C.border}`,
        borderRadius: 18, padding: "14px 16px 10px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.28)",
        pointerEvents: "all", overflow: "hidden", position: "relative",
      }}>
        {/* Progress bar */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: C.surface2,
        }}>
          <div style={{
            height: "100%", width: `${pct * 100}%`,
            background: C.green,
            transition: running ? "width 0.95s linear" : "none",
            borderRadius: 2,
          }}/>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button
              onClick={toggleRunning}
              disabled={done}
              style={{
                width: 52, height: 52, borderRadius: "50%",
                background: done ? C.green : running ? C.greenLight : C.green,
                border: running && !done ? `2px solid ${C.green}` : "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, cursor: done ? "default" : "pointer",
                boxShadow: running ? "none" : `0 4px 12px ${C.green}55`,
              }}
            >
              {done ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke="#fff" strokeWidth="2.8" strokeLinecap="round">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
              ) : running ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke={C.green} strokeWidth="2.5" strokeLinecap="round">
                  <line x1="6" y1="4" x2="6" y2="20"/>
                  <line x1="18" y1="4" x2="18" y2="20"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5,3 19,12 5,21"/>
                </svg>
              )}
            </button>

            <div>
              <div style={{ fontSize: 12, color: C.text2, fontWeight: 500, marginBottom: 2 }}>
                {done ? "Rest complete — go!" : running ? "Resting" : "Tap to start"}
              </div>
              <div style={{
                fontSize: 36, fontWeight: 800,
                color: done ? C.green : C.text1,
                fontVariantNumeric: "tabular-nums", lineHeight: 1,
                letterSpacing: "-0.5px",
              }}>
                {done ? "✓" : `${m}:${String(s).padStart(2, "0")}`}
              </div>
            </div>
          </div>

          <button
            onClick={onDismiss}
            style={{
              padding: "10px 18px", borderRadius: 10,
              border: `1px solid ${C.border}`,
              background: C.surface2, color: C.text2,
              fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: FONT,
            }}
          >
            Skip
          </button>
        </div>

        {/* Duration presets */}
        {!done && (
          <div style={{ display: "flex", gap: 8, paddingBottom: 2 }}>
            {REST_PRESETS.map(p => (
              <button
                key={p.secs}
                onClick={() => pickPreset(p.secs)}
                style={{
                  flex: 1, padding: "8px 0", borderRadius: 10,
                  border: `1.5px solid ${duration === p.secs ? C.green : C.border}`,
                  background: duration === p.secs ? C.greenLight : C.surface2,
                  color: duration === p.secs ? C.green : C.text2,
                  fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FONT,
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
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

// ── Exercise card ──────────────────────────────────────────────────────────────

const FEEL_OPTIONS = [
  { label: "Easy",  color: "#10B981", bg: "#D1FAE5" },
  { label: "Good",  color: "#3B82F6", bg: "#DBEAFE" },
  { label: "Hard",  color: "#F59E0B", bg: "#FEF3C7" },
  { label: "Tough", color: "#EF4444", bg: "#FEE2E2" },
];

function ExerciseCard({
  exIdx, exEntry, exercise, exercises, lastSession, progressionSuggestion, unit,
  onUpdateSet, onCompleteSet, onUpdateFeel, onSwap,
}) {
  const C = useTheme();
  const [expanded, setExpanded] = useState(false);
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
            {MACHINE_SETTINGS[exercise.id] && (
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                marginBottom: 10,
                background: C.isDark ? "#1A1A2E" : "#F5F3FF",
                border: `1px solid ${C.isDark ? "#2D2B55" : "#DDD6FE"}`,
                borderRadius: 8, padding: "7px 10px",
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke={C.isDark ? "#A78BFA" : "#7C3AED"} strokeWidth="2.2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
                </svg>
                <span style={{
                  fontSize: 12, fontWeight: 600,
                  color: C.isDark ? "#A78BFA" : "#7C3AED",
                }}>
                  {MACHINE_SETTINGS[exercise.id]}
                </span>
              </div>
            )}

            {/* Progression suggestion */}
            {progressionSuggestion && !isTime && (
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                marginBottom: 10,
                background: progressionSuggestion.action === "increase"
                  ? C.greenLight
                  : progressionSuggestion.action === "decrease"
                    ? (C.isDark ? "#2D1A1A" : "#FFF0F0")
                    : C.surface2,
                border: `1px solid ${
                  progressionSuggestion.action === "increase"
                    ? C.green + "66"
                    : progressionSuggestion.action === "decrease"
                      ? (C.isDark ? "#7F2020" : "#FECACA")
                      : C.border
                }`,
                borderRadius: 8, padding: "7px 10px",
              }}>
                <span style={{ fontSize: 14, lineHeight: 1 }}>
                  {progressionSuggestion.action === "increase" ? "↑" : progressionSuggestion.action === "decrease" ? "↓" : "→"}
                </span>
                <span style={{
                  fontSize: 12, fontWeight: 600,
                  color: progressionSuggestion.action === "increase"
                    ? C.green
                    : progressionSuggestion.action === "decrease"
                      ? (C.isDark ? "#F87171" : "#DC2626")
                      : C.text2,
                }}>
                  Try {progressionSuggestion.suggestedWeight} {unit}
                </span>
                <span style={{ fontSize: 11, color: C.text3 }}>
                  — {progressionSuggestion.reason}
                </span>
              </div>
            )}

            {/* Column headers */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "22px 68px 88px 56px 36px",
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

            {/* How did it feel */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.text3, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                How did it feel?
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {FEEL_OPTIONS.map(f => {
                  const selected = exEntry.feel === f.label;
                  return (
                    <button
                      key={f.label}
                      onClick={() => onUpdateFeel(exIdx, selected ? null : f.label)}
                      style={{
                        flex: 1, padding: "7px 2px", borderRadius: 8, cursor: "pointer",
                        border: `1.5px solid ${selected ? f.color : C.border}`,
                        background: selected ? f.bg : C.surface2,
                        color: selected ? f.color : C.text2,
                        fontSize: 12, fontWeight: 600, fontFamily: FONT,
                        transition: "all 0.15s",
                      }}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Set rows */}
            {sets.map((set, setIdx) => {
              const prevSet     = lastSets[setIdx] || null;
              const hasPrevData = prevSet && (prevSet.weight > 0 || prevSet.reps > 0);
              const prevLabel   = hasPrevData
                ? isTime
                  ? `${prevSet.weight}s`
                  : `${prevSet.weight}×${prevSet.reps}`
                : null;
              const completed = set.completed;

              return (
                <div
                  key={setIdx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "22px 68px 88px 56px 36px",
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
                      if (!hasPrevData) return;
                      if (prevSet.weight > 0) onUpdateSet(exIdx, setIdx, "weight", String(prevSet.weight));
                      if (prevSet.reps > 0 && !isTime) onUpdateSet(exIdx, setIdx, "reps", String(prevSet.reps));
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
                    <input
                      type="number"
                      inputMode="decimal"
                      placeholder={unit === "kg" ? "kg" : "lb"}
                      value={set.weight || ""}
                      disabled={completed}
                      onChange={e => onUpdateSet(exIdx, setIdx, "weight", e.target.value)}
                      style={{
                        padding: "7px 4px", borderRadius: 7, textAlign: "center",
                        border: `1px solid ${completed ? C.border : C.inputBorder}`,
                        background: completed ? C.bg : C.surface,
                        color: C.text1, width: "100%",
                        fontFamily: FONT, fontSize: 14,
                      }}
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

// ── Warmup card ────────────────────────────────────────────────────────────────

function WarmupCard({ items }) {
  const C = useTheme();
  const [expanded, setExpanded] = useState(true);
  const [done, setDone] = useState(() => new Array(items.length).fill(false));

  if (!items || items.length === 0) return null;

  const completedCount = done.filter(Boolean).length;
  const allDone = completedCount === items.length;

  function toggle(i) {
    setDone(prev => prev.map((v, idx) => idx === i ? !v : v));
  }

  return (
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
          background: allDone ? C.green : completedCount > 0 ? C.green + "66" : C.border,
          border: `2px solid ${allDone ? C.green : completedCount > 0 ? C.green : C.text3}`,
          transition: "all 0.2s",
        }}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: allDone ? C.greenDark : C.text1 }}>
            Warmup & Mobility
          </div>
          <div style={{ fontSize: 12, color: C.text2, marginTop: 2 }}>
            {completedCount}/{items.length} done
          </div>
        </div>
        <span style={{
          fontSize: 11, color: C.text3,
          display: "inline-block",
          transform: expanded ? "rotate(180deg)" : "none",
          transition: "transform 0.2s",
        }}>▼</span>
      </div>

      {/* Body */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "8px 14px 12px" }}>
          {items.map((item, i) => (
            <div
              key={i}
              onClick={() => toggle(i)}
              style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                padding: "9px 0",
                borderBottom: i < items.length - 1 ? `1px solid ${C.border}` : "none",
                cursor: "pointer", userSelect: "none",
                opacity: done[i] ? 0.5 : 1,
                transition: "opacity 0.2s",
              }}
            >
              {/* Checkbox */}
              <div style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
                border: `2px solid ${done[i] ? C.green : C.border}`,
                background: done[i] ? C.green : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.18s",
              }}>
                {done[i] && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                    stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 13, fontWeight: 500, color: C.text1,
                  textDecoration: done[i] ? "line-through" : "none",
                }}>
                  {item.name}
                </div>
                {item.detail && (
                  <div style={{ fontSize: 11, color: C.text3, marginTop: 2 }}>
                    {item.detail}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ActiveWorkout ──────────────────────────────────────────────────────────────

export default function ActiveWorkout({
  session,
  exercises,
  logs,
  unit,
  onUpdateSet,
  onCompleteSet,
  onUpdateFeel,
  onFinish,
  onCancel,
  onSwapExercise,
}) {
  const C = useTheme();
  const [restBanner,     setRestBanner]     = useState(null);
  const [confirmCancel,  setConfirmCancel]  = useState(false);
  const [warnFinish,     setWarnFinish]     = useState(false);

  const handleCompleteSet = useCallback((exIdx, setIdx) => {
    const wasCompleted = session.exercises[exIdx]?.sets?.[setIdx]?.completed;
    onCompleteSet(exIdx, setIdx);
    if (!wasCompleted) {
      const exEntry  = session.exercises[exIdx];
      const ex       = exercises[exEntry?.exId];
      const restSecs = ex?.restSecs || exEntry?.restSecs || 60;
      setRestBanner({ restSecs, key: Date.now() });
    }
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

  function handleCancel() {
    if (completedSets > 0) { setConfirmCancel(true); } else { onCancel(); }
  }

  function handleFinish() {
    if (completedSets === 0) { setWarnFinish(true); } else { onFinish(); }
  }

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
            onClick={handleCancel}
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
            onClick={handleFinish}
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
        <WarmupCard items={session.warmup || []} />

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
              progressionSuggestion={getProgressionSuggestion(logs || [], exEntry.exId)}
              unit={unit}
              onUpdateSet={onUpdateSet}
              onCompleteSet={handleCompleteSet}
              onUpdateFeel={onUpdateFeel}
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
          onClick={handleFinish}
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

      {/* Cancel confirmation */}
      {confirmCancel && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
          zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20, fontFamily: FONT,
        }}>
          <div style={{
            background: C.surface, borderRadius: 20,
            padding: "24px 20px", width: "100%", maxWidth: 320,
            boxShadow: "0 16px 48px rgba(0,0,0,0.3)",
          }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: C.text1, marginBottom: 8 }}>
              Discard workout?
            </div>
            <div style={{ fontSize: 14, color: C.text2, lineHeight: 1.5, marginBottom: 20 }}>
              You have {completedSets} set{completedSets !== 1 ? "s" : ""} logged. Leaving now will discard all progress.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setConfirmCancel(false)}
                style={{
                  flex: 1, padding: "13px 0", borderRadius: 12,
                  border: `1px solid ${C.border}`, background: C.surface2,
                  color: C.text1, fontSize: 15, fontWeight: 600,
                  cursor: "pointer", fontFamily: FONT,
                }}
              >
                Keep going
              </button>
              <button
                onClick={onCancel}
                style={{
                  flex: 1, padding: "13px 0", borderRadius: 12,
                  border: "none", background: C.red,
                  color: "#fff", fontSize: 15, fontWeight: 600,
                  cursor: "pointer", fontFamily: FONT,
                }}
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finish with 0 sets warning */}
      {warnFinish && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
          zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20, fontFamily: FONT,
        }}>
          <div style={{
            background: C.surface, borderRadius: 20,
            padding: "24px 20px", width: "100%", maxWidth: 320,
            boxShadow: "0 16px 48px rgba(0,0,0,0.3)",
          }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: C.text1, marginBottom: 8 }}>
              No sets completed
            </div>
            <div style={{ fontSize: 14, color: C.text2, lineHeight: 1.5, marginBottom: 20 }}>
              You haven't logged any sets yet. Save the workout anyway?
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setWarnFinish(false)}
                style={{
                  flex: 1, padding: "13px 0", borderRadius: 12,
                  border: `1px solid ${C.border}`, background: C.surface2,
                  color: C.text1, fontSize: 15, fontWeight: 600,
                  cursor: "pointer", fontFamily: FONT,
                }}
              >
                Keep going
              </button>
              <button
                onClick={onFinish}
                style={{
                  flex: 1, padding: "13px 0", borderRadius: 12,
                  border: "none", background: C.green,
                  color: "#fff", fontSize: 15, fontWeight: 600,
                  cursor: "pointer", fontFamily: FONT,
                }}
              >
                Save anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
