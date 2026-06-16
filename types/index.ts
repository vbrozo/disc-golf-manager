// Shared domain types for Disc Golf Manager.
// Frontend-only — these describe the in-memory game state held by Zustand.

/** Player skill ratings, each on a 1–100 scale. */
export interface PlayerStats {
  Driving: number;
  Accuracy: number;
  Putting: number;
  Mental: number;
  Stamina: number;
}

export interface Player {
  id: string;
  name: string;
  stats: PlayerStats;
}

export type DiscType = "Driver" | "Midrange" | "Putter";

export type DiscRarity = "Common" | "Rare" | "Epic" | "Legendary";

export interface Disc {
  id: string;
  name: string;
  type: DiscType;
  rarity: DiscRarity;
  /** Stat bonus granted by the disc (strength scales with rarity). */
  bonus: number;
}

export interface Tournament {
  id: string;
  name: string;
  /** Course length. */
  holes: 9 | 18;
  /** Difficulty rating 1–5. */
  difficulty: number;
  prizePool: number;
  /** Minimum club reputation required to enter. */
  reputationRequired: number;
}

/**
 * The five training disciplines a player can practise. Each one improves a
 * single {@link PlayerStats} value — "Fitness" maps to the player's Stamina.
 */
export type TrainingType =
  | "Driving"
  | "Accuracy"
  | "Putting"
  | "Mental"
  | "Fitness";

/** A purchasable training session and the stat it develops. */
export interface TrainingProgram {
  type: TrainingType;
  /** Player-facing name of the session. */
  name: string;
  /** The player stat improved by this program. */
  stat: keyof PlayerStats;
  /** Cost in money to run one session. */
  cost: number;
}

/** Outcome of running a training session on a player. */
export interface TrainingResult {
  type: TrainingType;
  /** The stat that was trained. */
  stat: keyof PlayerStats;
  /** Stat points actually gained (1–5, less if the 100 cap was hit). */
  boost: number;
  /** Money spent on the session. */
  cost: number;
  /** The player's new value for the trained stat (capped at 100). */
  newValue: number;
}

/** Outcome of a played tournament, stored on the club's record. */
export interface TournamentResult {
  id: string;
  tournamentId: string;
  tournamentName: string;
  /** Finishing position (1 = winner). */
  placement: number;
  earnings: number;
  reputationGained: number;
}

export interface Club {
  name: string;
  money: number;
  reputation: number;
}
