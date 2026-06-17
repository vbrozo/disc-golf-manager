// Shared domain types for Disc Golf Manager.
// Frontend-only — these describe the in-memory game state held by Zustand.
//
// The actual domain models live under models/; this module re-exports them
// plus the game-loop types (training, tournament results) that sit on top.

export type { Player, ShotShape, Injury, PlayerSpecialty } from "@/models/Player";
export { playerFullName, getPlayerSpecialty } from "@/models/Player";
export type { Hole, Course } from "@/models/Course";
export type { Disc, DiscType, DiscRarity, DiscLoadout } from "@/models/Disc";
export type { Club } from "@/models/Club";
export type { Tournament, TournamentResult } from "@/models/Tournament";

import type { Player } from "@/models/Player";

/**
 * The numeric Player attributes that training programs and discs can boost.
 */
export type TrainablePlayerStat =
  | "power"
  | "accuracy"
  | "putting"
  | "scramble"
  | "consistency"
  | "mental"
  | "fitness";

/** Ordered list of all trainable player stats, used for stat bars and training UI. */
export const PLAYER_STAT_KEYS: readonly TrainablePlayerStat[] = [
  "power",
  "accuracy",
  "putting",
  "scramble",
  "consistency",
  "mental",
  "fitness",
];

/** The training disciplines a player can practise, one per trainable stat. */
export type TrainingType =
  | "Power"
  | "Accuracy"
  | "Putting"
  | "Scramble"
  | "Consistency"
  | "Mental"
  | "Fitness";

/** A purchasable training session and the attribute it develops. */
export interface TrainingProgram {
  type: TrainingType;
  /** Player-facing name of the session. */
  name: string;
  /** The player attribute improved by this program. */
  stat: TrainablePlayerStat;
  /** Cost in money to run one session. */
  cost: number;
}

/** Outcome of running a training session on a player. */
export interface TrainingResult {
  type: TrainingType;
  /** The attribute that was trained. */
  stat: TrainablePlayerStat;
  /** Attribute points actually gained (1-5, less if the 100 cap was hit). */
  boost: number;
  /** Money spent on the session. */
  cost: number;
  /** The player's new value for the trained attribute (capped at 100). */
  newValue: number;
}

