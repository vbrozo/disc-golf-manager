// v2 Disc domain model for Disc Golf Manager.

/**
 * The three disc categories. Each type improves a single v2 {@link
 * Player} attribute: Driver → power, Midrange → accuracy, Putter → putting.
 */
export type DiscType = "Driver" | "Midrange" | "Putter";

/** Disc rarity tiers, from weakest to strongest stat bonus. */
export type DiscRarity = "Common" | "Rare" | "Pro" | "Signature";

export interface Disc {
  id: string;
  name: string;
  type: DiscType;
  rarity: DiscRarity;
  /** Attribute bonus granted by the disc (strength scales with rarity). */
  bonus: number;
}

/**
 * A player's equipped discs. Equip rules allow at most one disc per type, so
 * each slot is optional and holds a single {@link Disc}.
 */
export interface DiscLoadout {
  Driver?: Disc;
  Midrange?: Disc;
  Putter?: Disc;
}
