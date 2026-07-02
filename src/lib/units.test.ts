import { describe, expect, it } from "vitest";
import { displayWeight, formatCompact, parseWeightInput, toKg, fromKg } from "./units";

describe("units", () => {
  it("round-trips lb input through kg storage", () => {
    const kg = parseWeightInput("90", "lb");
    expect(kg).not.toBeNull();
    expect(displayWeight(kg!, "lb")).toBe(90);
  });

  it("round-trips fractional lb", () => {
    const kg = parseWeightInput("92.5", "lb");
    expect(displayWeight(kg!, "lb")).toBe(92.5);
  });

  it("accepts comma decimals (German input)", () => {
    const kg = parseWeightInput("42,5", "kg");
    expect(kg).toBe(42.5);
  });

  it("rejects empty, zero, and junk", () => {
    expect(parseWeightInput("", "lb")).toBeNull();
    expect(parseWeightInput("0", "lb")).toBeNull();
    expect(parseWeightInput("-5", "kg")).toBeNull();
    expect(parseWeightInput("abc", "kg")).toBeNull();
  });

  it("converts between units", () => {
    expect(toKg(100, "lb")).toBeCloseTo(45.359, 3);
    expect(fromKg(45.359237, "lb")).toBeCloseTo(100, 5);
    expect(displayWeight(40.8233133, "lb")).toBe(90);
    expect(displayWeight(40.8233133, "kg")).toBe(40.75);
  });

  it("formats compact totals", () => {
    expect(formatCompact(950)).toBe("950");
    expect(formatCompact(1234)).toBe("1,234");
    expect(formatCompact(12450)).toBe("12.5k");
    expect(formatCompact(250000)).toBe("250k");
  });
});
