import { useMemo, useRef, useState } from "react";
import type { Equipment, Exercise } from "../types";
import { validateExercise } from "../data/exerciseResolver";
import { MUSCLE_GROUPS, MUSCLES, muscleLabel } from "../data/muscles";
import { uuid } from "../lib/id";
import { useLang } from "../i18n";
import { Button, Input, Segmented, SectionLabel, Sheet, Stepper } from "../ui/kit";

const EQUIPMENT: Equipment[] = ["machine", "cable", "dumbbell", "barbell", "smith", "bodyweight"];
type RepType = Exercise["repType"];

/** Clickable chips for muscle ids, grouped by broad muscle group. */
function MuscleGrid({
  isSelected, onToggle, exclude,
}: {
  isSelected: (id: string) => boolean;
  onToggle: (id: string) => void;
  exclude?: string;
}) {
  const { t, lang } = useLang();
  return (
    <>
      {MUSCLE_GROUPS.map((group) => {
        const ids = Object.entries(MUSCLES)
          .filter(([id, info]) => info.group === group && id !== exclude)
          .map(([id]) => id);
        if (ids.length === 0) return null;
        return (
          <div key={group} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>{t(`muscle.${group}`)}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {ids.map((id) => (
                <button
                  key={id}
                  type="button"
                  className={`chip${isSelected(id) ? " chip-accent" : ""}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => onToggle(id)}
                >
                  {muscleLabel(id, lang)}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}

/**
 * Create/edit a custom exercise. The parent owns persistence: on save this
 * assembles a validated Exercise and hands it to `onSave` (which dispatches
 * `upsertExercise`). Reused by Settings ("My exercises") and the plan-builder
 * picker's "+ Add custom exercise".
 */
export default function ExerciseForm({
  initial, onClose, onSave,
}: {
  /** Existing exercise to edit, or null to create a new one. */
  initial: Exercise | null;
  onClose: () => void;
  onSave: (exercise: Exercise) => void;
}) {
  const { t } = useLang();
  const id = useRef(initial?.id ?? uuid()).current;

  const [name, setName] = useState(initial?.name ?? "");
  const [primary, setPrimary] = useState(initial?.primaryMuscle ?? "");
  const [secondary, setSecondary] = useState<string[]>(
    initial ? initial.muscles.filter((m) => m !== initial.primaryMuscle) : []
  );
  const [equipment, setEquipment] = useState<Equipment>(initial?.equipment ?? "machine");
  const [repType, setRepType] = useState<RepType>(initial?.repType ?? "reps");
  const [sets, setSets] = useState(initial?.defaultSets ?? 3);
  const [reps, setReps] = useState(initial?.defaultReps ?? 12);
  const [rest, setRest] = useState(initial?.restSecs ?? 90);
  const [tip, setTip] = useState(initial?.tip?.en ?? "");
  const [showErrors, setShowErrors] = useState(false);

  const timed = repType === "seconds";

  const exercise: Exercise = useMemo(() => ({
    id,
    name: name.trim(),
    primaryMuscle: primary,
    muscles: [primary, ...secondary.filter((m) => m !== primary)].filter(Boolean),
    equipment,
    repType,
    defaultSets: sets,
    defaultReps: reps,
    restSecs: rest,
    ...(tip.trim() ? { tip: { en: tip.trim() } } : {}),
  }), [id, name, primary, secondary, equipment, repType, sets, reps, rest, tip]);

  const errors = useMemo(() => validateExercise(exercise), [exercise]);

  const setPrimaryMuscle = (m: string) => {
    setPrimary(m);
    setSecondary((prev) => prev.filter((x) => x !== m));
  };

  const toggleSecondary = (m: string) =>
    setSecondary((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));

  const save = () => {
    if (errors.length > 0) { setShowErrors(true); return; }
    onSave(exercise);
  };

  return (
    <Sheet onClose={onClose}>
      <div className="card-title" style={{ marginBottom: 10 }}>
        {initial ? t("customex.title_edit") : t("customex.title_new")}
      </div>

      <div style={{ maxHeight: "68vh", overflowY: "auto", paddingRight: 2 }}>
        {/* Name */}
        <Input
          placeholder={t("customex.name_placeholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Primary muscle */}
        <SectionLabel>{t("customex.primary")}</SectionLabel>
        <MuscleGrid isSelected={(m) => m === primary} onToggle={setPrimaryMuscle} />

        {/* Secondary muscles */}
        <SectionLabel>{t("customex.secondary")}</SectionLabel>
        <MuscleGrid isSelected={(m) => secondary.includes(m)} onToggle={toggleSecondary} exclude={primary} />

        {/* Equipment */}
        <div style={{ fontSize: 12, color: "var(--text-2)", margin: "12px 0 4px" }}>{t("customex.equipment")}</div>
        <Segmented<Equipment>
          options={EQUIPMENT.map((eq) => ({ value: eq, label: t(`customex.equipment.${eq}`) }))}
          value={equipment}
          onChange={setEquipment}
        />

        {/* Rep type */}
        <div style={{ fontSize: 12, color: "var(--text-2)", margin: "12px 0 4px" }}>{t("customex.rep_type")}</div>
        <Segmented<RepType>
          options={[
            { value: "reps", label: t("customex.rep_type.reps") },
            { value: "seconds", label: t("customex.rep_type.seconds") },
          ]}
          value={repType}
          onChange={setRepType}
        />

        {/* Defaults */}
        <div style={{ marginTop: 8 }}>
          <Stepper label={t("builder.sets")} value={sets} min={1} max={10} onChange={setSets} />
          <Stepper
            label={timed ? t("customex.duration") : t("builder.reps")}
            value={reps}
            min={timed ? 5 : 1}
            max={timed ? 900 : 60}
            step={timed ? 5 : 1}
            onChange={setReps}
          />
          <Stepper label={t("builder.rest")} value={rest} min={0} max={240} step={15} onChange={setRest} />
        </div>

        {/* Form tip / tooltip */}
        <div style={{ fontSize: 12, color: "var(--text-2)", margin: "12px 0 4px" }}>{t("customex.tip")}</div>
        <textarea
          className="input"
          style={{ minHeight: 64, resize: "vertical" }}
          placeholder={t("customex.tip_placeholder")}
          value={tip}
          onChange={(e) => setTip(e.target.value)}
        />

        {showErrors && errors.length > 0 && (
          <div style={{ marginTop: 10 }}>
            {errors.map((key) => (
              <div key={key} style={{ fontSize: 12, color: "var(--red)" }}>• {t(key)}</div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <Button block onClick={onClose}>{t("common.cancel")}</Button>
        <Button block variant="primary" disabled={errors.length > 0} onClick={save}>{t("common.save")}</Button>
      </div>
    </Sheet>
  );
}
