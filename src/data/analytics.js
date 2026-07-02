import { muscleGroup } from "./exercises.js";

// ── Analytics — pure functions over store.logs ────────────────────────────────
//
// All functions here are side-effect-free and operate on the log shape:
//   { id, startedAt, completedAt, durationSecs, dayName,
//     exercises: [{ exId, feel, sets: [{ weight, reps, completed }] }] }

/**
 * Estimated one-rep max using the Epley formula.
 * Returns null for invalid input; exact weight for a 1-rep set.
 * @param {number} weight
 * @param {number} reps
 * @returns {number|null}
 */
export function epley1RM(weight, reps) {
  const w = parseFloat(weight);
  const r = parseInt(reps, 10);
  if (isNaN(w) || w <= 0 || isNaN(r) || r < 1) return null;
  if (r === 1) return w;
  return Math.round(w * (1 + r / 30));
}

/**
 * Whether a set counts as work: it has valid reps and was not explicitly
 * left uncompleted. Bodyweight/time sets (weight 0 or "") still count.
 * @param {object} set
 * @returns {boolean}
 */
function isWorkSet(set) {
  if (!set || set.completed === false) return false;
  const reps = parseInt(set.reps, 10);
  return !isNaN(reps) && reps >= 1;
}

/**
 * Total weight moved in one session (Σ weight × reps over completed sets).
 * Time-based / bodyweight sets contribute 0.
 * @param {object} log
 * @returns {number}
 */
export function sessionTonnage(log) {
  if (!log || !Array.isArray(log.exercises)) return 0;
  let total = 0;
  for (const entry of log.exercises) {
    if (!entry || !Array.isArray(entry.sets)) continue;
    for (const set of entry.sets) {
      if (!isWorkSet(set)) continue;
      const w = parseFloat(set.weight);
      const r = parseInt(set.reps, 10);
      if (!isNaN(w) && w > 0) total += w * r;
    }
  }
  return Math.round(total);
}

/**
 * Best estimated 1RM per session for one exercise, oldest first.
 * @param {Array} logs
 * @param {string} exId
 * @returns {Array<{date: string, value: number, sessionId: string}>}
 */
export function getE1RMHistory(logs, exId) {
  if (!Array.isArray(logs) || !exId) return [];
  const results = [];
  for (const log of logs) {
    if (!log || !Array.isArray(log.exercises)) continue;
    const entry = log.exercises.find(e => e && e.exId === exId);
    if (!entry || !Array.isArray(entry.sets)) continue;

    let best = null;
    for (const set of entry.sets) {
      const rm = epley1RM(set?.weight, set?.reps);
      if (rm !== null && (best === null || rm > best)) best = rm;
    }
    if (best !== null) {
      results.push({
        date: log.completedAt || log.startedAt || "",
        value: best,
        sessionId: log.id || "",
      });
    }
  }
  return results;
}

/**
 * Monday 00:00 local time of the week containing `date`.
 * @param {Date} date
 * @returns {Date}
 */
export function weekStart(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = Sun
  d.setDate(d.getDate() - ((day + 6) % 7));
  return d;
}

function logDate(log) {
  const d = new Date(log.completedAt || log.startedAt || "");
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Per-week aggregates for the last `numWeeks` calendar weeks (Mon–Sun),
 * oldest first. Weeks without workouts are included with zeros.
 * @param {Array} logs
 * @param {number} numWeeks
 * @returns {Array<{start: Date, sessions: number, sets: number, tonnage: number, durationSecs: number}>}
 */
export function getWeeklySeries(logs, numWeeks = 8) {
  const thisWeek = weekStart(new Date());
  const weeks = [];
  const index = new Map(); // time value → week object

  for (let i = numWeeks - 1; i >= 0; i--) {
    const start = new Date(thisWeek);
    start.setDate(start.getDate() - i * 7);
    const week = { start, sessions: 0, sets: 0, tonnage: 0, durationSecs: 0 };
    weeks.push(week);
    index.set(start.getTime(), week);
  }

  for (const log of logs || []) {
    const d = logDate(log);
    if (!d) continue;
    const week = index.get(weekStart(d).getTime());
    if (!week) continue;
    week.sessions += 1;
    week.tonnage += sessionTonnage(log);
    week.durationSecs += log.durationSecs || 0;
    for (const entry of log.exercises || []) {
      week.sets += (entry?.sets || []).filter(isWorkSet).length;
    }
  }

  return weeks;
}

/**
 * Completed sets per broad muscle group for one calendar week.
 * A set credits its exercise's primary muscle group with 1 and each distinct
 * secondary group with 0.5 — the common "fractional volume" convention.
 *
 * @param {Array}  logs
 * @param {object} exercises  EXERCISES dictionary
 * @param {Date}   [start]    week to count (defaults to the current week)
 * @returns {object} groupId → sets (may be fractional)
 */
export function getMuscleGroupSets(logs, exercises, start = weekStart(new Date())) {
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  const totals = {};

  for (const log of logs || []) {
    const d = logDate(log);
    if (!d || d < start || d >= end) continue;
    for (const entry of log.exercises || []) {
      const ex = exercises?.[entry?.exId];
      if (!ex) continue;
      const setCount = (entry.sets || []).filter(isWorkSet).length;
      if (setCount === 0) continue;

      const primaryGroup = muscleGroup(ex.primaryMuscle);
      totals[primaryGroup] = (totals[primaryGroup] || 0) + setCount;

      const secondaryGroups = new Set(
        (ex.muscles || [])
          .filter(m => m !== ex.primaryMuscle)
          .map(muscleGroup)
          .filter(g => g !== primaryGroup)
      );
      for (const g of secondaryGroups) {
        totals[g] = (totals[g] || 0) + setCount * 0.5;
      }
    }
  }

  return totals;
}

/**
 * Day-by-day training map for the last `numWeeks` calendar weeks, for the
 * consistency heatmap. Returns full weeks, oldest first; each week is an
 * array of 7 day cells (Mon → Sun).
 *
 * @param {Array} logs
 * @param {number} numWeeks
 * @returns {Array<Array<{date: Date, sets: number, inFuture: boolean}>>}
 */
export function getTrainingCalendar(logs, numWeeks = 12) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const firstWeek = weekStart(today);
  firstWeek.setDate(firstWeek.getDate() - (numWeeks - 1) * 7);

  // sets completed per local day
  const setsByDay = new Map();
  for (const log of logs || []) {
    const d = logDate(log);
    if (!d) continue;
    d.setHours(0, 0, 0, 0);
    const key = d.getTime();
    let sets = 0;
    for (const entry of log.exercises || []) {
      sets += (entry?.sets || []).filter(isWorkSet).length;
    }
    setsByDay.set(key, (setsByDay.get(key) || 0) + Math.max(sets, 1));
  }

  const weeks = [];
  for (let w = 0; w < numWeeks; w++) {
    const week = [];
    for (let day = 0; day < 7; day++) {
      const date = new Date(firstWeek);
      date.setDate(date.getDate() + w * 7 + day);
      week.push({
        date,
        sets: setsByDay.get(date.getTime()) || 0,
        inFuture: date > today,
      });
    }
    weeks.push(week);
  }
  return weeks;
}

/**
 * Consistency summary across all logs.
 * @param {Array} logs
 * @returns {{totalWorkouts: number, totalTonnage: number, avgDurationSecs: number,
 *            avgPerWeek: number, bestWeek: number}}
 */
export function getConsistencyStats(logs) {
  const valid = (logs || []).filter(l => logDate(l));
  const totalWorkouts = valid.length;

  let totalTonnage = 0;
  let durationSum = 0;
  let durationCount = 0;
  const weekCounts = new Map();

  for (const log of valid) {
    totalTonnage += sessionTonnage(log);
    if (log.durationSecs > 0) {
      durationSum += log.durationSecs;
      durationCount++;
    }
    const wk = weekStart(logDate(log)).getTime();
    weekCounts.set(wk, (weekCounts.get(wk) || 0) + 1);
  }

  let avgPerWeek = 0;
  if (weekCounts.size > 0) {
    const first = Math.min(...weekCounts.keys());
    const spanWeeks = Math.max(1, Math.round((weekStart(new Date()).getTime() - first) / (7 * 86400000)) + 1);
    avgPerWeek = totalWorkouts / spanWeeks;
  }

  return {
    totalWorkouts,
    totalTonnage,
    avgDurationSecs: durationCount ? Math.round(durationSum / durationCount) : 0,
    avgPerWeek,
    bestWeek: weekCounts.size ? Math.max(...weekCounts.values()) : 0,
  };
}

/**
 * Compact display for large weight totals: 12,450 → "12.5k".
 * @param {number} n
 * @returns {string}
 */
export function formatTonnage(n) {
  if (n >= 100000) return `${Math.round(n / 1000)}k`;
  if (n >= 10000)  return `${(n / 1000).toFixed(1)}k`;
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
