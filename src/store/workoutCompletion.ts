import type { DraftExercise } from "../types";

export interface WorkoutCompletion {
  totalSets: number;
  enteredSets: number;
  completedSets: number;
  incompleteSets: number;
  incompleteExercises: number;
  allSetsDone: boolean;
}

/** Completion is based on checked sets, not merely typed rep values. */
export function workoutCompletion(exercises: DraftExercise[]): WorkoutCompletion {
  let totalSets = 0;
  let enteredSets = 0;
  let completedSets = 0;
  let incompleteExercises = 0;

  for (const exercise of exercises) {
    let exerciseComplete = exercise.sets.length > 0;
    for (const set of exercise.sets) {
      totalSets++;
      if (set.reps !== null) enteredSets++;
      if (set.completed) completedSets++;
      else exerciseComplete = false;
    }
    if (!exerciseComplete) incompleteExercises++;
  }

  return {
    totalSets,
    enteredSets,
    completedSets,
    incompleteSets: totalSets - completedSets,
    incompleteExercises,
    allSetsDone: totalSets > 0 && completedSets === totalSets,
  };
}
