"use client";

import { useGameStore } from "@/store/gameStore";
import { LANGUAGES, type Language } from "@/i18n";
import { useTranslation } from "@/hooks/useTranslation";

/** Language dropdown shown in the top-right of the header. */
export default function LanguageSwitcher() {
  const language = useGameStore((s) => s.language);
  const setLanguage = useGameStore((s) => s.setLanguage);
  const { t } = useTranslation();

  return (
    <label className="lang-switcher">
      <span className="lang-switcher-label">{t("language.label")}</span>
      <select
        className="lang-switcher-select"
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </label>
  );
}
