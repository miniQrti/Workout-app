import React from "react";

const GREEN  = "#16A97C";
const MUTED  = "#9CA3AF";

// ── SVG Icons ────────────────────────────────────────────────────────────────

function IconHome({ color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 22V12h6v10" />
    </svg>
  );
}

function IconDumbbell({ color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* left plate */}
      <rect x="1" y="9" width="4" height="6" rx="1.5" />
      {/* right plate */}
      <rect x="19" y="9" width="4" height="6" rx="1.5" />
      {/* left collar */}
      <rect x="4" y="10.5" width="3" height="3" rx="0.5" />
      {/* right collar */}
      <rect x="17" y="10.5" width="3" height="3" rx="0.5" />
      {/* bar */}
      <line x1="7" y1="12" x2="17" y2="12" strokeWidth="2.5" />
    </svg>
  );
}

function IconProgress({ color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3,17 8,11 13,14 21,5" />
      <line x1="3" y1="21" x2="21" y2="21" />
      <line x1="3" y1="21" x2="3" y2="5" />
    </svg>
  );
}

function IconPrograms({ color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="7"  x2="21" y2="7" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="17" x2="21" y2="17" />
    </svg>
  );
}

// ── Nav ──────────────────────────────────────────────────────────────────────

export default function Nav({ view, onChange, hasActiveSession }) {
  const tabs = [
    { id: "home",     label: "Home",     Icon: IconHome },
    { id: "workout",  label: "Workout",  Icon: IconDumbbell },
    { id: "progress", label: "Progress", Icon: IconProgress },
    { id: "programs", label: "Programs", Icon: IconPrograms },
  ];

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      background: "#FFFFFF",
      borderTop: "1px solid rgba(0,0,0,0.10)",
      display: "flex",
      zIndex: 100,
      paddingBottom: "env(safe-area-inset-bottom)",
      height: "calc(58px + env(safe-area-inset-bottom))",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    }}>
      {tabs.map(({ id, label, Icon }) => {
        const active = view === id;
        const color  = active ? GREEN : MUTED;
        const showDot = id === "workout" && hasActiveSession;

        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px 0 6px",
              position: "relative",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {/* Icon with optional green dot indicator */}
            <div style={{ position: "relative", display: "inline-flex" }}>
              <Icon color={color} />
              {showDot && (
                <div style={{
                  position: "absolute",
                  top: -2,
                  right: -4,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: GREEN,
                  border: "1.5px solid #FFFFFF",
                }} />
              )}
            </div>
            <span style={{
              fontSize: 10,
              fontWeight: active ? 600 : 400,
              color,
              lineHeight: 1,
              letterSpacing: "0.01em",
            }}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
