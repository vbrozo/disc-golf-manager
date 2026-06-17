// Tournament catalogue + reward logic for Disc Golf Manager.
//
// Frontend-only, framework-free: no React, no Zustand. The tournament list is
// static game data, and the helpers are pure functions over the shared domain
// types so they can be unit tested and called from store actions or the UI.

import type { Tournament } from "@/models/Tournament";

/**
 * The 10 tournaments available in the game, ordered roughly from beginner
 * (no reputation required) to elite (high reputation gate). Reputation
 * requirement, difficulty and prize pool all scale together so that better
 * events are both harder to enter and more rewarding. Smaller local events
 * are shorter (3 rounds of 9 holes); majors are the full 4 rounds of 18
 * holes.
 */
export const TOURNAMENTS: readonly Tournament[] = [
  {
    id: "local-open",
    name: "Local Park Open",
    courseId: "course-local-park",
    rounds: 3,
    holesPerRound: 9,
    difficulty: 1,
    prizePool: 500,
    reputationRequired: 0,
  },
  {
    id: "weekend-warmup",
    name: "Weekend Warm-Up",
    courseId: "course-local-park",
    rounds: 3,
    holesPerRound: 9,
    difficulty: 1,
    prizePool: 800,
    reputationRequired: 5,
  },
  {
    id: "riverside-classic",
    name: "Riverside Classic",
    courseId: "course-riverside",
    rounds: 3,
    holesPerRound: 18,
    difficulty: 2,
    prizePool: 1500,
    reputationRequired: 15,
  },
  {
    id: "forest-challenge",
    name: "Forest Challenge",
    courseId: "course-forest",
    rounds: 4,
    holesPerRound: 9,
    difficulty: 2,
    prizePool: 2200,
    reputationRequired: 30,
  },
  {
    id: "city-cup",
    name: "City Cup",
    courseId: "course-city",
    rounds: 4,
    holesPerRound: 18,
    difficulty: 3,
    prizePool: 3500,
    reputationRequired: 50,
  },
  {
    id: "mountain-masters",
    name: "Mountain Masters",
    courseId: "course-mountain",
    rounds: 4,
    holesPerRound: 18,
    difficulty: 3,
    prizePool: 5000,
    reputationRequired: 75,
  },
  {
    id: "national-invitational",
    name: "National Invitational",
    courseId: "course-national",
    rounds: 4,
    holesPerRound: 18,
    difficulty: 4,
    prizePool: 8000,
    reputationRequired: 110,
  },
  {
    id: "continental-series",
    name: "Continental Series",
    courseId: "course-continental",
    rounds: 4,
    holesPerRound: 18,
    difficulty: 4,
    prizePool: 12000,
    reputationRequired: 150,
  },
  {
    id: "world-championship",
    name: "World Championship",
    courseId: "course-world",
    rounds: 4,
    holesPerRound: 18,
    difficulty: 5,
    prizePool: 20000,
    reputationRequired: 200,
  },
  {
    id: "grand-masters-final",
    name: "Grand Masters Final",
    courseId: "course-grand-masters",
    rounds: 4,
    holesPerRound: 18,
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

