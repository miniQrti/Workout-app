import type { Unit, LocalizedText, MuscleGroupId } from "../types";
import { KG_PER_LB } from "../lib/units";

// ── Coach knowledge base ──────────────────────────────────────────────────────
//
// Progression jumps are defined PER UNIT SYSTEM, not converted: someone on lb
// machines moves in 5 lb plates, someone on kg machines in 2.5 kg plates.
// The engine picks the jump for the user's display unit and returns kg.

interface Jump {
  kg: number;
  lb: number;
}

export interface ProgressionRule {
  easy: Jump;
  good: Jump;
}

export const PROGRESSION: Record<Exclude<MuscleGroupId, "cardio">, ProgressionRule> = {
  chest:     { easy: { kg: 5,  lb: 10 }, good: { kg: 2.5,  lb: 5   } },
  back:      { easy: { kg: 5,  lb: 10 }, good: { kg: 2.5,  lb: 5   } },
  shoulders: { easy: { kg: 2.5, lb: 5 }, good: { kg: 1.25, lb: 2.5 } },
  arms:      { easy: { kg: 2.5, lb: 5 }, good: { kg: 1.25, lb: 2.5 } },
  legs:      { easy: { kg: 10, lb: 20 }, good: { kg: 5,    lb: 10  } },
  core:      { easy: { kg: 2.5, lb: 5 }, good: { kg: 1.25, lb: 2.5 } },
};

export function jumpKg(rule: ProgressionRule, feel: "easy" | "good", unit: Unit): number {
  const j = rule[feel];
  return unit === "lb" ? j.lb * KG_PER_LB : j.kg;
}

/** Deload multiplier after two consecutive "tough" sessions. */
export const DELOAD_FACTOR = 0.85;

// Per-exercise overrides
export interface ExerciseOverride {
  /** Cap any single-session jump (kg). */
  maxJumpKg?: number;
  /** Progress by adding time, not weight. */
  progressBySeconds?: boolean;
  warning?: LocalizedText;
}

export const EXERCISE_OVERRIDES: Record<string, ExerciseOverride> = {
  "leg-extension-machine": {
    maxJumpKg: 5 * KG_PER_LB,
    warning: {
      en: "Quad tendon caution — small jumps only",
      de: "Vorsicht Quadrizepssehne — nur kleine Sprünge",
    },
  },
  "plank": {
    progressBySeconds: true,
    warning: {
      en: "Add time, not weight. Target a solid 60 s first.",
      de: "Zeit statt Gewicht steigern. Erst stabile 60 s anpeilen.",
    },
  },
  "calf-raise-machine": {
    warning: {
      en: "Calves adapt slowly — full range of motion, slow negatives",
      de: "Waden passen sich langsam an — volle Bewegung, langsame Negative",
    },
  },
};

// Ranked substitution alternatives (same-gym-friendly swaps)
export interface Substitution {
  exerciseId: string;
  reason: LocalizedText;
}

export const SUBSTITUTIONS: Record<string, Substitution[]> = {
  "chest-press-machine": [
    { exerciseId: "pec-deck",        reason: { en: "Lower joint stress, good isolation", de: "Gelenkschonender, gute Isolation" } },
    { exerciseId: "cable-crossover", reason: { en: "Constant tension, fine weight steps", de: "Konstante Spannung, feine Gewichtsstufen" } },
  ],
  "seated-cable-row": [
    { exerciseId: "lat-pulldown", reason: { en: "Vertical pull — same back muscles, new angle", de: "Vertikaler Zug — gleiche Muskeln, neuer Winkel" } },
    { exerciseId: "dumbbell-row", reason: { en: "Unilateral, easier on the lower back", de: "Einseitig, schonender für den unteren Rücken" } },
  ],
  "shoulder-press-machine": [
    { exerciseId: "dumbbell-lateral-raise", reason: { en: "No axial load — good deload option", de: "Keine axiale Last — gute Deload-Option" } },
  ],
  "leg-press": [
    { exerciseId: "smith-machine-squat", reason: { en: "Shared load across hips and quads", de: "Last auf Hüfte und Quadrizeps verteilt" } },
    { exerciseId: "dumbbell-lunge",      reason: { en: "Unilateral — fixes imbalances", de: "Einseitig — gleicht Dysbalancen aus" } },
  ],
  "leg-curl-machine": [
    { exerciseId: "back-extension", reason: { en: "Hip hinge for hamstrings and glutes", de: "Hüftbeugung für Beinbizeps und Gesäß" } },
  ],
  "lat-pulldown": [
    { exerciseId: "seated-cable-row", reason: { en: "Horizontal pull, no overhead load", de: "Horizontaler Zug ohne Überkopflast" } },
  ],
  "cable-curl": [
    { exerciseId: "hammer-curl",   reason: { en: "Neutral grip — kinder to the wrists", de: "Neutraler Griff — handgelenkschonend" } },
    { exerciseId: "dumbbell-curl", reason: { en: "Classic free-weight alternative", de: "Klassische Freihantel-Alternative" } },
  ],
  "tricep-pushdown": [
    { exerciseId: "overhead-tricep-extension", reason: { en: "Long-head focus, different angle", de: "Fokus langer Kopf, anderer Winkel" } },
  ],
  "ab-crunch-machine": [
    { exerciseId: "cable-crunch",      reason: { en: "Constant cable tension, full range", de: "Konstante Kabelspannung, voller Bewegungsumfang" } },
    { exerciseId: "hanging-knee-raise", reason: { en: "Bodyweight plus grip work", de: "Körpergewicht plus Griffkraft" } },
    { exerciseId: "plank",             reason: { en: "Zero spinal compression, isometric", de: "Keine Wirbelsäulenkompression, isometrisch" } },
  ],
};

/**
 * Kurt's machine setup notes, seeded as defaults. Fully user-editable in the
 * workout view; edits are stored in Settings.machineNotes.
 */
export const DEFAULT_MACHINE_NOTES: Record<string, string> = {
  "chest-press-machine":    "Seat 3",
  "seated-cable-row":       "Chest pad 5 / Seat 5",
  "shoulder-press-machine": "Seat 4",
  "lat-pulldown":           "Wide overhand, just outside shoulder width",
  "leg-press":              "Seat 4",
  "leg-curl-machine":       "Left-close 3 / Left-far 2 / Top 4",
  "leg-extension-machine":  "Knee pad position 2",
  "calf-raise-machine":     "Seat 6",
  "rotary-torso":           "Seat 3",
};

