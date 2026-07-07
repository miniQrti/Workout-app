import type { Plan } from "../types";
import { demoUrl, exerciseName } from "../data/exercises";
import { localize, useLang } from "../i18n";

/**
 * Read-only render of a plan's weekly layout + days. Shared by the Programs
 * plan cards and the plan builder's live preview so both stay visually identical.
 */
export default function PlanPreview({ plan, showDemoLinks = true }: { plan: Plan; showDemoLinks?: boolean }) {
  const { t, lang } = useLang();

  return (
    <div>
      {/* Weekly layout */}
      <div style={{ fontSize: 12, color: "var(--text-2)", fontWeight: 600, marginBottom: 6 }}>
        {t("programs.week_layout")}
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
        {plan.schedule.rotation.map((slot, i) => {
          const label = slot.type === "workout"
            ? localize(plan.days.find((d) => d.id === slot.dayId)?.name, lang) || "?"
            : slot.type === "cardio" ? t("programs.cardio") : t("programs.rest");
          return (
            <span key={i} className={`chip${slot.type === "workout" ? " chip-accent" : ""}`} style={{ fontSize: 11 }}>
              {label}
            </span>
          );
        })}
      </div>

      {plan.days.map((day) => (
        <div key={day.id} style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{localize(day.name, lang)}</div>
          {day.exercises.map((pe, i) => (
            <div key={`${pe.exerciseId}-${i}`} className="row" style={{ fontSize: 12, color: "var(--text-2)", padding: "2px 0" }}>
              <span>
                {exerciseName(pe.exerciseId)}{" "}
                {showDemoLinks && (
                  <a
                    href={demoUrl(exerciseName(pe.exerciseId))}
                    target="_blank" rel="noopener noreferrer"
                    style={{ textDecoration: "none", fontSize: 11 }}
                  >
                    ▶
                  </a>
                )}
              </span>
              <span>{pe.sets} × {pe.reps}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
