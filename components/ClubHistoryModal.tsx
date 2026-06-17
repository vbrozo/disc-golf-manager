"use client";

import { useGameStore } from "@/store/gameStore";
import type { SeasonSnapshot } from "@/store/gameStore";
import { useTranslation } from "@/hooks/useTranslation";
import { formatMoney } from "@/utils/format";
import Icon from "@/components/Icon";

interface ClubHistoryModalProps {
  onClose: () => void;
}

// Normalise a value to 0–100 relative to the max in the series.
function normalise(value: number, max: number): number {
  if (max === 0) return 0;
  return Math.round((value / max) * 100);
}

interface MiniChartProps {
  data: { label: string; value: number; tooltip: string }[];
  color: string;
  title: string;
}

function MiniChart({ data, color, title }: MiniChartProps) {
  const width = 300;
  const padX = 20;
  const padY = 10;
  const height = 80;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const toX = (i: number) =>
    data.length < 2 ? padX + innerW / 2 : padX + (i / (data.length - 1)) * innerW;
  const toY = (v: number) => padY + innerH - (v / 100) * innerH;

  const gridLines = [0, 50, 100];
  const points = data.map((d, i) => `${toX(i)},${toY(d.value)}`).join(" ");

  return (
    <div className="stat-chart-wrap">
      <div className="stat-chart-label">{title}</div>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ display: "block" }}>
        {gridLines.map((v) => (
          <line
            key={v}
            x1={padX}
            y1={toY(v)}
            x2={width - padX}
            y2={toY(v)}
            stroke="#334155"
            strokeWidth={0.5}
          />
        ))}
        {data.length >= 2 && (
          <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} />
        )}
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={toX(i)} cy={toY(d.value)} r={3} fill={color}>
              <title>{d.tooltip}</title>
            </circle>
            <text x={toX(i)} y={height - 1} textAnchor="middle" fontSize={9} fill="#64748b">
              S{d.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function ClubHistoryModal({ onClose }: ClubHistoryModalProps) {
  const { t } = useTranslation();
  const clubHistory = useGameStore((s) => s.clubHistory);
  const club = useGameStore((s) => s.club);

  const maxEarnings = Math.max(...clubHistory.map((s) => s.totalEarnings), 1);
  const maxRep = Math.max(...clubHistory.map((s) => s.endReputation), 1);

  const earningsData = clubHistory.map((s) => ({
    label: String(s.season),
    value: normalise(s.totalEarnings, maxEarnings),
    tooltip: `S${s.season}: ${formatMoney(s.totalEarnings)}`,
  }));

  const repData = clubHistory.map((s) => ({
    label: String(s.season),
    value: normalise(s.endReputation, maxRep),
    tooltip: `S${s.season}: ${s.endReputation} rep`,
  }));

  return (
    <div className="club-history">
      <div className="rankings-header">
        <div>
          <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Icon name="chart" size={20} /> {t("history.title")}
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "0.2rem" }}>
            {club.name}
          </p>
        </div>
        <button className="btn btn-small" onClick={onClose}>
          {t("history.close")}
        </button>
      </div>

      {clubHistory.length === 0 ? (
        <p className="stat-chart-notice" style={{ marginTop: "1rem" }}>
          {t("history.noHistory")}
        </p>
      ) : (
        <>
          <div className="history-charts">
            <MiniChart
              data={earningsData}
              color="#4ade80"
              title={t("history.chartEarnings")}
            />
            <MiniChart
              data={repData}
              color="#f59e0b"
              title={t("history.chartReputation")}
            />
          </div>

          <div className="rankings-table-wrap" style={{ marginTop: "1rem" }}>
            <table className="rankings-table history-table">
              <thead>
                <tr>
                  <th className="rankings-col-pos">{t("history.colSeason")}</th>
                  <th>{t("history.colPlayed")}</th>
                  <th>{t("history.colWins")}</th>
                  <th>{t("history.colBest")}</th>
                  <th className="history-col-earnings">{t("history.colEarnings")}</th>
                  <th className="history-col-rep">{t("history.colRep")}</th>
                </tr>
              </thead>
              <tbody>
                {clubHistory.map((snap: SeasonSnapshot) => (
                  <tr key={snap.season} className="rankings-row">
                    <td className="rankings-col-pos">{snap.season}</td>
                    <td>{snap.tournamentsPlayed}</td>
                    <td>
                      {snap.wins > 0 ? (
                        <span className="history-wins">{snap.wins}</span>
                      ) : (
                        snap.wins
                      )}
                    </td>
                    <td>
                      {snap.bestPlacement !== null ? `#${snap.bestPlacement}` : "—"}
                    </td>
                    <td className="history-col-earnings">{formatMoney(snap.totalEarnings)}</td>
                    <td className="history-col-rep">+{snap.reputationGained}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
