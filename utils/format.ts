/** Currency used across the UI. */
export const CURRENCY_SYMBOL = "€";

/**
 * Format a money amount for display, e.g. `2.000 €`. Uses a fixed locale so the
 * output is identical on the server and client (no hydration mismatch).
 */
export function formatMoney(amount: number): string {
  return `${amount.toLocaleString("hr-HR")} ${CURRENCY_SYMBOL}`;
}
