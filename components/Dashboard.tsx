"use client";

import { useGameStore } from "@/store/gameStore";
import { effectivePlayerStats, TRAINING_PROGRAMS } from "@/game";
import { useTranslation } from "@/hooks/useTranslation";

function formatMoney(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}

export default function Dashboard() {
  const { t } = useTranslation();

  const club = useGameStore((s) => s.club);
  const players = useGameStore((s) => s.players);
  const tournaments = useGameStore((s) => s.tournaments);
  const inventory = useGameStore((s) => s.inventory);
  const season = useGameStore((s) => s.season);

  return (
    <div className="dash-grid">
      <section className="dash-card">
        <h3>{t("dash.clubOverview")}</h3>
        <ul className="dash-list">
          <li>
            {t("dash.name")} <strong>{club.name}</strong>
          </li>
          <li>
            {t("loop.money")} <strong>{formatMoney(club.money)}</strong>
          </li>
          <li>
            {t("loop.reputation")} <strong>{club.reputation}</strong>
          </li>
          <li>
            {t("loop.season")} <strong>{season.season}</strong>
          </li>
        </ul>
      </section>

      <section className="dash-card">
        <h3>{t("dash.players")}</h3>
        {players.length === 0 ? (
          <p className="dash-empty">{t("dash.noPlayers")}</p>
        ) : (
          <ul className="dash-list">
            {players.map((player) => {
              const stats = effectivePlayerStats(player);
              return (
                <li key={player.id}>
                  <strong>{player.name}</strong>
                  <span className="loop-meta">
                    {" "}
                    {t("dash.playerStats", {
                      drv: stats.Driving,
                      acc: stats.Accuracy,
                      put: stats.Putting,
                      men: stats.Mental,
                      sta: stats.Stamina,
                    })}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="dash-card">
        <h3>{t("dash.tournaments")}</h3>
        {tournaments.length === 0 ? (
          <p className="dash-empty">{t("dash.noTournaments")}</p>
        ) : (
          <ul className="dash-list">
            {tournaments.map((result) => (
              <li key={result.id}>
                <strong>{result.tournamentName}</strong>
                <span className="loop-meta">
                  {" "}
                  {t("dash.tournamentResult", {
                    placement: result.placement,
                    earnings: formatMoney(result.earnings),
                    rep: result.reputationGained,
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="dash-card">
        <h3>{t("dash.training")}</h3>
        <ul className="dash-list">
          {TRAINING_PROGRAMS.map((program) => (
            <li key={program.type}>
              <strong>{t(`program.${program.type}`)}</strong>
              <span className="loop-meta">
                {" "}
                {t("dash.trainingItem", {
                  stat: t(`stat.${program.stat}`),
                  cost: formatMoney(program.cost),
                })}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="dash-card">
        <h3>{t("dash.inventory")}</h3>
        {inventory.length === 0 ? (
          <p className="dash-empty">{t("dash.noDiscs")}</p>
        ) : (
          <ul className="dash-list">
            {inventory.map((disc) => (
              <li key={disc.id}>
                <strong>{disc.name}</strong>
                <span className="loop-meta">
                  {" "}
                  {t("dash.inventoryItem", {
                    type: t(`discType.${disc.type}`),
                    rarity: t(`rarity.${disc.rarity}`),
                    bonus: disc.bonus,
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
