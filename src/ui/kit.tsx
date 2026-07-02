import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

// Small presentation kit over the classes in theme.css. Anything used on
// three or more screens belongs here; page-specific layout stays in pages.

type BtnVariant = "default" | "primary" | "danger" | "ghost";

export function Button({
  variant = "default", small, block, className = "", ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant; small?: boolean; block?: boolean;
}) {
  const cls = [
    "btn",
    variant !== "default" ? `btn-${variant}` : "",
    small ? "btn-sm" : "",
    block ? "btn-block" : "",
    className,
  ].filter(Boolean).join(" ");
  return <button className={cls} {...rest} />;
}

export function Card({
  title, subtitle, children, className = "", onClick,
}: {
  title?: ReactNode; subtitle?: ReactNode; children?: ReactNode;
  className?: string; onClick?: () => void;
}) {
  return (
    <div className={`card ${className}`} onClick={onClick}>
      {title && <div className="card-title">{title}</div>}
      {subtitle && <div className="card-sub">{subtitle}</div>}
      {children}
    </div>
  );
}

export function Chip({
  tone = "default", children,
}: { tone?: "default" | "accent" | "gold" | "red"; children: ReactNode }) {
  return <span className={`chip${tone !== "default" ? ` chip-${tone}` : ""}`}>{children}</span>;
}

export function StatCard({ value, label, accent }: { value: ReactNode; label: ReactNode; accent?: boolean }) {
  return (
    <div className="stat-card">
      <div className="value" style={accent ? { color: "var(--accent)" } : undefined}>{value}</div>
      <div className="label">{label}</div>
    </div>
  );
}

export function StatRow({ children }: { children: ReactNode }) {
  return <div style={{ display: "flex", gap: 10 }}>{children}</div>;
}

export function Segmented<T extends string>({
  options, value, onChange,
}: {
  options: { value: T; label: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="seg">
      {options.map((o) => (
        <button
          key={o.value}
          className={o.value === value ? "active" : ""}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="input" {...props} />;
}

export function Modal({ children, onClose }: { children: ReactNode; onClose?: () => void }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

export function Sheet({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="overlay bottom" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        {children}
      </div>
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="section-label">{children}</div>;
}

export function PageHeader({ title, right }: { title: ReactNode; right?: ReactNode }) {
  return (
    <div className="page-header">
      <h1>{title}</h1>
      {right}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div style={{ fontSize: 13, color: "var(--text-2)", textAlign: "center", padding: "14px 0" }}>
      {children}
    </div>
  );
}

/** Meter with an optional highlighted target band, all values in a 0–max scale. */
export function Meter({
  value, max, bandMin, bandMax, color,
}: { value: number; max: number; bandMin?: number; bandMax?: number; color?: string }) {
  const pct = (v: number) => `${Math.min((v / max) * 100, 100)}%`;
  return (
    <div className="meter">
      {bandMin !== undefined && bandMax !== undefined && (
        <div className="band" style={{ left: pct(bandMin), width: `calc(${pct(bandMax)} - ${pct(bandMin)})` }} />
      )}
      <div className="fill" style={{ width: pct(value), background: color ?? "var(--accent)", opacity: 0.85 }} />
    </div>
  );
}
