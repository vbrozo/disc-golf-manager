"use client";

import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { DISCS, getDiscPrice } from "@/game";
import type { Disc, DiscType, Player } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";

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
  const { t } = useTranslation();

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
        text: t("shop.noFunds", {
          name: disc.name,
          price: formatMoney(getDiscPrice(disc)),
        }),
      });
      return;
    }
    setNotice({ tone: "good", text: t("shop.bought", { name: bought.name }) });
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
      <h2>{t("shop.title")}</h2>
      <p className="loop-lead">{t("shop.lead")}</p>
      {notice ? (
        <p className={`loop-notice loop-notice-${notice.tone}`}>{notice.text}</p>
      ) : null}

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
                // Owned discs of this type the player could equip.
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
    </section>
  );
}
