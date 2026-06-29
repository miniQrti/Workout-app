// Trainer knowledge base — drives pre-session planning.
// feel values: "Easy" | "Good" | "Hard" | "Tough"

export const ACTIVE_GOAL = "fatLoss";

export const REP_RANGE_BY_GOAL = {
  fatLoss:     { min: 12, max: 15, restSecs: 60  },
  hypertrophy: { min: 8,  max: 12, restSecs: 90  },
  strength:    { min: 3,  max: 6,  restSecs: 180 },
  endurance:   { min: 15, max: 25, restSecs: 45  },
};

// Minimum days between sessions hitting the same muscle group
export const RECOVERY_DAYS = {
  chest:     { min: 2, optimal: 3 },
  back:      { min: 2, optimal: 3 },
  shoulders: { min: 2, optimal: 3 },
  biceps:    { min: 1, optimal: 2 },
  triceps:   { min: 1, optimal: 2 },
  legs:      { min: 2, optimal: 3 },
  core:      { min: 1, optimal: 1 },
};

// Progression rules per muscle group
export const PROGRESSION = {
  chest:     { easyJump: 10, goodJump: 5,   plateauSessions: 3, deloadAfterWeeks: 6 },
  back:      { easyJump: 10, goodJump: 5,   plateauSessions: 3, deloadAfterWeeks: 6 },
  shoulders: { easyJump: 5,  goodJump: 2.5, plateauSessions: 3, deloadAfterWeeks: 6 },
  biceps:    { easyJump: 5,  goodJump: 2.5, plateauSessions: 4, deloadAfterWeeks: 8 },
  triceps:   { easyJump: 5,  goodJump: 2.5, plateauSessions: 4, deloadAfterWeeks: 8 },
  legs:      { easyJump: 20, goodJump: 10,  plateauSessions: 3, deloadAfterWeeks: 6 },
  core:      { easyJump: 5,  goodJump: 2.5, plateauSessions: 4, deloadAfterWeeks: 8 },
};

// Fatigue signals evaluated over recent sessions
export const FATIGUE_SIGNALS = {
  toughStreak:          { sessions: 2 },   // 2+ consecutive Tough → deload
  weightRegressionPct:  0.05,              // 5% below recent peak → warn
  setFailWindow:        { fails: 2, window: 3 }, // failed to complete sets 2/3 sessions
};

// Per-exercise overrides (cap jumps, special progression units, etc.)
export const EXERCISE_NOTES = {
  "leg-extension-machine": {
    progressionCap: 5,
    warningNote: "Quad tendon caution — max +5 lb per session",
  },
  "plank": {
    progressionUnit: "seconds",
    warningNote: "Add time not weight. Target 60 s solid before moving to harder variation",
  },
  "calf-raise-machine": {
    plateauSessions: 5,
    warningNote: "Calves adapt slowly — emphasise full ROM and slow eccentrics",
  },
};

// Ranked Planet Fitness substitution alternatives per exercise
export const SUBSTITUTION_RULES = {
  "chest-press-machine": [
    { exId: "pec-deck",        reason: "Lower joint stress, good isolation finisher" },
    { exId: "cable-crossover", reason: "Constant tension, easy to dial weight in 5 lb steps" },
  ],
  "seated-cable-row": [
    { exId: "lat-pulldown",    reason: "Vertical pull — different angle on same back muscles" },
    { exId: "dumbbell-row",    reason: "Unilateral, takes pressure off lower back" },
  ],
  "shoulder-press-machine": [
    { exId: "dumbbell-lateral-raise", reason: "Zero axial shoulder load — good deload option" },
  ],
  "leg-press": [
    { exId: "smith-machine-squat", reason: "Shared load across hips and quads" },
    { exId: "dumbbell-lunge",      reason: "Unilateral — fixes imbalances, lower total load" },
  ],
  "leg-curl-machine": [
    { exId: "back-extension",  reason: "Hip hinge pattern targets hamstrings and glutes" },
  ],
  "lat-pulldown": [
    { exId: "seated-cable-row", reason: "Horizontal pull for back volume without overhead load" },
  ],
  "cable-curl": [
    { exId: "hammer-curl",     reason: "Neutral grip — reduces wrist supination stress" },
    { exId: "dumbbell-curl",   reason: "Classic free-weight alternative" },
  ],
  "tricep-pushdown": [
    { exId: "overhead-tricep-extension", reason: "Long-head focus, different fatigue angle" },
  ],
  "ab-crunch-machine": [
    { exId: "cable-crunch",       reason: "Constant cable tension through full ROM" },
    { exId: "hanging-knee-raise", reason: "Bodyweight + grip challenge" },
    { exId: "plank",              reason: "Zero spinal compression, isometric core" },
  ],
};
