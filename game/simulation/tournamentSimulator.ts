// Pure tournament-level (4 x 18-hole rounds) simulator for Disc Golf Manager v2.

import type { Player } from "@/models/Player";
import type { Course } from "@/models/Course";
import type { Tournament } from "@/models/Tournament";
import { effectivePlayer } from "@/game/discs";
import { simulateRound, type RoundResult, type RoundSimulationOptions } from "./roundSimulator";

export interface TournamentSimulationOptions extends RoundSimulationOptions {}

export interface PlayerTournamentResult {
  player: Player;
  rounds: RoundResult[];
  totalStrokes: number;
  totalScore: number;
}

export interface TournamentStanding extends PlayerTournamentResult {
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

/** Number of 18-hole rounds in a full tournament. */
export const ROUNDS_PER_TOURNAMENT = 4;

/**
 * Split a prize pool across placements with a linear, rank-weighted scheme:
 * a field of `n` players shares the pool by weight (n - placement + 1), so
 * the winner earns the most and the last place the least. Rounded to whole
 * units.
 */
export function earningsForPlacement(
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
export function reputationForPlacement(difficulty: number, placement: number): number {
  return Math.max(0, Math.round((difficulty * 5) / placement));
}

/**
 * Simulate a tournament: every player plays {@link ROUNDS_PER_TOURNAMENT}
 * rounds of 18 holes on the tournament's course, summing strokes across all
 * rounds. Players are ranked by total strokes (lowest wins) and awarded
 * earnings + reputation by placement.
 */
export function simulateTournament(
  players: Player[],
  tournament: Tournament,
  course: Course,
  options: TournamentSimulationOptions = {}
): TournamentSimulationResult {
  const rng = options.rng ?? Math.random;

  const entries: PlayerTournamentResult[] = players.map((player) => {
    const effective = effectivePlayer(player);
    const rounds: RoundResult[] = [];
    let totalStrokes = 0;
    let totalScore = 0;

    for (let i = 0; i < ROUNDS_PER_TOURNAMENT; i++) {
      const round = simulateRound(effective, course, { rng });
      rounds.push(round);
      totalStrokes += round.totalStrokes;
      totalScore += round.totalScore;
    }

    return { player, rounds, totalStrokes, totalScore };
  });

  // Lowest total strokes wins; stable for ties.
  entries.sort((a, b) => a.totalStrokes - b.totalStrokes);

  const standings: TournamentStanding[] = entries.map((entry, index) => {
    const placement = index + 1;
    return {
      ...entry,
      placement,
      earnings: earningsForPlacement(tournament.prizePool, placement, entries.length),
      reputationGained: reputationForPlacement(tournament.difficulty, placement),
    };
  });

  return {
    tournamentId: tournament.id,
    tournamentName: tournament.name,
    standings,
  };
}
