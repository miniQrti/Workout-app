import React, { useState, useMemo } from "react";
import { getExerciseHistory, getPR } from "../data/store.js";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:          "#F5F5F0",
  surface:     "#FFFFFF",
  green:       "#16A97C",
  greenDark:   "#0D7A59",
  greenLight:  "#E8F8F2",
  orange:      "#F97316",
  orangeLight: "#FFF4ED",
  text1:       "#111111",
  text2:       "#6B7280",
  text3:       "#9CA3AF",
  border:      "rgba(0,0,0,0.07)",
  red:         "#EF4444",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDuration(secs) {
  if (!secs) return "—";
  const m = Math.floor(secs / 60);
  return `${m} min`;
}

function formatDateLabel(raw) {
  if (!raw) return "";
  const d    = new Date(raw);
  const now  = new Date();
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function monthWorkouts(logs) {
  const now = new Date();
  return logs.filter(l => {
    const d = new Date(l.date || l.completedAt || l.startedAt || "");
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;
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
        const prevKey = cursor.toISOString().slice(0, 10);
        if (!daySet.has(prevKey)) break;
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

// ── SVG Line Chart ────────────────────────────────────────────────────────────

function LineChart({ history, prWeight }) {
  const W = 300, H = 80, PAD = 10;
  const innerW = W - PAD * 2;
  const innerH = H - PAD * 2;

  // Take last 12 sessions that have valid weight
  const sessions = history.filter(h => h.weight > 0).slice(-12);

  if (sessions.length < 2) {
    return (
      <div style={{
        height: 80, display: "flex", alignItems: "center", justifyContent: "center",
        color: C.text3, fontSize: 13,
      }}>
        Log more sessions to see your chart
      </div>
    );
  }

  const weights = sessions.map(s => s.weight);
  const minW    = Math.min(...weights);
  const maxW    = Math.max(...weights);
  const range   = maxW - minW || 1;

  const pts = sessions.map((s, i) => ({
    x: PAD + (i / (sessions.length - 1)) * innerW,
    y: PAD + (1 - (s.weight - minW) / range) * innerH,
    isPR: s.weight >= prWeight,
    s,
  }));

  const polyline = pts.map(p => `${p.x},${p.y}`).join(" ");

  // shaded area under the line
  const areaPath =
    `M${pts[0].x},${H - PAD} ` +
    pts.map(p => `L${p.x},${p.y}`).join(" ") +
    ` L${pts[pts.length - 1].x},${H - PAD} Z`;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ display: "block", overflow: "visible" }}
    >
      {/* area fill */}
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={C.green} stopOpacity="0.15" />
          <stop offset="100%" stopColor={C.green} stopOpacity="0"    />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#chartGrad)" />
      {/* line */}
      <polyline
        points={polyline}
        fill="none"
        stroke={C.green}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* dots */}
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={p.isPR ? 5 : 3}
          fill={p.isPR ? C.orange : C.green}
          stroke="#fff"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ value, label, color }) {
  return (
    <div style={{
      flex: 1, background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 12, padding: "14px 10px", textAlign: "center",
    }}>
      <div style={{
        fontSize: 24, fontWeight: 700, color: color || C.text1, lineHeight: 1.1,
      }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: C.text2, marginTop: 3, fontWeight: 500 }}>
        {label}
      </div>
    </div>
  );
}

// ── Session log item ──────────────────────────────────────────────────────────

function SessionLogItem({ log, exercises }) {
  const [expanded, setExpanded] = useState(false);
  const exCount  = log.exercises?.length || 0;
  const dateLabel = formatDateLabel(log.date || log.completedAt || log.startedAt);
  const duration  = formatDuration(log.durationSecs);
  const dayLabel  = log.dayName || `Day ${(log.dayIdx ?? 0) + 1}`;

  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 14, overflow: "hidden",
    }}>
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: "100%", padding: "14px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "none", border: "none", cursor: "pointer", textAlign: "left",
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text1 }}>
            {dayLabel}
          </div>
          <div style={{ fontSize: 12, color: C.text2, marginTop: 2 }}>
            {dateLabel}
            {log.planId && ` · ${log.planId}`}
            {exCount > 0 && ` · ${exCount} exercises`}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: C.text2 }}>{duration}</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
            stroke={C.text3} strokeWidth="2" strokeLinecap="round">
            <path d={expanded ? "M3 9l4-4 4 4" : "M3 5l4 4 4-4"} />
          </svg>
        </div>
      </button>

      {expanded && log.exercises && (
        <div style={{
          borderTop: `1px solid ${C.border}`,
          padding: "10px 16px 14px",
        }}>
          {log.exercises.map((entry, i) => {
            const ex = exercises[entry.exId];
            const name = ex?.name || entry.exId;
            return (
              <div key={i} style={{ marginBottom: i < log.exercises.length - 1 ? 10 : 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text1 }}>
                  {name}
                </div>
                {entry.sets?.map((s, si) => (
                  <div key={si} style={{
                    fontSize: 12, color: C.text2,
                    marginTop: 2, display: "flex", gap: 8,
                  }}>
                    <span style={{ color: C.text3 }}>Set {si + 1}</span>
                    {s.weight && <span>{s.weight} lbs</span>}
                    {s.reps   && <span>× {s.reps} reps</span>}
                    {s.completed === false && (
                      <span style={{ color: C.red }}>incomplete</span>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function Progress({ store, exercises, plans }) {
  const [selectedExId, setSelectedExId]     = useState("");
  const [showAllPRs, setShowAllPRs]         = useState(false);
  const logs = store.logs || [];

  // Build list of exercises that have at least 1 history entry
  const exercisesWithHistory = useMemo(() => {
    return Object.values(exercises).filter(ex => {
      const hist = getExerciseHistory(logs, ex.id);
      return hist.length > 0;
    });
  }, [logs, exercises]);

  // PRs list
  const prs = useMemo(() => {
    return exercisesWithHistory
      .map(ex => ({ ex, pr: getPR(logs, ex.id) }))
      .filter(x => x.pr !== null)
      .sort((a, b) => b.pr.weight - a.pr.weight);
  }, [exercisesWithHistory, logs]);

  const displayedPRs = showAllPRs ? prs : prs.slice(0, 10);

  // Chart data
  const chartExercise = selectedExId
    ? exercises[selectedExId]
    : exercisesWithHistory[0] || null;
  const chartExId = chartExercise?.id || "";
  const chartHistory = useMemo(
    () => getExerciseHistory(logs, chartExId),
    [logs, chartExId]
  );
  const chartPR = getPR(logs, chartExId);

  // Session history (newest first)
  const sortedLogs = [...logs].reverse();

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
      paddingBottom: "calc(72px + env(safe-area-inset-bottom))",
    }}>

      {/* ── Sticky header ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: C.surface,
        borderBottom: `1px solid ${C.border}`,
        padding: "16px 16px 14px",
      }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: C.text1 }}>
          Progress
        </div>
      </div>

      <div style={{ padding: "16px 16px 0" }}>

        {/* ── Summary stats ── */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <StatCard value={logs.length}             label="Total Workouts" />
          <StatCard value={currentStreak(logs)}     label="Day Streak"     color={C.green} />
          <StatCard value={monthWorkouts(logs)}     label="This Month"     />
        </div>

        {/* ── Personal Records ── */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 16, padding: "16px",
          marginBottom: 16,
        }}>
          <div style={{
            fontSize: 15, fontWeight: 700, color: C.text1,
            marginBottom: prs.length ? 14 : 10,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span>Personal Records</span>
            <span style={{ fontSize: 18 }}>🏆</span>
          </div>

          {prs.length === 0 ? (
            <div style={{ fontSize: 13, color: C.text2, textAlign: "center", padding: "12px 0" }}>
              Complete some workouts to see your records here
            </div>
          ) : (
            <>
              {displayedPRs.map(({ ex, pr }) => (
                <div key={ex.id} style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: `1px solid ${C.border}`,
                }}>
                  <div style={{ fontSize: 14, color: C.text1, fontWeight: 500 }}>
                    {ex.name}
                  </div>
                  <div style={{
                    fontSize: 14, fontWeight: 700, color: C.orange,
                    background: C.orangeLight, padding: "3px 10px",
                    borderRadius: 20,
                  }}>
                    {pr.weight} × {pr.reps}
                  </div>
                </div>
              ))}

              {prs.length > 10 && (
                <button
                  onClick={() => setShowAllPRs(a => !a)}
                  style={{
                    marginTop: 12, width: "100%", padding: "9px 0",
                    borderRadius: 8, border: `1px solid ${C.border}`,
                    background: C.bg, color: C.text2, fontSize: 13,
                    fontWeight: 500, cursor: "pointer",
                  }}
                >
                  {showAllPRs ? "Show less" : `Show all ${prs.length}`}
                </button>
              )}
            </>
          )}
        </div>

        {/* ── Exercise History Chart ── */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 16, padding: "16px",
          marginBottom: 16,
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text1, marginBottom: 12 }}>
            Exercise Progress
          </div>

          {exercisesWithHistory.length === 0 ? (
            <div style={{ fontSize: 13, color: C.text2, textAlign: "center", padding: "16px 0" }}>
              Log some workouts to see progress charts
            </div>
          ) : (
            <>
              {/* Selector */}
              <select
                value={chartExId}
                onChange={e => setSelectedExId(e.target.value)}
                style={{
                  width: "100%", padding: "10px 12px", marginBottom: 14,
                  borderRadius: 8, border: `1px solid ${C.border}`,
                  background: C.bg, color: C.text1, fontSize: 14,
                  fontFamily: "inherit", outline: "none", cursor: "pointer",
                }}
              >
                {exercisesWithHistory.map(ex => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}
                  </option>
                ))}
              </select>

              {/* Chart */}
              <div style={{ padding: "4px 0 8px" }}>
                <LineChart
                  history={chartHistory}
                  prWeight={chartPR?.weight || Infinity}
                />
              </div>

              {/* Legend */}
              {chartHistory.length >= 2 && (
                <div style={{
                  display: "flex", gap: 16, marginTop: 4, justifyContent: "center",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%", background: C.green,
                    }} />
                    <span style={{ fontSize: 12, color: C.text2 }}>Session</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: "50%", background: C.orange,
                    }} />
                    <span style={{ fontSize: 12, color: C.text2 }}>PR</span>
                  </div>
                </div>
              )}

              {/* PR callout */}
              {chartPR && (
                <div style={{
                  marginTop: 12, padding: "10px 14px",
                  background: C.orangeLight, borderRadius: 10,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span style={{ fontSize: 13, color: C.orange, fontWeight: 600 }}>
                    Personal Record
                  </span>
                  <span style={{ fontSize: 13, color: C.orange, fontWeight: 700 }}>
                    {chartPR.weight} lbs × {chartPR.reps} reps
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Session History ── */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text1, marginBottom: 12 }}>
            Workout Log
          </div>

          {sortedLogs.length === 0 ? (
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 14, padding: "20px 16px", textAlign: "center",
            }}>
              <div style={{ fontSize: 13, color: C.text2 }}>
                No workouts logged yet
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {sortedLogs.map((log, i) => (
                <SessionLogItem
                  key={log.id || i}
                  log={log}
                  exercises={exercises}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
