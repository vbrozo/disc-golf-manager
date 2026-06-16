interface StatBarProps {
  label: string;
  /** Base stat value (without disc bonus), 0–100. */
  value: number;
  /** Stat value including any equipped disc bonus, 0–100. Defaults to `value`. */
  effectiveValue?: number;
  max?: number;
}

/** A labelled progress bar for a player stat, with the disc bonus portion highlighted. */
export default function StatBar({
  label,
  value,
  effectiveValue,
  max = 100,
}: StatBarProps) {
  const effective = effectiveValue ?? value;
  const basePct = Math.min(100, (value / max) * 100);
  const effectivePct = Math.min(100, (effective / max) * 100);

  return (
    <div className="stat-bar-row">
      <span className="stat-bar-label">{label}</span>
      <span className="stat-bar-track">
        <span className="stat-bar-fill" style={{ width: `${basePct}%` }} />
        {effective > value ? (
          <span
            className="stat-bar-bonus"
            style={{ left: `${basePct}%`, width: `${effectivePct - basePct}%` }}
          />
        ) : null}
      </span>
      <span className="stat-bar-value">{effective}</span>
    </div>
  );
}
