// ── Plan resolution (built-in + user-authored) ────────────────────────────────
//
// Plans come from two places: the static built-in catalogue (PLANS) and the
// user's own plans, stored on Settings.customPlans. Every runtime consumer used
// to read PLANS directly; they now go through here so custom plans are found
// wherever built-ins are. Built-ins always win on any id clash (custom ids are
// uuids, built-ins are human slugs, so a clash is only theoretical).
//
// This module is pure (no React) so it is importable everywhere and unit-tested.

import type { Plan, PlanDay, RotationSlot, Settings } from "../types";
import { PLANS } from "./plans";
import { EXERCISES } from "./exercises";
import { getExercise } from "./exerciseResolver";

/** Resolve a plan id against built-ins first, then the user's custom plans. */
export function getPlan(id: string, settings: Settings): Plan | undefined {
  return PLANS[id] ?? settings.customPlans?.find((p) => p.id === id);
}

/** All plans for listing: built-ins first, then custom plans in insertion order. */
export function allPlans(settings: Settings): Plan[] {
  return [...Object.values(PLANS), ...(settings.customPlans ?? [])];
}

/** True when the id belongs to a user-authored plan (i.e. editable/deletable). */
export function isCustomPlan(id: string, settings: Settings): boolean {
  return (settings.customPlans ?? []).some((p) => p.id === id);
}

// ── Normalization ─────────────────────────────────────────────────────────────
//
// The builder edits a working draft; before it is saved we derive the display-
// only fields from the authored content and pin the invariants the rest of the
// app relies on (a 7-slot weekly rotation, cycleLength 7).

/** Rough time estimate: work + rest across the average workout day, in minutes. */
function estimateMins(days: PlanDay[], rotation: RotationSlot[]): number {
  const workoutDayIds = rotation.filter((s) => s.type === "workout").map((s) => s.dayId);
  const uniqueDays = days.filter((d) => workoutDayIds.includes(d.id));
  if (uniqueDays.length === 0) return 0;
  const perDay = uniqueDays.map((d) =>
    d.exercises.reduce((mins, pe) => mins + pe.sets * (0.5 + (pe.restSecs || 60) / 60), 0)
  );
  const avg = perDay.reduce((a, b) => a + b, 0) / perDay.length;
  return Math.max(1, Math.round(avg));
}

/**
 * Produce a persist-ready Plan from a draft: derive daysPerWeek/estimatedMins,
 * and guarantee the weekly-schedule invariants. Does not mutate the input.
 */
export function normalizePlan(draft: Plan): Plan {
  const rotation = draft.schedule.rotation.slice(0, 7);
  const daysPerWeek = rotation.filter((s) => s.type === "workout").length;
  return {
    ...draft,
    name: draft.name.trim(),
    daysPerWeek,
    estimatedMins: estimateMins(draft.days, rotation),
    schedule: { cycleLength: 7, rotation },
  };
}

// ── Validation ────────────────────────────────────────────────────────────────
//
// Returns i18n keys of any violations (empty = valid). The builder disables Save
// while non-empty; validate defensively rather than trusting the UI.

export function validatePlan(draft: Plan, settings?: Settings): string[] {
  const errs: string[] = [];

  if (draft.name.trim().length === 0) errs.push("builder.err.name");
  if (draft.days.length === 0) errs.push("builder.err.min_day");

  const dayIds = draft.days.map((d) => d.id);
  if (new Set(dayIds).size !== dayIds.length) errs.push("builder.err.dup_day");

  if (draft.days.some((d) => localizedIsEmpty(d.name))) errs.push("builder.err.day_name");
  if (draft.days.some((d) => d.exercises.length === 0)) errs.push("builder.err.day_exercises");

  const known = (id: string) => (settings ? getExercise(id, settings) : EXERCISES[id]);
  if (
    draft.days.some((d) =>
      d.exercises.some((pe) => !known(pe.exerciseId))
    )
  ) {
    errs.push("builder.err.unknown_exercise");
  }

  const rotation = draft.schedule.rotation;
  if (rotation.length !== 7 || draft.schedule.cycleLength !== 7) errs.push("builder.err.rotation_len");

  const workoutSlots = rotation.filter((s) => s.type === "workout");
  if (workoutSlots.length === 0) errs.push("builder.err.no_workout");
  if (workoutSlots.some((s) => !dayIds.includes(s.dayId))) errs.push("builder.err.rotation_ref");

  return errs;
}

function localizedIsEmpty(text: { en: string; de?: string }): boolean {
  return (text.en ?? "").trim().length === 0 && (text.de ?? "").trim().length === 0;
}

// ── Day-delete cascade ────────────────────────────────────────────────────────

/**
 * Remove a day and repair the rotation: any slot that referenced the removed
 * day flips to rest, so the rotation never carries a dangling dayId. Pure.
 */
export function removeDayFromPlan(draft: Plan, dayId: string): Plan {
  const rotation: RotationSlot[] = draft.schedule.rotation.map((s) =>
    s.type === "workout" && s.dayId === dayId ? { type: "rest" } : s
  );
  return {
    ...draft,
    days: draft.days.filter((d) => d.id !== dayId),
    schedule: { ...draft.schedule, rotation },
  };
}
