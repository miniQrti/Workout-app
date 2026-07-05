import { describe, expect, it } from "vitest";
import type { CycleSettings } from "../types";
import type { Suggestion } from "./progression";
import { dayKey } from "../lib/dates";
import {
  applyCycleTone, currentTone, cycleInfo, defaultCycleSettings, effectiveCycleLength,
  isPeriodDay, normalizeCycleSettings, phaseForDate, phaseOfDay, toneOfDay,
  withLastPeriodStart, withPeriodStart,
} from "./cycle";

// A period start N days before `today`.
function startNDaysAgo(n: number, today = new Date()): string {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return dayKey(d);
}

function cyc(partial: Partial<CycleSettings> = {}): CycleSettings {
  return { ...defaultCycleSettings(), enabled: true, ...partial };
}

describe("phaseOfDay (L=28, P=5)", () => {
  const P = (d: number) => phaseOfDay(d, 28, 5);
  it("maps the canonical 28-day cycle", () => {
    expect(P(1)).toBe("menstrual");   // start day
    expect(P(5)).toBe("menstrual");
    expect(P(6)).toBe("follicular");
    expect(P(12)).toBe("follicular");
    expect(P(13)).toBe("ovulation");  // ovu = 28-14 = 14; window 13..15
    expect(P(15)).toBe("ovulation");
    expect(P(16)).toBe("luteal");
    expect(P(28)).toBe("luteal");
    expect(P(35)).toBe("luteal");     // overdue stays luteal
  });
  it("handles a collapsed short-cycle / long-period combo without crashing", () => {
    // L=21, P=10 → ovu=7; menstrual precedence covers the overlap
    for (let d = 1; d <= 21; d++) {
      expect(["menstrual", "follicular", "ovulation", "luteal"]).toContain(phaseOfDay(d, 21, 10));
    }
    expect(phaseOfDay(1, 21, 10)).toBe("menstrual");
    expect(phaseOfDay(10, 21, 10)).toBe("menstrual");
  });
});

describe("toneOfDay (L=28, P=5)", () => {
  const T = (d: number) => toneOfDay(d, 28, 5);
  it("low during period, high near ovulation, low late luteal + overdue", () => {
    expect(T(1)).toBe("low");
    expect(T(5)).toBe("low");
    expect(T(8)).toBe("neutral");
    expect(T(10)).toBe("high");  // ovu-4
    expect(T(15)).toBe("high");  // ovu+1
    expect(T(20)).toBe("neutral");
    expect(T(26)).toBe("low");   // last 3 luteal days (26..28)
    expect(T(28)).toBe("low");
    expect(T(31)).toBe("low");   // overdue
  });
  it("low wins over high on overlap in a very short cycle", () => {
    // L=21 → ovu=7, high window 3..8; but days 1..P are menstrual→low
    expect(toneOfDay(4, 21, 5)).toBe("low");
  });
});

describe("effectiveCycleLength", () => {
  it("falls back to configured length with <2 starts", () => {
    expect(effectiveCycleLength(cyc({ cycleLength: 30, periodStarts: [] }))).toBe(30);
    expect(effectiveCycleLength(cyc({ cycleLength: 30, periodStarts: [startNDaysAgo(3)] }))).toBe(30);
  });
  it("learns the mean of the last <=3 plausible intervals", () => {
    // starts 90/60/30 days ago → intervals 30, 30 → 30
    const c = cyc({ cycleLength: 28, periodStarts: [startNDaysAgo(90), startNDaysAgo(60), startNDaysAgo(30)] });
    expect(effectiveCycleLength(c)).toBe(30);
  });
  it("discards implausible gaps (missed logging)", () => {
    // 100-day gap then a 27-day gap → only 27 is plausible
    const c = cyc({ cycleLength: 28, periodStarts: [startNDaysAgo(127), startNDaysAgo(27), startNDaysAgo(0)] });
    expect(effectiveCycleLength(c)).toBe(27);
  });
  it("clamps to 21..40", () => {
    expect(effectiveCycleLength(cyc({ cycleLength: 99 }))).toBe(40);
    expect(effectiveCycleLength(cyc({ cycleLength: 5 }))).toBe(21);
  });
});

describe("cycleInfo", () => {
  it("returns null when disabled or no starts", () => {
    expect(cycleInfo(cyc({ enabled: false, periodStarts: [startNDaysAgo(2)] }))).toBeNull();
    expect(cycleInfo(cyc({ periodStarts: [] }))).toBeNull();
  });
  it("computes day 1 on the start day", () => {
    const info = cycleInfo(cyc({ periodStarts: [startNDaysAgo(0)] }))!;
    expect(info.day).toBe(1);
    expect(info.phase).toBe("menstrual");
    expect(info.tone).toBe("low");
  });
  it("counts overdue days past the cycle length", () => {
    const info = cycleInfo(cyc({ cycleLength: 28, periodStarts: [startNDaysAgo(31)] }))!;
    expect(info.day).toBe(32);
    expect(info.daysUntilNext).toBe(-3); // 28 - 31
    expect(info.phase).toBe("luteal");
    expect(info.tone).toBe("low");
  });
  it("mid-follicular is neutral tone", () => {
    expect(cycleInfo(cyc({ periodStarts: [startNDaysAgo(7)] }))!.tone).toBe("neutral");
  });
});

describe("phaseForDate (future forecast)", () => {
  it("wraps by effective length", () => {
    const c = cyc({ cycleLength: 28, periodStarts: [startNDaysAgo(0)] });
    const in28 = new Date(); in28.setDate(in28.getDate() + 28);
    expect(phaseForDate(c, in28)).toBe("menstrual"); // one full cycle ahead
  });
});

describe("isPeriodDay", () => {
  it("marks the current period window", () => {
    const c = cyc({ periodLength: 5, periodStarts: [startNDaysAgo(1)] });
    const today = new Date();
    expect(isPeriodDay(c, today)).toBe(true);           // day 2 of period
    const day6 = new Date(); day6.setDate(day6.getDate() + 4);
    expect(isPeriodDay(c, day6)).toBe(false);           // past periodLength
  });
  it("predicts the next period window", () => {
    const c = cyc({ cycleLength: 28, periodLength: 5, periodStarts: [startNDaysAgo(0)] });
    const next = new Date(); next.setDate(next.getDate() + 28);
    expect(isPeriodDay(c, next)).toBe(true);
  });
  it("suppresses predictions when >7 days overdue", () => {
    const c = cyc({ cycleLength: 28, periodStarts: [startNDaysAgo(40)] });
    const soon = new Date(); soon.setDate(soon.getDate() + 16); // a would-be next window
    expect(isPeriodDay(c, soon)).toBe(false);
  });
});

describe("currentTone (coach entry point)", () => {
  it("neutral unless enabled + adaptive + established", () => {
    expect(currentTone(undefined)).toBe("neutral");
    expect(currentTone(cyc({ adaptiveCoaching: false, periodStarts: [startNDaysAgo(0)] }))).toBe("neutral");
    expect(currentTone(cyc({ periodStarts: [] }))).toBe("neutral");
    expect(currentTone(cyc({ periodStarts: [startNDaysAgo(0)] }))).toBe("low");
  });
});

describe("applyCycleTone", () => {
  const inc: Suggestion = {
    action: "increase", weightKg: 105, lastWeightKg: 100,
    reasonKey: "coach.increase_good", e1rmKg: 140,
  };
  it("low downgrades increase → hold at the LAST weight", () => {
    const out = applyCycleTone(inc, "low")!;
    expect(out.action).toBe("hold");
    expect(out.weightKg).toBe(100); // not 105
    expect(out.reasonKey).toBe("coach.cycle_hold");
    expect(out.reasonVars).toBeUndefined();
  });
  it("leaves deload / decrease / gate-holds untouched", () => {
    const deload: Suggestion = { action: "deload", weightKg: 85, lastWeightKg: 100, reasonKey: "coach.deload", e1rmKg: null };
    expect(applyCycleTone(deload, "low")).toBe(deload);
    const hold: Suggestion = { action: "hold", weightKg: 100, lastWeightKg: 100, reasonKey: "coach.hold_reps", e1rmKg: null };
    expect(applyCycleTone(hold, "low")).toBe(hold);
  });
  it("high and neutral pass through; null → null", () => {
    expect(applyCycleTone(inc, "high")).toBe(inc);
    expect(applyCycleTone(inc, "neutral")).toBe(inc);
    expect(applyCycleTone(null, "low")).toBeNull();
  });
});

describe("normalizeCycleSettings", () => {
  it("clamps lengths and drops invalid/future dates, sorts + dedupes", () => {
    const future = startNDaysAgo(-5); // 5 days in the future
    const out = normalizeCycleSettings({
      enabled: true, adaptiveCoaching: false, forecast: false,
      cycleLength: 999, periodLength: 0,
      periodStarts: ["2026-01-10", "2026-01-01", "2026-01-10", "garbage", future],
    });
    expect(out.cycleLength).toBe(40);
    expect(out.periodLength).toBe(1);
    expect(out.adaptiveCoaching).toBe(false);
    expect(out.forecast).toBe(false);
    expect(out.periodStarts).toEqual(["2026-01-01", "2026-01-10"]); // deduped, sorted, no garbage/future
  });
  it("returns defaults for non-objects", () => {
    expect(normalizeCycleSettings(null)).toEqual(defaultCycleSettings());
    expect(normalizeCycleSettings("x")).toEqual(defaultCycleSettings());
  });
});

describe("withPeriodStart / withLastPeriodStart", () => {
  it("appends deduped + sorted", () => {
    const c = cyc({ periodStarts: ["2026-01-01"] });
    const today = new Date(2026, 0, 29);
    const out = withPeriodStart(c, today);
    expect(out.periodStarts).toEqual(["2026-01-01", "2026-01-29"]);
    // double-tap same day is a no-op
    expect(withPeriodStart(out, today).periodStarts).toEqual(out.periodStarts);
  });
  it("replaces the most recent start", () => {
    const c = cyc({ periodStarts: ["2026-01-01", "2026-01-29"] });
    expect(withLastPeriodStart(c, "2026-01-30").periodStarts).toEqual(["2026-01-01", "2026-01-30"]);
  });
});
