"use client";

import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { LANGUAGES, type Language } from "@/i18n";
import { useTranslation } from "@/hooks/useTranslation";

interface NewGameModalProps {
  /** Close the modal without starting a game. */
  onClose: () => void;
}

/**
 * Modal shown after clicking "New Game". Asks the player for their language and
 * club name, then seeds a fresh game. The chosen language is applied live so
 * the rest of the form (and the whole app) updates immediately.
 */
export default function NewGameModal({ onClose }: NewGameModalProps) {
  const language = useGameStore((s) => s.language);
  const setLanguage = useGameStore((s) => s.setLanguage);
  const startNewGame = useGameStore((s) => s.startNewGame);
  const { t } = useTranslation();

  const [clubName, setClubName] = useState("");

  const onStart = () => {
    startNewGame({ clubName });
    onClose();
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{t("newgame.modalTitle")}</h2>

        <div className="loop-setup">
          <fieldset className="loop-field">
            <legend>{t("newgame.languageQuestion")}</legend>
            <div className="loop-train-buttons">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  className={`btn btn-small${
                    language === lang.code ? " btn-primary" : ""
                  }`}
                  onClick={() => setLanguage(lang.code as Language)}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="loop-field">
            <span>{t("newgame.clubName")}</span>
            <input
              className="loop-input"
              type="text"
              placeholder={t("newgame.clubNamePlaceholder")}
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              autoFocus
            />
          </label>
        </div>

        <div className="modal-actions">
          <button className="btn" type="button" onClick={onClose}>
            {t("newgame.cancel")}
          </button>
          <button className="btn btn-primary" type="button" onClick={onStart}>
            {t("newgame.start")}
          </button>
        </div>
      </div>
    </div>
  );
}
