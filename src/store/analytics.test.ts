import { describe, expect, it } from "vitest";
import { consistencyStats, muscleGroupSets, sessionTonnageKg, thisWeekWorkouts, trainingCalendar, weeklySeries } from "./analytics";
import { makeLog } from "./testUtils";

describe("analytics", () => {
  it("tonnage counts only completed weighted sets", () => {
    const log = makeLog(0, [
      { exId: "leg-press", sets: [[100, 10], [100, 10, false], [null, 30]] },
    ]);
    expect(sessionTonnageKg(log)).toBe(1000);
  });

  it("weekly series buckets by calendar week", () => {
    const logs = [
      makeLog(0, [{ exId: "leg-press", sets: [[100, 10]] }]),
      makeLog(20, [{ exId: "leg-press", sets: [[90, 10]] }]),
    ];
    const weeks = weeklySeries(logs, 8);
    expect(weeks).toHaveLength(8);
    expect(weeks[weeks.length - 1]!.sessions).toBe(1);
    expect(weeks[weeks.length - 1]!.tonnageKg).toBe(1000);
    expect(weeks.reduce((a, w) => a + w.sessions, 0)).toBe(2);
  });

  it("muscle sets: primary full credit, secondary groups half", () => {
    // chest-press-machine: primary mid-chest (chest), secondaries triceps (arms) + front-delts (shoulders)
    const logs = [makeLog(0, [{ exId: "chest-press-machine", sets: [[40, 12], [40, 12], [40, 12]] }])];
    const sets = muscleGroupSets(logs);
    expect(sets.chest).toBe(3);
    expect(sets.arms).toBe(1.5);
    expect(sets.shoulders).toBe(1.5);
  });

  it("calendar has full weeks and marks trained days", () => {
    const logs = [makeLog(1, [{ exId: "leg-press", sets: [[100, 10]] }])];
    const cal = trainingCalendar(logs, 12);
    expect(cal).toHaveLength(12);
    expect(cal.every((w) => w.length === 7)).toBe(true);
    expect(cal.flat().filter((d) => d.sets > 0)).toHaveLength(1);
  });

  it("consistency: week streak spans consecutive weeks", () => {
    const logs = [
      makeLog(0, [{ exId: "leg-press", sets: [[100, 10]] }]),
      makeLog(7, [{ exId: "leg-press", sets: [[100, 10]] }]),
      makeLog(14, [{ exId: "leg-press", sets: [[100, 10]] }]),
      makeLog(35, [{ exId: "leg-press", sets: [[100, 10]] }]), // gap → excluded
    ];
    const stats = consistencyStats(logs);
    expect(stats.weekStreak).toBe(3);
    expect(stats.totalWorkouts).toBe(4);
    expect(stats.bestWeek).toBe(1);
  });

  it("this week's workouts", () => {
    const logs = [makeLog(0, [{ exId: "leg-press", sets: [[100, 10]] }])];
    expect(thisWeekWorkouts(logs)).toBe(1);
  });
});
