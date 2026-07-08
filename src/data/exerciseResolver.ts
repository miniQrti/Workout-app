// ── Exercise resolution (built-in + user-authored) ────────────────────────────
//
// Exercises come from two places: the static built-in catalogue (EXERCISES) and
// the user's own exercises, stored on Settings.customExercises. Runtime consumers
// that need the full Exercise object (not just a name) go through here so custom
// exercises are found wherever built-ins are. Built-ins always win on any id
// clash (custom ids are uuids, built-ins are human slugs, so a clash is only
// theoretical).
//
// This module is pure (no React) so it is importable everywhere and unit-tested.

import type { Exercise, Settings } from "../types";
import { EXERCISES, exerciseName } from "./exercises";

/** Resolve an exercise id against built-ins first, then the user's customs. */
export function getExercise(id: string, settings: Settings): Exercise | undefined {
  return EXERCISES[id] ?? settings.customExercises?.find((e) => e.id === id);
}

/** All exercises for listing: built-ins first, then customs in insertion order. */
export function allExercises(settings: Settings): Exercise[] {
  return [...Object.values(EXERCISES), ...(settings.customExercises ?? [])];
}

/** True when the id belongs to a user-authored exercise (editable/deletable). */
export function isCustomExercise(id: string, settings: Settings): boolean {
  return (settings.customExercises ?? []).some((e) => e.id === id);
}

/**
 * Display name for an exercise id, aware of custom exercises. Falls back to a
 * logged name snapshot, then a title-cased id — so a deleted custom exercise
 * still reads sensibly in old logs.
 */
export function resolveExerciseName(id: string, settings: Settings, snapshot?: string): string {
  return getExercise(id, settings)?.name ?? exerciseName(id, snapshot);
}

// ── Validation ────────────────────────────────────────────────────────────────
//
// Returns i18n keys of any violations (empty = valid). The form disables Save
// while non-empty; validate defensively rather than trusting the UI.

export function validateExercise(draft: Exercise): string[] {
  const errs: string[] = [];
  if (draft.name.trim().length === 0) errs.push("customex.err.name");
  if (draft.primaryMuscle.trim().length === 0) errs.push("customex.err.muscle");
  if (!Number.isFinite(draft.defaultSets) || draft.defaultSets < 1) errs.push("customex.err.sets");
  if (!Number.isFinite(draft.defaultReps) || draft.defaultReps < 1) errs.push("customex.err.reps");
  return errs;
}
