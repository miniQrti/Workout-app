import { useState } from "react";
import { useApp } from "../store/appState";
import { allPlans, getPlan, isCustomPlan } from "../data/planResolver";
import type { Plan } from "../types";
import { localize, useLang } from "../i18n";
import { Button, Card, Chip, EmptyState, Modal, PageHeader } from "../ui/kit";
import { IconChevronDown, IconChevronUp } from "../ui/icons";
import PlanPreview from "../components/PlanPreview";

function PlanCard({
  plan, active, custom, onSwitch, onEdit, onDelete,
}: {
  plan: Plan; active: boolean; custom: boolean;
  onSwitch: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <div className="row" style={{ alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>
            {plan.name}{" "}
            {active && <Chip tone="accent">{t("programs.active")}</Chip>}
            {custom && <Chip tone="gold">{t("programs.custom")}</Chip>}
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

      {open && <div style={{ marginTop: 8 }}><PlanPreview plan={plan} /></div>}

      {!active && (
        <Button block style={{ marginTop: 10 }} onClick={onSwitch}>
          {t("programs.switch")}
        </Button>
      )}

      {custom && (
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <Button block small variant="ghost" onClick={onEdit}>{t("builder.edit")}</Button>
          <Button block small variant="ghost" style={{ color: "var(--red)" }} onClick={onDelete}>{t("builder.delete")}</Button>
        </div>
      )}
    </Card>
  );
}

export default function Programs({
  onCreate, onEdit,
}: {
  onCreate: () => void;
  onEdit: (planId: string) => void;
}) {
  const { state, dispatch } = useApp();
  const { t } = useLang();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const plans = allPlans(state.settings);
  const confirmPlan = confirmId ? getPlan(confirmId, state.settings) : undefined;
  const deletePlan = deleteId ? getPlan(deleteId, state.settings) : undefined;

  return (
    <div className="page">
      <PageHeader
        title={t("programs.title")}
        right={<Button small variant="primary" onClick={onCreate}>+ {t("programs.create")}</Button>}
      />
      <div className="page-body">
        {plans.length === 0 && <Card><EmptyState>—</EmptyState></Card>}
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            active={plan.id === state.settings.activePlanId}
            custom={isCustomPlan(plan.id, state.settings)}
            onSwitch={() => setConfirmId(plan.id)}
            onEdit={() => onEdit(plan.id)}
            onDelete={() => setDeleteId(plan.id)}
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

      {deletePlan && (
        <Modal onClose={() => setDeleteId(null)}>
          <div className="card-title">{t("builder.delete")}</div>
          <div style={{ fontSize: 13, color: "var(--text-2)", margin: "6px 0 16px" }}>
            {t("builder.delete_confirm", { name: deletePlan.name })}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button block onClick={() => setDeleteId(null)}>{t("common.cancel")}</Button>
            <Button block variant="danger" onClick={() => {
              dispatch({ type: "deletePlan", planId: deletePlan.id });
              setDeleteId(null);
            }}>{t("builder.delete")}</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
