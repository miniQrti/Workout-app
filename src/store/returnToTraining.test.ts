import { describe, expect, it } from "vitest";
import { PLANS } from "../data/plans";
import { toKg } from "../lib/units";
import type { Suggestion } from "./progression";
import { applyReturnAdjustment, returnAdjustment } from "./returnToTraining";
import { makeLog } from "./testUtils";

const plan = PLANS["beginner-3day"]!;
const today = new Date(2026, 8, 24, 12);

function logOn(date: Date) {
  return makeLog(0, [], { startedAt: date.toISOString(), completedAt: date.toISOString() });
}

const increase: Suggestion = {
  action: "increase",
  weightKg: 105,
  lastWeightKg: 100,
  reasonKey: "coach.increase_good",
  e1rmKg: 140,
};

describe("return-to-training adjustment", () => {
  it("does not adjust a gap that fits the plan cadence", () => {
    const recent = new Date(2026, 8, 22, 12);
    expect(returnAdjustment([logOn(recent)], plan, today)).toBeNull();
  });

  it("scales continuously with the length of the break", () => {
    const twoWeeks = returnAdjustment([logOn(new Date(2026, 8, 10, 12))], plan, today)!;
    const sixWeeks = returnAdjustment([logOn(new Date(2026, 7, 13, 12))], plan, today)!;

    expect(twoWeeks.daysAway).toBe(14);
    expect(twoWeeks.reductionPercent).toBe(8);
    expect(sixWeeks.reductionPercent).toBe(28);
    expect(sixWeeks.factor).toBeLessThan(twoWeeks.factor);
  });

  it("caps very long breaks at a 30% reduction", () => {
    const longBreak = returnAdjustment([logOn(new Date(2025, 8, 24, 12))], plan, today)!;
    expect(longBreak.factor).toBe(0.7);
    expect(longBreak.reductionPercent).toBe(30);
  });

  it("uses the latest valid completed workout", () => {
    const old = logOn(new Date(2026, 6, 1, 12));
    const recent = logOn(new Date(2026, 8, 22, 12));
    expect(returnAdjustment([recent, old], plan, today)).toBeNull();
  });

  it("caps and rounds the suggested return weight down in the display unit", () => {
    const adjusted = applyReturnAdjustment(
      { ...increase, weightKg: toKg(210, "lb"), lastWeightKg: toKg(200, "lb") },
      { daysAway: 21, reductionPercent: 13, factor: 0.87 },
      "lb"
    )!;

    expect(adjusted.action).toBe("deload");
    expect(adjusted.weightKg).toBeCloseTo(toKg(172.5, "lb"), 5);
    expect(adjusted.reasonKey).toBe("coach.return_after_break");
    expect(adjusted.reasonVars).toEqual({ days: 21, percent: 13 });
  });

  it("keeps an existing suggestion when it is already more cautious", () => {
    const deload = { ...increase, action: "deload" as const, weightKg: 70 };
    expect(applyReturnAdjustment(
      deload,
      { daysAway: 21, reductionPercent: 13, factor: 0.87 },
      "kg"
    )).toBe(deload);
  });
});
