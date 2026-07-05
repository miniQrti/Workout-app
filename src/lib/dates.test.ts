import { describe, expect, it } from "vitest";
import { dayKey, daysBetween, formatDuration, parseDate, parseDayKey, weekStart } from "./dates";

describe("dates", () => {
  it("weekStart is the Monday of the week", () => {
    // 2026-07-02 is a Thursday
    const thu = new Date(2026, 6, 2, 15, 30);
    const ws = weekStart(thu);
    expect(ws.getDay()).toBe(1);
    expect(dayKey(ws)).toBe("2026-06-29");
    expect(ws.getHours()).toBe(0);
  });

  it("weekStart of a Sunday goes back to the previous Monday", () => {
    const sun = new Date(2026, 6, 5);
    expect(dayKey(weekStart(sun))).toBe("2026-06-29");
  });

  it("weekStart of a Monday is itself", () => {
    const mon = new Date(2026, 5, 29, 23, 59);
    expect(dayKey(weekStart(mon))).toBe("2026-06-29");
  });

  it("dayKey uses local time", () => {
    const lateNight = new Date(2026, 6, 2, 23, 45);
    expect(dayKey(lateNight)).toBe("2026-07-02");
  });

  it("parseDate rejects invalid input", () => {
    expect(parseDate("not a date")).toBeNull();
    expect(parseDate(null)).toBeNull();
    expect(parseDate("2026-07-02T10:00:00.000Z")).not.toBeNull();
  });

  it("formats durations", () => {
    expect(formatDuration(90)).toBe("1:30");
    expect(formatDuration(3600)).toBe("60:00");
    expect(formatDuration(5)).toBe("0:05");
  });

  it("parseDayKey builds a LOCAL midnight date (not UTC)", () => {
    const d = parseDayKey("2026-07-04")!;
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(6);
    expect(d.getDate()).toBe(4); // would shift to the 3rd if parsed as UTC in the west
    expect(d.getHours()).toBe(0);
    expect(dayKey(d)).toBe("2026-07-04");
  });

  it("parseDayKey rejects malformed input", () => {
    expect(parseDayKey("2026-7-4")).toBeNull();
    expect(parseDayKey("nope")).toBeNull();
    expect(parseDayKey(null)).toBeNull();
  });

  it("daysBetween counts whole calendar days, DST-safe", () => {
    expect(daysBetween(new Date(2026, 6, 1), new Date(2026, 6, 4))).toBe(3);
    expect(daysBetween(new Date(2026, 6, 4), new Date(2026, 6, 1))).toBe(-3);
    // spans the US spring-forward DST boundary (Mar 8 2026); still exactly 3 days
    expect(daysBetween(new Date(2026, 2, 7), new Date(2026, 2, 10))).toBe(3);
    // ignores time-of-day
    expect(daysBetween(new Date(2026, 6, 1, 23, 59), new Date(2026, 6, 2, 0, 1))).toBe(1);
  });
});
