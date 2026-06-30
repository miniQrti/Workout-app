import React, { useState, useMemo } from "react";
import { useTheme, FONT } from "../theme.js";
import { buildSessionPlan } from "../data/store.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function todayStr() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });
}

function formatDuration(secs) {
  if (!secs) return "—";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return s > 0 ? `${m}m ${s}s` : `${m} min`;
}

function formatDateLabel(isoString) {
  if (!isoString) return "";
  const d    = new Date(isoString);
  const now  = new Date();
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getWeekDots(logs) {
  const now = new Date();
  const day = now.getDay();
  const mon = new Date(now);
  mon.setDate(now.getDate() - ((day + 6) % 7));
  mon.setHours(0, 0, 0, 0);

  const dots = Array(7).fill(false);
  for (const log of logs) {
    const d = new Date(log.date || log.completedAt || log.startedAt || "");
    if (isNaN(d)) continue;
    const diffDays = Math.floor((d - mon) / 86400000);
    if (diffDays >= 0 && diffDays < 7) dots[diffDays] = true;
  }
  return dots;
}

function workoutsThisWeek(logs) {
  return getWeekDots(logs).filter(Boolean).length;
}

function currentStreak(logs) {
  if (!logs.length) return 0;
  const daySet = new Set();
  for (const log of logs) {
    const d = new Date(log.date || log.completedAt || log.startedAt || "");
    if (!isNaN(d)) daySet.add(d.toISOString().slice(0, 10));
  }
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (!daySet.has(key)) {
      if (streak === 0) {
        cursor.setDate(cursor.getDate() - 1);
        if (!daySet.has(cursor.toISOString().slice(0, 10))) break;
        streak++;
        cursor.setDate(cursor.getDate() - 1);
        continue;
      }
      break;
    }
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function totalPRs(logs, exercises) {
  if (!logs.length) return 0;
  let count = 0;
  for (const id of Object.keys(exercises)) {
    let best = 0;
    for (const log of logs) {
      if (!log.exercises) continue;
      const ex = log.exercises.find(e => e.exId === id);
      if (!ex?.sets) continue;
      for (const s of ex.sets) {
        const w = parseFloat(s.weight);
        if (!isNaN(w) && w > best) best = w;
      }
    }
    if (best > 0) count++;
  }
  return count;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Pill({ label }) {
  const C = useTheme();
  return (
    <span style={{
      padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500,
      background: C.surface2, color: C.text2, border: `1px solid ${C.border}`,
      whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}

function StatCard({ value, label }) {
  const C = useTheme();
  return (
    <div style={{
      flex: 1, background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 12, padding: "12px 10px", textAlign: "center",
    }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: C.text1, lineHeight: 1.1 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: C.text2, marginTop: 3, fontWeight: 500 }}>
        {label}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Home({ store, plans, exercises, onStartWorkout, onContinueSession, onUpdateStore, onOpenMenu }) {
  const C = useTheme();

  const plan         = plans[store.activePlanId];
  const scheduledIdx = (store.nextDayIdx || 0) % (plan?.days?.length || 1);
  const dayIdx       = store.overrideDayIdx !== undefined
    ? store.overrideDayIdx % (plan?.days?.length || 1)
    : scheduledIdx;
  const day          = plan?.days?.[dayIdx];
  const logs       = store.logs || [];
  const hasLogs    = logs.length > 0;
  const recentLogs = [...logs].reverse().slice(0, 3);
  const weekDots   = getWeekDots(logs);
  const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

  const exerciseCount = day?.exercises?.length || 0;
  const firstFour     = (day?.exercises || []).slice(0, 4).map(e => {
    const ex = exercises[e.exId];
    return ex ? ex.name : e.exId;
  });

  const hasActiveSession = !!onContinueSession;

  const [coachOpen, setCoachOpen] = useState(true);
  const [dayPickerOpen, setDayPickerOpen] = useState(false);

  const sessionPlan = useMemo(() => {
    if (!plan || !day) return [];
    return buildSessionPlan(logs, plan, dayIdx, exercises, store.swaps || {});
  }, [logs, store.activePlanId, store.nextDayIdx, store.overrideDayIdx, store.swaps]); // eslint-disable-line

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      fontFamily: FONT,
      paddingBottom: "calc(24px + env(safe-area-inset-bottom))",
    }}>

      {/* Sticky header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: C.surface,
        borderBottom: `1px solid ${C.border}`,
        padding: "14px 16px 12px",
        paddingTop: "calc(14px + env(safe-area-inset-top))",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <button
          onClick={onOpenMenu}
          style={{
            width: 40, height: 40, borderRadius: "50%",
            background: C.surface2, border: `1px solid ${C.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0,
          }}
        >
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
            <path d="M0 1h18M0 7h18M0 13h18" stroke={C.text2} strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.text1, lineHeight: 1.2 }}>
            {greeting()}
          </div>
          <div style={{ fontSize: 13, color: C.text2, marginTop: 1 }}>
            {todayStr()}
          </div>
        </div>
      </div>

      <div style={{ padding: "16px 16px 0" }}>

        {/* Continue session banner */}
        {hasActiveSession && (
          <div style={{
            background: C.greenLight, border: `1.5px solid ${C.green}`,
            borderRadius: 14, padding: "12px 14px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 14,
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.green }}>
                Workout in progress
              </div>
              <div style={{ fontSize: 12, color: C.text2, marginTop: 1 }}>
                Tap to pick up where you left off
              </div>
            </div>
            <button
              onClick={onContinueSession}
              style={{
                padding: "9px 16px", borderRadius: 8, cursor: "pointer",
                fontSize: 13, fontWeight: 600,
                background: C.green, color: "#fff", border: "none",
                fontFamily: FONT,
              }}
            >
              Resume
            </button>
          </div>
        )}

        {/* Today's workout card */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 18, padding: "18px 16px",
          marginBottom: 16, boxShadow: C.isDark ? "none" : "0 2px 12px rgba(0,0,0,0.06)",
        }}>
          <div style={{
            display: "inline-block", padding: "3px 10px",
            borderRadius: 20, background: C.greenLight,
            color: C.green, fontSize: 11, fontWeight: 600,
            marginBottom: 8, letterSpacing: "0.02em",
          }}>
            {plan?.name || "No plan selected"}
          </div>

          <div style={{ fontSize: 24, fontWeight: 700, color: C.text1, lineHeight: 1.2 }}>
            {day?.name || "Rest Day"}
          </div>

          {day && (
            <div style={{ display: "flex", gap: 16, marginTop: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: C.text2 }}>
                <span style={{ color: C.text1, fontWeight: 600 }}>{exerciseCount}</span>
                {" exercises"}
              </span>
              <span style={{ color: C.border, fontSize: 13 }}>·</span>
              <span style={{ fontSize: 13, color: C.text2 }}>
                <span style={{ color: C.text1, fontWeight: 600 }}>
                  {plan?.estimatedMins || "?"}
                </span>
                {" min est."}
              </span>
            </div>
          )}

          {firstFour.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
              {firstFour.map((name, i) => <Pill key={i} label={name} />)}
              {exerciseCount > 4 && (
                <span style={{
                  padding: "4px 10px", borderRadius: 20, fontSize: 12,
                  color: C.text3, border: `1px dashed ${C.border}`,
                }}>
                  +{exerciseCount - 4} more
                </span>
              )}
            </div>
          )}

          {!hasLogs && (
            <div style={{
              fontSize: 13, color: C.text2, fontStyle: "italic",
              marginBottom: 14, lineHeight: 1.5,
            }}>
              Ready to start your first workout? Let's go!
            </div>
          )}

          {/* Coach's notes */}
          {sessionPlan.length > 0 && (
            <div style={{
              background: C.bg, borderRadius: 12,
              border: `1px solid ${C.border}`,
              marginBottom: 14, overflow: "hidden",
            }}>
              <button
                onClick={() => setCoachOpen(o => !o)}
                style={{
                  width: "100%", padding: "10px 12px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: "none", border: "none", cursor: "pointer", fontFamily: FONT,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 15 }}>🎯</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.text1 }}>Coach's Notes</span>
                  <span style={{
                    fontSize: 11, padding: "2px 7px", borderRadius: 10,
                    background: C.greenLight, color: C.green, fontWeight: 600,
                  }}>
                    {sessionPlan.filter(e => e.action === "increase").length} increases
                  </span>
                </div>
                <span style={{
                  fontSize: 11, color: C.text3,
                  display: "inline-block",
                  transform: coachOpen ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s",
                }}>▼</span>
              </button>

              {coachOpen && (
                <div style={{ borderTop: `1px solid ${C.border}` }}>
                  {sessionPlan.map((item, i) => {
                    const isLast = i === sessionPlan.length - 1;
                    const actionColor =
                      item.action === "increase" ? C.green :
                      item.action === "decrease" ? (C.isDark ? "#F87171" : "#DC2626") :
                      item.action === "first"    ? C.text3 : C.text2;
                    const arrow =
                      item.action === "increase" ? "↑" :
                      item.action === "decrease" ? "↓" :
                      item.action === "hold"     ? "→" : "•";

                    return (
                      <div key={item.exId} style={{
                        padding: "9px 12px",
                        borderBottom: isLast ? "none" : `1px solid ${C.border}`,
                        display: "flex", alignItems: "flex-start", gap: 8,
                      }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: actionColor, flexShrink: 0, marginTop: 1 }}>
                          {arrow}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: C.text1 }}>{item.name}</span>
                            {item.suggestedWeight !== null && (
                              <span style={{ fontSize: 13, fontWeight: 700, color: actionColor }}>
                                {item.suggestedWeight} lbs
                              </span>
                            )}
                            {item.isNewPR && (
                              <span style={{ fontSize: 10, fontWeight: 700, color: "#F59E0B", background: "#FEF3C7", padding: "1px 5px", borderRadius: 5 }}>
                                PR attempt
                              </span>
                            )}
                            {item.deload && (
                              <span style={{ fontSize: 10, fontWeight: 700, color: "#EF4444", background: "#FEE2E2", padding: "1px 5px", borderRadius: 5 }}>
                                deload
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 11, color: C.text3, marginTop: 2 }}>
                            {item.lastSets ? (
                              <>last: {item.lastWeight} lbs · {item.lastSets.length} sets{item.reason ? ` — ${item.reason}` : ""}</>
                            ) : (
                              item.reason || "no history yet — try the plan weight"
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <button
            onClick={onStartWorkout}
            style={{
              width: "100%", padding: "15px 0",
              borderRadius: 12, border: "none",
              background: C.green, color: "#fff",
              fontSize: 16, fontWeight: 700, cursor: "pointer",
              fontFamily: FONT,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: `0 3px 14px ${C.green}55`,
              letterSpacing: "0.01em",
            }}
          >
            Start Workout
            <span style={{ fontSize: 18 }}>→</span>
          </button>

          {/* Day switcher */}
          {plan && (
            <div style={{ marginTop: 12 }}>
              {!dayPickerOpen ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 28 }}>
                  {store.overrideDayIdx !== undefined ? (
                    <>
                      <span style={{ fontSize: 12, color: C.text2 }}>
                        Switched to:{" "}
                        <span style={{ fontWeight: 600, color: C.text1 }}>{day?.name}</span>
                      </span>
                      <button
                        onClick={() => onUpdateStore({ overrideDayIdx: undefined })}
                        style={{
                          fontSize: 12, color: C.text3, background: "none", border: "none",
                          cursor: "pointer", padding: "2px 6px", fontFamily: FONT,
                        }}
                      >
                        Reset ×
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setDayPickerOpen(true)}
                      style={{
                        fontSize: 12, color: C.text3, background: "none", border: "none",
                        cursor: "pointer", padding: 0, fontFamily: FONT,
                        textDecoration: "underline", textDecorationColor: C.border,
                      }}
                    >
                      Switch to a different day
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 12, color: C.text2, marginBottom: 8, fontWeight: 600 }}>
                    Choose workout day:
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {plan.days.map((d, i) => {
                      const isScheduled = i === scheduledIdx;
                      const isSelected  = i === dayIdx;
                      return (
                        <button
                          key={d.id}
                          onClick={() => {
                            onUpdateStore({ overrideDayIdx: isScheduled ? undefined : i });
                            setDayPickerOpen(false);
                          }}
                          style={{
                            width: "100%", padding: "10px 12px", borderRadius: 10,
                            background: isSelected ? C.greenLight : C.surface2,
                            border: `1.5px solid ${isSelected ? C.green : C.border}`,
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            cursor: "pointer", fontFamily: FONT, textAlign: "left",
                          }}
                        >
                          <span style={{ fontSize: 13, fontWeight: 600, color: C.text1 }}>{d.name}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            {isScheduled && (
                              <span style={{ fontSize: 11, color: C.text3 }}>scheduled</span>
                            )}
                            {isSelected && (
                              <span style={{ fontSize: 13, color: C.green, fontWeight: 700 }}>✓</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setDayPickerOpen(false)}
                    style={{
                      marginTop: 8, fontSize: 12, color: C.text3,
                      background: "none", border: "none", cursor: "pointer",
                      padding: 0, fontFamily: FONT,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* This Week */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 16, padding: "14px 16px",
          marginBottom: 16,
        }}>
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between", marginBottom: 12,
          }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.text1 }}>This Week</div>
            <div style={{ fontSize: 13, color: C.text2 }}>
              {workoutsThisWeek(logs)} workout{workoutsThisWeek(logs) !== 1 ? "s" : ""}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, justifyContent: "space-between" }}>
            {DAY_LABELS.map((label, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: weekDots[i] ? C.green : C.surface2,
                  border: weekDots[i] ? "none" : `1.5px solid ${C.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {weekDots[i] && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2.5 7L6 10.5L11.5 4" stroke="#fff" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div style={{ fontSize: 10, color: weekDots[i] ? C.green : C.text3, fontWeight: 500 }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats row */}
        {hasLogs && (
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <StatCard value={logs.length} label="Total Workouts" />
            <StatCard value={currentStreak(logs)} label="Day Streak" />
            <StatCard value={totalPRs(logs, exercises)} label="Records Set" />
          </div>
        )}

        {/* Recent Workouts */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.text1, marginBottom: 12 }}>
            Recent Workouts
          </div>

          {!hasLogs ? (
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 14, padding: "24px 16px", textAlign: "center",
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🏋️</div>
              <div style={{ fontSize: 14, color: C.text2, lineHeight: 1.5 }}>
                Your completed workouts will appear here
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recentLogs.map((log, i) => {
                const exCount  = log.exercises?.length || 0;
                const dayLabel = log.dayName || `Day ${(log.dayIdx ?? 0) + 1}`;
                const dateLabel = formatDateLabel(log.date || log.completedAt || log.startedAt);
                const duration  = formatDuration(log.durationSecs);
                return (
                  <div key={log.id || i} style={{
                    background: C.surface, border: `1px solid ${C.border}`,
                    borderRadius: 14, padding: "14px 16px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.text1 }}>
                        {dayLabel}
                      </div>
                      <div style={{ fontSize: 12, color: C.text2, marginTop: 2 }}>
                        {dateLabel}
                        {exCount > 0 && ` · ${exCount} exercise${exCount !== 1 ? "s" : ""}`}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: C.text2, fontWeight: 500 }}>
                      {duration}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
