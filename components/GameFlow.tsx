"use client";

import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import {
  checkEntryEligibility,
  DISCS,
  effectivePlayerStats,
  getAvailableTournaments,
  getDiscPrice,
  getEntryFee,
  isSeasonComplete,
  summariseSeason,
  TRAINING_PROGRAMS,
} from "@/game";
import type { Disc, DiscType, Player, Tournament, TrainingType } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";
import StartScreen from "@/components/StartScreen";
import StatusHeader from "@/components/StatusHeader";
import FlowStepper from "@/components/FlowStepper";
import { formatMoney } from "@/utils/format";

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

  const setFlowStage = useGameStore((s) => s.setFlowStage);
  const startSeason = useGameStore((s) => s.startSeason);
  const playTournamentRound = useGameStore((s) => s.playTournamentRound);
  const advanceSeason = useGameStore((s) => s.advanceSeason);
  const trainPlayer = useGameStore((s) => s.trainPlayer);
  const buyDisc = useGameStore((s) => s.buyDisc);
  const equipDisc = useGameStore((s) => s.equipDisc);
  const unequipDisc = useGameStore((s) => s.unequipDisc);

  const [notice, setNotice] = useState<Notice | null>(null);

  // No game in progress — show the start screen.
  if (season.phase === "preseason") {
    return <StartScreen />;
  }

  const noticeBar = notice ? (
    <p className={`loop-notice loop-notice-${notice.tone}`}>{notice.text}</p>
  ) : null;

  const stepper =
    flowStage === "complete" ? null : <FlowStepper current={flowStage} />;

  // -- Stage: intro ------------------------------------------------------
  if (flowStage === "intro") {
    return (
      <section className="loop">
        <StatusHeader />
        {stepper}
        <h2>{t("intro.title")}</h2>
        <p className="loop-lead">
          {t("intro.body1", {
            count: players.length,
            names: players.map((p) => p.name).join(", "),
          })}
        </p>
        <p className="loop-lead">
          {t("intro.body2", { total: players.length * DISC_TYPES.length })}
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
      const bought = buyDisc(disc.id);
      setNotice(
        bought
          ? { tone: "good", text: t("shop.bought", { name: bought.name }) }
          : {
              tone: "bad",
              text: t("shop.noFunds", {
                name: disc.name,
                price: formatMoney(getDiscPrice(disc)),
              }),
            }
      );
    };

    const onEquip = (player: Player, discId: string) => {
      if (!discId) return;
      const disc = inventory.find((d) => d.id === discId);
      equipDisc(player.id, discId);
      setNotice({
        tone: "good",
        text: t("shop.equipped", {
          name: disc?.name ?? "",
          player: player.name,
        }),
      });
    };

    const onUnequip = (player: Player, type: DiscType) => {
      unequipDisc(player.id, type);
      setNotice({
        tone: "good",
        text: t("shop.unequipped", {
          type: t(`discType.${type}`),
          player: player.name,
        }),
      });
    };

    return (
      <section className="loop">
        <StatusHeader />
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
        <ul className="loop-tournaments">
          {DISCS.map((disc) => {
            const price = getDiscPrice(disc);
            return (
              <li key={disc.id} className="loop-tournament">
                <div className="loop-tournament-info">
                  <strong>{disc.name}</strong>
                  <span className="loop-meta">
                    {t("shop.discMeta", {
                      type: t(`discType.${disc.type}`),
                      rarity: t(`rarity.${disc.rarity}`),
                      bonus: disc.bonus,
                      price: formatMoney(price),
                    })}
                  </span>
                </div>
                <button
                  className="btn"
                  disabled={club.money < price}
                  onClick={() => onBuy(disc)}
                >
                  {t("shop.buy")}
                </button>
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
                <strong>{player.name}</strong>
                {DISC_TYPES.map((type) => {
                  const current = equipped[type];
                  const options = inventory.filter((d) => d.type === type);
                  return (
                    <div key={type} className="loop-train-buttons">
                      <span className="loop-meta">
                        {t("shop.slot", {
                          type: t(`discType.${type}`),
                          value: current
                            ? t("shop.slotEquipped", {
                                name: current.name,
                                bonus: current.bonus,
                              })
                            : t("shop.empty"),
                        })}
                      </span>
                      <select
                        className="btn btn-small"
                        value=""
                        onChange={(e) => onEquip(player, e.target.value)}
                      >
                        <option value="">{t("shop.equipPlaceholder")}</option>
                        {options.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} (+{d.bonus})
                          </option>
                        ))}
                      </select>
                      {current ? (
                        <button
                          className="btn btn-small"
                          onClick={() => onUnequip(player, type)}
                        >
                          {t("shop.unequip")}
                        </button>
                      ) : null}
                    </div>
                  );
                })}
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
        <StatusHeader />
        {stepper}
        <h2>{t("loop.trainingTitle")}</h2>
        <p className="loop-lead">{t("training.intro")}</p>
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

  // -- Stage: tournament -------------------------------------------------
  if (flowStage === "tournament") {
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
      // Tournament played → advance the season and move to the next step:
      // training again, or the season summary if every round is done.
      const next = advanceSeason();
      const { result, settlement } = outcome;
      setNotice({
        tone: "good",
        text: t("loop.entered", {
          placement: result.placement,
          earnings: formatMoney(settlement.earnings),
          rep: settlement.reputationGained,
        }),
      });
      setFlowStage(isSeasonComplete(next) ? "complete" : "training");
    };

    return (
      <section className="loop">
        <StatusHeader />
        {stepper}
        <h2>{t("loop.selectTitle")}</h2>
        <p className="loop-lead">{t("tournament.intro")}</p>
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

  // -- Stage: complete (season summary) ----------------------------------
  const summary = summariseSeason(season);
  return (
    <section className="loop">
      <StatusHeader />
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
