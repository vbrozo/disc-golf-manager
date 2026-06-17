"use client";

import { useState, type ReactNode } from "react";
import { useGameStore } from "@/store/gameStore";
import {
  checkEntryEligibility,
  effectivePlayer,
  getAvailableDiscs,
  getAvailableTournaments,
  getDiscPrice,
  getEntryFee,
  isSeasonComplete,
  nextDiscUnlock,
  summariseSeason,
  TRAINING_PROGRAMS,
} from "@/game";
import type { Disc, DiscType, Player, Tournament, TrainingType } from "@/types";
import { playerFullName } from "@/models/Player";
import { useTranslation } from "@/hooks/useTranslation";
import StartScreen from "@/components/StartScreen";
import StatusHeader from "@/components/StatusHeader";
import FlowStepper from "@/components/FlowStepper";
import StatBar from "@/components/StatBar";
import FloatingNumbers from "@/components/FloatingNumbers";
import Avatar from "@/components/Avatar";
import Confetti from "@/components/Confetti";
import HolePlayback from "@/components/HolePlayback";
import Icon from "@/components/Icon";
import RankingList from "@/components/RankingList";
import type { TournamentSummary } from "@/store/gameStore";
import { useFloatingNumbers } from "@/hooks/useFloatingNumbers";
import { formatMoney, formatScoreToPar } from "@/utils/format";
import {
  getDiscAvatar,
  getNameAvatar,
  getPlacementMedal,
  getPlayerAvatar,
} from "@/utils/avatar";

const STAT_KEYS: ("power" | "accuracy" | "putting" | "scramble" | "consistency" | "mental" | "fitness")[] = [
  "power",
  "accuracy",
  "putting",
  "scramble",
  "consistency",
  "mental",
  "fitness",
];

const DISC_TYPES: DiscType[] = ["Driver", "Midrange", "Putter"];

interface Notice {
  tone: "good" | "bad";
  text: string;
}

/** Whether a player has a disc equipped in every type slot. */
function isFullyEquipped(player: Player): boolean {
  return DISC_TYPES.every((type) => Boolean(player.equipped?.[type]));
}

/**
 * Guided game flow. Renders one focused screen at a time and walks the player
 * through: intro → buy/equip discs → training → tournament → training → … →
 * season complete. The season engine still drives round counting and rewards;
 * this component just sequences the UI and presents training before each
 * tournament.
 */
export default function GameFlow() {
  const { t } = useTranslation();

  const club = useGameStore((s) => s.club);
  const players = useGameStore((s) => s.players);
  const season = useGameStore((s) => s.season);
  const inventory = useGameStore((s) => s.inventory);
  const flowStage = useGameStore((s) => s.flowStage);
  const lastTournament = useGameStore((s) => s.lastTournament);

  const setFlowStage = useGameStore((s) => s.setFlowStage);
  const startSeason = useGameStore((s) => s.startSeason);
  const playTournamentRound = useGameStore((s) => s.playTournamentRound);
  const advanceSeason = useGameStore((s) => s.advanceSeason);
  const trainPlayer = useGameStore((s) => s.trainPlayer);
  const buyDiscs = useGameStore((s) => s.buyDiscs);
  const equipDisc = useGameStore((s) => s.equipDisc);
  const unequipDisc = useGameStore((s) => s.unequipDisc);

  const [notice, setNotice] = useState<Notice | null>(null);
  const [typeFilter, setTypeFilter] = useState<DiscType | "All">("All");
  const [showRankings, setShowRankings] = useState(false);

  // No game in progress — show the start screen.
  if (season.phase === "preseason") {
    return <StartScreen />;
  }

  // Rankings overlay replaces the current stage content.
  if (showRankings) {
    return <RankingList onClose={() => setShowRankings(false)} />;
  }

  const noticeBar = notice ? (
    <p className={`loop-notice loop-notice-${notice.tone}`}>{notice.text}</p>
  ) : null;

  const stepper =
    flowStage === "complete" || flowStage === "results" ? null : (
      <FlowStepper current={flowStage} />
    );

  // -- Stage: intro ------------------------------------------------------
  if (flowStage === "intro") {
    return (
      <section className={`loop loop-stage-${flowStage}`} key={flowStage}>
        <StatusHeader onRankings={() => setShowRankings(true)} />
        {stepper}
        <h2>{t("intro.title")}</h2>
        <p className="loop-lead">
          {t("intro.body1", {
            count: players.length,
            names: players.map((p) => playerFullName(p)).join(", "),
          })}
        </p>
        <p className="loop-lead">
          {t("intro.body2")}
        </p>
        <p className="loop-lead">{t("intro.body3")}</p>
        <button
          className="btn btn-primary"
          onClick={() => {
            setNotice(null);
            setFlowStage("shop");
          }}
        >
          {t("intro.continue")}
        </button>
      </section>
    );
  }

  // -- Stage: shop (buy + equip discs) -----------------------------------
  if (flowStage === "shop") {
    const equippedCount = players.reduce(
      (sum, p) => sum + DISC_TYPES.filter((type) => p.equipped?.[type]).length,
      0
    );
    const totalNeeded = players.length * DISC_TYPES.length;
    const allEquipped = players.every(isFullyEquipped);

    const onBuy = (disc: Disc) => {
      const bought = buyDiscs(disc.id, 1);
      if (!bought) {
        setNotice({
          tone: "bad",
          text: t("shop.noFunds", {
            name: disc.name,
            price: formatMoney(getDiscPrice(disc)),
          }),
        });
        return;
      }
      setNotice({
        tone: "good",
        text: t("shop.bought", { name: disc.name }),
      });
    };

    const availableDiscs = getAvailableDiscs(club.reputation);
    const visibleDiscs =
      typeFilter === "All"
        ? availableDiscs
        : availableDiscs.filter((d) => d.type === typeFilter);
    const unlock = nextDiscUnlock(club.reputation);

    const onEquip = (player: Player, discId: string) => {
      if (!discId) return;
      const disc = inventory.find((d) => d.id === discId);
      equipDisc(player.id, discId);
      setNotice({
        tone: "good",
        text: t("shop.equipped", {
          name: disc?.name ?? "",
          player: playerFullName(player),
        }),
      });
    };

    const onUnequip = (player: Player, type: DiscType) => {
      unequipDisc(player.id, type);
      setNotice({
        tone: "good",
        text: t("shop.unequipped", {
          type: t(`discType.${type}`),
          player: playerFullName(player),
        }),
      });
    };

    return (
      <section className={`loop loop-stage-${flowStage}`} key={flowStage}>
        <StatusHeader onRankings={() => setShowRankings(true)} />
        {stepper}
        <h2>{t("shop.title")}</h2>
        <p className="loop-lead">{t("shop.lead")}</p>
        <p className="loop-lead">
          <strong>
            {t("shop.progress", { done: equippedCount, total: totalNeeded })}
          </strong>{" "}
          — {t("shop.hint")}
        </p>
        {noticeBar}

        <h3>{t("shop.catalogue")}</h3>
        <label className="loop-field">
          <span>{t("shop.filterLabel")}</span>
          <select
            className="btn btn-small"
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(e.target.value as DiscType | "All")
            }
          >
            <option value="All">{t("shop.filterAll")}</option>
            {DISC_TYPES.map((type) => (
              <option key={type} value={type}>
                {t(`discType.${type}`)}
              </option>
            ))}
          </select>
        </label>
        <p className="loop-meta shop-unlock-hint">
          {unlock
            ? t("shop.nextUnlock", {
                required: unlock.required,
                rarity: t(`rarity.${unlock.rarity}`),
              })
            : t("shop.allUnlocked")}
        </p>
        <ul className="loop-tournaments">
          {visibleDiscs.map((disc) => {
            const price = getDiscPrice(disc);
            return (
              <li key={disc.id} className="loop-tournament">
                <div className="loop-tournament-info">
                  <strong>
                    <Avatar {...getDiscAvatar(disc)} size="sm" /> {disc.name}{" "}
                    <span
                      className={`rarity-badge rarity-${disc.rarity.toLowerCase()}`}
                    >
                      {t(`rarity.${disc.rarity}`)}
                    </span>
                  </strong>
                  <span className="loop-meta">
                    {t("shop.discMeta", {
                      type: t(`discType.${disc.type}`),
                      rarity: t(`rarity.${disc.rarity}`),
                      bonus: disc.bonus,
                      price: formatMoney(price),
                    })}
                  </span>
                </div>
                <div className="loop-train-buttons">
                  <button
                    className="btn"
                    disabled={club.money < price}
                    onClick={() => onBuy(disc)}
                  >
                    {t("shop.buy")}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        <h3>{t("shop.loadouts")}</h3>
        <div className="loop-roster">
          {players.map((player) => {
            const equipped = player.equipped ?? {};
            return (
              <div key={player.id} className="loop-player">
                <div className="loop-player-head">
                  <Avatar {...getPlayerAvatar(player)} />
                  <strong>{playerFullName(player)}</strong>
                  <span className="player-rating" title={t("player.rating")}>
                    {player.rating ?? t("player.unrated")}
                  </span>
                </div>
                <div className="equip-slots">
                  {DISC_TYPES.map((type) => {
                    const current = equipped[type];
                    const options = inventory.filter((d) => d.type === type);
                    return (
                      <div
                        key={type}
                        className={`equip-slot ${current ? "equip-slot--filled" : "equip-slot--empty"}`}
                      >
                        <span className="equip-slot-type">
                          {t(`discType.${type}`)}
                        </span>
                        {current ? (
                          <>
                            <div className="equip-slot-disc">
                              <Avatar {...getDiscAvatar(current)} size="sm" />
                              <span className="equip-slot-name">
                                {current.name}
                              </span>
                            </div>
                            <div className="equip-slot-meta">
                              <span className="equip-slot-bonus">
                                +{current.bonus}
                              </span>
                              <span
                                className={`rarity-badge rarity-${current.rarity.toLowerCase()}`}
                              >
                                {t(`rarity.${current.rarity}`)}
                              </span>
                              <button
                                className="btn btn-small equip-slot-remove"
                                onClick={() => onUnequip(player, type)}
                                title={t("shop.unequip")}
                              >
                                ×
                              </button>
                            </div>
                          </>
                        ) : (
                          <select
                            className="btn btn-small equip-slot-select"
                            value=""
                            onChange={(e) => onEquip(player, e.target.value)}
                            disabled={options.length === 0}
                          >
                            <option value="">
                              {options.length === 0
                                ? t("shop.empty")
                                : t("shop.equipPlaceholder")}
                            </option>
                            {options.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name} (+{d.bonus})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <button
          className="btn btn-primary"
          disabled={!allEquipped}
          onClick={() => {
            setNotice(null);
            setFlowStage("training");
          }}
        >
          {t("shop.continue")}
        </button>
      </section>
    );
  }

  // -- Stage: training (before each tournament) --------------------------
  if (flowStage === "training") {
    return (
      <TrainingStage
        key={flowStage}
        stepper={stepper}
        noticeBar={noticeBar}
        setNotice={setNotice}
        onRankings={() => setShowRankings(true)}
      />
    );
  }

  // -- Stage: tournament -------------------------------------------------
  if (flowStage === "tournament") {
    const available = getAvailableTournaments(club.reputation);
    // Approximate the reputation the club had before its most recent result,
    // so tournaments crossing the threshold this round can be flagged as
    // newly unlocked.
    const previousReputation =
      club.reputation - (lastTournament?.clubReputation ?? 0);
    const isNewlyUnlocked = (tournament: Tournament) =>
      tournament.reputationRequired > previousReputation &&
      tournament.reputationRequired <= club.reputation;

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
      // Tournament played → show the full leaderboard on the results screen.
      // The season is advanced later, from the results "Continue" button.
      setNotice(null);
      setFlowStage("results");
    };

    const newlyUnlocked = available.filter(isNewlyUnlocked);

    return (
      <section className={`loop loop-stage-${flowStage}`} key={flowStage}>
        <StatusHeader onRankings={() => setShowRankings(true)} />
        {stepper}
        <h2>{t("loop.selectTitle")}</h2>
        <p className="loop-lead">{t("tournament.intro")}</p>
        {noticeBar}
        {newlyUnlocked.length > 0 ? (
          <div className="level-up-banner">
            <span className="level-up-banner-title">
              <Icon name="star" size={15} /> {t("tournament.levelUpTitle")}
            </span>
            <span className="level-up-banner-body">
              {newlyUnlocked.map((tournament) => tournament.name).join(", ")}
            </span>
          </div>
        ) : null}
        <ul className="loop-tournaments">
          {available.map((tournament) => {
            const fee = getEntryFee(tournament);
            const eligibility = checkEntryEligibility(club, tournament);
            const unlocked = isNewlyUnlocked(tournament);
            return (
              <li
                key={tournament.id}
                className={`loop-tournament${
                  unlocked ? " loop-tournament-unlocked" : ""
                }`}
              >
                <div className="loop-tournament-info">
                  <strong>
                    {tournament.name}{" "}
                    <span className="tournament-stars">
                      {Array.from({ length: tournament.difficulty }).map((_, i) => (
                        <Icon key={i} name="star" size={12} />
                      ))}
                    </span>
                    {unlocked ? (
                      <span className="unlocked-badge">
                        <Icon name="check" size={12} /> {t("tournament.unlocked")}
                      </span>
                    ) : null}
                  </strong>
                  <span className="loop-meta">
                    {t("loop.tournamentMeta", {
                      rounds: tournament.rounds,
                      holes: tournament.holesPerRound,
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

  // -- Stage: results (tournament leaderboard) ---------------------------
  if (flowStage === "results") {
    return (
      <ResultsStage
        key={lastTournament?.tournamentName ?? "results"}
        lastTournament={lastTournament}
        players={players}
        onRankings={() => setShowRankings(true)}
        onContinue={() => {
          const next = advanceSeason();
          setNotice(null);
          setFlowStage(isSeasonComplete(next) ? "complete" : "training");
        }}
      />
    );
  }

  // -- Stage: complete (season summary) ----------------------------------
  const summary = summariseSeason(season);
  return (
    <section className={`loop loop-stage-${flowStage}`} key={flowStage}>
      <StatusHeader onRankings={() => setShowRankings(true)} />
      <h2>
        <Icon name="trophy" size={20} /> {t("loop.seasonComplete", { n: summary.season })}
      </h2>
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
          {t("loop.reputationGained")}: <strong>+{summary.totalReputation}</strong>
        </li>
      </ul>
      <button
        className="btn btn-primary"
        onClick={() => {
          setNotice(null);
          startSeason();
        }}
      >
        {t("loop.startNextSeason")}
      </button>
    </section>
  );
}

/** Pre-tournament training screen: stat bars per player plus floating "+N" feedback on each session. */
function TrainingStage({
  stepper,
  noticeBar,
  setNotice,
  onRankings,
}: {
  stepper: ReactNode;
  noticeBar: ReactNode;
  setNotice: (notice: Notice | null) => void;
  onRankings: () => void;
}) {
  const { t } = useTranslation();
  const club = useGameStore((s) => s.club);
  const players = useGameStore((s) => s.players);
  const setFlowStage = useGameStore((s) => s.setFlowStage);
  const trainPlayer = useGameStore((s) => s.trainPlayer);

  const popups = useFloatingNumbers();

  const onTrain = (player: Player, type: TrainingType) => {
    const result = trainPlayer(player.id, type);
    if (!result) {
      setNotice({ tone: "bad", text: t("loop.noTrainFunds") });
      return;
    }
    popups.push(`+${result.boost} ${t(`stat.${result.stat}`)}!`, "good", player.id);
    setNotice({
      tone: "good",
      text: t("loop.trained", {
        player: playerFullName(player),
        stat: t(`stat.${result.stat}`),
        boost: result.boost,
        newValue: result.newValue,
        cost: formatMoney(result.cost),
      }),
    });
  };

  return (
    <section className="loop loop-stage-training">
      <StatusHeader onRankings={onRankings} />
      {stepper}
      <h2>{t("loop.trainingTitle")}</h2>
      <p className="loop-lead">{t("training.intro")}</p>
      {noticeBar}
      <div className="loop-roster">
        {players.map((player) => {
          const effective = effectivePlayer(player);
          return (
            <div
              key={player.id}
              className="loop-player floating-number-host"
            >
              <div className="loop-player-head">
                <Avatar {...getPlayerAvatar(player)} />
                <strong>{playerFullName(player)}</strong>
                <span className="player-rating" title={t("player.rating")}>
                  {player.rating ?? t("player.unrated")}
                </span>
              </div>
              <div className="stat-bars">
                {STAT_KEYS.map((stat) => (
                  <StatBar
                    key={stat}
                    label={t(`stat.${stat}`)}
                    value={player[stat]}
                    effectiveValue={effective[stat]}
                  />
                ))}
              </div>
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
              <FloatingNumbers
                items={popups.items.filter((item) => item.groupId === player.id)}
              />
            </div>
          );
        })}
      </div>
      <div className="loop-train-buttons">
        <button
          className="btn"
          onClick={() => {
            setNotice(null);
            setFlowStage("shop");
          }}
        >
          {t("training.toShop")}
        </button>
        <button
          className="btn btn-primary"
          onClick={() => {
            setNotice(null);
            setFlowStage("tournament");
          }}
        >
          {t("training.toTournament")}
        </button>
      </div>
    </section>
  );
}

/**
 * Tournament results screen. Plays the club's best finisher's round
 * hole-by-hole first (skippable), then reveals the full leaderboard — gives
 * the otherwise-instant simulation a sense of "watching it happen".
 */
function ResultsStage({
  lastTournament,
  players,
  onContinue,
  onRankings,
}: {
  lastTournament: TournamentSummary | null;
  players: Player[];
  onContinue: () => void;
  onRankings: () => void;
}) {
  const { t } = useTranslation();
  const [showLeaderboard, setShowLeaderboard] = useState(
    !lastTournament || lastTournament.playerTracks.length === 0
  );

  const clubWon =
    lastTournament?.rows.some(
      (row) => row.isClubPlayer && row.placement === 1
    ) ?? false;
  const playersByName = new Map(players.map((p) => [playerFullName(p), p]));

  return (
    <section className="loop loop-stage-results">
      {clubWon && showLeaderboard ? <Confetti /> : null}
      <StatusHeader onRankings={onRankings} />
      <h2>{t("results.title")}</h2>
      {lastTournament ? (
        !showLeaderboard ? (
          <HolePlayback
            tracks={lastTournament.playerTracks}
            onDone={() => setShowLeaderboard(true)}
          />
        ) : (
          <>
            <p className="loop-lead">
              {t("results.subtitle", { name: lastTournament.tournamentName })}
            </p>
            <div className="results-club-indicator" />
            <ol className="leaderboard">
              <li className="leaderboard-head">
                <span className="leaderboard-pos">{t("results.colPos")}</span>
                <span className="leaderboard-name">
                  {t("results.colPlayer")}
                </span>
                <span className="leaderboard-score">
                  {t("results.colScore")}
                </span>
                <span className="leaderboard-rating">
                  {t("results.colRating")}
                </span>
                <span className="leaderboard-earn">
                  {t("results.colEarnings")}
                </span>
              </li>
              {lastTournament.rows.map((row) => {
                const resultClass = !row.isClubPlayer
                  ? ""
                  : row.placement === 1
                  ? " leaderboard-win"
                  : row.earnings > 0
                  ? " leaderboard-good"
                  : " leaderboard-bad";
                const clubPlayer = playersByName.get(row.playerName);
                const avatar = clubPlayer
                  ? getPlayerAvatar(clubPlayer)
                  : getNameAvatar(row.playerName);
                const medal = getPlacementMedal(row.placement);
                return (
                  <li
                    key={`${row.placement}-${row.playerName}`}
                    className={`leaderboard-row${resultClass}`}
                  >
                    <span className="leaderboard-pos">
                      {medal ?? row.placement}
                    </span>
                    <span className="leaderboard-name">
                      <Avatar {...avatar} size="sm" />
                      <span className="leaderboard-name-text">{row.playerName}</span>
                      {row.isClubPlayer ? (
                        <span className="leaderboard-badge">
                          {t("results.you")}
                        </span>
                      ) : null}
                    </span>
                    <span className="leaderboard-score">
                      {formatScoreToPar(row.totalScore)}
                    </span>
                    <span className="leaderboard-rating">{row.rating}</span>
                    <span className="leaderboard-earn">
                      {formatMoney(row.earnings)}
                    </span>
                  </li>
                );
              })}
            </ol>
            <button className="btn btn-primary" onClick={onContinue}>
              {t("results.continue")}
            </button>
          </>
        )
      ) : (
        <button className="btn btn-primary" onClick={onContinue}>
          {t("results.continue")}
        </button>
      )}
    </section>
  );
}
