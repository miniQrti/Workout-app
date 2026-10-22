import { describe, expect, it } from "vitest";
import type { PlanDay } from "../types";
import { defaultSettings } from "./appState";
import { makeLog } from "./testUtils";
import { preferredExercisesForDay } from "./exercisePreferences";

const day: PlanDay = {
  id: "full-body",
  name: { en: "Full Body" },
  warmup: [],
  exercises: [
    { exerciseId: "smith-machine-squat", sets: 3, reps: 10, restSecs: 90 },
    { exerciseId: "leg-press", sets: 3, reps: 10, restSecs: 90 },
  ],
};

const settings = defaultSettings();
const performed = (id: string, done = true) => ({ exId: id, sets: [[50, 10, done] as [number, number, boolean]] });

describe("preferredExercisesForDay", () => {
  it("starts from the plan with no history", () => {
    expect(preferredExercisesForDay("beginner-3day", day, [], settings))
      .toEqual(["smith-machine-squat", "leg-press"]);
  });

  it("uses the last performed replacement for this plan and day", () => {
    const logs = [makeLog(7, [performed("smith-machine-squat"), performed("leg-press")]),
      makeLog(1, [performed("leg-press"), performed("leg-press")])];
    expect(preferredExercisesForDay("beginner-3day", day, logs, settings))
      .toEqual(["leg-press", "leg-press"]);
    expect(preferredExercisesForDay("another-plan", day, logs, settings))
      .toEqual(["smith-machine-squat", "leg-press"]);
  });

  it("ignores unperformed slots in early finishes and other days", () => {
    const logs = [makeLog(7, [performed("leg-press"), performed("leg-press")]),
      makeLog(1, [performed("smith-machine-squat", false), performed("leg-press")], { completedEarly: true }),
      makeLog(0, [performed("smith-machine-squat"), performed("leg-press")], { dayId: "other-day" })];
    expect(preferredExercisesForDay("beginner-3day", day, logs, settings)[0]).toBe("leg-press");
  });

  it("falls back if a custom replacement no longer exists", () => {
    const logs = [makeLog(1, [performed("removed-custom-exercise"), performed("leg-press")])];
    expect(preferredExercisesForDay("beginner-3day", day, logs, settings)[0]).toBe("smith-machine-squat");
  });
});
