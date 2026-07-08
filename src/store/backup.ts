import type { BackupFile, Equipment, Exercise, ExerciseLog, Feel, SetLog, Settings, WorkoutLog, Unit } from "../types";
import { SCHEMA_VERSION } from "../types";
import { displayWeight } from "../lib/units";
import { parseDate } from "../lib/dates";
import { resolveExerciseName } from "../data/exerciseResolver";
import { normalizeCycleSettings } from "./cycle";

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
    completedAt: typeof r.completedAt === "string" ? r.completedAt : (r.startedAt as string),
    durationSecs: Number.isFinite(Number(r.durationSecs)) ? Number(r.durationSecs) : 0,
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

  const settings: Settings = {
    ...defaults,
    ...(typeof raw.settings === "object" && raw.settings !== null ? raw.settings : {}),
  };
  // Sanitize the nested cycle object — a hand-edited backup could carry garbage.
  settings.cycle = normalizeCycleSettings(settings.cycle);
  // Drop malformed custom exercises so one bad entry can't corrupt resolution.
  if (settings.customExercises !== undefined) {
    settings.customExercises = normalizeCustomExercises(settings.customExercises);
  }
  return { settings, logs };
}

const EQUIPMENTS: Equipment[] = ["machine", "cable", "dumbbell", "barbell", "smith", "bodyweight"];

/** Keep only structurally valid custom exercises from a (possibly hand-edited) backup. */
export function normalizeCustomExercises(raw: unknown): Exercise[] {
  if (!Array.isArray(raw)) return [];
  const out: Exercise[] = [];
  for (const e of raw) {
    if (typeof e !== "object" || e === null) continue;
    const r = e as Record<string, unknown>;
    if (typeof r.id !== "string" || typeof r.name !== "string" || r.name.trim() === "") continue;
    if (typeof r.primaryMuscle !== "string" || r.primaryMuscle === "") continue;
    const muscles = Array.isArray(r.muscles) ? r.muscles.filter((m): m is string => typeof m === "string") : [];
    const equipment = EQUIPMENTS.includes(r.equipment as Equipment) ? (r.equipment as Equipment) : "machine";
    const repType = r.repType === "seconds" ? "seconds" : "reps";
    const num = (v: unknown, fallback: number) => (Number.isFinite(Number(v)) ? Number(v) : fallback);
    const tipEn = typeof r.tip === "object" && r.tip !== null ? (r.tip as Record<string, unknown>).en : undefined;
    out.push({
      id: r.id,
      name: r.name,
      primaryMuscle: r.primaryMuscle,
      muscles: muscles.includes(r.primaryMuscle) ? muscles : [r.primaryMuscle, ...muscles],
      equipment,
      repType,
      defaultSets: Math.max(1, Math.round(num(r.defaultSets, 3))),
      defaultReps: Math.max(1, Math.round(num(r.defaultReps, 12))),
      restSecs: Math.max(0, Math.round(num(r.restSecs, 90))),
      ...(typeof tipEn === "string" && tipEn.trim() ? { tip: { en: tipEn } } : {}),
    });
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
