import type { ExerciseLog, WorkoutLog } from "../types";

let seq = 0;

/** Build a WorkoutLog for tests with sensible defaults. */
export function makeLog(
  daysAgo: number,
  exercises: { exId: string; feel?: ExerciseLog["feel"]; sets: [number | null, number, boolean?][] }[],
  overrides: Partial<WorkoutLog> = {}
): WorkoutLog {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(10, 0, 0, 0);
  return {
    id: `test-${++seq}`,
    planId: "beginner-3day",
    dayId: "full-body",
    dayName: "Full Body",
    startedAt: d.toISOString(),
    completedAt: d.toISOString(),
    durationSecs: 3600,
    exercises: exercises.map((e) => ({
      exerciseId: e.exId,
      feel: e.feel ?? null,
      sets: e.sets.map(([weightKg, reps, completed]) => ({
        weightKg,
        reps,
        completed: completed !== false,
      })),
    })),
    ...overrides,
  };
}
