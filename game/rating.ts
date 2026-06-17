// PDGA-style player rating engine for Disc Golf Manager.
//
// Frontend-only, framework-free: no React, no Zustand. A player earns a rating
// for every round they play. Ratings are calibrated using the propagator method:
// players with established ratings anchor a linear regression that determines
// how many rating points each stroke is worth for that specific round. A
// player's overall rating is the rolling average of their most recent round
// ratings, mirroring the PDGA rating system.

/** Rating awarded for an exactly-par round when using the fallback formula. */
export const BASE_RATING = 950;
/** Fallback rating points gained/lost per stroke when propagators are unavailable. */
export const RATING_PER_STROKE = 10;
/** How many of the most recent round ratings feed the overall rating average. */
export const RATING_ROUNDS_WINDOW = 8;
/** Minimum number of rated players needed to use propagator calibration. */
export const MIN_PROPAGATORS = 3;
/** Ratings are clamped to this inclusive range. */
export const MIN_RATING = 600;
export const MAX_RATING = 1100;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Fallback rating for a single round. Better-than-par rounds rate above
 * {@link BASE_RATING}, worse-than-par below it. Used when too few propagators
 * are present.
 */
export function calculateRoundRating(totalScore: number): number {
  const rating = BASE_RATING - totalScore * RATING_PER_STROKE;
  return clamp(Math.round(rating), MIN_RATING, MAX_RATING);
}

/** A player's score and prior rating for one round, used in propagator calibration. */
export interface PropagatorEntry {
  id: string;
  /** Strokes relative to par for this round (negative = under par). */
  score: number;
  /** Player's established rating before this round; undefined for unrated players. */
  priorRating?: number;
}

/**
 * PDGA propagator-based round rating.
 *
 * Players with an established {@link PropagatorEntry.priorRating} serve as
 * propagators. A least-squares line is fitted through their (score, rating)
 * pairs, giving a dynamic "rating points per stroke" value that reflects the
 * difficulty of this specific course and conditions. Every player's round
 * rating — propagators and newcomers alike — is then read off that line.
 *
 * Falls back to the fixed {@link calculateRoundRating} formula when fewer than
 * {@link MIN_PROPAGATORS} players have prior ratings.
 *
 * @returns Map from player id to round rating.
 */
export function calculateRoundRatingsFromPropagators(
  entries: PropagatorEntry[]
): Map<string, number> {
  const propagators = entries.filter(
    (e): e is PropagatorEntry & { priorRating: number } =>
      e.priorRating !== undefined
  );

  if (propagators.length >= MIN_PROPAGATORS) {
    const n = propagators.length;
    const sumX  = propagators.reduce((s, p) => s + p.score, 0);
    const sumY  = propagators.reduce((s, p) => s + p.priorRating, 0);
    const sumXY = propagators.reduce((s, p) => s + p.score * p.priorRating, 0);
    const sumX2 = propagators.reduce((s, p) => s + p.score * p.score, 0);
    const denom = n * sumX2 - sumX * sumX;

    if (denom !== 0) {
      const slope     = (n * sumXY - sumX * sumY) / denom;
      const intercept = (sumY - slope * sumX) / n;
      return new Map(
        entries.map((e) => [
          e.id,
          clamp(Math.round(intercept + slope * e.score), MIN_RATING, MAX_RATING),
        ])
      );
    }
  }

  // Fallback: fixed-slope formula.
  return new Map(entries.map((e) => [e.id, calculateRoundRating(e.score)]));
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

