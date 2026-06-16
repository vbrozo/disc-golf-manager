// Opponent generator for Disc Golf Manager.
//
// Frontend-only, framework-free: no React, no Zustand. Produces AI players with
// random Croatian names and stats to fill out a tournament field, so the club's
// own players actually have to compete for placements instead of always winning.

import type { Player, PlayerStats } from "@/types";
import type { RandomFn } from "./simulation";

/** Default total field size (club players + opponents) for a tournament. */
export const DEFAULT_FIELD_SIZE = 8;

/** Opponent stats are rolled in this inclusive range, around the starter level. */
const MIN_STAT = 42;
const MAX_STAT = 68;

const FIRST_NAMES = [
  "Ivan", "Marko", "Luka", "Ante", "Josip", "Petar", "Tomislav", "Domagoj",
  "Nikola", "Filip", "Mateo", "Karlo", "David", "Stjepan", "Hrvoje", "Dario",
  "Igor", "Bruno", "Roko", "Vedran", "Mislav", "Krešimir", "Goran", "Zoran",
];

const LAST_NAMES = [
  "Horvat", "Kovačević", "Babić", "Marić", "Jurić", "Novak", "Knežević",
  "Vuković", "Marković", "Petrović", "Tomić", "Matić", "Pavić", "Blažević",
  "Grgić", "Lovrić", "Perić", "Šimić", "Radić", "Barišić", "Vidović", "Bošnjak",
];

/** Pick a uniformly-random element of a non-empty array. */
function pick<T>(items: readonly T[], rng: RandomFn): T {
  return items[Math.floor(rng() * items.length)];
}

/** Roll an integer stat in the [MIN_STAT, MAX_STAT] range. */
function rollStat(rng: RandomFn): number {
  return MIN_STAT + Math.floor(rng() * (MAX_STAT - MIN_STAT + 1));
}

/**
 * Generate `count` AI opponents with random Croatian names and stats. Names are
 * de-duplicated where possible so a field doesn't show the same name twice.
 * Inject `rng` for deterministic tests.
 */
export function generateOpponents(
  count: number,
  options: { rng?: RandomFn } = {}
): Player[] {
  const rng = options.rng ?? Math.random;
  const opponents: Player[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < count; i++) {
    let name = `${pick(FIRST_NAMES, rng)} ${pick(LAST_NAMES, rng)}`;
    // A few retries to avoid duplicate names within the same field.
    for (let attempt = 0; attempt < 5 && usedNames.has(name); attempt++) {
      name = `${pick(FIRST_NAMES, rng)} ${pick(LAST_NAMES, rng)}`;
    }
    usedNames.add(name);

    const stats: PlayerStats = {
      Driving: rollStat(rng),
      Accuracy: rollStat(rng),
      Putting: rollStat(rng),
      Mental: rollStat(rng),
      Stamina: rollStat(rng),
    };

    opponents.push({ id: `opponent-${i + 1}`, name, stats, isOpponent: true });
  }

  return opponents;
}
