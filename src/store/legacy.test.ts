import { describe, expect, it } from "vitest";
import { mergeLogs, migrateLegacyLocalStorage, parseLegacyCSV } from "./legacy";
import { makeLog } from "./testUtils";
import { toKg } from "../lib/units";

// Format produced by the previous app version's exporter
const LEGACY_CSV = `Date,Plan,Day,Exercise,Feel,Set,Weight (lbs),Reps,Completed,Duration (min)
"Jun 20, 2025",Planet Fitness Starter,Full Body,Chest Press Machine,Good,1,90,12,Yes,52
"Jun 20, 2025",Planet Fitness Starter,Full Body,Chest Press Machine,Good,2,90,12,Yes,
"Jun 20, 2025",Planet Fitness Starter,Full Body,Chest Press Machine,Good,3,90,10,No,
"Jun 20, 2025",Planet Fitness Starter,Full Body,Lat Pulldown,Easy,1,80,12,Yes,
"Jun 20, 2025",Planet Fitness Starter,Full Body,Some Custom Machine,,1,55,10,Yes,
"Jun 22, 2025",Planet Fitness Starter,Full Body,Chest Press Machine,Hard,1,95,12,Yes,48`;

describe("legacy CSV import", () => {
  it("reconstructs sessions, converts lbs to kg, maps names to ids", () => {
    const logs = parseLegacyCSV(LEGACY_CSV);
    expect(logs).toHaveLength(2);

    const first = logs[0]!;
    expect(first.durationSecs).toBe(52 * 60);
    expect(first.exercises).toHaveLength(3);

    const chest = first.exercises.find((e) => e.exerciseId === "chest-press-machine")!;
    expect(chest.feel).toBe("good");
    expect(chest.sets).toHaveLength(3);
    expect(chest.sets[0]!.weightKg).toBeCloseTo(toKg(90, "lb"), 5);
    expect(chest.sets[2]!.completed).toBe(false);

    // unknown exercise → slug id + name snapshot preserved
    const custom = first.exercises.find((e) => e.exerciseId === "some-custom-machine")!;
    expect(custom.nameSnapshot).toBe("Some Custom Machine");

    expect(logs[1]!.exercises[0]!.sets[0]!.weightKg).toBeCloseTo(toKg(95, "lb"), 5);
  });

  it("detects kg exports from the header", () => {
    const csv = LEGACY_CSV.replace("Weight (lbs)", "Weight (kg)");
    const logs = parseLegacyCSV(csv);
    expect(logs[0]!.exercises[0]!.sets[0]!.weightKg).toBe(90);
  });

  it("throws on unrecognized headers", () => {
    expect(() => parseLegacyCSV("A,B,C\n1,2,3")).toThrow();
  });

  it("translated feels map too", () => {
    const csv = LEGACY_CSV.replace("Good,1", "Gut,1");
    const logs = parseLegacyCSV(csv);
    expect(logs[0]!.exercises[0]!.feel).toBe("good");
  });
});

describe("legacy localStorage migration", () => {
  it("converts the wt-v2 blob with its stored unit", () => {
    const blob = JSON.stringify({
      unit: "lbs", theme: "dark", lang: "de", activePlanId: "beginner-3day", nextDayIdx: 1,
      logs: [{
        id: "old-1", planId: "beginner-3day", dayIdx: 0, dayName: "Full Body",
        startedAt: "2025-06-20T10:00:00.000Z", completedAt: "2025-06-20T11:00:00.000Z", durationSecs: 3600,
        exercises: [{ exId: "leg-press", feel: "Easy", sets: [{ weight: "200", reps: "12", completed: true }] }],
      }],
    });
    const result = migrateLegacyLocalStorage(blob)!;
    expect(result.settings.unit).toBe("lb");
    expect(result.settings.theme).toBe("dark");
    expect(result.logs).toHaveLength(1);
    const set = result.logs[0]!.exercises[0]!.sets[0]!;
    expect(set.weightKg).toBeCloseTo(toKg(200, "lb"), 5);
    expect(result.logs[0]!.exercises[0]!.feel).toBe("easy");
  });

  it("returns null for absent or corrupt data", () => {
    expect(migrateLegacyLocalStorage(null)).toBeNull();
    expect(migrateLegacyLocalStorage("{broken")).toBeNull();
  });
});

describe("mergeLogs", () => {
  it("skips imports landing on the same day with the same day name", () => {
    const existing = [makeLog(2, [{ exId: "leg-press", sets: [[100, 10]] }])];
    const dupe = makeLog(2, [{ exId: "leg-press", sets: [[100, 10]] }]);
    const fresh = makeLog(1, [{ exId: "leg-press", sets: [[105, 10]] }]);
    const { merged, added, skipped } = mergeLogs(existing, [dupe, fresh]);
    expect(added).toBe(1);
    expect(skipped).toBe(1);
    expect(merged).toHaveLength(2);
  });
});
