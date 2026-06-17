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

const OUTCOME_BORDER: Record<HoleByHoleEntry["outcome"], string> = {
  Eagle: "#fbbf24",
  Birdie: "#4ade80",
  Par: "#475569",
  Bogey: "#f87171",
  DoubleBogey: "#ef4444",
};

const STEP_MS = 500;
const ROUND_PAUSE_MS = 2000;

function scoreColor(score: number) {
  if (score < 0) return "#4ade80";
  if (score > 0) return "#f87171";
  return "#94a3b8";
}

interface HolePlaybackProps {
  tracks: PlayerHoleTrack[];
  onDone: () => void;
}

export default function HolePlayback({ tracks, onDone }: HolePlaybackProps) {
  const { t } = useTranslation();

  const totalRounds = tracks[0]?.rounds.length ?? 0;
  const holesPerRound = tracks[0]?.rounds[0]?.length ?? 0;

  const [activeRound, setActiveRound] = useState(0);
  const [revealed, setRevealed] = useState(0);    // holes revealed in current round
  const [pausing, setPausing] = useState(false);  // true during 2s inter-round pause
  const allDone = activeRound >= totalRounds;

  useEffect(() => {
    if (allDone || holesPerRound === 0) return;

    if (pausing) {
      const t = setTimeout(() => {
        setPausing(false);
        setActiveRound((r) => r + 1);
        setRevealed(0);
      }, ROUND_PAUSE_MS);
      return () => clearTimeout(t);
    }

    if (revealed >= holesPerRound) {
      if (activeRound < totalRounds - 1) {
        setPausing(true);
      } else {
        setActiveRound(totalRounds); // last round done → trigger allDone
      }
      return;
    }

    const t = setTimeout(() => setRevealed((n) => n + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [revealed, activeRound, pausing, allDone, holesPerRound, totalRounds]);

  if (tracks.length === 0) return null;

  const skipToEnd = () => {
    setActiveRound(totalRounds);
    setRevealed(holesPerRound);
    setPausing(false);
  };

  return (
    <div className="hole-playback">
      {tracks.map((track) => {
        const overallScore = track.rounds
          .flatMap((r) => r)
          .slice(0, activeRound * holesPerRound + Math.min(revealed, holesPerRound))
          .reduce((s, h) => s + h.scoreToPar, 0);

        return (
          <div key={track.playerName} className="hole-playback-player">
            {/* Player header row */}
            <div className="hole-playback-player-head">
              <span className="hole-playback-name">{track.playerName}</span>
              <span className="hole-playback-overall" style={{ color: scoreColor(overallScore) }}>
                {formatScoreToPar(overallScore)}
              </span>
            </div>

            {/* One row per round */}
            {track.rounds.map((roundHoles, roundIdx) => {
              const isActive = roundIdx === activeRound;
              const isPast = roundIdx < activeRound || allDone;
              const holeCount = isPast ? roundHoles.length : isActive ? revealed : 0;

              const roundScore = roundHoles
                .slice(0, holeCount)
                .reduce((s, h) => s + h.scoreToPar, 0);

              return (
                <div
                  key={roundIdx}
                  className={`hole-playback-round${isActive && !pausing ? " hole-playback-round-active" : ""}${isPast ? " hole-playback-round-past" : ""}`}
                >
                  <span className="hole-playback-round-label">
                    R{roundIdx + 1}
                  </span>
                  <div className="hole-playback-strip">
                    {roundHoles.map((hole, holeIdx) => {
                      const shown = holeIdx < holeCount;
                      return (
                        <span
                          key={holeIdx}
                          title={shown ? hole.outcome : `Hole ${holeIdx + 1}`}
                          className={`hole-playback-hole${shown ? " hole-playback-hole-shown" : ""}`}
                          style={shown ? { borderColor: OUTCOME_BORDER[hole.outcome] } : undefined}
                        >
                          {shown ? OUTCOME_ICON[hole.outcome] : ""}
                        </span>
                      );
                    })}
                  </div>
                  <span
                    className="hole-playback-round-score"
                    style={{ color: scoreColor(roundScore), opacity: holeCount > 0 ? 1 : 0 }}
                  >
                    {formatScoreToPar(roundScore)}
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}

      {pausing ? (
        <div className="hole-playback-round-banner" key={activeRound}>
          {t("playback.roundStarting", { round: activeRound + 2 })}
        </div>
      ) : null}

      <div className="hole-playback-footer">
        {!allDone ? (
          <button className="btn btn-small" onClick={skipToEnd}>
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
