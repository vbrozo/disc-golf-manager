"use client";

import { useGameStore } from "@/store/gameStore";
import { useTranslation } from "@/hooks/useTranslation";
import { formatMoney } from "@/utils/format";
import { CLUB_UPGRADES, getUpgradeCost } from "@/game";
import Icon from "@/components/Icon";
import { useState } from "react";

interface ClubUpgradesModalProps {
  onClose: () => void;
}

export default function ClubUpgradesModal({ onClose }: ClubUpgradesModalProps) {
  const { t } = useTranslation();
  const club = useGameStore((s) => s.club);
  const clubUpgrades = useGameStore((s) => s.clubUpgrades);
  const purchaseUpgrade = useGameStore((s) => s.purchaseUpgrade);
  const [notice, setNotice] = useState<string | null>(null);

  const handleBuy = (id: string) => {
    const ok = purchaseUpgrade(id);
    if (!ok) {
      setNotice(t("upgrades.noFunds"));
      setTimeout(() => setNotice(null), 2000);
    } else {
      setNotice(null);
    }
  };

  return (
    <div className="club-upgrades">
      <div className="rankings-header">
        <div>
          <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Icon name="flag" size={20} /> {t("upgrades.title")}
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "0.2rem" }}>
            {club.name}
          </p>
        </div>
        <button className="btn btn-small" onClick={onClose}>
          {t("upgrades.close")}
        </button>
      </div>

      {notice && (
        <p className="notice-bar notice-bad" style={{ marginTop: "0.75rem" }}>
          {notice}
        </p>
      )}

      <div className="upgrades-list">
        {CLUB_UPGRADES.map((upgrade) => {
          const level = clubUpgrades[upgrade.id] ?? 0;
          const cost = getUpgradeCost(upgrade.id, level);
          const isMaxed = level >= upgrade.maxLevel;
          const canAfford = cost !== null && club.money >= cost;

          return (
            <div key={upgrade.id} className={`upgrade-card${isMaxed ? " upgrade-card--maxed" : ""}`}>
              <div className="upgrade-card-info">
                <div className="upgrade-card-name">
                  {t(`upgrades.${upgrade.id}.name`)}
                  <span className={`upgrade-level-badge${isMaxed ? " upgrade-level-badge--max" : ""}`}>
                    {isMaxed
                      ? t("upgrades.maxed")
                      : t("upgrades.level", { level, max: upgrade.maxLevel })}
                  </span>
                </div>
                <p className="upgrade-card-desc">{t(`upgrades.${upgrade.id}.desc`)}</p>
                <div className="upgrade-effects">
                  {[1, 2].map((lv) => (
                    <span
                      key={lv}
                      className={`upgrade-effect${level >= lv ? " upgrade-effect--active" : ""}`}
                    >
                      Lv{lv}: {t(`upgrades.${upgrade.id}.effect${lv}`)}
                    </span>
                  ))}
                </div>
              </div>
              <div className="upgrade-card-action">
                {isMaxed ? (
                  <span className="upgrade-maxed-label">
                    <Icon name="check" size={14} />
                  </span>
                ) : (
                  <button
                    className="btn btn-small"
                    disabled={!canAfford}
                    onClick={() => handleBuy(upgrade.id)}
                  >
                    {t("upgrades.buy", { cost: formatMoney(cost!) })}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
