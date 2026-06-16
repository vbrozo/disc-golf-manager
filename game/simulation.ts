// Pure TypeScript simulation engine for Disc Golf Manager.
//
// Frontend-only, framework-free: no React, no Zustand. Everything here is a
// plain function operating on the shared domain types, so it can be unit
// tested in isolation and called from anywhere (store actions, UI, scripts).

import type { Player, PlayerStats, Tournament } from "@/types";

/** Per-hole outcome relative to par. */
export type HoleOutcome = "eagle" | "birdie" | "par" | "bogey";

/**
 * Strokes relative to par for each outcome (lower is better).
 * eagle -2, birdie -1, par 0, bogey +1.
 */
export const OUTCOME_SCORE: Record<HoleOutcome, number> = {
  eagle: -2,
  birdie: -1,
  par: 0,
  bogey: 1,
};

/**
 * Weighting applied to each player stat when computing hole performance.
 * Driving 30%, Accuracy 40%, Putting 20%, Mental 10%. (Stamina is not part of
 * the per-hole skill score.) Weights sum to 1.
 */
export const STAT_WEIGHTS = {
  Driving: 0.3,
  Accuracy: 0.4,
  Putting: 0.2,
  Mental: 0.1,
} as const;

/** A source of randomness; defaults to Math.random. Inject for determinism. */
export type RandomFn = () => number;

/** Options shared by the simulation functions. */
export interface SimulationOptions {
  /** Random number source (0–1). Defaults to Math.random. */
  rng?: RandomFn;
  /**
   * Course difficulty 1–5. Higher difficulty drags performance down, making
   * good outcomes rarer. Defaults to 1 (no penalty).
   */
  difficulty?: number;
}

export interface HoleResult {
  outcome: HoleOutcome;
  /** Strokes relative to par for this hole. */
  scoreToPar: number;
  /** The 0–100 performance value that produced the outcome (useful for UI). */
  performance: number;
}

export interface RoundResult {
  holes: HoleResult[];
  /** Total strokes relative to par across the round (lower is better). */
  totalScore: number;
  /** Tally of each outcome across the round. */
  counts: Record<HoleOutcome, number>;
}

export interface TournamentStanding {
  player: Player;
  round: RoundResult;
  /** Finishing position (1 = winner). */
  placement: number;
  earnings: number;
  reputationGained: number;
}

export interface TournamentSimulationResult {
  tournamentId: string;
  tournamentName: string;
  /** Players ordered best (placement 1) to worst. */
  standings: TournamentStanding[];
}

/** How much of the random factor swings performance, in 0–100 points. */
const RANDOM_SPREAD = 25;
/** Performance points lost per difficulty level above 1. */
const DIFFICULTY_PENALTY = 5;

/** Clamp a number to the inclusive [min, max] range. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Weighted skill score (0–100) before any randomness or difficulty. */
function baseSkill(stats: PlayerStats): number {
  return (
    stats.Driving * STAT_WEIGHTS.Driving +
    stats.Accuracy * STAT_WEIGHTS.Accuracy +
    stats.Putting * STAT_WEIGHTS.Putting +
    stats.Mental * STAT_WEIGHTS.Mental
  );
}

/** Map a 0–100 performance value to a hole outcome. */
function outcomeForPerformance(performance: number): HoleOutcome {
  if (performance >= 90) return "eagle";
  if (performance >= 70) return "birdie";
  if (performance >= 45) return "par";
  return "bogey";
}

/**
 * Simulate a single hole for a player.
 *
 * Performance = weighted skill + random factor − difficulty penalty, clamped to
 * 0–100, then mapped to eagle / birdie / par / bogey.
 */
export function simulateHole(
  playerStats: PlayerStats,
  options: SimulationOptions = {}
): HoleResult {
  const rng = options.rng ?? Math.random;
  const difficulty = options.difficulty ?? 1;

  const skill = baseSkill(playerStats);
  // Random factor in the range [-RANDOM_SPREAD, +RANDOM_SPREAD].
  const randomFactor = (rng() * 2 - 1) * RANDOM_SPREAD;
  const difficultyPenalty = (difficulty - 1) * DIFFICULTY_PENALTY;

  const performance = clamp(skill + randomFactor - difficultyPenalty, 0, 100);
  const outcome = outcomeForPerformance(performance);

  return {
    outcome,
    scoreToPar: OUTCOME_SCORE[outcome],
    performance,
  };
}

/** Build an outcome tally initialised to zero. */
function emptyCounts(): Record<HoleOutcome, number> {
  return { eagle: 0, birdie: 0, par: 0, bogey: 0 };
}

/**
 * Simulate a full round of `holes` holes for a player, aggregating the total
 * score relative to par and the count of each outcome.
 */
export function simulateRound(
  playerStats: PlayerStats,
  holes: number,
  options: SimulationOptions = {}
): RoundResult {
  const results: HoleResult[] = [];
  const counts = emptyCounts();
  let totalScore = 0;

  for (let i = 0; i < holes; i++) {
    const hole = simulateHole(playerStats, options);
    results.push(hole);
    counts[hole.outcome] += 1;
    totalScore += hole.scoreToPar;
  }

  return { holes: results, totalScore, counts };
}

/**
 * Split a prize pool across placements with a linear, rank-weighted scheme:
 * a field of `n` players shares the pool by weight (n − placement + 1), so the
 * winner earns the most and the last place the least. Rounded to whole units.
 */
function earningsForPlacement(
  prizePool: number,
  placement: number,
  fieldSize: number
): number {
  const totalWeight = (fieldSize * (fieldSize + 1)) / 2;
  const weight = fieldSize - placement + 1;
  return Math.round((prizePool * weight) / totalWeight);
}

/**
 * Reputation awarded for a finish: scales with course difficulty and decays
 * with placement so only strong finishes are worth much. Never negative.
 */
function reputationForPlacement(difficulty: number, placement: number): number {
  return Math.max(0, Math.round((difficulty * 5) / placement));
}

/**
 * Simulate a tournament: every player plays a round over the tournament's
 * holes (at the tournament's difficulty), then players are ranked by total
 * score (lowest wins) and awarded earnings + reputation by placement.
 */
export function simulateTournament(
  players: Player[],
  tournament: Tournament,
  options: SimulationOptions = {}
): TournamentSimulationResult {
  const rng = options.rng ?? Math.random;
  const roundOptions: SimulationOptions = {
    rng,
    difficulty: tournament.difficulty,
  };

  const rounds = players.map((player) => ({
    player,
    round: simulateRound(player.stats, tournament.holes, roundOptions),
  }));

  // Lowest total score wins; stable for ties.
  rounds.sort((a, b) => a.round.totalScore - b.round.totalScore);

  const standings: TournamentStanding[] = rounds.map((entry, index) => {
    const placement = index + 1;
    return {
      player: entry.player,
      round: entry.round,
      placement,
      earnings: earningsForPlacement(
        tournament.prizePool,
        placement,
        rounds.length
      ),
      reputationGained: reputationForPlacement(
        tournament.difficulty,
        placement
      ),
    };
  });

  return {
    tournamentId: tournament.id,
    tournamentName: tournament.name,
    standings,
  };
}
