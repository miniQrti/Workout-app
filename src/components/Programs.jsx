import React, { useState, useMemo } from "react";
import { useTheme, FONT } from "../theme.js";

const DIFFICULTY_COLORS_STATIC = {
  Intermediate: { bg: "#FFF4ED", color: "#F97316" },
  Advanced:     { bg: "#FEE2E2", color: "#EF4444" },
};

function useDifficultyStyle(difficulty) {
  const C = useTheme();
  if (difficulty === "Beginner") return { bg: C.greenLight, color: C.green };
  return DIFFICULTY_COLORS_STATIC[difficulty] || { bg: C.surface2, color: C.text2 };
}

const MUSCLE_FILTERS = ["All", "Chest", "Back", "Shoulders", "Arms", "Legs", "Core", "Cardio"];

const MUSCLE_MAP = {
  All:       null,
  Chest:     "chest",
  Back:      "back",
  Shoulders: "shoulders",
  Arms:      ["biceps", "triceps"],
  Legs:      "legs",
  Core:      "core",
  Cardio:    "cardio",
};

function matchesMuscle(exercise, filter) {
  if (!filter) return true;
  if (Array.isArray(filter)) return filter.includes(exercise.primaryMuscle);
  return exercise.primaryMuscle === filter;
}

const GOAL_FILTERS = ["All", "Strength", "Hypertrophy", "Functional & Longevity", "Time-Efficient", "Weight Loss"];

const GOAL_MAP = {
  All:                      null,
  Strength:                 "strength",
  Hypertrophy:              "hypertrophy",
  "Functional & Longevity": "functional-longevity",
  "Time-Efficient":         "time-efficient",
  "Weight Loss":            "weight-loss",
};

function rotationEntryLabel(entry, plan) {
  if (entry.type === "rest") return "Rest";
  if (entry.type === "cardio") return "Cardio";
  const day = plan.days.find(d => d.id === entry.dayId);
  return day ? day.name : entry.dayId;
}

function demoUrl(name) {
  return "https://www.youtube.com/results?search_query=" +
    encodeURIComponent(name + " exercise how to gym");
}

// ── Badge ──────────────────────────────────────────────────────────────────────

function Badge({ label, bg, color, small }) {
  const C = useTheme();
  return (
    <span style={{
      display: "inline-block",
      padding: small ? "2px 8px" : "3px 10px",
      borderRadius: 20,
      fontSize: small ? 11 : 12,
      fontWeight: 600,
      background: bg || C.surface2,
      color:      color || C.text2,
      whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}

// ── Plan card ─────────────────────────────────────────────────────────────────

function PlanCard({ plan, isActive, onSwitch, exercises }) {
  const C = useTheme();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const dc = useDifficultyStyle(plan.difficulty);

  return (
    <div style={{
      background: C.surface,
      border: isActive ? `2px solid ${C.green}` : `1px solid ${C.border}`,
      borderRadius: 16,
      padding: "16px",
      marginBottom: 12,
      position: "relative",
    }}>
      {isActive && (
        <div style={{
          position: "absolute", top: 14, right: 14,
          padding: "3px 10px", borderRadius: 20,
          background: C.green, color: "#fff",
          fontSize: 11, fontWeight: 700, letterSpacing: "0.03em",
        }}>
          ACTIVE
        </div>
      )}

      <div style={{ paddingRight: isActive ? 68 : 0, marginBottom: 8 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text1, marginBottom: 4 }}>
          {plan.name}
        </div>
        <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.4 }}>
          {plan.tagline}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <Badge label={plan.difficulty} bg={dc.bg} color={dc.color} />
        <Badge label={`${plan.daysPerWeek}×/week`} />
        <Badge label={`~${plan.estimatedMins} min`} />
      </div>

      <button
        onClick={() => setPreviewOpen(p => !p)}
        style={{
          width: "100%", padding: "10px 0", marginBottom: 12,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          borderRadius: 10, cursor: "pointer",
          fontSize: 13, fontWeight: 600, fontFamily: FONT,
          background: "none", color: C.green,
          border: `1px solid ${C.green}`,
        }}
      >
        {previewOpen ? "Hide preview" : "Preview workouts"}
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none"
          stroke={C.green} strokeWidth="2" strokeLinecap="round">
          <path d={previewOpen ? "M4 10l4-4 4 4" : "M4 6l4 4 4-4"} />
        </svg>
      </button>

      {previewOpen && (
        <div style={{ marginBottom: 12 }}>
          {plan.schedule?.rotation?.length > 0 && (
            <div style={{
              background: C.greenLight, borderRadius: 10,
              padding: "10px 12px", marginBottom: 10,
            }}>
              <div style={{
                fontSize: 11, fontWeight: 600, color: C.green,
                textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6,
              }}>
                Planned Order · {plan.schedule.cycleLength}-day cycle
              </div>
              <div style={{ fontSize: 12, color: C.greenDark, lineHeight: 1.6 }}>
                {plan.schedule.rotation.map((entry, i) => (
                  <span key={i}>
                    {i > 0 && <span style={{ opacity: 0.5 }}> → </span>}
                    {rotationEntryLabel(entry, plan)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {plan.days.map(day => (
            <div key={day.id} style={{
              background: C.surface2, borderRadius: 10,
              padding: "10px 12px", marginBottom: 8,
              border: `1px solid ${C.border}`,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text1, marginBottom: 6 }}>
                {day.name}
              </div>

              {day.warmup?.length > 0 && (
                <div style={{ fontSize: 11, color: C.text3, marginBottom: 8, lineHeight: 1.5 }}>
                  Warm-up: {day.warmup.map(w => w.name).join(", ")}
                </div>
              )}

              {day.exercises.map((ex, i) => {
                const meta = exercises?.[ex.exId];
                const name = meta?.name || ex.exId;
                return (
                  <div key={`${ex.exId}-${i}`} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8,
                    fontSize: 12.5, color: C.text2, padding: "5px 0",
                    borderTop: i > 0 ? `1px solid ${C.border}` : "none",
                  }}>
                    <a
                      href={demoUrl(name)}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: C.text1, textDecoration: "none", display: "flex",
                        alignItems: "center", gap: 4, flexShrink: 1, minWidth: 0,
                      }}
                    >
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {name}
                      </span>
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none"
                        stroke={C.text3} strokeWidth="1.8" strokeLinecap="round" style={{ flexShrink: 0 }}>
                        <path d="M5 2H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V7"/>
                        <path d="M8 1h3v3M11 1L6 6"/>
                      </svg>
                    </a>
                    <span style={{ flexShrink: 0, whiteSpace: "nowrap" }}>
                      {ex.sets}×{ex.reps}{meta?.isTime ? "s" : ""} · {ex.restSecs}s rest
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {!isActive && !confirmOpen && (
        <button
          onClick={() => setConfirmOpen(true)}
          style={{
            width: "100%", padding: "12px 0",
            borderRadius: 10, cursor: "pointer",
            fontSize: 14, fontWeight: 600, fontFamily: FONT,
            background: C.surface2, color: C.text1,
            border: `1px solid ${C.border}`,
          }}
        >
          Switch to this plan
        </button>
      )}

      {!isActive && confirmOpen && (
        <div style={{
          background: C.surface2, borderRadius: 10,
          padding: "12px", border: `1px solid ${C.border}`,
        }}>
          <div style={{ fontSize: 13, color: C.text2, marginBottom: 10, lineHeight: 1.5 }}>
            Switch to <strong style={{ color: C.text1 }}>{plan.name}</strong>? Your progress tracking will continue.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setConfirmOpen(false)}
              style={{
                flex: 1, padding: "10px 0", borderRadius: 8,
                background: "none", border: `1px solid ${C.border}`,
                color: C.text2, fontSize: 13, fontWeight: 500, cursor: "pointer",
                fontFamily: FONT,
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => { setConfirmOpen(false); onSwitch(plan.id); }}
              style={{
                flex: 1, padding: "10px 0", borderRadius: 8,
                background: C.green, border: "none",
                color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
                fontFamily: FONT,
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Exercise card ──────────────────────────────────────────────────────────────

function ExerciseCard({ exercise }) {
  const C = useTheme();
  const [expanded, setExpanded] = useState(false);
  const muscleLabel = exercise.primaryMuscle.charAt(0).toUpperCase() +
    exercise.primaryMuscle.slice(1);

  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 14, overflow: "hidden", marginBottom: 8,
    }}>
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: "100%", padding: "14px 16px",
          display: "flex", alignItems: "flex-start",
          justifyContent: "space-between",
          background: "none", border: "none", cursor: "pointer", textAlign: "left",
          gap: 10, fontFamily: FONT,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 14, fontWeight: 600, color: C.text1,
            marginBottom: 5, lineHeight: 1.3,
          }}>
            {exercise.name}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Badge label={muscleLabel} />
            {exercise.equipment && (
              <Badge
                label={exercise.equipment.charAt(0).toUpperCase() + exercise.equipment.slice(1)}
                small
              />
            )}
            {exercise.isTime && <Badge label="Timed" small bg="#EEF2FF" color="#4F46E5" />}
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
          stroke={C.text3} strokeWidth="2" strokeLinecap="round"
          style={{ flexShrink: 0, marginTop: 2 }}>
          <path d={expanded ? "M4 10l4-4 4 4" : "M4 6l4 4 4-4"} />
        </svg>
      </button>

      {expanded && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "12px 16px 14px" }}>
          {exercise.tip && (
            <div style={{
              fontSize: 13, color: C.text2, lineHeight: 1.6, marginBottom: 12,
            }}>
              {exercise.tip}
            </div>
          )}

          {exercise.muscles?.length > 0 && (
            <div>
              <div style={{
                fontSize: 11, fontWeight: 600, color: C.text3,
                textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6,
              }}>
                Muscles Worked
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {exercise.muscles.map(m => (
                  <Badge
                    key={m}
                    label={m.charAt(0).toUpperCase() + m.slice(1)}
                    small
                    bg={C.greenLight}
                    color={C.green}
                  />
                ))}
              </div>
            </div>
          )}

          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            gap: 16, marginTop: 10, fontSize: 12, color: C.text2,
          }}>
            <div style={{ display: "flex", gap: 16 }}>
              <span>
                <strong>{exercise.defaultSets}</strong> sets ×{" "}
                <strong>{exercise.defaultReps}</strong>
                {exercise.isTime ? "s" : " reps"}
              </span>
              {exercise.restSecs > 0 && (
                <span><strong>{exercise.restSecs}s</strong> rest</span>
              )}
            </div>
            <a
              href={demoUrl(exercise.name)}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: 4,
                color: C.green, fontSize: 12, fontWeight: 600,
                textDecoration: "none", flexShrink: 0,
              }}
            >
              Watch demo
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"
                stroke={C.green} strokeWidth="1.8" strokeLinecap="round">
                <path d="M5 2H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V7"/>
                <path d="M8 1h3v3M11 1L6 6"/>
              </svg>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Programs({ store, plans, exercises, onSelectPlan, onUpdateStore, onOpenMenu }) {
  const C = useTheme();
  const [tab,          setTab]    = useState("plans");
  const [search,       setSearch] = useState("");
  const [muscleFilter, setMuscle] = useState("All");
  const [goalFilter,   setGoal]   = useState("All");

  const activePlanId = store.activePlanId;

  const filteredPlans = useMemo(() => {
    const goal = GOAL_MAP[goalFilter];
    return Object.values(plans).filter(p => !goal || p.goal === goal);
  }, [plans, goalFilter]);

  const filteredExercises = useMemo(() => {
    const q      = search.toLowerCase().trim();
    const muscle = MUSCLE_MAP[muscleFilter];
    return Object.values(exercises).filter(ex => {
      if (q && !ex.name.toLowerCase().includes(q)) return false;
      if (!matchesMuscle(ex, muscle)) return false;
      return true;
    });
  }, [exercises, search, muscleFilter]);

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      fontFamily: FONT,
      paddingBottom: "calc(24px + env(safe-area-inset-bottom))",
    }}>

      {/* Sticky header + tabs */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: C.surface,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ padding: "14px 16px 0", paddingTop: "calc(14px + env(safe-area-inset-top))" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
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
            <div style={{ fontSize: 20, fontWeight: 700, color: C.text1 }}>
              Programs
            </div>
          </div>
          <div style={{ display: "flex" }}>
            {["plans", "exercises"].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1, padding: "10px 0",
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 14, fontWeight: tab === t ? 600 : 500,
                  color: tab === t ? C.green : C.text2,
                  borderBottom: tab === t ? `2px solid ${C.green}` : "2px solid transparent",
                  letterSpacing: "0.01em",
                  transition: "all 0.15s",
                  fontFamily: FONT,
                }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Plans tab */}
      {tab === "plans" && (
        <div style={{ padding: "16px 16px 0" }}>

          {/* Goal filter chips */}
          <div style={{
            display: "flex", gap: 8, overflowX: "auto",
            paddingBottom: 4, marginBottom: 14,
            scrollbarWidth: "none", WebkitOverflowScrolling: "touch",
          }}>
            {GOAL_FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setGoal(f)}
                style={{
                  flexShrink: 0, padding: "8px 14px", borderRadius: 20,
                  fontSize: 13, fontWeight: goalFilter === f ? 600 : 500,
                  cursor: "pointer", fontFamily: FONT,
                  background: goalFilter === f ? C.green : C.surface,
                  color:      goalFilter === f ? "#fff"  : C.text2,
                  border: goalFilter === f
                    ? `1.5px solid ${C.green}`
                    : `1px solid ${C.border}`,
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {filteredPlans.length === 0 ? (
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 14, padding: "20px", textAlign: "center",
              color: C.text2, fontSize: 13,
            }}>
              No plans match this category
            </div>
          ) : filteredPlans.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              exercises={exercises}
              isActive={plan.id === activePlanId}
              onSwitch={planId => {
                onSelectPlan(planId);
                onUpdateStore({ activePlanId: planId, nextDayIdx: 0 });
              }}
            />
          ))}
        </div>
      )}

      {/* Exercises tab */}
      {tab === "exercises" && (
        <div style={{ padding: "16px 16px 0" }}>

          {/* Search */}
          <div style={{ position: "relative", marginBottom: 12 }}>
            <div style={{
              position: "absolute", left: 12, top: "50%",
              transform: "translateY(-50%)", pointerEvents: "none",
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                stroke={C.text3} strokeWidth="2" strokeLinecap="round">
                <circle cx="7" cy="7" r="5" />
                <line x1="11" y1="11" x2="14" y2="14" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search exercises…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "11px 12px 11px 36px",
                borderRadius: 10, border: `1px solid ${C.border}`,
                background: C.surface, color: C.text1, fontSize: 14,
                fontFamily: FONT, outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          {/* Muscle filter chips */}
          <div style={{
            display: "flex", gap: 8, overflowX: "auto",
            paddingBottom: 4, marginBottom: 14,
            scrollbarWidth: "none", WebkitOverflowScrolling: "touch",
          }}>
            {MUSCLE_FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setMuscle(f)}
                style={{
                  flexShrink: 0, padding: "8px 14px", borderRadius: 20,
                  fontSize: 13, fontWeight: muscleFilter === f ? 600 : 500,
                  cursor: "pointer", fontFamily: FONT,
                  background: muscleFilter === f ? C.green : C.surface,
                  color:      muscleFilter === f ? "#fff"  : C.text2,
                  border: muscleFilter === f
                    ? `1.5px solid ${C.green}`
                    : `1px solid ${C.border}`,
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <div style={{ fontSize: 12, color: C.text3, marginBottom: 10, fontWeight: 500 }}>
            {filteredExercises.length} exercise{filteredExercises.length !== 1 ? "s" : ""}
          </div>

          {filteredExercises.length === 0 ? (
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 14, padding: "20px", textAlign: "center",
              color: C.text2, fontSize: 13,
            }}>
              No exercises match your search
            </div>
          ) : (
            filteredExercises.map(ex => (
              <ExerciseCard key={ex.id} exercise={ex} />
            ))
          )}

        </div>
      )}
    </div>
  );
}
