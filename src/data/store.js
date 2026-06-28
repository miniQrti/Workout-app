import { EXERCISES } from "./exercises.js";

const STORE_KEY = "wt-v2";

/**
 * Returns a default fresh store with no history.
 * @returns {object}
 */
export function freshStore() {
  return {
    activePlanId: "beginner-3day",
    nextDayIdx: 0,
    unit: "lbs",
    logs: [],
    swaps: {},
  };
}

/**
 * Load the store from localStorage. Returns freshStore() if nothing is saved
 * or if the saved data is unparseable.
 * @returns {object}
 */
export function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return freshStore();
    const parsed = JSON.parse(raw);
    // Merge with defaults so new fields appear on first load after an upgrade
    return Object.assign({}, freshStore(), parsed);
  } catch {
    return freshStore();
  }
}

/**
 * Persist the store to localStorage.
 * @param {object} store
 */
export function saveStore(store) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    // Silently ignore storage quota or access errors (private browsing etc.)
  }
}

/**
 * Get all logged sets for a given exercise across all sessions, sorted
 * chronologically (oldest first) so callers can chart progress over time.
 *
 * Each log entry is expected to have the shape:
 *   { id, planId, dayIdx, startedAt, completedAt, exercises: [{ exId, sets: [{weight, reps}] }] }
 *
 * @param {Array} logs  - store.logs
 * @param {string} exerciseId
 * @returns {Array<{date: string, weight: number, reps: number, sessionId: string}>}
 */
export function getExerciseHistory(logs, exerciseId) {
  if (!Array.isArray(logs) || !exerciseId) return [];

  const results = [];

  for (const log of logs) {
    if (!log || !Array.isArray(log.exercises)) continue;

    const entry = log.exercises.find((e) => e && e.exId === exerciseId);
    if (!entry || !Array.isArray(entry.sets)) continue;

    // Use the log's completedAt or startedAt timestamp for the date label
    const rawDate = log.completedAt || log.startedAt || null;
    const date = rawDate ? formatDate(rawDate) : "Unknown";
    const sessionId = log.id || String(log.startedAt || "");

    for (const set of entry.sets) {
      if (!set) continue;
      const weight = parseFloat(set.weight);
      const reps = parseInt(set.reps, 10);
      if (isNaN(weight) || isNaN(reps) || reps < 1) continue;
      results.push({ date, weight, reps, sessionId });
    }
  }

  // Sort by the original log order (logs are stored chronologically)
  // The results already follow log order; return as-is.
  return results;
}

/**
 * Get the personal-record set for a given exercise: the highest weight logged
 * with at least 1 rep. Ties broken by most reps.
 *
 * @param {Array} logs
 * @param {string} exerciseId
 * @returns {{weight: number, reps: number, date: string} | null}
 */
export function getPR(logs, exerciseId) {
  const history = getExerciseHistory(logs, exerciseId);
  if (history.length === 0) return null;

  let best = null;
  for (const entry of history) {
    if (
      best === null ||
      entry.weight > best.weight ||
      (entry.weight === best.weight && entry.reps > best.reps)
    ) {
      best = entry;
    }
  }
  return best ? { weight: best.weight, reps: best.reps, date: best.date } : null;
}

/**
 * Get the sets logged for a given exercise in the most recently completed
 * session that included that exercise.
 *
 * @param {Array} logs
 * @param {string} exerciseId
 * @returns {{sets: Array<{weight: number, reps: number}>} | null}
 */
export function getLastSession(logs, exerciseId) {
  if (!Array.isArray(logs) || !exerciseId) return null;

  // Iterate in reverse so we find the most recent session first
  for (let i = logs.length - 1; i >= 0; i--) {
    const log = logs[i];
    if (!log || !Array.isArray(log.exercises)) continue;

    const entry = log.exercises.find((e) => e && e.exId === exerciseId);
    if (!entry || !Array.isArray(entry.sets) || entry.sets.length === 0) continue;

    const sets = entry.sets
      .filter((s) => s != null)
      .map((s) => ({
        weight: parseFloat(s.weight) || 0,
        reps: parseInt(s.reps, 10) || 0,
      }));

    return { sets };
  }

  return null;
}

/**
 * Get the list of exercises for a given day of a plan, with any saved
 * per-session swaps applied. Returns a new array — does not mutate the plan.
 *
 * Swaps are stored in store.swaps keyed as "planId:dayIdx:originalExId".
 * The replacement exercise must exist in EXERCISES; if not, the original is kept.
 *
 * @param {object} plan   - a plan object from PLANS
 * @param {number} dayIdx - 0-based index into plan.days
 * @param {object} swaps  - store.swaps
 * @returns {Array<{exId: string, sets: number, reps: number, restSecs: number}>}
 */
export function getDayExercises(plan, dayIdx, swaps) {
  if (!plan || !Array.isArray(plan.days)) return [];

  const day = plan.days[dayIdx];
  if (!day || !Array.isArray(day.exercises)) return [];

  const safeSwaps = swaps && typeof swaps === "object" ? swaps : {};

  return day.exercises.map((ex) => {
    if (!ex) return null;

    const swapKey = `${plan.id}:${dayIdx}:${ex.exId}`;
    const replacementId = safeSwaps[swapKey];

    // Only apply the swap if the replacement exercise actually exists
    const resolvedExId =
      replacementId && EXERCISES[replacementId] ? replacementId : ex.exId;

    return {
      exId: resolvedExId,
      sets: ex.sets,
      reps: ex.reps,
      restSecs: ex.restSecs,
    };
  }).filter(Boolean);
}

// ── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Format an ISO timestamp or ms-since-epoch number into a short human-readable
 * date string like "Jun 28".
 * @param {string|number} raw
 * @returns {string}
 */
function formatDate(raw) {
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return String(raw);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return String(raw);
  }
}
