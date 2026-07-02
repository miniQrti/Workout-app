import type { Exercise, Unit } from "../types";
import { fromKg, toKg, roundToStep, UNIT_STEP } from "../lib/units";
import { muscleGroupOf } from "../data/muscles";
import { PROGRESSION, EXERCISE_OVERRIDES, DELOAD_FACTOR, jumpKg } from "../data/coach";
import type { ExerciseIndex } from "./selectors";
import { epley1RMKg } from "./selectors";

// ── Feel-based progression engine ─────────────────────────────────────────────
//
// Gate order (first match wins):
//  1. deload    — two consecutive "tough" sessions → 85 %
//  2. hold      — sets left incomplete
//  3. hold      — target reps not hit on every set
//  4. hold      — weight dropped mid-session (fatigue)
//  5. adjust    — by feel, using the muscle group's unit-native jump
//
// Reasons are returned as i18n keys so the UI renders them in any language.

export type SuggestionAction = "increase" | "hold" | "decrease" | "deload";

export interface Suggestion {
  action: SuggestionAction;
  weightKg: number;
  lastWeightKg: number;
  reasonKey: string;
  reasonVars?: Record<string, string | number>;
  e1rmKg: number | null;
  warningKey?: never; // warnings come from EXERCISE_OVERRIDES at render time
}

/** Snap a kg value so it displays as a clean plate step in the user's unit. */
function snapKg(kg: number, unit: Unit): number {
  return toKg(roundToStep(fromKg(kg, unit), UNIT_STEP[unit]), unit);
}

export function suggestProgression(
  index: ExerciseIndex,
  exercise: Exercise,
  targetReps: number,
  unit: Unit
): Suggestion | null {
  const sessions = index.get(exercise.id);
  if (!sessions || sessions.length === 0) return null;

  const recent = sessions.slice(-3).reverse(); // newest first
  const last = recent[0]!;
  const weighted = last.sets.filter((s) => s.weightKg !== null && s.reps >= 1);
  if (weighted.length === 0) return null;

  const top = Math.max(...weighted.map((s) => s.weightKg!));
  const min = Math.min(...weighted.map((s) => s.weightKg!));
  const avgReps = weighted.reduce((a, s) => a + s.reps, 0) / weighted.length;
  const e1rmKg = epley1RMKg(top, Math.round(avgReps));

  const base = { lastWeightKg: top, e1rmKg };

  // 1. Deload
  if (recent.length >= 2 && recent[0]!.feel === "tough" && recent[1]!.feel === "tough") {
    return {
      ...base,
      action: "deload",
      weightKg: snapKg(top * DELOAD_FACTOR, unit),
      reasonKey: "coach.deload",
    };
  }

  // 2. Completion gate
  if (last.sets.some((s) => !s.completed)) {
    return { ...base, action: "hold", weightKg: top, reasonKey: "coach.hold_incomplete" };
  }

  // 3. Rep gate
  if (last.sets.some((s) => s.reps < targetReps)) {
    return {
      ...base,
      action: "hold",
      weightKg: top,
      reasonKey: "coach.hold_reps",
      reasonVars: { reps: targetReps },
    };
  }

  // 4. Fatigue gate — weight dropped mid-session
  if (min < top) {
    return { ...base, action: "hold", weightKg: top, reasonKey: "coach.hold_fatigue" };
  }

  // 5. Feel-based jump
  const group = muscleGroupOf(exercise.primaryMuscle);
  const rule = group !== "cardio" ? PROGRESSION[group] : PROGRESSION.chest;
  const cap = EXERCISE_OVERRIDES[exercise.id]?.maxJumpKg ?? Infinity;

  switch (last.feel) {
    case "easy":
      return {
        ...base,
        action: "increase",
        weightKg: snapKg(top + Math.min(jumpKg(rule, "easy", unit), cap), unit),
        reasonKey: "coach.increase_easy",
      };
    case "tough":
      return {
        ...base,
        action: "decrease",
        weightKg: snapKg(Math.max(top - jumpKg(rule, "good", unit), 0), unit),
        reasonKey: "coach.decrease_tough",
      };
    case "hard":
      return { ...base, action: "hold", weightKg: top, reasonKey: "coach.hold_hard" };
    case "good":
      return {
        ...base,
        action: "increase",
        weightKg: snapKg(top + Math.min(jumpKg(rule, "good", unit), cap), unit),
        reasonKey: "coach.increase_good",
      };
    default:
      return {
        ...base,
        action: "increase",
        weightKg: snapKg(top + Math.min(jumpKg(rule, "good", unit), cap), unit),
        reasonKey: "coach.increase_done",
      };
  }
}
