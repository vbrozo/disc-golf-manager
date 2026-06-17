"use client";

import { useGameStore } from "@/store/gameStore";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * Hard-reset button (top of the header, next to the language switcher). Clears
 * the persisted save from localStorage and reloads the page, so testing a new
 * build and starting a fresh game on the same URL takes one click.
 */
export default function ResetButton() {
  const { t } = useTranslation();

  const onReset = () => {
    if (!window.confirm(t("reset.confirm"))) {
      return;
    }
    // Drop the persisted save, then hard-reload to a clean default state.
    void useGameStore.persist.clearStorage();
    window.location.reload();
  };

  return (
    <button
      className="btn btn-small reset-btn"
      type="button"
      onClick={onReset}
      title={t("reset.label")}
      aria-label={t("reset.label")}
    >
      <span aria-hidden>🔄</span>
      <span className="reset-btn-text">{t("reset.label")}</span>
    </button>
  );
}
