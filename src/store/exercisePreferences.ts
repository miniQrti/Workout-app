import type { PlanDay, Settings, WorkoutLog } from "../types";
import { getExercise } from "../data/exerciseResolver";

/**
 * Remember the exercises actually performed on this specific plan day.
 *
 * Position matters: a plan can contain the same exercise more than once, and
 * workout logs retain the order of the original slots after a swap. Skipped
 * exercises never teach a preference (important for early finishes).
 * The log is the source of truth, so restore/import works automatically.
 */
export function preferredExercisesForDay(
  planId: string,
  day: PlanDay,
  logs: WorkoutLog[],
  settings: Settings,
): string[] {
  const matching = logs
    .filter((log) => log.planId === planId && log.dayId === day.id)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));

  return day.exercises.map((planned, slot) => {
    for (const log of matching) {
      const performed = log.exercises[slot];
      if (!performed || !performed.sets.some((set) => set.completed)) continue;
      if (getExercise(performed.exerciseId, settings)) return performed.exerciseId;
    }
    return planned.exerciseId;
  });
}
