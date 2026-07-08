import type { Exercise } from "../types";

export const EXERCISES: Record<string, Exercise> = {
  "chest-press-machine": {
    "id": "chest-press-machine",
    "name": "Chest Press Machine",
    "primaryMuscle": "mid-chest",
    "muscles": [
      "mid-chest",
      "triceps",
      "front-delts"
    ],
    "equipment": "machine",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 12,
    "restSecs": 90,
    "tip": {
      "en": "Keep elbows at 90° at the bottom. Press to just short of lockout to maintain tension. Don't arch your lower back away from the pad."
    }
  },
  "pec-deck": {
    "id": "pec-deck",
    "name": "Pec Deck (Butterfly)",
    "primaryMuscle": "mid-chest",
    "muscles": [
      "mid-chest",
      "front-delts"
    ],
    "equipment": "machine",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 12,
    "restSecs": 90,
    "tip": {
      "en": "Keep a slight bend in your elbows throughout. Squeeze the chest hard at the top, then control the stretch on the way back — don't let the weight slam."
    }
  },
  "cable-crossover": {
    "id": "cable-crossover",
    "name": "Cable Crossover",
    "primaryMuscle": "mid-chest",
    "muscles": [
      "mid-chest",
      "front-delts",
      "triceps"
    ],
    "equipment": "cable",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 12,
    "restSecs": 90,
    "tip": {
      "en": "Set cables at shoulder height. Step forward with one foot for balance, keep a slight forward lean and soft elbow bend. Bring hands together and cross slightly at the bottom for peak contraction."
    }
  },
  "dumbbell-press": {
    "id": "dumbbell-press",
    "name": "Dumbbell Chest Press",
    "primaryMuscle": "mid-chest",
    "muscles": [
      "mid-chest",
      "triceps",
      "front-delts"
    ],
    "equipment": "dumbbell",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 12,
    "restSecs": 90,
    "tip": {
      "en": "Lower dumbbells until they're level with your chest, elbows at roughly 75°. Press up and slightly in — don't flare elbows out to 90°. Touch dumbbells gently at the top."
    }
  },
  "incline-dumbbell-press": {
    "id": "incline-dumbbell-press",
    "name": "Incline Dumbbell Press",
    "primaryMuscle": "upper-chest",
    "muscles": [
      "upper-chest",
      "front-delts",
      "triceps"
    ],
    "equipment": "dumbbell",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 10,
    "restSecs": 90,
    "tip": {
      "en": "Set bench to 30–45°. The angle shifts load to the upper chest and front delts. Keep your feet flat and back against the pad. Control the descent to a 2-count."
    }
  },
  "dumbbell-fly": {
    "id": "dumbbell-fly",
    "name": "Dumbbell Fly",
    "primaryMuscle": "mid-chest",
    "muscles": [
      "mid-chest",
      "front-delts"
    ],
    "equipment": "dumbbell",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 12,
    "restSecs": 90,
    "tip": {
      "en": "Keep a consistent, soft bend in your elbows (think 'hugging a barrel'). Lower until you feel a deep stretch in the chest, then squeeze to bring dumbbells back together. Go lighter than you think — this is a stretch exercise."
    }
  },
  "lat-pulldown": {
    "id": "lat-pulldown",
    "name": "Lat Pulldown",
    "primaryMuscle": "lats",
    "muscles": [
      "lats",
      "biceps",
      "rear-delts"
    ],
    "equipment": "machine",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 12,
    "restSecs": 90,
    "tip": {
      "en": "Grip just outside shoulder width, lean back slightly. Initiate by depressing your shoulder blades, then drive elbows toward your hips. Avoid swinging or pulling with your arms alone."
    }
  },
  "seated-cable-row": {
    "id": "seated-cable-row",
    "name": "Seated Row",
    "primaryMuscle": "lats",
    "muscles": [
      "lats",
      "rhomboids",
      "rear-delts",
      "biceps"
    ],
    "equipment": "cable",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 12,
    "restSecs": 90,
    "tip": {
      "en": "Sit tall, slight knee bend, chest up. Pull the handle to your lower chest/upper abdomen, squeezing your shoulder blades together at the top. Let your arms fully extend on each rep for a full stretch."
    }
  },
  "back-extension": {
    "id": "back-extension",
    "name": "Lower Back Extension",
    "primaryMuscle": "lower-back",
    "muscles": [
      "lower-back",
      "glutes",
      "hamstrings"
    ],
    "equipment": "machine",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 15,
    "restSecs": 60,
    "tip": {
      "en": "Hinge at the hips, not the lower back. Lower until your torso is parallel to the floor, then drive your hips into the pad to rise. Hold briefly at the top. Keep your spine neutral — avoid rounding."
    }
  },
  "dumbbell-row": {
    "id": "dumbbell-row",
    "name": "Dumbbell Row",
    "primaryMuscle": "lats",
    "muscles": [
      "lats",
      "rhomboids",
      "biceps"
    ],
    "equipment": "dumbbell",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 10,
    "restSecs": 90,
    "tip": {
      "en": "Place one knee and hand on a bench. Let the dumbbell hang at arm's length. Row elbow straight back past your hip, keeping it tight to your body. Don't twist your torso — let your back do the work."
    }
  },
  "cable-face-pull": {
    "id": "cable-face-pull",
    "name": "Cable Face Pull",
    "primaryMuscle": "rear-delts",
    "muscles": [
      "rear-delts",
      "traps",
      "rhomboids"
    ],
    "equipment": "cable",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 15,
    "restSecs": 60,
    "tip": {
      "en": "Set the cable at face height with a rope attachment. Pull the rope toward your face, flaring elbows out and ending with hands beside your ears. Excellent for rear-delt health and rotator cuff stability — keep the weight light and controlled."
    }
  },
  "assisted-pull-up": {
    "id": "assisted-pull-up",
    "name": "Assisted Chin-Up / Pull-Up Machine",
    "primaryMuscle": "lats",
    "muscles": [
      "lats",
      "biceps",
      "rear-delts"
    ],
    "equipment": "machine",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 10,
    "restSecs": 90,
    "tip": {
      "en": "The counterweight reduces how much bodyweight you lift — use less counterweight over time as you get stronger. Lead with your chest, drive elbows down. Aim to reach a full hang at the bottom for a complete lat stretch."
    }
  },
  "shoulder-press-machine": {
    "id": "shoulder-press-machine",
    "name": "Shoulder Press Machine",
    "primaryMuscle": "front-delts",
    "muscles": [
      "front-delts",
      "side-delts",
      "triceps"
    ],
    "equipment": "machine",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 12,
    "restSecs": 90,
    "tip": {
      "en": "Adjust the seat so handles are at shoulder level. Press overhead without fully locking out. Control the descent — don't let the weight stack slam. Grip width should feel comfortable on your wrists."
    }
  },
  "dumbbell-lateral-raise": {
    "id": "dumbbell-lateral-raise",
    "name": "Dumbbell Lateral Raise",
    "primaryMuscle": "side-delts",
    "muscles": [
      "side-delts",
      "traps"
    ],
    "equipment": "dumbbell",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 15,
    "restSecs": 60,
    "tip": {
      "en": "Lead with your elbows and think about 'pouring water out of a pitcher' — thumb slightly down at the top. Raise only to shoulder height. Use lighter weight than feels natural; most people cheat on these."
    }
  },
  "cable-lateral-raise": {
    "id": "cable-lateral-raise",
    "name": "Cable Lateral Raise",
    "primaryMuscle": "side-delts",
    "muscles": [
      "side-delts"
    ],
    "equipment": "cable",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 15,
    "restSecs": 60,
    "tip": {
      "en": "Set the cable at the lowest position and stand sideways to the stack. The cable keeps constant tension through the full range — especially at the bottom where dumbbells are easy. Control the lowering phase."
    }
  },
  "dumbbell-front-raise": {
    "id": "dumbbell-front-raise",
    "name": "Dumbbell Front Raise",
    "primaryMuscle": "front-delts",
    "muscles": [
      "front-delts",
      "upper-chest"
    ],
    "equipment": "dumbbell",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 12,
    "restSecs": 60,
    "tip": {
      "en": "Raise one or both dumbbells to shoulder height with a slight bend in the elbow. Avoid swinging — keep your torso still and use your front delts to lift. Lower slowly for a 2–3 count."
    }
  },
  "arnold-press": {
    "id": "arnold-press",
    "name": "Arnold Press",
    "primaryMuscle": "front-delts",
    "muscles": [
      "front-delts",
      "side-delts",
      "triceps"
    ],
    "equipment": "dumbbell",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 12,
    "restSecs": 90,
    "tip": {
      "en": "Start with palms facing you at chin level, then rotate palms out as you press overhead. Reverse on the way down. The rotation hits all three delt heads. Sit upright with a supported back."
    }
  },
  "cable-curl": {
    "id": "cable-curl",
    "name": "Cable Curl",
    "primaryMuscle": "biceps",
    "muscles": [
      "biceps",
      "forearms"
    ],
    "equipment": "cable",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 10,
    "restSecs": 60,
    "tip": {
      "en": "Set the cable at the lowest position. Keep elbows pinned to your sides — only your forearms should move. The cable maintains tension at the bottom unlike dumbbells. Squeeze hard at the top."
    }
  },
  "dumbbell-curl": {
    "id": "dumbbell-curl",
    "name": "Dumbbell Curl",
    "primaryMuscle": "biceps",
    "muscles": [
      "biceps",
      "forearms"
    ],
    "equipment": "dumbbell",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 12,
    "restSecs": 60,
    "tip": {
      "en": "Alternate arms or curl both together. Keep upper arms still and supinate (rotate palms up) as you curl — this fully engages the bicep. Lower slowly with control rather than dropping the weight."
    }
  },
  "hammer-curl": {
    "id": "hammer-curl",
    "name": "Hammer Curl",
    "primaryMuscle": "brachialis",
    "muscles": [
      "brachialis",
      "biceps",
      "forearms"
    ],
    "equipment": "dumbbell",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 12,
    "restSecs": 60,
    "tip": {
      "en": "Palms face each other (neutral grip) throughout the movement. This loads the brachialis and brachioradialis more than a standard curl, building the 'peak' and forearm thickness. Keep elbows tight."
    }
  },
  "concentration-curl": {
    "id": "concentration-curl",
    "name": "Concentration Curl",
    "primaryMuscle": "biceps",
    "muscles": [
      "biceps"
    ],
    "equipment": "dumbbell",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 12,
    "restSecs": 60,
    "tip": {
      "en": "Sit on a bench, brace your upper arm against your inner thigh. This braces against swinging and isolates the bicep perfectly. Curl slowly and squeeze for a beat at the top before lowering."
    }
  },
  "preacher-curl": {
    "id": "preacher-curl",
    "name": "Preacher Curl",
    "primaryMuscle": "biceps",
    "muscles": [
      "biceps",
      "forearms"
    ],
    "equipment": "machine",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 12,
    "restSecs": 60,
    "tip": {
      "en": "The preacher pad removes the ability to cheat with momentum. Keep the back of your upper arm pressed against the pad at all times. Don't fully straighten at the bottom — stop just before the elbow hyperextends."
    }
  },
  "tricep-pushdown": {
    "id": "tricep-pushdown",
    "name": "Tricep Pushdown",
    "primaryMuscle": "triceps",
    "muscles": [
      "triceps"
    ],
    "equipment": "cable",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 10,
    "restSecs": 60,
    "tip": {
      "en": "Use a rope or straight bar attachment. Keep elbows pinned to your sides — they should not drift forward. Push down until arms are fully extended and squeeze the triceps. Control the return."
    }
  },
  "overhead-tricep-extension": {
    "id": "overhead-tricep-extension",
    "name": "Overhead Tricep Extension",
    "primaryMuscle": "triceps",
    "muscles": [
      "triceps"
    ],
    "equipment": "cable",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 12,
    "restSecs": 60,
    "tip": {
      "en": "Set the cable high and face away from the stack. Overhead position fully stretches the long head of the tricep. Keep elbows pointed forward and close together — don't let them flare. Extend to full lockout."
    }
  },
  "tricep-dip-machine": {
    "id": "tricep-dip-machine",
    "name": "Seated Tricep Press",
    "primaryMuscle": "triceps",
    "muscles": [
      "triceps",
      "mid-chest",
      "front-delts"
    ],
    "equipment": "machine",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 12,
    "restSecs": 90,
    "tip": {
      "en": "Adjust the seat so your elbows are at 90° at the start. Push down until arms are straight, then return under control. Keep your chest up and back against the pad — don't hunch forward."
    }
  },
  "dumbbell-skull-crusher": {
    "id": "dumbbell-skull-crusher",
    "name": "Dumbbell Skull Crusher",
    "primaryMuscle": "triceps",
    "muscles": [
      "triceps"
    ],
    "equipment": "dumbbell",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 12,
    "restSecs": 90,
    "tip": {
      "en": "Lie flat on a bench. Lower dumbbells toward your temples by bending only at the elbows — upper arms stay vertical and still. Extend back to the top. Go lighter than you expect; elbow tendons need time to adapt."
    }
  },
  "leg-press": {
    "id": "leg-press",
    "name": "Leg Press",
    "primaryMuscle": "quads",
    "muscles": [
      "quads",
      "glutes",
      "hamstrings"
    ],
    "equipment": "machine",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 15,
    "restSecs": 120,
    "tip": {
      "en": "Feet shoulder-width, mid-foot on the platform. Lower until knees are ~90° — don't let your lower back peel off the pad. Press through your heels. Never lock knees at the top. Higher foot position = more glutes; lower = more quads."
    }
  },
  "leg-curl-machine": {
    "id": "leg-curl-machine",
    "name": "Seated Leg Curl",
    "primaryMuscle": "hamstrings",
    "muscles": [
      "hamstrings",
      "calves"
    ],
    "equipment": "machine",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 12,
    "restSecs": 90,
    "tip": {
      "en": "Adjust so the pad sits just above your heels and the pivot aligns with your knees. Curl until hamstrings are fully contracted. Don't jerk — squeeze and hold briefly at the top, then control the descent."
    }
  },
  "leg-extension-machine": {
    "id": "leg-extension-machine",
    "name": "Leg Extension",
    "primaryMuscle": "quads",
    "muscles": [
      "quads"
    ],
    "equipment": "machine",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 15,
    "restSecs": 90,
    "tip": {
      "en": "Adjust the back pad so the pivot aligns with your knee joint. Extend to full lockout and hold for a count at the top to maximize quad contraction. Lower slowly. Avoid using very heavy weight — quad tendons are vulnerable."
    }
  },
  "smith-machine-squat": {
    "id": "smith-machine-squat",
    "name": "Smith Machine Squat",
    "primaryMuscle": "quads",
    "muscles": [
      "quads",
      "glutes",
      "hamstrings",
      "abs"
    ],
    "equipment": "smith",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 10,
    "restSecs": 120,
    "tip": {
      "en": "Position feet slightly forward of the bar (not directly underneath). This forward foot placement compensates for the fixed bar path and reduces stress on your knees. Squat to parallel or just below. Keep chest tall."
    }
  },
  "dumbbell-lunge": {
    "id": "dumbbell-lunge",
    "name": "Dumbbell Lunge",
    "primaryMuscle": "quads",
    "muscles": [
      "quads",
      "glutes",
      "hamstrings",
      "abs"
    ],
    "equipment": "dumbbell",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 12,
    "restSecs": 90,
    "tip": {
      "en": "Step forward far enough so your front knee stays over your ankle, not past your toes. Lower your back knee toward the floor without touching. Keep your torso upright. Alternate legs or do all reps on one side."
    }
  },
  "calf-raise-machine": {
    "id": "calf-raise-machine",
    "name": "Seated Calf Raise",
    "primaryMuscle": "calves",
    "muscles": [
      "calves"
    ],
    "equipment": "machine",
    "repType": "reps",
    "defaultSets": 4,
    "defaultReps": 20,
    "restSecs": 60,
    "tip": {
      "en": "Place the balls of your feet on the platform edge. Lower heels as far as possible to get a full stretch, then raise up onto your toes as high as you can. Calves respond well to high reps and full range of motion."
    }
  },
  "hip-abductor": {
    "id": "hip-abductor",
    "name": "Hip Abductor Machine",
    "primaryMuscle": "abductors",
    "muscles": [
      "abductors",
      "glutes"
    ],
    "equipment": "machine",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 20,
    "restSecs": 60,
    "tip": {
      "en": "Sit upright and press your knees outward against the pads. Move slowly — this is an isolation move, not a power movement. Squeeze your glutes at the widest point. High reps with moderate weight work well here."
    }
  },
  "glute-kickback-machine": {
    "id": "glute-kickback-machine",
    "name": "Glute Kickback Machine",
    "primaryMuscle": "glutes",
    "muscles": [
      "glutes",
      "hamstrings"
    ],
    "equipment": "machine",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 15,
    "restSecs": 60,
    "tip": {
      "en": "Place your foot against the pad and drive your leg back and slightly up, squeezing the glute at the top. Keep your hips level and avoid rotating your torso. Complete all reps on one leg before switching."
    }
  },
  "plank": {
    "id": "plank",
    "name": "Plank",
    "primaryMuscle": "abs",
    "muscles": [
      "abs",
      "obliques",
      "lower-back"
    ],
    "equipment": "bodyweight",
    "repType": "seconds",
    "defaultSets": 3,
    "defaultReps": 30,
    "restSecs": 60,
    "tip": {
      "en": "Forearms and toes on the floor, body in a straight line from head to heels. Brace your abs hard as if about to take a punch. Don't let your hips sag or pike up. Breathe steadily throughout."
    }
  },
  "ab-crunch-machine": {
    "id": "ab-crunch-machine",
    "name": "Abdominal Machine",
    "primaryMuscle": "abs",
    "muscles": [
      "abs"
    ],
    "equipment": "machine",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 15,
    "restSecs": 60,
    "tip": {
      "en": "Select a weight you can control. Crunch forward by rounding your upper back — don't just bend at the hips. Pause at peak contraction, then slowly return. The abs grow from consistent tension, not throwing the weight."
    }
  },
  "rotary-torso": {
    "id": "rotary-torso",
    "name": "Rotary Torso Machine",
    "primaryMuscle": "obliques",
    "muscles": [
      "obliques",
      "abs"
    ],
    "equipment": "machine",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 15,
    "restSecs": 60,
    "tip": {
      "en": "Rotate through your obliques, not your hips. Keep your lower body still and lead the rotation from your mid-section. Move slowly and deliberately — this is a stability exercise, not a power move. Do both sides."
    }
  },
  "hanging-knee-raise": {
    "id": "hanging-knee-raise",
    "name": "Captain's Chair Knee Raise",
    "primaryMuscle": "abs",
    "muscles": [
      "abs",
      "hip-flexors",
      "obliques"
    ],
    "equipment": "machine",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 15,
    "restSecs": 60,
    "tip": {
      "en": "Use the captain's chair station (vertical knee raise rack) — brace your forearms on the pads and let your legs hang. Draw your knees to your chest by rounding your lower back, not just lifting your legs with hip flexors. Lower slowly and avoid swinging."
    }
  },
  "cable-crunch": {
    "id": "cable-crunch",
    "name": "Cable Crunch",
    "primaryMuscle": "abs",
    "muscles": [
      "abs",
      "obliques"
    ],
    "equipment": "cable",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 15,
    "restSecs": 60,
    "tip": {
      "en": "Kneel in front of a high cable with a rope attachment. Hold the rope beside your head and crunch your elbows toward your knees, rounding your spine. The hips should stay still — the movement comes entirely from the abs."
    }
  },
  "treadmill": {
    "id": "treadmill",
    "name": "Treadmill",
    "primaryMuscle": "cardio",
    "muscles": [
      "cardio",
      "quads",
      "hamstrings",
      "calves",
      "glutes"
    ],
    "equipment": "machine",
    "repType": "seconds",
    "defaultSets": 1,
    "defaultReps": 1200,
    "restSecs": 0,
    "tip": {
      "en": "For fat loss and heart health, aim for Zone 2 (conversational pace — you can speak in short sentences). Keep the incline at 1–2% to simulate outdoor walking. 20–30 min steady state is a solid session."
    }
  },
  "elliptical": {
    "id": "elliptical",
    "name": "Elliptical Trainer",
    "primaryMuscle": "cardio",
    "muscles": [
      "cardio",
      "quads",
      "hamstrings",
      "glutes",
      "abs"
    ],
    "equipment": "machine",
    "repType": "seconds",
    "defaultSets": 1,
    "defaultReps": 1200,
    "restSecs": 0,
    "tip": {
      "en": "Keep a slight forward lean and drive through the heels to engage glutes. Use the arm handles to involve your upper body. Maintain a cadence of 150–165 strides/min for moderate intensity Zone 2 cardio."
    }
  },
  "stationary-bike": {
    "id": "stationary-bike",
    "name": "Stationary Bike",
    "primaryMuscle": "cardio",
    "muscles": [
      "cardio",
      "quads",
      "hamstrings",
      "glutes"
    ],
    "equipment": "machine",
    "repType": "seconds",
    "defaultSets": 1,
    "defaultReps": 1200,
    "restSecs": 0,
    "tip": {
      "en": "Adjust the seat so your knee has a slight bend at the bottom of the pedal stroke (not fully locked). Aim for 80–100 RPM at a resistance where you can maintain a conversation. Great for low-impact cardio."
    }
  },

  // ── Chest ─────────────────────────────────────────────────────────────────
  "barbell-bench-press": {
    "id": "barbell-bench-press",
    "name": "Barbell Bench Press",
    "primaryMuscle": "mid-chest",
    "muscles": ["mid-chest", "triceps", "front-delts"],
    "equipment": "barbell",
    "repType": "reps",
    "defaultSets": 4,
    "defaultReps": 8,
    "restSecs": 120,
    "tip": {
      "en": "Grip slightly wider than shoulder width. Lower the bar to your mid-chest with elbows at ~75°, then drive up powerfully. Keep your shoulder blades pinched back and feet planted. Use a spotter for heavy sets."
    }
  },
  "incline-barbell-press": {
    "id": "incline-barbell-press",
    "name": "Incline Barbell Bench Press",
    "primaryMuscle": "upper-chest",
    "muscles": ["upper-chest", "front-delts", "triceps"],
    "equipment": "barbell",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 8,
    "restSecs": 120,
    "tip": {
      "en": "Set the bench to about 30°. Lower the bar to your upper chest just below the collarbone. The incline shifts the load to the upper pecs. Don't bounce the bar off your chest — control the descent."
    }
  },
  "push-up": {
    "id": "push-up",
    "name": "Push-Up",
    "primaryMuscle": "mid-chest",
    "muscles": ["mid-chest", "triceps", "front-delts", "abs"],
    "equipment": "bodyweight",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 12,
    "restSecs": 60,
    "tip": {
      "en": "Hands slightly wider than your shoulders, body in a straight line. Lower until your chest nearly touches the floor with elbows at ~45°. Brace your core so your hips don't sag. Elevate your feet or add reps to progress."
    }
  },
  "chest-dip": {
    "id": "chest-dip",
    "name": "Chest Dip",
    "primaryMuscle": "mid-chest",
    "muscles": ["mid-chest", "triceps", "front-delts"],
    "equipment": "bodyweight",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 10,
    "restSecs": 90,
    "tip": {
      "en": "Lean your torso forward and let your elbows flare slightly to bias the chest. Lower until you feel a stretch across the chest, then press back up. Use the assisted-dip machine or add a weight belt to adjust difficulty."
    }
  },

  // ── Back ──────────────────────────────────────────────────────────────────
  "barbell-row": {
    "id": "barbell-row",
    "name": "Barbell Bent-Over Row",
    "primaryMuscle": "lats",
    "muscles": ["lats", "rhomboids", "rear-delts", "biceps", "lower-back"],
    "equipment": "barbell",
    "repType": "reps",
    "defaultSets": 4,
    "defaultReps": 10,
    "restSecs": 90,
    "tip": {
      "en": "Hinge at the hips to about 45°, back flat and core braced. Pull the bar to your lower ribcage, driving your elbows back and squeezing your shoulder blades. Lower under control — don't heave with your lower back."
    }
  },
  "pull-up": {
    "id": "pull-up",
    "name": "Pull-Up",
    "primaryMuscle": "lats",
    "muscles": ["lats", "biceps", "rear-delts", "forearms"],
    "equipment": "bodyweight",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 8,
    "restSecs": 120,
    "tip": {
      "en": "Grip just outside shoulder width, palms facing away. Pull your chest toward the bar by driving your elbows down, not just bending your arms. Get your chin over the bar, then lower to a full hang. Use bands or the assisted machine if needed."
    }
  },
  "chest-supported-row": {
    "id": "chest-supported-row",
    "name": "Chest-Supported Row",
    "primaryMuscle": "lats",
    "muscles": ["lats", "rhomboids", "traps", "rear-delts", "biceps"],
    "equipment": "machine",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 12,
    "restSecs": 90,
    "tip": {
      "en": "The chest pad removes momentum and protects your lower back. Row the handles back, squeezing your shoulder blades together at the end. Keep your chest glued to the pad the whole time."
    }
  },
  "straight-arm-pulldown": {
    "id": "straight-arm-pulldown",
    "name": "Straight-Arm Pulldown",
    "primaryMuscle": "lats",
    "muscles": ["lats"],
    "equipment": "cable",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 15,
    "restSecs": 60,
    "tip": {
      "en": "Set a high cable with a straight bar. Keeping your arms nearly straight (soft elbow bend), pull the bar down to your thighs using your lats. A great isolation move to feel the lats before or after heavy rows."
    }
  },
  "deadlift": {
    "id": "deadlift",
    "name": "Deadlift",
    "primaryMuscle": "lower-back",
    "muscles": ["lower-back", "glutes", "hamstrings", "traps", "lats", "forearms"],
    "equipment": "barbell",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 5,
    "restSecs": 150,
    "tip": {
      "en": "Bar over mid-foot, hinge and grip just outside your knees. Brace hard, chest up, and drive through the floor keeping the bar close to your body. Lock out hips and knees together — don't lean back. Reset your setup each rep."
    }
  },
  "barbell-shrug": {
    "id": "barbell-shrug",
    "name": "Barbell Shrug",
    "primaryMuscle": "traps",
    "muscles": ["traps", "forearms"],
    "equipment": "barbell",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 15,
    "restSecs": 60,
    "tip": {
      "en": "Hold the bar at arm's length and shrug your shoulders straight up toward your ears — don't roll them. Pause and squeeze at the top, then lower fully. Lifting straps let you focus on the traps rather than your grip."
    }
  },

  // ── Shoulders ─────────────────────────────────────────────────────────────
  "overhead-press": {
    "id": "overhead-press",
    "name": "Overhead Press",
    "primaryMuscle": "front-delts",
    "muscles": ["front-delts", "side-delts", "triceps"],
    "equipment": "barbell",
    "repType": "reps",
    "defaultSets": 4,
    "defaultReps": 8,
    "restSecs": 120,
    "tip": {
      "en": "Start with the bar at your collarbone, grip just outside your shoulders. Brace your core and glutes and press straight overhead, moving your head slightly back then forward as the bar passes. Avoid leaning back excessively."
    }
  },
  "dumbbell-shoulder-press": {
    "id": "dumbbell-shoulder-press",
    "name": "Dumbbell Shoulder Press",
    "primaryMuscle": "front-delts",
    "muscles": ["front-delts", "side-delts", "triceps"],
    "equipment": "dumbbell",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 10,
    "restSecs": 90,
    "tip": {
      "en": "Press from shoulder height to overhead without clanging the dumbbells together at the top. Keep your wrists stacked over your elbows and avoid arching your lower back. Use a bench with back support for heavier sets."
    }
  },
  "reverse-pec-deck": {
    "id": "reverse-pec-deck",
    "name": "Reverse Pec Deck",
    "primaryMuscle": "rear-delts",
    "muscles": ["rear-delts", "rhomboids", "traps"],
    "equipment": "machine",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 15,
    "restSecs": 60,
    "tip": {
      "en": "Face the pad and move the handles out and back in a wide arc, leading with your elbows. Squeeze your rear delts and upper back at the end. Keep the weight light and the motion smooth — no jerking."
    }
  },

  // ── Arms ──────────────────────────────────────────────────────────────────
  "barbell-curl": {
    "id": "barbell-curl",
    "name": "Barbell Curl",
    "primaryMuscle": "biceps",
    "muscles": ["biceps", "forearms"],
    "equipment": "barbell",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 10,
    "restSecs": 60,
    "tip": {
      "en": "Keep your elbows pinned to your sides and curl the bar up without swinging your torso. Squeeze the biceps at the top, then lower under control. An EZ-bar is easier on the wrists if a straight bar bothers them."
    }
  },
  "incline-dumbbell-curl": {
    "id": "incline-dumbbell-curl",
    "name": "Incline Dumbbell Curl",
    "primaryMuscle": "biceps",
    "muscles": ["biceps", "forearms"],
    "equipment": "dumbbell",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 12,
    "restSecs": 60,
    "tip": {
      "en": "Lie back on a 45–60° incline bench and let your arms hang straight down. This stretched position emphasizes the long head of the biceps. Curl without letting your elbows drift forward."
    }
  },
  "close-grip-bench-press": {
    "id": "close-grip-bench-press",
    "name": "Close-Grip Bench Press",
    "primaryMuscle": "triceps",
    "muscles": ["triceps", "mid-chest", "front-delts"],
    "equipment": "barbell",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 10,
    "restSecs": 90,
    "tip": {
      "en": "Grip the bar about shoulder-width — not so narrow that it strains your wrists. Keep your elbows tucked close to your body and lower to your lower chest. This shifts the load to the triceps while still moving heavy weight."
    }
  },
  "bench-dip": {
    "id": "bench-dip",
    "name": "Bench Dip",
    "primaryMuscle": "triceps",
    "muscles": ["triceps", "front-delts", "mid-chest"],
    "equipment": "bodyweight",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 12,
    "restSecs": 60,
    "tip": {
      "en": "Hands on a bench behind you, legs out in front. Lower by bending your elbows straight back until they reach ~90°, then press up. Keep your back close to the bench. Bend your knees to make it easier, or rest a plate on your lap to progress."
    }
  },
  "wrist-curl": {
    "id": "wrist-curl",
    "name": "Wrist Curl",
    "primaryMuscle": "forearms",
    "muscles": ["forearms"],
    "equipment": "dumbbell",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 15,
    "restSecs": 45,
    "tip": {
      "en": "Rest your forearms on your thighs or a bench with palms up and wrists hanging off the edge. Let the weight roll to your fingertips, then curl it up by flexing your wrists. Keep it slow and controlled — forearms respond to high reps."
    }
  },

  // ── Legs ──────────────────────────────────────────────────────────────────
  "barbell-squat": {
    "id": "barbell-squat",
    "name": "Barbell Back Squat",
    "primaryMuscle": "quads",
    "muscles": ["quads", "glutes", "hamstrings", "lower-back", "abs"],
    "equipment": "barbell",
    "repType": "reps",
    "defaultSets": 4,
    "defaultReps": 8,
    "restSecs": 150,
    "tip": {
      "en": "Bar on your upper traps, feet shoulder-width, toes slightly out. Brace your core, break at the hips and knees together, and descend to at least parallel. Drive up through your mid-foot with your chest tall and knees tracking over your toes."
    }
  },
  "romanian-deadlift": {
    "id": "romanian-deadlift",
    "name": "Romanian Deadlift",
    "primaryMuscle": "hamstrings",
    "muscles": ["hamstrings", "glutes", "lower-back"],
    "equipment": "barbell",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 10,
    "restSecs": 120,
    "tip": {
      "en": "Start standing with the bar at your hips. Push your hips back and lower the bar along your thighs with a soft knee bend, feeling a deep hamstring stretch. Keep your back flat and the bar close, then drive your hips forward to return."
    }
  },
  "barbell-hip-thrust": {
    "id": "barbell-hip-thrust",
    "name": "Barbell Hip Thrust",
    "primaryMuscle": "glutes",
    "muscles": ["glutes", "hamstrings"],
    "equipment": "barbell",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 10,
    "restSecs": 90,
    "tip": {
      "en": "Upper back on a bench, bar across your hips (use a pad). Drive through your heels and thrust your hips up until your torso is parallel to the floor. Squeeze your glutes hard at the top and tuck your chin. Lower under control."
    }
  },
  "goblet-squat": {
    "id": "goblet-squat",
    "name": "Goblet Squat",
    "primaryMuscle": "quads",
    "muscles": ["quads", "glutes", "hamstrings", "abs"],
    "equipment": "dumbbell",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 12,
    "restSecs": 90,
    "tip": {
      "en": "Hold a single dumbbell vertically against your chest. Squat down between your knees, keeping your torso upright and elbows inside your knees. A great way to groove clean squat form before loading a barbell."
    }
  },
  "bulgarian-split-squat": {
    "id": "bulgarian-split-squat",
    "name": "Bulgarian Split Squat",
    "primaryMuscle": "quads",
    "muscles": ["quads", "glutes", "hamstrings"],
    "equipment": "dumbbell",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 10,
    "restSecs": 90,
    "tip": {
      "en": "Rest your back foot on a bench behind you, front foot planted forward. Lower straight down until your front thigh is parallel, keeping most of the weight on your front leg. Excellent for balance and single-leg strength. Finish all reps before switching."
    }
  },
  "lying-leg-curl": {
    "id": "lying-leg-curl",
    "name": "Lying Leg Curl",
    "primaryMuscle": "hamstrings",
    "muscles": ["hamstrings", "calves"],
    "equipment": "machine",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 12,
    "restSecs": 90,
    "tip": {
      "en": "Lie face down with the pad just above your heels. Curl your heels toward your glutes, squeezing the hamstrings at the top. Keep your hips pressed into the bench — don't let them lift as you curl."
    }
  },
  "standing-calf-raise": {
    "id": "standing-calf-raise",
    "name": "Standing Calf Raise",
    "primaryMuscle": "calves",
    "muscles": ["calves"],
    "equipment": "machine",
    "repType": "reps",
    "defaultSets": 4,
    "defaultReps": 15,
    "restSecs": 60,
    "tip": {
      "en": "Shoulders under the pads, balls of your feet on the platform. Drop your heels for a full stretch, then rise onto your toes as high as possible. Keep your legs straight to target the larger calf muscle. Pause at the top of each rep."
    }
  },
  "hip-adductor": {
    "id": "hip-adductor",
    "name": "Hip Adductor Machine",
    "primaryMuscle": "adductors",
    "muscles": ["adductors"],
    "equipment": "machine",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 20,
    "restSecs": 60,
    "tip": {
      "en": "Sit with your legs against the inner pads and squeeze your knees together against the resistance. Move slowly and control the return to a comfortable stretch. High reps with moderate weight work best for the inner thighs."
    }
  },

  // ── Core ──────────────────────────────────────────────────────────────────
  "hanging-leg-raise": {
    "id": "hanging-leg-raise",
    "name": "Hanging Leg Raise",
    "primaryMuscle": "abs",
    "muscles": ["abs", "hip-flexors", "obliques"],
    "equipment": "bodyweight",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 12,
    "restSecs": 60,
    "tip": {
      "en": "Hang from a pull-up bar. Keeping your legs fairly straight, raise them until they're parallel to the floor or higher, curling your pelvis up at the top. Avoid swinging — control both the lift and the descent. Bend your knees to make it easier."
    }
  },
  "russian-twist": {
    "id": "russian-twist",
    "name": "Russian Twist",
    "primaryMuscle": "obliques",
    "muscles": ["obliques", "abs"],
    "equipment": "bodyweight",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 20,
    "restSecs": 45,
    "tip": {
      "en": "Sit with knees bent and lean back slightly to engage your core. Rotate your torso side to side, tapping the floor or a weight beside each hip. Move from your mid-section, not just your arms. Lift your feet to increase difficulty."
    }
  },
  "bicycle-crunch": {
    "id": "bicycle-crunch",
    "name": "Bicycle Crunch",
    "primaryMuscle": "abs",
    "muscles": ["abs", "obliques", "hip-flexors"],
    "equipment": "bodyweight",
    "repType": "reps",
    "defaultSets": 3,
    "defaultReps": 20,
    "restSecs": 45,
    "tip": {
      "en": "Lie on your back, hands lightly behind your head. Bring one knee in while rotating the opposite elbow toward it, then switch in a pedaling motion. Keep it slow and deliberate — quality reps beat speed."
    }
  },
  "side-plank": {
    "id": "side-plank",
    "name": "Side Plank",
    "primaryMuscle": "obliques",
    "muscles": ["obliques", "abs"],
    "equipment": "bodyweight",
    "repType": "seconds",
    "defaultSets": 3,
    "defaultReps": 30,
    "restSecs": 45,
    "tip": {
      "en": "Prop yourself on one forearm with your body in a straight line and hips stacked. Lift your hips so your body forms a rigid line and hold. Don't let your bottom hip sag. Complete the hold on both sides."
    }
  },

  // ── Cardio ────────────────────────────────────────────────────────────────
  "rowing-machine": {
    "id": "rowing-machine",
    "name": "Rowing Machine",
    "primaryMuscle": "cardio",
    "muscles": ["cardio", "lats", "quads", "hamstrings", "biceps"],
    "equipment": "machine",
    "repType": "seconds",
    "defaultSets": 1,
    "defaultReps": 1200,
    "restSecs": 0,
    "tip": {
      "en": "Drive with your legs first, then lean back and pull the handle to your lower ribs — legs, hips, arms in that order. Reverse on the recovery: arms, hips, legs. Aim for a smooth, powerful stroke rather than fast and choppy."
    }
  },
  "stair-climber": {
    "id": "stair-climber",
    "name": "Stair Climber",
    "primaryMuscle": "cardio",
    "muscles": ["cardio", "quads", "glutes", "calves", "hamstrings"],
    "equipment": "machine",
    "repType": "seconds",
    "defaultSets": 1,
    "defaultReps": 1200,
    "restSecs": 0,
    "tip": {
      "en": "Stand tall and avoid leaning your weight onto the handrails — let your legs do the work. Take full steps and drive through your whole foot. A steady 20–30 minutes builds serious lower-body endurance."
    }
  },
  "jump-rope": {
    "id": "jump-rope",
    "name": "Jump Rope",
    "primaryMuscle": "cardio",
    "muscles": ["cardio", "calves", "forearms"],
    "equipment": "bodyweight",
    "repType": "seconds",
    "defaultSets": 3,
    "defaultReps": 60,
    "restSecs": 30,
    "tip": {
      "en": "Jump just high enough to clear the rope (about an inch) and turn it with your wrists, not your arms. Stay on the balls of your feet with a soft knee bend. Start with short intervals and build up as your conditioning improves."
    }
  }
};

/** Name shown for an exercise id, tolerating ids not in the catalogue. */
export function exerciseName(id: string, snapshot?: string): string {
  return EXERCISES[id]?.name ?? snapshot ?? id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** YouTube search for a how-to demo of the exercise. */
export function demoUrl(name: string): string {
  return "https://www.youtube.com/results?search_query=" +
    encodeURIComponent(`${name} exercise planet fitness how to`);
}
