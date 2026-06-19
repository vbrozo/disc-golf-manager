// Season / game-loop engine for Disc Golf Manager.
//
// Frontend-only, framework-free: no React, no Zustand. This is the module that
// ties every other engine together into one repeatable season loop:
//
//   start season → select tournament → simulate → earn rewards → training → repeat
//
// The functions here are pure state transitions over a SeasonState (plus a
// little static "new game" bootstrap data). The Zustand store wires them to the
// existing simulation + economy + training actions, so this file stays free of
// any framework or side effects and can be unit tested in isolation.

import type { Player, ShotShape } from "@/models/Player";
import { rollInRange } from "@/utils/random";

/** Phases of the season loop, in the order the player moves through them. */
export type SeasonPhase =
  | "preseason" // no season in progress — ready to start one
  | "select" // choose and play a tournament for this round
  | "training" // spend the rewards on training before the next round
  | "complete"; // every round played — review and start the next season

/** Default number of tournament rounds in a single season. */
export const DEFAULT_ROUNDS_PER_SEASON = 5;

/** Money a brand-new club starts a fresh game with. */
export const STARTING_MONEY = 2000;

/** A single completed round within a season. */
export interface SeasonRound {
  /** 1-based round number within the season. */
  round: number;
  tournamentId: string;
  tournamentName: string;
  /** Finishing position of the club's best player (1 = winner). */
  placement: number;
  earnings: number;
  reputationGained: number;
}

/** The full state of the season loop. */
export interface SeasonState {
  /** 1-based season counter (0 before the first season starts). */
  season: number;
  /** Current 1-based round within the season (0 in the preseason). */
  round: number;
  /** Rounds played per season. */
  totalRounds: number;
  /** Where in the loop the player currently is. */
  phase: SeasonPhase;
  /** Results recorded for each completed round of the current season. */
  results: SeasonRound[];
}

/** Aggregate totals for a season, for end-of-season summaries. */
export interface SeasonSummary {
  season: number;
  roundsPlayed: number;
  totalEarnings: number;
  totalReputation: number;
  /** Number of round wins (placement === 1). */
  wins: number;
  /** Best (lowest) placement achieved, or undefined if no rounds were played. */
  bestPlacement?: number;
}

/** The state before any season has started. */
export const INITIAL_SEASON_STATE: SeasonState = {
  season: 0,
  round: 0,
  totalRounds: DEFAULT_ROUNDS_PER_SEASON,
  phase: "preseason",
  results: [],
};

/**
 * Begin a new season. Increments the season counter from the previous state
 * (so seasons run 1, 2, 3…), resets the round to 1 and clears the per-season
 * results, leaving the player in the "select" phase ready to pick a tournament.
 * Pure: the previous state is not mutated.
 */
export function startSeason(
  previous: SeasonState = INITIAL_SEASON_STATE,
  totalRounds: number = previous.totalRounds || DEFAULT_ROUNDS_PER_SEASON
): SeasonState {
  return {
    season: previous.season + 1,
    round: 1,
    totalRounds: Math.max(1, Math.round(totalRounds)),
    phase: "select",
    results: [],
  };
}

/**
 * Record the outcome of the round just played and move into the "training"
 * phase. No-op (returns the input unchanged) unless the loop is in the "select"
 * phase, so a result can only ever be recorded for a round that is in progress.
 * Pure: the input state is not mutated.
 */
export function recordRoundResult(
  state: SeasonState,
  result: Omit<SeasonRound, "round">
): SeasonState {
  if (state.phase !== "select") {
    return state;
  }
  return {
    ...state,
    phase: "training",
    results: [...state.results, { ...result, round: state.round }],
  };
}

/**
 * Advance to the next round (or end the season). From the "training" phase this
 * moves the loop forward: if more rounds remain it returns to "select" with the
 * round incremented, otherwise it marks the season "complete". No-op outside the
 * "training" phase. Pure: the input state is not mutated.
 */
export function advanceRound(state: SeasonState): SeasonState {
  if (state.phase !== "training") {
    return state;
  }
  if (state.round >= state.totalRounds) {
    return { ...state, phase: "complete" };
  }
  return { ...state, round: state.round + 1, phase: "select" };
}

/** Whether every round of the season has been played. */
export function isSeasonComplete(state: SeasonState): boolean {
  return state.phase === "complete";
}

/** Aggregate the current season's recorded rounds into a summary. */
export function summariseSeason(state: SeasonState): SeasonSummary {
  const { totalEarnings, totalReputation, wins, bestPlacement } =
    state.results.reduce<{
      totalEarnings: number;
      totalReputation: number;
      wins: number;
      bestPlacement: number | undefined;
    }>(
      (acc, r) => ({
        totalEarnings:   acc.totalEarnings + r.earnings,
        totalReputation: acc.totalReputation + r.reputationGained,
        wins:            acc.wins + (r.placement === 1 ? 1 : 0),
        bestPlacement:   acc.bestPlacement === undefined
          ? r.placement
          : Math.min(acc.bestPlacement, r.placement),
      }),
      { totalEarnings: 0, totalReputation: 0, wins: 0, bestPlacement: undefined }
    );

  return {
    season: state.season,
    roundsPlayed: state.results.length,
    totalEarnings,
    totalReputation,
    wins,
    bestPlacement,
  };
}

/**
 * Build the starting roster for a brand-new game: a small club of three
 * players with complementary strengths, so the simulation always has a field to
 * run and the player has someone to train. These are plain {@link Player}
 * objects — no discs equipped — ready to drop into the store.
 */
function starterPlayer(
  id: string,
  firstName: string,
  lastName: string,
  attrs: {
    power: number;
    accuracy: number;
    putting: number;
    scramble: number;
    consistency: number;
    mental: number;
    fitness: number;
  },
  preferredShotShape: ShotShape
): Player {
  const overall = Math.round(
    (attrs.power +
      attrs.accuracy +
      attrs.putting +
      attrs.scramble +
      attrs.consistency +
      attrs.mental +
      attrs.fitness) /
      7
  );
  return {
    id,
    firstName,
    lastName,
    age: 24,
    nationality: "Croatia",
    overall,
    ...attrs,
    morale: 50,
    potential: Math.min(100, overall + rollInRange(8, 30, Math.random)),
    salary: 500,
    form: 50,
    popularity: 10,
    preferredShotShape,
    injuries: [],
  };
}

export function createStarterRoster(): Player[] {
  return [
    starterPlayer(
      "player-1",
      "Vanja",
      "Brozović",
      { power: 50, accuracy: 44, putting: 40, scramble: 43, consistency: 42, mental: 41, fitness: 52 },
      "Straight"
    ),
    starterPlayer(
      "player-2",
      "Aleksandar",
      "Sudžuković",
      { power: 41, accuracy: 51, putting: 47, scramble: 40, consistency: 45, mental: 37, fitness: 46 },
      "Hyzer"
    ),
    starterPlayer(
      "player-3",
      "Aki",
      "Vucković",
      { power: 54, accuracy: 38, putting: 43, scramble: 46, consistency: 40, mental: 39, fitness: 44 },
      "Anhyzer"
    ),
  ];
}
