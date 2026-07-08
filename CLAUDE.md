# Ironlog — Project Context

## What this is
A local-first gym workout tracker PWA for iPhone (v2, complete rewrite of the
original "Kurt's Workout Tracker"). React + TypeScript, no backend — all data
lives on-device in IndexedDB. Deployed to GitHub Pages.

## Tech stack
- **React 18 + Vite 5 + TypeScript** (strict, `noUncheckedIndexedAccess`)
- **Vitest** — unit tests for every pure module (`npm test`)
- **idb-keyval** — IndexedDB persistence
- **vite-plugin-pwa** — service worker, manifest (icons are committed in `public/`, no generation step)
- **CSS custom properties** (`src/ui/theme.css`) — light/dark/system theme, 4 accent colors

## Canonical rules (do not break these)
1. **Weights are stored in kg as numbers, always.** Display converts via
   `lib/units.ts` (`displayWeight`, `parseWeightInput`). The `unit` setting is
   a display preference, not a data property.
2. **Logs are append-only.** Everything else (PRs, e1RM, volume, streaks) is
   derived — via `buildExerciseIndex` (memoized in `appState.tsx`) and the
   pure functions in `store/selectors|progression|analytics.ts`.
3. **The active session is persisted** to IndexedDB on every change
   (debounced 300 ms) and recovered on relaunch. Never keep workout progress
   only in React state.
4. **Backups are versioned JSON** (`store/backup.ts`, `SCHEMA_VERSION`).
   CSV is a convenience export only. Schema changes need a migration in
   `parseBackup`.
5. **Translatable strings live in `src/i18n/{en,de}.ts`**; plurals use
   `Intl.PluralRules` (`key.one` / `key.other`). Data-file content uses
   `LocalizedText` (`{ en, de? }`) resolved by `localize()`.
6. **Timers are timestamp-based** (`endsAt` epoch), never interval counters —
   they must survive iOS backgrounding.

## Architecture
```
src/
  types.ts              — the whole data model (read this first)
  lib/                  — units (kg↔lb), dates (local-time week math), id
  i18n/                 — makeT with plural rules; en.ts / de.ts dictionaries
  data/
    exercises.ts        — built-in exercise catalogue (v1 port + popular staples)
    plans.ts            — 10 training plans (generated port from v1)
    muscles.ts          — muscle → group mapping, localized labels
    coach.ts            — progression jumps (per-unit!), overrides, substitutions,
                          seeded machine notes
  store/
    db.ts               — idb-keyval keys: settings / logs / session
    appState.tsx        — reducer + provider; hydration, legacy localStorage
                          migration ("wt-v2"), autosave effects
    selectors.ts        — exercise index, PRs, e1RM (Epley), detectNewPRs
    progression.ts      — feel-based engine (deload/completion/rep/fatigue gates)
    analytics.ts        — tonnage, weekly series, muscle-group sets, calendar,
                          consistency stats
    backup.ts           — versioned JSON backup + CSV export + share sheet
    legacy.ts           — old-app CSV import + localStorage migration + dedupe merge
  ui/                   — theme.css (all tokens/components), kit.tsx, icons.tsx
  components/charts.tsx — LineChart, WeeklyBars, Heatmap
  pages/                — Home, Workout, Progress, Programs, Settings
  App.tsx               — routing, theme application, session start/finish
```

## Commands
```bash
npm install        # clean install, no native deps
npm run dev        # http://localhost:5173/workout-app/
npm test           # vitest (44 tests)
npm run typecheck  # tsc --noEmit (also part of build)
npm run build      # typecheck + vite build → dist/
```

## Repo / deploy
- Owner `miniqrti`, repo `workout-app`
- Branch: `claude/workout-app-professional-0p0q7e`
- CI: `.github/workflows/deploy.yml` — test + typecheck job gates the Pages deploy
- Deploy target: `https://miniqrti.github.io/workout-app/`

## Data import paths (one-time, for the owner's history)
1. **Automatic**: on first launch, if IndexedDB is empty and the old app's
   localStorage blob (`wt-v2`) exists, it is migrated in place (lbs→kg).
2. **CSV**: Settings → "Import from old app (CSV)" accepts the previous
   version's export format; duplicates (same day + day name) are skipped.
3. **JSON restore**: Settings → "Restore from backup" for `ironlog-backup-*.json`.
