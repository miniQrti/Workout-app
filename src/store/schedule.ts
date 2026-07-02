import type { Plan, RotationSlot, WorkoutLog } from "../types";
import { addDays, dayKey, parseDate, weekStart } from "../lib/dates";

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
