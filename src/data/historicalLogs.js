// Historical workout sessions from pre-app tracking (Weeks 1–7, May–Jun 2025)

export const MACHINE_SETTINGS = {
  "chest-press-machine":    "Seat 3",
  "seated-cable-row":       "Chest pad 5 / Seat 5",
  "shoulder-press-machine": "Seat 4",
  "lat-pulldown":           "Wide overhand, just outside shoulder width",
  "leg-press":              "Seat 4",
  "leg-curl-machine":       "Left-close 3 / Left-far 2 / Top 4",
  "leg-extension-machine":  "Knee pad position 2",
  "calf-raise-machine":     "Seat 6",
  "rotary-torso":           "Seat 3",
};

function log(id, date, dayName, dayIdx, exercises) {
  const d = new Date(date + "T10:00:00");
  return {
    id,
    startedAt:   d.toISOString(),
    completedAt: new Date(d.getTime() + 7200000).toISOString(),
    planId:      "imported",
    dayIdx,
    dayName,
    durationSecs: 7200,
    exercises,
  };
}

function ex(exId, ...pairs) {
  return { exId, sets: pairs.map(([weight, reps]) => ({ weight, reps, completed: true })) };
}

export const HISTORICAL_LOGS = [
  // ── Week 1 ───────────────────────────────────────────────────────────────
  log("hist-1a", "2025-05-05", "Upper Body + Core", 0, [
    ex("chest-press-machine",   [50,12],[50,12],[50,12]),
    ex("cable-curl",            [50,12],[50,12]),
    ex("tricep-pushdown",       [35,12],[35,12]),
    ex("plank",                 [0,40],[0,33],[0,30]),
    ex("ab-crunch-machine",     [40,15],[40,15],[40,15]),
    ex("lat-pulldown",          [85,10],[85,10],[70,8]),
  ]),
  log("hist-1b", "2025-05-07", "Lower Body + Core", 1, [
    ex("leg-press",             [120,12],[120,12],[120,12]),
    ex("leg-curl-machine",      [60,12],[60,12],[60,12]),
    ex("leg-extension-machine", [80,12],[70,12],[60,12]),
  ]),

  // ── Week 2 ───────────────────────────────────────────────────────────────
  log("hist-2a", "2025-05-12", "Upper Body + Core", 0, [
    ex("chest-press-machine",   [55,12],[55,12],[55,12]),
    ex("seated-cable-row",      [60,12],[60,12],[60,12]),
    ex("cable-curl",            [50,12],[50,12]),
    ex("tricep-pushdown",       [40,12],[40,12]),
    ex("lat-pulldown",          [85,10],[85,10],[85,10]),
    ex("plank",                 [0,45],[0,40],[0,40]),
  ]),
  log("hist-2b", "2025-05-14", "Lower Body + Core", 1, [
    ex("leg-press",             [140,12],[140,12],[140,12]),
    ex("leg-curl-machine",      [65,12],[65,12],[65,12]),
    ex("leg-extension-machine", [80,12],[70,12],[60,12]),
    ex("calf-raise-machine",    [80,15],[80,15],[80,15]),
    ex("hip-abductor",          [90,15],[90,15]),
  ]),

  // ── Week 3 ───────────────────────────────────────────────────────────────
  log("hist-3a", "2025-05-19", "Upper Body + Core", 0, [
    ex("chest-press-machine",   [60,12],[60,12],[60,12]),
    ex("seated-cable-row",      [70,12],[70,12],[70,12]),
    ex("shoulder-press-machine",[40,10],[40,10],[40,10]),
    ex("lat-pulldown",          [85,10],[85,10],[85,10]),
    ex("tricep-pushdown",       [80,12],[80,12]),
    ex("plank",                 [0,45],[0,40],[0,40]),
  ]),
  log("hist-3b", "2025-05-21", "Lower Body + Core", 1, [
    ex("leg-press",             [150,12],[150,12],[150,12]),
    ex("leg-curl-machine",      [70,12],[70,12],[70,12]),
    ex("leg-extension-machine", [80,12],[80,12],[80,12]),
    ex("calf-raise-machine",    [80,15],[80,15],[80,15]),
    ex("hip-abductor",          [100,15],[100,15]),
  ]),
  log("hist-3c", "2025-05-23", "Full Body + Core", 2, [
    ex("chest-press-machine",   [65,12],[65,12],[65,12]),
    ex("seated-cable-row",      [75,12],[75,12],[75,12]),
    ex("leg-press",             [160,12],[160,12],[160,12]),
    ex("calf-raise-machine",    [80,15],[80,15],[80,15]),
    ex("hip-abductor",          [100,15],[100,15]),
  ]),

  // ── Week 4 ───────────────────────────────────────────────────────────────
  log("hist-4a", "2025-05-26", "Upper Body + Core", 0, [
    ex("chest-press-machine",   [75,12],[75,12],[75,12]),
    ex("seated-cable-row",      [85,12],[85,12],[85,12]),
    ex("shoulder-press-machine",[45,10],[45,10],[45,10]),
    ex("lat-pulldown",          [90,12],[90,12],[90,12]),
    ex("tricep-pushdown",       [80,12],[80,12]),
    ex("plank",                 [0,50],[0,50],[0,45]),
  ]),
  log("hist-4b", "2025-05-28", "Lower Body + Core", 1, [
    ex("leg-press",             [190,12],[190,12],[190,12]),
    ex("leg-curl-machine",      [80,12],[80,12],[80,12]),
    ex("leg-extension-machine", [85,12],[85,12],[85,12]),
    ex("calf-raise-machine",    [100,15],[100,15],[100,15]),
    ex("hip-abductor",          [110,15],[110,15]),
    ex("glute-kickback-machine",[80,15],[80,15]),
  ]),

  // ── Week 5 ───────────────────────────────────────────────────────────────
  log("hist-5a", "2025-06-02", "Upper Body + Core", 0, [
    ex("chest-press-machine",   [90,12],[80,12],[90,10]),
    ex("seated-cable-row",      [90,12],[90,12],[90,12]),
    ex("shoulder-press-machine",[55,10],[55,10],[55,10]),
    ex("cable-curl",            [35,10],[35,10],[35,10]),
    ex("plank",                 [0,50],[0,50],[0,45]),
  ]),
  log("hist-5b", "2025-06-06", "Lower Body + Core", 1, [
    ex("leg-press",             [200,12],[200,12],[200,12]),
    ex("leg-curl-machine",      [85,12],[85,12],[85,12]),
    ex("leg-extension-machine", [85,12],[85,12],[85,12]),
    ex("calf-raise-machine",    [100,15],[100,15],[100,15]),
    ex("hip-abductor",          [110,15],[110,15]),
    ex("plank",                 [0,50],[0,50],[0,50]),
  ]),

  // ── Week 6 (returned after ~1.5-week break) ───────────────────────────────
  log("hist-6a", "2025-06-15", "Upper Body + Core", 0, [
    ex("chest-press-machine",   [80,12],[80,12],[80,12]),
    ex("seated-cable-row",      [90,12],[90,12],[90,12]),
    ex("shoulder-press-machine",[50,10],[50,10],[50,10]),
    ex("cable-curl",            [55,10],[55,10],[55,10]),
    ex("tricep-pushdown",       [40,12],[40,12],[40,12]),
    ex("lat-pulldown",          [90,12],[90,12],[90,12]),
    ex("plank",                 [0,50],[0,50],[0,40]),
    ex("ab-crunch-machine",     [50,15],[50,15],[50,15]),
  ]),
  log("hist-6b", "2025-06-17", "Lower Body + Core", 1, [
    ex("leg-press",             [200,12],[200,12],[200,12],[200,12]),
    ex("leg-curl-machine",      [85,12],[85,12],[85,12]),
    ex("leg-extension-machine", [85,12],[85,12],[85,12]),
    ex("calf-raise-machine",    [100,15],[100,15],[100,15]),
    ex("rotary-torso",          [50,15],[50,15],[50,15]),
  ]),
  log("hist-6c", "2025-06-21", "Full Body + Core", 2, [
    ex("chest-press-machine",   [90,12],[90,12],[90,12]),
    ex("seated-cable-row",      [90,12],[90,12],[90,12]),
    ex("leg-press",             [180,12],[180,12],[180,12]),
    ex("shoulder-press-machine",[55,12],[55,12],[55,11]),
    ex("lat-pulldown",          [90,12],[90,12],[90,12]),
    ex("plank",                 [0,50],[0,50],[0,50]),
    ex("rotary-torso",          [60,15],[60,15],[60,15]),
    ex("cable-crunch",          [50,12],[50,12],[50,12]),
  ]),

  // ── Week 7 ───────────────────────────────────────────────────────────────
  log("hist-7a", "2025-06-22", "Upper Body + Core", 0, [
    ex("chest-press-machine",   [90,12],[90,12],[90,12]),
    ex("seated-cable-row",      [90,12],[90,12],[90,12]),
    ex("shoulder-press-machine",[55,12],[55,12],[55,8]),
    ex("cable-curl",            [35,10],[35,10],[30,10]),
    ex("tricep-pushdown",       [45,12],[45,12],[40,12]),
    ex("lat-pulldown",          [90,12],[90,12],[90,12]),
    ex("plank",                 [0,50],[0,50],[0,40]),
    ex("ab-crunch-machine",     [70,12],[70,15]),
  ]),
  log("hist-7b", "2025-06-25", "Lower Body + Core", 1, [
    ex("leg-press",             [200,12],[200,12],[200,12],[210,12]),
    ex("leg-curl-machine",      [85,12],[85,12],[85,12]),
    ex("leg-extension-machine", [85,12],[85,12],[85,12]),
    ex("calf-raise-machine",    [100,15],[100,15],[100,15]),
    ex("rotary-torso",          [60,15],[60,15],[60,15]),
  ]),
];
