import type { Unit } from "../types";

export const KG_PER_LB = 0.45359237;

/** Smallest sensible weight step per display unit (dumbbell granularity). */
export const UNIT_STEP: Record<Unit, number> = { kg: 1.25, lb: 2.5 };

export function toKg(value: number, unit: Unit): number {
  return unit === "kg" ? value : value * KG_PER_LB;
}

export function fromKg(kg: number, unit: Unit): number {
  return unit === "kg" ? kg : kg / KG_PER_LB;
}

export function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}

/**
 * Convert a stored kg value to the display unit, snapped to a sensible step
 * so lb→kg→lb round-trips reproduce the number the user typed.
 */
export function displayWeight(kg: number, unit: Unit): number {
  const v = fromKg(kg, unit);
  // Snap to 0.25 to kill float noise, then trim trailing zeros via Number.
  return Number((Math.round(v * 4) / 4).toFixed(2));
}

/** Format a kg value in the display unit, without the unit suffix. */
export function formatWeight(kg: number, unit: Unit): string {
  return String(displayWeight(kg, unit));
}

/** Format a kg value including the unit suffix, e.g. "90 lb". */
export function formatWeightUnit(kg: number, unit: Unit): string {
  return `${formatWeight(kg, unit)} ${unit}`;
}

/**
 * Parse user input typed in the display unit into canonical kg.
 * Accepts "90", "90.5", "90,5". Returns null for empty/invalid/≤0.
 */
export function parseWeightInput(text: string, unit: Unit): number | null {
  const cleaned = text.trim().replace(",", ".");
  if (cleaned === "") return null;
  const v = Number(cleaned);
  if (!Number.isFinite(v) || v <= 0) return null;
  return toKg(v, unit);
}

/** Compact display for large weight totals: 12450 → "12.5k". */
export function formatCompact(n: number): string {
  if (n >= 100000) return `${Math.round(n / 1000)}k`;
  if (n >= 10000) return `${(Math.round(n / 100) / 10).toFixed(1)}k`;
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
