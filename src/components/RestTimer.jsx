import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTheme, FONT } from "../theme.js";
import { useT } from "../i18n.js";

const PRESETS = [
  { label: "60s",  seconds: 60  },
  { label: "90s",  seconds: 90  },
  { label: "2:00", seconds: 120 },
  { label: "3:00", seconds: 180 },
];

const STORAGE_KEY = "rest-timer-state";

function saveState(endMs, total) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ endMs, total })); } catch {}
}
function clearState() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}
function loadState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch { return null; }
}

export default function RestTimer({ onClose }) {
  const C = useTheme();
  const t = useT();

  // Restore state from a previous session if the timer was running when the app closed
  const restored = useRef(null);
  if (restored.current === null) {
    const s = loadState();
    if (s && s.endMs > Date.now()) {
      const remaining = Math.round((s.endMs - Date.now()) / 1000);
      restored.current = { endMs: s.endMs, total: s.total, left: remaining, running: true };
    } else {
      if (s) clearState();
      restored.current = { endMs: null, total: 90, left: 90, running: false };
    }
  }
  const init = restored.current;

  const [total,   setTotal]   = useState(init.total);
  const [left,    setLeft]    = useState(init.left);
  const [running, setRunning] = useState(init.running);
  const [done,    setDone]    = useState(false);

  // Absolute timestamp when the timer should expire — source of truth
  const endMsRef    = useRef(init.endMs);
  const intervalRef = useRef(null);

  // Called when the countdown reaches zero
  const finish = useCallback(() => {
    clearInterval(intervalRef.current);
    clearState();
    setRunning(false);
    setDone(true);
    setLeft(0);
    if (navigator.vibrate) navigator.vibrate([400, 150, 400]);
  }, []);

  // Recompute remaining from wall clock and apply, firing finish() if expired
  const syncLeft = useCallback(() => {
    if (!endMsRef.current) return;
    const remaining = Math.round((endMsRef.current - Date.now()) / 1000);
    if (remaining <= 0) {
      finish();
    } else {
      setLeft(remaining);
    }
  }, [finish]);

  // Interval: tick every 500ms so we're never more than half a second off after
  // returning from background
  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(syncLeft, 500);
    return () => clearInterval(intervalRef.current);
  }, [running, syncLeft]);

  // Page Visibility API: when the tab/app comes back to the foreground,
  // immediately recalculate rather than waiting for the next interval tick
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible" && running) syncLeft();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [running, syncLeft]);

  const startPreset = useCallback((seconds) => {
    clearInterval(intervalRef.current);
    const endMs = Date.now() + seconds * 1000;
    endMsRef.current = endMs;
    saveState(endMs, seconds);
    setTotal(seconds);
    setLeft(seconds);
    setRunning(true);
    setDone(false);
  }, []);

  const handleRingTap = useCallback(() => {
    if (done) {
      endMsRef.current = null;
      clearState();
      setDone(false);
      setLeft(total);
      setRunning(false);
    } else if (running) {
      clearInterval(intervalRef.current);
      endMsRef.current = null;
      clearState();
      setRunning(false);
    } else {
      // Resume from current left
      const endMs = Date.now() + left * 1000;
      endMsRef.current = endMs;
      saveState(endMs, total);
      setRunning(true);
    }
  }, [done, running, total, left]);

  // Clean up storage when the modal closes
  const handleClose = useCallback(() => {
    clearInterval(intervalRef.current);
    clearState();
    onClose();
  }, [onClose]);

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
    ? t("timer.tap_reset")
    : running
    ? t("timer.tap_pause")
    : left < total
    ? t("timer.tap_resume")
    : t("timer.tap_start");

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
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
          <div style={{ fontSize: 17, fontWeight: 700, color: C.text1 }}>{t("timer.title")}</div>
          <button
            onClick={handleClose}
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
                  ? "stroke-dasharray 0.45s linear, stroke 0.3s"
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
              {done ? t("timer.done") : timeLabel}
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
            transition: running ? "width 0.45s linear" : "none",
          }}/>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            width: "100%", padding: "14px 0",
            fontSize: 15, fontWeight: 600, borderRadius: 12,
            border: `1px solid ${C.border}`,
            background: C.surface2, color: C.text1,
            cursor: "pointer", fontFamily: FONT,
          }}
        >
          {t("timer.close")}
        </button>
      </div>
    </div>
  );
}
