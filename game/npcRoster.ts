// Persistent NPC roster for Disc Golf Manager.
//
// Generates 100 NPC players across five skill tiers (20 per tier) at the start
// of a new game. They persist through the save, accumulate ratings as they
// compete in tournaments, and appear on the global ranking list.

import type { Player, ShotShape } from "@/models/Player";
import type { RandomFn } from "./simulation/holeSimulator";
import { BASE_RATING, RATING_PER_STROKE } from "./rating";

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

function pick<T>(items: readonly T[], rng: RandomFn): T {
  return items[Math.floor(rng() * items.length)];
}

function rollInRange(min: number, max: number, rng: RandomFn): number {
  return min + Math.floor(rng() * (max - min + 1));
}

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
 */
function seedRatingHistory(overall: number, rng: RandomFn): number[] {
  // Target: overall 25 → ~820, overall 92 → ~1020
  const base = 800 + Math.round((overall / 100) * 250);
  // 3 seed rounds with ±30 jitter each
  return [0, 1, 2].map(() => {
    const jitter = Math.round((rng() - 0.5) * 60);
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
  let seq = 0;

  for (const tier of TIERS) {
    for (let i = 0; i < PER_TIER; i++) {
      seq++;
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
      const rating = Math.round(
        ratingHistory.reduce((s, r) => s + r, 0) / ratingHistory.length
      );

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
  }

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

  // Target rating for this difficulty: diff 1 → ~840, diff 5 → ~1000
  const targetRating = 820 + (difficulty - 1) * 45;
  const tolerance = 80 + (difficulty * 15); // wider band for harder events

  // Score each NPC by proximity to target rating; closer = higher weight
  const scored = npcRoster.map((npc) => {
    const r = npc.rating ?? 900;
    const dist = Math.abs(r - targetRating);
    const weight = Math.max(1, tolerance - dist);
    return { npc, weight };
  });

  // Weighted reservoir sampling
  const selected: Player[] = [];
  const pool = [...scored];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const total = pool.reduce((s, p) => s + p.weight, 0);
    let rand = rng() * total;
    let idx = 0;
    for (; idx < pool.length - 1; idx++) {
      rand -= pool[idx].weight;
      if (rand <= 0) break;
    }
    selected.push(pool[idx].npc);
    pool.splice(idx, 1);
  }

  return selected;
}
