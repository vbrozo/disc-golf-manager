// Pure hole-level simulator for Disc Golf Manager v2.

import type { Player } from "@/models/Player";
import type { Hole } from "@/models/Course";
import { getPlayerSpecialty } from "@/models/Player";
import type { PlayerSpecialty } from "@/models/Player";

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

/**
 * The character of a hole — used to award specialty bonuses.
 * Derived from a hole's dominant terrain attribute and par.
 */
export type HoleType = "Short" | "Long" | "Technical" | "Recovery" | "Pressure" | "Balanced";

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
  /** Hole character derived from terrain attributes. */
  holeType: HoleType;
  /** Specialty performance bonus applied on this hole (0 if no match). */
  specialtyBonus: number;
}

/** Strokes-relative-to-par delta for each outcome. */
const OUTCOME_DELTA: Record<HoleOutcome, number> = {
  Eagle: -2,
  Birdie: -1,
  Par: 0,
  Bogey: 1,
  DoubleBogey: 2,
};

/** Minimum performance-minus-difficulty value required to achieve each outcome. */
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

/**
 * Contribution of each player attribute to {@link basePerformance}.
 * Weights sum to 0.90 by design — the remaining 0.10 is left for the random
 * factor in {@link simulateHole} (form, morale, momentum), not a player skill.
 */
export const STAT_WEIGHTS = {
  accuracy: 0.25,
  putting: 0.2,
  power: 0.15,
  scramble: 0.1,
  consistency: 0.1,
  mental: 0.1,
} as const;

/**
 * Hole types that grant a specialty performance bonus.
 * AllRounder gets a flat bonus on every hole instead of a per-type match.
 */
const SPECIALTY_HOLE_TYPES: Record<PlayerSpecialty, readonly HoleType[]> = {
  PowerPlayer:    ["Long"],
  Precision:      ["Technical"],
  PuttingMachine: ["Short"],
  Scrambler:      ["Recovery"],
  MentalGame:     ["Pressure"],
  Workhorse:      ["Long", "Pressure"],
  AllRounder:     [],
};

/** Performance bonus when a player's specialty matches the hole type. */
const SPECIALTY_MATCH_BONUS = 8;
/** Flat per-hole bonus for AllRounder (applies everywhere). */
const ALLROUNDER_BONUS = 2;

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
  const distanceFactor = Math.min(100, (hole.distance / 150) * 100);
  return (
    hole.difficulty * HOLE_DIFFICULTY_WEIGHTS.difficulty +
    hole.obRisk * HOLE_DIFFICULTY_WEIGHTS.obRisk +
    distanceFactor * HOLE_DIFFICULTY_WEIGHTS.distance +
    hole.wooded * HOLE_DIFFICULTY_WEIGHTS.wooded +
    hole.elevation * HOLE_DIFFICULTY_WEIGHTS.elevation
  );
}

/**
 * Classify a hole by its dominant terrain attribute and par.
 * - par 5 → Long (power/distance challenge)
 * - obRisk > 1.05× difficulty → Recovery (OB-heavy, scrambling required)
 * - wooded > 1.05× difficulty → Technical (wooded, precision required)
 * - par 3 otherwise → Short (open approach + putting focus)
 * - par 4 with elevation dominant → Pressure (uphill/downhill, mental challenge)
 * - par 4 balanced → Balanced (all-round play)
 */
export function holeType(hole: Hole): HoleType {
  if (hole.par === 5) return "Long";
  const obDom   = hole.obRisk > hole.wooded   && hole.obRisk > hole.difficulty * 1.05;
  const woodDom = hole.wooded  > hole.obRisk  && hole.wooded  > hole.difficulty * 1.05;
  if (obDom)   return "Recovery";
  if (woodDom) return "Technical";
  if (hole.par === 3) return "Short";
  // par 4:
  const elevDom = hole.elevation > hole.obRisk && hole.elevation > hole.wooded;
  if (elevDom) return "Pressure";
  return "Balanced";
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
 * total = performance + random(-10,10) + formBonus + moraleBonus + specialtyBonus
 * difference = total - holeDifficultyScore
 * outcome via {@link outcomeForDifference}.
 *
 * Specialty bonus: +8 if the player's archetype matches the hole type,
 * or +2 flat for AllRounder (applies on every hole).
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

  const ht = holeType(hole);
  const specialty = getPlayerSpecialty(player);
  const specialtyBonus =
    specialty === "AllRounder"
      ? ALLROUNDER_BONUS
      : (SPECIALTY_HOLE_TYPES[specialty] as readonly HoleType[]).includes(ht)
        ? SPECIALTY_MATCH_BONUS
        : 0;

  const total =
    performance + randomFactor + formBonus(player.form) + moraleBonus(player.morale) + momentumBonus - injuryPenalty + specialtyBonus;

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
    holeType: ht,
    specialtyBonus,
  };
}
