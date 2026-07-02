import React, { useState, useMemo } from "react";
import { getExerciseHistory, getPR } from "../data/store.js";
import {
  getE1RMHistory, getWeeklySeries, getMuscleGroupSets,
  getTrainingCalendar, getConsistencyStats, formatTonnage,
} from "../data/analytics.js";
import { MUSCLE_GROUPS } from "../data/exercises.js";
import { useTheme, FONT } from "../theme.js";
import { useT, useLang } from "../i18n.js";

// Weekly hard-set target band per muscle group (hypertrophy guideline)
const SET_TARGET_MIN = 10;
const SET_TARGET_MAX = 20;
const CALENDAR_WEEKS = 12;

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDuration(secs) {
  if (!secs) return "—";
  return `${Math.floor(secs / 60)} min`;
}

function formatDateLabel(raw, t) {
  if (!raw) return "";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return "";
  const now  = new Date();
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return t("date.today");
  if (diff === 1) return t("date.yesterday");
  return d.toLocaleDateString(t("date.locale"), { month: "short", day: "numeric" });
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

// ── SVG Line Chart ─────────────────────────────────────────────────────────────

function LineChart({ points }) {
  const C = useTheme();
  const t = useT();
  const W = 300, H = 96, PAD = 10;
  const innerW = W - PAD * 2;
  const innerH = H - PAD * 2;

  const sessions = points.slice(-12);

  if (sessions.length < 2) {
    return (
      <div style={{
        height: 96, display: "flex", alignItems: "center", justifyContent: "center",
        color: C.text3, fontSize: 13,
      }}>
        {t("progress.chart_more")}
      </div>
    );
  }

  const values = sessions.map(s => s.value);
  const minV   = Math.min(...values);
  const maxV   = Math.max(...values);
  const range  = maxV - minV || 1;

  const pts = sessions.map((s, i) => ({
    x: PAD + (i / (sessions.length - 1)) * innerW,
    y: PAD + (1 - (s.value - minV) / range) * innerH,
    isBest: s.isBest,
  }));

  const polyline = pts.map(p => `${p.x},${p.y}`).join(" ");
  const areaPath =
    `M${pts[0].x},${H - PAD} ` +
    pts.map(p => `L${p.x},${p.y}`).join(" ") +
    ` L${pts[pts.length - 1].x},${H - PAD} Z`;

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ display: "block", overflow: "visible" }}
      >
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={C.green} stopOpacity="0.18" />
            <stop offset="100%" stopColor={C.green} stopOpacity="0"    />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#chartGrad)" />
        <polyline points={polyline} fill="none" stroke={C.green}
          strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y}
            r={p.isBest ? 5 : 3}
            fill={p.isBest ? C.orange : C.green}
            stroke={C.surface} strokeWidth="1.5"
          />
        ))}
      </svg>
      <div style={{
        display: "flex", justifyContent: "space-between",
        fontSize: 11, color: C.text3, marginTop: 4,
      }}>
        <span>{minV}</span>
        <span>{maxV}</span>
      </div>
    </div>
  );
}

// ── Weekly volume bar chart ────────────────────────────────────────────────────

function WeeklyVolumeChart({ weeks, locale }) {
  const C = useTheme();
  const maxT = Math.max(...weeks.map(w => w.tonnage), 1);

  return (
    <div>
      <div style={{
        display: "flex", alignItems: "flex-end", gap: 6,
        height: 110, marginBottom: 6,
      }}>
        {weeks.map((w, i) => {
          const isCurrent = i === weeks.length - 1;
          const h = w.tonnage > 0 ? Math.max((w.tonnage / maxT) * 100, 4) : 2;
          return (
            <div key={i} style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "flex-end", height: "100%",
            }}>
              {w.tonnage === maxT && w.tonnage > 0 && (
                <div style={{ fontSize: 10, fontWeight: 700, color: C.green, marginBottom: 3 }}>
                  {formatTonnage(w.tonnage)}
                </div>
              )}
              <div style={{
                width: "100%", height: `${h}%`,
                borderRadius: "5px 5px 2px 2px",
                background: w.tonnage > 0 ? C.green : C.border,
                opacity: w.tonnage > 0 ? (isCurrent ? 1 : 0.55) : 1,
              }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {weeks.map((w, i) => (
          <div key={i} style={{ flex: 1, fontSize: 9, color: C.text3, textAlign: "center" }}>
            {w.start.toLocaleDateString(locale, { month: "numeric", day: "numeric" })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Sets per muscle group ──────────────────────────────────────────────────────

function MuscleGroupBars({ setsByGroup }) {
  const C = useTheme();
  const t = useT();

  const rows = Object.entries(MUSCLE_GROUPS)
    .filter(([id]) => id !== "cardio")
    .map(([id]) => ({ id, sets: setsByGroup[id] || 0 }));

  const scaleMax = Math.max(SET_TARGET_MAX + 4, ...rows.map(r => r.sets));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {rows.map(({ id, sets }) => {
        const inBand   = sets >= SET_TARGET_MIN && sets <= SET_TARGET_MAX;
        const overBand = sets > SET_TARGET_MAX;
        const barColor = sets === 0 ? C.border : inBand ? C.green : overBand ? C.orange : C.green;
        return (
          <div key={id}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              fontSize: 12, marginBottom: 4,
            }}>
              <span style={{ color: C.text1, fontWeight: 600 }}>{t(`muscle.${id}`)}</span>
              <span style={{
                fontWeight: 700,
                color: sets === 0 ? C.text3 : inBand ? C.green : overBand ? C.orange : C.text2,
              }}>
                {sets % 1 === 0 ? sets : sets.toFixed(1)}
              </span>
            </div>
            <div style={{
              position: "relative", height: 10,
              background: C.surface2, borderRadius: 5, overflow: "hidden",
            }}>
              {/* target band */}
              <div style={{
                position: "absolute", top: 0, bottom: 0,
                left:  `${(SET_TARGET_MIN / scaleMax) * 100}%`,
                width: `${((SET_TARGET_MAX - SET_TARGET_MIN) / scaleMax) * 100}%`,
                background: C.greenLight,
              }} />
              <div style={{
                position: "absolute", top: 0, bottom: 0, left: 0,
                width: `${Math.min((sets / scaleMax) * 100, 100)}%`,
                background: barColor,
                borderRadius: 5,
                opacity: sets === 0 ? 0.6 : 0.85,
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Training calendar heatmap ──────────────────────────────────────────────────

function CalendarHeatmap({ weeks }) {
  const C = useTheme();

  function cellColor(day) {
    if (day.inFuture) return "transparent";
    if (day.sets === 0) return C.surface2;
    if (day.sets >= 18) return C.green;
    if (day.sets >= 10) return C.green + "B8";
    return C.green + "70";
  }

  return (
    <div style={{ display: "flex", gap: 3 }}>
      {weeks.map((week, wi) => (
        <div key={wi} style={{
          flex: 1, display: "flex", flexDirection: "column", gap: 3,
        }}>
          {week.map((day, di) => (
            <div key={di} style={{
              width: "100%", aspectRatio: "1",
              borderRadius: 3,
              background: cellColor(day),
              border: day.inFuture ? `1px dashed ${C.border}` : "none",
              boxSizing: "border-box",
            }} />
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Stat card ──────────────────────────────────────────────────────────────────

function StatCard({ value, label, color }) {
  const C = useTheme();
  return (
    <div style={{
      flex: 1, background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 12, padding: "14px 10px", textAlign: "center",
    }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: color || C.text1, lineHeight: 1.1 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: C.text2, marginTop: 3, fontWeight: 500 }}>
        {label}
      </div>
    </div>
  );
}

// ── Session log item ───────────────────────────────────────────────────────────

function SessionLogItem({ log, exercises, unit }) {
  const C = useTheme();
  const t = useT();
  const [expanded, setExpanded] = useState(false);
  const exCount   = log.exercises?.length || 0;
  const dateLabel = formatDateLabel(log.date || log.completedAt || log.startedAt, t);
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
          fontFamily: FONT,
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text1 }}>{dayLabel}</div>
          <div style={{ fontSize: 12, color: C.text2, marginTop: 2 }}>
            {dateLabel}
            {exCount > 0 && ` · ${exCount === 1 ? t("progress.exercises_1") : t("progress.exercises_n", { n: exCount })}`}
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
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "10px 16px 14px" }}>
          {log.exercises.map((entry, i) => {
            const ex   = exercises[entry.exId];
            const name = ex?.name || entry.exId;
            return (
              <div key={i} style={{ marginBottom: i < log.exercises.length - 1 ? 10 : 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text1 }}>{name}</div>
                {entry.sets?.map((s, si) => (
                  <div key={si} style={{
                    fontSize: 12, color: C.text2, marginTop: 2, display: "flex", gap: 8,
                  }}>
                    <span style={{ color: C.text3 }}>{t("progress.set_label")} {si + 1}</span>
                    {s.weight && <span>{s.weight} {unit}</span>}
                    {s.reps   && <span>× {s.reps} {t("exercise.reps_label")}</span>}
                    {s.completed === false && (
                      <span style={{ color: C.red }}>{t("progress.incomplete")}</span>
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

// ── Card shell ────────────────────────────────────────────────────────────────

function Card({ title, subtitle, children, style }) {
  const C = useTheme();
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 16, padding: "16px", marginBottom: 16, ...style,
    }}>
      {title && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text1 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 12, color: C.text2, marginTop: 2 }}>{subtitle}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

// ── Tab: Strength ─────────────────────────────────────────────────────────────

function StrengthTab({ logs, exercises, unit }) {
  const C = useTheme();
  const t = useT();
  const [selectedExId, setSelectedExId] = useState("");
  const [showAllPRs,   setShowAllPRs]   = useState(false);
  const [metric,       setMetric]       = useState("weight"); // "weight" | "e1rm"

  const exercisesWithHistory = useMemo(() => {
    return Object.values(exercises).filter(ex =>
      getExerciseHistory(logs, ex.id).length > 0
    );
  }, [logs, exercises]);

  const prs = useMemo(() => {
    return exercisesWithHistory
      .map(ex => ({ ex, pr: getPR(logs, ex.id) }))
      .filter(x => x.pr !== null)
      .sort((a, b) => b.pr.weight - a.pr.weight);
  }, [exercisesWithHistory, logs]);

  const displayedPRs = showAllPRs ? prs : prs.slice(0, 10);

  const chartExercise = selectedExId
    ? exercises[selectedExId]
    : exercisesWithHistory[0] || null;
  const chartExId = chartExercise?.id || "";
  const chartPR   = getPR(logs, chartExId);

  // One point per session: top-set weight, or best estimated 1RM
  const chartPoints = useMemo(() => {
    if (!chartExId) return [];
    if (metric === "e1rm") {
      const hist = getE1RMHistory(logs, chartExId);
      const best = Math.max(...hist.map(h => h.value), 0);
      return hist.map(h => ({ value: h.value, isBest: h.value === best }));
    }
    const bySession = new Map();
    for (const entry of getExerciseHistory(logs, chartExId)) {
      if (entry.weight <= 0) continue;
      const prev = bySession.get(entry.sessionId);
      if (!prev || entry.weight > prev) bySession.set(entry.sessionId, entry.weight);
    }
    const values = [...bySession.values()];
    return values.map(v => ({ value: v, isBest: chartPR ? v >= chartPR.weight : false }));
  }, [logs, chartExId, metric, chartPR]);

  return (
    <>
      {/* Personal Records */}
      <Card title={<span>{t("progress.personal_records")} <span style={{ fontSize: 18 }}>🏆</span></span>}>
        {prs.length === 0 ? (
          <div style={{ fontSize: 13, color: C.text2, textAlign: "center", padding: "12px 0" }}>
            {t("progress.no_prs")}
          </div>
        ) : (
          <>
            {displayedPRs.map(({ ex, pr }) => (
              <div key={ex.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: `1px solid ${C.border}`,
              }}>
                <div style={{ fontSize: 14, color: C.text1, fontWeight: 500 }}>{ex.name}</div>
                <div style={{
                  fontSize: 14, fontWeight: 700, color: C.orange,
                  background: C.orangeLight, padding: "3px 10px", borderRadius: 20,
                }}>
                  {pr.weight} × {pr.reps}
                </div>
              </div>
            ))}
            {prs.length > 10 && (
              <button
                onClick={() => setShowAllPRs(a => !a)}
                style={{
                  marginTop: 12, width: "100%", padding: "10px 0",
                  borderRadius: 8, border: `1px solid ${C.border}`,
                  background: C.surface2, color: C.text2, fontSize: 13,
                  fontWeight: 500, cursor: "pointer", fontFamily: FONT,
                }}
              >
                {showAllPRs ? t("progress.show_less") : t("progress.show_all", { n: prs.length })}
              </button>
            )}
          </>
        )}
      </Card>

      {/* Exercise History Chart */}
      <Card title={t("progress.exercise_progress")}>
        {exercisesWithHistory.length === 0 ? (
          <div style={{ fontSize: 13, color: C.text2, textAlign: "center", padding: "16px 0" }}>
            {t("progress.no_charts")}
          </div>
        ) : (
          <>
            <select
              value={chartExId}
              onChange={e => setSelectedExId(e.target.value)}
              style={{
                width: "100%", padding: "10px 12px", marginBottom: 10,
                borderRadius: 8, border: `1px solid ${C.border}`,
                background: C.surface2, color: C.text1, fontSize: 14,
                fontFamily: FONT, outline: "none", cursor: "pointer",
              }}
            >
              {exercisesWithHistory.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.name}</option>
              ))}
            </select>

            {/* Metric toggle */}
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {[
                { key: "weight", label: t("progress.metric_weight") },
                { key: "e1rm",   label: t("progress.metric_e1rm")   },
              ].map(opt => (
                <button key={opt.key} onClick={() => setMetric(opt.key)} style={{
                  flex: 1, padding: "8px 0", borderRadius: 8, cursor: "pointer",
                  fontSize: 13, fontWeight: 600, fontFamily: FONT,
                  background: metric === opt.key ? C.greenLight : C.surface2,
                  color:      metric === opt.key ? C.green : C.text2,
                  border: metric === opt.key ? `1.5px solid ${C.green}` : `1px solid ${C.border}`,
                  transition: "all 0.15s",
                }}>{opt.label}</button>
              ))}
            </div>

            <div style={{ padding: "4px 0 4px" }}>
              <LineChart points={chartPoints} />
            </div>

            {metric === "e1rm" && chartPoints.length >= 2 && (
              <div style={{ fontSize: 11, color: C.text3, textAlign: "center", marginTop: 6 }}>
                {t("progress.e1rm_hint")}
              </div>
            )}

            {chartPoints.length >= 2 && (
              <div style={{ display: "flex", gap: 16, marginTop: 8, justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green }} />
                  <span style={{ fontSize: 12, color: C.text2 }}>{t("progress.chart_session")}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: C.orange }} />
                  <span style={{ fontSize: 12, color: C.text2 }}>{t("progress.chart_pr")}</span>
                </div>
              </div>
            )}

            {chartPR && (
              <div style={{
                marginTop: 12, padding: "10px 14px",
                background: C.orangeLight, borderRadius: 10,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ fontSize: 13, color: C.orange, fontWeight: 600 }}>
                  {t("progress.personal_record")}
                </span>
                <span style={{ fontSize: 13, color: C.orange, fontWeight: 700 }}>
                  {chartPR.weight} {unit} × {chartPR.reps} {t("exercise.reps_label")}
                </span>
              </div>
            )}
          </>
        )}
      </Card>
    </>
  );
}

// ── Tab: Volume ───────────────────────────────────────────────────────────────

function VolumeTab({ logs, exercises, unit }) {
  const C = useTheme();
  const t = useT();

  const weeks       = useMemo(() => getWeeklySeries(logs, 8), [logs]);
  const setsByGroup = useMemo(() => getMuscleGroupSets(logs, exercises), [logs, exercises]);
  const hasVolume   = weeks.some(w => w.tonnage > 0);
  const hasSets     = Object.values(setsByGroup).some(v => v > 0);

  if (!hasVolume && !hasSets) {
    return (
      <Card>
        <div style={{ fontSize: 13, color: C.text2, textAlign: "center", padding: "16px 0" }}>
          {t("progress.no_volume")}
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card
        title={t("progress.weekly_volume")}
        subtitle={t("progress.weekly_volume_sub", { unit })}
      >
        <WeeklyVolumeChart weeks={weeks} locale={t("date.locale")} />
      </Card>

      <Card
        title={t("progress.muscle_sets")}
        subtitle={t("progress.muscle_sets_sub", { min: SET_TARGET_MIN, max: SET_TARGET_MAX })}
      >
        {hasSets ? (
          <MuscleGroupBars setsByGroup={setsByGroup} />
        ) : (
          <div style={{ fontSize: 13, color: C.text2, textAlign: "center", padding: "12px 0" }}>
            {t("progress.no_muscle_sets")}
          </div>
        )}
      </Card>
    </>
  );
}

// ── Tab: Consistency ──────────────────────────────────────────────────────────

function ConsistencyTab({ logs, exercises, unit }) {
  const C = useTheme();
  const t = useT();

  const calendar = useMemo(() => getTrainingCalendar(logs, CALENDAR_WEEKS), [logs]);
  const stats    = useMemo(() => getConsistencyStats(logs), [logs]);
  const sortedLogs = useMemo(() => [...logs].reverse(), [logs]);

  return (
    <>
      <Card
        title={t("progress.calendar")}
        subtitle={t("progress.calendar_sub", { n: CALENDAR_WEEKS })}
      >
        <CalendarHeatmap weeks={calendar} />
      </Card>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <StatCard
          value={stats.avgPerWeek ? stats.avgPerWeek.toFixed(1) : "0"}
          label={t("progress.avg_per_week")}
          color={C.green}
        />
        <StatCard value={stats.bestWeek} label={t("progress.best_week")} />
        <StatCard
          value={stats.avgDurationSecs ? Math.round(stats.avgDurationSecs / 60) : "—"}
          label={t("progress.avg_duration")}
        />
        <StatCard
          value={formatTonnage(stats.totalTonnage)}
          label={`${t("progress.total_volume")} (${unit})`}
        />
      </div>

      {/* Session History */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text1, marginBottom: 12 }}>
          {t("progress.workout_log")}
        </div>

        {sortedLogs.length === 0 ? (
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 14, padding: "20px 16px", textAlign: "center",
          }}>
            <div style={{ fontSize: 13, color: C.text2 }}>{t("progress.no_logs")}</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sortedLogs.map((log, i) => (
              <SessionLogItem key={log.id || i} log={log} exercises={exercises} unit={unit} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Progress({ store, exercises, plans, onOpenMenu }) {
  const C = useTheme();
  const t = useT();
  const [tab, setTab] = useState("strength");
  const logs = store.logs || [];
  const unit = store.unit || "lbs";

  const TABS = [
    { id: "strength",    label: t("progress.tab_strength")    },
    { id: "volume",      label: t("progress.tab_volume")      },
    { id: "consistency", label: t("progress.tab_consistency") },
  ];

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
        <div style={{ fontSize: 20, fontWeight: 700, color: C.text1 }}>{t("progress.title")}</div>
      </div>

      <div style={{ padding: "16px 16px 0" }}>

        {/* Summary stats */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <StatCard value={logs.length}         label={t("progress.total_workouts")} />
          <StatCard value={currentStreak(logs)} label={t("progress.day_streak")}     color={C.green} />
          <StatCard value={monthWorkouts(logs)} label={t("progress.this_month")} />
        </div>

        {/* Tab bar */}
        <div style={{
          display: "flex", gap: 4, marginBottom: 16,
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 12, padding: 4,
        }}>
          {TABS.map(item => {
            const isActive = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                style={{
                  flex: 1, padding: "9px 0", borderRadius: 9, cursor: "pointer",
                  fontSize: 13, fontWeight: 600, fontFamily: FONT,
                  background: isActive ? C.greenLight : "transparent",
                  color:      isActive ? C.green : C.text2,
                  border: "none",
                  transition: "all 0.15s",
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {tab === "strength"    && <StrengthTab    logs={logs} exercises={exercises} unit={unit} />}
        {tab === "volume"      && <VolumeTab      logs={logs} exercises={exercises} unit={unit} />}
        {tab === "consistency" && <ConsistencyTab logs={logs} exercises={exercises} unit={unit} />}

      </div>
    </div>
  );
}
