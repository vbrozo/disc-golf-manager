"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { useTranslation } from "@/hooks/useTranslation";
import { isSeasonComplete } from "@/game";
import { useClickSound } from "@/hooks/useClickSound";
import GameFlow from "@/components/GameFlow";
import PageTitle from "@/components/PageTitle";

/**
 * Client entry point for the game UI. The Zustand store persists to
 * localStorage with `skipHydration`, so the server and first client render both
 * use the default state (no hydration mismatch). This component rehydrates the
 * store from localStorage after mount and only reveals the game once that is
 * done, avoiding a flash of the "new game" screen for returning players.
 */
export default function GameClient() {
  const { t } = useTranslation();
  const [hydrated, setHydrated] = useState(false);
  const season = useGameStore((s) => s.season);

  useClickSound();

  useEffect(() => {
    // Pull any saved game out of localStorage, then render.
    useGameStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  const gameActive = hydrated && season.phase !== "preseason";

  return (
    <>
      <PageTitle />
      {!gameActive && <h2>{t("dashboard.title")}</h2>}
      {!gameActive && <p>{t("dashboard.welcome")}</p>}
      {hydrated ? (
        <GameFlow />
      ) : (
        <p className="loop-lead">{t("app.loading")}</p>
      )}
    </>
  );
}
