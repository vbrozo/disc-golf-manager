import type { Disc, DiscRarity } from "@/models/Disc";
import type { Player } from "@/models/Player";

export interface AvatarStyle {
  emoji: string;
  color: string;
}

type TrainableStat = "power" | "accuracy" | "putting" | "scramble" | "consistency" | "mental" | "fitness";

const STAT_AVATARS: Record<TrainableStat, AvatarStyle> = {
  power: { emoji: "🚀", color: "#38bdf8" },
  accuracy: { emoji: "🎯", color: "#4ade80" },
  putting: { emoji: "🥏", color: "#a78bfa" },
  scramble: { emoji: "🌀", color: "#22d3ee" },
  consistency: { emoji: "🧭", color: "#34d399" },
  mental: { emoji: "🧠", color: "#f472b6" },
  fitness: { emoji: "💪", color: "#fb923c" },
};

const STAT_KEYS: TrainableStat[] = [
  "power",
  "accuracy",
  "putting",
  "scramble",
  "consistency",
  "mental",
  "fitness",
];

/** Avatar keyed off a player's strongest attribute, so it reflects their playstyle. */
export function getPlayerAvatar(player: Player): AvatarStyle {
  const dominant = STAT_KEYS.reduce((best, key) =>
    player[key] > player[best] ? key : best
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
