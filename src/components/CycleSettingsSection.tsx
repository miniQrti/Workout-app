import { useApp } from "../store/appState";
import { useLang } from "../i18n";
import { dayKey } from "../lib/dates";
import {
  CYCLE_MAX, CYCLE_MIN, PERIOD_MAX, PERIOD_MIN, defaultCycleSettings,
  effectiveCycleLength, withLastPeriodStart,
} from "../store/cycle";
import type { CycleSettings } from "../types";
import { Button, Card, Input, SectionLabel, Stepper, Toggle } from "../ui/kit";

export default function CycleSettingsSection() {
  const { state, dispatch } = useApp();
  const { t } = useLang();
  const cycle = state.settings.cycle ?? defaultCycleSettings();

  const todayKey = dayKey(new Date());
  const lastStart = cycle.periodStarts[cycle.periodStarts.length - 1];
  const loggedToday = lastStart === todayKey;
  const effective = effectiveCycleLength(cycle);
  const showLearned = cycle.periodStarts.length >= 2 && effective !== cycle.cycleLength;

  // All edits build a fresh cycle object and go through the settings patch.
  const patch = (next: CycleSettings) => dispatch({ type: "settings", patch: { cycle: next } });

  return (
    <div>
      <SectionLabel>{t("settings.cycle")}</SectionLabel>
      <div style={{ marginTop: 8 }}>
        <Card>
          <Toggle
            checked={cycle.enabled}
            label={t("settings.cycle.enable")}
            sub={t("settings.cycle.enable_sub")}
            onChange={(enabled) =>
              patch(enabled ? { ...cycle, enabled: true } : { ...cycle, enabled: false })
            }
          />

          {cycle.enabled && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
              <hr className="divider" />

              {/* Log today */}
              <div>
                <Button
                  block
                  variant="primary"
                  disabled={loggedToday}
                  onClick={() => dispatch({ type: "logPeriodStart", dateKey: todayKey })}
                >
                  {t("settings.cycle.period_started")}
                </Button>
                {lastStart && (
                  <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 6 }}>
                    {t("settings.cycle.last_logged", { date: lastStart })}
                  </div>
                )}
              </div>

              {/* Edit last period date */}
              <div className="row">
                <span style={{ fontSize: 14, fontWeight: 600 }}>{t("settings.cycle.last_period")}</span>
                <Input
                  type="date"
                  max={todayKey}
                  value={lastStart ?? ""}
                  style={{ width: "auto" }}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (!v) return;
                    patch(withLastPeriodStart(cycle, v));
                  }}
                />
              </div>

              <Stepper
                label={t("settings.cycle.cycle_length")}
                value={cycle.cycleLength} min={CYCLE_MIN} max={CYCLE_MAX}
                onChange={(cycleLength) => patch({ ...cycle, cycleLength })}
              />
              {showLearned && (
                <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: -8 }}>
                  {t("settings.cycle.learned", { days: effective })}
                </div>
              )}
              <Stepper
                label={t("settings.cycle.period_length")}
                value={cycle.periodLength} min={PERIOD_MIN} max={PERIOD_MAX}
                onChange={(periodLength) => patch({ ...cycle, periodLength })}
              />

              <hr className="divider" />

              <Toggle
                checked={cycle.adaptiveCoaching}
                label={t("settings.cycle.adaptive")}
                sub={t("settings.cycle.adaptive_sub")}
                onChange={(adaptiveCoaching) => patch({ ...cycle, adaptiveCoaching })}
              />
              <Toggle
                checked={cycle.forecast}
                label={t("settings.cycle.forecast")}
                sub={t("settings.cycle.forecast_sub")}
                onChange={(forecast) => patch({ ...cycle, forecast })}
              />

              <div style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.5, marginTop: 2 }}>
                {t("settings.cycle.disclaimer")}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
