"use client";

import { useEffect, useState } from "react";
import type { HoleByHoleEntry, PlayerHoleTrack } from "@/store/gameStore";
import { formatScoreToPar } from "@/utils/format";
import { useTranslation } from "@/hooks/useTranslation";

const OUTCOME_ICON: Record<HoleByHoleEntry["outcome"], string> = {
  Eagle: "🦅",
  Birdie: "🐦",
  Par: "⛳",
  Bogey: "😬",
  DoubleBogey: "💥",
};

const OUTCOME_COLOR: Record<HoleByHoleEntry["outcome"], string> = {
  Eagle: "#fbbf24",
  Birdie: "#4ade80",
  Par: "#94a3b8",
  Bogey: "#f87171",
  DoubleBogey: "#ef4444",
};

const STEP_MS = 500;

interface HolePlaybackProps {
  tracks: PlayerHoleTrack[];
  onDone: () => void;
}

/**
 * Plays back a tournament hole-by-hole for every club player simultaneously,
 * one hole per tick. After all holes are shown the user must manually click
 * "View Results" to proceed.
 */
export default function HolePlayback({ tracks, onDone }: HolePlaybackProps) {
  const { t } = useTranslation();
  const totalHoles = tracks[0]?.holes.length ?? 0;
  const [revealed, setRevealed] = useState(0);
  const done = revealed >= totalHoles;

  useEffect(() => {
    if (totalHoles === 0) return;
    if (done) return;
    const timeout = setTimeout(() => setRevealed((n) => n + 1), STEP_MS);
    return () => clearTimeout(timeout);
  }, [revealed, totalHoles, done]);

  if (tracks.length === 0) return null;

  return (
    <div className="hole-playback">
      <div className="hole-playback-tracks">
        {tracks.map((track) => {
          const runningScore = track.holes
            .slice(0, revealed)
            .reduce((sum, h) => sum + h.scoreToPar, 0);

          return (
            <div key={track.playerName} className="hole-playback-track">
              <div className="hole-playback-track-head">
                <span className="hole-playback-name">{track.playerName}</span>
                <span
                  className="hole-playback-score"
                  style={{ color: runningScore < 0 ? "#4ade80" : runningScore > 0 ? "#f87171" : "#94a3b8" }}
                >
                  {formatScoreToPar(runningScore)}
                </span>
              </div>
              <div className="hole-playback-strip">
                {track.holes.map((hole, index) => {
                  const shown = index < revealed;
                  return (
                    <span
                      key={index}
                      title={shown ? hole.outcome : `Hole ${index + 1}`}
                      className={`hole-playback-hole${shown ? " hole-playback-hole-shown" : ""}`}
                      style={shown ? { borderColor: OUTCOME_COLOR[hole.outcome] } : undefined}
                    >
                      {shown ? OUTCOME_ICON[hole.outcome] : ""}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="hole-playback-footer">
        {!done ? (
          <button className="btn btn-small" onClick={() => setRevealed(totalHoles)}>
            {t("playback.skip")}
          </button>
        ) : (
          <button className="btn btn-primary" onClick={onDone}>
            {t("playback.viewResults")}
          </button>
        )}
      </div>
    </div>
  );
}
