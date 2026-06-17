// Pure tournament-level simulator for Disc Golf Manager v2. A tournament is
// `tournament.rounds` (3 or 4) rounds of `tournament.holesPerRound` (9 or 18)
// holes, taken from the front of the course's full 18-hole layout.

import type { Player, Injury } from "@/models/Player";
import type { Course } from "@/models/Course";
import type { Tournament } from "@/models/Tournament";
import { effectivePlayer } from "@/game/discs";
import { simulateRound, type RoundResult, type RoundSimulationOptions } from "./roundSimulator";

export interface TournamentSimulationOptions extends RoundSimulationOptions {}

export interface TournamentInjury {
  playerId: string;
  playerName: string;
  injury: Injury;
}

const INJURY_DESCRIPTIONS = [
  "Wrist strain",
  "Lower back pain",
  "Shoulder strain",
  "Ankle sprain",
  "Knee soreness",
  "Elbow tendinitis",
  "Hip flexor strain",
];

const HR_INJURY_DESCRIPTIONS = [
  "Naprezanje zapešća",
  "Bol u donjem dijelu leđa",
  "Naprezanje ramena",
  "Uganuće gležnja",
  "Bol u koljenu",
  "Tendinitis lakta",
  "Naprezanje fleksora kuka",
];

/**
 * Roll for injuries for club players after a tournament. Chance scales with
 * field difficulty and low fitness; severity (weeksRemaining) 1–4.
 */
export function generateTournamentInjuries(
  clubPlayers: Player[],
  difficulty: number,
  rng: () => number = Math.random
): TournamentInjury[] {
  const injuries: TournamentInjury[] = [];
  for (const player of clubPlayers) {
    if (player.injuries?.length) continue; // already injured — skip
    // Base chance 5%, +1% per difficulty point above 1, -0.15% per fitness point
    const chance = 0.05 + (difficulty - 1) * 0.01 - (player.fitness / 100) * 0.15;
    if (rng() < Math.max(0.01, Math.min(chance, 0.25))) {
      const severity = Math.ceil(rng() * 4); // 1–4 rounds
      const idx = Math.floor(rng() * INJURY_DESCRIPTIONS.length);
      injuries.push({
        playerId: player.id,
        playerName: `${player.firstName} ${player.lastName}`.trim(),
        injury: {
          id: `inj-${player.id}-${Date.now()}`,
          description: INJURY_DESCRIPTIONS[idx],
          descriptionHr: HR_INJURY_DESCRIPTIONS[idx],
          weeksRemaining: severity,
        },
      });
    }
  }
  return injuries;
}

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

const PRIZE_SHARES = [0.5, 0.3, 0.2];

/**
 * Only top 3 share the prize pool (50/30/20%). All other placements earn 0.
 */
export function earningsForPlacement(
  prizePool: number,
  placement: number,
  _fieldSize: number
): number {
  const share = PRIZE_SHARES[placement - 1];
  if (!share) return 0;
  return Math.round(prizePool * share);
}

/**
 * Reputation awarded for a finish: scales with course difficulty and decays
 * with placement so only strong finishes are worth much. Never negative.
 */
export function reputationForPlacement(difficulty: number, placement: number): number {
  return Math.max(0, Math.round((difficulty * 5) / placement));
}

/**
 * Simulate a tournament: every player plays `tournament.rounds` rounds of
 * `tournament.holesPerRound` holes on the tournament's course, summing
 * strokes across all rounds. Players are ranked by total strokes (lowest
 * wins) and awarded earnings + reputation by placement.
 */
export function simulateTournament(
  players: Player[],
  tournament: Tournament,
  course: Course,
  options: TournamentSimulationOptions = {}
): TournamentSimulationResult {
  const rng = options.rng ?? Math.random;
  const holes = course.holes.slice(0, tournament.holesPerRound);

  const entries: PlayerTournamentResult[] = players.map((player) => {
    const effective = effectivePlayer(player);
    const rounds: RoundResult[] = [];
    let totalStrokes = 0;
    let totalScore = 0;

    for (let i = 0; i < tournament.rounds; i++) {
      const round = simulateRound(effective, holes, { rng });
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
