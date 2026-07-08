import { describe, expect, it } from "vitest";
import {
  dayMuscleGroups, generateWarmup, generateCooldown,
  WARMUP_BY_GROUP, COOLDOWN_BY_GROUP,
} from "./mobility";

const names = (steps: { name: { en: string } }[]) => steps.map((s) => s.name.en);

describe("dayMuscleGroups", () => {
  it("maps a push day to its primary groups in canonical order", () => {
    // chest-press → chest, shoulder-press → shoulders, tricep-pushdown → arms
    const groups = dayMuscleGroups(["shoulder-press-machine", "tricep-pushdown", "chest-press-machine"]);
    expect(groups).toEqual(["chest", "shoulders", "arms"]);
  });

  it("maps a leg day to legs only, deduped", () => {
    expect(dayMuscleGroups(["leg-press", "leg-curl-machine"])).toEqual(["legs"]);
  });

  it("drops the cardio group", () => {
    expect(dayMuscleGroups(["treadmill"])).toEqual([]);
    expect(dayMuscleGroups(["treadmill", "leg-press"])).toEqual(["legs"]);
  });

  it("tolerates unknown / custom exercise ids", () => {
    expect(dayMuscleGroups(["not-a-real-id", "dumbbell-curl"])).toEqual(["arms"]);
  });
});

describe("generateWarmup", () => {
  it("brackets per-group moves with the universal opener and closer", () => {
    const steps = generateWarmup(["legs"]);
    const n = names(steps);
    expect(n[0]).toBe("Light cardio");
    expect(n[n.length - 1]).toBe("Ramp-up set");
    for (const g of WARMUP_BY_GROUP.legs) expect(n).toContain(g.name.en);
  });

  it("includes moves for every targeted group", () => {
    const n = names(generateWarmup(["chest", "arms"]));
    expect(n).toContain("Arm circles");      // chest
    expect(n).toContain("Wrist circles");    // arms
  });

  it("returns just the universal steps when no groups are worked", () => {
    expect(names(generateWarmup([]))).toEqual(["Light cardio", "Ramp-up set"]);
  });
});

describe("generateCooldown", () => {
  it("leads with easy cardio then adds per-group stretches", () => {
    const n = names(generateCooldown(["legs"]));
    expect(n[0]).toBe("Zone 2 Cardio");
    expect(n).toContain("Quad stretch");
    expect(n).toContain("Hamstring stretch");
  });

  it("dedupes a stretch shared by two groups (cat-cow in back and core)", () => {
    const n = names(generateCooldown(["back", "core"]));
    const catCow = n.filter((x) => x === "Cat-cow / spinal twist");
    expect(catCow.length).toBe(1);
    // both groups' distinct stretches still present
    expect(n).toContain("Child's pose"); // back
    expect(n).toContain("Cobra stretch"); // core
  });

  it("returns just the universal step when no groups are worked", () => {
    expect(names(generateCooldown([]))).toEqual(["Zone 2 Cardio"]);
  });
});

describe("library shape", () => {
  it("every non-cardio group has warmup and cooldown moves", () => {
    for (const g of ["chest", "back", "shoulders", "arms", "legs", "core"] as const) {
      expect(WARMUP_BY_GROUP[g].length).toBeGreaterThan(0);
      expect(COOLDOWN_BY_GROUP[g].length).toBeGreaterThan(0);
    }
  });
});
