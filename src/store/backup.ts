import type {
  BackupFile, Equipment, Exercise, ExerciseLog, Feel, LocalizedText, Plan,
  PlanDay, RotationSlot, SetLog, Settings, WorkoutLog, Unit,
} from "../types";
import { SCHEMA_VERSION } from "../types";
import { displayWeight } from "../lib/units";
import { parseDate } from "../lib/dates";
import { resolveExerciseName } from "../data/exerciseResolver";
import { normalizeCycleSettings } from "./cycle";
import { getPlan, normalizePlan, validatePlan } from "../data/planResolver";
import { PLANS } from "../data/plans";
import { EXERCISES } from "../data/exercises";

// ── Canonical JSON backup (lossless) ─────────────────────────────────────────

export function makeBackup(settings: Settings, logs: WorkoutLog[]): BackupFile {
  return {
    app: "ironlog",
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    settings,
    logs,
  };
}

const FEELS: Feel[] = ["easy", "good", "hard", "tough"];

function asFeel(v: unknown): Feel | null {
  return FEELS.includes(v as Feel) ? (v as Feel) : null;
}

function asSet(raw: unknown): SetLog | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const reps = Number(r.reps);
  if (!Number.isFinite(reps) || reps < 1) return null;
  const w = r.weightKg == null ? null : Number(r.weightKg);
  return {
    weightKg: w !== null && Number.isFinite(w) && w > 0 ? w : null,
    reps: Math.round(reps),
    completed: r.completed !== false,
  };
}

function asLog(raw: unknown): WorkoutLog | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== "string" || !parseDate(r.startedAt as string)) return null;

  const exercises: ExerciseLog[] = [];
  for (const e of Array.isArray(r.exercises) ? r.exercises : []) {
    if (typeof e !== "object" || e === null) continue;
    const er = e as Record<string, unknown>;
    if (typeof er.exerciseId !== "string") continue;
    const sets = (Array.isArray(er.sets) ? er.sets : [])
      .map(asSet)
      .filter((s): s is SetLog => s !== null);
    exercises.push({
      exerciseId: er.exerciseId,
      ...(typeof er.nameSnapshot === "string" ? { nameSnapshot: er.nameSnapshot } : {}),
      feel: asFeel(er.feel),
      sets,
    });
  }

  return {
    id: r.id,
    planId: typeof r.planId === "string" ? r.planId : "unknown",
    dayId: typeof r.dayId === "string" ? r.dayId : "unknown",
    dayName: typeof r.dayName === "string" ? r.dayName : "Workout",
    startedAt: r.startedAt as string,
    completedAt: parseDate(r.completedAt as string)?.toISOString() ?? (r.startedAt as string),
    durationSecs: Number.isFinite(Number(r.durationSecs)) ? Math.max(0, Number(r.durationSecs)) : 0,
    exercises,
  };
}

/**
 * Parse and validate a backup file. Throws on structural problems; silently
 * drops malformed individual sets/exercises so one bad row can't block a
 * restore. Settings are merged over the caller's defaults.
 */
export function parseBackup(
  text: string,
  defaults: Settings
): { settings: Settings; logs: WorkoutLog[] } {
  const raw = JSON.parse(text) as Record<string, unknown>;
  if (raw.app !== "ironlog") throw new Error("not an ironlog backup");
  if (typeof raw.schemaVersion !== "number" || raw.schemaVersion > SCHEMA_VERSION) {
    throw new Error(`unsupported schema version ${String(raw.schemaVersion)}`);
  }
  // schemaVersion < current: apply migrations here as the schema evolves.

  const logs = (Array.isArray(raw.logs) ? raw.logs : [])
    .map(asLog)
    .filter((l): l is WorkoutLog => l !== null)
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt));

  const source = asRecord(raw.settings) ?? {};
  const customExercises = normalizeCustomExercises(source.customExercises);
  const settings: Settings = {
    ...defaults,
    unit: isOneOf(source.unit, ["kg", "lb"] as const) ? source.unit : defaults.unit,
    theme: isOneOf(source.theme, ["light", "dark", "system"] as const) ? source.theme : defaults.theme,
    accent: isOneOf(source.accent, ["green", "blue", "purple", "orange"] as const) ? source.accent : defaults.accent,
    lang: isOneOf(source.lang, ["en", "de"] as const) ? source.lang : defaults.lang,
    activePlanId: defaults.activePlanId,
    nextDayIdx: nonNegativeInt(source.nextDayIdx) ?? defaults.nextDayIdx,
    machineNotes: {
      ...defaults.machineNotes,
      ...stringRecord(source.machineNotes),
    },
    cycle: normalizeCycleSettings(source.cycle),
    customExercises,
  };

  settings.customPlans = normalizeCustomPlans(source.customPlans, settings);
  if (typeof source.activePlanId === "string" && getPlan(source.activePlanId, settings)) {
    settings.activePlanId = source.activePlanId;
  }
  const activePlan = getPlan(settings.activePlanId, settings);
  settings.nextDayIdx %= Math.max(1, activePlan?.days.length ?? 1);
  return { settings, logs };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && allowed.includes(value as T);
}

function nonNegativeInt(value: unknown): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 ? n : null;
}

function positiveInt(value: unknown): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 ? n : null;
}

function stringRecord(value: unknown): Record<string, string> {
  const raw = asRecord(value);
  if (!raw) return {};
  return Object.fromEntries(
    Object.entries(raw).filter((entry): entry is [string, string] => typeof entry[1] === "string")
  );
}

function localizedText(value: unknown): LocalizedText | null {
  const raw = asRecord(value);
  if (!raw || typeof raw.en !== "string") return null;
  return {
    en: raw.en,
    ...(typeof raw.de === "string" ? { de: raw.de } : {}),
  };
}

const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;
const GOALS = [
  "strength", "hypertrophy", "fatLoss", "endurance",
  "functional-longevity", "time-efficient", "weight-loss",
] as const;

/** Keep only complete, internally consistent custom plans from a backup. */
export function normalizeCustomPlans(raw: unknown, settings: Settings): Plan[] {
  if (!Array.isArray(raw)) return [];
  const out: Plan[] = [];
  const seen = new Set<string>();

  for (const value of raw) {
    const plan = asRecord(value);
    if (!plan || typeof plan.id !== "string" || plan.id.trim() === "" || seen.has(plan.id) || PLANS[plan.id]) continue;
    if (typeof plan.name !== "string") continue;
    const tagline = localizedText(plan.tagline);
    if (!tagline || !isOneOf(plan.difficulty, DIFFICULTIES) || !isOneOf(plan.goal, GOALS)) continue;

    const days: PlanDay[] = [];
    for (const dayValue of Array.isArray(plan.days) ? plan.days : []) {
      const day = asRecord(dayValue);
      const name = localizedText(day?.name);
      if (!day || typeof day.id !== "string" || day.id.trim() === "" || !name) continue;

      const warmup = (Array.isArray(day.warmup) ? day.warmup : []).flatMap((stepValue) => {
        const step = asRecord(stepValue);
        const stepName = localizedText(step?.name);
        const detail = localizedText(step?.detail);
        return stepName && detail ? [{ name: stepName, detail }] : [];
      });
      const exercises = (Array.isArray(day.exercises) ? day.exercises : []).flatMap((exerciseValue) => {
        const exercise = asRecord(exerciseValue);
        const sets = positiveInt(exercise?.sets);
        const reps = positiveInt(exercise?.reps);
        const restSecs = nonNegativeInt(exercise?.restSecs);
        return exercise && typeof exercise.exerciseId === "string" && sets && reps && restSecs !== null
          ? [{ exerciseId: exercise.exerciseId, sets, reps, restSecs }]
          : [];
      });
      days.push({ id: day.id, name, warmup, exercises });
    }

    const schedule = asRecord(plan.schedule);
    const rotation: RotationSlot[] = [];
    for (const slotValue of Array.isArray(schedule?.rotation) ? schedule.rotation : []) {
      const slot = asRecord(slotValue);
      if (slot?.type === "rest" || slot?.type === "cardio") {
        rotation.push({ type: slot.type });
      } else if (slot?.type === "workout" && typeof slot.dayId === "string") {
        rotation.push({ type: "workout", dayId: slot.dayId });
      }
    }

    const candidate = normalizePlan({
      id: plan.id,
      name: plan.name,
      tagline,
      difficulty: plan.difficulty,
      daysPerWeek: 0,
      estimatedMins: 0,
      goal: plan.goal,
      schedule: { cycleLength: 7, rotation },
      days,
    });
    if (validatePlan(candidate, settings).length > 0) continue;
    seen.add(candidate.id);
    out.push(candidate);
  }
  return out;
}

const EQUIPMENTS: Equipment[] = ["machine", "cable", "dumbbell", "barbell", "smith", "bodyweight"];

/** Keep only structurally valid custom exercises from a (possibly hand-edited) backup. */
export function normalizeCustomExercises(raw: unknown): Exercise[] {
  if (!Array.isArray(raw)) return [];
  const out: Exercise[] = [];
  const seen = new Set<string>();
  for (const e of raw) {
    if (typeof e !== "object" || e === null) continue;
    const r = e as Record<string, unknown>;
    if (
      typeof r.id !== "string" || r.id.trim() === "" || seen.has(r.id) || EXERCISES[r.id] ||
      typeof r.name !== "string" || r.name.trim() === ""
    ) continue;
    if (typeof r.primaryMuscle !== "string" || r.primaryMuscle === "") continue;
    const muscles = Array.isArray(r.muscles) ? r.muscles.filter((m): m is string => typeof m === "string") : [];
    const equipment = EQUIPMENTS.includes(r.equipment as Equipment) ? (r.equipment as Equipment) : "machine";
    const repType = r.repType === "seconds" ? "seconds" : "reps";
    const num = (v: unknown, fallback: number) => (Number.isFinite(Number(v)) ? Number(v) : fallback);
    const tip = asRecord(r.tip);
    const tipEn = tip?.en;
    const tipDe = tip?.de;
    const exercise: Exercise = {
      id: r.id,
      name: r.name.trim(),
      primaryMuscle: r.primaryMuscle,
      muscles: muscles.includes(r.primaryMuscle) ? muscles : [r.primaryMuscle, ...muscles],
      equipment,
      repType,
      defaultSets: Math.max(1, Math.round(num(r.defaultSets, 3))),
      defaultReps: Math.max(1, Math.round(num(r.defaultReps, 12))),
      restSecs: Math.max(0, Math.round(num(r.restSecs, 90))),
      ...(typeof tipEn === "string" && tipEn.trim()
        ? { tip: { en: tipEn, ...(typeof tipDe === "string" && tipDe.trim() ? { de: tipDe } : {}) } }
        : {}),
    };
    seen.add(exercise.id);
    out.push(exercise);
  }
  return out;
}

// ── CSV export (spreadsheet convenience, display unit) ───────────────────────

function esc(v: string | number): string {
  const s = String(v);
  return s.includes(",") || s.includes('"') || s.includes("\n")
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

export function exportCSV(logs: WorkoutLog[], unit: Unit, settings: Settings): string {
  const rows: (string | number)[][] = [
    ["Date", "Day", "Exercise", "Feel", "Set", `Weight (${unit})`, "Reps", "Completed", "Duration (min)"],
  ];
  for (const log of logs) {
    const date = (log.completedAt || log.startedAt).slice(0, 10);
    const durMin = log.durationSecs ? Math.round(log.durationSecs / 60) : "";
    let first = true;
    for (const ex of log.exercises) {
      const name = resolveExerciseName(ex.exerciseId, settings, ex.nameSnapshot);
      ex.sets.forEach((s, i) => {
        rows.push([
          date, log.dayName, name, ex.feel ?? "", i + 1,
          s.weightKg !== null ? displayWeight(s.weightKg, unit) : "",
          s.reps, s.completed ? "Yes" : "No",
          first && i === 0 ? durMin : "",
        ]);
      });
      first = false;
    }
  }
  return rows.map((r) => r.map(esc).join(",")).join("\n");
}

// ── File download / share ─────────────────────────────────────────────────────

export async function shareOrDownload(content: string, filename: string, mime: string): Promise<void> {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      const file = new File([blob], filename, { type: mime });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: filename });
        return;
      }
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return;
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
