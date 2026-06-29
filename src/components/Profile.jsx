import React, { useState } from "react";
import { useTheme, FONT } from "../theme.js";
import { HISTORICAL_LOGS } from "../data/historicalLogs.js";

// ── Static profile data ───────────────────────────────────────────────────────

const MACHINE_SETTINGS = [
  { machine: "Chest Press",       setting: "Seat 3" },
  { machine: "Seated Row",        setting: "Chest pad 5 / Seat 5" },
  { machine: "Shoulder Press",    setting: "Seat 4" },
  { machine: "Lat Pulldown",      setting: "Wide overhand, just outside shoulder width" },
  { machine: "Leg Press",         setting: "Seat 4" },
  { machine: "Seated Leg Curl",   setting: "Left-close 3 / Left-far 2 / Top 4" },
  { machine: "Leg Extension",     setting: "Knee pad position 2" },
  { machine: "Calf Extension",    setting: "Seat 6" },
  { machine: "Rotary Torso",      setting: "Seat 3" },
];

const COACHING_NOTES = [
  {
    title: "Wrist on curls",
    body: "Bicep curl machine causes discomfort at ~120°. Use cable rope curls or one-arm cable curl. Try dumbbells next. Keep wrist neutral throughout.",
    tag: "⚠️ Injury",
  },
  {
    title: "Left ankle",
    body: "Keep treadmill incline at 1–2% max. Monitor during lunges and any unilateral work.",
    tag: "⚠️ Injury",
  },
  {
    title: "Lat Pulldown form",
    body: "Feeling it in biceps more than lats. Cue: drive elbows down toward back pockets, use loose/open grip, lean back 10–15°, pull to upper chest. Try neutral grip attachment.",
    tag: "Form",
  },
  {
    title: "Ab Crunch / Cable Crunch",
    body: "Only feeling upper abs. Cue: slow tempo, exhale hard at the bottom, think ribcage pulling toward hips rather than chin to chest.",
    tag: "Form",
  },
  {
    title: "Shoulder Press set 3",
    body: "Recurring drop-off on set 3. Hold at 55 lb / 12 reps until all 3 sets are clean before adding weight.",
    tag: "Progression",
  },
  {
    title: "Hanging Knee Tuck",
    body: "Frequently skipped — machine often taken. Alternatives in order: lying leg raises, reverse crunches, or hang from any pull-up bar.",
    tag: "Sub",
  },
];

const TARGETS = {
  "Day A": [
    { exercise: "Chest Press",         target: "95 lb" },
    { exercise: "Seated Row",          target: "95 lb" },
    { exercise: "Shoulder Press",      target: "55 lb — all 3 sets × 12" },
    { exercise: "Cable Curls (rope)",  target: "35 lb × 3 sets" },
    { exercise: "Tricep Pushdown",     target: "45 lb × 3 sets" },
    { exercise: "Lat Pulldown",        target: "90 lb — fix form (elbows down, loose grip)" },
    { exercise: "Plank",               target: "50s / 50s / 45s" },
    { exercise: "Ab Crunch Machine",   target: "70 lb × 15 × 3 sets" },
  ],
  "Day B": [
    { exercise: "Leg Press",           target: "210 lb × 4 sets" },
    { exercise: "Seated Leg Curl",     target: "85 lb (hold)" },
    { exercise: "Leg Extension",       target: "85 lb (hold)" },
    { exercise: "Calf Extension",      target: "110 lb" },
    { exercise: "Lunges",              target: "BW × 3 sets (hold)" },
    { exercise: "Rotary Torso",        target: "70 lb" },
    { exercise: "Hanging Knee Tuck",   target: "Do this first — sub lying leg raises if taken" },
  ],
  "Day C": [
    { exercise: "Chest Press",         target: "90 lb (hold)" },
    { exercise: "Seated Row",          target: "90 lb (hold)" },
    { exercise: "Leg Press",           target: "190 lb" },
    { exercise: "Shoulder Press",      target: "55 lb — hit 12 reps on set 3" },
    { exercise: "Lat Pulldown",        target: "90 lb — fix form" },
    { exercise: "Plank",               target: "55s × 3" },
    { exercise: "Rotary Torso",        target: "60 lb (one more session)" },
    { exercise: "Cable Crunch",        target: "65 lb × 15 reps" },
  ],
};

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({ title, children }) {
  const C = useTheme();
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 16, padding: "16px", marginBottom: 14,
    }}>
      <div style={{
        fontSize: 13, fontWeight: 700, color: C.text2,
        textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14,
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function CoachingNote({ note }) {
  const C = useTheme();
  const [open, setOpen] = useState(false);
  const tagColor = note.tag.startsWith("⚠️")
    ? { bg: "#FEF3C7", color: "#D97706" }
    : { bg: C.surface2, color: C.text2 };

  return (
    <div style={{
      border: `1px solid ${C.border}`, borderRadius: 12,
      overflow: "hidden", marginBottom: 8,
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", padding: "12px 14px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "none", border: "none", cursor: "pointer", textAlign: "left",
          gap: 10, fontFamily: FONT,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "2px 8px",
            borderRadius: 20, background: tagColor.bg, color: tagColor.color,
            whiteSpace: "nowrap",
          }}>
            {note.tag}
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.text1 }}>
            {note.title}
          </span>
        </div>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
          stroke={C.text3} strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
          <path d={open ? "M3 9l4-4 4 4" : "M3 5l4 4 4-4"} />
        </svg>
      </button>
      {open && (
        <div style={{
          padding: "0 14px 14px",
          fontSize: 13, color: C.text2, lineHeight: 1.6,
          borderTop: `1px solid ${C.border}`, paddingTop: 12,
        }}>
          {note.body}
        </div>
      )}
    </div>
  );
}

function TargetRow({ exercise, target, last }) {
  const C = useTheme();
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", justifyContent: "space-between",
      padding: "9px 0",
      borderBottom: last ? "none" : `1px solid ${C.border}`,
      gap: 12,
    }}>
      <div style={{ fontSize: 13, color: C.text1, fontWeight: 500, flex: 1 }}>
        {exercise}
      </div>
      <div style={{
        fontSize: 13, color: C.green, fontWeight: 600,
        textAlign: "right", maxWidth: "55%",
      }}>
        {target}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Profile({ store, onOpenMenu, onImportHistory }) {
  const C = useTheme();
  const [targetDay, setTargetDay] = useState("Day A");
  const alreadyImported = store.historicalImported;
  const logCount = (store.logs || []).length;

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      fontFamily: FONT,
      paddingBottom: "calc(24px + env(safe-area-inset-bottom))",
    }}>

      {/* Sticky header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: C.surface, borderBottom: `1px solid ${C.border}`,
        padding: "14px 16px 12px",
        paddingTop: "calc(14px + env(safe-area-inset-top))",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <button
          onClick={onOpenMenu}
          style={{
            width: 40, height: 40, borderRadius: "50%",
            background: C.surface2, border: `1px solid ${C.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0,
          }}
        >
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
            <path d="M0 1h18M0 7h18M0 13h18" stroke={C.text2} strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
        <div style={{ fontSize: 20, fontWeight: 700, color: C.text1 }}>Profile</div>
      </div>

      <div style={{ padding: "16px 16px 0" }}>

        {/* Athlete overview */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 16, padding: "18px 16px", marginBottom: 14,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: C.greenLight, border: `2px solid ${C.green}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, flexShrink: 0,
            }}>
              🏋️
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.text1 }}>Kurt</div>
              <div style={{ fontSize: 13, color: C.text2, marginTop: 2 }}>Planet Fitness · Week 7+</div>
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {[
              { label: "🎯 Fat Loss", bg: C.greenLight, color: C.green },
              { label: "3×/week", bg: C.surface2, color: C.text2 },
              { label: "~2 hrs/session", bg: C.surface2, color: C.text2 },
              { label: "Machines only", bg: C.surface2, color: C.text2 },
            ].map(pill => (
              <span key={pill.label} style={{
                padding: "4px 10px", borderRadius: 20, fontSize: 12,
                fontWeight: 600, background: pill.bg, color: pill.color,
              }}>
                {pill.label}
              </span>
            ))}
          </div>

          <div style={{
            marginTop: 14, padding: "10px 12px",
            background: C.bg, borderRadius: 10,
            fontSize: 12, color: C.text2, lineHeight: 1.6,
          }}>
            <strong style={{ color: C.text1 }}>Secondary goals:</strong> Core strength, 5K running (30+ min continuous)<br />
            <strong style={{ color: C.text1 }}>Off days:</strong> Self-managed running + 30 min daily walks<br />
            <strong style={{ color: C.text1 }}>Cardio finisher:</strong> 15–20 min Zone 2 (60–70% max HR) · treadmill incline 1–2% (ankle) or bike
          </div>
        </div>

        {/* Machine settings */}
        <Section title="Machine Settings">
          {MACHINE_SETTINGS.map((row, i) => (
            <div key={row.machine} style={{
              display: "flex", alignItems: "flex-start",
              justifyContent: "space-between",
              padding: "9px 0",
              borderBottom: i < MACHINE_SETTINGS.length - 1 ? `1px solid ${C.border}` : "none",
              gap: 12,
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text1, flexShrink: 0 }}>
                {row.machine}
              </div>
              <div style={{ fontSize: 13, color: C.text2, textAlign: "right" }}>
                {row.setting}
              </div>
            </div>
          ))}
        </Section>

        {/* Coaching notes */}
        <Section title="Coaching Notes">
          {COACHING_NOTES.map(note => (
            <CoachingNote key={note.title} note={note} />
          ))}
        </Section>

        {/* Next session targets */}
        <Section title="Next Session Targets">
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            {Object.keys(TARGETS).map(day => (
              <button
                key={day}
                onClick={() => setTargetDay(day)}
                style={{
                  flex: 1, padding: "9px 4px", borderRadius: 10, cursor: "pointer",
                  fontSize: 13, fontWeight: 600, fontFamily: FONT,
                  background: targetDay === day ? C.greenLight : C.surface2,
                  color:      targetDay === day ? C.green : C.text2,
                  border: targetDay === day ? `1.5px solid ${C.green}` : `1px solid ${C.border}`,
                  transition: "all 0.15s",
                }}
              >
                {day}
              </button>
            ))}
          </div>
          {TARGETS[targetDay].map((row, i) => (
            <TargetRow
              key={row.exercise}
              {...row}
              last={i === TARGETS[targetDay].length - 1}
            />
          ))}
        </Section>

        {/* Historical data import */}
        <Section title="Workout History">
          {alreadyImported ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: C.greenLight, border: `2px solid ${C.green}`,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8.5l3.5 3.5 6.5-7" stroke={C.green} strokeWidth="2.2"
                    strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text1 }}>
                  Historical data imported
                </div>
                <div style={{ fontSize: 12, color: C.text2, marginTop: 1 }}>
                  {HISTORICAL_LOGS.length} sessions from Weeks 1–7 · {logCount} total in app
                </div>
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 13, color: C.text2, marginBottom: 14, lineHeight: 1.6 }}>
                Import your 7 weeks of pre-app workout history ({HISTORICAL_LOGS.length} sessions) to populate your Progress charts and personal records.
              </div>
              <button
                onClick={onImportHistory}
                style={{
                  width: "100%", padding: "14px 0",
                  borderRadius: 12, border: "none",
                  background: C.green, color: "#fff",
                  fontSize: 15, fontWeight: 700, cursor: "pointer",
                  fontFamily: FONT,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v12M5 10l7 7 7-7"/><path d="M3 21h18"/>
                </svg>
                Import {HISTORICAL_LOGS.length} Sessions (Weeks 1–7)
              </button>
            </>
          )}
        </Section>

      </div>
    </div>
  );
}
