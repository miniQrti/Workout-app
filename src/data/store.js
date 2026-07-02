import { EXERCISES } from "./exercises.js";
import { PROGRESSION, EXERCISE_NOTES } from "./trainerKb.js";

const STORE_KEY = "wt-v2";

/**
 * Returns a default fresh store with no history.
 * @returns {object}
 */
export function freshStore() {
  return {
    activePlanId: "beginner-3day",
    nextDayIdx: 0,
    rotationIdx: 0,
    unit: "lbs",
    theme: "light",
    accent: "green",
    lang: "en",
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
  } catch (e) {
    console.warn("[workout] Could not save to localStorage:", e?.message || e);
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
    "Feel",
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
      rows.push([dateLabel, planName, dayName, "", "", "", "", "", "", durationMin]);
      continue;
    }

    let sessionFirstRow = true;

    for (const entry of log.exercises) {
      const exName = exercises?.[entry.exId]?.name || entry.exId || "";
      const feel   = entry.feel || "";

      if (!Array.isArray(entry.sets) || entry.sets.length === 0) {
        rows.push([dateLabel, planName, dayName, exName, feel, "", "", "", "", sessionFirstRow ? durationMin : ""]);
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
          feel,
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
 * Trainer-grade progression suggestion.
 *
 * Priority order:
 *  1. Deload — 2+ consecutive "Tough" sessions → 85% of last weight
 *  2. Completion gate — not all sets completed → hold
 *  3. Rep gate — didn't hit target reps on every set → hold
 *  4. Fatigue gate — weight dropped mid-workout (e.g. 90→80 lb) → hold
 *  5. Feel-based jump using muscle-group increments from TRAINER_KB
 *
 * @param {Array}  logs
 * @param {string} exId
 * @param {object} [exercise]  EXERCISES[exId], used for muscle group & rep target
 * @returns {object|null}
 */
export function getProgressionSuggestion(logs, exId, exercise) {
  if (!Array.isArray(logs) || !exId) return null;

  // Collect up to 5 most-recent sessions containing this exercise
  const sessions = [];
  for (let i = logs.length - 1; i >= 0 && sessions.length < 5; i--) {
    const log = logs[i];
    if (!log?.exercises) continue;
    const entry = log.exercises.find(e => e?.exId === exId);
    if (!entry?.sets?.length) continue;
    sessions.push(entry);
  }
  if (sessions.length === 0) return null;

  const last        = sessions[0];
  const feel        = last.feel || "";
  const weightSets  = last.sets.filter(s => parseFloat(s.weight) > 0);
  if (weightSets.length === 0) return null;

  const topWeight   = Math.max(...weightSets.map(s => parseFloat(s.weight)));
  const minWeight   = Math.min(...weightSets.map(s => parseFloat(s.weight)));
  const targetReps  = exercise?.defaultReps || 12;
  const muscle      = exercise?.primaryMuscle || "chest";

  // Epley 1RM estimate
  const avgReps    = weightSets.reduce((a, s) => a + (parseInt(s.reps) || 0), 0) / weightSets.length;
  const estimatedRM = Math.round(topWeight * (1 + avgReps / 30));

  // 1. Deload: 2+ consecutive Tough sessions
  const recentFeels = sessions.slice(0, 3).map(s => s.feel || "");
  if (recentFeels.length >= 2 && recentFeels[0] === "Tough" && recentFeels[1] === "Tough") {
    return {
      suggestedWeight: round5(Math.max(topWeight * 0.85, 0)),
      lastWeight: topWeight, action: "decrease",
      reason: "2 tough sessions in a row — deload to 85%",
      feel, deload: true, repGate: "n/a", estimatedRM,
    };
  }

  // 2. Completion gate
  const allCompleted = last.sets.every(s => s.completed !== false);
  if (!allCompleted) {
    return {
      suggestedWeight: topWeight, lastWeight: topWeight, action: "hold",
      reason: "complete all sets before adding weight",
      feel, deload: false, repGate: "incomplete", estimatedRM,
    };
  }

  // 3. Rep gate — every set must hit target reps
  const allRepsHit  = last.sets.every(s => (parseInt(s.reps) || 0) >= targetReps);
  const someRepsHit = last.sets.some(s => (parseInt(s.reps) || 0) >= targetReps);
  if (!allRepsHit) {
    return {
      suggestedWeight: topWeight, lastWeight: topWeight, action: "hold",
      reason: `hit ${targetReps} reps on every set first`,
      feel, deload: false, repGate: someRepsHit ? "partial" : "failed", estimatedRM,
    };
  }

  // 4. Fatigue gate — weight dropped mid-workout
  if (minWeight < topWeight) {
    return {
      suggestedWeight: topWeight, lastWeight: topWeight, action: "hold",
      reason: "weight dropped mid-workout — build consistency first",
      feel, deload: false, repGate: "passed", estimatedRM,
    };
  }

  // 5. Feel-based progression using KB increments
  const prog     = PROGRESSION[muscle] || PROGRESSION["chest"];
  const cap      = EXERCISE_NOTES[exId]?.progressionCap ?? Infinity;

  if (feel === "Easy") {
    return {
      suggestedWeight: round5(topWeight + Math.min(prog.easyJump, cap)),
      lastWeight: topWeight, action: "increase",
      reason: "felt easy — bigger jump",
      feel, deload: false, repGate: "passed", estimatedRM,
    };
  }
  if (feel === "Tough") {
    return {
      suggestedWeight: round5(Math.max(topWeight - prog.goodJump, 0)),
      lastWeight: topWeight, action: "decrease",
      reason: "was very tough — back off slightly",
      feel, deload: false, repGate: "passed", estimatedRM,
    };
  }
  if (feel === "Hard") {
    return {
      suggestedWeight: topWeight, lastWeight: topWeight, action: "hold",
      reason: "still challenging — hold weight",
      feel, deload: false, repGate: "passed", estimatedRM,
    };
  }
  // Good or unrated
  return {
    suggestedWeight: round5(topWeight + Math.min(prog.goodJump, cap)),
    lastWeight: topWeight, action: "increase",
    reason: feel === "Good" ? "felt good — move up" : "all sets complete",
    feel, deload: false, repGate: "passed", estimatedRM,
  };
}

/**
 * Build the full coach's pre-session plan for every exercise in an upcoming day.
 * One entry per exercise, with suggested weight, last-session summary, PR flag, etc.
 *
 * @param {Array}  logs
 * @param {object} plan
 * @param {number} dayIdx
 * @param {object} exercises  EXERCISES dictionary
 * @param {object} swaps      store.swaps
 * @returns {Array}
 */
export function buildSessionPlan(logs, plan, dayIdx, exercises, swaps) {
  const dayExList = getDayExercises(plan, dayIdx, swaps);
  return dayExList.map(({ exId, sets: targetSets, reps: targetReps, restSecs }) => {
    const ex         = exercises[exId];
    const suggestion = getProgressionSuggestion(logs, exId, ex);
    const last       = getLastSession(logs, exId);
    const pr         = getPR(logs, exId);
    const action     = suggestion?.action ?? "first";
    const isNewPR    = suggestion && pr ? suggestion.suggestedWeight > pr.weight : false;

    return {
      exId,
      name:            ex?.name ?? exId,
      targetSets,
      targetReps,
      restSecs,
      suggestedWeight: suggestion?.suggestedWeight ?? null,
      lastWeight:      suggestion?.lastWeight ?? null,
      lastSets:        last?.sets ?? null,
      action,
      reason:          suggestion?.reason ?? null,
      feel:            suggestion?.feel ?? null,
      deload:          suggestion?.deload ?? false,
      repGate:         suggestion?.repGate ?? null,
      estimatedRM:     suggestion?.estimatedRM ?? null,
      pr,
      isNewPR,
    };
  });
}

// ── CSV Import ───────────────────────────────────────────────────────────────

/**
 * Parse a CSV exported by exportWorkoutCSV() back into an array of log entries
 * compatible with store.logs.
 *
 * @param {string} csvText
 * @param {object} exercises  EXERCISES dictionary (name → exId reverse lookup)
 * @param {object} plans      PLANS dictionary (name → planId reverse lookup)
 * @returns {{ logs: Array }}
 */
export function importWorkoutCSV(csvText, exercises, plans) {
  const nameToExId = {};
  for (const [id, ex] of Object.entries(exercises || {})) {
    if (ex?.name) nameToExId[ex.name.toLowerCase()] = id;
  }

  const nameToPlanId = {};
  for (const [id, plan] of Object.entries(plans || {})) {
    if (plan?.name) nameToPlanId[plan.name.toLowerCase()] = id;
  }

  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return { logs: [] };

  // Map header labels → column indices (strip unit annotations like "(lbs)")
  const header = parseCSVRow(lines[0]);
  const COL = {};
  header.forEach((h, i) => {
    const key = h.toLowerCase().replace(/\s*\(.*?\)/, "").trim();
    COL[key] = i;
  });

  // Group rows by "date|dayName" to reconstruct sessions
  const sessionMap = new Map();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cells = parseCSVRow(line);

    const date      = cells[COL["date"]]      || "";
    const planName  = cells[COL["plan"]]      || "";
    const dayName   = cells[COL["day"]]       || "";
    const exName    = cells[COL["exercise"]]  || "";
    const feel      = COL["feel"] != null ? (cells[COL["feel"]] || "") : "";
    const setNum    = parseInt(cells[COL["set"]], 10) || 1;
    const weight    = cells[COL["weight"]]    || "";
    const reps      = cells[COL["reps"]]      || "";
    const completed = cells[COL["completed"]] === "Yes";
    const durMin    = parseFloat(cells[COL["duration"]]);

    if (!date || !dayName) continue;

    const key = `${date}|${dayName}`;
    if (!sessionMap.has(key)) {
      const ts = new Date(date).getTime();
      sessionMap.set(key, {
        date, dayName, planName,
        timestamp:   isNaN(ts) ? Date.now() : ts,
        durationSecs: isNaN(durMin) ? null : Math.round(durMin * 60),
        exercises:   new Map(),
      });
    }

    const sess = sessionMap.get(key);
    if (!isNaN(durMin) && !sess.durationSecs) {
      sess.durationSecs = Math.round(durMin * 60);
    }
    if (!exName) continue;

    if (!sess.exercises.has(exName)) sess.exercises.set(exName, { feel: feel || null, sets: [] });
    const exRecord = sess.exercises.get(exName);
    if (feel && !exRecord.feel) exRecord.feel = feel;
    while (exRecord.sets.length < setNum) exRecord.sets.push(null);
    exRecord.sets[setNum - 1] = { weight, reps, completed };
  }

  // Convert to log entries
  const logs = [];
  for (const sess of sessionMap.values()) {
    const isoDate = new Date(sess.timestamp).toISOString();
    const planId  = nameToPlanId[sess.planName.toLowerCase()] || "beginner-3day";

    const exEntries = [];
    for (const [exName, { feel, sets }] of sess.exercises) {
      const exId = nameToExId[exName.toLowerCase()] || slugify(exName);
      exEntries.push({ exId, feel: feel || null, sets: sets.filter(Boolean) });
    }

    logs.push({
      id:          `imported-${sess.timestamp}-${Math.random().toString(36).slice(2, 6)}`,
      planId,
      dayIdx:      0,
      dayName:     sess.dayName,
      startedAt:   isoDate,
      completedAt: isoDate,
      durationSecs: sess.durationSecs,
      exercises:   exEntries,
    });
  }

  logs.sort((a, b) => new Date(a.startedAt) - new Date(b.startedAt));
  return { logs };
}

// ── Internal helpers ─────────────────────────────────────────────────────────

function round5(n) {
  return Math.round(n / 5) * 5;
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function parseCSVRow(line) {
  const cells = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (c === "," && !inQ) {
      cells.push(cur); cur = "";
    } else {
      cur += c;
    }
  }
  cells.push(cur);
  return cells;
}

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
