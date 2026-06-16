// PDGA-style player rating engine for Disc Golf Manager.
//
// Frontend-only, framework-free: no React, no Zustand. A player earns a rating
// for every round they play, derived from how their score compares to par; a
// player's overall rating is the average of their most recent round ratings,
// mirroring how a PDGA rating averages a window of recent rounds.

/** Rating awarded for an exactly-par round (the baseline). */
export const BASE_RATING = 950;
/** Rating points gained/lost per stroke under/over par (on an 18-hole basis). */
export const RATING_PER_STROKE = 10;
/** How many of the most recent round ratings feed the average. */
export const RATING_ROUNDS_WINDOW = 8;
/** Ratings are clamped to this inclusive range. */
export const MIN_RATING = 600;
export const MAX_RATING = 1100;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Rating for a single round. Better-than-par rounds rate above {@link
 * BASE_RATING}, worse-than-par below it. Scores are normalised to an 18-hole
 * basis so a 9-hole round counts proportionally. `totalScore` is strokes
 * relative to par (negative is good).
 */
export function calculateRoundRating(totalScore: number, holes: number): number {
  const normalized = holes > 0 ? totalScore * (18 / holes) : totalScore;
  const rating = BASE_RATING - normalized * RATING_PER_STROKE;
  return clamp(Math.round(rating), MIN_RATING, MAX_RATING);
}

/**
 * Append a round rating to a player's history, keeping only the most recent
 * {@link RATING_ROUNDS_WINDOW} entries. Pure: the input array is not mutated.
 */
export function appendRoundRating(
  history: number[] | undefined,
  roundRating: number
): number[] {
  return [...(history ?? []), roundRating].slice(-RATING_ROUNDS_WINDOW);
}

/**
 * A player's overall rating: the rounded average of their recent round ratings,
 * or `undefined` if they have not played a rated round yet.
 */
export function averageRating(history: number[] | undefined): number | undefined {
  if (!history || history.length === 0) {
    return undefined;
  }
  return Math.round(history.reduce((sum, r) => sum + r, 0) / history.length);
}
