import { describe, expect, it } from "vitest";
import { getAchievements, getCurrentStreak } from "@/game/achievements";
import type { Club, TournamentResult } from "@/types";

const club: Club = { id: "c1", name: "Test Club", money: 0, reputation: 0 };

function result(placement: number): TournamentResult {
  return {
    id: `r-${placement}-${Math.random()}`,
    tournamentId: "t",
    tournamentName: "Test",
    placement,
    earnings: 0,
    reputationGained: 0,
  };
}

describe("getAchievements", () => {
  it("locks every achievement for a fresh club", () => {
    const achievements = getAchievements(club, []);
    expect(achievements.every((a) => !a.unlocked)).toBe(true);
  });

  it("unlocks first-win once a tournament is won", () => {
    const achievements = getAchievements(club, [result(1)]);
    expect(
      achievements.find((a) => a.id === "first-win")?.unlocked
    ).toBe(true);
  });

  it("unlocks three-tournaments after the third entry, regardless of placement", () => {
    const tournaments = [result(5), result(6), result(4)];
    const achievements = getAchievements(club, tournaments);
    expect(
      achievements.find((a) => a.id === "three-tournaments")?.unlocked
    ).toBe(true);
  });

  it("unlocks reputation-100 once the club reaches 100 reputation", () => {
    const achievements = getAchievements({ ...club, reputation: 100 }, []);
    expect(
      achievements.find((a) => a.id === "reputation-100")?.unlocked
    ).toBe(true);
  });
});

describe("getCurrentStreak", () => {
  it("is zero with no history", () => {
    expect(getCurrentStreak([])).toBe(0);
  });

  it("counts consecutive top-3 finishes from the most recent backwards", () => {
    expect(getCurrentStreak([result(1), result(2), result(3)])).toBe(3);
  });

  it("stops counting at the first finish outside the top 3", () => {
    expect(getCurrentStreak([result(1), result(5), result(2)])).toBe(1);
  });
});
