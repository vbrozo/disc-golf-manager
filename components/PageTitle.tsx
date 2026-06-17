"use client";

import { useEffect } from "react";
import { useGameStore } from "@/store/gameStore";

/** Keeps document.title in sync with the current season/round. */
export default function PageTitle() {
  const season = useGameStore((s) => s.season);
  const club = useGameStore((s) => s.club);

  useEffect(() => {
    if (season.phase === "preseason") {
      document.title = "Disc Golf Manager";
      return;
    }
    const parts = [club.name, `Season ${season.season}`, `Round ${season.round}`];
    document.title = parts.join(" · ");
  }, [club.name, season.phase, season.season, season.round]);

  return null;
}
