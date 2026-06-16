"use client";

import { useGameStore } from "@/store/gameStore";
import { useTranslation } from "@/hooks/useTranslation";

function formatMoney(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}

/** Persistent club status bar shown on every in-game flow step. */
export default function StatusHeader() {
  const { t } = useTranslation();
  const club = useGameStore((s) => s.club);
  const season = useGameStore((s) => s.season);

  return (
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
}
