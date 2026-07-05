import type { CycleSettings } from "../types";
import { addDays, dayKey, daysBetween, parseDayKey, startOfDay } from "../lib/dates";
import type { Suggestion } from "./progression";

// ── Menstrual-cycle awareness (opt-in, on-device) ─────────────────────────────
//
// Pure module: given the user's CycleSettings and "today", derive the current
// cycle day/phase, a coaching "tone", and period-day predictions. Everything is
// supportive and informational — it never blocks training. The luteal phase has
// a roughly fixed ~14-day length, so ovulation is anchored to `length − 14`
// rather than a naive "day 14" (which is only correct for a 28-day cycle).

export type CyclePhase = "menstrual" | "follicular" | "ovulation" | "luteal";
export type CoachTone = "low" | "neutral" | "high";

export const CYCLE_MIN = 21;
export const CYCLE_MAX = 40;
export const PERIOD_MIN = 1;
export const PERIOD_MAX = 10;
const MAX_STARTS = 24;
/** Predictions are dropped once the period is this many days overdue. */
export const OVERDUE_HIDE_DAYS = 7;

export function defaultCycleSettings(): CycleSettings {
  return {
    enabled: false,
    adaptiveCoaching: true,
    forecast: true,
    cycleLength: 28,
    periodLength: 5,
    periodStarts: [],
  };
}

function clampInt(v: unknown, min: number, max: number, fallback: number): number {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

/**
 * Coerce arbitrary/untrusted input (restored backup, older persisted blob) into
 * a valid CycleSettings: clamp lengths, keep only well-formed non-future date
 * keys, sort ascending, dedupe, cap the history.
 */
export function normalizeCycleSettings(raw: unknown): CycleSettings {
  const d = defaultCycleSettings();
  if (typeof raw !== "object" || raw === null) return d;
  const r = raw as Record<string, unknown>;
  const todayKey = dayKey(new Date());

  const starts = Array.isArray(r.periodStarts) ? r.periodStarts : [];
  const cleanStarts = [...new Set(
    starts
      .filter((s): s is string => typeof s === "string" && parseDayKey(s) !== null)
      .filter((s) => s <= todayKey) // dayKeys are lexically ordered
  )].sort().slice(-MAX_STARTS);

  return {
    enabled: r.enabled === true,
    adaptiveCoaching: r.adaptiveCoaching !== false,
    forecast: r.forecast !== false,
    cycleLength: clampInt(r.cycleLength, CYCLE_MIN, CYCLE_MAX, d.cycleLength),
    periodLength: clampInt(r.periodLength, PERIOD_MIN, PERIOD_MAX, d.periodLength),
    periodStarts: cleanStarts,
  };
}

/** Append a period-start date; dedupe same day, keep sorted, cap history. */
export function withPeriodStart(cycle: CycleSettings, date: Date): CycleSettings {
  const next = [...new Set([...cycle.periodStarts, dayKey(date)])].sort().slice(-MAX_STARTS);
  return { ...cycle, periodStarts: next };
}

/** Replace the most recent logged start (used by the "edit last period" input). */
export function withLastPeriodStart(cycle: CycleSettings, key: string): CycleSettings {
  const rest = cycle.periodStarts.slice(0, -1);
  const next = [...new Set([...rest, key])].sort().slice(-MAX_STARTS);
  return { ...cycle, periodStarts: next };
}

/**
 * Effective cycle length: the mean of up to the last 3 *plausible* intervals
 * between logged starts (21–40 days — implausible gaps are missed logs, not
 * real cycles), falling back to the configured length. Always clamped.
 */
export function effectiveCycleLength(cycle: CycleSettings): number {
  const dates = cycle.periodStarts
    .map(parseDayKey)
    .filter((d): d is Date => d !== null);

  const intervals: number[] = [];
  for (let i = dates.length - 1; i > 0 && intervals.length < 3; i--) {
    const gap = daysBetween(dates[i - 1]!, dates[i]!);
    if (gap >= CYCLE_MIN && gap <= CYCLE_MAX) intervals.push(gap);
  }
  if (intervals.length === 0) {
    return clampInt(cycle.cycleLength, CYCLE_MIN, CYCLE_MAX, 28);
  }
  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  return clampInt(mean, CYCLE_MIN, CYCLE_MAX, 28);
}

/** Phase for a 1-based day-in-cycle. `length` and `periodLength` are effective. */
export function phaseOfDay(day: number, length: number, periodLength: number): CyclePhase {
  const ovu = length - 14;
  // Precedence resolves collapsed windows for short-cycle / long-period combos.
  if (day <= periodLength) return "menstrual";
  if (day >= Math.max(periodLength + 1, ovu - 1) && day <= ovu + 1) return "ovulation";
  if (day <= ovu - 2) return "follicular";
  return "luteal"; // includes any day > length (overdue)
}

/** Coaching tone for a 1-based day-in-cycle. */
export function toneOfDay(day: number, length: number, periodLength: number): CoachTone {
  const ovu = length - 14;
  // Low wins over high on overlap (short cycles can collide the windows).
  if (day <= periodLength) return "low";           // menstrual
  if (day > length) return "low";                  // overdue → pre-period state
  if (day >= length - 2) return "low";             // last 3 luteal days
  if (day >= ovu - 4 && day <= ovu + 1) return "high"; // late follicular + ovulation
  return "neutral";
}

export interface CycleInfo {
  day: number;             // 1-based; can exceed length when overdue
  phase: CyclePhase;
  tone: CoachTone;
  length: number;          // effective
  lastStart: Date;         // local midnight
  nextStart: Date;         // predicted
  daysUntilNext: number;   // negative when overdue
}

/** Current cycle state, or null when disabled / no period logged. */
export function cycleInfo(cycle: CycleSettings, today: Date = new Date()): CycleInfo | null {
  if (!cycle.enabled) return null;
  const dates = cycle.periodStarts.map(parseDayKey).filter((d): d is Date => d !== null);
  if (dates.length === 0) return null;

  const lastStart = startOfDay(dates[dates.length - 1]!);
  const t = startOfDay(today);
  const length = effectiveCycleLength(cycle);
  const day = daysBetween(lastStart, t) + 1; // day 1 = the start day itself
  if (day < 1) return null; // last start is in the future (shouldn't happen post-normalize)

  const nextStart = addDays(lastStart, length);
  return {
    day,
    phase: phaseOfDay(day, length, cycle.periodLength),
    tone: toneOfDay(day, length, cycle.periodLength),
    length,
    lastStart,
    nextStart,
    daysUntilNext: daysBetween(t, nextStart),
  };
}

/** Whole days since the most recent logged period start, or null if none. */
export function daysSinceLastPeriod(cycle: CycleSettings, today: Date = new Date()): number | null {
  const dates = cycle.periodStarts.map(parseDayKey).filter((d): d is Date => d !== null);
  if (dates.length === 0) return null;
  return daysBetween(dates[dates.length - 1]!, today);
}

/** Phase for an arbitrary date (past or future), for forecasting on the strip. */
export function phaseForDate(cycle: CycleSettings, date: Date): CyclePhase | null {
  if (!cycle.enabled) return null;
  const dates = cycle.periodStarts.map(parseDayKey).filter((d): d is Date => d !== null);
  if (dates.length === 0) return null;
  const lastStart = startOfDay(dates[dates.length - 1]!);
  const length = effectiveCycleLength(cycle);
  const diff = daysBetween(lastStart, startOfDay(date));
  const day = ((diff % length) + length) % length + 1; // 1-based, wrapped
  return phaseOfDay(day, length, cycle.periodLength);
}

/**
 * Whether `date` falls on a period day — the current/most-recent period, or a
 * predicted future one. Predictions are suppressed once the current cycle is
 * more than a week overdue (stale forecast).
 */
export function isPeriodDay(cycle: CycleSettings, date: Date): boolean {
  if (!cycle.enabled) return false;
  const dates = cycle.periodStarts.map(parseDayKey).filter((d): d is Date => d !== null);
  if (dates.length === 0) return false;

  const lastStart = startOfDay(dates[dates.length - 1]!);
  const length = effectiveCycleLength(cycle);
  const P = cycle.periodLength;
  const target = startOfDay(date);
  const diff = daysBetween(lastStart, target); // 0 = last start day

  if (diff >= 0 && diff < P) return true; // within the current/most-recent period
  if (diff < 0) return false;             // before any logged period

  const overdue = daysBetween(addDays(lastStart, length), startOfDay(new Date()));
  if (overdue > OVERDUE_HIDE_DAYS) return false; // stop predicting from a stale cycle

  const intoCycle = diff % length;
  return intoCycle < P; // predicted future period days
}

/**
 * Single entry point for the two coach call sites: returns a usable tone only
 * when tracking + adaptive coaching are on and a cycle is established.
 */
export function currentTone(cycle: CycleSettings | undefined, today: Date = new Date()): CoachTone {
  if (!cycle?.enabled || !cycle.adaptiveCoaching) return "neutral";
  return cycleInfo(cycle, today)?.tone ?? "neutral";
}

/**
 * Soften a progression suggestion for the current phase. In a "low" phase an
 * `increase` becomes a `hold` at the *last* weight (never the bumped one) with a
 * supportive reason. Deloads, decreases, and gate-based holds are never touched;
 * "high"/"neutral" pass through unchanged (the PR-window hint is the caller's job).
 */
export function applyCycleTone(s: Suggestion | null, tone: CoachTone): Suggestion | null {
  if (!s || tone !== "low" || s.action !== "increase") return s;
  return {
    ...s,
    action: "hold",
    weightKg: s.lastWeightKg,
    reasonKey: "coach.cycle_hold",
    reasonVars: undefined,
  };
}
