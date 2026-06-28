export const PLANS = {
  // ── Plan 1: Beginner Full Body ──────────────────────────────────────────
  "beginner-3day": {
    id: "beginner-3day",
    name: "Planet Fitness Starter",
    tagline: "Perfect for beginners. Full body, 3×/week.",
    difficulty: "Beginner",
    daysPerWeek: 3,
    estimatedMins: 50,
    days: [
      {
        id: "full-body",
        name: "Full Body",
        exercises: [
          { exId: "chest-press-machine",    sets: 3, reps: 12, restSecs: 90 },
          { exId: "lat-pulldown",           sets: 3, reps: 12, restSecs: 90 },
          { exId: "shoulder-press-machine", sets: 3, reps: 12, restSecs: 90 },
          { exId: "leg-press",              sets: 3, reps: 15, restSecs: 120 },
          { exId: "leg-curl-machine",       sets: 3, reps: 12, restSecs: 90 },
          { exId: "cable-curl",             sets: 3, reps: 10, restSecs: 60 },
          { exId: "tricep-pushdown",        sets: 3, reps: 10, restSecs: 60 },
          { exId: "ab-crunch-machine",      sets: 3, reps: 15, restSecs: 60 },
        ],
      },
    ],
  },

  // ── Plan 2: Upper / Lower 4-Day Split ───────────────────────────────────
  "upper-lower-4day": {
    id: "upper-lower-4day",
    name: "Upper / Lower Split",
    tagline: "Classic strength split for steady progress. 4 days/week.",
    difficulty: "Intermediate",
    daysPerWeek: 4,
    estimatedMins: 65,
    days: [
      // Day A — Upper Body
      {
        id: "upper-body",
        name: "Upper Body",
        exercises: [
          { exId: "chest-press-machine",    sets: 4, reps: 10, restSecs: 90 },
          { exId: "pec-deck",               sets: 3, reps: 12, restSecs: 90 },
          { exId: "seated-cable-row",       sets: 4, reps: 10, restSecs: 90 },
          { exId: "lat-pulldown",           sets: 4, reps: 10, restSecs: 90 },
          { exId: "shoulder-press-machine", sets: 3, reps: 10, restSecs: 90 },
          { exId: "dumbbell-lateral-raise", sets: 3, reps: 15, restSecs: 60 },
          { exId: "cable-curl",             sets: 3, reps: 10, restSecs: 60 },
          { exId: "tricep-pushdown",        sets: 3, reps: 10, restSecs: 60 },
        ],
      },
      // Day B — Lower Body
      {
        id: "lower-body",
        name: "Lower Body",
        exercises: [
          { exId: "leg-press",              sets: 4, reps: 12, restSecs: 120 },
          { exId: "leg-extension-machine",  sets: 3, reps: 15, restSecs: 90 },
          { exId: "leg-curl-machine",       sets: 3, reps: 12, restSecs: 90 },
          { exId: "smith-machine-squat",    sets: 3, reps: 10, restSecs: 120 },
          { exId: "calf-raise-machine",     sets: 4, reps: 20, restSecs: 60 },
          { exId: "hip-abductor",           sets: 3, reps: 20, restSecs: 60 },
          { exId: "plank",                  sets: 3, reps: 45, restSecs: 60 },
          { exId: "hanging-knee-raise",     sets: 3, reps: 15, restSecs: 60 },
        ],
      },
      // Day C — Upper Body (repeat)
      {
        id: "upper-body-2",
        name: "Upper Body",
        exercises: [
          { exId: "chest-press-machine",    sets: 4, reps: 10, restSecs: 90 },
          { exId: "pec-deck",               sets: 3, reps: 12, restSecs: 90 },
          { exId: "seated-cable-row",       sets: 4, reps: 10, restSecs: 90 },
          { exId: "lat-pulldown",           sets: 4, reps: 10, restSecs: 90 },
          { exId: "shoulder-press-machine", sets: 3, reps: 10, restSecs: 90 },
          { exId: "dumbbell-lateral-raise", sets: 3, reps: 15, restSecs: 60 },
          { exId: "cable-curl",             sets: 3, reps: 10, restSecs: 60 },
          { exId: "tricep-pushdown",        sets: 3, reps: 10, restSecs: 60 },
        ],
      },
      // Day D — Lower Body (repeat)
      {
        id: "lower-body-2",
        name: "Lower Body",
        exercises: [
          { exId: "leg-press",              sets: 4, reps: 12, restSecs: 120 },
          { exId: "leg-extension-machine",  sets: 3, reps: 15, restSecs: 90 },
          { exId: "leg-curl-machine",       sets: 3, reps: 12, restSecs: 90 },
          { exId: "smith-machine-squat",    sets: 3, reps: 10, restSecs: 120 },
          { exId: "calf-raise-machine",     sets: 4, reps: 20, restSecs: 60 },
          { exId: "hip-abductor",           sets: 3, reps: 20, restSecs: 60 },
          { exId: "plank",                  sets: 3, reps: 45, restSecs: 60 },
          { exId: "hanging-knee-raise",     sets: 3, reps: 15, restSecs: 60 },
        ],
      },
    ],
  },

  // ── Plan 3: Push / Pull / Legs ───────────────────────────────────────────
  "ppl-3day": {
    id: "ppl-3day",
    name: "Push / Pull / Legs",
    tagline: "Classic PPL split for building size and strength. 3 days/week.",
    difficulty: "Intermediate",
    daysPerWeek: 3,
    estimatedMins: 70,
    days: [
      // Day A — Push
      {
        id: "push",
        name: "Push (Chest, Shoulders, Triceps)",
        exercises: [
          { exId: "chest-press-machine",         sets: 4, reps: 10, restSecs: 90 },
          { exId: "incline-dumbbell-press",       sets: 3, reps: 10, restSecs: 90 },
          { exId: "shoulder-press-machine",       sets: 4, reps: 10, restSecs: 90 },
          { exId: "dumbbell-lateral-raise",       sets: 3, reps: 15, restSecs: 60 },
          { exId: "cable-crossover",              sets: 3, reps: 12, restSecs: 90 },
          { exId: "tricep-pushdown",              sets: 3, reps: 10, restSecs: 60 },
          { exId: "overhead-tricep-extension",    sets: 3, reps: 10, restSecs: 60 },
        ],
      },
      // Day B — Pull
      {
        id: "pull",
        name: "Pull (Back, Biceps)",
        exercises: [
          { exId: "lat-pulldown",       sets: 4, reps: 10, restSecs: 90 },
          { exId: "seated-cable-row",   sets: 4, reps: 10, restSecs: 90 },
          { exId: "cable-face-pull",    sets: 3, reps: 15, restSecs: 60 },
          { exId: "dumbbell-row",       sets: 3, reps: 10, restSecs: 90 },
          { exId: "back-extension",     sets: 3, reps: 15, restSecs: 60 },
          { exId: "cable-curl",         sets: 3, reps: 10, restSecs: 60 },
          { exId: "hammer-curl",        sets: 3, reps: 10, restSecs: 60 },
        ],
      },
      // Day C — Legs + Core
      {
        id: "legs-core",
        name: "Legs + Core",
        exercises: [
          { exId: "leg-press",              sets: 4, reps: 12, restSecs: 120 },
          { exId: "leg-extension-machine",  sets: 3, reps: 15, restSecs: 90 },
          { exId: "leg-curl-machine",       sets: 3, reps: 12, restSecs: 90 },
          { exId: "dumbbell-lunge",         sets: 3, reps: 12, restSecs: 90 },
          { exId: "calf-raise-machine",     sets: 4, reps: 20, restSecs: 60 },
          { exId: "plank",                  sets: 3, reps: 60, restSecs: 60 },
          { exId: "rotary-torso",           sets: 3, reps: 15, restSecs: 60 },
          { exId: "ab-crunch-machine",      sets: 3, reps: 20, restSecs: 60 },
        ],
      },
    ],
  },
};
