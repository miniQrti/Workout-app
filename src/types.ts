// ── Core data model ───────────────────────────────────────────────────────────
//
// Canonical rules:
//  • Weights are ALWAYS stored in kilograms as numbers. Display converts.
//  • Timestamps are ISO 8601 strings with timezone (Date#toISOString).
//  • Logs are append-only; everything else is derived from them.

export type Unit = "kg" | "lb";
export type Lang = "en" | "de";
export type ThemeSetting = "light" | "dark" | "system";
export type AccentKey = "green" | "blue" | "purple" | "orange";
export type Feel = "easy" | "good" | "hard" | "tough";

/** Translatable content embedded in data files. `en` is the fallback. */
export interface LocalizedText {
  en: string;
  de?: string;
}

// ── Exercise catalogue ────────────────────────────────────────────────────────

export type MuscleGroupId =
  | "chest" | "back" | "shoulders" | "arms" | "legs" | "core" | "cardio";

export type Equipment =
  | "machine" | "cable" | "dumbbell" | "barbell" | "smith" | "bodyweight";

export interface Exercise {
  id: string;
  /** Machine/exercise names are proper nouns; not localized. */
  name: string;
  primaryMuscle: string;
  muscles: string[];
  equipment: Equipment;
  /** "reps" = weight × reps; "seconds" = timed hold (weight optional). */
  repType: "reps" | "seconds";
  defaultSets: number;
  defaultReps: number;
  restSecs: number;
  tip?: LocalizedText;
}

// ── Plans ─────────────────────────────────────────────────────────────────────

export interface WarmupStep {
  name: LocalizedText;
  detail: LocalizedText;
}

export interface PlanExercise {
  exerciseId: string;
  sets: number;
  reps: number;
  restSecs: number;
}

export interface PlanDay {
  id: string;
  name: LocalizedText;
  warmup: WarmupStep[];
  exercises: PlanExercise[];
}

export type RotationSlot =
  | { type: "workout"; dayId: string }
  | { type: "rest" }
  | { type: "cardio" };

export interface Plan {
  id: string;
  name: string;
  tagline: LocalizedText;
  difficulty: "beginner" | "intermediate" | "advanced";
  daysPerWeek: number;
  estimatedMins: number;
  goal:
    | "strength" | "hypertrophy" | "fatLoss" | "endurance"
    | "functional-longevity" | "time-efficient" | "weight-loss";
  schedule: { cycleLength: number; rotation: RotationSlot[] };
  days: PlanDay[];
}

// ── Workout logs (append-only source of truth) ────────────────────────────────

export interface SetLog {
  /** kg; null for bodyweight / timed sets without external load */
  weightKg: number | null;
  /** reps, or seconds for repType "seconds" */
  reps: number;
  completed: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  /** Display name snapshot for exercises not in the catalogue (imports). */
  nameSnapshot?: string;
  feel: Feel | null;
  sets: SetLog[];
}

export interface WorkoutLog {
  id: string;
  planId: string;
  dayId: string;
  dayName: string;
  startedAt: string;
  completedAt: string;
  durationSecs: number;
  exercises: ExerciseLog[];
}

// ── Active session (persisted draft — survives refresh / app kill) ───────────

export interface DraftSet {
  weightKg: number | null;
  reps: number | null;
  completed: boolean;
}

export interface DraftExercise {
  exerciseId: string;
  targetSets: number;
  targetReps: number;
  restSecs: number;
  sets: DraftSet[];
  feel: Feel | null;
}

export interface ActiveSession {
  id: string;
  planId: string;
  dayId: string;
  dayName: string;
  startedAt: string;
  warmupDone: number[];
  cooldownDone: number[];
  exercises: DraftExercise[];
}

// ── Settings ──────────────────────────────────────────────────────────────────

/**
 * Opt-in menstrual-cycle tracking. Entirely on-device; absent on settings
 * persisted by builds before the feature shipped. Weights/dates never leave
 * the device (part of the local JSON backup only).
 */
export interface CycleSettings {
  enabled: boolean;          // master switch — default false
  adaptiveCoaching: boolean; // let phase soften coach suggestions — default true
  forecast: boolean;         // show predicted period days / countdown — default true
  cycleLength: number;       // configured length, clamped 21–40 (default 28)
  periodLength: number;      // clamped 1–10 (default 5)
  /** Logged period-start days as local dayKeys, sorted asc, deduped, capped. */
  periodStarts: string[];
}

export interface Settings {
  unit: Unit;
  theme: ThemeSetting;
  accent: AccentKey;
  lang: Lang;
  activePlanId: string;
  nextDayIdx: number;
  /** exerciseId → user's machine setup note ("Seat 3", …) */
  machineNotes: Record<string, string>;
  /** Optional: absent on settings saved by older builds. */
  cycle?: CycleSettings;
  /**
   * User-authored plans. Absent on settings saved by older builds. Structurally
   * identical to built-ins; presence here is the sole marker of "custom" (i.e.
   * editable/deletable). Rides inside Settings so it persists and round-trips
   * through the JSON backup for free.
   */
  customPlans?: Plan[];
}

// ── Versioned backup file ─────────────────────────────────────────────────────

export const SCHEMA_VERSION = 1;

export interface BackupFile {
  app: "ironlog";
  schemaVersion: number;
  exportedAt: string;
  settings: Settings;
  logs: WorkoutLog[];
}
