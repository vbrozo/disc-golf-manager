import type { Disc, DiscRarity, Player } from "@/types";

export interface AvatarStyle {
  emoji: string;
  color: string;
}

const STAT_AVATARS: Record<keyof Player["stats"], AvatarStyle> = {
  Driving: { emoji: "🚀", color: "#38bdf8" },
  Accuracy: { emoji: "🎯", color: "#4ade80" },
  Putting: { emoji: "🥏", color: "#a78bfa" },
  Mental: { emoji: "🧠", color: "#f472b6" },
  Stamina: { emoji: "💪", color: "#fb923c" },
};

/** Avatar keyed off a player's strongest stat, so it reflects their playstyle. */
export function getPlayerAvatar(player: Player): AvatarStyle {
  const statKeys = Object.keys(player.stats) as (keyof Player["stats"])[];
  const dominant = statKeys.reduce((best, key) =>
    player.stats[key] > player.stats[best] ? key : best
  );
  return STAT_AVATARS[dominant];
}

const DISC_TYPE_EMOJI: Record<Disc["type"], string> = {
  Driver: "🥏",
  Midrange: "🌀",
  Putter: "🎯",
};

const RARITY_COLOR: Record<DiscRarity, string> = {
  Common: "#64748b",
  Rare: "#3b82f6",
  Pro: "#a855f7",
  Signature: "#f59e0b",
};

export function getDiscAvatar(disc: Disc): AvatarStyle {
  return { emoji: DISC_TYPE_EMOJI[disc.type], color: RARITY_COLOR[disc.rarity] };
}

const FALLBACK_COLORS = ["#38bdf8", "#4ade80", "#a78bfa", "#f472b6", "#fb923c", "#facc15"];

/** Deterministic avatar for entries we only know by name (e.g. AI opponents on a leaderboard row). */
export function getNameAvatar(name: string): AvatarStyle {
  const hash = name.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return { emoji: "🏌", color: FALLBACK_COLORS[hash % FALLBACK_COLORS.length] };
}

const PLACEMENT_MEDAL: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

export function getPlacementMedal(placement: number): string | null {
  return PLACEMENT_MEDAL[placement] ?? null;
}
