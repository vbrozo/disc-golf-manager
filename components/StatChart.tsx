interface StatChartProps {
  data: { season: number; value: number }[];
  color?: string;
  label?: string;
  height?: number;
}

export default function StatChart({
  data,
  color = "#4ade80",
  label,
  height = 80,
}: StatChartProps) {
  const width = 300;
  const padX = 24;
  const padY = 10;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const toX = (i: number) =>
    data.length < 2
      ? padX + innerW / 2
      : padX + (i / (data.length - 1)) * innerW;

  const toY = (v: number) => padY + innerH - (v / 100) * innerH;

  const gridValues = [0, 25, 50, 75, 100];

  if (data.length === 1) {
    const cx = toX(0);
    const cy = toY(data[0].value);
    return (
      <div className="stat-chart-wrap">
        {label && <div className="stat-chart-label">{label}</div>}
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ display: "block" }}>
          {gridValues.map((v) => (
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
          <circle cx={cx} cy={cy} r={4} fill={color} />
          <text x={cx} y={cy - 8} textAnchor="middle" fontSize={9} fill="#94a3b8">
            {data[0].value}
          </text>
          <text x={cx} y={height - 2} textAnchor="middle" fontSize={9} fill="#64748b">
            S{data[0].season}
          </text>
        </svg>
        <p className="stat-chart-notice">Play more seasons to see progress</p>
      </div>
    );
  }

  const points = data.map((d, i) => `${toX(i)},${toY(d.value)}`).join(" ");

  return (
    <div className="stat-chart-wrap">
      {label && <div className="stat-chart-label">{label}</div>}
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ display: "block" }}>
        {gridValues.map((v) => (
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
        <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} />
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={toX(i)} cy={toY(d.value)} r={3} fill={color} />
            <text
              x={toX(i)}
              y={height - 2}
              textAnchor="middle"
              fontSize={9}
              fill="#64748b"
            >
              S{d.season}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
