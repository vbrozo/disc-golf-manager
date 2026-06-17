// Player training engine for Disc Golf Manager.
//
// Frontend-only, framework-free: no React, no Zustand. The program list is
// static game data and the helpers are pure functions over the shared domain
// types, so they can be unit tested and called from store actions or the UI.

import type { Player } from "@/models/Player";
import type { TrainingProgram, TrainingResult, TrainingType } from "@/types";
import type { RandomFn } from "./simulation/holeSimulator";

/** Smallest stat gain a training session can yield. */
export const MIN_BOOST = 1;
/** Largest stat gain a training session can yield. */
export const MAX_BOOST = 5;
/** Player attributes are capped at 100; training can never push past this. */
export const MAX_STAT = 100;

/**
 * The seven training disciplines, one per trainable player attribute. Costs
 * are tuned so that the harder-to-improve mental game and raw power cost a
 * little more.
 */
export const TRAINING_PROGRAMS: readonly TrainingProgram[] = [
  { type: "Power", name: "Power Training", stat: "power", cost: 400 },
  { type: "Accuracy", name: "Accuracy Drills", stat: "accuracy", cost: 400 },
  { type: "Putting", name: "Putting Practice", stat: "putting", cost: 300 },
  { type: "Scramble", name: "Scramble Drills", stat: "scramble", cost: 350 },
  { type: "Consistency", name: "Consistency Coaching", stat: "consistency", cost: 400 },
  { type: "Mental", name: "Mental Coaching", stat: "mental", cost: 500 },
  { type: "Fitness", name: "Fitness Training", stat: "fitness", cost: 350 },
] as const;

/** Look up a training program by its type, or `undefined` if unknown. */
export function getTrainingProgram(
  type: TrainingType
): TrainingProgram | undefined {
  return TRAINING_PROGRAMS.find((program) => program.type === type);
}

/**
 * Roll the raw stat gain for a session: an integer in [MIN_BOOST, MAX_BOOST]
 * (i.e. +1 to +5). Inject `rng` for deterministic tests.
 */
export function rollTrainingBoost(rng: RandomFn = Math.random): number {
  const range = MAX_BOOST - MIN_BOOST + 1;
  return MIN_BOOST + Math.floor(rng() * range);
}

/** Options for {@link applyTraining}. */
export interface TrainingOptions {
  /** Random number source (0-1). Defaults to Math.random. */
  rng?: RandomFn;
}

/**
 * Run a training session on a player, returning a new {@link Player} with the
 * trained attribute raised by +1 to +5 (clamped to the 100 cap) alongside a
 * {@link TrainingResult} describing what happened. This is pure: it does not
 * mutate the input player and does not touch club money — the caller is
 * responsible for charging the program's `cost`.
 *
 * Returns `null` if `type` is not a known program.
 */
export function applyTraining(
  player: Player,
  type: TrainingType,
  options: TrainingOptions = {}
): { player: Player; result: TrainingResult } | null {
  const program = getTrainingProgram(type);
  if (!program) {
    return null;
  }

  const rng = options.rng ?? Math.random;
  const rolled = rollTrainingBoost(rng);

  const current = player[program.stat];
  const newValue = Math.min(MAX_STAT, current + rolled);
  const boost = newValue - current;

  const trained: Player = {
    ...player,
    [program.stat]: newValue,
  };

  return {
    player: trained,
    result: {
      type,
      stat: program.stat,
      boost,
      cost: program.cost,
      newValue,
    },
  };
}
