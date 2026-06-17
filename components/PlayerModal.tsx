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
import { PLAYER_STAT_KEYS, getPlayerSpecialty } from "@/types";

// PDGA ratings span roughly 600–1100; normalise to 0–100 for the chart.
function normaliseRating(rating: number): number {
  return Math.round(Math.max(0, Math.min(100, ((rating - 600) / 500) * 100)));
}

interface PlayerModalProps {
  player: Player;
  allTournaments: TournamentResult[];
  onClose: () => void;
}

export default function PlayerModal({ player, allTournaments, onClose }: PlayerModalProps) {
  const { t } = useTranslation();

  const playerResults = allTournaments.flatMap(
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
  const tournamentHistory = player.tournamentHistory ?? [];

  const chartStats: { key: "power" | "accuracy" | "putting"; label: string }[] = [
    { key: "power", label: t("stat.power") },
    { key: "accuracy", label: t("stat.accuracy") },
    { key: "putting", label: t("stat.putting") },
  ];

  const activeInjuries = player.injuries?.filter((inj) => inj.weeksRemaining > 0) ?? [];
  const injuryPenaltyPts = activeInjuries.length * 5;

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
              <span className="specialty-badge" title={t("player.specialty")}>
                {t(`specialty.${getPlayerSpecialty(player)}`)}
              </span>
              {activeInjuries.length > 0 && (
                <span className="injury-chip" title={t("injury.penalty", { pts: injuryPenaltyPts })}>
                  🤕 ×{activeInjuries.length}
                </span>
              )}
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

        {/* Injuries section */}
        <div className="player-modal-section">
          <h3>{t("injury.title")}</h3>
          {activeInjuries.length === 0 ? (
            <p className="stat-chart-notice">{t("injury.none")}</p>
          ) : (
            <ul className="injury-list">
              {activeInjuries.map((inj) => (
                <li key={inj.id} className="injury-item">
                  <span className="injury-desc">{inj.description}</span>
                  <span className="injury-meta">
                    <span className="injury-weeks">
                      {t("injury.weeksRemaining", { weeks: inj.weeksRemaining })}
                    </span>
                    <span className="injury-penalty">
                      {t("injury.penalty", { pts: 5 })}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="player-modal-section">
          <h3>{t("player.overview")}</h3>
          <div className="stat-bars">
            {PLAYER_STAT_KEYS.map((stat) => (
              <StatBar
                key={stat}
                label={t(`stat.${stat}`)}
                value={player[stat]}
                effectiveValue={effective[stat]}
                tooltip={t(`stat.${stat}.tooltip`)}
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

        {/* Rating trend across tournaments */}
        <div className="player-modal-section">
          <h3>{t("player.tournamentHistory")}</h3>
          {tournamentHistory.length >= 2 ? (
            <StatChart
              data={tournamentHistory.map((h, i) => ({
                season: i + 1,
                value: normaliseRating(h.rating),
              }))}
              color="#38bdf8"
              label={`${tournamentHistory[0]?.rating ?? "—"} → ${tournamentHistory[tournamentHistory.length - 1]?.rating ?? "—"}`}
              tooltips={tournamentHistory.map((h) => `${h.tournamentName} • #${h.placement} • ${h.rating}`)}
            />
          ) : (
            <p className="stat-chart-notice">{t("player.noTournamentHistory")}</p>
          )}
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
