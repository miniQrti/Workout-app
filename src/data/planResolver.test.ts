import { describe, expect, it } from "vitest";
import type { Plan, Settings } from "../types";
import { PLANS } from "./plans";
import { allPlans, getPlan, isCustomPlan, normalizePlan, removeDayFromPlan, validatePlan } from "./planResolver";
import { slotForDate, maxConsecutiveWorkouts } from "../store/schedule";

// A minimal, valid custom plan built from catalogue exercises — the shape the
// builder produces. Two workout days, a Mon/Wed/Fri week.
function customPlan(): Plan {
  return {
    id: "custom-abc",
    name: "My Split",
    tagline: { en: "" },
    difficulty: "intermediate",
    daysPerWeek: 3,
    estimatedMins: 40,
    goal: "hypertrophy",
    schedule: {
      cycleLength: 7,
      rotation: [
        { type: "workout", dayId: "push" },
        { type: "rest" },
        { type: "workout", dayId: "pull" },
        { type: "rest" },
        { type: "workout", dayId: "push" },
        { type: "rest" },
        { type: "rest" },
      ],
    },
    days: [
      { id: "push", name: { en: "Push" }, warmup: [], exercises: [
        { exerciseId: "chest-press-machine", sets: 3, reps: 10, restSecs: 90 },
      ] },
      { id: "pull", name: { en: "Pull" }, warmup: [], exercises: [
        { exerciseId: "lat-pulldown", sets: 3, reps: 10, restSecs: 90 },
      ] },
    ],
  };
}

function settingsWith(customPlans: Plan[] = []): Settings {
  return {
    unit: "kg", theme: "system", accent: "green", lang: "en",
    activePlanId: "beginner-3day", nextDayIdx: 0, machineNotes: {},
    customPlans,
  };
}

describe("planResolver.getPlan", () => {
  it("resolves a built-in plan", () => {
    expect(getPlan("beginner-3day", settingsWith())?.id).toBe("beginner-3day");
  });

  it("resolves a custom plan", () => {
    const s = settingsWith([customPlan()]);
    expect(getPlan("custom-abc", s)?.name).toBe("My Split");
  });

  it("prefers the built-in on an id clash", () => {
    const shadow = { ...customPlan(), id: "beginner-3day", name: "Shadow" };
    expect(getPlan("beginner-3day", settingsWith([shadow]))?.name).toBe(PLANS["beginner-3day"]!.name);
  });

  it("returns undefined for an unknown id", () => {
    expect(getPlan("nope", settingsWith())).toBeUndefined();
  });
});

describe("planResolver.allPlans / isCustomPlan", () => {
  it("lists built-ins plus custom plans", () => {
    const s = settingsWith([customPlan()]);
    const all = allPlans(s);
    expect(all.length).toBe(Object.keys(PLANS).length + 1);
    expect(all.some((p) => p.id === "custom-abc")).toBe(true);
  });

  it("handles absent customPlans", () => {
    const s = settingsWith();
    delete (s as Partial<Settings>).customPlans;
    expect(allPlans(s).length).toBe(Object.keys(PLANS).length);
  });

  it("flags only custom ids", () => {
    const s = settingsWith([customPlan()]);
    expect(isCustomPlan("custom-abc", s)).toBe(true);
    expect(isCustomPlan("beginner-3day", s)).toBe(false);
  });
});

describe("planResolver.validatePlan", () => {
  it("accepts a valid custom plan", () => {
    expect(validatePlan(customPlan())).toEqual([]);
  });

  it("rejects an empty name", () => {
    expect(validatePlan({ ...customPlan(), name: "  " })).toContain("builder.err.name");
  });

  it("rejects zero days", () => {
    expect(validatePlan({ ...customPlan(), days: [] })).toContain("builder.err.min_day");
  });

  it("rejects a day with no exercises", () => {
    const p = customPlan();
    p.days[0]!.exercises = [];
    expect(validatePlan(p)).toContain("builder.err.day_exercises");
  });

  it("rejects a non-catalogue exercise", () => {
    const p = customPlan();
    p.days[0]!.exercises = [{ exerciseId: "not-a-real-machine", sets: 3, reps: 10, restSecs: 90 }];
    expect(validatePlan(p)).toContain("builder.err.unknown_exercise");
  });

  it("rejects a rotation that is not 7 slots", () => {
    const p = customPlan();
    p.schedule.rotation = p.schedule.rotation.slice(0, 5);
    expect(validatePlan(p)).toContain("builder.err.rotation_len");
  });

  it("rejects a rotation with no workout day", () => {
    const p = customPlan();
    p.schedule.rotation = p.schedule.rotation.map(() => ({ type: "rest" as const }));
    expect(validatePlan(p)).toContain("builder.err.no_workout");
  });

  it("rejects a rotation referencing a missing day", () => {
    const p = customPlan();
    p.schedule.rotation[0] = { type: "workout", dayId: "ghost" };
    expect(validatePlan(p)).toContain("builder.err.rotation_ref");
  });
});

describe("planResolver.normalizePlan", () => {
  it("derives daysPerWeek from workout slots and pins cycleLength", () => {
    const p = normalizePlan({ ...customPlan(), daysPerWeek: 99, estimatedMins: 0 });
    expect(p.daysPerWeek).toBe(3);
    expect(p.schedule.cycleLength).toBe(7);
    expect(p.estimatedMins).toBeGreaterThan(0);
    expect(p.name).toBe("My Split");
  });
});

describe("planResolver.removeDayFromPlan", () => {
  it("removes the day and flips referencing rotation slots to rest", () => {
    const p = removeDayFromPlan(customPlan(), "push");
    expect(p.days.some((d) => d.id === "push")).toBe(false);
    // slots 0 and 4 referenced push → now rest; the pull slot survives
    expect(p.schedule.rotation[0]).toEqual({ type: "rest" });
    expect(p.schedule.rotation[4]).toEqual({ type: "rest" });
    expect(p.schedule.rotation[2]).toEqual({ type: "workout", dayId: "pull" });
  });
});

// The whole point of the feature: a custom plan satisfies the same schedule
// contract as a built-in, so calendar awareness keeps working.
describe("custom plans honor the schedule contract", () => {
  it("maps a Monday to its workout slot", () => {
    const mon = new Date(2026, 5, 29); // Mon Jun 29 2026
    expect(slotForDate(customPlan(), mon)).toEqual({ type: "workout", dayId: "push" });
  });

  it("computes max consecutive workouts", () => {
    expect(maxConsecutiveWorkouts(customPlan())).toBe(1);
  });
});
