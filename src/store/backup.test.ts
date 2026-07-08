import { describe, expect, it } from "vitest";
import { exportCSV, makeBackup, normalizeCustomExercises, parseBackup } from "./backup";
import { makeLog } from "./testUtils";
import { defaultSettings } from "./appState";

describe("JSON backup", () => {
  it("round-trips losslessly", () => {
    const settings = { ...defaultSettings(), unit: "kg" as const, lang: "de" as const };
    const logs = [
      makeLog(3, [{ exId: "leg-press", feel: "good", sets: [[102.5, 12], [null, 30]] }]),
      makeLog(1, [{ exId: "plank", sets: [[null, 60]] }]),
    ];
    const text = JSON.stringify(makeBackup(settings, logs));
    const restored = parseBackup(text, defaultSettings());
    expect(restored.settings.unit).toBe("kg");
    expect(restored.settings.lang).toBe("de");
    expect(restored.logs).toEqual(logs);
  });

  it("rejects files from other apps and future schemas", () => {
    expect(() => parseBackup(JSON.stringify({ app: "other", schemaVersion: 1 }), defaultSettings())).toThrow();
    expect(() => parseBackup(JSON.stringify({ app: "ironlog", schemaVersion: 999, logs: [] }), defaultSettings())).toThrow();
  });

  it("drops malformed sets instead of failing the whole restore", () => {
    const good = makeLog(1, [{ exId: "leg-press", sets: [[100, 10]] }]);
    const mangled = JSON.parse(JSON.stringify(makeBackup(defaultSettings(), [good])));
    mangled.logs[0].exercises[0].sets.push({ weightKg: "junk", reps: -3 });
    const restored = parseBackup(JSON.stringify(mangled), defaultSettings());
    expect(restored.logs[0]!.exercises[0]!.sets).toHaveLength(1);
  });

  it("round-trips cycle settings", () => {
    const settings = {
      ...defaultSettings(),
      cycle: {
        enabled: true, adaptiveCoaching: false, forecast: true,
        cycleLength: 30, periodLength: 4, periodStarts: ["2026-01-01", "2026-01-31"],
      },
    };
    const restored = parseBackup(JSON.stringify(makeBackup(settings, [])), defaultSettings());
    expect(restored.settings.cycle).toEqual(settings.cycle);
  });

  it("sanitizes a garbage cycle object on restore", () => {
    const backup = makeBackup(defaultSettings(), []) as unknown as Record<string, unknown>;
    (backup.settings as Record<string, unknown>).cycle = {
      enabled: true, cycleLength: "999", periodLength: -3,
      periodStarts: ["bad", "2026-01-01", "2026-01-01"],
    };
    const restored = parseBackup(JSON.stringify(backup), defaultSettings());
    expect(restored.settings.cycle!.cycleLength).toBe(40);
    expect(restored.settings.cycle!.periodLength).toBe(1);
    expect(restored.settings.cycle!.periodStarts).toEqual(["2026-01-01"]);
  });
});

describe("CSV export", () => {
  it("writes one row per set in the display unit", () => {
    const logs = [makeLog(1, [{ exId: "leg-press", feel: "good", sets: [[toKgLb(200), 12]] }])];
    const csv = exportCSV(logs, "lb", defaultSettings());
    const lines = csv.split("\n");
    expect(lines[0]).toContain("Weight (lb)");
    expect(lines[1]).toContain("Leg Press");
    expect(lines[1]).toContain("200");
    expect(lines[1]).toContain("good");
  });

  it("uses a custom exercise's name", () => {
    const settings = {
      ...defaultSettings(),
      customExercises: [{
        id: "custom-1", name: "Sled Push", primaryMuscle: "quads", muscles: ["quads"],
        equipment: "machine" as const, repType: "reps" as const,
        defaultSets: 3, defaultReps: 10, restSecs: 60,
      }],
    };
    const logs = [makeLog(1, [{ exId: "custom-1", sets: [[100, 10]] }])];
    expect(exportCSV(logs, "kg", settings)).toContain("Sled Push");
  });
});

describe("normalizeCustomExercises", () => {
  it("round-trips a valid custom exercise through a backup", () => {
    const settings = {
      ...defaultSettings(),
      customExercises: [{
        id: "custom-1", name: "Sled Push", primaryMuscle: "quads", muscles: ["quads", "glutes"],
        equipment: "machine" as const, repType: "reps" as const,
        defaultSets: 3, defaultReps: 10, restSecs: 60, tip: { en: "Drive through the legs." },
      }],
    };
    const restored = parseBackup(JSON.stringify(makeBackup(settings, [])), defaultSettings());
    expect(restored.settings.customExercises).toEqual(settings.customExercises);
  });

  it("drops malformed entries and repairs fields", () => {
    const cleaned = normalizeCustomExercises([
      { id: "ok", name: "Good", primaryMuscle: "abs", equipment: "junk", repType: "weird", defaultSets: -5 },
      { name: "no id" },
      "not an object",
      { id: "blank", name: "  ", primaryMuscle: "abs" },
    ]);
    expect(cleaned).toHaveLength(1);
    expect(cleaned[0]!.equipment).toBe("machine");
    expect(cleaned[0]!.repType).toBe("reps");
    expect(cleaned[0]!.defaultSets).toBe(1);
    expect(cleaned[0]!.muscles).toEqual(["abs"]);
  });
});

function toKgLb(lb: number): number {
  return lb * 0.45359237;
}
