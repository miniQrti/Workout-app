import { useMemo, useState } from "react";
import { useApp } from "../store/appState";
import { resolveExerciseName } from "../data/exerciseResolver";
import { MUSCLE_GROUPS } from "../data/muscles";
import { allPRs } from "../store/selectors";
import {
  consistencyStats, monthWorkouts, muscleGroupSets, trainingCalendar, weeklySeries,
} from "../store/analytics";
import type { WorkoutLog } from "../types";
import { displayWeight, formatCompact, fromKg } from "../lib/units";
import { parseDate } from "../lib/dates";
import { localeOf, useLang } from "../i18n";
import { Card, Chip, EmptyState, PageHeader, Segmented, StatCard, StatRow, Button } from "../ui/kit";
import { Heatmap, LineChart, WeeklyBars } from "../components/charts";
import { IconChevronDown, IconChevronUp } from "../ui/icons";

const SET_TARGET_MIN = 10;
const SET_TARGET_MAX = 20;
const CALENDAR_WEEKS = 12;

type Tab = "strength" | "volume" | "consistency";

// ── Strength ──────────────────────────────────────────────────────────────────

function StrengthTab() {
  const { state, index } = useApp();
  const { t } = useLang();
  const unit = state.settings.unit;

  const [selectedId, setSelectedId] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [metric, setMetric] = useState<"weight" | "e1rm">("weight");

  const prs = useMemo(
    () =>
      [...allPRs(index).entries()].sort((a, b) => b[1].weightKg - a[1].weightKg),
    [index]
  );
  const shown = showAll ? prs : prs.slice(0, 10);

  const chartId = selectedId || prs[0]?.[0] || "";
  const points = useMemo(() => {
    const entries = index.get(chartId) ?? [];
    const values = entries
      .map((e) => (metric === "e1rm" ? e.bestE1RMKg : e.topWeightKg))
      .filter((v): v is number => v !== null)
      .map((kg) => fromKg(kg, unit));
    const best = Math.max(...values, 0);
    return values.map((v) => ({ value: v, isBest: v === best }));
  }, [index, chartId, metric, unit]);

  const chartPR = chartId ? allPRs(index).get(chartId) : undefined;

  return (
    <>
      <Card title={<span>{t("progress.prs")} 🏆</span>}>
        {prs.length === 0 ? (
          <EmptyState>{t("progress.no_prs")}</EmptyState>
        ) : (
          <>
            {shown.map(([exId, pr]) => (
              <div key={exId} className="row" style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{resolveExerciseName(exId, state.settings)}</span>
                <Chip tone="gold">{displayWeight(pr.weightKg, unit)} × {pr.reps}</Chip>
              </div>
            ))}
            {prs.length > 10 && (
              <Button block small style={{ marginTop: 12 }} onClick={() => setShowAll((s) => !s)}>
                {showAll ? t("progress.show_less") : t("progress.show_all", { n: prs.length })}
              </Button>
            )}
          </>
        )}
      </Card>

      <Card title={t("progress.chart")}>
        {prs.length === 0 ? (
          <EmptyState>{t("progress.no_data")}</EmptyState>
        ) : (
          <>
            <select className="select" value={chartId} onChange={(e) => setSelectedId(e.target.value)} style={{ marginBottom: 10 }}>
              {prs.map(([exId]) => (
                <option key={exId} value={exId}>{resolveExerciseName(exId, state.settings)}</option>
              ))}
            </select>

            <div style={{ marginBottom: 12 }}>
              <Segmented
                options={[
                  { value: "weight", label: t("progress.metric_weight") },
                  { value: "e1rm", label: t("progress.metric_e1rm") },
                ]}
                value={metric}
                onChange={setMetric}
              />
            </div>

            <LineChart points={points} />

            {metric === "e1rm" && points.length >= 2 && (
              <div style={{ fontSize: 11, color: "var(--text-3)", textAlign: "center", marginTop: 6 }}>
                {t("progress.e1rm_hint")}
              </div>
            )}

            {points.length >= 2 && (
              <div style={{ display: "flex", gap: 16, marginTop: 8, justifyContent: "center", fontSize: 12, color: "var(--text-2)" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)" }} />
                  {t("progress.session")}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--gold)" }} />
                  {t("progress.pr")}
                </span>
              </div>
            )}

            {chartPR && (
              <div className="row" style={{ marginTop: 12, padding: "10px 14px", background: "var(--gold-soft)", borderRadius: 10 }}>
                <span style={{ fontSize: 13, color: "var(--gold)", fontWeight: 600 }}>{t("progress.pr")}</span>
                <span style={{ fontSize: 13, color: "var(--gold)", fontWeight: 700 }}>
                  {displayWeight(chartPR.weightKg, unit)} {unit} × {chartPR.reps}
                </span>
              </div>
            )}
          </>
        )}
      </Card>
    </>
  );
}

// ── Volume ────────────────────────────────────────────────────────────────────

function VolumeTab() {
  const { state } = useApp();
  const { t, lang } = useLang();
  const unit = state.settings.unit;
  const logs = state.logs;

  const weeks = useMemo(() => weeklySeries(logs, 8), [logs]);
  const setsByGroup = useMemo(() => muscleGroupSets(logs, undefined, state.settings), [logs, state.settings]);
  const hasVolume = weeks.some((w) => w.tonnageKg > 0);
  const hasSets = Object.values(setsByGroup).some((v) => (v ?? 0) > 0);

  if (!hasVolume && !hasSets) {
    return <Card><EmptyState>{t("progress.no_data")}</EmptyState></Card>;
  }

  const rows = MUSCLE_GROUPS.filter((g) => g !== "cardio").map((g) => ({
    id: g,
    sets: setsByGroup[g] ?? 0,
  }));
  const scaleMax = Math.max(SET_TARGET_MAX + 4, ...rows.map((r) => r.sets));

  return (
    <>
      <Card title={t("progress.weekly_volume")} subtitle={t("progress.weekly_volume_sub", { unit })}>
        <WeeklyBars weeks={weeks} locale={localeOf(lang)} valueOf={(w) => Math.round(fromKg(w.tonnageKg, unit))} />
      </Card>

      <Card
        title={t("progress.muscle_sets")}
        subtitle={t("progress.muscle_sets_sub", { min: SET_TARGET_MIN, max: SET_TARGET_MAX })}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rows.map(({ id, sets }) => {
            const inBand = sets >= SET_TARGET_MIN && sets <= SET_TARGET_MAX;
            const over = sets > SET_TARGET_MAX;
            const color = sets === 0 ? "var(--border)" : over ? "var(--gold)" : "var(--accent)";
            return (
              <div key={id}>
                <div className="row" style={{ fontSize: 12, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>{t(`muscle.${id}`)}</span>
                  <span style={{
                    fontWeight: 700,
                    color: sets === 0 ? "var(--text-3)" : inBand ? "var(--accent)" : over ? "var(--gold)" : "var(--text-2)",
                  }}>
                    {sets % 1 === 0 ? sets : sets.toFixed(1)}
                  </span>
                </div>
                <div className="meter">
                  <div className="band" style={{
                    left: `${(SET_TARGET_MIN / scaleMax) * 100}%`,
                    width: `${((SET_TARGET_MAX - SET_TARGET_MIN) / scaleMax) * 100}%`,
                  }} />
                  <div className="fill" style={{
                    width: `${Math.min((sets / scaleMax) * 100, 100)}%`,
                    background: color,
                    opacity: sets === 0 ? 0.6 : 0.85,
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </>
  );
}

// ── Consistency ───────────────────────────────────────────────────────────────

function LogItem({ log }: { log: WorkoutLog }) {
  const { state } = useApp();
  const { t, lang } = useLang();
  const unit = state.settings.unit;
  const [open, setOpen] = useState(false);
  const d = parseDate(log.completedAt) ?? parseDate(log.startedAt);

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <button onClick={() => setOpen((o) => !o)}
        style={{ width: "100%", padding: "14px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>{log.dayName}</div>
          <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>
            {d?.toLocaleDateString(localeOf(lang), { month: "short", day: "numeric" })}
            {" · "}{t("common.exercises", { count: log.exercises.length })}
          </div>
        </div>
        <span style={{ fontSize: 13, color: "var(--text-2)" }}>
          {log.durationSecs ? `${Math.round(log.durationSecs / 60)} ${t("common.min")}` : ""}
        </span>
        <span style={{ color: "var(--text-3)" }}>{open ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}</span>
      </button>
      {open && (
        <div style={{ borderTop: "1px solid var(--border)", padding: "10px 16px 14px" }}>
          {log.exercises.map((ex, i) => (
            <div key={i} style={{ marginBottom: i < log.exercises.length - 1 ? 10 : 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{resolveExerciseName(ex.exerciseId, state.settings, ex.nameSnapshot)}</div>
              {ex.sets.map((s, si) => (
                <div key={si} style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2, display: "flex", gap: 8 }}>
                  <span style={{ color: "var(--text-3)" }}>{t("workout.set")} {si + 1}</span>
                  {s.weightKg !== null && <span>{displayWeight(s.weightKg, unit)} {unit}</span>}
                  <span>× {s.reps}</span>
                  {!s.completed && <span style={{ color: "var(--red)" }}>{t("progress.incomplete")}</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ConsistencyTab() {
  const { state } = useApp();
  const { t } = useLang();
  const unit = state.settings.unit;
  const logs = state.logs;

  const calendar = useMemo(() => trainingCalendar(logs, CALENDAR_WEEKS), [logs]);
  const stats = useMemo(() => consistencyStats(logs), [logs]);
  const sorted = useMemo(() => [...logs].reverse(), [logs]);

  return (
    <>
      <Card title={t("progress.calendar")} subtitle={t("progress.calendar_sub", { n: CALENDAR_WEEKS })}>
        <Heatmap weeks={calendar} />
      </Card>

      <StatRow>
        <StatCard accent value={stats.avgPerWeek ? stats.avgPerWeek.toFixed(1) : "0"} label={t("progress.avg_week")} />
        <StatCard value={stats.bestWeek} label={t("progress.best_week")} />
        <StatCard value={stats.avgDurationSecs ? Math.round(stats.avgDurationSecs / 60) : "—"} label={t("progress.avg_mins")} />
        <StatCard value={formatCompact(fromKg(stats.totalTonnageKg, unit))} label={`${t("progress.total_volume")} (${unit})`} />
      </StatRow>

      <div>
        <div className="card-title" style={{ marginBottom: 8 }}>{t("progress.log")}</div>
        {sorted.length === 0 ? (
          <Card><EmptyState>{t("progress.no_logs")}</EmptyState></Card>
        ) : (
          <div className="fade-list">
            {sorted.map((log) => <LogItem key={log.id} log={log} />)}
          </div>
        )}
      </div>
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Progress() {
  const { state } = useApp();
  const { t } = useLang();
  const [tab, setTab] = useState<Tab>("strength");
  const logs = state.logs;

  const stats = useMemo(() => consistencyStats(logs), [logs]);

  return (
    <div className="page">
      <PageHeader title={t("progress.title")} />
      <div className="page-body">
        <StatRow>
          <StatCard value={stats.totalWorkouts} label={t("progress.total")} />
          <StatCard accent value={stats.weekStreak} label={t("progress.streak")} />
          <StatCard value={monthWorkouts(logs)} label={t("progress.month")} />
        </StatRow>

        <Segmented
          options={[
            { value: "strength", label: t("progress.tab_strength") },
            { value: "volume", label: t("progress.tab_volume") },
            { value: "consistency", label: t("progress.tab_consistency") },
          ]}
          value={tab}
          onChange={setTab}
        />

        {tab === "strength" && <StrengthTab />}
        {tab === "volume" && <VolumeTab />}
        {tab === "consistency" && <ConsistencyTab />}
      </div>
    </div>
  );
}
