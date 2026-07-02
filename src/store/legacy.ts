import type { ExerciseLog, Feel, SetLog, Unit, WorkoutLog } from "../types";
import { toKg } from "../lib/units";
import { dayKey, parseDate } from "../lib/dates";
import { uuid } from "../lib/id";
import { EXERCISES } from "../data/exercises";
import { PLANS } from "../data/plans";

// ── Legacy data ingestion ─────────────────────────────────────────────────────
//
// Two sources, one output shape:
//  1. CSV exported by the previous app version
//     (Date, Plan, Day, Exercise, Feel, Set, Weight (lbs|kg), Reps, Completed, Duration (min))
//  2. The previous version's localStorage blob ("wt-v2"), migrated
//     automatically on first launch.
//
// Legacy weights are converted to canonical kg using the unit the data was
// recorded in (CSV: from the header; localStorage: from the stored setting).

const FEEL_MAP: Record<string, Feel> = {
  easy: "easy", good: "good", hard: "hard", tough: "tough",
  leicht: "easy", gut: "good", schwer: "hard", hart: "tough",
};

function nameToId(): Map<string, string> {
  const m = new Map<string, string>();
  for (const ex of Object.values(EXERCISES)) m.set(ex.name.toLowerCase(), ex.id);
  return m;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function findDayId(planId: string, dayName: string): string {
  const plan = PLANS[planId];
  const hit = plan?.days.find((d) => d.name.en === dayName || d.name.de === dayName);
  return hit?.id ?? slugify(dayName) ?? "unknown";
}

function planIdByName(name: string): string {
  const hit = Object.values(PLANS).find((p) => p.name.toLowerCase() === name.toLowerCase());
  return hit?.id ?? "beginner-3day";
}

// ── CSV parsing ───────────────────────────────────────────────────────────────

function parseCSVRow(line: string): string[] {
  const cells: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (c === "," && !inQ) {
      cells.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  cells.push(cur);
  return cells;
}

/**
 * Parse a legacy CSV export into WorkoutLogs (kg-canonical, oldest first).
 * Throws if the header doesn't look like a legacy export.
 */
export function parseLegacyCSV(text: string): WorkoutLog[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const header = parseCSVRow(lines[0] ?? "").map((h) => h.trim().toLowerCase());
  const col = (name: string) => header.findIndex((h) => h === name || h.startsWith(`${name} (`) || h.startsWith(`${name}(`));
  const C = {
    date: col("date"), plan: col("plan"), day: col("day"), exercise: col("exercise"),
    feel: col("feel"), set: col("set"), weight: col("weight"), reps: col("reps"),
    completed: col("completed"), duration: col("duration"),
  };
  if (C.date < 0 || C.exercise < 0 || C.weight < 0 || C.reps < 0) {
    throw new Error("unrecognized CSV header");
  }

  const weightHeader = header[C.weight] ?? "";
  const unit: Unit = weightHeader.includes("kg") ? "kg" : "lb";

  const names = nameToId();

  interface Sess {
    date: string;
    planName: string;
    dayName: string;
    durationSecs: number;
    exercises: Map<string, { feel: Feel | null; nameSnapshot?: string; sets: (SetLog | null)[] }>;
  }
  const sessions = new Map<string, Sess>();

  for (let i = 1; i < lines.length; i++) {
    const line = (lines[i] ?? "").trim();
    if (!line) continue;
    const cells = parseCSVRow(line);
    const cell = (idx: number) => (idx >= 0 ? (cells[idx] ?? "").trim() : "");

    const date = cell(C.date);
    const dayName = cell(C.day) || "Workout";
    if (!date) continue;

    const key = `${date}|${dayName}`;
    let sess = sessions.get(key);
    if (!sess) {
      sess = { date, planName: cell(C.plan), dayName, durationSecs: 0, exercises: new Map() };
      sessions.set(key, sess);
    }
    const durMin = Number(cell(C.duration));
    if (Number.isFinite(durMin) && durMin > 0 && !sess.durationSecs) {
      sess.durationSecs = Math.round(durMin * 60);
    }

    const exName = cell(C.exercise);
    if (!exName) continue;

    let ex = sess.exercises.get(exName);
    if (!ex) {
      ex = { feel: null, sets: [] };
      if (!names.has(exName.toLowerCase())) ex.nameSnapshot = exName;
      sess.exercises.set(exName, ex);
    }
    const feel = FEEL_MAP[cell(C.feel).toLowerCase()];
    if (feel && !ex.feel) ex.feel = feel;

    const setNum = Math.max(1, parseInt(cell(C.set), 10) || ex.sets.length + 1);
    const w = Number(cell(C.weight).replace(",", "."));
    const reps = parseInt(cell(C.reps), 10);
    if (!Number.isFinite(reps) || reps < 1) continue;

    while (ex.sets.length < setNum) ex.sets.push(null);
    ex.sets[setNum - 1] = {
      weightKg: Number.isFinite(w) && w > 0 ? toKg(w, unit) : null,
      reps,
      completed: cell(C.completed).toLowerCase() !== "no",
    };
  }

  const logs: WorkoutLog[] = [];
  for (const sess of sessions.values()) {
    const parsed = new Date(sess.date);
    const when = isNaN(parsed.getTime()) ? new Date() : parsed;
    when.setHours(12, 0, 0, 0);
    const iso = when.toISOString();
    const planId = planIdByName(sess.planName);

    const exercises: ExerciseLog[] = [];
    for (const [exName, e] of sess.exercises) {
      const exerciseId = names.get(exName.toLowerCase()) ?? slugify(exName);
      exercises.push({
        exerciseId,
        ...(e.nameSnapshot ? { nameSnapshot: e.nameSnapshot } : {}),
        feel: e.feel,
        sets: e.sets.filter((s): s is SetLog => s !== null),
      });
    }
    if (exercises.length === 0) continue;

    logs.push({
      id: uuid(),
      planId,
      dayId: findDayId(planId, sess.dayName),
      dayName: sess.dayName,
      startedAt: iso,
      completedAt: iso,
      durationSecs: sess.durationSecs,
      exercises,
    });
  }

  logs.sort((a, b) => a.startedAt.localeCompare(b.startedAt));
  return logs;
}

// ── localStorage migration (previous app version) ─────────────────────────────

interface LegacyStore {
  unit?: string;
  theme?: string;
  accent?: string;
  lang?: string;
  activePlanId?: string;
  nextDayIdx?: number;
  logs?: LegacyLog[];
}
interface LegacyLog {
  id?: string;
  planId?: string;
  dayIdx?: number;
  dayName?: string;
  startedAt?: string;
  completedAt?: string;
  durationSecs?: number;
  exercises?: { exId?: string; feel?: string; sets?: { weight?: string; reps?: string; completed?: boolean }[] }[];
}

export interface LegacyMigration {
  logs: WorkoutLog[];
  settings: Partial<{ unit: Unit; theme: "light" | "dark"; accent: string; lang: string; activePlanId: string; nextDayIdx: number }>;
}

/** Convert the old app's localStorage blob. Returns null if absent/invalid. */
export function migrateLegacyLocalStorage(raw: string | null): LegacyMigration | null {
  if (!raw) return null;
  let parsed: LegacyStore;
  try {
    parsed = JSON.parse(raw) as LegacyStore;
  } catch {
    return null;
  }
  const unit: Unit = parsed.unit === "kg" ? "kg" : "lb";

  const logs: WorkoutLog[] = [];
  for (const l of parsed.logs ?? []) {
    const started = parseDate(l.startedAt) ?? parseDate(l.completedAt);
    if (!started) continue;
    const planId = l.planId && PLANS[l.planId] ? l.planId : "beginner-3day";
    const day = PLANS[planId]?.days[l.dayIdx ?? 0];

    const exercises: ExerciseLog[] = [];
    for (const e of l.exercises ?? []) {
      if (!e.exId) continue;
      const sets: SetLog[] = [];
      for (const s of e.sets ?? []) {
        const reps = parseInt(String(s.reps ?? ""), 10);
        if (!Number.isFinite(reps) || reps < 1) continue;
        const w = Number(String(s.weight ?? "").replace(",", "."));
        sets.push({
          weightKg: Number.isFinite(w) && w > 0 ? toKg(w, unit) : null,
          reps,
          completed: s.completed !== false,
        });
      }
      exercises.push({
        exerciseId: e.exId,
        ...(EXERCISES[e.exId] ? {} : { nameSnapshot: e.exId }),
        feel: FEEL_MAP[(e.feel ?? "").toLowerCase()] ?? null,
        sets,
      });
    }
    if (exercises.length === 0) continue;

    logs.push({
      id: l.id ?? uuid(),
      planId,
      dayId: day?.id ?? "unknown",
      dayName: l.dayName ?? day?.name.en ?? "Workout",
      startedAt: started.toISOString(),
      completedAt: parseDate(l.completedAt)?.toISOString() ?? started.toISOString(),
      durationSecs: l.durationSecs ?? 0,
      exercises,
    });
  }
  logs.sort((a, b) => a.startedAt.localeCompare(b.startedAt));

  return {
    logs,
    settings: {
      unit,
      ...(parsed.theme === "dark" ? { theme: "dark" as const } : {}),
      ...(parsed.accent ? { accent: parsed.accent } : {}),
      ...(parsed.lang ? { lang: parsed.lang } : {}),
      ...(parsed.activePlanId && PLANS[parsed.activePlanId] ? { activePlanId: parsed.activePlanId } : {}),
      ...(typeof parsed.nextDayIdx === "number" ? { nextDayIdx: parsed.nextDayIdx } : {}),
    },
  };
}

// ── Merge with dedupe ─────────────────────────────────────────────────────────

/**
 * Merge imported logs into existing ones. A log is a duplicate if another log
 * exists on the same local day with the same day name.
 */
export function mergeLogs(
  existing: WorkoutLog[],
  imported: WorkoutLog[]
): { merged: WorkoutLog[]; added: number; skipped: number } {
  const seen = new Set(
    existing.map((l) => {
      const d = parseDate(l.completedAt) ?? parseDate(l.startedAt);
      return `${d ? dayKey(d) : "?"}|${l.dayName}`;
    })
  );
  const toAdd: WorkoutLog[] = [];
  for (const log of imported) {
    const d = parseDate(log.completedAt) ?? parseDate(log.startedAt);
    const key = `${d ? dayKey(d) : "?"}|${log.dayName}`;
    if (seen.has(key)) continue;
    seen.add(key);
    toAdd.push(log);
  }
  const merged = [...existing, ...toAdd].sort((a, b) => a.startedAt.localeCompare(b.startedAt));
  return { merged, added: toAdd.length, skipped: imported.length - toAdd.length };
}
