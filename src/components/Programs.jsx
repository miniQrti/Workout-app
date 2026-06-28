import React, { useState, useMemo } from "react";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:          "#F5F5F0",
  surface:     "#FFFFFF",
  green:       "#16A97C",
  greenDark:   "#0D7A59",
  greenLight:  "#E8F8F2",
  orange:      "#F97316",
  orangeLight: "#FFF4ED",
  text1:       "#111111",
  text2:       "#6B7280",
  text3:       "#9CA3AF",
  border:      "rgba(0,0,0,0.07)",
  red:         "#EF4444",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const DIFFICULTY_COLORS = {
  Beginner:     { bg: "#E8F8F2", color: "#16A97C" },
  Intermediate: { bg: "#FFF4ED", color: "#F97316" },
  Advanced:     { bg: "#FEE2E2", color: "#EF4444" },
};

function difficultyStyle(difficulty) {
  return DIFFICULTY_COLORS[difficulty] || { bg: C.bg, color: C.text2 };
}

const MUSCLE_FILTERS = ["All", "Chest", "Back", "Shoulders", "Arms", "Legs", "Core", "Cardio"];

// Map display label → exercises primaryMuscle value
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

// ── Badge ─────────────────────────────────────────────────────────────────────

function Badge({ label, bg, color, small }) {
  return (
    <span style={{
      display: "inline-block",
      padding: small ? "2px 8px" : "3px 10px",
      borderRadius: 20,
      fontSize: small ? 11 : 12,
      fontWeight: 600,
      background: bg || C.bg,
      color:      color || C.text2,
      whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}

// ── Plan card ─────────────────────────────────────────────────────────────────

function PlanCard({ plan, isActive, onSwitch }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const dc = difficultyStyle(plan.difficulty);

  return (
    <div style={{
      background: C.surface,
      border: isActive ? `2px solid ${C.green}` : `1px solid ${C.border}`,
      borderRadius: 16,
      padding: "16px",
      marginBottom: 12,
      position: "relative",
    }}>
      {/* Active badge */}
      {isActive && (
        <div style={{
          position: "absolute", top: 14, right: 14,
          padding: "3px 10px", borderRadius: 20,
          background: C.green, color: "#fff",
          fontSize: 11, fontWeight: 700,
          letterSpacing: "0.03em",
        }}>
          ACTIVE
        </div>
      )}

      {/* Header */}
      <div style={{
        paddingRight: isActive ? 68 : 0,
        marginBottom: 8,
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text1, marginBottom: 4 }}>
          {plan.name}
        </div>
        <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.4 }}>
          {plan.tagline}
        </div>
      </div>

      {/* Meta row */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <Badge label={plan.difficulty} bg={dc.bg} color={dc.color} />
        <Badge label={`${plan.daysPerWeek}×/week`} />
        <Badge label={`~${plan.estimatedMins} min`} />
      </div>

      {/* Day rotation (active plan only) */}
      {isActive && plan.days.length > 1 && (
        <div style={{
          background: C.greenLight, borderRadius: 10,
          padding: "10px 12px", marginBottom: 12,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.green,
            textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
            Day Rotation
          </div>
          <div style={{ fontSize: 12, color: C.greenDark, lineHeight: 1.6 }}>
            {plan.days.map((d, i) => (
              <span key={d.id}>
                {i > 0 && <span style={{ opacity: 0.5 }}> → </span>}
                {`Day ${i + 1}: ${d.name}`}
              </span>
            ))}
          </div>
        </div>
      )}
      {isActive && plan.days.length === 1 && (
        <div style={{
          background: C.greenLight, borderRadius: 10,
          padding: "10px 12px", marginBottom: 12,
        }}>
          <div style={{ fontSize: 12, color: C.greenDark }}>
            {plan.days[0].exercises.length} exercises · repeated each session
          </div>
        </div>
      )}

      {/* Switch button (non-active plans) */}
      {!isActive && !confirmOpen && (
        <button
          onClick={() => setConfirmOpen(true)}
          style={{
            width: "100%", padding: "11px 0",
            borderRadius: 10, cursor: "pointer",
            fontSize: 14, fontWeight: 600,
            background: C.bg, color: C.text1,
            border: `1px solid ${C.border}`,
          }}
        >
          Switch to this plan
        </button>
      )}

      {/* Confirmation */}
      {!isActive && confirmOpen && (
        <div style={{
          background: C.bg, borderRadius: 10,
          padding: "12px", border: `1px solid ${C.border}`,
        }}>
          <div style={{ fontSize: 13, color: C.text2, marginBottom: 10, lineHeight: 1.5 }}>
            Switch to <strong>{plan.name}</strong>? Your progress tracking will continue.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setConfirmOpen(false)}
              style={{
                flex: 1, padding: "9px 0", borderRadius: 8,
                background: "none", border: `1px solid ${C.border}`,
                color: C.text2, fontSize: 13, fontWeight: 500, cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => { setConfirmOpen(false); onSwitch(plan.id); }}
              style={{
                flex: 1, padding: "9px 0", borderRadius: 8,
                background: C.green, border: "none",
                color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
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

// ── Exercise card ─────────────────────────────────────────────────────────────

function ExerciseCard({ exercise }) {
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
          gap: 10,
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
        <div style={{
          borderTop: `1px solid ${C.border}`,
          padding: "12px 16px 14px",
        }}>
          {/* Tip */}
          {exercise.tip && (
            <div style={{
              fontSize: 13, color: C.text2, lineHeight: 1.6,
              marginBottom: 12,
            }}>
              {exercise.tip}
            </div>
          )}

          {/* Muscles */}
          {exercise.muscles?.length > 0 && (
            <div>
              <div style={{
                fontSize: 11, fontWeight: 600, color: C.text3,
                textTransform: "uppercase", letterSpacing: "0.06em",
                marginBottom: 6,
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

          {/* Default reps / rest */}
          <div style={{
            display: "flex", gap: 16, marginTop: 10,
            fontSize: 12, color: C.text2,
          }}>
            <span>
              <strong>{exercise.defaultSets}</strong> sets ×{" "}
              <strong>{exercise.defaultReps}</strong>
              {exercise.isTime ? "s" : " reps"}
            </span>
            {exercise.restSecs > 0 && (
              <span>
                <strong>{exercise.restSecs}s</strong> rest
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function Programs({ store, plans, exercises, onSelectPlan, onUpdateStore }) {
  const [tab,          setTab]    = useState("plans");   // "plans" | "exercises"
  const [search,       setSearch] = useState("");
  const [muscleFilter, setMuscle] = useState("All");

  const activePlanId = store.activePlanId;

  // Filtered exercises list
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
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
      paddingBottom: "calc(72px + env(safe-area-inset-bottom))",
    }}>

      {/* ── Sticky header + tabs ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: C.surface,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ padding: "16px 16px 0" }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.text1, marginBottom: 14 }}>
            Programs
          </div>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 0 }}>
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
                }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Plans tab ── */}
      {tab === "plans" && (
        <div style={{ padding: "16px 16px 0" }}>
          {Object.values(plans).map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isActive={plan.id === activePlanId}
              onSwitch={planId => {
                onSelectPlan(planId);
                onUpdateStore({ activePlanId: planId, nextDayIdx: 0 });
              }}
            />
          ))}
        </div>
      )}

      {/* ── Exercises tab ── */}
      {tab === "exercises" && (
        <div style={{ padding: "16px 16px 0" }}>

          {/* Search */}
          <div style={{
            position: "relative", marginBottom: 12,
          }}>
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
                fontFamily: "inherit", outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Muscle filter chips (horizontally scrollable) */}
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
                  flexShrink: 0, padding: "7px 14px", borderRadius: 20,
                  fontSize: 13, fontWeight: muscleFilter === f ? 600 : 500,
                  cursor: "pointer",
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

          {/* Count */}
          <div style={{
            fontSize: 12, color: C.text3, marginBottom: 10, fontWeight: 500,
          }}>
            {filteredExercises.length} exercise{filteredExercises.length !== 1 ? "s" : ""}
          </div>

          {/* Exercise list */}
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
