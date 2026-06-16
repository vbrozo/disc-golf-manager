// Disc equipment engine for Disc Golf Manager.
//
// Frontend-only, framework-free: no React, no Zustand. The disc catalogue is
// static game data and the helpers are pure functions over the shared domain
// types, so they can be unit tested and called from store actions or the UI.

import type {
  Disc,
  DiscLoadout,
  DiscRarity,
  DiscType,
  Player,
  PlayerStats,
} from "@/types";

/** Player stats are capped at 100; disc bonuses can never push past this. */
const MAX_STAT = 100;

/**
 * Which player stat each disc type improves. Stamina and Mental are not
 * influenced by discs — they are developed through training only.
 */
export const DISC_TYPE_STAT: Record<DiscType, keyof PlayerStats> = {
  Driver: "Driving",
  Midrange: "Accuracy",
  Putter: "Putting",
};

/**
 * Stat bonus granted by each rarity tier. Higher rarities give bigger bonuses,
 * so rarer discs are meaningfully more valuable.
 */
export const RARITY_BONUS: Record<DiscRarity, number> = {
  Common: 2,
  Rare: 4,
  Pro: 6,
  Signature: 9,
};

/** The bonus a disc of the given rarity grants to its type's stat. */
export function bonusForRarity(rarity: DiscRarity): number {
  return RARITY_BONUS[rarity];
}

/**
 * Money cost to buy a disc in the shop. Derived from the disc's stat bonus so
 * stronger (rarer) discs cost proportionally more, keeping the shop priced in
 * line with {@link RARITY_BONUS} (Common ≈ 100 … Signature ≈ 450).
 */
export const DISC_PRICE_PER_BONUS = 50;

/** The shop price of a disc, scaled by the stat bonus it grants. */
export function getDiscPrice(disc: Disc): number {
  return disc.bonus * DISC_PRICE_PER_BONUS;
}

/**
 * Build a {@link Disc}, deriving its `bonus` from its rarity so the catalogue
 * and any runtime-created discs stay consistent with {@link RARITY_BONUS}.
 */
export function createDisc(
  id: string,
  name: string,
  type: DiscType,
  rarity: DiscRarity
): Disc {
  return { id, name, type, rarity, bonus: bonusForRarity(rarity) };
}

/**
 * The discs available in the game, spanning every type and rarity. Ordered by
 * type then ascending rarity so better discs sit lower in each group.
 */
export const DISCS: readonly Disc[] = [
  // Drivers (boost Driving)
  createDisc("driver-common", "Beginner Driver", "Driver", "Common"),
  createDisc("driver-rare", "Tour Driver", "Driver", "Rare"),
  createDisc("driver-pro", "Pro Distance Driver", "Driver", "Pro"),
  createDisc("driver-signature", "Champion Signature Driver", "Driver", "Signature"),

  // Midranges (boost Accuracy)
  createDisc("midrange-common", "Practice Midrange", "Midrange", "Common"),
  createDisc("midrange-rare", "Tour Midrange", "Midrange", "Rare"),
  createDisc("midrange-pro", "Pro Control Midrange", "Midrange", "Pro"),
  createDisc("midrange-signature", "Champion Signature Midrange", "Midrange", "Signature"),

  // Putters (boost Putting)
  createDisc("putter-common", "Practice Putter", "Putter", "Common"),
  createDisc("putter-rare", "Tour Putter", "Putter", "Rare"),
  createDisc("putter-pro", "Pro Approach Putter", "Putter", "Pro"),
  createDisc("putter-signature", "Champion Signature Putter", "Putter", "Signature"),
] as const;

/** Look up a disc in the catalogue by id, or `undefined` if unknown. */
export function getDiscById(id: string): Disc | undefined {
  return DISCS.find((disc) => disc.id === id);
}

/**
 * Equip a disc, returning a new {@link DiscLoadout}. Equip rules allow only one
 * disc per type, so the disc replaces whatever currently occupies its type's
 * slot. Pure: the input loadout is not mutated.
 */
export function equipDisc(loadout: DiscLoadout, disc: Disc): DiscLoadout {
  return { ...loadout, [disc.type]: disc };
}

/**
 * Unequip the disc in the given type's slot, returning a new loadout. Pure: the
 * input loadout is not mutated.
 */
export function unequipDisc(loadout: DiscLoadout, type: DiscType): DiscLoadout {
  const next = { ...loadout };
  delete next[type];
  return next;
}

/**
 * Total stat bonuses provided by an equipped loadout, keyed by player stat.
 * Only stats touched by an equipped disc appear in the result.
 */
export function getLoadoutBonuses(
  loadout: DiscLoadout
): Partial<PlayerStats> {
  const bonuses: Partial<PlayerStats> = {};
  (Object.keys(DISC_TYPE_STAT) as DiscType[]).forEach((type) => {
    const disc = loadout[type];
    if (disc) {
      const stat = DISC_TYPE_STAT[type];
      bonuses[stat] = (bonuses[stat] ?? 0) + disc.bonus;
    }
  });
  return bonuses;
}

/**
 * Apply a loadout's bonuses to a set of base stats, returning new stats with
 * each affected value raised by its disc bonus (capped at {@link MAX_STAT}).
 * Pure: the input stats are not mutated.
 */
export function applyDiscBonuses(
  stats: PlayerStats,
  loadout: DiscLoadout
): PlayerStats {
  const bonuses = getLoadoutBonuses(loadout);
  const result: PlayerStats = { ...stats };
  (Object.keys(bonuses) as (keyof PlayerStats)[]).forEach((stat) => {
    result[stat] = Math.min(MAX_STAT, result[stat] + (bonuses[stat] ?? 0));
  });
  return result;
}

/**
 * A player's effective stats with their equipped discs applied. Use this for
 * simulation and UI so disc bonuses actually count toward performance. Players
 * with no equipped discs are returned unchanged.
 */
export function effectivePlayerStats(player: Player): PlayerStats {
  if (!player.equipped) {
    return player.stats;
  }
  return applyDiscBonuses(player.stats, player.equipped);
}
