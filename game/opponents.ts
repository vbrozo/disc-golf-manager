// Opponent generator for Disc Golf Manager.
//
// Frontend-only, framework-free: no React, no Zustand. Produces AI players with
// random Croatian names and stats to fill out a tournament field, so the club's
// own players actually have to compete for placements instead of always winning.

import type { Player, ShotShape } from "@/models/Player";
import type { RandomFn } from "./simulation/holeSimulator";
import { pick, rollInRange } from "@/utils/random";

/** Default total field size (club players + opponents) for a tournament. */
export const DEFAULT_FIELD_SIZE = 8;

/** Opponent attributes are rolled in this inclusive range, around the starter level. */
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

const SHOT_SHAPES: readonly ShotShape[] = ["Hyzer", "Anhyzer", "Straight", "Spike"];

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
    let firstName = pick(FIRST_NAMES, rng);
    let lastName = pick(LAST_NAMES, rng);
    let name = `${firstName} ${lastName}`;
    // A few retries to avoid duplicate names within the same field.
    for (let attempt = 0; attempt < 5 && usedNames.has(name); attempt++) {
      firstName = pick(FIRST_NAMES, rng);
      lastName = pick(LAST_NAMES, rng);
      name = `${firstName} ${lastName}`;
    }
    usedNames.add(name);

    const power       = rollInRange(MIN_STAT, MAX_STAT, rng);
    const accuracy    = rollInRange(MIN_STAT, MAX_STAT, rng);
    const putting     = rollInRange(MIN_STAT, MAX_STAT, rng);
    const scramble    = rollInRange(MIN_STAT, MAX_STAT, rng);
    const consistency = rollInRange(MIN_STAT, MAX_STAT, rng);
    const mental      = rollInRange(MIN_STAT, MAX_STAT, rng);
    const fitness     = rollInRange(MIN_STAT, MAX_STAT, rng);
    const overall = Math.round(
      (power + accuracy + putting + scramble + consistency + mental + fitness) / 7
    );

    opponents.push({
      id: `opponent-${i + 1}`,
      firstName,
      lastName,
      age: rollInRange(20, 39, rng),
      nationality: "Croatia",
      overall,
      power,
      accuracy,
      putting,
      scramble,
      consistency,
      mental,
      fitness,
      morale: 50,
      potential: overall,
      salary: 0,
      form: 50,
      popularity: 0,
      preferredShotShape: pick(SHOT_SHAPES, rng),
      injuries: [],
      isOpponent: true,
    });
  }

  return opponents;
}
