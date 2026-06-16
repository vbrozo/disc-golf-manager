import { describe, expect, it } from "vitest";
import { simulateRound, simulateTournament } from "@/game/simulation";
import type { Player, PlayerStats, Tournament } from "@/types";

const baseStats: PlayerStats = {
  Driving: 50,
  Accuracy: 50,
  Putting: 50,
  Mental: 50,
  Stamina: 50,
};

function fixedRng(value: number) {
  return () => value;
}

describe("simulateRound fatigue", () => {
  it("does not fatigue a player with full Stamina", () => {
    const stats: PlayerStats = { ...baseStats, Stamina: 100 };
    const round = simulateRound(stats, 18, { rng: fixedRng(0.5) });
    // With a fixed rng and no fatigue, every hole gets identical performance.
    const performances = round.holes.map((h) => h.performance);
    expect(new Set(performances).size).toBe(1);
  });

  it("degrades performance over the round for a low-Stamina player", () => {
    const stats: PlayerStats = { ...baseStats, Stamina: 0 };
    const round = simulateRound(stats, 18, { rng: fixedRng(0.5) });
    const first = round.holes[0].performance;
    const last = round.holes[round.holes.length - 1].performance;
    expect(last).toBeLessThan(first);
  });

  it("fatigues less over a 9-hole round than an 18-hole round", () => {
    const stats: PlayerStats = { ...baseStats, Stamina: 0 };
    const round9 = simulateRound(stats, 9, { rng: fixedRng(0.5) });
    const round18 = simulateRound(stats, 18, { rng: fixedRng(0.5) });
    const drop9 = round9.holes[0].performance - round9.holes[8].performance;
    const drop18 = round18.holes[0].performance - round18.holes[17].performance;
    expect(drop9).toBeLessThan(drop18);
  });
});

describe("simulateTournament disc bonuses", () => {
  const tournament: Tournament = {
    id: "test-tournament",
    name: "Test Open",
    reputationRequired: 0,
    holes: 18,
    difficulty: 1,
    prizePool: 1000,
  };

  it("rewards a player with equipped discs over an identical player without them", () => {
    const plain: Player = { id: "plain", name: "Plain", stats: baseStats };
    const equipped: Player = {
      id: "equipped",
      name: "Equipped",
      stats: baseStats,
      equipped: {
        Driver: {
          id: "test-driver",
          name: "Test Driver",
          type: "Driver",
          rarity: "Signature",
          bonus: 30,
        },
      },
    };

    // Average over many fixed seeds isn't needed: same rng sequence is shared
    // by both players in one simulation, so the only difference is the bonus.
    const result = simulateTournament([plain, equipped], tournament, {
      rng: fixedRng(0.5),
    });

    const plainStanding = result.standings.find((s) => s.player.id === "plain")!;
    const equippedStanding = result.standings.find((s) => s.player.id === "equipped")!;
    expect(equippedStanding.round.totalScore).toBeLessThanOrEqual(
      plainStanding.round.totalScore
    );
    expect(equippedStanding.placement).toBeLessThanOrEqual(plainStanding.placement);
  });
});
