import {
  createContext, useContext, useEffect, useMemo, useReducer, useRef,
  type Dispatch, type ReactNode,
} from "react";
import type {
  ActiveSession, DraftSet, Exercise, Feel, Plan, Settings, Unit, WorkoutLog, Lang, AccentKey, ThemeSetting,
} from "../types";
import { DEFAULT_PLAN_ID } from "../data/plans";
import { DEFAULT_MACHINE_NOTES } from "../data/coach";
import { getExercise } from "../data/exerciseResolver";
import {
  loadAll, saveLogs, saveSession, saveSettings, clearSession, clearAllData,
  requestPersistentStorage,
} from "./db";
import { migrateLegacyLocalStorage } from "./legacy";
import { buildExerciseIndex, type ExerciseIndex } from "./selectors";
import { defaultCycleSettings, normalizeCycleSettings, withPeriodStart } from "./cycle";
import { parseDayKey } from "../lib/dates";

// ── State ─────────────────────────────────────────────────────────────────────

export interface AppState {
  loaded: boolean;
  settings: Settings;
  logs: WorkoutLog[];
  session: ActiveSession | null;
  /** True when the session came from disk (app was killed mid-workout). */
  sessionRecovered: boolean;
}

export function defaultSettings(): Settings {
  const german = typeof navigator !== "undefined" && (navigator.language ?? "").toLowerCase().startsWith("de");
  return {
    unit: german ? "kg" : "lb",
    theme: "system",
    accent: "green",
    lang: german ? "de" : "en",
    activePlanId: DEFAULT_PLAN_ID,
    nextDayIdx: 0,
    machineNotes: { ...DEFAULT_MACHINE_NOTES },
    cycle: defaultCycleSettings(),
  };
}

const initialState: AppState = {
  loaded: false,
  settings: defaultSettings(),
  logs: [],
  session: null,
  sessionRecovered: false,
};

// ── Actions ───────────────────────────────────────────────────────────────────

export type Action =
  | { type: "hydrate"; settings: Settings; logs: WorkoutLog[]; session: ActiveSession | null }
  | { type: "settings"; patch: Partial<Settings> }
  | { type: "machineNote"; exerciseId: string; note: string }
  | { type: "logPeriodStart"; dateKey: string }
  | { type: "startSession"; session: ActiveSession }
  | { type: "updateSet"; exIdx: number; setIdx: number; patch: Partial<DraftSet> }
  | { type: "toggleSet"; exIdx: number; setIdx: number }
  | { type: "setFeel"; exIdx: number; feel: Feel | null }
  | { type: "toggleWarmup"; idx: number }
  | { type: "toggleCooldown"; idx: number }
  | { type: "swapExercise"; exIdx: number; exerciseId: string }
  | { type: "upsertPlan"; plan: Plan }
  | { type: "deletePlan"; planId: string }
  | { type: "upsertExercise"; exercise: Exercise }
  | { type: "deleteExercise"; exerciseId: string }
  | { type: "discardSession" }
  | { type: "finishSession"; log: WorkoutLog; nextDayIdx: number }
  | { type: "setLogs"; logs: WorkoutLog[] }
  | { type: "restore"; settings: Settings; logs: WorkoutLog[] }
  | { type: "resetAll" };

function mutateSession(
  state: AppState,
  fn: (s: ActiveSession) => ActiveSession
): AppState {
  if (!state.session) return state;
  return { ...state, session: fn(state.session), sessionRecovered: false };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "hydrate":
      return {
        loaded: true,
        settings: action.settings,
        logs: action.logs,
        // fill defaults so sessions saved by older builds stay loadable
        session: action.session
          ? {
              ...action.session,
              warmupDone: action.session.warmupDone ?? [],
              cooldownDone: action.session.cooldownDone ?? [],
            }
          : null,
        sessionRecovered: action.session !== null,
      };

    case "settings":
      return { ...state, settings: { ...state.settings, ...action.patch } };

    case "machineNote":
      return {
        ...state,
        settings: {
          ...state.settings,
          machineNotes: { ...state.settings.machineNotes, [action.exerciseId]: action.note },
        },
      };

    case "logPeriodStart": {
      const parsed = parseDayKey(action.dateKey);
      if (!parsed) return state;
      const cycle = state.settings.cycle ?? defaultCycleSettings();
      return {
        ...state,
        settings: { ...state.settings, cycle: withPeriodStart(cycle, parsed) },
      };
    }

    case "startSession":
      return { ...state, session: action.session, sessionRecovered: false };

    case "updateSet":
      return mutateSession(state, (s) => ({
        ...s,
        exercises: s.exercises.map((ex, ei) =>
          ei !== action.exIdx
            ? ex
            : { ...ex, sets: ex.sets.map((set, si) => (si !== action.setIdx ? set : { ...set, ...action.patch })) }
        ),
      }));

    case "toggleSet":
      return mutateSession(state, (s) => ({
        ...s,
        exercises: s.exercises.map((ex, ei) =>
          ei !== action.exIdx
            ? ex
            : { ...ex, sets: ex.sets.map((set, si) => (si !== action.setIdx ? set : { ...set, completed: !set.completed })) }
        ),
      }));

    case "setFeel":
      return mutateSession(state, (s) => ({
        ...s,
        exercises: s.exercises.map((ex, ei) => (ei !== action.exIdx ? ex : { ...ex, feel: action.feel })),
      }));

    case "toggleWarmup":
      return mutateSession(state, (s) => ({
        ...s,
        warmupDone: s.warmupDone.includes(action.idx)
          ? s.warmupDone.filter((i) => i !== action.idx)
          : [...s.warmupDone, action.idx],
      }));

    case "toggleCooldown":
      return mutateSession(state, (s) => ({
        ...s,
        cooldownDone: s.cooldownDone.includes(action.idx)
          ? s.cooldownDone.filter((i) => i !== action.idx)
          : [...s.cooldownDone, action.idx],
      }));

    case "swapExercise": {
      const ex = getExercise(action.exerciseId, state.settings);
      if (!ex) return state;
      return mutateSession(state, (s) => ({
        ...s,
        exercises: s.exercises.map((e, ei) =>
          ei !== action.exIdx
            ? e
            : {
                ...e,
                exerciseId: action.exerciseId,
                restSecs: ex.restSecs,
                feel: null,
                sets: e.sets.map(() => ({ weightKg: null, reps: null, completed: false })),
              }
        ),
      }));
    }

    case "upsertPlan": {
      const existing = state.settings.customPlans ?? [];
      const has = existing.some((p) => p.id === action.plan.id);
      const customPlans = has
        ? existing.map((p) => (p.id === action.plan.id ? action.plan : p))
        : [...existing, action.plan];
      return { ...state, settings: { ...state.settings, customPlans } };
    }

    case "deletePlan": {
      const customPlans = (state.settings.customPlans ?? []).filter((p) => p.id !== action.planId);
      // If the deleted plan was active, fall back to the default so nothing
      // resolves the active id to an undefined plan.
      const wasActive = state.settings.activePlanId === action.planId;
      return {
        ...state,
        settings: {
          ...state.settings,
          customPlans,
          ...(wasActive ? { activePlanId: DEFAULT_PLAN_ID, nextDayIdx: 0 } : {}),
        },
      };
    }

    case "upsertExercise": {
      const existing = state.settings.customExercises ?? [];
      const has = existing.some((e) => e.id === action.exercise.id);
      const customExercises = has
        ? existing.map((e) => (e.id === action.exercise.id ? action.exercise : e))
        : [...existing, action.exercise];
      return { ...state, settings: { ...state.settings, customExercises } };
    }

    case "deleteExercise": {
      const customExercises = (state.settings.customExercises ?? []).filter(
        (e) => e.id !== action.exerciseId
      );
      return { ...state, settings: { ...state.settings, customExercises } };
    }

    case "discardSession":
      return { ...state, session: null, sessionRecovered: false };

    case "finishSession":
      return {
        ...state,
        session: null,
        sessionRecovered: false,
        logs: [...state.logs, action.log],
        settings: { ...state.settings, nextDayIdx: action.nextDayIdx },
      };

    case "setLogs":
      return { ...state, logs: action.logs };

    case "restore":
      return { ...state, settings: action.settings, logs: action.logs, session: null, sessionRecovered: false };

    case "resetAll":
      return { ...initialState, loaded: true, settings: defaultSettings() };

    default:
      return state;
  }
}

// ── Context / provider ────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<Action>;
  /** Memoized per-exercise session index — the single derived source. */
  index: ExerciseIndex;
}

const AppContext = createContext<AppContextValue | null>(null);

const LEGACY_LS_KEY = "wt-v2";

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hydrate once from IndexedDB, migrating the old app's localStorage
  // blob on first launch if IndexedDB is still empty.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await loadAll();
      // Merge over defaults so installs from before a field existed gain it
      // (e.g. `cycle`); then normalize the cycle object defensively.
      let settings: Settings = data.settings
        ? { ...defaultSettings(), ...data.settings, cycle: normalizeCycleSettings(data.settings.cycle) }
        : defaultSettings();
      let logs = data.logs ?? [];

      if (!data.settings && !data.logs) {
        try {
          const legacy = migrateLegacyLocalStorage(localStorage.getItem(LEGACY_LS_KEY));
          if (legacy && legacy.logs.length > 0) {
            logs = legacy.logs;
            settings = {
              ...settings,
              ...(legacy.settings.unit ? { unit: legacy.settings.unit as Unit } : {}),
              ...(legacy.settings.theme ? { theme: legacy.settings.theme as ThemeSetting } : {}),
              ...(legacy.settings.accent ? { accent: legacy.settings.accent as AccentKey } : {}),
              ...(legacy.settings.lang ? { lang: legacy.settings.lang as Lang } : {}),
              ...(legacy.settings.activePlanId ? { activePlanId: legacy.settings.activePlanId } : {}),
              ...(legacy.settings.nextDayIdx !== undefined ? { nextDayIdx: legacy.settings.nextDayIdx } : {}),
            };
            await Promise.all([saveLogs(logs), saveSettings(settings)]);
          }
        } catch {
          // legacy data unreadable — start fresh rather than block the app
        }
      }

      if (!cancelled) {
        dispatch({ type: "hydrate", settings, logs, session: data.session ?? null });
        requestPersistentStorage();
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Persist slices when they change (after hydration).
  const hydrated = state.loaded;
  useEffect(() => {
    if (hydrated) void saveSettings(state.settings);
  }, [hydrated, state.settings]);

  useEffect(() => {
    if (hydrated) void saveLogs(state.logs);
  }, [hydrated, state.logs]);

  // Active session: debounce writes (fires on every keystroke otherwise).
  const sessionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!hydrated) return;
    if (sessionTimer.current) clearTimeout(sessionTimer.current);
    if (state.session === null) {
      void clearSession();
      return;
    }
    const snapshot = state.session;
    sessionTimer.current = setTimeout(() => void saveSession(snapshot), 300);
    return () => {
      if (sessionTimer.current) clearTimeout(sessionTimer.current);
    };
  }, [hydrated, state.session]);

  const index = useMemo(() => buildExerciseIndex(state.logs), [state.logs]);

  const value = useMemo(() => ({ state, dispatch, index }), [state, index]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp outside AppStateProvider");
  return ctx;
}

export async function wipeAllData(): Promise<void> {
  await clearAllData();
  try {
    localStorage.removeItem(LEGACY_LS_KEY);
  } catch {
    // localStorage unavailable — nothing to clean
  }
}
