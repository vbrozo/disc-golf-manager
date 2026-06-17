interface StatBarProps {
  label: string;
  /** Base stat value (without disc bonus), 0–100. */
  value: number;
  /** Stat value including any equipped disc bonus, 0–100. Defaults to `value`. */
  effectiveValue?: number;
  max?: number;
  /** Optional description shown in a hover tooltip. */
  tooltip?: string;
}

/** A labelled progress bar for a player stat, with the disc bonus portion highlighted. */
export default function StatBar({
  label,
  value,
  effectiveValue,
  max = 100,
  tooltip,
}: StatBarProps) {
  const effective = effectiveValue ?? value;
  const effectivePct = Math.min(100, (effective / max) * 100);

  return (
    <div className="stat-bar-row">
      <span
        className={tooltip ? "stat-bar-label stat-bar-label--tip" : "stat-bar-label"}
        data-tip={tooltip}
      >
        {label}
        {tooltip && <span className="stat-bar-tip-icon" aria-hidden="true">?</span>}
      </span>
      <span className="stat-bar-track">
        <span className="stat-bar-fill" style={{ width: `${effectivePct}%` }} />
        <span
          className="stat-bar-marker"
          style={{ left: `${effectivePct}%` }}
        />
      </span>
      <span className="stat-bar-value">{effective}</span>
    </div>
  );
}
