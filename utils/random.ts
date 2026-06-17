import type { RandomFn } from "@/game/simulation/holeSimulator";

/** Pick a uniformly-random element of a non-empty array. */
export function pick<T>(items: readonly T[], rng: RandomFn): T {
  return items[Math.floor(rng() * items.length)];
}

/** Roll an integer in the [min, max] inclusive range. */
export function rollInRange(min: number, max: number, rng: RandomFn): number {
  return min + Math.floor(rng() * (max - min + 1));
}
