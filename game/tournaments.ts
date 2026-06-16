// Tournament catalogue + reward logic for Disc Golf Manager.
//
// Frontend-only, framework-free: no React, no Zustand. The tournament list is
// static game data, and the helpers are pure functions over the shared domain
// types so they can be unit tested and called from store actions or the UI.

import type { Tournament } from "@/types";

/**
 * The 10 tournaments available in the game, ordered roughly from beginner
 * (no reputation required) to elite (high reputation gate). Reputation
 * requirement, difficulty and prize pool all scale together so that better
 * events are both harder to enter and more rewarding.
 */
export const TOURNAMENTS: readonly Tournament[] = [
  {
    id: "local-open",
    name: "Local Park Open",
    holes: 9,
    difficulty: 1,
    prizePool: 500,
    reputationRequired: 0,
  },
  {
    id: "weekend-warmup",
    name: "Weekend Warm-Up",
    holes: 9,
    difficulty: 1,
    prizePool: 800,
    reputationRequired: 5,
  },
  {
    id: "riverside-classic",
    name: "Riverside Classic",
    holes: 18,
    difficulty: 2,
    prizePool: 1500,
    reputationRequired: 15,
  },
  {
    id: "forest-challenge",
    name: "Forest Challenge",
    holes: 18,
    difficulty: 2,
    prizePool: 2200,
    reputationRequired: 30,
  },
  {
    id: "city-cup",
    name: "City Cup",
    holes: 18,
    difficulty: 3,
    prizePool: 3500,
    reputationRequired: 50,
  },
  {
    id: "mountain-masters",
    name: "Mountain Masters",
    holes: 18,
    difficulty: 3,
    prizePool: 5000,
    reputationRequired: 75,
  },
  {
    id: "national-invitational",
    name: "National Invitational",
    holes: 18,
    difficulty: 4,
    prizePool: 8000,
    reputationRequired: 110,
  },
  {
    id: "continental-series",
    name: "Continental Series",
    holes: 18,
    difficulty: 4,
    prizePool: 12000,
    reputationRequired: 150,
  },
  {
    id: "world-championship",
    name: "World Championship",
    holes: 18,
    difficulty: 5,
    prizePool: 20000,
    reputationRequired: 200,
  },
  {
    id: "grand-masters-final",
    name: "Grand Masters Final",
    holes: 18,
    difficulty: 5,
    prizePool: 35000,
    reputationRequired: 275,
  },
] as const;

/**
 * Return every tournament the club may enter at the given reputation, i.e.
 * those whose `reputationRequired` is met. Ordered by reputation requirement
 * (easiest first), same as {@link TOURNAMENTS}.
 */
export function getAvailableTournaments(reputation: number): Tournament[] {
  return TOURNAMENTS.filter(
    (tournament) => reputation >= tournament.reputationRequired
  );
}

/** Look up a tournament by id, or `undefined` if there is no such id. */
export function getTournamentById(id: string): Tournament | undefined {
  return TOURNAMENTS.find((tournament) => tournament.id === id);
}

/** Money + reputation awarded to a player for a single finishing position. */
export interface TournamentRewards {
  /** Prize money earned. */
  earnings: number;
  /** Reputation gained. */
  reputationGained: number;
}

/**
 * Share of the prize pool paid out for the top finishing positions. Index 0 is
 * 1st place, index 1 is 2nd, and so on. Positions beyond the table earn
 * nothing (they finished out of the money).
 */
const PRIZE_SHARES = [0.4, 0.25, 0.15, 0.1, 0.06, 0.04] as const;

/**
 * Calculate the rewards for finishing a tournament in `position` (1 = winner).
 *
 * Earnings are a share of the tournament's prize pool that decays with
 * position; finishes outside the payout table earn nothing. Reputation scales
 * with course difficulty and decays with position, so only strong finishes in
 * tough events move the needle. Both values are never negative.
 */
export function calculateRewards(
  position: number,
  tournament: Tournament
): TournamentRewards {
  if (position < 1) {
    return { earnings: 0, reputationGained: 0 };
  }

  const share = PRIZE_SHARES[position - 1] ?? 0;
  const earnings = Math.round(tournament.prizePool * share);

  const reputationGained = Math.max(
    0,
    Math.round((tournament.difficulty * 5) / position)
  );

  return { earnings, reputationGained };
}
