import { useRef, useState } from "react";
import { useApp, wipeAllData, defaultSettings } from "../store/appState";
import { makeBackup, parseBackup, exportCSV, shareOrDownload } from "../store/backup";
import { parseLegacyCSV, mergeLogs } from "../store/legacy";
import type { AccentKey, Exercise, Lang, ThemeSetting, Unit } from "../types";
import { muscleLabel } from "../data/muscles";
import { useLang } from "../i18n";
import { Button, Card, EmptyState, Modal, PageHeader, SectionLabel, Segmented } from "../ui/kit";
import { IconCheck, IconDownload, IconUpload } from "../ui/icons";
import CycleSettingsSection from "../components/CycleSettingsSection";
import ExerciseForm from "../components/ExerciseForm";

const APP_VERSION = "2.0.0";

const ACCENTS: { key: AccentKey; color: string }[] = [
  { key: "green", color: "#16A97C" },
  { key: "blue", color: "#3B82F6" },
  { key: "purple", color: "#8B5CF6" },
  { key: "orange", color: "#F97316" },
];

type ImportResult = { added: number; skipped: number } | "error" | null;

export default function Settings() {
  const { state, dispatch } = useApp();
  const { t, lang } = useLang();
  const s = state.settings;

  const legacyRef = useRef<HTMLInputElement>(null);
  const restoreRef = useRef<HTMLInputElement>(null);
  const [importResult, setImportResult] = useState<ImportResult>(null);
  const [restorePending, setRestorePending] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [exerciseFormFor, setExerciseFormFor] = useState<Exercise | null>(null);
  const [exerciseFormOpen, setExerciseFormOpen] = useState(false);
  const [deletingExercise, setDeletingExercise] = useState<Exercise | null>(null);

  const customExercises = s.customExercises ?? [];

  const today = new Date().toISOString().slice(0, 10);

  async function handleExportJSON() {
    const backup = makeBackup(s, state.logs);
    await shareOrDownload(JSON.stringify(backup, null, 2), `ironlog-backup-${today}.json`, "application/json");
  }

  async function handleExportCSV() {
    if (state.logs.length === 0) return;
    await shareOrDownload(exportCSV(state.logs, s.unit, s), `ironlog-${today}.csv`, "text/csv");
  }

  function readFile(file: File, onText: (text: string) => void) {
    const reader = new FileReader();
    reader.onload = (ev) => onText(String(ev.target?.result ?? ""));
    reader.onerror = () => setImportResult("error");
    reader.readAsText(file);
  }

  function handleLegacyFile(file: File) {
    readFile(file, (text) => {
      try {
        const imported = parseLegacyCSV(text);
        const { merged, added, skipped } = mergeLogs(state.logs, imported);
        if (added > 0) dispatch({ type: "setLogs", logs: merged });
        setImportResult({ added, skipped });
      } catch {
        setImportResult("error");
      }
    });
  }

  function handleRestoreFile(file: File) {
    readFile(file, (text) => setRestorePending(text));
  }

  function confirmRestore() {
    if (!restorePending) return;
    try {
      const { settings, logs } = parseBackup(restorePending, defaultSettings());
      dispatch({ type: "restore", settings, logs });
      setImportResult({ added: logs.length, skipped: 0 });
    } catch {
      setImportResult("error");
    }
    setRestorePending(null);
  }

  async function handleReset() {
    await wipeAllData();
    dispatch({ type: "resetAll" });
    setResetOpen(false);
  }

  const dataBtnStyle = { justifyContent: "space-between" as const };

  return (
    <div className="page">
      <PageHeader title={t("settings.title")} />
      <div className="page-body">

        {/* Unit */}
        <div>
          <SectionLabel>{t("settings.units")}</SectionLabel>
          <div style={{ marginTop: 8 }}>
            <Segmented<Unit>
              options={[{ value: "lb", label: "lb" }, { value: "kg", label: "kg" }]}
              value={s.unit}
              onChange={(unit) => dispatch({ type: "settings", patch: { unit } })}
            />
          </div>
        </div>

        {/* Appearance */}
        <div>
          <SectionLabel>{t("settings.appearance")}</SectionLabel>
          <div style={{ marginTop: 8 }}>
            <Segmented<ThemeSetting>
              options={[
                { value: "light", label: `☀️ ${t("settings.theme.light")}` },
                { value: "dark", label: `🌙 ${t("settings.theme.dark")}` },
                { value: "system", label: t("settings.theme.system") },
              ]}
              value={s.theme}
              onChange={(theme) => dispatch({ type: "settings", patch: { theme } })}
            />
          </div>
        </div>

        {/* Accent */}
        <div>
          <SectionLabel>{t("settings.accent")}</SectionLabel>
          <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
            {ACCENTS.map((a) => (
              <button key={a.key}
                onClick={() => dispatch({ type: "settings", patch: { accent: a.key } })}
                style={{
                  width: 42, height: 42, borderRadius: "50%", background: a.color,
                  border: s.accent === a.key ? "3px solid var(--text-1)" : "3px solid transparent",
                  boxShadow: s.accent === a.key ? `0 0 0 2px ${a.color}` : "none",
                  cursor: "pointer", color: "#fff",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                }}
              >
                {s.accent === a.key && <IconCheck size={16} />}
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div>
          <SectionLabel>{t("settings.language")}</SectionLabel>
          <div style={{ marginTop: 8 }}>
            <Segmented<Lang>
              options={[
                { value: "en", label: "🇬🇧 English" },
                { value: "de", label: "🇩🇪 Deutsch" },
              ]}
              value={s.lang}
              onChange={(lang) => dispatch({ type: "settings", patch: { lang } })}
            />
          </div>
        </div>

        {/* My exercises (user-authored) */}
        <div>
          <SectionLabel>{t("customex.section")}</SectionLabel>
          <div className="fade-list" style={{ marginTop: 8 }}>
            <Card>
              {customExercises.length === 0 && <EmptyState>{t("customex.empty")}</EmptyState>}
              {customExercises.map((ex) => (
                <div key={ex.id} className="row" style={{ padding: "8px 0", borderTop: "1px solid var(--border)" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{ex.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-3)" }}>{muscleLabel(ex.primaryMuscle, lang)}</div>
                  </div>
                  <Button small variant="ghost" onClick={() => { setExerciseFormFor(ex); setExerciseFormOpen(true); }}>
                    {t("common.edit")}
                  </Button>
                  <Button small variant="ghost" style={{ color: "var(--red)" }} onClick={() => setDeletingExercise(ex)}>
                    {t("common.delete")}
                  </Button>
                </div>
              ))}
              <Button block style={{ marginTop: 10 }} onClick={() => { setExerciseFormFor(null); setExerciseFormOpen(true); }}>
                + {t("customex.add")}
              </Button>
            </Card>
          </div>
        </div>

        {/* Cycle (opt-in; controls appear only when enabled) */}
        <CycleSettingsSection />

        {/* Data */}
        <div>
          <SectionLabel>{t("settings.data")}</SectionLabel>
          <div className="fade-list" style={{ marginTop: 8 }}>
            <Card>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Button block style={dataBtnStyle} onClick={handleExportJSON}>
                  <span>{t("settings.export_json")}</span><IconDownload size={16} />
                </Button>
                <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: -4 }}>{t("settings.export_json_sub")}</div>

                <Button block style={dataBtnStyle} onClick={() => restoreRef.current?.click()}>
                  <span>{t("settings.import_json")}</span><IconUpload size={16} />
                </Button>

                <Button block style={dataBtnStyle} disabled={state.logs.length === 0} onClick={handleExportCSV}>
                  <span>{t("settings.export_csv")}</span><IconDownload size={16} />
                </Button>

                <Button block style={dataBtnStyle} onClick={() => { setImportResult(null); legacyRef.current?.click(); }}>
                  <span>{t("settings.import_legacy")}</span><IconUpload size={16} />
                </Button>
                <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: -4 }}>{t("settings.import_legacy_sub")}</div>

                {importResult && (
                  <div style={{
                    padding: "10px 12px", borderRadius: 8, fontSize: 13, fontWeight: 500,
                    background: importResult === "error" ? "var(--red-soft)" : "var(--accent-soft)",
                    color: importResult === "error" ? "var(--red)" : "var(--accent)",
                  }}>
                    {importResult === "error"
                      ? t("settings.import_error")
                      : `${t("settings.import_ok", { count: importResult.added })}${importResult.skipped > 0 ? ` · ${t("settings.import_skipped", { count: importResult.skipped })}` : ""}`}
                  </div>
                )}
              </div>
            </Card>
          </div>
          <input ref={legacyRef} type="file" accept=".csv,text/csv" style={{ display: "none" }}
            onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) handleLegacyFile(f); }} />
          <input ref={restoreRef} type="file" accept=".json,application/json" style={{ display: "none" }}
            onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) handleRestoreFile(f); }} />
        </div>

        {/* App */}
        <div>
          <SectionLabel>{t("settings.app")}</SectionLabel>
          <div style={{ marginTop: 8 }}>
            <Button block onClick={() => window.location.reload()}>
              {t("settings.reload")}
            </Button>
            <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 6 }}>
              {t("settings.reload_sub")}
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div>
          <SectionLabel>{t("settings.danger")}</SectionLabel>
          <div style={{ marginTop: 8 }}>
            <Button block variant="danger" onClick={() => setResetOpen(true)}>{t("settings.reset")}</Button>
          </div>
        </div>

        {/* About */}
        <div style={{ fontSize: 12, color: "var(--text-3)", textAlign: "center", padding: "8px 0 4px" }}>
          {t("settings.version", { v: APP_VERSION })}
        </div>
      </div>

      {/* Restore confirm */}
      {restorePending !== null && (
        <Modal onClose={() => setRestorePending(null)}>
          <div className="card-title">{t("settings.import_json")}</div>
          <div style={{ fontSize: 13, color: "var(--text-2)", margin: "6px 0 16px" }}>{t("settings.restore_warning")}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button block onClick={() => setRestorePending(null)}>{t("common.cancel")}</Button>
            <Button block variant="primary" onClick={confirmRestore}>{t("common.confirm")}</Button>
          </div>
        </Modal>
      )}

      {/* Custom exercise create/edit */}
      {exerciseFormOpen && (
        <ExerciseForm
          initial={exerciseFormFor}
          onClose={() => setExerciseFormOpen(false)}
          onSave={(exercise) => {
            dispatch({ type: "upsertExercise", exercise });
            setExerciseFormOpen(false);
          }}
        />
      )}

      {/* Custom exercise delete confirm */}
      {deletingExercise && (
        <Modal onClose={() => setDeletingExercise(null)}>
          <div className="card-title">{t("customex.delete_title")}</div>
          <div style={{ fontSize: 13, color: "var(--text-2)", margin: "6px 0 16px" }}>
            {t("customex.delete_warning", { name: deletingExercise.name })}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button block onClick={() => setDeletingExercise(null)}>{t("common.cancel")}</Button>
            <Button block variant="danger" onClick={() => {
              dispatch({ type: "deleteExercise", exerciseId: deletingExercise.id });
              setDeletingExercise(null);
            }}>{t("common.delete")}</Button>
          </div>
        </Modal>
      )}

      {/* Reset confirm */}
      {resetOpen && (
        <Modal onClose={() => setResetOpen(false)}>
          <div className="card-title">{t("settings.reset")}</div>
          <div style={{ fontSize: 13, color: "var(--text-2)", margin: "6px 0 16px" }}>{t("settings.reset_warning")}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button block onClick={() => setResetOpen(false)}>{t("common.cancel")}</Button>
            <Button block variant="danger" onClick={handleReset}>{t("settings.reset_confirm")}</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
