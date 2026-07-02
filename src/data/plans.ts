import type { Plan } from "../types";

export const PLANS: Record<string, Plan> = {
  "beginner-3day": {
    "id": "beginner-3day",
    "name": "Planet Fitness Starter",
    "tagline": {
      "en": "Perfect for beginners. Full body, 3×/week.",
      "de": "Perfekt für Einsteiger. Ganzkörper, 3×/Woche."
    },
    "difficulty": "beginner",
    "daysPerWeek": 3,
    "estimatedMins": 50,
    "goal": "strength",
    "schedule": {
      "cycleLength": 7,
      "rotation": [
        {
          "type": "workout",
          "dayId": "full-body"
        },
        {
          "type": "rest"
        },
        {
          "type": "workout",
          "dayId": "full-body"
        },
        {
          "type": "cardio"
        },
        {
          "type": "workout",
          "dayId": "full-body"
        },
        {
          "type": "rest"
        },
        {
          "type": "rest"
        }
      ]
    },
    "days": [
      {
        "id": "full-body",
        "name": {
          "en": "Full Body",
          "de": "Ganzkörper"
        },
        "warmup": [
          {
            "name": {
              "en": "Treadmill walk / light jog"
            },
            "detail": {
              "en": "5 min, moderate pace"
            }
          },
          {
            "name": {
              "en": "Arm circles"
            },
            "detail": {
              "en": "10 forward, 10 backward"
            }
          },
          {
            "name": {
              "en": "Shoulder rolls"
            },
            "detail": {
              "en": "10 forward, 10 backward"
            }
          },
          {
            "name": {
              "en": "Leg swings"
            },
            "detail": {
              "en": "10 front-back each leg"
            }
          },
          {
            "name": {
              "en": "Hip circles"
            },
            "detail": {
              "en": "10 each direction"
            }
          },
          {
            "name": {
              "en": "Bodyweight squats"
            },
            "detail": {
              "en": "10 reps, slow and controlled"
            }
          },
          {
            "name": {
              "en": "Cat-cow"
            },
            "detail": {
              "en": "5 slow reps on mat"
            }
          },
          {
            "name": {
              "en": "Light warmup set"
            },
            "detail": {
              "en": "First machine at ~50% × 15 reps"
            }
          }
        ],
        "exercises": [
          {
            "exerciseId": "chest-press-machine",
            "sets": 3,
            "reps": 12,
            "restSecs": 90
          },
          {
            "exerciseId": "lat-pulldown",
            "sets": 3,
            "reps": 12,
            "restSecs": 90
          },
          {
            "exerciseId": "shoulder-press-machine",
            "sets": 3,
            "reps": 12,
            "restSecs": 90
          },
          {
            "exerciseId": "leg-press",
            "sets": 3,
            "reps": 15,
            "restSecs": 120
          },
          {
            "exerciseId": "leg-curl-machine",
            "sets": 3,
            "reps": 12,
            "restSecs": 90
          },
          {
            "exerciseId": "cable-curl",
            "sets": 3,
            "reps": 10,
            "restSecs": 60
          },
          {
            "exerciseId": "tricep-pushdown",
            "sets": 3,
            "reps": 10,
            "restSecs": 60
          },
          {
            "exerciseId": "ab-crunch-machine",
            "sets": 3,
            "reps": 15,
            "restSecs": 60
          }
        ]
      }
    ]
  },
  "upper-lower-4day": {
    "id": "upper-lower-4day",
    "name": "Upper / Lower Split",
    "tagline": {
      "en": "Classic strength split for steady progress. 4 days/week.",
      "de": "Klassischer Kraft-Split für stetigen Fortschritt. 4 Tage/Woche."
    },
    "difficulty": "intermediate",
    "daysPerWeek": 4,
    "estimatedMins": 65,
    "goal": "strength",
    "schedule": {
      "cycleLength": 7,
      "rotation": [
        {
          "type": "workout",
          "dayId": "upper-body"
        },
        {
          "type": "workout",
          "dayId": "lower-body"
        },
        {
          "type": "rest"
        },
        {
          "type": "workout",
          "dayId": "upper-body-2"
        },
        {
          "type": "workout",
          "dayId": "lower-body-2"
        },
        {
          "type": "cardio"
        },
        {
          "type": "rest"
        }
      ]
    },
    "days": [
      {
        "id": "upper-body",
        "name": {
          "en": "Upper Body",
          "de": "Oberkörper"
        },
        "warmup": [
          {
            "name": {
              "en": "Treadmill walk / bike"
            },
            "detail": {
              "en": "5 min, light pace"
            }
          },
          {
            "name": {
              "en": "Arm circles"
            },
            "detail": {
              "en": "10 forward, 10 backward each arm"
            }
          },
          {
            "name": {
              "en": "Shoulder rolls"
            },
            "detail": {
              "en": "10 forward, 10 backward"
            }
          },
          {
            "name": {
              "en": "Cross-body shoulder stretch"
            },
            "detail": {
              "en": "15 s each side"
            }
          },
          {
            "name": {
              "en": "Chest opener stretch"
            },
            "detail": {
              "en": "Clasp hands behind back, open chest — 15 s"
            }
          },
          {
            "name": {
              "en": "Light lat pulldown warmup set"
            },
            "detail": {
              "en": "~50% weight × 15 reps"
            }
          },
          {
            "name": {
              "en": "Light chest press warmup set"
            },
            "detail": {
              "en": "~50% weight × 15 reps"
            }
          }
        ],
        "exercises": [
          {
            "exerciseId": "chest-press-machine",
            "sets": 4,
            "reps": 10,
            "restSecs": 90
          },
          {
            "exerciseId": "pec-deck",
            "sets": 3,
            "reps": 12,
            "restSecs": 90
          },
          {
            "exerciseId": "seated-cable-row",
            "sets": 4,
            "reps": 10,
            "restSecs": 90
          },
          {
            "exerciseId": "lat-pulldown",
            "sets": 4,
            "reps": 10,
            "restSecs": 90
          },
          {
            "exerciseId": "shoulder-press-machine",
            "sets": 3,
            "reps": 10,
            "restSecs": 90
          },
          {
            "exerciseId": "dumbbell-lateral-raise",
            "sets": 3,
            "reps": 15,
            "restSecs": 60
          },
          {
            "exerciseId": "cable-curl",
            "sets": 3,
            "reps": 10,
            "restSecs": 60
          },
          {
            "exerciseId": "tricep-pushdown",
            "sets": 3,
            "reps": 10,
            "restSecs": 60
          }
        ]
      },
      {
        "id": "lower-body",
        "name": {
          "en": "Lower Body",
          "de": "Unterkörper"
        },
        "warmup": [
          {
            "name": {
              "en": "Treadmill walk / bike"
            },
            "detail": {
              "en": "5 min, moderate pace"
            }
          },
          {
            "name": {
              "en": "Leg swings (front-back)"
            },
            "detail": {
              "en": "10 each leg"
            }
          },
          {
            "name": {
              "en": "Leg swings (side-side)"
            },
            "detail": {
              "en": "10 each leg"
            }
          },
          {
            "name": {
              "en": "Hip circles"
            },
            "detail": {
              "en": "10 each direction"
            }
          },
          {
            "name": {
              "en": "Glute bridges"
            },
            "detail": {
              "en": "10 reps on mat, 2-second hold"
            }
          },
          {
            "name": {
              "en": "Bodyweight squats"
            },
            "detail": {
              "en": "15 slow reps, full depth"
            }
          },
          {
            "name": {
              "en": "Light leg press warmup"
            },
            "detail": {
              "en": "~50% weight × 15 reps"
            }
          }
        ],
        "exercises": [
          {
            "exerciseId": "leg-press",
            "sets": 4,
            "reps": 12,
            "restSecs": 120
          },
          {
            "exerciseId": "leg-extension-machine",
            "sets": 3,
            "reps": 15,
            "restSecs": 90
          },
          {
            "exerciseId": "leg-curl-machine",
            "sets": 3,
            "reps": 12,
            "restSecs": 90
          },
          {
            "exerciseId": "smith-machine-squat",
            "sets": 3,
            "reps": 10,
            "restSecs": 120
          },
          {
            "exerciseId": "calf-raise-machine",
            "sets": 4,
            "reps": 20,
            "restSecs": 60
          },
          {
            "exerciseId": "hip-abductor",
            "sets": 3,
            "reps": 20,
            "restSecs": 60
          },
          {
            "exerciseId": "plank",
            "sets": 3,
            "reps": 45,
            "restSecs": 60
          },
          {
            "exerciseId": "hanging-knee-raise",
            "sets": 3,
            "reps": 15,
            "restSecs": 60
          }
        ]
      },
      {
        "id": "upper-body-2",
        "name": {
          "en": "Upper Body",
          "de": "Oberkörper"
        },
        "warmup": [
          {
            "name": {
              "en": "Treadmill walk / bike"
            },
            "detail": {
              "en": "5 min, light pace"
            }
          },
          {
            "name": {
              "en": "Arm circles"
            },
            "detail": {
              "en": "10 forward, 10 backward each arm"
            }
          },
          {
            "name": {
              "en": "Shoulder rolls"
            },
            "detail": {
              "en": "10 forward, 10 backward"
            }
          },
          {
            "name": {
              "en": "Cross-body shoulder stretch"
            },
            "detail": {
              "en": "15 s each side"
            }
          },
          {
            "name": {
              "en": "Chest opener stretch"
            },
            "detail": {
              "en": "Clasp hands behind back, open chest — 15 s"
            }
          },
          {
            "name": {
              "en": "Light lat pulldown warmup set"
            },
            "detail": {
              "en": "~50% weight × 15 reps"
            }
          },
          {
            "name": {
              "en": "Light chest press warmup set"
            },
            "detail": {
              "en": "~50% weight × 15 reps"
            }
          }
        ],
        "exercises": [
          {
            "exerciseId": "chest-press-machine",
            "sets": 4,
            "reps": 10,
            "restSecs": 90
          },
          {
            "exerciseId": "pec-deck",
            "sets": 3,
            "reps": 12,
            "restSecs": 90
          },
          {
            "exerciseId": "seated-cable-row",
            "sets": 4,
            "reps": 10,
            "restSecs": 90
          },
          {
            "exerciseId": "lat-pulldown",
            "sets": 4,
            "reps": 10,
            "restSecs": 90
          },
          {
            "exerciseId": "shoulder-press-machine",
            "sets": 3,
            "reps": 10,
            "restSecs": 90
          },
          {
            "exerciseId": "dumbbell-lateral-raise",
            "sets": 3,
            "reps": 15,
            "restSecs": 60
          },
          {
            "exerciseId": "cable-curl",
            "sets": 3,
            "reps": 10,
            "restSecs": 60
          },
          {
            "exerciseId": "tricep-pushdown",
            "sets": 3,
            "reps": 10,
            "restSecs": 60
          }
        ]
      },
      {
        "id": "lower-body-2",
        "name": {
          "en": "Lower Body",
          "de": "Unterkörper"
        },
        "warmup": [
          {
            "name": {
              "en": "Treadmill walk / bike"
            },
            "detail": {
              "en": "5 min, moderate pace"
            }
          },
          {
            "name": {
              "en": "Leg swings (front-back)"
            },
            "detail": {
              "en": "10 each leg"
            }
          },
          {
            "name": {
              "en": "Leg swings (side-side)"
            },
            "detail": {
              "en": "10 each leg"
            }
          },
          {
            "name": {
              "en": "Hip circles"
            },
            "detail": {
              "en": "10 each direction"
            }
          },
          {
            "name": {
              "en": "Glute bridges"
            },
            "detail": {
              "en": "10 reps on mat, 2-second hold"
            }
          },
          {
            "name": {
              "en": "Bodyweight squats"
            },
            "detail": {
              "en": "15 slow reps, full depth"
            }
          },
          {
            "name": {
              "en": "Light leg press warmup"
            },
            "detail": {
              "en": "~50% weight × 15 reps"
            }
          }
        ],
        "exercises": [
          {
            "exerciseId": "leg-press",
            "sets": 4,
            "reps": 12,
            "restSecs": 120
          },
          {
            "exerciseId": "leg-extension-machine",
            "sets": 3,
            "reps": 15,
            "restSecs": 90
          },
          {
            "exerciseId": "leg-curl-machine",
            "sets": 3,
            "reps": 12,
            "restSecs": 90
          },
          {
            "exerciseId": "smith-machine-squat",
            "sets": 3,
            "reps": 10,
            "restSecs": 120
          },
          {
            "exerciseId": "calf-raise-machine",
            "sets": 4,
            "reps": 20,
            "restSecs": 60
          },
          {
            "exerciseId": "hip-abductor",
            "sets": 3,
            "reps": 20,
            "restSecs": 60
          },
          {
            "exerciseId": "plank",
            "sets": 3,
            "reps": 45,
            "restSecs": 60
          },
          {
            "exerciseId": "hanging-knee-raise",
            "sets": 3,
            "reps": 15,
            "restSecs": 60
          }
        ]
      }
    ]
  },
  "ppl-3day": {
    "id": "ppl-3day",
    "name": "Push / Pull / Legs",
    "tagline": {
      "en": "Classic PPL split for building size and strength. 3 days/week.",
      "de": "Push / Pull / Beine — der bewährte Hypertrophie-Split."
    },
    "difficulty": "intermediate",
    "daysPerWeek": 3,
    "estimatedMins": 70,
    "goal": "hypertrophy",
    "schedule": {
      "cycleLength": 7,
      "rotation": [
        {
          "type": "workout",
          "dayId": "push"
        },
        {
          "type": "rest"
        },
        {
          "type": "workout",
          "dayId": "pull"
        },
        {
          "type": "cardio"
        },
        {
          "type": "workout",
          "dayId": "legs-core"
        },
        {
          "type": "rest"
        },
        {
          "type": "rest"
        }
      ]
    },
    "days": [
      {
        "id": "push",
        "name": {
          "en": "Push (Chest, Shoulders, Triceps)",
          "de": "Push (Brust, Schultern, Trizeps)"
        },
        "warmup": [
          {
            "name": {
              "en": "Treadmill walk / bike"
            },
            "detail": {
              "en": "5 min, light pace"
            }
          },
          {
            "name": {
              "en": "Arm circles"
            },
            "detail": {
              "en": "10 forward, 10 backward"
            }
          },
          {
            "name": {
              "en": "Shoulder rotations"
            },
            "detail": {
              "en": "10 internal, 10 external each arm"
            }
          },
          {
            "name": {
              "en": "Chest opener stretch"
            },
            "detail": {
              "en": "Hands clasped behind back — 15 s"
            }
          },
          {
            "name": {
              "en": "Band pull-aparts (or face pulls)"
            },
            "detail": {
              "en": "15 reps at light weight"
            }
          },
          {
            "name": {
              "en": "Light chest press warmup set"
            },
            "detail": {
              "en": "~50% weight × 15 reps"
            }
          }
        ],
        "exercises": [
          {
            "exerciseId": "chest-press-machine",
            "sets": 4,
            "reps": 10,
            "restSecs": 90
          },
          {
            "exerciseId": "incline-dumbbell-press",
            "sets": 3,
            "reps": 10,
            "restSecs": 90
          },
          {
            "exerciseId": "shoulder-press-machine",
            "sets": 4,
            "reps": 10,
            "restSecs": 90
          },
          {
            "exerciseId": "dumbbell-lateral-raise",
            "sets": 3,
            "reps": 15,
            "restSecs": 60
          },
          {
            "exerciseId": "cable-crossover",
            "sets": 3,
            "reps": 12,
            "restSecs": 90
          },
          {
            "exerciseId": "tricep-pushdown",
            "sets": 3,
            "reps": 10,
            "restSecs": 60
          },
          {
            "exerciseId": "overhead-tricep-extension",
            "sets": 3,
            "reps": 10,
            "restSecs": 60
          }
        ]
      },
      {
        "id": "pull",
        "name": {
          "en": "Pull (Back, Biceps)",
          "de": "Pull (Rücken, Bizeps)"
        },
        "warmup": [
          {
            "name": {
              "en": "Treadmill walk / bike"
            },
            "detail": {
              "en": "5 min, light pace"
            }
          },
          {
            "name": {
              "en": "Arm circles"
            },
            "detail": {
              "en": "10 forward, 10 backward"
            }
          },
          {
            "name": {
              "en": "Scapular retractions"
            },
            "detail": {
              "en": "10 reps — squeeze shoulder blades"
            }
          },
          {
            "name": {
              "en": "Cross-body shoulder stretch"
            },
            "detail": {
              "en": "15 s each side"
            }
          },
          {
            "name": {
              "en": "Light lat pulldown warmup"
            },
            "detail": {
              "en": "~50% weight × 15 reps"
            }
          },
          {
            "name": {
              "en": "Light row warmup set"
            },
            "detail": {
              "en": "~50% weight × 15 reps"
            }
          }
        ],
        "exercises": [
          {
            "exerciseId": "lat-pulldown",
            "sets": 4,
            "reps": 10,
            "restSecs": 90
          },
          {
            "exerciseId": "seated-cable-row",
            "sets": 4,
            "reps": 10,
            "restSecs": 90
          },
          {
            "exerciseId": "cable-face-pull",
            "sets": 3,
            "reps": 15,
            "restSecs": 60
          },
          {
            "exerciseId": "dumbbell-row",
            "sets": 3,
            "reps": 10,
            "restSecs": 90
          },
          {
            "exerciseId": "back-extension",
            "sets": 3,
            "reps": 15,
            "restSecs": 60
          },
          {
            "exerciseId": "cable-curl",
            "sets": 3,
            "reps": 10,
            "restSecs": 60
          },
          {
            "exerciseId": "hammer-curl",
            "sets": 3,
            "reps": 10,
            "restSecs": 60
          }
        ]
      },
      {
        "id": "legs-core",
        "name": {
          "en": "Legs + Core",
          "de": "Beine + Rumpf"
        },
        "warmup": [
          {
            "name": {
              "en": "Treadmill walk / bike"
            },
            "detail": {
              "en": "5 min, moderate pace"
            }
          },
          {
            "name": {
              "en": "Leg swings (front-back)"
            },
            "detail": {
              "en": "10 each leg"
            }
          },
          {
            "name": {
              "en": "Leg swings (side-side)"
            },
            "detail": {
              "en": "10 each leg"
            }
          },
          {
            "name": {
              "en": "Hip circles"
            },
            "detail": {
              "en": "10 each direction"
            }
          },
          {
            "name": {
              "en": "Glute bridges"
            },
            "detail": {
              "en": "10 reps, 2-second hold at top"
            }
          },
          {
            "name": {
              "en": "Bodyweight squats"
            },
            "detail": {
              "en": "15 slow reps, full depth"
            }
          },
          {
            "name": {
              "en": "Light leg press warmup"
            },
            "detail": {
              "en": "~50% weight × 15 reps"
            }
          }
        ],
        "exercises": [
          {
            "exerciseId": "leg-press",
            "sets": 4,
            "reps": 12,
            "restSecs": 120
          },
          {
            "exerciseId": "leg-extension-machine",
            "sets": 3,
            "reps": 15,
            "restSecs": 90
          },
          {
            "exerciseId": "leg-curl-machine",
            "sets": 3,
            "reps": 12,
            "restSecs": 90
          },
          {
            "exerciseId": "dumbbell-lunge",
            "sets": 3,
            "reps": 12,
            "restSecs": 90
          },
          {
            "exerciseId": "calf-raise-machine",
            "sets": 4,
            "reps": 20,
            "restSecs": 60
          },
          {
            "exerciseId": "plank",
            "sets": 3,
            "reps": 60,
            "restSecs": 60
          },
          {
            "exerciseId": "rotary-torso",
            "sets": 3,
            "reps": 15,
            "restSecs": 60
          },
          {
            "exerciseId": "ab-crunch-machine",
            "sets": 3,
            "reps": 20,
            "restSecs": 60
          }
        ]
      }
    ]
  },
  "arms-shoulders-spec-4day": {
    "id": "arms-shoulders-spec-4day",
    "name": "Arms & Shoulders Specialization",
    "tagline": {
      "en": "Upper/lower base with a dedicated arm-and-delt blowout day for stubborn biceps, triceps, and shoulders. 4 days/week.",
      "de": "Spezialisierung auf Arme & Schultern, 4 Tage/Woche."
    },
    "difficulty": "intermediate",
    "daysPerWeek": 4,
    "estimatedMins": 50,
    "goal": "hypertrophy",
    "schedule": {
      "cycleLength": 7,
      "rotation": [
        {
          "type": "workout",
          "dayId": "chest-back"
        },
        {
          "type": "workout",
          "dayId": "legs"
        },
        {
          "type": "rest"
        },
        {
          "type": "workout",
          "dayId": "shoulders-arms-spec"
        },
        {
          "type": "workout",
          "dayId": "full-body-core"
        },
        {
          "type": "rest"
        },
        {
          "type": "cardio"
        }
      ]
    },
    "days": [
      {
        "id": "chest-back",
        "name": {
          "en": "Chest + Back",
          "de": "Brust + Rücken"
        },
        "warmup": [
          {
            "name": {
              "en": "Arm circles"
            },
            "detail": {
              "en": "10 forward, 10 backward each arm"
            }
          },
          {
            "name": {
              "en": "Jumping jacks"
            },
            "detail": {
              "en": "30 seconds, light pace"
            }
          },
          {
            "name": {
              "en": "Chest opener stretch"
            },
            "detail": {
              "en": "Clasp hands behind back, open chest — 15 s"
            }
          },
          {
            "name": {
              "en": "Scapular retractions"
            },
            "detail": {
              "en": "10 reps — squeeze shoulder blades"
            }
          },
          {
            "name": {
              "en": "Light chest press warmup set"
            },
            "detail": {
              "en": "~50% weight × 15 reps"
            }
          }
        ],
        "exercises": [
          {
            "exerciseId": "chest-press-machine",
            "sets": 4,
            "reps": 10,
            "restSecs": 90
          },
          {
            "exerciseId": "lat-pulldown",
            "sets": 4,
            "reps": 10,
            "restSecs": 90
          },
          {
            "exerciseId": "incline-dumbbell-press",
            "sets": 3,
            "reps": 12,
            "restSecs": 75
          },
          {
            "exerciseId": "seated-cable-row",
            "sets": 3,
            "reps": 12,
            "restSecs": 75
          },
          {
            "exerciseId": "pec-deck",
            "sets": 3,
            "reps": 15,
            "restSecs": 60
          },
          {
            "exerciseId": "dumbbell-row",
            "sets": 3,
            "reps": 12,
            "restSecs": 60
          }
        ]
      },
      {
        "id": "legs",
        "name": {
          "en": "Legs",
          "de": "Beine"
        },
        "warmup": [
          {
            "name": {
              "en": "Marching in place"
            },
            "detail": {
              "en": "30 seconds, knees high"
            }
          },
          {
            "name": {
              "en": "Leg swings (front-back)"
            },
            "detail": {
              "en": "10 each leg"
            }
          },
          {
            "name": {
              "en": "Hip circles"
            },
            "detail": {
              "en": "10 each direction"
            }
          },
          {
            "name": {
              "en": "Glute bridges"
            },
            "detail": {
              "en": "10 reps, 2-second hold"
            }
          },
          {
            "name": {
              "en": "Bodyweight squats"
            },
            "detail": {
              "en": "15 slow reps, full depth"
            }
          }
        ],
        "exercises": [
          {
            "exerciseId": "leg-press",
            "sets": 4,
            "reps": 12,
            "restSecs": 120
          },
          {
            "exerciseId": "smith-machine-squat",
            "sets": 3,
            "reps": 10,
            "restSecs": 120
          },
          {
            "exerciseId": "leg-extension-machine",
            "sets": 3,
            "reps": 15,
            "restSecs": 75
          },
          {
            "exerciseId": "leg-curl-machine",
            "sets": 3,
            "reps": 12,
            "restSecs": 75
          },
          {
            "exerciseId": "calf-raise-machine",
            "sets": 4,
            "reps": 20,
            "restSecs": 60
          },
          {
            "exerciseId": "plank",
            "sets": 3,
            "reps": 45,
            "restSecs": 45
          }
        ]
      },
      {
        "id": "shoulders-arms-spec",
        "name": {
          "en": "Shoulders + Arms Blowout",
          "de": "Schultern + Arme"
        },
        "warmup": [
          {
            "name": {
              "en": "Arm circles"
            },
            "detail": {
              "en": "10 forward, 10 backward each arm"
            }
          },
          {
            "name": {
              "en": "Jumping jacks"
            },
            "detail": {
              "en": "30 seconds, light pace"
            }
          },
          {
            "name": {
              "en": "Cross-body shoulder stretch"
            },
            "detail": {
              "en": "15 s each side"
            }
          },
          {
            "name": {
              "en": "Shoulder rolls"
            },
            "detail": {
              "en": "10 forward, 10 backward"
            }
          }
        ],
        "exercises": [
          {
            "exerciseId": "shoulder-press-machine",
            "sets": 4,
            "reps": 10,
            "restSecs": 75
          },
          {
            "exerciseId": "arnold-press",
            "sets": 3,
            "reps": 12,
            "restSecs": 75
          },
          {
            "exerciseId": "dumbbell-lateral-raise",
            "sets": 3,
            "reps": 15,
            "restSecs": 60
          },
          {
            "exerciseId": "cable-lateral-raise",
            "sets": 3,
            "reps": 15,
            "restSecs": 45
          },
          {
            "exerciseId": "cable-curl",
            "sets": 3,
            "reps": 12,
            "restSecs": 60
          },
          {
            "exerciseId": "hammer-curl",
            "sets": 3,
            "reps": 12,
            "restSecs": 60
          },
          {
            "exerciseId": "preacher-curl",
            "sets": 2,
            "reps": 12,
            "restSecs": 45
          },
          {
            "exerciseId": "tricep-pushdown",
            "sets": 3,
            "reps": 12,
            "restSecs": 60
          },
          {
            "exerciseId": "dumbbell-skull-crusher",
            "sets": 3,
            "reps": 12,
            "restSecs": 60
          }
        ]
      },
      {
        "id": "full-body-core",
        "name": {
          "en": "Full Body + Core",
          "de": "Ganzkörper + Rumpf"
        },
        "warmup": [
          {
            "name": {
              "en": "Jumping jacks"
            },
            "detail": {
              "en": "30 seconds, light pace"
            }
          },
          {
            "name": {
              "en": "Bodyweight squats"
            },
            "detail": {
              "en": "12 reps, slow and controlled"
            }
          },
          {
            "name": {
              "en": "Cat-cow"
            },
            "detail": {
              "en": "8 slow reps on mat"
            }
          }
        ],
        "exercises": [
          {
            "exerciseId": "dumbbell-press",
            "sets": 3,
            "reps": 12,
            "restSecs": 75
          },
          {
            "exerciseId": "cable-face-pull",
            "sets": 3,
            "reps": 15,
            "restSecs": 60
          },
          {
            "exerciseId": "dumbbell-lunge",
            "sets": 3,
            "reps": 12,
            "restSecs": 90
          },
          {
            "exerciseId": "hip-abductor",
            "sets": 3,
            "reps": 20,
            "restSecs": 60
          },
          {
            "exerciseId": "cable-crunch",
            "sets": 3,
            "reps": 15,
            "restSecs": 60
          },
          {
            "exerciseId": "rotary-torso",
            "sets": 3,
            "reps": 15,
            "restSecs": 60
          },
          {
            "exerciseId": "hanging-knee-raise",
            "sets": 3,
            "reps": 15,
            "restSecs": 60
          }
        ]
      }
    ]
  },
  "foundations-2day": {
    "id": "foundations-2day",
    "name": "Foundations",
    "tagline": {
      "en": "A gentle, joint-friendly starting point for beginners, 50+, or anyone returning after a long break.",
      "de": "Zwei Ganzkörper-Einheiten pro Woche — der minimale wirksame Einstieg."
    },
    "difficulty": "beginner",
    "daysPerWeek": 2,
    "estimatedMins": 35,
    "goal": "functional-longevity",
    "schedule": {
      "cycleLength": 7,
      "rotation": [
        {
          "type": "workout",
          "dayId": "full-body-a"
        },
        {
          "type": "rest"
        },
        {
          "type": "cardio"
        },
        {
          "type": "rest"
        },
        {
          "type": "workout",
          "dayId": "full-body-b"
        },
        {
          "type": "rest"
        },
        {
          "type": "rest"
        }
      ]
    },
    "days": [
      {
        "id": "full-body-a",
        "name": {
          "en": "Full Body A",
          "de": "Ganzkörper A"
        },
        "warmup": [
          {
            "name": {
              "en": "Marching in place"
            },
            "detail": {
              "en": "1 min, easy pace"
            }
          },
          {
            "name": {
              "en": "Arm circles"
            },
            "detail": {
              "en": "10 forward, 10 backward each arm"
            }
          },
          {
            "name": {
              "en": "Shoulder rolls"
            },
            "detail": {
              "en": "10 forward, 10 backward"
            }
          },
          {
            "name": {
              "en": "Cat-cow"
            },
            "detail": {
              "en": "8 slow reps on mat"
            }
          },
          {
            "name": {
              "en": "Hip circles"
            },
            "detail": {
              "en": "8 each direction"
            }
          },
          {
            "name": {
              "en": "Bodyweight sit-to-stand"
            },
            "detail": {
              "en": "8 reps, slow and controlled"
            }
          }
        ],
        "exercises": [
          {
            "exerciseId": "chest-press-machine",
            "sets": 2,
            "reps": 12,
            "restSecs": 90
          },
          {
            "exerciseId": "seated-cable-row",
            "sets": 2,
            "reps": 12,
            "restSecs": 90
          },
          {
            "exerciseId": "leg-press",
            "sets": 2,
            "reps": 15,
            "restSecs": 120
          },
          {
            "exerciseId": "leg-curl-machine",
            "sets": 2,
            "reps": 12,
            "restSecs": 90
          },
          {
            "exerciseId": "cable-face-pull",
            "sets": 2,
            "reps": 15,
            "restSecs": 60
          },
          {
            "exerciseId": "hip-abductor",
            "sets": 2,
            "reps": 15,
            "restSecs": 60
          },
          {
            "exerciseId": "plank",
            "sets": 2,
            "reps": 20,
            "restSecs": 60
          }
        ]
      },
      {
        "id": "full-body-b",
        "name": {
          "en": "Full Body B",
          "de": "Ganzkörper B"
        },
        "warmup": [
          {
            "name": {
              "en": "Marching in place"
            },
            "detail": {
              "en": "1 min, easy pace"
            }
          },
          {
            "name": {
              "en": "Arm circles"
            },
            "detail": {
              "en": "10 forward, 10 backward each arm"
            }
          },
          {
            "name": {
              "en": "Cross-body shoulder stretch"
            },
            "detail": {
              "en": "15 s each side"
            }
          },
          {
            "name": {
              "en": "Cat-cow"
            },
            "detail": {
              "en": "8 slow reps on mat"
            }
          },
          {
            "name": {
              "en": "Leg swings (front-back)"
            },
            "detail": {
              "en": "8 each leg, holding support"
            }
          },
          {
            "name": {
              "en": "Bodyweight sit-to-stand"
            },
            "detail": {
              "en": "8 reps, slow and controlled"
            }
          }
        ],
        "exercises": [
          {
            "exerciseId": "lat-pulldown",
            "sets": 2,
            "reps": 12,
            "restSecs": 90
          },
          {
            "exerciseId": "shoulder-press-machine",
            "sets": 2,
            "reps": 12,
            "restSecs": 90
          },
          {
            "exerciseId": "leg-extension-machine",
            "sets": 2,
            "reps": 15,
            "restSecs": 90
          },
          {
            "exerciseId": "back-extension",
            "sets": 2,
            "reps": 12,
            "restSecs": 60
          },
          {
            "exerciseId": "calf-raise-machine",
            "sets": 2,
            "reps": 15,
            "restSecs": 60
          },
          {
            "exerciseId": "cable-curl",
            "sets": 2,
            "reps": 12,
            "restSecs": 60
          },
          {
            "exerciseId": "rotary-torso",
            "sets": 2,
            "reps": 12,
            "restSecs": 60
          }
        ]
      }
    ]
  },
  "joint-friendly-strength-3day": {
    "id": "joint-friendly-strength-3day",
    "name": "Joint-Friendly Strength",
    "tagline": {
      "en": "Real strength gains while keeping the highest-injury-risk movements off the table. 3 days/week.",
      "de": "Gelenkschonender Kraftaufbau, 3 Tage/Woche."
    },
    "difficulty": "intermediate",
    "daysPerWeek": 3,
    "estimatedMins": 55,
    "goal": "functional-longevity",
    "schedule": {
      "cycleLength": 7,
      "rotation": [
        {
          "type": "workout",
          "dayId": "full-body-a"
        },
        {
          "type": "rest"
        },
        {
          "type": "workout",
          "dayId": "full-body-b"
        },
        {
          "type": "cardio"
        },
        {
          "type": "workout",
          "dayId": "full-body-c"
        },
        {
          "type": "rest"
        },
        {
          "type": "rest"
        }
      ]
    },
    "days": [
      {
        "id": "full-body-a",
        "name": {
          "en": "Full Body A",
          "de": "Ganzkörper A"
        },
        "warmup": [
          {
            "name": {
              "en": "Marching / high knees in place"
            },
            "detail": {
              "en": "1 min, easy pace"
            }
          },
          {
            "name": {
              "en": "Arm circles"
            },
            "detail": {
              "en": "10 forward, 10 backward each arm"
            }
          },
          {
            "name": {
              "en": "Shoulder rolls"
            },
            "detail": {
              "en": "10 forward, 10 backward"
            }
          },
          {
            "name": {
              "en": "Cat-cow"
            },
            "detail": {
              "en": "8 slow reps on mat"
            }
          },
          {
            "name": {
              "en": "Hip circles"
            },
            "detail": {
              "en": "10 each direction"
            }
          },
          {
            "name": {
              "en": "Bodyweight squats"
            },
            "detail": {
              "en": "12 reps, full depth, controlled"
            }
          },
          {
            "name": {
              "en": "Band pull-aparts"
            },
            "detail": {
              "en": "15 reps, light tension"
            }
          }
        ],
        "exercises": [
          {
            "exerciseId": "chest-press-machine",
            "sets": 3,
            "reps": 12,
            "restSecs": 90
          },
          {
            "exerciseId": "seated-cable-row",
            "sets": 3,
            "reps": 12,
            "restSecs": 90
          },
          {
            "exerciseId": "leg-press",
            "sets": 3,
            "reps": 15,
            "restSecs": 120
          },
          {
            "exerciseId": "leg-curl-machine",
            "sets": 3,
            "reps": 12,
            "restSecs": 90
          },
          {
            "exerciseId": "cable-face-pull",
            "sets": 3,
            "reps": 15,
            "restSecs": 60
          },
          {
            "exerciseId": "hip-abductor",
            "sets": 3,
            "reps": 15,
            "restSecs": 60
          },
          {
            "exerciseId": "cable-curl",
            "sets": 2,
            "reps": 12,
            "restSecs": 60
          },
          {
            "exerciseId": "plank",
            "sets": 3,
            "reps": 30,
            "restSecs": 60
          }
        ]
      },
      {
        "id": "full-body-b",
        "name": {
          "en": "Full Body B",
          "de": "Ganzkörper B"
        },
        "warmup": [
          {
            "name": {
              "en": "Marching / high knees in place"
            },
            "detail": {
              "en": "1 min, easy pace"
            }
          },
          {
            "name": {
              "en": "Arm circles"
            },
            "detail": {
              "en": "10 forward, 10 backward each arm"
            }
          },
          {
            "name": {
              "en": "Cross-body shoulder stretch"
            },
            "detail": {
              "en": "15 s each side"
            }
          },
          {
            "name": {
              "en": "Cat-cow"
            },
            "detail": {
              "en": "8 slow reps on mat"
            }
          },
          {
            "name": {
              "en": "Leg swings (side-side)"
            },
            "detail": {
              "en": "10 each leg"
            }
          },
          {
            "name": {
              "en": "Glute bridges"
            },
            "detail": {
              "en": "12 reps, 2-second hold"
            }
          },
          {
            "name": {
              "en": "Band pull-aparts"
            },
            "detail": {
              "en": "15 reps, light tension"
            }
          }
        ],
        "exercises": [
          {
            "exerciseId": "lat-pulldown",
            "sets": 3,
            "reps": 12,
            "restSecs": 90
          },
          {
            "exerciseId": "shoulder-press-machine",
            "sets": 3,
            "reps": 12,
            "restSecs": 90
          },
          {
            "exerciseId": "leg-extension-machine",
            "sets": 3,
            "reps": 15,
            "restSecs": 90
          },
          {
            "exerciseId": "dumbbell-lunge",
            "sets": 3,
            "reps": 10,
            "restSecs": 90
          },
          {
            "exerciseId": "back-extension",
            "sets": 3,
            "reps": 15,
            "restSecs": 60
          },
          {
            "exerciseId": "dumbbell-lateral-raise",
            "sets": 3,
            "reps": 15,
            "restSecs": 60
          },
          {
            "exerciseId": "tricep-pushdown",
            "sets": 2,
            "reps": 12,
            "restSecs": 60
          },
          {
            "exerciseId": "rotary-torso",
            "sets": 3,
            "reps": 15,
            "restSecs": 60
          }
        ]
      },
      {
        "id": "full-body-c",
        "name": {
          "en": "Full Body C"
        },
        "warmup": [
          {
            "name": {
              "en": "Marching / high knees in place"
            },
            "detail": {
              "en": "1 min, easy pace"
            }
          },
          {
            "name": {
              "en": "Shoulder rolls"
            },
            "detail": {
              "en": "10 forward, 10 backward"
            }
          },
          {
            "name": {
              "en": "Hip circles"
            },
            "detail": {
              "en": "10 each direction"
            }
          },
          {
            "name": {
              "en": "Cat-cow"
            },
            "detail": {
              "en": "8 slow reps on mat"
            }
          },
          {
            "name": {
              "en": "Glute bridges"
            },
            "detail": {
              "en": "12 reps, 2-second hold"
            }
          },
          {
            "name": {
              "en": "Bodyweight squats"
            },
            "detail": {
              "en": "12 reps, full depth, controlled"
            }
          },
          {
            "name": {
              "en": "Band pull-aparts"
            },
            "detail": {
              "en": "15 reps, light tension"
            }
          }
        ],
        "exercises": [
          {
            "exerciseId": "pec-deck",
            "sets": 3,
            "reps": 12,
            "restSecs": 90
          },
          {
            "exerciseId": "dumbbell-row",
            "sets": 3,
            "reps": 12,
            "restSecs": 90
          },
          {
            "exerciseId": "smith-machine-squat",
            "sets": 3,
            "reps": 10,
            "restSecs": 120
          },
          {
            "exerciseId": "leg-curl-machine",
            "sets": 3,
            "reps": 12,
            "restSecs": 90
          },
          {
            "exerciseId": "calf-raise-machine",
            "sets": 3,
            "reps": 15,
            "restSecs": 60
          },
          {
            "exerciseId": "cable-face-pull",
            "sets": 3,
            "reps": 15,
            "restSecs": 60
          },
          {
            "exerciseId": "hammer-curl",
            "sets": 2,
            "reps": 12,
            "restSecs": 60
          },
          {
            "exerciseId": "hanging-knee-raise",
            "sets": 3,
            "reps": 12,
            "restSecs": 60
          }
        ]
      }
    ]
  },
  "lunch-break-30": {
    "id": "lunch-break-30",
    "name": "Lunch Break 30",
    "tagline": {
      "en": "A true 30-minute full-body circuit for beginners squeezing in a session between meetings."
    },
    "difficulty": "beginner",
    "daysPerWeek": 2,
    "estimatedMins": 28,
    "goal": "time-efficient",
    "schedule": {
      "cycleLength": 7,
      "rotation": [
        {
          "type": "workout",
          "dayId": "circuit-a"
        },
        {
          "type": "rest"
        },
        {
          "type": "workout",
          "dayId": "circuit-b"
        },
        {
          "type": "rest"
        },
        {
          "type": "cardio"
        },
        {
          "type": "rest"
        },
        {
          "type": "rest"
        }
      ]
    },
    "days": [
      {
        "id": "circuit-a",
        "name": {
          "en": "Full Body Circuit A"
        },
        "warmup": [
          {
            "name": {
              "en": "Arm circles"
            },
            "detail": {
              "en": "10 forward, 10 backward"
            }
          },
          {
            "name": {
              "en": "Bodyweight squats"
            },
            "detail": {
              "en": "10 reps, slow and controlled"
            }
          },
          {
            "name": {
              "en": "Hip circles"
            },
            "detail": {
              "en": "10 each direction"
            }
          },
          {
            "name": {
              "en": "Cat-cow"
            },
            "detail": {
              "en": "5 slow reps"
            }
          }
        ],
        "exercises": [
          {
            "exerciseId": "leg-press",
            "sets": 3,
            "reps": 12,
            "restSecs": 45
          },
          {
            "exerciseId": "chest-press-machine",
            "sets": 3,
            "reps": 12,
            "restSecs": 45
          },
          {
            "exerciseId": "seated-cable-row",
            "sets": 3,
            "reps": 12,
            "restSecs": 45
          },
          {
            "exerciseId": "shoulder-press-machine",
            "sets": 2,
            "reps": 12,
            "restSecs": 45
          },
          {
            "exerciseId": "plank",
            "sets": 2,
            "reps": 30,
            "restSecs": 45
          }
        ]
      },
      {
        "id": "circuit-b",
        "name": {
          "en": "Full Body Circuit B"
        },
        "warmup": [
          {
            "name": {
              "en": "Arm circles"
            },
            "detail": {
              "en": "10 forward, 10 backward"
            }
          },
          {
            "name": {
              "en": "Leg swings"
            },
            "detail": {
              "en": "10 front-back each leg"
            }
          },
          {
            "name": {
              "en": "Hip circles"
            },
            "detail": {
              "en": "10 each direction"
            }
          },
          {
            "name": {
              "en": "Cat-cow"
            },
            "detail": {
              "en": "5 slow reps"
            }
          }
        ],
        "exercises": [
          {
            "exerciseId": "smith-machine-squat",
            "sets": 3,
            "reps": 10,
            "restSecs": 45
          },
          {
            "exerciseId": "lat-pulldown",
            "sets": 3,
            "reps": 12,
            "restSecs": 45
          },
          {
            "exerciseId": "pec-deck",
            "sets": 3,
            "reps": 12,
            "restSecs": 45
          },
          {
            "exerciseId": "leg-curl-machine",
            "sets": 2,
            "reps": 12,
            "restSecs": 45
          },
          {
            "exerciseId": "ab-crunch-machine",
            "sets": 2,
            "reps": 15,
            "restSecs": 45
          }
        ]
      }
    ]
  },
  "antagonist-express-4day": {
    "id": "antagonist-express-4day",
    "name": "Antagonist Express",
    "tagline": {
      "en": "4 short upper/lower sessions a week using superset pairing — every session under 35 minutes."
    },
    "difficulty": "intermediate",
    "daysPerWeek": 4,
    "estimatedMins": 32,
    "goal": "time-efficient",
    "schedule": {
      "cycleLength": 7,
      "rotation": [
        {
          "type": "workout",
          "dayId": "upper-push-pull-1"
        },
        {
          "type": "workout",
          "dayId": "lower-1"
        },
        {
          "type": "rest"
        },
        {
          "type": "workout",
          "dayId": "upper-push-pull-2"
        },
        {
          "type": "workout",
          "dayId": "lower-2"
        },
        {
          "type": "cardio"
        },
        {
          "type": "rest"
        }
      ]
    },
    "days": [
      {
        "id": "upper-push-pull-1",
        "name": {
          "en": "Upper: Push/Pull Superset"
        },
        "warmup": [
          {
            "name": {
              "en": "Arm circles"
            },
            "detail": {
              "en": "10 forward, 10 backward each arm"
            }
          },
          {
            "name": {
              "en": "Shoulder rolls"
            },
            "detail": {
              "en": "10 forward, 10 backward"
            }
          },
          {
            "name": {
              "en": "Band pull-aparts (bodyweight reach)"
            },
            "detail": {
              "en": "15 reps, light and quick"
            }
          }
        ],
        "exercises": [
          {
            "exerciseId": "chest-press-machine",
            "sets": 3,
            "reps": 10,
            "restSecs": 45
          },
          {
            "exerciseId": "seated-cable-row",
            "sets": 3,
            "reps": 10,
            "restSecs": 45
          },
          {
            "exerciseId": "shoulder-press-machine",
            "sets": 3,
            "reps": 10,
            "restSecs": 45
          },
          {
            "exerciseId": "lat-pulldown",
            "sets": 3,
            "reps": 10,
            "restSecs": 45
          },
          {
            "exerciseId": "cable-curl",
            "sets": 2,
            "reps": 12,
            "restSecs": 45
          },
          {
            "exerciseId": "tricep-pushdown",
            "sets": 2,
            "reps": 12,
            "restSecs": 45
          }
        ]
      },
      {
        "id": "lower-1",
        "name": {
          "en": "Lower: Quad/Hamstring Superset"
        },
        "warmup": [
          {
            "name": {
              "en": "Leg swings (front-back)"
            },
            "detail": {
              "en": "10 each leg"
            }
          },
          {
            "name": {
              "en": "Hip circles"
            },
            "detail": {
              "en": "10 each direction"
            }
          },
          {
            "name": {
              "en": "Bodyweight squats"
            },
            "detail": {
              "en": "10 slow reps"
            }
          }
        ],
        "exercises": [
          {
            "exerciseId": "leg-press",
            "sets": 3,
            "reps": 12,
            "restSecs": 45
          },
          {
            "exerciseId": "leg-curl-machine",
            "sets": 3,
            "reps": 12,
            "restSecs": 45
          },
          {
            "exerciseId": "leg-extension-machine",
            "sets": 3,
            "reps": 12,
            "restSecs": 45
          },
          {
            "exerciseId": "calf-raise-machine",
            "sets": 2,
            "reps": 20,
            "restSecs": 45
          },
          {
            "exerciseId": "hanging-knee-raise",
            "sets": 2,
            "reps": 20,
            "restSecs": 45
          }
        ]
      },
      {
        "id": "upper-push-pull-2",
        "name": {
          "en": "Upper: Push/Pull Superset"
        },
        "warmup": [
          {
            "name": {
              "en": "Arm circles"
            },
            "detail": {
              "en": "10 forward, 10 backward each arm"
            }
          },
          {
            "name": {
              "en": "Shoulder rolls"
            },
            "detail": {
              "en": "10 forward, 10 backward"
            }
          },
          {
            "name": {
              "en": "Cross-body shoulder stretch"
            },
            "detail": {
              "en": "10 s each side"
            }
          }
        ],
        "exercises": [
          {
            "exerciseId": "dumbbell-press",
            "sets": 3,
            "reps": 10,
            "restSecs": 45
          },
          {
            "exerciseId": "dumbbell-row",
            "sets": 3,
            "reps": 10,
            "restSecs": 45
          },
          {
            "exerciseId": "arnold-press",
            "sets": 3,
            "reps": 10,
            "restSecs": 45
          },
          {
            "exerciseId": "assisted-pull-up",
            "sets": 3,
            "reps": 8,
            "restSecs": 45
          },
          {
            "exerciseId": "hammer-curl",
            "sets": 2,
            "reps": 12,
            "restSecs": 45
          },
          {
            "exerciseId": "overhead-tricep-extension",
            "sets": 2,
            "reps": 12,
            "restSecs": 45
          }
        ]
      },
      {
        "id": "lower-2",
        "name": {
          "en": "Lower: Glute/Core Superset"
        },
        "warmup": [
          {
            "name": {
              "en": "Leg swings (side-side)"
            },
            "detail": {
              "en": "10 each leg"
            }
          },
          {
            "name": {
              "en": "Hip circles"
            },
            "detail": {
              "en": "10 each direction"
            }
          },
          {
            "name": {
              "en": "Glute bridges"
            },
            "detail": {
              "en": "10 reps, 2-second hold"
            }
          }
        ],
        "exercises": [
          {
            "exerciseId": "smith-machine-squat",
            "sets": 3,
            "reps": 10,
            "restSecs": 45
          },
          {
            "exerciseId": "hip-abductor",
            "sets": 3,
            "reps": 15,
            "restSecs": 45
          },
          {
            "exerciseId": "dumbbell-lunge",
            "sets": 3,
            "reps": 10,
            "restSecs": 45
          },
          {
            "exerciseId": "glute-kickback-machine",
            "sets": 2,
            "reps": 15,
            "restSecs": 45
          },
          {
            "exerciseId": "rotary-torso",
            "sets": 2,
            "reps": 15,
            "restSecs": 45
          }
        ]
      }
    ]
  },
  "fatloss-circuit-4day": {
    "id": "fatloss-circuit-4day",
    "name": "Fat-Loss Circuit Engine",
    "tagline": {
      "en": "High-density full-body giant sets, four days a week, built to maximize calorie burn and muscle retention together."
    },
    "difficulty": "intermediate",
    "daysPerWeek": 4,
    "estimatedMins": 40,
    "goal": "weight-loss",
    "schedule": {
      "cycleLength": 7,
      "rotation": [
        {
          "type": "workout",
          "dayId": "giant-set-1"
        },
        {
          "type": "workout",
          "dayId": "giant-set-2"
        },
        {
          "type": "rest"
        },
        {
          "type": "workout",
          "dayId": "giant-set-3"
        },
        {
          "type": "workout",
          "dayId": "giant-set-4"
        },
        {
          "type": "cardio"
        },
        {
          "type": "rest"
        }
      ]
    },
    "days": [
      {
        "id": "giant-set-1",
        "name": {
          "en": "Full Body Giant Sets I"
        },
        "warmup": [
          {
            "name": {
              "en": "Marching in place"
            },
            "detail": {
              "en": "4 min, building pace"
            }
          },
          {
            "name": {
              "en": "Bodyweight squats"
            },
            "detail": {
              "en": "12 reps"
            }
          },
          {
            "name": {
              "en": "Arm circles + shoulder rolls"
            },
            "detail": {
              "en": "10 each direction"
            }
          }
        ],
        "exercises": [
          {
            "exerciseId": "leg-press",
            "sets": 4,
            "reps": 15,
            "restSecs": 60
          },
          {
            "exerciseId": "chest-press-machine",
            "sets": 4,
            "reps": 15,
            "restSecs": 30
          },
          {
            "exerciseId": "seated-cable-row",
            "sets": 4,
            "reps": 15,
            "restSecs": 30
          },
          {
            "exerciseId": "leg-curl-machine",
            "sets": 3,
            "reps": 15,
            "restSecs": 30
          },
          {
            "exerciseId": "shoulder-press-machine",
            "sets": 3,
            "reps": 15,
            "restSecs": 30
          },
          {
            "exerciseId": "rotary-torso",
            "sets": 3,
            "reps": 15,
            "restSecs": 30
          }
        ]
      },
      {
        "id": "giant-set-2",
        "name": {
          "en": "Full Body Giant Sets II"
        },
        "warmup": [
          {
            "name": {
              "en": "Jumping jacks"
            },
            "detail": {
              "en": "3 min, moderate pace"
            }
          },
          {
            "name": {
              "en": "Leg swings"
            },
            "detail": {
              "en": "10 each leg, front-back and side-side"
            }
          },
          {
            "name": {
              "en": "Cat-cow"
            },
            "detail": {
              "en": "5 slow reps"
            }
          }
        ],
        "exercises": [
          {
            "exerciseId": "smith-machine-squat",
            "sets": 4,
            "reps": 12,
            "restSecs": 60
          },
          {
            "exerciseId": "lat-pulldown",
            "sets": 4,
            "reps": 15,
            "restSecs": 30
          },
          {
            "exerciseId": "dumbbell-lunge",
            "sets": 3,
            "reps": 12,
            "restSecs": 30
          },
          {
            "exerciseId": "pec-deck",
            "sets": 3,
            "reps": 15,
            "restSecs": 30
          },
          {
            "exerciseId": "cable-curl",
            "sets": 2,
            "reps": 15,
            "restSecs": 30
          },
          {
            "exerciseId": "cable-crunch",
            "sets": 3,
            "reps": 15,
            "restSecs": 30
          }
        ]
      },
      {
        "id": "giant-set-3",
        "name": {
          "en": "Full Body Giant Sets III"
        },
        "warmup": [
          {
            "name": {
              "en": "Marching in place"
            },
            "detail": {
              "en": "4 min, building pace"
            }
          },
          {
            "name": {
              "en": "Hip circles"
            },
            "detail": {
              "en": "10 each direction"
            }
          },
          {
            "name": {
              "en": "Band pull-aparts"
            },
            "detail": {
              "en": "15 reps, light"
            }
          }
        ],
        "exercises": [
          {
            "exerciseId": "leg-press",
            "sets": 4,
            "reps": 15,
            "restSecs": 60
          },
          {
            "exerciseId": "dumbbell-row",
            "sets": 3,
            "reps": 15,
            "restSecs": 30
          },
          {
            "exerciseId": "incline-dumbbell-press",
            "sets": 3,
            "reps": 15,
            "restSecs": 30
          },
          {
            "exerciseId": "leg-extension-machine",
            "sets": 3,
            "reps": 15,
            "restSecs": 30
          },
          {
            "exerciseId": "tricep-pushdown",
            "sets": 2,
            "reps": 15,
            "restSecs": 30
          },
          {
            "exerciseId": "hanging-knee-raise",
            "sets": 3,
            "reps": 15,
            "restSecs": 30
          }
        ]
      },
      {
        "id": "giant-set-4",
        "name": {
          "en": "Full Body Giant Sets IV"
        },
        "warmup": [
          {
            "name": {
              "en": "Jumping jacks"
            },
            "detail": {
              "en": "3 min, moderate pace"
            }
          },
          {
            "name": {
              "en": "Glute bridges"
            },
            "detail": {
              "en": "12 reps, 2-second hold"
            }
          },
          {
            "name": {
              "en": "Arm circles"
            },
            "detail": {
              "en": "10 forward, 10 backward"
            }
          }
        ],
        "exercises": [
          {
            "exerciseId": "smith-machine-squat",
            "sets": 4,
            "reps": 12,
            "restSecs": 60
          },
          {
            "exerciseId": "seated-cable-row",
            "sets": 4,
            "reps": 15,
            "restSecs": 30
          },
          {
            "exerciseId": "shoulder-press-machine",
            "sets": 3,
            "reps": 15,
            "restSecs": 30
          },
          {
            "exerciseId": "hip-abductor",
            "sets": 3,
            "reps": 20,
            "restSecs": 30
          },
          {
            "exerciseId": "hammer-curl",
            "sets": 2,
            "reps": 15,
            "restSecs": 30
          },
          {
            "exerciseId": "ab-crunch-machine",
            "sets": 3,
            "reps": 15,
            "restSecs": 30
          }
        ]
      }
    ]
  },
  "total-body-burn-5day": {
    "id": "total-body-burn-5day",
    "name": "Total Body Burn",
    "tagline": {
      "en": "Five days of demanding full-body giant-set circuits for advanced trainees chasing serious fat loss while preserving muscle."
    },
    "difficulty": "advanced",
    "daysPerWeek": 5,
    "estimatedMins": 55,
    "goal": "weight-loss",
    "schedule": {
      "cycleLength": 7,
      "rotation": [
        {
          "type": "workout",
          "dayId": "burn-1"
        },
        {
          "type": "workout",
          "dayId": "burn-2"
        },
        {
          "type": "workout",
          "dayId": "burn-3"
        },
        {
          "type": "rest"
        },
        {
          "type": "workout",
          "dayId": "burn-4"
        },
        {
          "type": "workout",
          "dayId": "burn-5"
        },
        {
          "type": "rest"
        }
      ]
    },
    "days": [
      {
        "id": "burn-1",
        "name": {
          "en": "Total Body Burn I"
        },
        "warmup": [
          {
            "name": {
              "en": "Marching in place"
            },
            "detail": {
              "en": "5 min, building pace"
            }
          },
          {
            "name": {
              "en": "Bodyweight squats"
            },
            "detail": {
              "en": "15 reps"
            }
          },
          {
            "name": {
              "en": "Arm circles + leg swings"
            },
            "detail": {
              "en": "10 each direction/leg"
            }
          }
        ],
        "exercises": [
          {
            "exerciseId": "leg-press",
            "sets": 4,
            "reps": 18,
            "restSecs": 60
          },
          {
            "exerciseId": "chest-press-machine",
            "sets": 4,
            "reps": 15,
            "restSecs": 30
          },
          {
            "exerciseId": "seated-cable-row",
            "sets": 4,
            "reps": 15,
            "restSecs": 30
          },
          {
            "exerciseId": "leg-curl-machine",
            "sets": 3,
            "reps": 15,
            "restSecs": 30
          },
          {
            "exerciseId": "shoulder-press-machine",
            "sets": 3,
            "reps": 15,
            "restSecs": 30
          },
          {
            "exerciseId": "cable-crossover",
            "sets": 3,
            "reps": 15,
            "restSecs": 30
          },
          {
            "exerciseId": "rotary-torso",
            "sets": 3,
            "reps": 15,
            "restSecs": 30
          }
        ]
      },
      {
        "id": "burn-2",
        "name": {
          "en": "Total Body Burn II"
        },
        "warmup": [
          {
            "name": {
              "en": "Jumping jacks"
            },
            "detail": {
              "en": "4 min, building pace"
            }
          },
          {
            "name": {
              "en": "Leg swings"
            },
            "detail": {
              "en": "10 each leg, both planes"
            }
          },
          {
            "name": {
              "en": "Cat-cow"
            },
            "detail": {
              "en": "5 slow reps"
            }
          }
        ],
        "exercises": [
          {
            "exerciseId": "smith-machine-squat",
            "sets": 4,
            "reps": 12,
            "restSecs": 60
          },
          {
            "exerciseId": "lat-pulldown",
            "sets": 4,
            "reps": 15,
            "restSecs": 30
          },
          {
            "exerciseId": "dumbbell-lunge",
            "sets": 3,
            "reps": 12,
            "restSecs": 30
          },
          {
            "exerciseId": "pec-deck",
            "sets": 3,
            "reps": 15,
            "restSecs": 30
          },
          {
            "exerciseId": "dumbbell-row",
            "sets": 3,
            "reps": 15,
            "restSecs": 30
          },
          {
            "exerciseId": "cable-curl",
            "sets": 2,
            "reps": 15,
            "restSecs": 30
          },
          {
            "exerciseId": "cable-crunch",
            "sets": 3,
            "reps": 15,
            "restSecs": 30
          }
        ]
      },
      {
        "id": "burn-3",
        "name": {
          "en": "Total Body Burn III"
        },
        "warmup": [
          {
            "name": {
              "en": "Marching in place"
            },
            "detail": {
              "en": "5 min, building pace"
            }
          },
          {
            "name": {
              "en": "Hip circles"
            },
            "detail": {
              "en": "10 each direction"
            }
          },
          {
            "name": {
              "en": "Band pull-aparts"
            },
            "detail": {
              "en": "15 reps, light"
            }
          }
        ],
        "exercises": [
          {
            "exerciseId": "leg-press",
            "sets": 4,
            "reps": 18,
            "restSecs": 60
          },
          {
            "exerciseId": "incline-dumbbell-press",
            "sets": 3,
            "reps": 15,
            "restSecs": 30
          },
          {
            "exerciseId": "assisted-pull-up",
            "sets": 3,
            "reps": 12,
            "restSecs": 30
          },
          {
            "exerciseId": "leg-extension-machine",
            "sets": 3,
            "reps": 15,
            "restSecs": 30
          },
          {
            "exerciseId": "dumbbell-lateral-raise",
            "sets": 2,
            "reps": 15,
            "restSecs": 30
          },
          {
            "exerciseId": "tricep-pushdown",
            "sets": 2,
            "reps": 15,
            "restSecs": 30
          },
          {
            "exerciseId": "hanging-knee-raise",
            "sets": 3,
            "reps": 15,
            "restSecs": 30
          }
        ]
      },
      {
        "id": "burn-4",
        "name": {
          "en": "Total Body Burn IV"
        },
        "warmup": [
          {
            "name": {
              "en": "Jumping jacks"
            },
            "detail": {
              "en": "4 min, building pace"
            }
          },
          {
            "name": {
              "en": "Glute bridges"
            },
            "detail": {
              "en": "12 reps, 2-second hold"
            }
          },
          {
            "name": {
              "en": "Arm circles"
            },
            "detail": {
              "en": "10 forward, 10 backward"
            }
          }
        ],
        "exercises": [
          {
            "exerciseId": "smith-machine-squat",
            "sets": 4,
            "reps": 12,
            "restSecs": 60
          },
          {
            "exerciseId": "seated-cable-row",
            "sets": 4,
            "reps": 15,
            "restSecs": 30
          },
          {
            "exerciseId": "dumbbell-press",
            "sets": 3,
            "reps": 15,
            "restSecs": 30
          },
          {
            "exerciseId": "hip-abductor",
            "sets": 3,
            "reps": 20,
            "restSecs": 30
          },
          {
            "exerciseId": "hammer-curl",
            "sets": 2,
            "reps": 15,
            "restSecs": 30
          },
          {
            "exerciseId": "ab-crunch-machine",
            "sets": 3,
            "reps": 15,
            "restSecs": 30
          }
        ]
      },
      {
        "id": "burn-5",
        "name": {
          "en": "Total Body Burn V"
        },
        "warmup": [
          {
            "name": {
              "en": "Marching in place"
            },
            "detail": {
              "en": "5 min, building pace"
            }
          },
          {
            "name": {
              "en": "Leg swings"
            },
            "detail": {
              "en": "10 each leg, both planes"
            }
          },
          {
            "name": {
              "en": "Shoulder rolls"
            },
            "detail": {
              "en": "10 forward, 10 backward"
            }
          }
        ],
        "exercises": [
          {
            "exerciseId": "leg-press",
            "sets": 4,
            "reps": 18,
            "restSecs": 60
          },
          {
            "exerciseId": "lat-pulldown",
            "sets": 4,
            "reps": 15,
            "restSecs": 30
          },
          {
            "exerciseId": "cable-crossover",
            "sets": 3,
            "reps": 15,
            "restSecs": 30
          },
          {
            "exerciseId": "leg-curl-machine",
            "sets": 3,
            "reps": 15,
            "restSecs": 30
          },
          {
            "exerciseId": "arnold-press",
            "sets": 3,
            "reps": 12,
            "restSecs": 30
          },
          {
            "exerciseId": "plank",
            "sets": 3,
            "reps": 60,
            "restSecs": 30
          }
        ]
      }
    ]
  }
};

export const DEFAULT_PLAN_ID = "beginner-3day";
