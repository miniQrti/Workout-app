import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTheme, FONT } from "../theme.js";

const PRESETS = [
  { label: "60s",  seconds: 60  },
  { label: "90s",  seconds: 90  },
  { label: "2:00", seconds: 120 },
  { label: "3:00", seconds: 180 },
];

export default function RestTimer({ onClose }) {
  const C = useTheme();
  const [total,   setTotal]   = useState(90);
  const [left,    setLeft]    = useState(90);
  const [running, setRunning] = useState(false);
  const [done,    setDone]    = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setLeft(l => {
        if (l <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          setDone(true);
          if (navigator.vibrate) navigator.vibrate([400, 150, 400]);
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const startPreset = useCallback((seconds) => {
    clearInterval(intervalRef.current);
    setTotal(seconds);
    setLeft(seconds);
    setRunning(true);
    setDone(false);
  }, []);

  const handleRingTap = useCallback(() => {
    if (done) {
      setDone(false);
      setLeft(total);
      setRunning(false);
    } else if (running) {
      clearInterval(intervalRef.current);
      setRunning(false);
    } else {
      setRunning(true);
    }
  }, [done, running, total]);

  const R    = 54;
  const CIRC = 2 * Math.PI * R;
  const dash = done ? 0 : CIRC * (total > 0 ? left / total : 1);

  const ringColor = done ? C.red   : C.green;
  const bgColor   = done ? C.redLight : C.greenLight;
  const centColor = done ? C.red   : C.text1;

  const mins      = Math.floor(left / 60);
  const secs      = left % 60;
  const timeLabel = `${mins}:${String(secs).padStart(2, "0")}`;

  const subLabel = done
    ? "tap to reset"
    : running
    ? "tap to pause"
    : left < total
    ? "tap to resume"
    : "tap to start";

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.58)",
        zIndex: 300,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: FONT,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.surface, borderRadius: 24,
          padding: "24px 20px 20px", width: 290,
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: 18,
          boxShadow: "0 20px 60px rgba(0,0,0,0.30)",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          width: "100%",
        }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.text1 }}>Rest Timer</div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: "50%",
              border: `1px solid ${C.border}`,
              background: C.surface2,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: C.text2, fontSize: 18, lineHeight: 1,
            }}
            aria-label="Close rest timer"
          >
            ×
          </button>
        </div>

        {/* Presets */}
        <div style={{ display: "flex", gap: 6, width: "100%" }}>
          {PRESETS.map(preset => {
            const active = total === preset.seconds && !done;
            return (
              <button
                key={preset.seconds}
                onClick={() => startPreset(preset.seconds)}
                style={{
                  flex: 1, padding: "10px 2px",
                  fontSize: 13, fontWeight: 600, borderRadius: 9,
                  border: active ? `1.5px solid ${C.green}` : `1px solid ${C.border}`,
                  background: active ? C.greenLight : C.surface2,
                  color: active ? C.greenDark : C.text2,
                  cursor: "pointer", fontFamily: FONT, transition: "all 0.15s",
                }}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* SVG ring */}
        <div
          onClick={handleRingTap}
          style={{
            position: "relative", width: 152, height: 152,
            cursor: "pointer", userSelect: "none", flexShrink: 0,
          }}
        >
          {done && (
            <div style={{
              position: "absolute", inset: 12, borderRadius: "50%",
              background: bgColor, opacity: 0.8,
            }}/>
          )}

          <svg width="152" height="152" viewBox="0 0 152 152"
            style={{ transform: "rotate(-90deg)", display: "block" }}>
            <circle cx="76" cy="76" r={R} fill="none"
              stroke={bgColor} strokeWidth="10" />
            <circle cx="76" cy="76" r={R} fill="none"
              stroke={ringColor} strokeWidth="10" strokeLinecap="round"
              strokeDasharray={`${dash} ${CIRC}`}
              style={{
                transition: running
                  ? "stroke-dasharray 0.95s linear, stroke 0.3s"
                  : "stroke 0.3s",
              }}
            />
          </svg>

          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 4,
          }}>
            <div style={{
              fontSize: done ? 22 : 34, fontWeight: 800,
              color: centColor, lineHeight: 1,
              letterSpacing: done ? 0 : "-0.02em",
              fontVariantNumeric: "tabular-nums",
              transition: "font-size 0.2s, color 0.2s",
            }}>
              {done ? "Done!" : timeLabel}
            </div>
            <div style={{ fontSize: 11, color: C.text3, fontWeight: 500, letterSpacing: "0.02em" }}>
              {subLabel}
            </div>
          </div>
        </div>

        {/* Progress strip */}
        <div style={{
          width: "100%", height: 3, borderRadius: 2,
          background: C.surface2, overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            width: done ? "100%" : `${(1 - left / total) * 100}%`,
            background: done ? C.red : C.green,
            borderRadius: 2,
            transition: running ? "width 0.95s linear" : "none",
          }}/>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            width: "100%", padding: "14px 0",
            fontSize: 15, fontWeight: 600, borderRadius: 12,
            border: `1px solid ${C.border}`,
            background: C.surface2, color: C.text1,
            cursor: "pointer", fontFamily: FONT,
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
