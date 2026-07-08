// ── Muscle-targeted warmup & cooldown ─────────────────────────────────────────
//
// Warmup and cooldown are generated from the muscle groups a day actually trains,
// so a push day warms the chest/shoulders/arms and a leg day stretches quads and
// hamstrings — instead of one generic list for everything. Content is derived at
// render time from the day's exercises; nothing is stored, so custom plans get
// targeted mobility for free.
//
// Targeting uses each exercise's PRIMARY muscle group (sharp and distinctive).
// The cardio group carries no targeted moves — the universal light-cardio opener
// and closer cover it.

import type { MuscleGroupId, Settings, WarmupStep } from "../types";
import { EXERCISES } from "./exercises";
import { getExercise } from "./exerciseResolver";
import { MUSCLE_GROUPS, muscleGroupOf } from "./muscles";

// Universal steps that bracket every session regardless of the muscles worked.
const WARMUP_OPENER: WarmupStep = {
  name: { en: "Light cardio", de: "Leichtes Cardio" },
  detail: { en: "5 min — treadmill or bike to raise your heart rate", de: "5 Min. — Laufband oder Rad, um den Puls zu erhöhen" },
};
const WARMUP_CLOSER: WarmupStep = {
  name: { en: "Ramp-up set", de: "Aufbausatz" },
  detail: { en: "First exercise at ~50% × 12–15 reps", de: "Erste Übung bei ~50 % × 12–15 Wdh." },
};
const COOLDOWN_OPENER: WarmupStep = {
  name: { en: "Zone 2 Cardio", de: "Zone-2-Cardio" },
  detail: { en: "10 min · easy pace to bring your heart rate down", de: "10 Min. · lockeres Tempo, um den Puls zu senken" },
};

/** Dynamic warmup movements per muscle group. */
export const WARMUP_BY_GROUP: Record<MuscleGroupId, WarmupStep[]> = {
  chest: [
    { name: { en: "Arm circles", de: "Armkreisen" }, detail: { en: "10 forward, 10 backward", de: "10 vorwärts, 10 rückwärts" } },
    { name: { en: "Band pull-aparts", de: "Band-Auseinanderziehen" }, detail: { en: "15 reps — squeeze shoulder blades", de: "15 Wdh. — Schulterblätter zusammenziehen" } },
  ],
  back: [
    { name: { en: "Cat-cow", de: "Katze-Kuh" }, detail: { en: "8 slow reps on the mat", de: "8 langsame Wdh. auf der Matte" } },
    { name: { en: "Scapular pull-aparts", de: "Schulterblatt-Retraktion" }, detail: { en: "12 reps — hang or band, retract", de: "12 Wdh. — Klimmzugstange oder Band, zurückziehen" } },
  ],
  shoulders: [
    { name: { en: "Shoulder rolls", de: "Schulterkreisen" }, detail: { en: "10 forward, 10 backward", de: "10 vorwärts, 10 rückwärts" } },
    { name: { en: "Wall slides", de: "Wandgleiten" }, detail: { en: "10 reps — arms overhead, back flat", de: "10 Wdh. — Arme über Kopf, Rücken flach" } },
  ],
  arms: [
    { name: { en: "Wrist circles", de: "Handgelenkkreisen" }, detail: { en: "10 each direction", de: "10 pro Richtung" } },
    { name: { en: "Light band curls", de: "Leichte Band-Curls" }, detail: { en: "15 reps — biceps and triceps", de: "15 Wdh. — Bizeps und Trizeps" } },
  ],
  legs: [
    { name: { en: "Leg swings", de: "Beinschwünge" }, detail: { en: "10 front-back each leg", de: "10 vor-zurück pro Bein" } },
    { name: { en: "Bodyweight squats", de: "Kniebeugen ohne Gewicht" }, detail: { en: "12 reps, slow and controlled", de: "12 Wdh., langsam und kontrolliert" } },
    { name: { en: "Hip circles", de: "Hüftkreisen" }, detail: { en: "10 each direction", de: "10 pro Richtung" } },
  ],
  core: [
    { name: { en: "Bird-dog", de: "Bird-Dog" }, detail: { en: "8 each side, slow", de: "8 pro Seite, langsam" } },
    { name: { en: "Standing torso twists", de: "Rumpfdrehungen im Stehen" }, detail: { en: "10 each side", de: "10 pro Seite" } },
  ],
  cardio: [],
};

/** Targeted static stretches per muscle group (reuses the app's bilingual copy). */
export const COOLDOWN_BY_GROUP: Record<MuscleGroupId, WarmupStep[]> = {
  chest: [
    { name: { en: "Chest opener", de: "Brustöffner" }, detail: { en: "30 s — clasp hands behind back, open chest, chin up", de: "30 s — Hände hinter dem Rücken falten, Brust öffnen, Kinn hoch" } },
  ],
  back: [
    { name: { en: "Child's pose", de: "Stellung des Kindes" }, detail: { en: "30 s — sit back, arms reach forward", de: "30 s — zurücksetzen, Arme nach vorn strecken" } },
    { name: { en: "Cat-cow / spinal twist", de: "Katze-Kuh / Wirbelsäulendrehung" }, detail: { en: "5 slow reps each — on mat", de: "je 5 langsame Wdh. — auf der Matte" } },
  ],
  shoulders: [
    { name: { en: "Cross-body shoulder stretch", de: "Schulter quer dehnen" }, detail: { en: "20 s each arm", de: "20 s pro Arm" } },
  ],
  arms: [
    { name: { en: "Lat / tricep overhead", de: "Lat/Trizeps über Kopf" }, detail: { en: "20 s each arm — reach over head, side-bend", de: "20 s pro Arm — über den Kopf greifen, zur Seite neigen" } },
  ],
  legs: [
    { name: { en: "Hip flexor stretch", de: "Hüftbeuger dehnen" }, detail: { en: "30 s each side — lunge position, hips forward", de: "30 s pro Seite — Ausfallschritt, Hüfte nach vorn" } },
    { name: { en: "Quad stretch", de: "Quadrizeps dehnen" }, detail: { en: "30 s each side — standing, heel to glute", de: "30 s pro Seite — stehend, Ferse zum Gesäß" } },
    { name: { en: "Hamstring stretch", de: "Beinbizeps dehnen" }, detail: { en: "30 s each side — seated or standing toe touch", de: "30 s pro Seite — sitzend oder stehend zu den Zehen" } },
  ],
  core: [
    { name: { en: "Cobra stretch", de: "Kobra-Dehnung" }, detail: { en: "30 s — lie face down, press up, hips down", de: "30 s — Bauchlage, hochdrücken, Hüfte unten" } },
    { name: { en: "Cat-cow / spinal twist", de: "Katze-Kuh / Wirbelsäulendrehung" }, detail: { en: "5 slow reps each — on mat", de: "je 5 langsame Wdh. — auf der Matte" } },
  ],
  cardio: [],
};

/**
 * Distinct muscle GROUPS a day trains, by each exercise's primary muscle, in
 * canonical order. The cardio group is dropped (covered by the universal steps),
 * and unknown/custom exercise ids are tolerated.
 */
export function dayMuscleGroups(exerciseIds: string[], settings?: Settings): MuscleGroupId[] {
  const found = new Set<MuscleGroupId>();
  for (const id of exerciseIds) {
    const ex = settings ? getExercise(id, settings) : EXERCISES[id];
    if (!ex) continue;
    const group = muscleGroupOf(ex.primaryMuscle);
    if (group !== "cardio") found.add(group);
  }
  return MUSCLE_GROUPS.filter((g) => found.has(g));
}

/** Drop steps whose English name has already appeared (e.g. cat-cow in back+core). */
function dedupe(steps: WarmupStep[]): WarmupStep[] {
  const seen = new Set<string>();
  return steps.filter((s) => (seen.has(s.name.en) ? false : (seen.add(s.name.en), true)));
}

/** Warmup for a day: universal opener → per-group dynamic moves → ramp-up closer. */
export function generateWarmup(groups: MuscleGroupId[]): WarmupStep[] {
  const perGroup = groups.flatMap((g) => WARMUP_BY_GROUP[g]);
  return dedupe([WARMUP_OPENER, ...perGroup, WARMUP_CLOSER]);
}

/** Cooldown for a day: universal easy cardio → per-group targeted stretches. */
export function generateCooldown(groups: MuscleGroupId[]): WarmupStep[] {
  const perGroup = groups.flatMap((g) => COOLDOWN_BY_GROUP[g]);
  return dedupe([COOLDOWN_OPENER, ...perGroup]);
}
