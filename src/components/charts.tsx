import { useState } from "react";
import { useT } from "../i18n";
import type { CalendarDay, WeekAgg } from "../store/analytics";
import { formatCompact } from "../lib/units";

// ── Line chart (per-session series) ───────────────────────────────────────────

export interface LinePoint {
  value: number;
  isBest: boolean;
  label?: string;
}

export function LineChart({ points, selectedIndex, onSelect }: {
  points: LinePoint[];
  selectedIndex?: number;
  onSelect?: (index: number) => void;
}) {
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
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true" style={{ display: "block", overflow: "visible" }}>
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
        {selectedIndex !== undefined && pts[selectedIndex] && (
          <circle cx={pts[selectedIndex].x} cy={pts[selectedIndex].y} r="8" fill="none" stroke="var(--text-1)" strokeWidth="1.5" />
        )}
      </svg>
      {onSelect && (
        <div className="chart-sessions" aria-label={t("progress.sessions_label")}>
          {sessions.map((point, i) => (
            <button key={i} type="button" className={selectedIndex === i ? "active" : ""}
              aria-pressed={selectedIndex === i} onClick={() => onSelect(i)}>
              <span>{point.label}</span><strong>{Math.round(point.value * 10) / 10}</strong>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Weekly bar chart ──────────────────────────────────────────────────────────

export function WeeklyBars({ weeks, locale, valueOf, valueLabel }: {
  weeks: WeekAgg[];
  locale: string;
  valueOf: (w: WeekAgg) => number;
  valueLabel: string | ((value: number) => string);
}) {
  const t = useT();
  const [selected, setSelected] = useState<number | null>(null);
  const values = weeks.map(valueOf);
  const maxV = Math.max(...values, 1);
  const active = Math.min(selected ?? weeks.length - 1, weeks.length - 1);
  const labelFor = (value: number) => typeof valueLabel === "string" ? valueLabel : valueLabel(value);

  return (
    <div>
      {weeks[active] && <div className="progress-week-value" aria-live="polite">
        <strong>{formatCompact(values[active]!)} <small>{labelFor(values[active]!)}</small></strong>
        <span>{t("progress.week_of", { date: weeks[active].start.toLocaleDateString(locale, { month: "short", day: "numeric" }) })}</span>
      </div>}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 110, marginBottom: 6 }}>
        {weeks.map((w, i) => {
          const v = values[i]!;
          const isActive = i === active;
          return (
            <button key={i} type="button" className={`progress-week-bar${isActive ? " active" : ""}`}
              aria-label={`${t("progress.week_of", { date: w.start.toLocaleDateString(locale, { month: "short", day: "numeric" }) })}: ${formatCompact(v)} ${labelFor(v)}`}
              aria-pressed={isActive} onClick={() => setSelected(i)}>
              <span style={{ height: `${v > 0 ? Math.max((v / maxV) * 100, 4) : 2}%` }} />
            </button>
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
