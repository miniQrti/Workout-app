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
    theme: "light",
    accent: "green",
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
      if (isNaN(weight) || weight <= 0 || isNaN(reps) || reps < 1) continue;
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

// ── CSV Export ───────────────────────────────────────────────────────────────

/**
 * Build a CSV string from all workout logs.
 * Each row = one set. Duration is shown only on the first row of each session.
 *
 * @param {Array}  logs      - store.logs
 * @param {object} exercises - EXERCISES dictionary
 * @param {object} plans     - PLANS dictionary
 * @param {string} unit      - "lbs" | "kg"
 * @returns {string} CSV content, or null if there's nothing to export
 */
export function exportWorkoutCSV(logs, exercises, plans, unit = "lbs") {
  if (!Array.isArray(logs) || logs.length === 0) return null;

  const headers = [
    "Date",
    "Plan",
    "Day",
    "Exercise",
    "Set",
    `Weight (${unit})`,
    "Reps",
    "Completed",
    "Duration (min)",
  ];

  const esc = v => {
    const s = String(v ?? "");
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };

  const rows = [];

  for (const log of logs) {
    const raw       = log.completedAt || log.startedAt || "";
    const dateLabel = raw
      ? new Date(raw).toLocaleDateString("en-US", {
          year: "numeric", month: "short", day: "numeric",
        })
      : "";
    const planName    = plans?.[log.planId]?.name || log.planId || "";
    const dayName     = log.dayName || "";
    const durationMin = log.durationSecs ? Math.round(log.durationSecs / 60) : "";

    if (!Array.isArray(log.exercises) || log.exercises.length === 0) {
      rows.push([dateLabel, planName, dayName, "", "", "", "", "", durationMin]);
      continue;
    }

    let sessionFirstRow = true;

    for (const entry of log.exercises) {
      const exName = exercises?.[entry.exId]?.name || entry.exId || "";

      if (!Array.isArray(entry.sets) || entry.sets.length === 0) {
        rows.push([dateLabel, planName, dayName, exName, "", "", "", "", sessionFirstRow ? durationMin : ""]);
        sessionFirstRow = false;
        continue;
      }

      for (let i = 0; i < entry.sets.length; i++) {
        const s = entry.sets[i] || {};
        rows.push([
          dateLabel,
          planName,
          dayName,
          exName,
          i + 1,
          s.weight ?? "",
          s.reps   ?? "",
          s.completed === true ? "Yes" : s.completed === false ? "No" : "",
          sessionFirstRow && i === 0 ? durationMin : "",
        ]);
      }
      sessionFirstRow = false;
    }
  }

  return [
    headers.map(esc).join(","),
    ...rows.map(r => r.map(esc).join(",")),
  ].join("\n");
}

/**
 * Trigger a CSV file share/download in the browser.
 * On iOS Safari uses the native Web Share API (share sheet).
 * Falls back to a hidden <a download> on desktop.
 *
 * @param {string} csvContent
 * @param {string} filename
 */
export async function shareOrDownloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  // iOS / mobile: prefer native share sheet so the user can save to Files, AirDrop, etc.
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      const file = new File([blob], filename, { type: "text/csv" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "Workout Log" });
        return;
      }
    } catch (e) {
      if (e?.name === "AbortError") return; // user dismissed the share sheet
      // otherwise fall through to link download
    }
  }

  // Desktop / fallback: trigger file download via hidden anchor
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Smart progression suggestion for next session, based on the last logged
 * session for this exercise. Returns null if no history exists.
 *
 * Rules (mimic a personal trainer):
 *  • All sets completed + felt Easy  → +10 lb
 *  • All sets completed + felt Good  → +5 lb
 *  • All sets completed + felt Hard  → hold
 *  • All sets completed + felt Tough → −5 lb (deload)
 *  • All sets completed + no feel    → +5 lb (default progression)
 *  • Not all sets completed          → hold (earn the weight first)
 *
 * @param {Array}  logs
 * @param {string} exId
 * @returns {{ suggestedWeight: number, lastWeight: number, action: "increase"|"hold"|"decrease", reason: string } | null}
 */
export function getProgressionSuggestion(logs, exId) {
  if (!Array.isArray(logs) || !exId) return null;

  for (let i = logs.length - 1; i >= 0; i--) {
    const log = logs[i];
    if (!log?.exercises) continue;
    const entry = log.exercises.find(e => e?.exId === exId);
    if (!entry?.sets?.length) continue;

    const weightSets = entry.sets.filter(s => {
      const w = parseFloat(s.weight);
      return !isNaN(w) && w > 0;
    });
    if (weightSets.length === 0) continue;

    const lastWeight    = Math.max(...weightSets.map(s => parseFloat(s.weight)));
    const allCompleted  = entry.sets.every(s => s.completed !== false);
    const feel          = entry.feel || "";

    let suggestedWeight = lastWeight;
    let action          = "hold";
    let reason          = "";

    if (allCompleted) {
      if (feel === "Easy") {
        suggestedWeight = lastWeight + 10;
        action = "increase";
        reason = "felt easy — bigger jump";
      } else if (feel === "Tough") {
        suggestedWeight = Math.max(lastWeight - 5, 0);
        action = "decrease";
        reason = "was very tough — back off slightly";
      } else if (feel === "Hard") {
        suggestedWeight = lastWeight;
        action = "hold";
        reason = "still challenging — hold weight";
      } else {
        // Good or no feel recorded
        suggestedWeight = lastWeight + 5;
        action = "increase";
        reason = feel === "Good" ? "felt good — move up" : "all sets complete";
      }
    } else {
      suggestedWeight = lastWeight;
      action = "hold";
      reason = "complete all sets before adding weight";
    }

    return { suggestedWeight, lastWeight, action, reason, feel };
  }

  return null;
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
