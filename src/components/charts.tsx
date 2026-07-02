import { useT } from "../i18n";
import type { CalendarDay, WeekAgg } from "../store/analytics";
import { formatCompact } from "../lib/units";

// ── Line chart (per-session series) ───────────────────────────────────────────

export interface LinePoint {
  value: number;
  isBest: boolean;
}

export function LineChart({ points }: { points: LinePoint[] }) {
  const t = useT();
  const W = 300, H = 96, PAD = 10;
  const sessions = points.slice(-12);

  if (sessions.length < 2) {
    return (
      <div style={{ height: 96, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)", fontSize: 13 }}>
        {t("progress.no_chart")}
      </div>
    );
  }

  const values = sessions.map((s) => s.value);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = maxV - minV || 1;

  const pts = sessions.map((s, i) => ({
    x: PAD + (i / (sessions.length - 1)) * (W - PAD * 2),
    y: PAD + (1 - (s.value - minV) / range) * (H - PAD * 2),
    isBest: s.isBest,
  }));

  const line = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `M${pts[0]!.x},${H - PAD} ${pts.map((p) => `L${p.x},${p.y}`).join(" ")} L${pts[pts.length - 1]!.x},${H - PAD} Z`;

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: "block", overflow: "visible" }}>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#lineGrad)" />
        <polyline points={line} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={p.isBest ? 5 : 3}
            fill={p.isBest ? "var(--gold)" : "var(--accent)"}
            stroke="var(--surface)" strokeWidth="1.5" />
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>
        <span>{Math.round(minV)}</span>
        <span>{Math.round(maxV)}</span>
      </div>
    </div>
  );
}

// ── Weekly bar chart ──────────────────────────────────────────────────────────

export function WeeklyBars({ weeks, locale, valueOf }: {
  weeks: WeekAgg[];
  locale: string;
  valueOf: (w: WeekAgg) => number;
}) {
  const values = weeks.map(valueOf);
  const maxV = Math.max(...values, 1);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 110, marginBottom: 6 }}>
        {weeks.map((w, i) => {
          const v = values[i]!;
          const isCurrent = i === weeks.length - 1;
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
              {v === maxV && v > 0 && (
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--accent)", marginBottom: 3 }}>
                  {formatCompact(v)}
                </div>
              )}
              <div style={{
                width: "100%",
                height: `${v > 0 ? Math.max((v / maxV) * 100, 4) : 2}%`,
                borderRadius: "5px 5px 2px 2px",
                background: v > 0 ? "var(--accent)" : "var(--border)",
                opacity: v > 0 ? (isCurrent ? 1 : 0.55) : 1,
              }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {weeks.map((w, i) => (
          <div key={i} style={{ flex: 1, fontSize: 9, color: "var(--text-3)", textAlign: "center" }}>
            {w.start.toLocaleDateString(locale, { month: "numeric", day: "numeric" })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Calendar heatmap ──────────────────────────────────────────────────────────

export function Heatmap({ weeks }: { weeks: CalendarDay[][] }) {
  function bg(day: CalendarDay): string {
    if (day.inFuture) return "transparent";
    if (day.sets === 0) return "var(--surface-2)";
    if (day.sets >= 18) return "var(--accent)";
    if (day.sets >= 10) return "color-mix(in srgb, var(--accent) 72%, transparent)";
    return "color-mix(in srgb, var(--accent) 44%, transparent)";
  }
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {weeks.map((week, wi) => (
        <div key={wi} className="heat-col">
          {week.map((day, di) => (
            <div key={di} className="heat-cell" style={{
              background: bg(day),
              border: day.inFuture ? "1px dashed var(--border)" : "none",
            }} />
          ))}
        </div>
      ))}
    </div>
  );
}
