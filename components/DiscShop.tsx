"use client";

import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { DISCS, getDiscPrice } from "@/game";
import type { Disc, DiscType, Player } from "@/types";

/** Disc type slots, used to render each player's loadout in a fixed order. */
const DISC_TYPES: DiscType[] = ["Driver", "Midrange", "Putter"];

function formatMoney(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}

/** A short status line shown after a buy / equip action. */
interface Notice {
  tone: "good" | "bad";
  text: string;
}

/**
 * Disc shop + loadout manager. Lets the player buy discs from the catalogue
 * (charged against club money) and equip / unequip owned discs on each player.
 * Reads and drives the Zustand store; all rules live in the pure disc engine.
 */
export default function DiscShop() {
  const club = useGameStore((s) => s.club);
  const players = useGameStore((s) => s.players);
  const inventory = useGameStore((s) => s.inventory);
  const buyDisc = useGameStore((s) => s.buyDisc);
  const equipDisc = useGameStore((s) => s.equipDisc);
  const unequipDisc = useGameStore((s) => s.unequipDisc);

  const [notice, setNotice] = useState<Notice | null>(null);

  // No game in progress yet — nothing to shop for.
  if (players.length === 0) {
    return null;
  }

  const onBuy = (disc: Disc) => {
    const bought = buyDisc(disc.id);
    if (!bought) {
      setNotice({
        tone: "bad",
        text: `Not enough money to buy ${disc.name} (${formatMoney(
          getDiscPrice(disc)
        )}).`,
      });
      return;
    }
    setNotice({ tone: "good", text: `Bought ${bought.name}.` });
  };

  const onEquip = (player: Player, discId: string) => {
    if (!discId) return;
    const disc = inventory.find((d) => d.id === discId);
    equipDisc(player.id, discId);
    setNotice({
      tone: "good",
      text: `Equipped ${disc?.name ?? "disc"} on ${player.name}.`,
    });
  };

  const onUnequip = (player: Player, type: DiscType) => {
    unequipDisc(player.id, type);
    setNotice({ tone: "good", text: `Unequipped ${type} from ${player.name}.` });
  };

  return (
    <section className="loop">
      <h2>🛒 Disc Shop</h2>
      <p className="loop-lead">
        Buy discs to boost your players. Each disc type raises one stat; equip
        one disc per type per player.
      </p>
      {notice ? (
        <p className={`loop-notice loop-notice-${notice.tone}`}>{notice.text}</p>
      ) : null}

      <h3>Catalogue</h3>
      <ul className="loop-tournaments">
        {DISCS.map((disc) => {
          const price = getDiscPrice(disc);
          return (
            <li key={disc.id} className="loop-tournament">
              <div className="loop-tournament-info">
                <strong>{disc.name}</strong>
                <span className="loop-meta">
                  {disc.type} · {disc.rarity} · +{disc.bonus} · {formatMoney(price)}
                </span>
              </div>
              <button
                className="btn"
                disabled={club.money < price}
                onClick={() => onBuy(disc)}
              >
                Buy
              </button>
            </li>
          );
        })}
      </ul>

      <h3>Loadouts</h3>
      <div className="loop-roster">
        {players.map((player) => {
          const equipped = player.equipped ?? {};
          return (
            <div key={player.id} className="loop-player">
              <strong>{player.name}</strong>
              {DISC_TYPES.map((type) => {
                const current = equipped[type];
                // Owned discs of this type the player could equip.
                const options = inventory.filter((d) => d.type === type);
                return (
                  <div key={type} className="loop-train-buttons">
                    <span className="loop-meta">
                      {type}: {current ? `${current.name} (+${current.bonus})` : "—"}
                    </span>
                    <select
                      className="btn btn-small"
                      value=""
                      onChange={(e) => onEquip(player, e.target.value)}
                    >
                      <option value="">Equip…</option>
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
                        Unequip
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </section>
  );
}
