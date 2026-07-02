import { describe, expect, it } from "vitest";
import { suggestProgression } from "./progression";
import { buildExerciseIndex } from "./selectors";
import { makeLog } from "./testUtils";
import { EXERCISES } from "../data/exercises";
import { toKg } from "../lib/units";

const legPress = EXERCISES["leg-press"]!;
const chestPress = EXERCISES["chest-press-machine"]!;

describe("progression", () => {
  it("returns null with no history", () => {
    const index = buildExerciseIndex([]);
    expect(suggestProgression(index, legPress, 12, "lb")).toBeNull();
  });

  it("deloads to 85% after two tough sessions", () => {
    const logs = [
      makeLog(10, [{ exId: "leg-press", feel: "tough", sets: [[toKg(200, "lb"), 12]] }]),
      makeLog(5, [{ exId: "leg-press", feel: "tough", sets: [[toKg(200, "lb"), 12]] }]),
    ];
    const s = suggestProgression(buildExerciseIndex(logs), legPress, 12, "lb")!;
    expect(s.action).toBe("deload");
    // 200 lb * 0.85 = 170 lb, snapped to 2.5 lb steps
    expect(s.weightKg).toBeCloseTo(toKg(170, "lb"), 5);
  });

  it("holds when sets were left incomplete", () => {
    const logs = [makeLog(3, [{ exId: "leg-press", feel: "good", sets: [[100, 12], [100, 12, false]] }])];
    const s = suggestProgression(buildExerciseIndex(logs), legPress, 12, "kg")!;
    expect(s.action).toBe("hold");
    expect(s.reasonKey).toBe("coach.hold_incomplete");
  });

  it("holds until target reps hit on every set", () => {
    const logs = [makeLog(3, [{ exId: "leg-press", feel: "good", sets: [[100, 12], [100, 9]] }])];
    const s = suggestProgression(buildExerciseIndex(logs), legPress, 12, "kg")!;
    expect(s.action).toBe("hold");
    expect(s.reasonKey).toBe("coach.hold_reps");
    expect(s.reasonVars).toEqual({ reps: 12 });
  });

  it("holds when weight dropped mid-session", () => {
    const logs = [makeLog(3, [{ exId: "leg-press", feel: "good", sets: [[100, 12], [90, 12]] }])];
    const s = suggestProgression(buildExerciseIndex(logs), legPress, 12, "kg")!;
    expect(s.action).toBe("hold");
    expect(s.reasonKey).toBe("coach.hold_fatigue");
  });

  it("adds the unit-native legs jump on a good session (lb user)", () => {
    const logs = [makeLog(3, [{ exId: "leg-press", feel: "good", sets: [[toKg(200, "lb"), 12]] }])];
    const s = suggestProgression(buildExerciseIndex(logs), legPress, 12, "lb")!;
    expect(s.action).toBe("increase");
    expect(s.weightKg).toBeCloseTo(toKg(210, "lb"), 5); // legs good = +10 lb
  });

  it("adds the kg-native jump for a kg user", () => {
    const logs = [makeLog(3, [{ exId: "leg-press", feel: "good", sets: [[100, 12]] }])];
    const s = suggestProgression(buildExerciseIndex(logs), legPress, 12, "kg")!;
    expect(s.weightKg).toBe(105); // legs good = +5 kg
  });

  it("bigger jump when easy, small chest jump when good", () => {
    const easyLogs = [makeLog(3, [{ exId: "chest-press-machine", feel: "easy", sets: [[toKg(90, "lb"), 12]] }])];
    const sEasy = suggestProgression(buildExerciseIndex(easyLogs), chestPress, 12, "lb")!;
    expect(sEasy.weightKg).toBeCloseTo(toKg(100, "lb"), 5); // chest easy = +10 lb

    const goodLogs = [makeLog(3, [{ exId: "chest-press-machine", feel: "good", sets: [[toKg(90, "lb"), 12]] }])];
    const sGood = suggestProgression(buildExerciseIndex(goodLogs), chestPress, 12, "lb")!;
    expect(sGood.weightKg).toBeCloseTo(toKg(95, "lb"), 5); // chest good = +5 lb
  });

  it("backs off after one tough session", () => {
    const logs = [
      makeLog(8, [{ exId: "leg-press", feel: "good", sets: [[100, 12]] }]),
      makeLog(3, [{ exId: "leg-press", feel: "tough", sets: [[100, 12]] }]),
    ];
    const s = suggestProgression(buildExerciseIndex(logs), legPress, 12, "kg")!;
    expect(s.action).toBe("decrease");
    expect(s.weightKg).toBe(95);
  });

  it("caps the jump for capped exercises", () => {
    const legExt = EXERCISES["leg-extension-machine"]!;
    const logs = [makeLog(3, [{ exId: "leg-extension-machine", feel: "easy", sets: [[toKg(80, "lb"), 12]] }])];
    const s = suggestProgression(buildExerciseIndex(logs), legExt, 12, "lb")!;
    // legs easy would be +20 lb, but the override caps at 5 lb
    expect(s.weightKg).toBeCloseTo(toKg(85, "lb"), 5);
  });
});
