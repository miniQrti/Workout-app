import { describe, expect, it } from "vitest";
import { exportCSV, makeBackup, parseBackup } from "./backup";
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
});

describe("CSV export", () => {
  it("writes one row per set in the display unit", () => {
    const logs = [makeLog(1, [{ exId: "leg-press", feel: "good", sets: [[toKgLb(200), 12]] }])];
    const csv = exportCSV(logs, "lb");
    const lines = csv.split("\n");
    expect(lines[0]).toContain("Weight (lb)");
    expect(lines[1]).toContain("Leg Press");
    expect(lines[1]).toContain("200");
    expect(lines[1]).toContain("good");
  });
});

function toKgLb(lb: number): number {
  return lb * 0.45359237;
}
