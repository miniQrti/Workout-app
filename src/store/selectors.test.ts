import { describe, expect, it } from "vitest";
import { buildExerciseIndex, detectNewPRs, epley1RMKg, getPR, lastEntry } from "./selectors";
import { makeLog } from "./testUtils";

describe("selectors", () => {
  it("epley: 1 rep is the weight itself, 12 reps adds 40%", () => {
    expect(epley1RMKg(100, 1)).toBe(100);
    expect(epley1RMKg(100, 12)).toBeCloseTo(140);
  });

  it("indexes sessions per exercise, chronologically", () => {
    const logs = [
      makeLog(10, [{ exId: "leg-press", sets: [[100, 10]] }]),
      makeLog(5, [{ exId: "leg-press", sets: [[110, 10]] }, { exId: "plank", sets: [[null, 45]] }]),
    ];
    const index = buildExerciseIndex(logs);
    expect(index.get("leg-press")).toHaveLength(2);
    expect(index.get("leg-press")![0]!.topWeightKg).toBe(100);
    expect(index.get("leg-press")![1]!.topWeightKg).toBe(110);
    expect(index.get("plank")![0]!.topWeightKg).toBeNull();
  });

  it("PR is heaviest completed set, ties broken by reps", () => {
    const logs = [
      makeLog(10, [{ exId: "leg-press", sets: [[100, 10], [100, 12]] }]),
      makeLog(5, [{ exId: "leg-press", sets: [[110, 8, false]] }]), // not completed → ignored
    ];
    const index = buildExerciseIndex(logs);
    const pr = getPR(index, "leg-press");
    expect(pr?.weightKg).toBe(100);
    expect(pr?.reps).toBe(12);
  });

  it("lastEntry returns the most recent session", () => {
    const logs = [
      makeLog(10, [{ exId: "leg-press", sets: [[100, 10]] }]),
      makeLog(2, [{ exId: "leg-press", sets: [[120, 10]] }]),
    ];
    const index = buildExerciseIndex(logs);
    expect(lastEntry(index, "leg-press")?.topWeightKg).toBe(120);
    expect(lastEntry(index, "unknown")).toBeNull();
  });

  it("detects new PRs against the pre-log index", () => {
    const history = [makeLog(10, [{ exId: "leg-press", sets: [[100, 10]] }])];
    const index = buildExerciseIndex(history);
    const newLog = makeLog(0, [
      { exId: "leg-press", sets: [[105, 10]] },
      { exId: "plank", sets: [[null, 60]] }, // bodyweight → no weight PR
    ]);
    const prs = detectNewPRs(index, newLog);
    expect(prs).toEqual([{ exerciseId: "leg-press", weightKg: 105, reps: 10 }]);
  });
});
