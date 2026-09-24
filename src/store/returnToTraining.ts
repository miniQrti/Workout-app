import type { Plan, Unit, WorkoutLog } from "../types";
import { daysBetween, parseDate } from "../lib/dates";
import { fromKg, toKg, UNIT_STEP } from "../lib/units";
import type { Suggestion } from "./progression";

const REDUCTION_PER_MISSED_WEEK = 0.05;
const MIN_FACTOR = 0.70;

export interface ReturnAdjustment {
  daysAway: number;
  reductionPercent: number;
  factor: number;
}

function latestWorkoutDate(logs: WorkoutLog[]): Date | null {
  let latest: Date | null = null;
  for (const log of logs) {
    const date = parseDate(log.completedAt) ?? parseDate(log.startedAt);
    if (date && (!latest || date > latest)) latest = date;
  }
  return latest;
}

/**
 * Detect time away relative to the active plan's normal cadence. Every extra
 * week away lowers the first return workout by another 5%, up to 30%.
 */
export function returnAdjustment(
  logs: WorkoutLog[],
  plan: Plan | undefined,
  today: Date = new Date()
): ReturnAdjustment | null {
  const latest = latestWorkoutDate(logs);
  if (!latest || !plan) return null;

  const daysAway = daysBetween(latest, today);
  if (daysAway <= 0) return null;

  const normalGap = 7 / Math.max(1, plan.daysPerWeek);
  const missedDays = Math.max(0, daysAway - normalGap);
  const factor = Math.max(
    MIN_FACTOR,
    1 - (missedDays / 7) * REDUCTION_PER_MISSED_WEEK
  );
  const reductionPercent = Math.round((1 - factor) * 100);
  if (reductionPercent < 1) return null;

  return { daysAway, reductionPercent, factor };
}

/** Round down so unit conversion can never put the return weight above its cap. */
function snapDownKg(kg: number, unit: Unit): number {
  const step = UNIT_STEP[unit];
  const display = fromKg(kg, unit);
  return toKg(Math.max(step, Math.floor((display + 1e-9) / step) * step), unit);
}

/** Apply the return cap without weakening an existing, more cautious deload. */
export function applyReturnAdjustment(
  suggestion: Suggestion | null,
  adjustment: ReturnAdjustment | null,
  unit: Unit
): Suggestion | null {
  if (!suggestion || !adjustment) return suggestion;

  const cappedWeight = snapDownKg(suggestion.lastWeightKg * adjustment.factor, unit);
  if (suggestion.weightKg <= cappedWeight) return suggestion;

  return {
    ...suggestion,
    action: "deload",
    weightKg: cappedWeight,
    reasonKey: "coach.return_after_break",
    reasonVars: {
      days: adjustment.daysAway,
      percent: adjustment.reductionPercent,
    },
  };
}
