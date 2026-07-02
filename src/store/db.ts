import { get, set, del, clear } from "idb-keyval";
import type { ActiveSession, Settings, WorkoutLog } from "../types";

// IndexedDB persistence. Three independent keys so a huge log array is not
// rewritten on every settings toggle, and the active session can be saved
// on every set without touching history.

const K = {
  settings: "ironlog:settings",
  logs: "ironlog:logs",
  session: "ironlog:session",
} as const;

export interface PersistedData {
  settings: Settings | undefined;
  logs: WorkoutLog[] | undefined;
  session: ActiveSession | undefined;
}

export async function loadAll(): Promise<PersistedData> {
  const [settings, logs, session] = await Promise.all([
    get<Settings>(K.settings),
    get<WorkoutLog[]>(K.logs),
    get<ActiveSession>(K.session),
  ]);
  return { settings, logs, session };
}

export const saveSettings = (s: Settings) => set(K.settings, s);
export const saveLogs = (l: WorkoutLog[]) => set(K.logs, l);
export const saveSession = (s: ActiveSession) => set(K.session, s);
export const clearSession = () => del(K.session);
export const clearAllData = () => clear();

/**
 * Ask the browser to protect this origin's storage from eviction.
 * Best-effort — iOS grants it to installed PWAs.
 */
export function requestPersistentStorage(): void {
  try {
    navigator.storage?.persist?.().catch(() => {});
  } catch {
    // not supported — fine
  }
}
