import type { Player } from "@/models/Player";
import type { TournamentResult } from "@/models/Tournament";
import { playerFullName } from "@/models/Player";
import { useTranslation } from "@/hooks/useTranslation";
import { formatMoney } from "@/utils/format";
import { getPlayerAvatar } from "@/utils/avatar";
import Avatar from "@/components/Avatar";
import StatBar from "@/components/StatBar";
import StatChart from "@/components/StatChart";
import { effectivePlayer } from "@/game";

const STAT_KEYS: ("power" | "accuracy" | "putting" | "scramble" | "consistency" | "mental" | "fitness")[] = [
  "power",
  "accuracy",
  "putting",
  "scramble",
  "consistency",
  "mental",
  "fitness",
];

interface PlayerModalProps {
  player: Player;
  allTournaments: TournamentResult[];
  onClose: () => void;
}

export default function PlayerModal({ player, allTournaments, onClose }: PlayerModalProps) {
  const { t } = useTranslation();

  const relevant = allTournaments.filter((tr) =>
    tr.playerResults?.some((pr) => pr.playerId === player.id)
  );

  const playerResults = relevant.flatMap(
    (tr) => tr.playerResults?.filter((pr) => pr.playerId === player.id) ?? []
  );

  const tournamentsPlayed = playerResults.length;
  const wins = playerResults.filter((pr) => pr.placement === 1).length;
  const podiums = playerResults.filter((pr) => pr.placement <= 3).length;
  const totalEarnings = playerResults.reduce((sum, pr) => sum + pr.earnings, 0);
  const bestPlacement = playerResults.length
    ? Math.min(...playerResults.map((pr) => pr.placement))
    : null;

  const history = player.seasonHistory ?? [];
  const effective = effectivePlayer(player);

  const chartStats: { key: "power" | "accuracy" | "putting"; label: string }[] = [
    { key: "power", label: t("stat.power") },
    { key: "accuracy", label: t("stat.accuracy") },
    { key: "putting", label: t("stat.putting") },
  ];

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal player-modal">
        <div className="player-modal-header">
          <Avatar {...getPlayerAvatar(player)} />
          <div>
            <strong>{playerFullName(player)}</strong>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
              <span className="player-rating" title={t("player.rating")}>
                {player.rating ?? t("player.unrated")}
              </span>
              <span className="player-consistency" title={t("stat.consistency")}>
                {player.consistency}
              </span>
            </div>
          </div>
          <button
            className="btn btn-small"
            style={{ marginLeft: "auto" }}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="player-modal-section">
          <h3>{t("player.overview")}</h3>
          <div className="stat-bars">
            {STAT_KEYS.map((stat) => (
              <StatBar
                key={stat}
                label={t(`stat.${stat}`)}
                value={player[stat]}
                effectiveValue={effective[stat]}
              />
            ))}
          </div>
        </div>

        <div className="player-modal-section">
          <h3>{t("player.careerStats")}</h3>
          <div className="career-stats-grid">
            <div className="career-stat">
              <span className="career-stat-value">{tournamentsPlayed}</span>
              <span className="career-stat-label">{t("player.tournamentsPlayed")}</span>
            </div>
            <div className="career-stat">
              <span className="career-stat-value">{wins}</span>
              <span className="career-stat-label">{t("player.wins")}</span>
            </div>
            <div className="career-stat">
              <span className="career-stat-value">{podiums}</span>
              <span className="career-stat-label">{t("player.podiums")}</span>
            </div>
            <div className="career-stat">
              <span className="career-stat-value">{formatMoney(totalEarnings)}</span>
              <span className="career-stat-label">{t("player.totalEarnings")}</span>
            </div>
            <div className="career-stat">
              <span className="career-stat-value">
                {bestPlacement !== null ? `#${bestPlacement}` : "—"}
              </span>
              <span className="career-stat-label">{t("player.bestPlacement")}</span>
            </div>
          </div>
        </div>

        <div className="player-modal-section">
          <h3>{t("player.statProgression")}</h3>
          {history.length >= 2 ? (
            chartStats.map(({ key, label }) => (
              <StatChart
                key={key}
                data={history.map((h) => ({ season: h.season, value: h[key] }))}
                label={label}
              />
            ))
          ) : (
            <p className="stat-chart-notice">{t("player.progressionHint")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
