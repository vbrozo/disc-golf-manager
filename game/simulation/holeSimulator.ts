// Pure hole-level simulator for Disc Golf Manager v2.

import type { Player } from "@/models/Player";
import type { Hole } from "@/models/Course";

/** Per-hole outcome relative to par. */
export type HoleOutcome = "Eagle" | "Birdie" | "Par" | "Bogey" | "DoubleBogey";

/** A source of randomness; defaults to Math.random. Inject for determinism. */
export type RandomFn = () => number;

export interface HoleSimulationOptions {
  /** Random number source (0-1). Defaults to Math.random. */
  rng?: RandomFn;
  /** Extra performance modifier from round-level momentum/morale swings. */
  momentumBonus?: number;
}

export interface HoleResult {
  outcome: HoleOutcome;
  /** Actual strokes taken on this hole. */
  strokes: number;
  /** Strokes relative to par for this hole. */
  scoreToPar: number;
  /** The performance score that produced the outcome (useful for UI). */
  performance: number;
  /** The hole's computed difficulty score, for UI/debugging. */
  difficultyScore: number;
}

/** Strokes-relative-to-par delta for each outcome. */
const OUTCOME_DELTA: Record<HoleOutcome, number> = {
  Eagle: -2,
  Birdie: -1,
  Par: 0,
  Bogey: 1,
  DoubleBogey: 2,
};

/**
 * Minimum performance-minus-difficulty value required to achieve each outcome.
 * Weights sum to 0.90 by design — the remaining 0.10 comes from the random
 * factor in {@link simulateHole} (form, morale, momentum).
 */
export const OUTCOME_THRESHOLDS = {
  eagle: 15,
  birdie: 8,
  par: -7,
  bogey: -15,
} as const;

/**
 * Contribution of each hole attribute to {@link holeDifficultyScore}.
 * `difficulty` is weighted heaviest as it is the course designer's summary
 * judgement; the terrain factors (obRisk, distance, wooded, elevation) are
 * secondary modifiers.
 */
export const HOLE_DIFFICULTY_WEIGHTS = {
  difficulty: 0.4,
  obRisk: 0.25,
  distance: 0.15,
  wooded: 0.1,
  elevation: 0.1,
} as const;

/** Contribution of each player attribute to {@link basePerformance}. */
export const STAT_WEIGHTS = {
  accuracy: 0.3,
  putting: 0.25,
  power: 0.15,
  scramble: 0.1,
  consistency: 0.1,
  mental: 0.1,
} as const;

/** Map a hole outcome + par into actual strokes taken. */
export function strokesForOutcome(outcome: HoleOutcome, par: Hole["par"]): number {
  return par + OUTCOME_DELTA[outcome];
}

/**
 * Weighted performance formula. Weights are defined in {@link STAT_WEIGHTS}
 * and sum to 0.90 by design — the remaining 0.10 comes from randomness, form
 * and morale (see {@link simulateHole}), not from a player skill.
 */
export function basePerformance(player: Player): number {
  return (
    player.accuracy * STAT_WEIGHTS.accuracy +
    player.putting * STAT_WEIGHTS.putting +
    player.power * STAT_WEIGHTS.power +
    player.scramble * STAT_WEIGHTS.scramble +
    player.consistency * STAT_WEIGHTS.consistency +
    player.mental * STAT_WEIGHTS.mental
  );
}

/** Map form (0-100, neutral 50) to a performance bonus/penalty. */
export function formBonus(form: number): number {
  return (form - 50) / 5;
}

/** Map morale (0-100, neutral 50) to a performance bonus/penalty. */
export function moraleBonus(morale: number): number {
  return (morale - 50) / 5;
}

/**
 * Derive a 0-100-ish difficulty score for a hole from its raw attributes.
 * Distance is normalised against a long (500ft+) hole, difficulty/obRisk/
 * wooded/elevation are already roughly 0-100 scales; we weight raw
 * `difficulty` heaviest since it's the hole designer's own summary judgement,
 * with obRisk and wooded/elevation as secondary terrain modifiers.
 */
export function holeDifficultyScore(hole: Hole): number {
  const distanceFactor = Math.min(100, (hole.distance / 500) * 100);
  return (
    hole.difficulty * HOLE_DIFFICULTY_WEIGHTS.difficulty +
    hole.obRisk * HOLE_DIFFICULTY_WEIGHTS.obRisk +
    distanceFactor * HOLE_DIFFICULTY_WEIGHTS.distance +
    hole.wooded * HOLE_DIFFICULTY_WEIGHTS.wooded +
    hole.elevation * HOLE_DIFFICULTY_WEIGHTS.elevation
  );
}

/** Map a performance/difficulty difference to a hole outcome per the v2 spec table. */
export function outcomeForDifference(difference: number): HoleOutcome {
  if (difference >= OUTCOME_THRESHOLDS.eagle) return "Eagle";
  if (difference >= OUTCOME_THRESHOLDS.birdie) return "Birdie";
  if (difference >= OUTCOME_THRESHOLDS.par) return "Par";
  if (difference >= OUTCOME_THRESHOLDS.bogey) return "Bogey";
  return "DoubleBogey";
}

/**
 * Simulate a single hole for a player against a {@link Hole}.
 *
 * total = performance + random(-10,10) + formBonus + moraleBonus
 * difference = total - holeDifficultyScore
 * outcome via {@link outcomeForDifference}.
 */
export function simulateHole(
  player: Player,
  hole: Hole,
  options: HoleSimulationOptions = {}
): HoleResult {
  const rng = options.rng ?? Math.random;
  const momentumBonus = options.momentumBonus ?? 0;

  const performance = basePerformance(player);
  const randomFactor = rng() * 20 - 10; // [-10, 10]
  // Each active injury reduces effective performance by 5 points.
  const injuryPenalty = (player.injuries?.length ?? 0) * 5;
  const total =
    performance + randomFactor + formBonus(player.form) + moraleBonus(player.morale) + momentumBonus - injuryPenalty;

  const difficultyScore = holeDifficultyScore(hole);
  const difference = total - difficultyScore;
  const outcome = outcomeForDifference(difference);
  const strokes = strokesForOutcome(outcome, hole.par);

  return {
    outcome,
    strokes,
    scoreToPar: OUTCOME_DELTA[outcome],
    performance: total,
    difficultyScore,
  };
}
