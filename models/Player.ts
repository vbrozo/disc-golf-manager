// v2 Player domain model for Disc Golf Manager.

/** Disc-golf shot shapes a player tends to favour. */
export type ShotShape = "Hyzer" | "Anhyzer" | "Straight" | "Spike";

/** A temporary physical setback affecting a player. */
export interface Injury {
  id: string;
  description: string;
  weeksRemaining: number;
}

/**
 * A disc golf player. All skill/condition fields are on a 0-100 scale.
 * `form` and `morale` are centered around 50 (neutral) — see
 * game/simulation/holeSimulator.ts for how they translate into a round
 * performance bonus.
 */
export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  nationality: string;
  overall: number;
  power: number;
  accuracy: number;
  putting: number;
  scramble: number;
  consistency: number;
  mental: number;
  fitness: number;
  morale: number;
  potential: number;
  salary: number;
  form: number;
  popularity: number;
  preferredShotShape: ShotShape;
  injuries: Injury[];
  /**
   * True for AI-generated opponents that fill out a tournament field. Club
   * players leave this unset.
   */
  isOpponent?: boolean;
  /** Discs the player has equipped (max one per type). */
  equipped?: import("./Disc").DiscLoadout;
  /** PDGA-style ratings from the player's most recent rated rounds. */
  ratingHistory?: number[];
  /** Current overall rating: the average of {@link ratingHistory}. */
  rating?: number;
  /** Snapshot of key stats at the end of each completed season. */
  seasonHistory?: { season: number; power: number; accuracy: number; putting: number; scramble: number; consistency: number; mental: number; fitness: number; rating: number }[];
  /** Per-tournament performance log for in-season trend charts. */
  tournamentHistory?: { season: number; round: number; tournamentName: string; placement: number; rating: number }[];
}

/** Full display name helper. */
export function playerFullName(player: Player): string {
  return `${player.firstName} ${player.lastName}`.trim();
}
