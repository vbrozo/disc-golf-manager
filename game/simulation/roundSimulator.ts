// Pure round-level (18-hole) simulator for Disc Golf Manager v2.

import type { Player } from "@/models/Player";
import type { Course } from "@/models/Course";
import {
  simulateHole,
  type HoleOutcome,
  type HoleResult,
  type RandomFn,
} from "./holeSimulator";

export interface RoundSimulationOptions {
  /** Random number source (0-1). Defaults to Math.random. */
  rng?: RandomFn;
}

export interface RoundResult {
  holes: HoleResult[];
  /** Total strokes taken across the round. */
  totalStrokes: number;
  /** Total strokes relative to par across the round (lower is better). */
  totalScore: number;
  /** Tally of each outcome across the round. */
  counts: Record<HoleOutcome, number>;
}

function emptyCounts(): Record<HoleOutcome, number> {
  return { Eagle: 0, Birdie: 0, Par: 0, Bogey: 0, DoubleBogey: 0 };
}

/** Momentum bonus applied once 3 birdies-or-better are strung together. */
const MOMENTUM_BONUS = 2;
/** Morale penalty applied once 2 double bogeys are strung together. */
const SLUMP_PENALTY = -4;
/** Outcomes counted as "birdie or better" for the momentum streak. */
const GOOD_OUTCOMES: HoleOutcome[] = ["Eagle", "Birdie"];

/**
 * Simulate a full 18-hole round for a player on a {@link Course}, tracking a
 * momentum modifier: 3 birdies-or-better in a row grants a +2 bonus to
 * subsequent holes in the round, and 2 double-bogeys in a row applies a -4
 * penalty. This is intentionally scoped to the round only — it never mutates
 * the player's persistent `morale`/`mental` fields, since season-level
 * morale carry-over is out of scope for this pass.
 */
export function simulateRound(
  player: Player,
  course: Course,
  options: RoundSimulationOptions = {}
): RoundResult {
  const rng = options.rng ?? Math.random;
  const results: HoleResult[] = [];
  const counts = emptyCounts();
  let totalStrokes = 0;
  let totalScore = 0;

  let goodStreak = 0;
  let badStreak = 0;
  let momentumBonus = 0;

  for (const hole of course.holes) {
    const result = simulateHole(player, hole, { rng, momentumBonus });
    results.push(result);
    counts[result.outcome] += 1;
    totalStrokes += result.strokes;
    totalScore += result.scoreToPar;

    if (GOOD_OUTCOMES.includes(result.outcome)) {
      goodStreak += 1;
      badStreak = 0;
    } else if (result.outcome === "DoubleBogey") {
      badStreak += 1;
      goodStreak = 0;
    } else {
      goodStreak = 0;
      badStreak = 0;
    }

    momentumBonus =
      goodStreak >= 3 ? MOMENTUM_BONUS : badStreak >= 2 ? SLUMP_PENALTY : 0;
  }

  return { holes: results, totalStrokes, totalScore, counts };
}
