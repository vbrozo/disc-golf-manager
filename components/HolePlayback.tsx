"use client";

import { useEffect, useState } from "react";
import type { HoleByHoleEntry } from "@/store/gameStore";
import { formatScoreToPar } from "@/utils/format";
import { useTranslation } from "@/hooks/useTranslation";

const OUTCOME_ICON: Record<HoleByHoleEntry["outcome"], string> = {
  Eagle: "🦅",
  Birdie: "🐦",
  Par: "⛳",
  Bogey: "😬",
  DoubleBogey: "💥",
};

const STEP_MS = 220;

interface HolePlaybackProps {
  playerName: string;
  holes: HoleByHoleEntry[];
  onDone: () => void;
}

/**
 * Plays back a tournament's best finisher hole-by-hole before the full
 * leaderboard is revealed — gives the instant simulation result a sense of
 * "watching it happen" instead of a flat instant reveal.
 */
export default function HolePlayback({
  playerName,
  holes,
  onDone,
}: HolePlaybackProps) {
  const { t } = useTranslation();
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (holes.length === 0) {
      onDone();
      return;
    }
    if (revealed >= holes.length) {
      const timeout = setTimeout(onDone, 500);
      return () => clearTimeout(timeout);
    }
    const timeout = setTimeout(() => setRevealed((n) => n + 1), STEP_MS);
    return () => clearTimeout(timeout);
  }, [revealed, holes.length, onDone]);

  const runningScore = holes
    .slice(0, revealed)
    .reduce((sum, h) => sum + h.scoreToPar, 0);

  return (
    <div className="hole-playback">
      <p className="loop-meta">
        {t("playback.watching", { name: playerName })}
      </p>
      <div className="hole-playback-strip">
        {holes.map((hole, index) => {
          const shown = index < revealed;
          return (
            <span
              key={index}
              className={`hole-playback-hole${shown ? " hole-playback-hole-shown" : ""}`}
            >
              {shown ? OUTCOME_ICON[hole.outcome] : ""}
            </span>
          );
        })}
      </div>
      <p className="hole-playback-score">{formatScoreToPar(runningScore)}</p>
      <button className="btn btn-small" onClick={() => setRevealed(holes.length)}>
        {t("playback.skip")}
      </button>
    </div>
  );
}
