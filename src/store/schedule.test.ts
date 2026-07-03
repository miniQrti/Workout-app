import { describe, expect, it } from "vitest";
import {
  consecutiveTrainedDays, maxConsecutiveWorkouts, needsRecovery,
  slotForDate, trainedOn, weekOverview,
} from "./schedule";
import { PLANS } from "../data/plans";
import { makeLog } from "./testUtils";

const starter = PLANS["beginner-3day"]!; // rotation: W r W C W r r (Mon..Sun)
const fatloss = PLANS["fatloss-circuit-4day"]!; // W W r W W C r

describe("schedule", () => {
  it("anchors rotation slot 0 to Monday", () => {
    const mon = new Date(2026, 5, 29); // Mon Jun 29 2026
    expect(slotForDate(starter, mon)).toEqual({ type: "workout", dayId: "full-body" });
  });

  it("maps the whole week correctly", () => {
    const types = Array.from({ length: 7 }, (_, i) =>
      slotForDate(starter, new Date(2026, 5, 29 + i))?.type
    );
    expect(types).toEqual(["workout", "rest", "workout", "cardio", "workout", "rest", "rest"]);
  });

  it("returns null for undefined plans", () => {
    expect(slotForDate(undefined, new Date())).toBeNull();
  });

  it("detects training on a local day", () => {
    const logs = [makeLog(0, [{ exId: "leg-press", sets: [[100, 10]] }])];
    expect(trainedOn(logs, new Date())).toBe(true);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(trainedOn(logs, yesterday)).toBe(false);
  });

  it("knows each plan's max back-to-back training days", () => {
    expect(maxConsecutiveWorkouts(starter)).toBe(1); // W r W C W r r
    expect(maxConsecutiveWorkouts(fatloss)).toBe(2); // W W r W W C r
    expect(maxConsecutiveWorkouts(PLANS["total-body-burn-5day"])).toBe(3); // W W W r W W r
    expect(maxConsecutiveWorkouts(undefined)).toBe(0);
  });

  it("counts consecutive trained days backwards", () => {
    const logs = [1, 2, 3].map((d) => makeLog(d, [{ exId: "leg-press", sets: [[100, 10]] }]));
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(consecutiveTrainedDays(logs, yesterday)).toBe(3);
    expect(consecutiveTrainedDays([], yesterday)).toBe(0);
  });

  it("recommends recovery once the streak reaches the plan's max run", () => {
    // trained yesterday and the day before → streak 2 ≥ fat-loss max 2
    const logs = [1, 2].map((d) => makeLog(d, [{ exId: "leg-press", sets: [[100, 10]] }]));
    expect(needsRecovery(fatloss, logs)).toBe(2);
    // only yesterday → streak 1 < 2 → no override
    expect(needsRecovery(fatloss, [makeLog(1, [{ exId: "leg-press", sets: [[100, 10]] }])])).toBe(0);
    // rest day two days ago breaks the streak
    const broken = [1, 3].map((d) => makeLog(d, [{ exId: "leg-press", sets: [[100, 10]] }]));
    expect(needsRecovery(fatloss, broken)).toBe(0);
  });

  it("weekOverview returns Mon–Sun with today flagged and training marked", () => {
    const logs = [makeLog(0, [{ exId: "leg-press", sets: [[100, 10]] }])];
    const week = weekOverview(starter, logs);
    expect(week).toHaveLength(7);
    expect(week[0]!.date.getDay()).toBe(1); // Monday
    expect(week.filter((d) => d.isToday)).toHaveLength(1);
    expect(week.find((d) => d.isToday)!.trained).toBe(true);
    expect(week.filter((d) => d.trained)).toHaveLength(1);
  });
});
