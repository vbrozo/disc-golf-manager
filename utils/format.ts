/** Currency used across the UI. */
export const CURRENCY_SYMBOL = "€";

/**
 * Format a money amount for display, e.g. `2.000 €`. Uses a fixed locale so the
 * output is identical on the server and client (no hydration mismatch).
 */
export function formatMoney(amount: number): string {
  return `${amount.toLocaleString("hr-HR")} ${CURRENCY_SYMBOL}`;
}

/** Format strokes-relative-to-par for display, e.g. `-6`, `+4`, or `E` for even. */
export function formatScoreToPar(scoreToPar: number): string {
  if (scoreToPar === 0) return "E";
  return scoreToPar > 0 ? `+${scoreToPar}` : `${scoreToPar}`;
}
