"use client";

import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";
import { useTranslation } from "@/hooks/useTranslation";
import { formatMoney } from "@/utils/format";
import { useFloatingNumbers } from "@/hooks/useFloatingNumbers";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import FloatingNumbers from "@/components/FloatingNumbers";
import AchievementBadges from "@/components/AchievementBadges";
import Icon from "@/components/Icon";
import { getAchievements, getCurrentStreak } from "@/game/achievements";

interface StatusHeaderProps {
  onRankings?: () => void;
  onHistory?: () => void;
}

/** Persistent club status bar shown on every in-game flow step. */
export default function StatusHeader({ onRankings, onHistory }: StatusHeaderProps = {}) {
  const { t } = useTranslation();
  const club = useGameStore((s) => s.club);
  const season = useGameStore((s) => s.season);
  const tournaments = useGameStore((s) => s.tournaments);

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
      repFloats.push(`${diff > 0 ? "+" : ""}${diff} ★`, diff > 0 ? "good" : "bad");
    }
    prevRep.current = club.reputation;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [club.reputation]);

  const achievements = getAchievements(club, tournaments);
  const streak = getCurrentStreak(tournaments);
  const displayedMoney = useAnimatedNumber(club.money);

  return (
    <>
      <header className="loop-status">
        <div>
          <span className="loop-status-label">
            <Icon name="flag" /> {t("loop.club")}
          </span>
          <strong>{club.name}</strong>
        </div>
        <div className="floating-number-host">
          <span className="loop-status-label">
            <Icon name="coin" /> {t("loop.money")}
          </span>
          <strong>{formatMoney(displayedMoney)}</strong>
          <FloatingNumbers items={moneyFloats.items} />
        </div>
        <div className="floating-number-host">
          <span className="loop-status-label">
            <Icon name="star" /> {t("loop.reputation")}
          </span>
          <strong>{club.reputation}</strong>
          <FloatingNumbers items={repFloats.items} />
        </div>
        <div>
          <span className="loop-status-label">
            <Icon name="calendar" /> {t("loop.season")}
          </span>
          <strong>{season.season}</strong>
        </div>
        <div>
          <span className="loop-status-label">{t("loop.round")}</span>
          <strong>
            {Math.min(season.round, season.totalRounds)} / {season.totalRounds}
          </strong>
        </div>
        {streak >= 2 ? (
          <div>
            <span className="loop-status-label">
              <Icon name="flame" /> {t("loop.streak")}
            </span>
            <strong className={`streak-chip${streak >= 3 ? " streak-hot" : ""}`}>
              {streak}
            </strong>
          </div>
        ) : null}
        <div className="loop-status-rankings">
          {onHistory && (
            <button className="btn btn-small" onClick={onHistory} style={{ marginRight: "0.4rem" }}>
              <Icon name="chart" size={13} /> {t("history.button")}
            </button>
          )}
          {onRankings && (
            <button className="btn btn-small" onClick={onRankings}>
              <Icon name="trophy" size={13} /> {t("rankings.button")}
            </button>
          )}
        </div>
      </header>
      <AchievementBadges achievements={achievements} />
    </>
  );
}
