import type { Plan, RotationSlot, WorkoutLog } from "../types";
import { addDays, dayKey, parseDate, startOfDay, weekStart } from "../lib/dates";

// ── Weekly schedule awareness ─────────────────────────────────────────────────
//
// Every built-in plan has a 7-slot rotation, anchored to the calendar week:
// rotation[0] = Monday. This module answers "what does the plan intend for
// this date?" and "what actually happened?" — the UI combines both. The
// schedule informs; it never blocks training.

/** The plan's intended slot for a date; null when the plan isn't week-anchored. */
export function slotForDate(plan: Plan | undefined, date: Date): RotationSlot | null {
  if (!plan || plan.schedule.cycleLength !== 7) return null;
  const idx = (date.getDay() + 6) % 7; // Mon = 0
  return plan.schedule.rotation[idx] ?? null;
}

/** Whether at least one workout was logged on the given local day. */
export function trainedOn(logs: WorkoutLog[], date: Date): boolean {
  const key = dayKey(date);
  return logs.some((l) => {
    const d = parseDate(l.completedAt) ?? parseDate(l.startedAt);
    return d !== null && dayKey(d) === key;
  });
}

/**
 * The most back-to-back training days the plan's rotation ever asks for
 * (cyclic — a run may wrap around the week). 0 when the plan is unknown.
 */
export function maxConsecutiveWorkouts(plan: Plan | undefined): number {
  if (!plan || plan.schedule.rotation.length === 0) return 0;
  const rot = plan.schedule.rotation;
  if (rot.every((s) => s.type === "workout")) return rot.length;
  let best = 0;
  let run = 0;
  for (const slot of [...rot, ...rot]) {
    if (slot.type === "workout") {
      run++;
      if (run > best) best = run;
    } else {
      run = 0;
    }
  }
  return best;
}

/** Consecutive trained days counting backwards from `endingWith` (inclusive). */
export function consecutiveTrainedDays(logs: WorkoutLog[], endingWith: Date): number {
  let streak = 0;
  let cursor = startOfDay(endingWith);
  while (trainedOn(logs, cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/**
 * True when the user's actual training says today should be recovery even if
 * the calendar slot is a workout: the streak of consecutive trained days
 * ending yesterday has reached the plan's maximum back-to-back load.
 */
export function needsRecovery(plan: Plan | undefined, logs: WorkoutLog[], today: Date = new Date()): number {
  const maxRun = maxConsecutiveWorkouts(plan);
  if (maxRun === 0) return 0;
  const streak = consecutiveTrainedDays(logs, addDays(today, -1));
  return streak >= maxRun ? streak : 0;
}

export interface WeekDayOverview {
  date: Date;
  slot: RotationSlot | null;
  trained: boolean;
  isToday: boolean;
}

/** Mon–Sun of the current week: intended slot + actual training per day. */
export function weekOverview(
  plan: Plan | undefined,
  logs: WorkoutLog[],
  today: Date = new Date()
): WeekDayOverview[] {
  const start = weekStart(today);
  const todayKey = dayKey(today);
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i);
    return {
      date,
      slot: slotForDate(plan, date),
      trained: trainedOn(logs, date),
      isToday: dayKey(date) === todayKey,
    };
  });
}
