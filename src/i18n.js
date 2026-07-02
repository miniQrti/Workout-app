import { createContext, useContext } from "react";

// ── Translation dictionaries ──────────────────────────────────────────────────

const TRANSLATIONS = {
  en: {
    // Greetings / dates
    "greeting.morning":   "Good morning",
    "greeting.afternoon": "Good afternoon",
    "greeting.evening":   "Good evening",
    "date.today":         "Today",
    "date.yesterday":     "Yesterday",
    "date.locale":        "en-US",

    // Home
    "home.workout_in_progress": "Workout in progress",
    "home.pickup_where_left":   "Tap to pick up where you left off",
    "home.resume":              "Resume",
    "home.min_est":             "min est.",
    "home.more":                "+{n} more",
    "home.first_workout":       "Ready to start your first workout? Let's go!",
    "home.coaches_notes":       "Coach's Notes",
    "home.increases":           "increases",
    "home.pr_attempt":          "PR attempt",
    "home.deload":              "deload",
    "home.last":                "last",
    "home.no_history":          "no history yet — try the plan weight",
    "home.start_workout":       "Start Workout",
    "home.this_week":           "This Week",
    "home.workouts_1":          "1 workout",
    "home.workouts_n":          "{n} workouts",
    "home.total_workouts":      "Total Workouts",
    "home.day_streak":          "Day Streak",
    "home.records_set":         "Records Set",
    "home.recent_workouts":     "Recent Workouts",
    "home.no_workouts_yet":     "Your completed workouts will appear here",
    "home.switched_to":         "Switched to:",
    "home.reset":               "Reset ×",
    "home.switch_day":          "Switch to a different day",
    "home.choose_day":          "Choose workout day:",
    "home.scheduled":           "scheduled",
    "home.cancel":              "Cancel",
    "home.no_plan":             "No plan selected",
    "home.rest_day":            "Rest Day",
    "home.exercise_count_1":    "1 exercise",
    "home.exercise_count_n":    "{n} exercises",
    "home.exercises":           "exercises",
    "home.reps":                "reps",
    "home.coming_up":           "Coming up",
    "home.schedule_rest":       "Rest Day",
    "home.schedule_cardio":     "Cardio Day",
    "home.schedule_workout":    "Workout",

    // Menu / settings
    "menu.title":              "Menu",
    "menu.navigate":           "Navigate",
    "menu.weight_unit":        "Weight Unit",
    "menu.appearance":         "Appearance",
    "menu.light":              "Light",
    "menu.dark":               "Dark",
    "menu.accent_color":       "Accent Color",
    "menu.language":           "Language",
    "menu.data":               "Data",
    "menu.export_csv":         "Export Workout Log (CSV)",
    "menu.import_csv":         "Import from CSV",
    "menu.app":                "App",
    "menu.reload":             "Reload App",
    "menu.whats_new":          "What's New",
    "menu.close":              "Close",
    "menu.export_unavailable": "Export is available once you complete a workout",
    "menu.import_error":       "Could not read file. Make sure it's a CSV exported from this app.",
    "menu.import_none":        "No new sessions found",
    "menu.import_already_1":   "({n} already imported)",
    "menu.import_added_1":     "Imported 1 session",
    "menu.import_added_n":     "Imported {n} sessions",
    "menu.import_dupe_1":      "1 duplicate skipped",
    "menu.import_dupe_n":      "{n} duplicates skipped",

    // Navigation labels
    "nav.home":     "Home",
    "nav.progress": "Progress",
    "nav.programs": "Programs",
    "nav.timer":    "Rest Timer",
    "nav.profile":  "Profile",

    // Active workout
    "workout.active":           "Active Workout",
    "workout.finish":           "Finish",
    "workout.next_exercise":    "Next exercise →",
    "workout.finish_complete":  "Finish Workout ✓",
    "workout.finish_partial":   "Finish Workout ({done}/{total} sets)",
    "workout.discard_title":    "Discard workout?",
    "workout.discard_body_1":   "You have 1 set logged. Leaving now will discard all progress.",
    "workout.discard_body_n":   "You have {n} sets logged. Leaving now will discard all progress.",
    "workout.keep_going":       "Keep going",
    "workout.discard":          "Discard",
    "workout.incomplete_title": "Workout incomplete",
    "workout.sets_missing_1":   "1 set not logged yet",
    "workout.sets_missing_n":   "{n} sets not logged yet",
    "workout.feel_missing_1":   "1 exercise missing feel rating",
    "workout.feel_missing_n":   "{n} exercises missing feel rating",
    "workout.finish_anyway":    "Finish anyway",
    "workout.no_exercises":     "No exercises in this session.",
    "workout.sets_progress":    "{done}/{total} sets",
    "workout.all":              "All",

    // Exercise card
    "exercise.how_feel":     "How did it feel?",
    "exercise.set":          "Set",
    "exercise.prev":         "Prev",
    "exercise.weight":       "Weight",
    "exercise.reps":         "Reps",
    "exercise.seconds":      "Seconds",
    "exercise.rest":         "Rest",
    "exercise.done_count":   "{done}/{total} done",
    "exercise.reps_label":   "reps",
    "exercise.try_weight":   "Try {weight} {unit}",
    "exercise.try_reps":     "× {reps} reps",

    // Swap modal
    "swap.title":    "Swap exercise",
    "swap.subtitle": "Same muscle group as {name}",
    "swap.none":     "No alternative exercises found for this muscle group.",
    "swap.cancel":   "Cancel",

    // Feel options (value = stored key, display = translated)
    "feel.Easy":  "Easy",
    "feel.Good":  "Good",
    "feel.Hard":  "Hard",
    "feel.Tough": "Tough",

    // Rest banner (inline in workout)
    "rest.tap_start": "Tap to start",
    "rest.resting":   "Resting",
    "rest.done":      "Rest complete — go!",
    "rest.skip":      "Skip",

    // Rest timer overlay
    "timer.title":      "Rest Timer",
    "timer.close":      "Close",
    "timer.done":       "Done!",
    "timer.tap_start":  "tap to start",
    "timer.tap_pause":  "tap to pause",
    "timer.tap_resume": "tap to resume",
    "timer.tap_reset":  "tap to reset",

    // Warmup card
    "warmup.title": "Warmup & Mobility",
    "warmup.done":  "done",

    // Cooldown / stretch card
    "cooldown.title": "Cooldown & Stretch",
    "cooldown.done":  "done",

    // Workout summary modal
    "summary.title":    "Workout Complete!",
    "summary.duration": "Duration",
    "summary.exercises":"Exercises",
    "summary.sets_done":"Sets Done",
    "summary.done":     "Done",
    "summary.new_prs":  "🏆 New Personal Records!",

    // Progress page
    "progress.title":            "Progress",
    "progress.total_workouts":   "Total Workouts",
    "progress.day_streak":       "Day Streak",
    "progress.this_month":       "This Month",
    "progress.personal_records": "Personal Records",
    "progress.no_prs":           "Complete some workouts to see your records here",
    "progress.show_all":         "Show all {n}",
    "progress.show_less":        "Show less",
    "progress.exercise_progress":"Exercise Progress",
    "progress.no_charts":        "Log some workouts to see progress charts",
    "progress.chart_more":       "Log more sessions to see your chart",
    "progress.chart_session":    "Session",
    "progress.chart_pr":         "PR",
    "progress.personal_record":  "Personal Record",
    "progress.workout_log":      "Workout Log",
    "progress.no_logs":          "No workouts logged yet",
    "progress.exercises_1":      "1 exercise",
    "progress.exercises_n":      "{n} exercises",
    "progress.set_label":        "Set",
    "progress.incomplete":       "incomplete",

    // Profile page
    "profile.title":           "Profile",
    "profile.machine_settings":"Machine Settings",
    "profile.targets":         "Next Session Targets",
    "profile.history":         "Workout History",
    "profile.history_imported":"Historical data imported",
    "profile.sessions_from":   "{n} sessions from Weeks 1–7",
    "profile.total_in_app":    "{n} total in app",
    "profile.import_btn":      "Import {n} Sessions (Weeks 1–7)",
    "profile.import_desc":     "Import your 7 weeks of pre-app workout history ({n} sessions) to populate your Progress charts and personal records.",

    // Programs page
    "programs.title":          "Programs",
    "programs.tab_plans":      "Plans",
    "programs.tab_exercises":  "Exercises",
    "programs.active_badge":   "ACTIVE",
    "programs.preview_show":   "Preview workouts",
    "programs.preview_hide":   "Hide preview",
    "programs.planned_order":  "Planned Order · {n}-day cycle",
    "programs.warmup_label":   "Warm-up:",
    "programs.switch_to":      "Switch to this plan",
    "programs.confirm_body":   "Switch to {name}? Your progress tracking will continue.",
    "programs.confirm_yes":    "Confirm",
    "programs.confirm_cancel": "Cancel",
    "programs.muscles_worked": "Muscles Worked",
    "programs.watch_demo":     "Watch demo",
    "programs.no_plans":       "No plans match this category",
    "programs.search_placeholder": "Search exercises…",
    "programs.no_exercises":   "No exercises match your search",
    "programs.ex_count_1":     "1 exercise",
    "programs.ex_count_n":     "{n} exercises",
    "programs.rest_label":     "rest",
  },

  de: {
    // Greetings / dates
    "greeting.morning":   "Guten Morgen",
    "greeting.afternoon": "Guten Tag",
    "greeting.evening":   "Guten Abend",
    "date.today":         "Heute",
    "date.yesterday":     "Gestern",
    "date.locale":        "de-DE",

    // Home
    "home.workout_in_progress": "Training läuft",
    "home.pickup_where_left":   "Antippen um weiterzumachen",
    "home.resume":              "Fortsetzen",
    "home.min_est":             "Min. geschätzt",
    "home.more":                "+{n} weitere",
    "home.first_workout":       "Bereit für dein erstes Training? Los geht's!",
    "home.coaches_notes":       "Trainer-Notizen",
    "home.increases":           "Steigerungen",
    "home.pr_attempt":          "PR-Versuch",
    "home.deload":              "Deload",
    "home.last":                "Zuletzt",
    "home.no_history":          "Noch keine Historie — Plangewicht verwenden",
    "home.start_workout":       "Training starten",
    "home.this_week":           "Diese Woche",
    "home.workouts_1":          "1 Einheit",
    "home.workouts_n":          "{n} Einheiten",
    "home.total_workouts":      "Gesamt",
    "home.day_streak":          "Tage-Streak",
    "home.records_set":         "Bestleistungen",
    "home.recent_workouts":     "Letzte Trainings",
    "home.no_workouts_yet":     "Deine abgeschlossenen Trainings erscheinen hier",
    "home.switched_to":         "Gewechselt zu:",
    "home.reset":               "Zurücksetzen ×",
    "home.switch_day":          "Anderen Tag wählen",
    "home.choose_day":          "Trainingstag wählen:",
    "home.scheduled":           "geplant",
    "home.cancel":              "Abbrechen",
    "home.no_plan":             "Kein Plan ausgewählt",
    "home.rest_day":            "Ruhetag",
    "home.exercise_count_1":    "1 Übung",
    "home.exercise_count_n":    "{n} Übungen",
    "home.exercises":           "Übungen",
    "home.reps":                "Wdh.",
    "home.coming_up":           "Als nächstes",
    "home.schedule_rest":       "Ruhetag",
    "home.schedule_cardio":     "Cardio-Tag",
    "home.schedule_workout":    "Training",

    // Menu / settings
    "menu.title":              "Menü",
    "menu.navigate":           "Navigation",
    "menu.weight_unit":        "Gewichtseinheit",
    "menu.appearance":         "Erscheinungsbild",
    "menu.light":              "Hell",
    "menu.dark":               "Dunkel",
    "menu.accent_color":       "Akzentfarbe",
    "menu.language":           "Sprache",
    "menu.data":               "Daten",
    "menu.export_csv":         "Trainingslog exportieren (CSV)",
    "menu.import_csv":         "Aus CSV importieren",
    "menu.app":                "App",
    "menu.reload":             "App neu laden",
    "menu.whats_new":          "Neuigkeiten",
    "menu.close":              "Schließen",
    "menu.export_unavailable": "Export verfügbar nach erstem abgeschlossenen Training",
    "menu.import_error":       "Datei konnte nicht gelesen werden. Bitte eine CSV aus dieser App verwenden.",
    "menu.import_none":        "Keine neuen Einheiten gefunden",
    "menu.import_already_1":   "({n} bereits importiert)",
    "menu.import_added_1":     "1 Einheit importiert",
    "menu.import_added_n":     "{n} Einheiten importiert",
    "menu.import_dupe_1":      "1 Duplikat übersprungen",
    "menu.import_dupe_n":      "{n} Duplikate übersprungen",

    // Navigation labels
    "nav.home":     "Start",
    "nav.progress": "Fortschritt",
    "nav.programs": "Programme",
    "nav.timer":    "Pausentimer",
    "nav.profile":  "Profil",

    // Active workout
    "workout.active":           "Aktives Training",
    "workout.finish":           "Beenden",
    "workout.next_exercise":    "Nächste Übung →",
    "workout.finish_complete":  "Training beenden ✓",
    "workout.finish_partial":   "Training beenden ({done}/{total} Sätze)",
    "workout.discard_title":    "Training abbrechen?",
    "workout.discard_body_1":   "Du hast 1 Satz erfasst. Jetzt verlassen löscht deinen Fortschritt.",
    "workout.discard_body_n":   "Du hast {n} Sätze erfasst. Jetzt verlassen löscht deinen Fortschritt.",
    "workout.keep_going":       "Weitermachen",
    "workout.discard":          "Verwerfen",
    "workout.incomplete_title": "Training unvollständig",
    "workout.sets_missing_1":   "1 Satz noch nicht erfasst",
    "workout.sets_missing_n":   "{n} Sätze noch nicht erfasst",
    "workout.feel_missing_1":   "1 Übung ohne Bewertung",
    "workout.feel_missing_n":   "{n} Übungen ohne Bewertung",
    "workout.finish_anyway":    "Trotzdem beenden",
    "workout.no_exercises":     "Keine Übungen in dieser Einheit.",
    "workout.sets_progress":    "{done}/{total} Sätze",
    "workout.all":              "Alle",

    // Exercise card
    "exercise.how_feel":     "Wie war es?",
    "exercise.set":          "Satz",
    "exercise.prev":         "Vorh.",
    "exercise.weight":       "Gewicht",
    "exercise.reps":         "Wdh.",
    "exercise.seconds":      "Sek.",
    "exercise.rest":         "Pause",
    "exercise.done_count":   "{done}/{total} erledigt",
    "exercise.reps_label":   "Wdh.",
    "exercise.try_weight":   "{weight} {unit} versuchen",
    "exercise.try_reps":     "× {reps} Wdh.",

    // Swap modal
    "swap.title":    "Übung tauschen",
    "swap.subtitle": "Gleiche Muskelgruppe wie {name}",
    "swap.none":     "Keine alternativen Übungen für diese Muskelgruppe.",
    "swap.cancel":   "Abbrechen",

    // Feel options
    "feel.Easy":  "Leicht",
    "feel.Good":  "Gut",
    "feel.Hard":  "Schwer",
    "feel.Tough": "Hart",

    // Rest banner (inline in workout)
    "rest.tap_start": "Antippen zum Starten",
    "rest.resting":   "Pause",
    "rest.done":      "Pause vorbei — los!",
    "rest.skip":      "Überspringen",

    // Rest timer overlay
    "timer.title":      "Pausentimer",
    "timer.close":      "Schließen",
    "timer.done":       "Fertig!",
    "timer.tap_start":  "antippen zum Starten",
    "timer.tap_pause":  "antippen zum Pausieren",
    "timer.tap_resume": "antippen zum Fortsetzen",
    "timer.tap_reset":  "antippen zum Zurücksetzen",

    // Warmup card
    "warmup.title": "Aufwärmen & Mobilität",
    "warmup.done":  "erledigt",

    // Cooldown / stretch card
    "cooldown.title": "Abkühlen & Dehnen",
    "cooldown.done":  "erledigt",

    // Workout summary modal
    "summary.title":    "Training abgeschlossen!",
    "summary.duration": "Dauer",
    "summary.exercises":"Übungen",
    "summary.sets_done":"Sätze",
    "summary.done":     "Fertig",
    "summary.new_prs":  "🏆 Neue Bestleistungen!",

    // Progress page
    "progress.title":            "Fortschritt",
    "progress.total_workouts":   "Gesamt",
    "progress.day_streak":       "Tage-Streak",
    "progress.this_month":       "Diesen Monat",
    "progress.personal_records": "Bestleistungen",
    "progress.no_prs":           "Schließe einige Trainings ab, um Bestleistungen zu sehen",
    "progress.show_all":         "Alle {n} anzeigen",
    "progress.show_less":        "Weniger anzeigen",
    "progress.exercise_progress":"Übungsfortschritt",
    "progress.no_charts":        "Trainings loggen für Fortschrittsdiagramme",
    "progress.chart_more":       "Mehr Einheiten für das Diagramm loggen",
    "progress.chart_session":    "Einheit",
    "progress.chart_pr":         "Bestleistung",
    "progress.personal_record":  "Bestleistung",
    "progress.workout_log":      "Trainingslog",
    "progress.no_logs":          "Noch kein Training geloggt",
    "progress.exercises_1":      "1 Übung",
    "progress.exercises_n":      "{n} Übungen",
    "progress.set_label":        "Satz",
    "progress.incomplete":       "unvollständig",

    // Profile page
    "profile.title":           "Profil",
    "profile.machine_settings":"Geräteeinstellungen",
    "profile.targets":         "Ziele nächste Einheit",
    "profile.history":         "Trainingshistorie",
    "profile.history_imported":"Verlaufsdaten importiert",
    "profile.sessions_from":   "{n} Einheiten aus Wochen 1–7",
    "profile.total_in_app":    "{n} insgesamt in der App",
    "profile.import_btn":      "{n} Einheiten importieren (Wochen 1–7)",
    "profile.import_desc":     "Importiere deine 7 Wochen Trainingshistorie ({n} Einheiten) für Fortschrittsdiagramme und Bestleistungen.",

    // Programs page
    "programs.title":          "Programme",
    "programs.tab_plans":      "Pläne",
    "programs.tab_exercises":  "Übungen",
    "programs.active_badge":   "AKTIV",
    "programs.preview_show":   "Vorschau anzeigen",
    "programs.preview_hide":   "Vorschau ausblenden",
    "programs.planned_order":  "Geplante Reihenfolge · {n}-Tage-Zyklus",
    "programs.warmup_label":   "Aufwärmen:",
    "programs.switch_to":      "Zu diesem Plan wechseln",
    "programs.confirm_body":   "Zu {name} wechseln? Dein Fortschritt bleibt erhalten.",
    "programs.confirm_yes":    "Wechseln",
    "programs.confirm_cancel": "Abbrechen",
    "programs.muscles_worked": "Beanspruchte Muskeln",
    "programs.watch_demo":     "Demo ansehen",
    "programs.no_plans":       "Keine Pläne in dieser Kategorie",
    "programs.search_placeholder": "Übungen suchen…",
    "programs.no_exercises":   "Keine Übungen gefunden",
    "programs.ex_count_1":     "1 Übung",
    "programs.ex_count_n":     "{n} Übungen",
    "programs.rest_label":     "Pause",
  },
};

// ── Factory ───────────────────────────────────────────────────────────────────

export function makeT(lang) {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
  return function t(key, vars = {}) {
    let str = Object.prototype.hasOwnProperty.call(dict, key)
      ? dict[key]
      : (TRANSLATIONS.en[key] ?? key);
    for (const [k, v] of Object.entries(vars)) {
      str = str.replaceAll(`{${k}}`, String(v));
    }
    return str;
  };
}

// ── Context ───────────────────────────────────────────────────────────────────

export const LangContext = createContext({ lang: "en", t: makeT("en") });

export function useT()    { return useContext(LangContext).t; }
export function useLang() { return useContext(LangContext); }
