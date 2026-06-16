"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/store/gameStore";
import Dashboard from "@/components/Dashboard";
import DiscShop from "@/components/DiscShop";
import SeasonLoop from "@/components/SeasonLoop";

/**
 * Client entry point for the game UI. The Zustand store persists to
 * localStorage with `skipHydration`, so the server and first client render both
 * use the default state (no hydration mismatch). This component rehydrates the
 * store from localStorage after mount and only reveals the game once that is
 * done, avoiding a flash of the "new game" screen for returning players.
 */
export default function GameClient() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Pull any saved game out of localStorage, then render.
    useGameStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return <p className="loop-lead">Loading saved game…</p>;
  }

  return (
    <>
      <Dashboard />
      <SeasonLoop />
      <DiscShop />
    </>
  );
}
