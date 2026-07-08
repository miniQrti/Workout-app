import type { Settings, WorkoutLog } from "../types";
import { addDays, dayKey, parseDate, startOfDay, weekStart } from "../lib/dates";
import { EXERCISES } from "../data/exercises";
import { getExercise } from "../data/exerciseResolver";
import { muscleGroupOf } from "../data/muscles";
import type { MuscleGroupId } from "../types";

// ── Training analytics (all weights kg) ───────────────────────────────────────

function workSets(log: WorkoutLog) {
  return log.exercises.flatMap((e) => e.sets.filter((s) => s.completed && s.reps >= 1));
}

function logDate(log: WorkoutLog): Date | null {
  return parseDate(log.completedAt) ?? parseDate(log.startedAt);
}

/** Total weight moved in a session (Σ kg × reps over completed sets). */
export function sessionTonnageKg(log: WorkoutLog): number {
  let total = 0;
  for (const s of workSets(log)) {
    if (s.weightKg !== null) total += s.weightKg * s.reps;
  }
  return total;
}

// ── Weekly series ─────────────────────────────────────────────────────────────

export interface WeekAgg {
  start: Date;
  sessions: number;
  sets: number;
  tonnageKg: number;
  durationSecs: number;
}

/** Per-week aggregates for the last `numWeeks` calendar weeks, oldest first. */
export function weeklySeries(logs: WorkoutLog[], numWeeks = 8): WeekAgg[] {
  const thisWeek = weekStart(new Date());
  const weeks: WeekAgg[] = [];
  const byTime = new Map<number, WeekAgg>();
  for (let i = numWeeks - 1; i >= 0; i--) {
    const start = addDays(thisWeek, -i * 7);
    const agg: WeekAgg = { start, sessions: 0, sets: 0, tonnageKg: 0, durationSecs: 0 };
    weeks.push(agg);
    byTime.set(start.getTime(), agg);
  }
  for (const log of logs) {
    const d = logDate(log);
    if (!d) continue;
    const agg = byTime.get(weekStart(d).getTime());
    if (!agg) continue;
    agg.sessions += 1;
    agg.sets += workSets(log).length;
    agg.tonnageKg += sessionTonnageKg(log);
    agg.durationSecs += log.durationSecs;
  }
  return weeks;
}

// ── Sets per muscle group ─────────────────────────────────────────────────────

/**
 * Completed sets per broad muscle group within one calendar week.
 * Primary muscle gets full credit, each distinct secondary group half — the
 * common fractional-volume convention.
 */
export function muscleGroupSets(
  logs: WorkoutLog[],
  start: Date = weekStart(new Date()),
  settings?: Settings
): Partial<Record<MuscleGroupId, number>> {
  const end = addDays(start, 7);
  const totals: Partial<Record<MuscleGroupId, number>> = {};

  for (const log of logs) {
    const d = logDate(log);
    if (!d || d < start || d >= end) continue;
    for (const entry of log.exercises) {
      const ex = settings ? getExercise(entry.exerciseId, settings) : EXERCISES[entry.exerciseId];
      if (!ex) continue;
      const n = entry.sets.filter((s) => s.completed && s.reps >= 1).length;
      if (n === 0) continue;

      const primary = muscleGroupOf(ex.primaryMuscle);
      totals[primary] = (totals[primary] ?? 0) + n;

      const secondaries = new Set(
        ex.muscles.filter((m) => m !== ex.primaryMuscle).map(muscleGroupOf)
      );
      secondaries.delete(primary);
      for (const g of secondaries) totals[g] = (totals[g] ?? 0) + n * 0.5;
    }
  }
  return totals;
}

// ── Training calendar ─────────────────────────────────────────────────────────

export interface CalendarDay {
  date: Date;
  sets: number;
  inFuture: boolean;
}

/** Full Mon–Sun weeks for the heatmap, oldest first. */
export function trainingCalendar(logs: WorkoutLog[], numWeeks = 12): CalendarDay[][] {
  const today = startOfDay(new Date());
  const first = addDays(weekStart(today), -(numWeeks - 1) * 7);

  const setsByDay = new Map<string, number>();
  for (const log of logs) {
    const d = logDate(log);
    if (!d) continue;
    const key = dayKey(d);
    setsByDay.set(key, (setsByDay.get(key) ?? 0) + Math.max(workSets(log).length, 1));
  }

  const weeks: CalendarDay[][] = [];
  for (let w = 0; w < numWeeks; w++) {
    const week: CalendarDay[] = [];
    for (let day = 0; day < 7; day++) {
      const date = addDays(first, w * 7 + day);
      week.push({ date, sets: setsByDay.get(dayKey(date)) ?? 0, inFuture: date > today });
    }
    weeks.push(week);
  }
  return weeks;
}

// ── Consistency ───────────────────────────────────────────────────────────────

export interface ConsistencyStats {
  totalWorkouts: number;
  totalTonnageKg: number;
  avgDurationSecs: number;
  avgPerWeek: number;
  bestWeek: number;
  /** Consecutive calendar weeks (incl. this one or last one) with ≥1 workout. */
  weekStreak: number;
}

export function consistencyStats(logs: WorkoutLog[]): ConsistencyStats {
  let totalTonnageKg = 0;
  let durSum = 0;
  let durCount = 0;
  const weekCounts = new Map<number, number>();
  let totalWorkouts = 0;

  for (const log of logs) {
    const d = logDate(log);
    if (!d) continue;
    totalWorkouts++;
    totalTonnageKg += sessionTonnageKg(log);
    if (log.durationSecs > 0) { durSum += log.durationSecs; durCount++; }
    const wk = weekStart(d).getTime();
    weekCounts.set(wk, (weekCounts.get(wk) ?? 0) + 1);
  }

  let avgPerWeek = 0;
  if (weekCounts.size > 0) {
    const firstWeek = Math.min(...weekCounts.keys());
    const span = Math.max(1, Math.round((weekStart(new Date()).getTime() - firstWeek) / (7 * 86400000)) + 1);
    avgPerWeek = totalWorkouts / span;
  }

  // Week streak: walk back from this week; a gap in the current week doesn't
  // break the streak (the week isn't over yet).
  let weekStreak = 0;
  let cursor = weekStart(new Date());
  if (!weekCounts.has(cursor.getTime())) cursor = addDays(cursor, -7);
  while (weekCounts.has(cursor.getTime())) {
    weekStreak++;
    cursor = addDays(cursor, -7);
  }

  return {
    totalWorkouts,
    totalTonnageKg,
    avgDurationSecs: durCount ? Math.round(durSum / durCount) : 0,
    avgPerWeek,
    bestWeek: weekCounts.size ? Math.max(...weekCounts.values()) : 0,
    weekStreak,
  };
}

/** Workouts in the current calendar month. */
export function monthWorkouts(logs: WorkoutLog[]): number {
  const now = new Date();
  return logs.filter((l) => {
    const d = logDate(l);
    return d && d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;
}

/** Workouts in the current calendar week. */
export function thisWeekWorkouts(logs: WorkoutLog[]): number {
  const start = weekStart(new Date());
  const end = addDays(start, 7);
  return logs.filter((l) => {
    const d = logDate(l);
    return d && d >= start && d < end;
  }).length;
}
