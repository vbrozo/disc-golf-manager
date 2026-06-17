// Club facility upgrades for Disc Golf Manager.
//
// Pure definitions and effect helpers — no React, no Zustand.

/** One purchasable club upgrade with up to two levels. */
export interface ClubUpgrade {
  id: string;
  maxLevel: number;
  /** Cost to reach each successive level (index 0 = level 1, index 1 = level 2). */
  costs: readonly number[];
}

export const CLUB_UPGRADES: readonly ClubUpgrade[] = [
  { id: "training-center", maxLevel: 2, costs: [800, 2000] },
  { id: "video-analysis",  maxLevel: 2, costs: [600, 1500] },
  { id: "medical-team",    maxLevel: 2, costs: [500, 1200] },
  { id: "club-sponsor",    maxLevel: 2, costs: [400, 1000] },
] as const;

/** Get an upgrade definition by id, or undefined. */
export function getUpgradeById(id: string): ClubUpgrade | undefined {
  return CLUB_UPGRADES.find((u) => u.id === id);
}

/** Cost to purchase the next level of an upgrade, or null if already maxed. */
export function getUpgradeCost(
  id: string,
  currentLevel: number
): number | null {
  const upgrade = getUpgradeById(id);
  if (!upgrade || currentLevel >= upgrade.maxLevel) return null;
  return upgrade.costs[currentLevel];
}

// ---------------------------------------------------------------------------
// Effect helpers (each returns the modifier for a given upgrade record)
// ---------------------------------------------------------------------------

/** Training cost multiplier from Training Center (0.85 Lv1, 0.70 Lv2). */
export function trainingCostMultiplier(upgrades: Record<string, number>): number {
  const level = upgrades["training-center"] ?? 0;
  if (level >= 2) return 0.70;
  if (level >= 1) return 0.85;
  return 1.0;
}

/** Extra training boost from Video Analysis (+1 Lv1, +2 Lv2). */
export function trainingBoostBonus(upgrades: Record<string, number>): number {
  return upgrades["video-analysis"] ?? 0;
}

/** Extra injury weeks recovered per round from Medical Team. */
export function injuryRecoveryBonus(upgrades: Record<string, number>): number {
  return upgrades["medical-team"] ?? 0;
}

/** Entry fee multiplier from Club Sponsor (0.90 Lv1, 0.80 Lv2). */
export function entryFeeMultiplier(upgrades: Record<string, number>): number {
  const level = upgrades["club-sponsor"] ?? 0;
  if (level >= 2) return 0.80;
  if (level >= 1) return 0.90;
  return 1.0;
}
