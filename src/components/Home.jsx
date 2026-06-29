import React from "react";
import { useTheme, FONT } from "../theme.js";

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

  const plan       = plans[store.activePlanId];
  const dayIdx     = store.nextDayIdx || 0;
  const day        = plan?.days?.[dayIdx % (plan?.days?.length || 1)];
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
