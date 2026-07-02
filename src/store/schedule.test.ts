import { describe, expect, it } from "vitest";
import { slotForDate, trainedOn, weekOverview } from "./schedule";
import { PLANS } from "../data/plans";
import { makeLog } from "./testUtils";

const starter = PLANS["beginner-3day"]!; // rotation: W r W C W r r (Mon..Sun)

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
