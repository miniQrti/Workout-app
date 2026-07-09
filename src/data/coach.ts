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
  "standing-calf-raise": {
    warning: {
      en: "Calves adapt slowly — full range of motion, slow negatives",
      de: "Waden passen sich langsam an — volle Bewegung, langsame Negative",
    },
  },
  "bulgarian-split-squat": {
    // Per-hand dumbbells — the group's 10 kg "easy" jump is far too big here.
    maxJumpKg: 2.5,
    warning: {
      en: "Single-leg — add weight in small steps and match both sides",
      de: "Einbeinig — Gewicht in kleinen Schritten, beide Seiten gleich",
    },
  },
  "deadlift": {
    warning: {
      en: "Brace hard and keep a flat back — leave form-breaking jumps alone",
      de: "Fest anspannen, Rücken gerade — keine formzerstörenden Sprünge",
    },
  },
  "romanian-deadlift": {
    warning: {
      en: "Hamstring stretch, not a max pull — flat back, small increases",
      de: "Beinbizeps-Dehnung, kein Maximalzug — gerader Rücken, kleine Steigerungen",
    },
  },
  "side-plank": {
    progressBySeconds: true,
    warning: {
      en: "Add time, not weight. Keep hips stacked and lifted.",
      de: "Zeit statt Gewicht steigern. Hüften gestapelt und angehoben halten.",
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

  // ── Chest ──
  "barbell-bench-press": [
    { exerciseId: "dumbbell-press",       reason: { en: "More range, each side works alone", de: "Mehr Bewegungsumfang, jede Seite einzeln" } },
    { exerciseId: "chest-press-machine",  reason: { en: "Fixed path — safe solo deload", de: "Feste Bahn — sicherer Deload ohne Partner" } },
  ],
  "incline-barbell-press": [
    { exerciseId: "incline-dumbbell-press", reason: { en: "Deeper stretch, kinder to shoulders", de: "Tiefere Dehnung, schulterschonend" } },
    { exerciseId: "chest-press-machine",    reason: { en: "Fixed path for a controlled deload", de: "Feste Bahn für kontrollierten Deload" } },
  ],
  "push-up": [
    { exerciseId: "chest-press-machine", reason: { en: "Dial in exact load and reps", de: "Genaue Last und Wiederholungen einstellbar" } },
    { exerciseId: "pec-deck",            reason: { en: "Isolate the chest, no core fatigue", de: "Brust isolieren, ohne Rumpfermüdung" } },
  ],
  "chest-dip": [
    { exerciseId: "tricep-dip-machine",  reason: { en: "Seated version, adjustable load", de: "Sitzende Variante, einstellbare Last" } },
    { exerciseId: "chest-press-machine", reason: { en: "Fixed path — easier to scale", de: "Feste Bahn — leichter zu dosieren" } },
  ],

  // ── Back ──
  "barbell-row": [
    { exerciseId: "chest-supported-row", reason: { en: "Chest pad takes the lower back out", de: "Brustpolster entlastet den unteren Rücken" } },
    { exerciseId: "dumbbell-row",        reason: { en: "Unilateral, fixes side imbalances", de: "Einseitig, gleicht Dysbalancen aus" } },
    { exerciseId: "seated-cable-row",    reason: { en: "Seated, constant cable tension", de: "Sitzend, konstante Kabelspannung" } },
  ],
  "pull-up": [
    { exerciseId: "assisted-pull-up", reason: { en: "Counterweight scales the difficulty", de: "Gegengewicht dosiert die Schwierigkeit" } },
    { exerciseId: "lat-pulldown",     reason: { en: "Same pull, load you can pick", de: "Gleicher Zug, wählbare Last" } },
  ],
  "chest-supported-row": [
    { exerciseId: "seated-cable-row", reason: { en: "Constant tension, full stretch", de: "Konstante Spannung, volle Dehnung" } },
    { exerciseId: "dumbbell-row",     reason: { en: "Unilateral free-weight option", de: "Einseitige Freihantel-Option" } },
  ],
  "deadlift": [
    { exerciseId: "romanian-deadlift", reason: { en: "Less spinal load, more hamstring", de: "Weniger Wirbelsäulenlast, mehr Beinbizeps" } },
    { exerciseId: "back-extension",    reason: { en: "Machine hinge, lower-back friendly", de: "Maschinen-Hüftbeuge, rückenschonend" } },
  ],

  // ── Shoulders ──
  "overhead-press": [
    { exerciseId: "dumbbell-shoulder-press", reason: { en: "Free range, kinder to shoulders", de: "Freier Bewegungsumfang, schulterschonend" } },
    { exerciseId: "shoulder-press-machine",  reason: { en: "Fixed path for a solo deload", de: "Feste Bahn für Deload ohne Partner" } },
  ],
  "dumbbell-shoulder-press": [
    { exerciseId: "shoulder-press-machine", reason: { en: "Fixed path, no balancing", de: "Feste Bahn, kein Ausbalancieren" } },
    { exerciseId: "arnold-press",           reason: { en: "Rotation hits all three delt heads", de: "Rotation trifft alle drei Deltaköpfe" } },
  ],

  // ── Arms ──
  "barbell-curl": [
    { exerciseId: "dumbbell-curl", reason: { en: "Each arm works alone, wrist-friendly", de: "Jeder Arm einzeln, handgelenkschonend" } },
    { exerciseId: "cable-curl",    reason: { en: "Constant tension, fine weight steps", de: "Konstante Spannung, feine Gewichtsstufen" } },
  ],
  "close-grip-bench-press": [
    { exerciseId: "tricep-dip-machine", reason: { en: "Seated press, adjustable load", de: "Sitzendes Drücken, einstellbare Last" } },
    { exerciseId: "tricep-pushdown",    reason: { en: "Isolation, easy on the shoulders", de: "Isolation, schulterschonend" } },
  ],
  "bench-dip": [
    { exerciseId: "tricep-dip-machine", reason: { en: "Same movement, scalable weight", de: "Gleiche Bewegung, dosierbares Gewicht" } },
    { exerciseId: "tricep-pushdown",    reason: { en: "Isolation with constant tension", de: "Isolation mit konstanter Spannung" } },
  ],

  // ── Legs ──
  "barbell-squat": [
    { exerciseId: "leg-press",           reason: { en: "Fixed path, less technical demand", de: "Feste Bahn, weniger technischer Anspruch" } },
    { exerciseId: "goblet-squat",        reason: { en: "Lighter, grooves upright form", de: "Leichter, schult aufrechte Form" } },
    { exerciseId: "smith-machine-squat", reason: { en: "Guided bar for a solo deload", de: "Geführte Stange für Deload ohne Partner" } },
  ],
  "romanian-deadlift": [
    { exerciseId: "leg-curl-machine", reason: { en: "Isolates hamstrings, no back load", de: "Isoliert Beinbizeps, ohne Rückenlast" } },
    { exerciseId: "back-extension",   reason: { en: "Supported hinge, easier on the spine", de: "Gestützte Hüftbeuge, wirbelsäulenschonend" } },
  ],
  "barbell-hip-thrust": [
    { exerciseId: "glute-kickback-machine", reason: { en: "Isolates the glute, no setup", de: "Isoliert das Gesäß, ohne Aufbau" } },
    { exerciseId: "leg-press",              reason: { en: "High foot placement targets glutes", de: "Hohe Fußstellung betont das Gesäß" } },
  ],
  "goblet-squat": [
    { exerciseId: "leg-press",           reason: { en: "Fixed path, heavier loading", de: "Feste Bahn, schwerere Belastung" } },
    { exerciseId: "smith-machine-squat", reason: { en: "Guided bar, more stability", de: "Geführte Stange, mehr Stabilität" } },
  ],
  "bulgarian-split-squat": [
    { exerciseId: "dumbbell-lunge", reason: { en: "Unilateral, less balance demand", de: "Einseitig, weniger Balanceanforderung" } },
    { exerciseId: "leg-press",      reason: { en: "Both legs, easier to load heavy", de: "Beide Beine, leichter schwer zu laden" } },
  ],
  "lying-leg-curl": [
    { exerciseId: "leg-curl-machine",  reason: { en: "Seated version, same muscle", de: "Sitzende Variante, gleicher Muskel" } },
    { exerciseId: "romanian-deadlift", reason: { en: "Loaded stretch for the hamstrings", de: "Belastete Dehnung für den Beinbizeps" } },
  ],
  "standing-calf-raise": [
    { exerciseId: "calf-raise-machine", reason: { en: "Seated bias for the soleus", de: "Sitzend, betont den Schollenmuskel" } },
  ],

  // ── Core ──
  "hanging-leg-raise": [
    { exerciseId: "hanging-knee-raise", reason: { en: "Bent knees — an easier regression", de: "Gebeugte Knie — leichtere Variante" } },
    { exerciseId: "cable-crunch",       reason: { en: "Weighted spinal flexion", de: "Belastete Wirbelsäulenbeugung" } },
  ],
  "russian-twist": [
    { exerciseId: "rotary-torso", reason: { en: "Machine-guided rotation, set load", de: "Maschinengeführte Rotation, feste Last" } },
    { exerciseId: "cable-crunch", reason: { en: "Direct ab work, constant tension", de: "Direkte Baucharbeit, konstante Spannung" } },
  ],
  "bicycle-crunch": [
    { exerciseId: "ab-crunch-machine", reason: { en: "Adjustable load, seated", de: "Einstellbare Last, sitzend" } },
    { exerciseId: "cable-crunch",      reason: { en: "Weighted, constant tension", de: "Belastet, konstante Spannung" } },
  ],
  "side-plank": [
    { exerciseId: "rotary-torso", reason: { en: "Dynamic oblique work with load", de: "Dynamische Seitenbauch-Arbeit mit Last" } },
    { exerciseId: "plank",        reason: { en: "Front-facing isometric hold", de: "Frontaler isometrischer Halt" } },
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

