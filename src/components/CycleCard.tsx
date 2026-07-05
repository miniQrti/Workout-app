import { useApp } from "../store/appState";
import { useLang } from "../i18n";
import { dayKey } from "../lib/dates";
import { cycleInfo, daysSinceLastPeriod, defaultCycleSettings } from "../store/cycle";
import { Button, Card, Chip } from "../ui/kit";

const PHASE_EMOJI: Record<string, string> = {
  menstrual: "🌙",
  follicular: "🌱",
  ovulation: "☀️",
  luteal: "🍂",
};

export default function CycleCard() {
  const { state, dispatch } = useApp();
  const { t } = useLang();
  const cycle = state.settings.cycle ?? defaultCycleSettings();

  const info = cycleInfo(cycle);
  const todayKey = dayKey(new Date());
  const daysSinceLast = daysSinceLastPeriod(cycle);
  // Offer one-tap logging when nothing was logged in the last ~10 days.
  const canLogPeriod = daysSinceLast === null || daysSinceLast >= 10;

  const logButton = (
    <Button
      small
      variant="primary"
      onClick={() => dispatch({ type: "logPeriodStart", dateKey: todayKey })}
    >
      {t("home.cycle_log_period")}
    </Button>
  );

  // No period logged yet — invite the user to start.
  if (!info) {
    return (
      <Card>
        <div className="row" style={{ alignItems: "center" }}>
          <div style={{ fontSize: 13, color: "var(--text-2)", flex: 1, marginRight: 10 }}>
            {t("home.cycle_no_data")}
          </div>
          {logButton}
        </div>
      </Card>
    );
  }

  const phaseLabel = t(`cycle.phase.${info.phase}`);
  const hint = t(`cycle.hint.${info.phase}`);

  // Forecast line (only when the toggle is on).
  let forecast: string | null = null;
  if (cycle.forecast) {
    const n = info.daysUntilNext;
    if (n < 0 && -n <= 7) forecast = t("home.cycle_overdue");
    else if (n === 0) forecast = t("home.cycle_expected_today");
    else if (n > 0 && n <= 5) forecast = t("home.cycle_expected", { count: n });
    // >5 days away or >7 overdue → no forecast line (avoids stale/noisy predictions)
  }

  return (
    <Card>
      <div className="row" style={{ alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>
            {PHASE_EMOJI[info.phase]} {t("home.cycle_day", { day: info.day, phase: phaseLabel })}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 4, lineHeight: 1.45 }}>
            {hint}
          </div>
          {forecast && (
            <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 6 }}>{forecast}</div>
          )}
        </div>
        {info.tone === "high" && <Chip tone="gold">{t("coach.pr_attempt")}</Chip>}
      </div>
      {canLogPeriod && (
        <div style={{ marginTop: 12 }}>{logButton}</div>
      )}
    </Card>
  );
}
