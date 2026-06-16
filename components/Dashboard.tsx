"use client";

import { useGameStore } from "@/store/gameStore";
import { effectivePlayerStats, TRAINING_PROGRAMS } from "@/game";

function formatMoney(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}

export default function Dashboard() {
  const club = useGameStore((s) => s.club);
  const players = useGameStore((s) => s.players);
  const tournaments = useGameStore((s) => s.tournaments);
  const inventory = useGameStore((s) => s.inventory);
  const season = useGameStore((s) => s.season);

  return (
    <div className="dash-grid">
      <section className="dash-card">
        <h3>Club Overview</h3>
        <ul className="dash-list">
          <li>
            Name <strong>{club.name}</strong>
          </li>
          <li>
            Money <strong>{formatMoney(club.money)}</strong>
          </li>
          <li>
            Reputation <strong>{club.reputation}</strong>
          </li>
          <li>
            Season <strong>{season.season}</strong>
          </li>
        </ul>
      </section>

      <section className="dash-card">
        <h3>Players</h3>
        {players.length === 0 ? (
          <p className="dash-empty">No players yet.</p>
        ) : (
          <ul className="dash-list">
            {players.map((player) => {
              const stats = effectivePlayerStats(player);
              return (
                <li key={player.id}>
                  <strong>{player.name}</strong>
                  <span className="loop-meta">
                    {" "}
                    DRV {stats.Driving} · ACC {stats.Accuracy} · PUT{" "}
                    {stats.Putting} · MEN {stats.Mental} · STA {stats.Stamina}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="dash-card">
        <h3>Tournaments</h3>
        {tournaments.length === 0 ? (
          <p className="dash-empty">No tournaments played yet.</p>
        ) : (
          <ul className="dash-list">
            {tournaments.map((result) => (
              <li key={result.id}>
                <strong>{result.tournamentName}</strong>
                <span className="loop-meta">
                  {" "}
                  #{result.placement} · {formatMoney(result.earnings)} · +
                  {result.reputationGained} rep
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="dash-card">
        <h3>Training</h3>
        <ul className="dash-list">
          {TRAINING_PROGRAMS.map((program) => (
            <li key={program.type}>
              <strong>{program.name}</strong>
              <span className="loop-meta">
                {" "}
                trains {program.stat} · {formatMoney(program.cost)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="dash-card">
        <h3>Inventory</h3>
        {inventory.length === 0 ? (
          <p className="dash-empty">No discs owned yet.</p>
        ) : (
          <ul className="dash-list">
            {inventory.map((disc) => (
              <li key={disc.id}>
                <strong>{disc.name}</strong>
                <span className="loop-meta">
                  {" "}
                  {disc.type} · {disc.rarity} · +{disc.bonus}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
