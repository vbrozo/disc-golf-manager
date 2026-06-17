"use client";

import { useCallback } from "react";
import { useGameStore } from "@/store/gameStore";
import { t as translate, type Language } from "@/i18n";

/**
 * Translation hook bound to the store's active language. Returns the current
 * language plus a `t(key, params?)` helper, so components re-render when the
 * player switches language.
 */
export function useTranslation() {
  const language = useGameStore((s) => s.language);
  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(language, key, params),
    [language]
  );
  return { language, t, setLanguage: useGameStore.getState().setLanguage } as {
    language: Language;
    t: typeof t;
    setLanguage: (language: Language) => void;
  };
}
