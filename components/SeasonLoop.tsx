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

/** A short status line shown to the player after an action. */
interface Notice {
  tone: "good" | "bad";
  text: string;
}

function formatMoney(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}

export default function SeasonLoop() {
  const club = useGameStore((s) => s.club);
  const players = useGameStore((s) => s.players);
  const season = useGameStore((s) => s.season);

  const startNewGame = useGameStore((s) => s.startNewGame);
  const startSeason = useGameStore((s) => s.startSeason);
  const playTournamentRound = useGameStore((s) => s.playTournamentRound);
  const advanceSeason = useGameStore((s) => s.advanceSeason);
  const trainPlayer = useGameStore((s) => s.trainPlayer);

  const [notice, setNotice] = useState<Notice | null>(null);
  const [lastResult, setLastResult] = useState<EnterTournamentResult | null>(
    null
  );

  // -- Phase: preseason --------------------------------------------------
  if (season.phase === "preseason") {
    return (
      <section className="loop">
        <h2>🥏 New Season</h2>
        <p className="loop-lead">
          Run a full season: pick a tournament, simulate it, bank the rewards,
          train your players, and do it all again.
        </p>
        <button
          className="btn btn-primary"
          onClick={() => {
            startNewGame();
            setNotice(null);
            setLastResult(null);
          }}
        >
          Start Season
        </button>
      </section>
    );
  }

  // -- Shared header -----------------------------------------------------
  const header = (
    <header className="loop-status">
      <div>
        <span className="loop-status-label">Club</span>
        <strong>{club.name}</strong>
      </div>
      <div>
        <span className="loop-status-label">Money</span>
        <strong>{formatMoney(club.money)}</strong>
      </div>
      <div>
        <span className="loop-status-label">Reputation</span>
        <strong>{club.reputation}</strong>
      </div>
      <div>
        <span className="loop-status-label">Season</span>
        <strong>{season.season}</strong>
      </div>
      <div>
        <span className="loop-status-label">Round</span>
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
              ? `Not enough money for the ${formatMoney(
                  eligibility.entryFee
                )} entry fee.`
              : "Could not enter that tournament.",
        });
        return;
      }
      setLastResult(outcome);
      const { result, settlement } = outcome;
      setNotice({
        tone: "good",
        text: `Finished #${result.placement} — earned ${formatMoney(
          settlement.earnings
        )} and +${settlement.reputationGained} reputation.`,
      });
    };

    return (
      <section className="loop">
        {header}
        <h2>Select a Tournament</h2>
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
                    {tournament.holes} holes · difficulty {tournament.difficulty}{" "}
                    · pool {formatMoney(tournament.prizePool)} · entry{" "}
                    {formatMoney(fee)}
                  </span>
                </div>
                <button
                  className="btn"
                  disabled={!eligibility.canEnter}
                  onClick={() => onEnter(tournament)}
                >
                  Enter
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
        setNotice({
          tone: "bad",
          text: "Not enough money for that training session.",
        });
        return;
      }
      setNotice({
        tone: "good",
        text: `${player.name}: ${result.stat} +${result.boost} (now ${result.newValue}) for ${formatMoney(
          result.cost
        )}.`,
      });
    };

    return (
      <section className="loop">
        {header}
        <h2>Training</h2>
        {roundResult ? (
          <p className="loop-lead">
            Last round: <strong>{roundResult.tournamentName}</strong> — finished
            #{roundResult.placement}, earned{" "}
            {formatMoney(roundResult.earnings)} and +
            {roundResult.reputationGained} reputation.
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
                  DRV {effective.Driving} · ACC {effective.Accuracy} · PUT{" "}
                  {effective.Putting} · MEN {effective.Mental} · STA{" "}
                  {effective.Stamina}
                </span>
                <div className="loop-train-buttons">
                  {TRAINING_PROGRAMS.map((program) => (
                    <button
                      key={program.type}
                      className="btn btn-small"
                      disabled={club.money < program.cost}
                      onClick={() => onTrain(player, program.type)}
                    >
                      {program.type} ({formatMoney(program.cost)})
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
          {season.round >= season.totalRounds ? "Finish Season" : "Next Round"}
        </button>
      </section>
    );
  }

  // -- Phase: complete (season summary) ---------------------------------
  const summary = summariseSeason(season);
  return (
    <section className="loop">
      {header}
      <h2>Season {summary.season} Complete</h2>
      <ul className="loop-summary">
        <li>
          Rounds played: <strong>{summary.roundsPlayed}</strong>
        </li>
        <li>
          Wins: <strong>{summary.wins}</strong>
        </li>
        <li>
          Best finish:{" "}
          <strong>
            {summary.bestPlacement ? `#${summary.bestPlacement}` : "—"}
          </strong>
        </li>
        <li>
          Total earnings: <strong>{formatMoney(summary.totalEarnings)}</strong>
        </li>
        <li>
          Reputation gained: <strong>+{summary.totalReputation}</strong>
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
        Start Next Season
      </button>
    </section>
  );
}
