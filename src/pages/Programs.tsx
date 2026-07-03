import { useState } from "react";
import { useApp } from "../store/appState";
import { PLANS } from "../data/plans";
import { demoUrl, exerciseName } from "../data/exercises";
import type { Plan } from "../types";
import { localize, useLang } from "../i18n";
import { Button, Card, Chip, EmptyState, Modal, PageHeader } from "../ui/kit";
import { IconChevronDown, IconChevronUp } from "../ui/icons";

function PlanCard({ plan, active, onSwitch }: { plan: Plan; active: boolean; onSwitch: () => void }) {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <div className="row" style={{ alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>
            {plan.name} {active && <Chip tone="accent">{t("programs.active")}</Chip>}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 3 }}>{localize(plan.tagline, lang)}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, margin: "10px 0" }}>
        <Chip>{t(`programs.difficulty.${plan.difficulty}`)}</Chip>
        <Chip>{t("programs.days_week", { n: plan.daysPerWeek })}</Chip>
        <Chip>~{plan.estimatedMins} {t("common.min")}</Chip>
      </div>

      <Button small variant="ghost" style={{ color: "var(--text-2)", padding: "4px 0" }} onClick={() => setOpen((o) => !o)}>
        {t("programs.preview")} {open ? <IconChevronUp size={13} /> : <IconChevronDown size={13} />}
      </Button>

      {open && (
        <div style={{ marginTop: 8 }}>
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
              {day.exercises.map((pe) => (
                <div key={pe.exerciseId} className="row" style={{ fontSize: 12, color: "var(--text-2)", padding: "2px 0" }}>
                  <span>
                    {exerciseName(pe.exerciseId)}{" "}
                    <a
                      href={demoUrl(exerciseName(pe.exerciseId))}
                      target="_blank" rel="noopener noreferrer"
                      style={{ textDecoration: "none", fontSize: 11 }}
                    >
                      ▶
                    </a>
                  </span>
                  <span>{pe.sets} × {pe.reps}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {!active && (
        <Button block style={{ marginTop: 10 }} onClick={onSwitch}>
          {t("programs.switch")}
        </Button>
      )}
    </Card>
  );
}

export default function Programs() {
  const { state, dispatch } = useApp();
  const { t } = useLang();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const plans = Object.values(PLANS);
  const confirmPlan = confirmId ? PLANS[confirmId] : undefined;

  return (
    <div className="page">
      <PageHeader title={t("programs.title")} />
      <div className="page-body">
        {plans.length === 0 && <Card><EmptyState>—</EmptyState></Card>}
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            active={plan.id === state.settings.activePlanId}
            onSwitch={() => setConfirmId(plan.id)}
          />
        ))}
      </div>

      {confirmPlan && (
        <Modal onClose={() => setConfirmId(null)}>
          <div className="card-title">{t("programs.switch")}</div>
          <div style={{ fontSize: 13, color: "var(--text-2)", margin: "6px 0 16px" }}>
            {t("programs.switch_body", { name: confirmPlan.name })}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button block onClick={() => setConfirmId(null)}>{t("common.cancel")}</Button>
            <Button block variant="primary" onClick={() => {
              dispatch({ type: "settings", patch: { activePlanId: confirmPlan.id, nextDayIdx: 0 } });
              setConfirmId(null);
            }}>{t("common.confirm")}</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
