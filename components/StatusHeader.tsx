"use client";

import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";
import { useTranslation } from "@/hooks/useTranslation";
import { formatMoney } from "@/utils/format";
import { useFloatingNumbers } from "@/hooks/useFloatingNumbers";
import FloatingNumbers from "@/components/FloatingNumbers";

/** Persistent club status bar shown on every in-game flow step. */
export default function StatusHeader() {
  const { t } = useTranslation();
  const club = useGameStore((s) => s.club);
  const season = useGameStore((s) => s.season);

  const moneyFloats = useFloatingNumbers();
  const repFloats = useFloatingNumbers();
  const prevMoney = useRef(club.money);
  const prevRep = useRef(club.reputation);

  useEffect(() => {
    const diff = club.money - prevMoney.current;
    if (diff !== 0) {
      moneyFloats.push(
        `${diff > 0 ? "+" : ""}${formatMoney(diff)}`,
        diff > 0 ? "good" : "bad"
      );
    }
    prevMoney.current = club.money;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [club.money]);

  useEffect(() => {
    const diff = club.reputation - prevRep.current;
    if (diff !== 0) {
      repFloats.push(`${diff > 0 ? "+" : ""}${diff} ⭐`, diff > 0 ? "good" : "bad");
    }
    prevRep.current = club.reputation;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [club.reputation]);

  return (
    <header className="loop-status">
      <div>
        <span className="loop-status-label">{t("loop.club")}</span>
        <strong>{club.name}</strong>
      </div>
      <div className="floating-number-host">
        <span className="loop-status-label">{t("loop.money")}</span>
        <strong>{formatMoney(club.money)}</strong>
        <FloatingNumbers items={moneyFloats.items} />
      </div>
      <div className="floating-number-host">
        <span className="loop-status-label">{t("loop.reputation")}</span>
        <strong>{club.reputation}</strong>
        <FloatingNumbers items={repFloats.items} />
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
