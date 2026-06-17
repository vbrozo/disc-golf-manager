"use client";

import { useMemo } from "react";
import { useGameStore } from "@/store/gameStore";
import { useTranslation } from "@/hooks/useTranslation";
import { playerFullName, getPlayerSpecialty } from "@/models/Player";
import Icon from "@/components/Icon";

interface RankingListProps {
  onClose: () => void;
}

export default function RankingList({ onClose }: RankingListProps) {
  const { t } = useTranslation();
  const players = useGameStore((s) => s.players);
  const npcRoster = useGameStore((s) => s.npcRoster);

  const ranked = useMemo(() => {
    const all = [
      ...players.map((p) => ({ ...p, isClub: true })),
      ...npcRoster.map((p) => ({ ...p, isClub: false })),
    ];
    return all
      .filter((p) => p.rating !== undefined)
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }, [players, npcRoster]);

  const clubPlayerIds = new Set(players.map((p) => p.id));

  return (
    <div className="rankings-overlay">
      <div className="rankings-header">
        <h2>
          <Icon name="trophy" size={20} /> {t("rankings.title")}
        </h2>
        <button className="btn btn-small" onClick={onClose}>
          {t("rankings.close")}
        </button>
      </div>

      <p className="loop-meta">
        {t("rankings.subtitle", { total: ranked.length })}
      </p>

      <div className="rankings-table-wrap">
        <table className="rankings-table">
          <thead>
            <tr>
              <th className="rankings-col-pos">#</th>
              <th className="rankings-col-name">{t("rankings.colName")}</th>
              <th className="rankings-col-rating">{t("rankings.colRating")}</th>
              <th className="rankings-col-overall">{t("rankings.colOverall")}</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((player, index) => {
              const isClub = clubPlayerIds.has(player.id);
              return (
                <tr
                  key={player.id}
                  className={isClub ? "rankings-row rankings-row-club" : "rankings-row"}
                >
                  <td className="rankings-col-pos">{index + 1}</td>
                  <td className="rankings-col-name">
                    {playerFullName(player)}
                    {isClub ? (
                      <span className="leaderboard-badge">{t("results.you")}</span>
                    ) : null}
                    <span className="specialty-badge">{t(`specialty.${getPlayerSpecialty(player)}`)}</span>
                  </td>
                  <td className="rankings-col-rating">{player.rating ?? "—"}</td>
                  <td className="rankings-col-overall">{player.overall}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
