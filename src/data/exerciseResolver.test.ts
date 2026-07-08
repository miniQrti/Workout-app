import { describe, expect, it } from "vitest";
import type { Exercise, Settings } from "../types";
import { EXERCISES } from "./exercises";
import {
  allExercises, getExercise, isCustomExercise, resolveExerciseName, validateExercise,
} from "./exerciseResolver";

// A minimal, valid custom exercise — the shape the form produces.
function customExercise(): Exercise {
  return {
    id: "custom-xyz",
    name: "Cable Woodchopper",
    primaryMuscle: "obliques",
    muscles: ["obliques", "abs"],
    equipment: "cable",
    repType: "reps",
    defaultSets: 3,
    defaultReps: 12,
    restSecs: 60,
    tip: { en: "Rotate from the torso, keep arms straight." },
  };
}

function settingsWith(customExercises: Exercise[] = []): Settings {
  return {
    unit: "kg", theme: "system", accent: "green", lang: "en",
    activePlanId: "beginner-3day", nextDayIdx: 0, machineNotes: {},
    customExercises,
  };
}

describe("exerciseResolver.getExercise", () => {
  it("resolves a built-in exercise", () => {
    expect(getExercise("chest-press-machine", settingsWith())?.id).toBe("chest-press-machine");
  });

  it("resolves a custom exercise", () => {
    const s = settingsWith([customExercise()]);
    expect(getExercise("custom-xyz", s)?.name).toBe("Cable Woodchopper");
  });

  it("prefers the built-in on an id clash", () => {
    const shadow = { ...customExercise(), id: "chest-press-machine", name: "Shadow" };
    expect(getExercise("chest-press-machine", settingsWith([shadow]))?.name)
      .toBe(EXERCISES["chest-press-machine"]!.name);
  });

  it("returns undefined for an unknown id", () => {
    expect(getExercise("nope", settingsWith())).toBeUndefined();
  });
});

describe("exerciseResolver.allExercises / isCustomExercise", () => {
  it("lists built-ins plus custom exercises", () => {
    const s = settingsWith([customExercise()]);
    const all = allExercises(s);
    expect(all.length).toBe(Object.keys(EXERCISES).length + 1);
    expect(all.some((e) => e.id === "custom-xyz")).toBe(true);
  });

  it("handles absent customExercises", () => {
    const s = settingsWith();
    delete (s as Partial<Settings>).customExercises;
    expect(allExercises(s).length).toBe(Object.keys(EXERCISES).length);
  });

  it("flags only custom ids", () => {
    const s = settingsWith([customExercise()]);
    expect(isCustomExercise("custom-xyz", s)).toBe(true);
    expect(isCustomExercise("chest-press-machine", s)).toBe(false);
  });
});

describe("exerciseResolver.resolveExerciseName", () => {
  it("uses the custom exercise's name", () => {
    const s = settingsWith([customExercise()]);
    expect(resolveExerciseName("custom-xyz", s)).toBe("Cable Woodchopper");
  });

  it("falls back to the snapshot for a deleted custom id", () => {
    expect(resolveExerciseName("custom-xyz", settingsWith(), "Cable Woodchopper"))
      .toBe("Cable Woodchopper");
  });

  it("title-cases an unknown id with no snapshot", () => {
    expect(resolveExerciseName("cable-woodchopper", settingsWith())).toBe("Cable Woodchopper");
  });
});

describe("exerciseResolver.validateExercise", () => {
  it("accepts a valid custom exercise", () => {
    expect(validateExercise(customExercise())).toEqual([]);
  });

  it("rejects an empty name", () => {
    expect(validateExercise({ ...customExercise(), name: "  " })).toContain("customex.err.name");
  });

  it("rejects a missing primary muscle", () => {
    expect(validateExercise({ ...customExercise(), primaryMuscle: "" })).toContain("customex.err.muscle");
  });

  it("rejects zero sets or reps", () => {
    expect(validateExercise({ ...customExercise(), defaultSets: 0 })).toContain("customex.err.sets");
    expect(validateExercise({ ...customExercise(), defaultReps: 0 })).toContain("customex.err.reps");
  });
});
