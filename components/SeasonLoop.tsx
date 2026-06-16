"use client";

import { useState } from "react";
import {
  useGameStore,
  type EnterTournamentResult,
} from "@/store/gameStore";
import {
  checkEntryEligibility,
  effectivePlayerStats,
  getAvailableTournaments,
  getEntryFee,
  summariseSeason,
  TRAINING_PROGRAMS,
} from "@/game";
import type { Player, Tournament, TrainingType } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";
import NewGameModal from "@/components/NewGameModal";

/** A short status line shown to the player after an action. */
interface Notice {
  tone: "good" | "bad";
  text: string;
}

function formatMoney(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}

export default function SeasonLoop() {
  const { t } = useTranslation();

  const club = useGameStore((s) => s.club);
  const players = useGameStore((s) => s.players);
  const season = useGameStore((s) => s.season);

  const startSeason = useGameStore((s) => s.startSeason);
  const playTournamentRound = useGameStore((s) => s.playTournamentRound);
  const advanceSeason = useGameStore((s) => s.advanceSeason);
  const trainPlayer = useGameStore((s) => s.trainPlayer);

  const [notice, setNotice] = useState<Notice | null>(null);
  const [lastResult, setLastResult] = useState<EnterTournamentResult | null>(
    null
  );
  const [showNewGame, setShowNewGame] = useState(false);

  // -- Phase: preseason (start screen) -----------------------------------
  if (season.phase === "preseason") {
    return (
      <section className="loop loop-start">
        <h2>{t("newgame.heading")}</h2>
        <p className="loop-lead">{t("newgame.intro")}</p>
        <button
          className="btn btn-primary"
          onClick={() => setShowNewGame(true)}
        >
          {t("newgame.button")}
        </button>
        {showNewGame ? (
          <NewGameModal
            onClose={() => {
              setShowNewGame(false);
              setNotice(null);
              setLastResult(null);
            }}
          />
        ) : null}
      </section>
    );
  }

  // -- Shared header -----------------------------------------------------
  const header = (
    <header className="loop-status">
      <div>
        <span className="loop-status-label">{t("loop.club")}</span>
        <strong>{club.name}</strong>
      </div>
      <div>
        <span className="loop-status-label">{t("loop.money")}</span>
        <strong>{formatMoney(club.money)}</strong>
      </div>
      <div>
        <span className="loop-status-label">{t("loop.reputation")}</span>
        <strong>{club.reputation}</strong>
      </div>
      <div>
        <span className="loop-status-label">{t("loop.season")}</span>
        <strong>{season.season}</strong>
      </div>
      <div>
        <span className="loop-status-label">{t("loop.round")}</span>
        <strong>
          {Math.min(season.round, season.totalRounds)} / {season.totalRounds}
        </strong>
      </div>
    </header>
  );

  const noticeBar = notice ? (
    <p className={`loop-notice loop-notice-${notice.tone}`}>{notice.text}</p>
  ) : null;

  // -- Phase: select tournament -----------------------------------------
  if (season.phase === "select") {
    const available = getAvailableTournaments(club.reputation);

    const onEnter = (tournament: Tournament) => {
      const outcome = playTournamentRound(tournament.id);
      if (!outcome) {
        const eligibility = checkEntryEligibility(club, tournament);
        setNotice({
          tone: "bad",
          text:
            eligibility.reason === "insufficient-funds"
              ? t("loop.noFunds", { fee: formatMoney(eligibility.entryFee) })
              : t("loop.cantEnter"),
        });
        return;
      }
      setLastResult(outcome);
      const { result, settlement } = outcome;
      setNotice({
        tone: "good",
        text: t("loop.entered", {
          placement: result.placement,
          earnings: formatMoney(settlement.earnings),
          rep: settlement.reputationGained,
        }),
      });
    };

    return (
      <section className="loop">
        {header}
        <h2>{t("loop.selectTitle")}</h2>
        {noticeBar}
        <ul className="loop-tournaments">
          {available.map((tournament) => {
            const fee = getEntryFee(tournament);
            const eligibility = checkEntryEligibility(club, tournament);
            return (
              <li key={tournament.id} className="loop-tournament">
                <div className="loop-tournament-info">
                  <strong>{tournament.name}</strong>
                  <span className="loop-meta">
                    {t("loop.tournamentMeta", {
                      holes: tournament.holes,
                      difficulty: tournament.difficulty,
                      pool: formatMoney(tournament.prizePool),
                      fee: formatMoney(fee),
                    })}
                  </span>
                </div>
                <button
                  className="btn"
                  disabled={!eligibility.canEnter}
                  onClick={() => onEnter(tournament)}
                >
                  {t("loop.enter")}
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    );
  }

  // -- Phase: training (after earning rewards) --------------------------
  if (season.phase === "training") {
    // Either the freshly-played result or the last recorded season round —
    // both expose the fields the recap needs.
    const roundResult =
      lastResult?.result ?? season.results[season.results.length - 1];

    const onTrain = (player: Player, type: TrainingType) => {
      const result = trainPlayer(player.id, type);
      if (!result) {
        setNotice({ tone: "bad", text: t("loop.noTrainFunds") });
        return;
      }
      setNotice({
        tone: "good",
        text: t("loop.trained", {
          player: player.name,
          stat: t(`stat.${result.stat}`),
          boost: result.boost,
          newValue: result.newValue,
          cost: formatMoney(result.cost),
        }),
      });
    };

    return (
      <section className="loop">
        {header}
        <h2>{t("loop.trainingTitle")}</h2>
        {roundResult ? (
          <p className="loop-lead">
            {t("loop.lastRound", {
              name: roundResult.tournamentName,
              placement: roundResult.placement,
              earnings: formatMoney(roundResult.earnings),
              rep: roundResult.reputationGained,
            })}
          </p>
        ) : null}
        {noticeBar}
        <div className="loop-roster">
          {players.map((player) => {
            const effective = effectivePlayerStats(player);
            return (
              <div key={player.id} className="loop-player">
                <strong>{player.name}</strong>
                <span className="loop-meta">
                  {t("dash.playerStats", {
                    drv: effective.Driving,
                    acc: effective.Accuracy,
                    put: effective.Putting,
                    men: effective.Mental,
                    sta: effective.Stamina,
                  })}
                </span>
                <div className="loop-train-buttons">
                  {TRAINING_PROGRAMS.map((program) => (
                    <button
                      key={program.type}
                      className="btn btn-small"
                      disabled={club.money < program.cost}
                      onClick={() => onTrain(player, program.type)}
                    >
                      {t("loop.trainButton", {
                        type: t(`trainingType.${program.type}`),
                        cost: formatMoney(program.cost),
                      })}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            advanceSeason();
            setNotice(null);
            setLastResult(null);
          }}
        >
          {season.round >= season.totalRounds
            ? t("loop.finishSeason")
            : t("loop.nextRound")}
        </button>
      </section>
    );
  }

  // -- Phase: complete (season summary) ---------------------------------
  const summary = summariseSeason(season);
  return (
    <section className="loop">
      {header}
      <h2>{t("loop.seasonComplete", { n: summary.season })}</h2>
      <ul className="loop-summary">
        <li>
          {t("loop.roundsPlayed")}: <strong>{summary.roundsPlayed}</strong>
        </li>
        <li>
          {t("loop.wins")}: <strong>{summary.wins}</strong>
        </li>
        <li>
          {t("loop.bestFinish")}:{" "}
          <strong>
            {summary.bestPlacement ? `#${summary.bestPlacement}` : "—"}
          </strong>
        </li>
        <li>
          {t("loop.totalEarnings")}:{" "}
          <strong>{formatMoney(summary.totalEarnings)}</strong>
        </li>
        <li>
          {t("loop.reputationGained")}:{" "}
          <strong>+{summary.totalReputation}</strong>
        </li>
      </ul>
      <button
        className="btn btn-primary"
        onClick={() => {
          startSeason();
          setNotice(null);
          setLastResult(null);
        }}
      >
        {t("loop.startNextSeason")}
      </button>
    </section>
  );
}
