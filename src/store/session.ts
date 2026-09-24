import type { Settings, WorkoutLog } from "../types";
import { getPlan } from "../data/planResolver";

/**
 * Advance the plan that created a completed workout. The active plan may have
 * changed while a persisted session was paused, so it is not authoritative.
 */
export function nextDayIndexAfter(log: WorkoutLog, settings: Settings): number {
  const plan = getPlan(log.planId, settings);
  const dayCount = plan?.days.length ?? 1;
  const currentIdx = plan?.days.findIndex((day) => day.id === log.dayId) ?? 0;
  if (log.repeatDay && plan && currentIdx >= 0) return currentIdx;
  return ((currentIdx >= 0 ? currentIdx : 0) + 1) % Math.max(1, dayCount);
}
