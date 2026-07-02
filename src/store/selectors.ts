import type { Feel, SetLog, WorkoutLog } from "../types";
import { parseDate } from "../lib/dates";

// ── Derived data layer ────────────────────────────────────────────────────────
//
// The exercise index is built ONCE per logs change (memoized by the caller)
// and every selector reads from it — nothing re-scans the raw log array.

export interface SessionEntry {
  logId: string;
  date: Date;
  feel: Feel | null;
  sets: SetLog[];
  /** Heaviest completed set, kg (null if all sets are bodyweight/timed). */
  topWeightKg: number | null;
  /** Best Epley estimated 1RM across the session's sets, kg. */
  bestE1RMKg: number | null;
}

export type ExerciseIndex = Map<string, SessionEntry[]>;

export function epley1RMKg(weightKg: number, reps: number): number {
  if (reps <= 1) return weightKg;
  return weightKg * (1 + reps / 30);
}

function completedSets(sets: SetLog[]): SetLog[] {
  return sets.filter((s) => s.completed && s.reps >= 1);
}

/** Build the per-exercise session index, chronological (oldest first). */
export function buildExerciseIndex(logs: WorkoutLog[]): ExerciseIndex {
  const index: ExerciseIndex = new Map();
  for (const log of logs) {
    const date = parseDate(log.completedAt) ?? parseDate(log.startedAt);
    if (!date) continue;
    for (const ex of log.exercises) {
      const done = completedSets(ex.sets);
      if (done.length === 0 && ex.sets.length === 0) continue;

      let top: number | null = null;
      let e1rm: number | null = null;
      for (const s of done) {
        if (s.weightKg === null) continue;
        if (top === null || s.weightKg > top) top = s.weightKg;
        const rm = epley1RMKg(s.weightKg, s.reps);
        if (e1rm === null || rm > e1rm) e1rm = rm;
      }

      const entry: SessionEntry = {
        logId: log.id,
        date,
        feel: ex.feel,
        sets: ex.sets,
        topWeightKg: top,
        bestE1RMKg: e1rm,
      };
      const list = index.get(ex.exerciseId);
      if (list) list.push(entry);
      else index.set(ex.exerciseId, [entry]);
    }
  }
  return index;
}

// ── PRs ───────────────────────────────────────────────────────────────────────

export interface PR {
  weightKg: number;
  reps: number;
  e1rmKg: number;
  date: Date;
}

/** Personal record: heaviest completed set; ties broken by reps. */
export function getPR(index: ExerciseIndex, exerciseId: string): PR | null {
  let best: PR | null = null;
  for (const entry of index.get(exerciseId) ?? []) {
    for (const s of completedSets(entry.sets)) {
      if (s.weightKg === null) continue;
      if (!best || s.weightKg > best.weightKg || (s.weightKg === best.weightKg && s.reps > best.reps)) {
        best = { weightKg: s.weightKg, reps: s.reps, e1rmKg: epley1RMKg(s.weightKg, s.reps), date: entry.date };
      }
    }
  }
  return best;
}

/** All PRs, heaviest first. */
export function allPRs(index: ExerciseIndex): Map<string, PR> {
  const out = new Map<string, PR>();
  for (const exId of index.keys()) {
    const pr = getPR(index, exId);
    if (pr) out.set(exId, pr);
  }
  return out;
}

/** Most recent session entry for an exercise. */
export function lastEntry(index: ExerciseIndex, exerciseId: string): SessionEntry | null {
  const list = index.get(exerciseId);
  return list && list.length > 0 ? list[list.length - 1]! : null;
}

/**
 * Exercises whose PR was beaten by the given log (used for the summary).
 * `before` is the index built WITHOUT this log.
 */
export function detectNewPRs(
  before: ExerciseIndex,
  log: WorkoutLog
): { exerciseId: string; weightKg: number; reps: number }[] {
  const out: { exerciseId: string; weightKg: number; reps: number }[] = [];
  for (const ex of log.exercises) {
    const prev = getPR(before, ex.exerciseId);
    let best: SetLog | null = null;
    for (const s of completedSets(ex.sets)) {
      if (s.weightKg === null) continue;
      if (!best || s.weightKg > (best.weightKg ?? 0)) best = s;
    }
    if (best?.weightKg != null && (!prev || best.weightKg > prev.weightKg)) {
      out.push({ exerciseId: ex.exerciseId, weightKg: best.weightKg, reps: best.reps });
    }
  }
  return out;
}
