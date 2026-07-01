# Kurt's Workout Tracker — Project Context

## What this is
A personal gym workout tracker PWA (Progressive Web App) built for iPhone. It was originally a Claude chat artifact using `window.storage` — this repo converts it into a real deployable app that works in any iPhone browser and can be saved to the home screen.

## Tech stack
- **React 18** + **Vite 5** — build tooling
- **vite-plugin-pwa** — service worker, offline support, Web App Manifest
- **@vite-pwa/assets-generator** — generates PNG icons from `public/icon.svg` at build time
- **localStorage** — persistence (replaces Claude's proprietary `window.storage`)
- **Pure inline styles** — no CSS framework, matches original artifact style
- **GitHub Actions** → **GitHub Pages** — deployment pipeline

## Repo
- Owner: `miniqrti`
- Repo: `workout-app`
- Dev branch: `claude/review-fixes` (PR target: `claude/iphone-artifact-compat-bf42iz`)
- Feature branch: `claude/iphone-artifact-compat-bf42iz`
- Deploy target: `https://miniqrti.github.io/workout-app/`

## Current status
### Done
- [x] Full PWA setup (manifest, service worker, iOS meta tags, apple-touch-icon)
- [x] Day A (upper body), Day B (lower body), Day C (full body) workout plans
- [x] Exercise cards with set/rep logging, weight inputs, "how did it feel" ratings, notes
- [x] "Tap to fill" from last session weights
- [x] localStorage persistence with migration from old format
- [x] Clipboard copy ("Copy session for Claude") with iOS Safari fallback
- [x] Rest timer — 60s/90s/2:00/3:00 presets, animated SVG ring, vibration on done
- [x] Full session history — every "Save as last session" appends to per-exercise history array
- [x] PR detection — auto-flags sessions that beat all-time best weight
- [x] Progress charts — SVG line chart of best weight per session, PR dots in gold
- [x] History page — separate page with Day A/B/C tabs, all-time best, session log
- [x] PR badges — shown on ExCard and History page
- [x] Bottom nav — Workout / Rest Timer / History with SVG icons
- [x] GitHub Actions deploy workflow (`.github/workflows/deploy.yml`)

### Still needed (GitHub setup — must be done manually by owner)
- [ ] Make repo **public** in GitHub Settings → change visibility
- [ ] Enable **GitHub Pages** in Settings → Pages → Source → GitHub Actions
  → After these two steps, the app auto-deploys on every push

## Architecture

```
src/
  data.js        — All exercise data (DAYS, SEED, FEELS, FS), helpers (freshEx, prevLabel, allTimeBest)
  App.jsx        — Main app: state, navigation, save/load, export modal, bottom nav
  ExCard.jsx     — Single exercise card (accordion, set inputs, feel rating, notes)
  RestTimer.jsx  — Rest timer overlay (presets, animated ring, vibration)
  History.jsx    — History page (MiniChart SVG, ExerciseHistory, session log)
  main.jsx       — React entry point
  index.css      — Global resets + iOS input zoom fix (font-size: 16px)

public/
  icon.svg       — Source icon (dumbbell on green, used to generate PNG icons at build time)

.github/workflows/
  deploy.yml     — Install → generate icons → build → deploy to GitHub Pages
```

## Key data shape
History is stored per exercise as an array of sessions (newest last):
```js
store.history["a1"] = [
  { date: "Wk5",    sets: [{w:"90",r:"12"}, ...], pr: false },
  { date: "Jun 21", sets: [{w:"95",r:"12"}, ...], pr: true  },
]
```
Old single-object format `{date, sets}` is auto-migrated to array on load.

## How to run locally
```bash
npm install
npm run generate-icons   # generates PNG icons from public/icon.svg
npm run dev              # http://localhost:5173/workout-app/
```

## How to build & deploy
```bash
npm run build   # output in dist/
# push to claude/iphone-artifact-compat-bf42iz → GitHub Actions deploys automatically
```

## Workout program summary (Day A/B/C, 3x/week)
- **Day A** — Upper body + core: chest press, row, shoulder press, cable curls, tricep pushdown, lat pulldown, plank, ab crunch
- **Day B** — Lower body + core: leg press (4 sets), leg curl, leg extension, calf extension, lunges, rotary torso, hanging knee tuck
- **Day C** — Full body + core: lighter versions of A+B exercises, plank, rotary torso, cable crunch
- All days include warm-up, Zone 2 cardio (15–20 min), cool-down
- Machine settings are stored per exercise (seat positions, pad settings, etc.)

## What to work on next (suggestions)
- Workout duration timer (stopwatch from session start)
- Weekly schedule view / workout streak counter
- 1RM calculator (estimate from weight × reps)
- Push notification reminder ("Time to train")
- Export history as CSV

## iPhone "Add to Home Screen" instructions (for the README)
1. Open `https://miniqrti.github.io/workout-app/` in Safari
2. Tap the Share button (box with arrow)
3. Tap "Add to Home Screen"
4. App opens in standalone mode (no browser chrome)
