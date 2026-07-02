import { useMemo, useState } from "react";
import { useApp } from "../store/appState";
import { PLANS } from "../data/plans";
import { EXERCISES, exerciseName } from "../data/exercises";
import { suggestProgression } from "../store/progression";
import { getPR } from "../store/selectors";
import { consistencyStats, thisWeekWorkouts } from "../store/analytics";
import { localize, localeOf, useLang } from "../i18n";
import { displayWeight } from "../lib/units";
import { parseDate } from "../lib/dates";
import { Button, Card, Chip, Sheet, StatCard, StatRow, EmptyState } from "../ui/kit";
import { IconFlame } from "../ui/icons";

function greetingKey(): string {
  const h = new Date().getHours();
  if (h < 12) return "home.greeting.morning";
  if (h < 18) return "home.greeting.afternoon";
  return "home.greeting.evening";
}

export default function Home({
  onStart, onResume,
}: {
  onStart: (dayIdx: number) => void;
  onResume: () => void;
}) {
  const { state, dispatch, index } = useApp();
  const { t, lang } = useLang();
  const locale = localeOf(lang);
  const [dayPicker, setDayPicker] = useState(false);

  const { settings, logs, session, sessionRecovered } = state;
  const unit = settings.unit;
  const plan = PLANS[settings.activePlanId];
  const dayIdx = plan ? settings.nextDayIdx % plan.days.length : 0;
  const day = plan?.days[dayIdx];

  const coach = useMemo(() => {
    if (!day) return [];
    return day.exercises.map((pe) => {
      const ex = EXERCISES[pe.exerciseId];
      const suggestion = ex ? suggestProgression(index, ex, pe.reps, unit) : null;
      const pr = getPR(index, pe.exerciseId);
      return {
        exerciseId: pe.exerciseId,
        name: exerciseName(pe.exerciseId),
        sets: pe.sets,
        reps: pe.reps,
        suggestion,
        isPRAttempt: !!(suggestion && pr && suggestion.weightKg > pr.weightKg && suggestion.action === "increase"),
      };
    });
  }, [day, index, unit]);

  const stats = useMemo(() => consistencyStats(logs), [logs]);
  const weekCount = useMemo(() => thisWeekWorkouts(logs), [logs]);
  const recent = logs.slice(-3).reverse();

  const arrow = { increase: "↑", hold: "→", decrease: "↓", deload: "↓↓" } as const;
  const arrowColor = { increase: "var(--accent)", hold: "var(--text-2)", decrease: "var(--gold)", deload: "var(--red)" } as const;

  return (
    <div className="page">
      <div className="page-body" style={{ paddingTop: "calc(20px + env(safe-area-inset-top))" }}>

        {/* Greeting */}
        <div>
          <div style={{ fontSize: 13, color: "var(--text-2)" }}>
            {new Date().toLocaleDateString(locale, { weekday: "long", month: "long", day: "numeric" })}
          </div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>{t(greetingKey())}</div>
        </div>

        {/* Resume banner */}
        {session && (
          <Card className="tappable" onClick={onResume}>
            <div className="row">
              <div>
                <div style={{ fontWeight: 700, color: "var(--accent)" }}>{t("home.in_progress")}</div>
                {sessionRecovered && (
                  <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>{t("home.recovered")}</div>
                )}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Button small variant="primary" onClick={(e) => { e.stopPropagation(); onResume(); }}>
                  {t("home.resume")}
                </Button>
                {sessionRecovered && (
                  <Button small onClick={(e) => { e.stopPropagation(); dispatch({ type: "discardSession" }); }}>
                    {t("home.discard_draft")}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Today's workout */}
        {plan && day && (
          <Card
            title={
              <div className="row">
                <span>{t("home.today")} · {localize(day.name, lang)}</span>
                <Chip>{t("home.est_mins", { mins: plan.estimatedMins })}</Chip>
              </div>
            }
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
              {day.exercises.slice(0, 4).map((pe) => (
                <div key={pe.exerciseId} className="row" style={{ fontSize: 13 }}>
                  <span>{exerciseName(pe.exerciseId)}</span>
                  <span style={{ color: "var(--text-2)" }}>{pe.sets} × {pe.reps}</span>
                </div>
              ))}
              {day.exercises.length > 4 && (
                <div style={{ fontSize: 12, color: "var(--text-3)" }}>
                  +{day.exercises.length - 4} {t("common.exercises.other", { count: day.exercises.length - 4 }).replace(/^\d+\s*/, "")}
                </div>
              )}
            </div>
            {!session && (
              <Button block variant="primary" onClick={() => onStart(dayIdx)}>
                {t("home.start")}
              </Button>
            )}
            {plan.days.length > 1 && (
              <Button block variant="ghost" small style={{ marginTop: 6, color: "var(--text-2)" }} onClick={() => setDayPicker(true)}>
                {t("home.switch_day")}
              </Button>
            )}
          </Card>
        )}

        {/* Coach's notes */}
        {day && coach.length > 0 && logs.length > 0 && (
          <Card title={t("home.coach")}>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {coach.map((c) => (
                <div key={c.exerciseId} className="row" style={{ fontSize: 13, alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-2)" }}>
                      {c.suggestion
                        ? t(c.suggestion.reasonKey, c.suggestion.reasonVars)
                        : t("home.no_history")}
                    </div>
                  </div>
                  {c.suggestion && (
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <span style={{ fontWeight: 700, color: arrowColor[c.suggestion.action] }}>
                        {arrow[c.suggestion.action]} {displayWeight(c.suggestion.weightKg, unit)} {unit}
                      </span>
                      {c.isPRAttempt && <div><Chip tone="gold">{t("coach.pr_attempt")}</Chip></div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
        {logs.length === 0 && (
          <Card>
            <EmptyState>{t("home.coach_first")}</EmptyState>
          </Card>
        )}

        {/* Stats */}
        <StatRow>
          <StatCard value={weekCount} label={t("home.this_week")} />
          <StatCard accent value={<span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>{stats.weekStreak}<IconFlame size={16} /></span>} label={t("home.streak")} />
          <StatCard value={stats.totalWorkouts} label={t("home.total")} />
        </StatRow>

        {/* Recent workouts */}
        <div>
          <div className="card-title" style={{ marginBottom: 8 }}>{t("home.recent")}</div>
          {recent.length === 0 ? (
            <Card><EmptyState>{t("home.no_recent")}</EmptyState></Card>
          ) : (
            <div className="fade-list">
              {recent.map((log) => {
                const d = parseDate(log.completedAt);
                return (
                  <Card key={log.id}>
                    <div className="row">
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{log.dayName}</div>
                        <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>
                          {d?.toLocaleDateString(locale, { weekday: "short", month: "short", day: "numeric" })}
                          {" · "}{t("common.exercises", { count: log.exercises.length })}
                        </div>
                      </div>
                      <span style={{ fontSize: 13, color: "var(--text-2)" }}>
                        {log.durationSecs ? `${Math.round(log.durationSecs / 60)} ${t("common.min")}` : ""}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Day picker */}
      {dayPicker && plan && (
        <Sheet onClose={() => setDayPicker(false)}>
          <div className="card-title" style={{ marginBottom: 12 }}>{t("home.switch_day")}</div>
          <div className="fade-list">
            {plan.days.map((d, i) => (
              <Button key={d.id} block
                variant={i === dayIdx ? "primary" : "default"}
                onClick={() => {
                  setDayPicker(false);
                  onStart(i);
                }}
              >
                {localize(d.name, lang)}
                <span style={{ fontWeight: 400, fontSize: 13 }}>
                  · {t("common.exercises", { count: d.exercises.length })}
                </span>
              </Button>
            ))}
          </div>
        </Sheet>
      )}
    </div>
  );
}
