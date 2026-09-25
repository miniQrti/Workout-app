import { useMemo, useState } from "react";
import { useApp } from "../store/appState";
import { resolveExerciseName } from "../data/exerciseResolver";
import { MUSCLE_GROUPS } from "../data/muscles";
import { allPRs } from "../store/selectors";
import { consistencyStats, monthWorkouts, muscleGroupSets, trainingCalendar, weeklySeries } from "../store/analytics";
import type { WorkoutLog } from "../types";
import { displayWeight, formatCompact, fromKg } from "../lib/units";
import { parseDate } from "../lib/dates";
import { localeOf, useLang } from "../i18n";
import { Card, Chip, EmptyState, PageHeader, Segmented, StatCard, StatRow, Button } from "../ui/kit";
import { Heatmap, LineChart, WeeklyBars } from "../components/charts";
import { IconChevronDown, IconChevronUp } from "../ui/icons";

const CALENDAR_WEEKS = 12;
type Tab = "overview" | "exercises" | "history";
type Metric = "weight" | "e1rm";

function Overview({ onHistory, onExercises }: { onHistory: () => void; onExercises: () => void }) {
  const { state, index } = useApp();
  const { t, lang } = useLang();
  const logs = state.logs;
  const unit = state.settings.unit;
  const stats = useMemo(() => consistencyStats(logs), [logs]);
  const weeks = useMemo(() => weeklySeries(logs, 8), [logs]);
  const calendar = useMemo(() => trainingCalendar(logs, CALENDAR_WEEKS), [logs]);
  const setsByGroup = useMemo(() => muscleGroupSets(logs, undefined, state.settings), [logs, state.settings]);
  const recordCount = useMemo(() => allPRs(index).size, [index]);
  const [weeklyMetric, setWeeklyMetric] = useState<"sessions" | "load">("sessions");
  const recent = [...logs].sort((a, b) => (b.completedAt || b.startedAt).localeCompare(a.completedAt || a.startedAt))[0];

  if (logs.length === 0) {
    return <Card><EmptyState>{t("progress.empty_overview")}</EmptyState></Card>;
  }

  return <>
    <div className="progress-hero">
      <div className="progress-eyebrow">{t("progress.this_month")}</div>
      <div className="progress-hero-number">{monthWorkouts(logs)} <span>{t("progress.workouts")}</span></div>
      <div className="progress-hero-detail">{t("progress.total_summary", { count: stats.totalWorkouts, streak: stats.weekStreak })}</div>
    </div>
    <div className="progress-shortcuts">
      <button type="button" onClick={onExercises}><strong>{recordCount}</strong><span>{t("progress.records_shortcut")} →</span></button>
      <button type="button" onClick={onHistory}><strong>{recent ? (parseDate(recent.completedAt) ?? parseDate(recent.startedAt))?.toLocaleDateString(localeOf(lang), { month: "short", day: "numeric" }) : "—"}</strong><span>{t("progress.latest_shortcut")} →</span></button>
    </div>
    <Card title={t("progress.weekly_activity")} subtitle={t("progress.last_eight_weeks")}>
      <div className="progress-inline-switch">
        <Segmented options={[{ value: "sessions", label: t("progress.workouts") }, { value: "load", label: t("progress.metric_load") }]}
          value={weeklyMetric} onChange={setWeeklyMetric} />
      </div>
      <WeeklyBars weeks={weeks} locale={localeOf(lang)} valueOf={weeklyMetric === "sessions" ? (w) => w.sessions : (w) => Math.round(fromKg(w.tonnageKg, unit))}
        valueLabel={weeklyMetric === "sessions" ? t("progress.workouts") : unit} />
      <p className="progress-note">{weeklyMetric === "load" ? t("progress.load_explanation", { unit }) : t("progress.sessions_explanation")}</p>
    </Card>
    <Card title={t("progress.calendar")} subtitle={t("progress.calendar_sub", { n: CALENDAR_WEEKS })}>
      <Heatmap weeks={calendar} />
      <p className="progress-note">{t("progress.calendar_hint")}</p>
    </Card>
    <Card title={t("progress.muscle_sets")} subtitle={t("progress.muscle_sets_simple")}>
      <div className="progress-muscles">
        {MUSCLE_GROUPS.filter((g) => g !== "cardio").map((g) => {
          const sets = setsByGroup[g] ?? 0;
          return <div className="progress-muscle" key={g}>
            <span>{t(`muscle.${g}`)}</span>
            <div className="progress-muscle-track"><div style={{ width: `${Math.min(sets / 20, 1) * 100}%` }} /></div>
            <strong>{Number.isInteger(sets) ? sets : sets.toFixed(1)}</strong>
          </div>;
        })}
      </div>
      <p className="progress-note">{t("progress.muscle_explanation")}</p>
    </Card>
    <StatRow>
      <StatCard value={stats.avgPerWeek.toFixed(1)} label={t("progress.avg_week")} />
      <StatCard value={stats.avgDurationSecs ? Math.round(stats.avgDurationSecs / 60) : "—"} label={t("progress.avg_mins")} />
      <StatCard value={formatCompact(fromKg(stats.totalTonnageKg, unit))} label={`${t("progress.total_volume")} (${unit})`} />
    </StatRow>
  </>;
}

function Exercises() {
  const { state, index } = useApp();
  const { t, lang } = useLang();
  const unit = state.settings.unit;
  const records = useMemo(() => allPRs(index), [index]);
  const exercises = useMemo(() => [...index.keys()].sort((a, b) => resolveExerciseName(a, state.settings).localeCompare(resolveExerciseName(b, state.settings), localeOf(lang))), [index, state.settings, lang]);
  const [selectedId, setSelectedId] = useState("");
  const [metric, setMetric] = useState<Metric>("weight");
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const mostRecentId = [...index.entries()].sort((a, b) => (b[1].at(-1)?.date.getTime() ?? 0) - (a[1].at(-1)?.date.getTime() ?? 0))[0]?.[0];
  const chartId = exercises.includes(selectedId) ? selectedId : mostRecentId ?? "";
  const entries = index.get(chartId) ?? [];
  const sessions = entries.flatMap((entry) => {
    const kg = metric === "weight" ? entry.topWeightKg : entry.bestE1RMKg;
    return kg === null ? [] : [{ value: fromKg(kg, unit), kg, isBest: false, label: entry.date.toLocaleDateString(localeOf(lang), { month: "short", day: "numeric" }) }];
  }).slice(-12);
  const best = Math.max(...sessions.map((s) => s.value), 0);
  const points = sessions.map((s) => ({ ...s, isBest: s.value === best }));
  const active = Math.min(selectedSession ?? points.length - 1, points.length - 1);
  const pr = records.get(chartId);

  if (!exercises.length) return <Card><EmptyState>{t("progress.no_prs")}</EmptyState></Card>;

  return <>
    <Card title={t("progress.chart")} subtitle={t("progress.exercise_intro")}>
      <label className="progress-field-label" htmlFor="progress-exercise">{t("progress.choose_exercise")}</label>
      <select id="progress-exercise" className="select" value={chartId} onChange={(e) => { setSelectedId(e.target.value); setSelectedSession(null); }}>
        {exercises.map((id) => <option key={id} value={id}>{resolveExerciseName(id, state.settings)}</option>)}
      </select>
      <div className="progress-inline-switch">
        <Segmented options={[{ value: "weight", label: t("progress.metric_weight") }, { value: "e1rm", label: t("progress.metric_e1rm") }]}
          value={metric} onChange={(next) => { setMetric(next); setSelectedSession(null); }} />
      </div>
      {points.length > 0 && <div className="progress-chart-value" aria-live="polite">
        <strong>{metric === "weight" ? displayWeight(sessions[active]!.kg, unit) : Number(sessions[active]!.value.toFixed(1))} {unit}</strong>
        <span>{sessions[active]!.label} · {t(metric === "weight" ? "progress.metric_weight" : "progress.metric_e1rm")}</span>
      </div>}
      <LineChart points={points} selectedIndex={active} onSelect={setSelectedSession} />
      <p className="progress-note">{t(metric === "weight" ? "progress.weight_hint" : "progress.e1rm_hint")}</p>
    </Card>
    {pr && <Card title={t("progress.prs")}>
      <div className="progress-record"><strong>{displayWeight(pr.weightKg, unit)} {unit} × {pr.reps}</strong>
        <span>{pr.date.toLocaleDateString(localeOf(lang), { dateStyle: "medium" })}</span></div>
      <p className="progress-note">{t("progress.pr_explanation")}</p>
    </Card>}
  </>;
}

function LogItem({ log }: { log: WorkoutLog }) {
  const { state } = useApp();
  const { t, lang } = useLang();
  const unit = state.settings.unit;
  const [open, setOpen] = useState(false);
  const d = parseDate(log.completedAt) ?? parseDate(log.startedAt);
  const completed = log.exercises.filter((ex) => ex.sets.some((s) => s.completed)).length;

  return <div className="card progress-log-item">
    <button type="button" className="progress-log-toggle" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
      <span className="progress-log-main"><strong>{log.dayName}</strong>
        <span>{d?.toLocaleDateString(localeOf(lang), { dateStyle: "medium" })} · {t("common.exercises", { count: completed })}{log.durationSecs ? ` · ${Math.round(log.durationSecs / 60)} ${t("common.min")}` : ""}</span></span>
      {log.completedEarly && <Chip tone="gold">{t("progress.incomplete")}</Chip>}
      {open ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
    </button>
    {open && <div className="progress-log-details">
      {log.exercises.map((ex, i) => <div key={i} className="progress-log-exercise">
        <strong>{resolveExerciseName(ex.exerciseId, state.settings, ex.nameSnapshot)}</strong>
        {ex.sets.every((s) => !s.completed) && ex.plannedSets ? <span>{t("progress.skipped_sets", { count: ex.plannedSets })}</span> : null}
        {ex.sets.map((s, si) => <div key={si} className="progress-log-set">
          <span>{t("workout.set")} {si + 1}</span>
          <span>{s.weightKg !== null ? `${displayWeight(s.weightKg, unit)} ${unit} × ` : ""}{s.reps}</span>
          {!s.completed && <span>{t("progress.incomplete")}</span>}
        </div>)}
        {ex.plannedSets !== undefined && ex.plannedSets > ex.sets.length && ex.sets.some((s) => s.completed) && <span>{t("progress.skipped_sets", { count: ex.plannedSets - ex.sets.length })}</span>}
      </div>)}
    </div>}
  </div>;
}

function History() {
  const { state } = useApp();
  const { t } = useLang();
  const [filter, setFilter] = useState<"all" | "incomplete">("all");
  const [visible, setVisible] = useState(10);
  const sorted = useMemo(() => [...state.logs].sort((a, b) => (b.completedAt || b.startedAt).localeCompare(a.completedAt || a.startedAt)), [state.logs]);
  const filtered = filter === "incomplete" ? sorted.filter((log) => log.completedEarly) : sorted;

  return <>
    <div className="progress-history-header">
      <div><strong>{t("progress.log")}</strong><span>{t("progress.history_count", { count: filtered.length })}</span></div>
      <select className="select" aria-label={t("progress.history_filter")} value={filter} onChange={(e) => { setFilter(e.target.value as "all" | "incomplete"); setVisible(10); }}>
        <option value="all">{t("progress.filter_all")}</option><option value="incomplete">{t("progress.filter_incomplete")}</option>
      </select>
    </div>
    {filtered.length ? <div className="fade-list">{filtered.slice(0, visible).map((log) => <LogItem key={log.id} log={log} />)}</div>
      : <Card><EmptyState>{t(filter === "all" ? "progress.no_logs" : "progress.no_incomplete")}</EmptyState></Card>}
    {filtered.length > visible && <Button block onClick={() => setVisible((n) => n + 10)}>{t("progress.show_more")}</Button>}
  </>;
}

export default function Progress() {
  const { t } = useLang();
  const [tab, setTab] = useState<Tab>("overview");
  return <div className="page">
    <PageHeader title={t("progress.title")} />
    <div className="page-body">
      <nav className="progress-nav" aria-label={t("progress.sections")}>
        {(["overview", "exercises", "history"] as const).map((id) => <button key={id} type="button" className={tab === id ? "active" : ""} aria-current={tab === id ? "page" : undefined} onClick={() => setTab(id)}>{t(`progress.section_${id}`)}</button>)}
      </nav>
      {tab === "overview" && <Overview onHistory={() => setTab("history")} onExercises={() => setTab("exercises")} />}
      {tab === "exercises" && <Exercises />}
      {tab === "history" && <History />}
    </div>
  </div>;
}
