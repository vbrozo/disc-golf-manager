// Club achievement + streak tracking for Disc Golf Manager.
//
// Frontend-only, framework-free: pure functions over the club's persisted
// tournament history, so they can be unit tested and called straight from
// the UI without touching Zustand.

import type { Club, TournamentResult } from "@/types";

/** A finish inside the prize-paying positions (see `PRIZE_SHARES` in tournaments.ts). */
const TOP_FINISH_PLACEMENT = 3;

export interface Achievement {
  id: string;
  /** i18n key for the badge's display name. */
  nameKey: string;
  /** Icon shown on the badge (emoji keeps this dependency-free). */
  icon: string;
  /** Whether the club has earned this achievement. */
  unlocked: boolean;
}

/**
 * The club's achievement badges, evaluated against its tournament history and
 * current reputation. Always returns every achievement (locked or not) so the
 * UI can render a stable, predictable row of badges.
 */
export function getAchievements(
  club: Club,
  tournaments: TournamentResult[]
): Achievement[] {
  return [
    {
      id: "first-win",
      nameKey: "achievement.firstWin",
      icon: "🏆",
      unlocked: tournaments.some((result) => result.placement === 1),
    },
    {
      id: "three-tournaments",
      nameKey: "achievement.threeTournaments",
      icon: "🎽",
      unlocked: tournaments.length >= 3,
    },
    {
      id: "reputation-100",
      nameKey: "achievement.reputation100",
      icon: "⭐",
      unlocked: club.reputation >= 100,
    },
  ];
}

/**
 * The club's current streak: consecutive most-recent tournaments finished in
 * the top {@link TOP_FINISH_PLACEMENT}. Stops counting at the first finish
 * outside that range. Zero if the most recent result missed the podium (or
 * there's no history yet).
 */
export function getCurrentStreak(tournaments: TournamentResult[]): number {
  let streak = 0;
  for (let i = tournaments.length - 1; i >= 0; i -= 1) {
    if (tournaments[i].placement <= TOP_FINISH_PLACEMENT) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}
