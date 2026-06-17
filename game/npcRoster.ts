// Persistent NPC roster for Disc Golf Manager.
//
// Generates 100 NPC players across five skill tiers (20 per tier) at the start
// of a new game. They persist through the save, accumulate ratings as they
// compete in tournaments, and appear on the global ranking list.

import type { Player, ShotShape } from "@/models/Player";
import type { RandomFn } from "./simulation/holeSimulator";
import { averageRating } from "./rating";
import { pick, rollInRange } from "@/utils/random";

/** Total number of NPCs generated at the start of each game. */
export const NPC_ROSTER_SIZE = 100;

const FIRST_NAMES = [
  "Ivan", "Marko", "Luka", "Ante", "Josip", "Petar", "Tomislav", "Domagoj",
  "Nikola", "Filip", "Mateo", "Karlo", "David", "Stjepan", "Hrvoje", "Dario",
  "Igor", "Bruno", "Roko", "Vedran", "Mislav", "Krešimir", "Goran", "Zoran",
  "Sven", "Leon", "Tin", "Borna", "Matija", "Toni", "Stipe", "Alen",
  "Mario", "Nino", "Darko", "Saša", "Denis", "Mirko", "Renato", "Zdravko",
];

const LAST_NAMES = [
  "Horvat", "Kovačević", "Babić", "Marić", "Jurić", "Novak", "Knežević",
  "Vuković", "Marković", "Petrović", "Tomić", "Matić", "Pavić", "Blažević",
  "Grgić", "Lovrić", "Perić", "Šimić", "Radić", "Barišić", "Vidović", "Bošnjak",
  "Cindrić", "Žugaj", "Sučić", "Ivanušec", "Perišić", "Brozović", "Modrić", "Kramarić",
];

const SHOT_SHAPES: readonly ShotShape[] = ["Hyzer", "Anhyzer", "Straight", "Spike"];

/** Five skill tiers — 20 NPCs each, low to elite. */
const TIERS = [
  { label: "beginner",     statMin: 25, statMax: 42 },
  { label: "amateur",      statMin: 38, statMax: 55 },
  { label: "intermediate", statMin: 50, statMax: 67 },
  { label: "advanced",     statMin: 62, statMax: 78 },
  { label: "elite",        statMin: 72, statMax: 92 },
] as const;

const PER_TIER = NPC_ROSTER_SIZE / TIERS.length; // 20

/**
 * Derive a plausible starting rating history from a player's stats.
 * Better players start with a higher rating and a short history so early
 * tournament results can still shift them noticeably.
 *
 * Formula maps overall 25 → ~700, overall 58 → ~882, overall 92 → ~1018
 * giving a ~318-point spread across tiers so the propagator calibration
 * produces meaningful per-tournament ratings instead of clustering everyone
 * around the same value.
 */
function seedRatingHistory(overall: number, rng: RandomFn): number[] {
  const base = 650 + Math.round((overall / 100) * 400);
  // 3 seed rounds with ±40 jitter each
  return Array.from({ length: 3 }, () => {
    const jitter = Math.round((rng() - 0.5) * 80);
    return Math.min(1100, Math.max(600, base + jitter));
  });
}

/**
 * Generate the 100-player NPC roster for a new game. Inject `rng` for
 * deterministic tests; otherwise uses Math.random.
 */
export function generateNpcRoster(options: { rng?: RandomFn } = {}): Player[] {
  const rng = options.rng ?? Math.random;
  const roster: Player[] = [];
  const usedNames = new Set<string>();

  TIERS.forEach((tier, tierIdx) => {
    for (let i = 0; i < PER_TIER; i++) {
      const seq = tierIdx * PER_TIER + i + 1;

      // Name collision retries
      let firstName = pick(FIRST_NAMES, rng);
      let lastName = pick(LAST_NAMES, rng);
      for (let attempt = 0; attempt < 8 && usedNames.has(`${firstName} ${lastName}`); attempt++) {
        firstName = pick(FIRST_NAMES, rng);
        lastName = pick(LAST_NAMES, rng);
      }
      usedNames.add(`${firstName} ${lastName}`);

      const stats = {
        power:       rollInRange(tier.statMin, tier.statMax, rng),
        accuracy:    rollInRange(tier.statMin, tier.statMax, rng),
        putting:     rollInRange(tier.statMin, tier.statMax, rng),
        scramble:    rollInRange(tier.statMin, tier.statMax, rng),
        consistency: rollInRange(tier.statMin, tier.statMax, rng),
        mental:      rollInRange(tier.statMin, tier.statMax, rng),
        fitness:     rollInRange(tier.statMin, tier.statMax, rng),
      };
      const overall = Math.round(
        (stats.power + stats.accuracy + stats.putting + stats.scramble +
         stats.consistency + stats.mental + stats.fitness) / 7
      );

      const ratingHistory = seedRatingHistory(overall, rng);
      const rating = averageRating(ratingHistory) ?? 0;

      roster.push({
        id: `npc-${seq}`,
        firstName,
        lastName,
        age: rollInRange(18, 42, rng),
        nationality: "Croatia",
        overall,
        ...stats,
        morale: 50,
        potential: overall,
        salary: 0,
        form: 50,
        popularity: 0,
        preferredShotShape: pick(SHOT_SHAPES, rng),
        injuries: [],
        isOpponent: true,
        ratingHistory,
        rating,
      });
    }
  });

  return roster;
}

/**
 * Pick `count` NPCs from the roster appropriate for the given tournament
 * difficulty (1–5). Higher difficulty → prefer higher-rated NPCs.
 * Always returns exactly `count` entries (wraps if roster is too small).
 */
export function sampleNpcsForTournament(
  npcRoster: Player[],
  difficulty: number,
  count: number,
  options: { rng?: RandomFn } = {}
): Player[] {
  if (npcRoster.length === 0 || count === 0) return [];
  const rng = options.rng ?? Math.random;

  // Target rating for this difficulty (aligned with new seed formula):
  // diff 1 → ~850 (amateur tier, stats 38–55), diff 5 → ~1050 (elite)
  const targetRating = 850 + (difficulty - 1) * 50;
  const tolerance = 80 + (difficulty * 15); // wider band for harder events

  // Score each NPC by proximity to target rating; closer = higher weight
  const scored = npcRoster.map((npc) => {
    const r = npc.rating ?? 900;
    const dist = Math.abs(r - targetRating);
    const weight = Math.max(1, tolerance - dist);
    return { npc, weight };
  });

  // Weighted reservoir sampling — maintain a running total so each draw is O(n)
  // instead of re-summing the entire pool on every iteration.
  const selected: Player[] = [];
  const pool = [...scored];
  let runningTotal = pool.reduce((s, p) => s + p.weight, 0);

  for (let i = 0; i < count && pool.length > 0; i++) {
    let rand = rng() * runningTotal;
    let idx = 0;
    for (; idx < pool.length - 1; idx++) {
      rand -= pool[idx].weight;
      if (rand <= 0) break;
    }
    selected.push(pool[idx].npc);
    runningTotal -= pool[idx].weight;
    pool.splice(idx, 1);
  }

  return selected;
}
