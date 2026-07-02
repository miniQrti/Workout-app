import type { BackupFile, ExerciseLog, Feel, SetLog, Settings, WorkoutLog, Unit } from "../types";
import { SCHEMA_VERSION } from "../types";
import { displayWeight } from "../lib/units";
import { parseDate } from "../lib/dates";
import { exerciseName } from "../data/exercises";

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
  return { settings, logs };
}

// ── CSV export (spreadsheet convenience, display unit) ───────────────────────

function esc(v: string | number): string {
  const s = String(v);
  return s.includes(",") || s.includes('"') || s.includes("\n")
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

export function exportCSV(logs: WorkoutLog[], unit: Unit): string {
  const rows: (string | number)[][] = [
    ["Date", "Day", "Exercise", "Feel", "Set", `Weight (${unit})`, "Reps", "Completed", "Duration (min)"],
  ];
  for (const log of logs) {
    const date = (log.completedAt || log.startedAt).slice(0, 10);
    const durMin = log.durationSecs ? Math.round(log.durationSecs / 60) : "";
    let first = true;
    for (const ex of log.exercises) {
      const name = exerciseName(ex.exerciseId, ex.nameSnapshot);
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
