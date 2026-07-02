import type { LocalizedText, MuscleGroupId } from "../types";

export interface MuscleInfo {
  label: LocalizedText;
  group: MuscleGroupId;
}

export const MUSCLES: Record<string, MuscleInfo> = {
  "upper-chest": {
    "label": {
      "en": "Upper Chest",
      "de": "Obere Brust"
    },
    "group": "chest"
  },
  "mid-chest": {
    "label": {
      "en": "Chest",
      "de": "Brust"
    },
    "group": "chest"
  },
  "lats": {
    "label": {
      "en": "Lats",
      "de": "Lat"
    },
    "group": "back"
  },
  "rhomboids": {
    "label": {
      "en": "Rhomboids",
      "de": "Rhomboiden"
    },
    "group": "back"
  },
  "traps": {
    "label": {
      "en": "Traps",
      "de": "Trapez"
    },
    "group": "back"
  },
  "lower-back": {
    "label": {
      "en": "Lower Back",
      "de": "Unterer Rücken"
    },
    "group": "back"
  },
  "rear-delts": {
    "label": {
      "en": "Rear Delts",
      "de": "Hintere Schulter"
    },
    "group": "back"
  },
  "front-delts": {
    "label": {
      "en": "Front Delts",
      "de": "Vordere Schulter"
    },
    "group": "shoulders"
  },
  "side-delts": {
    "label": {
      "en": "Side Delts",
      "de": "Seitliche Schulter"
    },
    "group": "shoulders"
  },
  "biceps": {
    "label": {
      "en": "Biceps",
      "de": "Bizeps"
    },
    "group": "arms"
  },
  "brachialis": {
    "label": {
      "en": "Brachialis",
      "de": "Brachialis"
    },
    "group": "arms"
  },
  "triceps": {
    "label": {
      "en": "Triceps",
      "de": "Trizeps"
    },
    "group": "arms"
  },
  "forearms": {
    "label": {
      "en": "Forearms",
      "de": "Unterarme"
    },
    "group": "arms"
  },
  "quads": {
    "label": {
      "en": "Quads",
      "de": "Quadrizeps"
    },
    "group": "legs"
  },
  "hamstrings": {
    "label": {
      "en": "Hamstrings",
      "de": "Beinbizeps"
    },
    "group": "legs"
  },
  "glutes": {
    "label": {
      "en": "Glutes",
      "de": "Gesäß"
    },
    "group": "legs"
  },
  "calves": {
    "label": {
      "en": "Calves",
      "de": "Waden"
    },
    "group": "legs"
  },
  "abductors": {
    "label": {
      "en": "Hip Abductors",
      "de": "Abduktoren"
    },
    "group": "legs"
  },
  "adductors": {
    "label": {
      "en": "Hip Adductors",
      "de": "Adduktoren"
    },
    "group": "legs"
  },
  "abs": {
    "label": {
      "en": "Abs",
      "de": "Bauch"
    },
    "group": "core"
  },
  "obliques": {
    "label": {
      "en": "Obliques",
      "de": "Schräge Bauchmuskeln"
    },
    "group": "core"
  },
  "hip-flexors": {
    "label": {
      "en": "Hip Flexors",
      "de": "Hüftbeuger"
    },
    "group": "core"
  },
  "cardio": {
    "label": {
      "en": "Cardio",
      "de": "Cardio"
    },
    "group": "cardio"
  }
};

export const MUSCLE_GROUPS: MuscleGroupId[] = ["chest", "back", "shoulders", "arms", "legs", "core", "cardio"];

/** Broad group for a specific muscle id; unknown ids fall through unchanged. */
export function muscleGroupOf(muscleId: string): MuscleGroupId {
  return MUSCLES[muscleId]?.group ?? (muscleId as MuscleGroupId);
}
