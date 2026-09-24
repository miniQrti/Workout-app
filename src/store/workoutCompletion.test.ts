import { describe, expect, it } from "vitest";
import type { DraftExercise } from "../types";
import { workoutCompletion } from "./workoutCompletion";

function exercise(
  completed: boolean[],
  reps: (number | null)[] = completed.map(() => 10)
): DraftExercise {
  return {
    exerciseId: "leg-press",
    targetSets: completed.length,
    targetReps: 10,
    restSecs: 90,
    feel: null,
    sets: completed.map((done, i) => ({ weightKg: 100, reps: reps[i] ?? null, completed: done })),
  };
}

describe("workout completion", () => {
  it("treats entered but unchecked sets as incomplete", () => {
    const status = workoutCompletion([exercise([true, false])]);
    expect(status.enteredSets).toBe(2);
    expect(status.completedSets).toBe(1);
    expect(status.incompleteSets).toBe(1);
    expect(status.incompleteExercises).toBe(1);
    expect(status.allSetsDone).toBe(false);
  });

  it("counts a wholly skipped exercise", () => {
    const status = workoutCompletion([
      exercise([true, true]),
      exercise([false, false], [null, null]),
    ]);
    expect(status.incompleteSets).toBe(2);
    expect(status.incompleteExercises).toBe(1);
  });

  it("reports a fully completed workout", () => {
    const status = workoutCompletion([exercise([true, true]), exercise([true])]);
    expect(status.allSetsDone).toBe(true);
    expect(status.incompleteSets).toBe(0);
    expect(status.incompleteExercises).toBe(0);
  });
});
