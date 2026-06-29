import React, { useState } from "react";
import { useTheme, FONT, ACCENT_OPTIONS } from "../theme.js";
import { exportWorkoutCSV, shareOrDownloadCSV } from "../data/store.js";

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

// ── Settings sheet ─────────────────────────────────────────────────────────────

function SettingsSheet({ unit, onChangeUnit, theme, accent, onChangeTheme, onChangeAccent, onExport, hasLogs, onClose }) {
  const C = useTheme();

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
        }}
      >
        {/* Drag handle */}
        <div style={{
          width: 36, height: 4, borderRadius: 2, background: C.border,
          margin: "0 auto 20px",
        }} />
        <div style={{ fontSize: 17, fontWeight: 700, color: C.text1, marginBottom: 20 }}>
          Settings
        </div>

        {/* Weight unit */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: C.text2, fontWeight: 600,
            textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
            Weight Unit
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {["lbs", "kg"].map(u => (
              <button
                key={u}
                onClick={() => onChangeUnit(u)}
                style={{
                  flex: 1, padding: "13px 0", borderRadius: 10, cursor: "pointer",
                  fontSize: 15, fontWeight: 600, fontFamily: FONT,
                  background: unit === u ? C.greenLight : C.surface2,
                  color:      unit === u ? C.green : C.text2,
                  border: unit === u ? `1.5px solid ${C.green}` : `1px solid ${C.border}`,
                  transition: "all 0.15s",
                }}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        {/* Appearance */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: C.text2, fontWeight: 600,
            textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
            Appearance
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {[
              { value: "light", label: "Light", icon: "☀️" },
              { value: "dark",  label: "Dark",  icon: "🌙" },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => onChangeTheme(opt.value)}
                style={{
                  flex: 1, padding: "12px 0", borderRadius: 10, cursor: "pointer",
                  fontSize: 14, fontWeight: 600, fontFamily: FONT,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  background: theme === opt.value ? C.greenLight : C.surface2,
                  color:      theme === opt.value ? C.green : C.text2,
                  border: theme === opt.value ? `1.5px solid ${C.green}` : `1px solid ${C.border}`,
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: 16 }}>{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Accent color */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: C.text2, fontWeight: 600,
            textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
            Accent Color
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {ACCENT_OPTIONS.map(opt => {
              const isActive = accent === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => onChangeAccent(opt.key)}
                  style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: opt.color,
                    border: isActive ? `3px solid ${C.text1}` : "3px solid transparent",
                    boxShadow: isActive ? `0 0 0 2px ${opt.color}` : "none",
                    cursor: "pointer", padding: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s",
                    flexShrink: 0,
                  }}
                >
                  {isActive && (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M3.5 9L7.5 13L14.5 5.5" stroke="#fff" strokeWidth="2.2"
                        strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              );
            })}
            <div style={{ marginLeft: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text1 }}>
                {ACCENT_OPTIONS.find(a => a.key === accent)?.label || "Green"}
              </div>
            </div>
          </div>
        </div>

        {/* Data */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: C.text2, fontWeight: 600,
            textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
            Data
          </div>
          <button
            onClick={hasLogs ? onExport : undefined}
            disabled={!hasLogs}
            style={{
              width: "100%", padding: "13px 16px",
              borderRadius: 10, cursor: hasLogs ? "pointer" : "default",
              fontSize: 14, fontWeight: 600, fontFamily: FONT,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: C.surface2,
              color: hasLogs ? C.text1 : C.text3,
              border: `1px solid ${C.border}`,
              opacity: hasLogs ? 1 : 0.5,
              transition: "all 0.15s",
            }}
          >
            <span>Export Workout Log (CSV)</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
          {!hasLogs && (
            <div style={{ fontSize: 12, color: C.text3, marginTop: 6, paddingLeft: 2 }}>
              Complete a workout to enable export
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          style={{
            width: "100%", padding: "14px 0",
            borderRadius: 12, border: `1px solid ${C.border}`,
            background: C.surface2, color: C.text1,
            fontSize: 15, fontWeight: 600, cursor: "pointer",
            fontFamily: FONT,
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function IconGear() {
  const C = useTheme();
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke={C.text2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83
               2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33
               1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09
               A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06
               a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15
               a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09
               A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06
               a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68
               a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09
               a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06
               a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9
               a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09
               a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

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

export default function Home({ store, plans, exercises, onStartWorkout, onContinueSession, onUpdateStore }) {
  const C = useTheme();
  const [showSettings, setShowSettings] = useState(false);
  const [localUnit, setLocalUnit]       = useState(store.unit || "lbs");

  async function handleExport() {
    const csv = exportWorkoutCSV(store.logs, exercises, plans, store.unit || "lbs");
    if (!csv) return;
    const date = new Date().toISOString().slice(0, 10);
    await shareOrDownloadCSV(csv, `workout-log-${date}.csv`);
  }

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
      paddingBottom: "calc(72px + env(safe-area-inset-bottom))",
    }}>

      {showSettings && (
        <SettingsSheet
          unit={localUnit}
          onChangeUnit={u => { setLocalUnit(u); if (onUpdateStore) onUpdateStore({ unit: u }); }}
          theme={store.theme || "light"}
          accent={store.accent || "green"}
          onChangeTheme={t => { if (onUpdateStore) onUpdateStore({ theme: t }); }}
          onChangeAccent={a => { if (onUpdateStore) onUpdateStore({ accent: a }); }}
          onExport={handleExport}
          hasLogs={hasLogs}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Sticky header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: C.surface,
        borderBottom: `1px solid ${C.border}`,
        padding: "14px 16px 12px",
        paddingTop: "calc(14px + env(safe-area-inset-top))",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.text1, lineHeight: 1.2 }}>
            {greeting()}
          </div>
          <div style={{ fontSize: 13, color: C.text2, marginTop: 1 }}>
            {todayStr()}
          </div>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          style={{
            width: 40, height: 40, borderRadius: "50%",
            background: C.surface2, border: `1px solid ${C.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <IconGear />
        </button>
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
