import { describe, expect, it } from "vitest";
import { defaultSettings } from "./appState";
import { nextDayIndexAfter } from "./session";
import { makeLog } from "./testUtils";

describe("nextDayIndexAfter", () => {
  it("advances the plan stored on the workout rather than the active plan", () => {
    const settings = { ...defaultSettings(), activePlanId: "beginner-3day", nextDayIdx: 0 };
    const log = makeLog(0, [], {
      planId: "upper-lower-4day",
      dayId: "upper-body",
    });

    expect(nextDayIndexAfter(log, settings)).toBe(1);
  });

  it("falls back safely when a historical plan no longer exists", () => {
    const log = makeLog(0, [], { planId: "deleted-plan", dayId: "deleted-day" });
    expect(nextDayIndexAfter(log, defaultSettings())).toBe(0);
  });

  it("keeps an unfinished day queued when the user chooses to repeat it", () => {
    const settings = { ...defaultSettings(), activePlanId: "beginner-3day", nextDayIdx: 0 };
    const log = makeLog(0, [], {
      planId: "upper-lower-4day", dayId: "upper-body", repeatDay: true, completedEarly: true,
    });
    expect(nextDayIndexAfter(log, settings)).toBe(0);
    expect(nextDayIndexAfter({ ...log, repeatDay: false }, settings)).toBe(1);
  });
});
