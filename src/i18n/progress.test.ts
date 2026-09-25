import { describe, expect, it } from "vitest";
import { makeT } from "./index";

describe("progress count labels", () => {
  it("uses singular and plural English workout labels", () => {
    const t = makeT("en");
    expect(t("progress.workouts", { count: 1 })).toBe("workout");
    expect(t("progress.workouts", { count: 2 })).toBe("workouts");
    expect(t("progress.total_count", { count: 1 })).toBe("1 workout logged");
  });

  it("uses singular and plural German summary labels", () => {
    const t = makeT("de");
    expect(t("progress.total_count", { count: 1 })).toBe("1 Training erfasst");
    expect(t("progress.streak_count", { count: 1 })).toBe("1 Woche in Folge");
    expect(t("progress.streak_count", { count: 2 })).toBe("2 Wochen in Folge");
  });
});
