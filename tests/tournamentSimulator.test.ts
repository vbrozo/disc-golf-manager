import { describe, expect, it } from "vitest";
import {
  earningsForPlacement,
  reputationForPlacement,
  simulateTournament,
} from "@/game/simulation/tournamentSimulator";
import type { Course, Hole } from "@/models/Course";
import type { Tournament } from "@/models/Tournament";
import { makePlayer } from "./helpers";

function fixedRng(value: number) {
  return () => value;
}

function flatCourse(): Course {
  const hole: Hole = {
    par: 3,
    distance: 75,
    difficulty: 30,
    wooded: 10,
    elevation: 10,
    obRisk: 10,
  };
  return { id: "test-course", name: "Test Course", holes: Array.from({ length: 18 }, () => hole) };
}

const tournament: Tournament = {
  id: "test-tournament",
  name: "Test Open",
  courseId: "test-course",
  rounds: 4,
  holesPerRound: 18,
  difficulty: 1,
  prizePool: 1000,
  reputationRequired: 0,
};

describe("simulateTournament", () => {
  it("plays 4 rounds of 18 holes per player", () => {
    const player = makePlayer();
    const result = simulateTournament([player], tournament, flatCourse(), {
      rng: fixedRng(0.5),
    });
    const standing = result.standings[0];
    expect(standing.rounds).toHaveLength(tournament.rounds);
    standing.rounds.forEach((round) => expect(round.holes).toHaveLength(18));
  });

  it("plays a shorter 3-round, 9-hole tournament using the front nine", () => {
    const shortTournament: Tournament = { ...tournament, rounds: 3, holesPerRound: 9 };
    const player = makePlayer();
    const result = simulateTournament([player], shortTournament, flatCourse(), {
      rng: fixedRng(0.5),
    });
    const standing = result.standings[0];
    expect(standing.rounds).toHaveLength(3);
    standing.rounds.forEach((round) => expect(round.holes).toHaveLength(9));
  });

  it("ranks players by total strokes across all rounds, lowest first", () => {
    const strong = makePlayer({
      id: "strong",
      accuracy: 95,
      putting: 95,
      power: 90,
      scramble: 90,
      consistency: 90,
      mental: 90,
    });
    const weak = makePlayer({
      id: "weak",
      accuracy: 20,
      putting: 20,
      power: 20,
      scramble: 20,
      consistency: 20,
      mental: 20,
    });

    const result = simulateTournament([weak, strong], tournament, flatCourse(), {
      rng: fixedRng(0.5),
    });

    expect(result.standings[0].player.id).toBe("strong");
    expect(result.standings[0].placement).toBe(1);
    expect(result.standings[1].player.id).toBe("weak");
    expect(result.standings[1].totalStrokes).toBeGreaterThanOrEqual(
      result.standings[0].totalStrokes
    );
  });

  it("rewards a player with equipped discs over an identical player without them", () => {
    const plain = makePlayer({ id: "plain" });
    const equipped = makePlayer({
      id: "equipped",
      equipped: {
        Driver: { id: "test-driver", name: "Test Driver", type: "Driver", rarity: "Signature", bonus: 30 },
      },
    });

    const result = simulateTournament([plain, equipped], tournament, flatCourse(), {
      rng: fixedRng(0.5),
    });

    const plainStanding = result.standings.find((s) => s.player.id === "plain")!;
    const equippedStanding = result.standings.find((s) => s.player.id === "equipped")!;
    expect(equippedStanding.totalStrokes).toBeLessThanOrEqual(plainStanding.totalStrokes);
  });
});

describe("earningsForPlacement", () => {
  it("gives the winner the largest share of the pool", () => {
    expect(earningsForPlacement(1000, 1, 4)).toBeGreaterThan(earningsForPlacement(1000, 4, 4));
  });
});

describe("reputationForPlacement", () => {
  it("decays with placement and scales with difficulty", () => {
    expect(reputationForPlacement(5, 1)).toBeGreaterThan(reputationForPlacement(5, 5));
    expect(reputationForPlacement(5, 1)).toBeGreaterThan(reputationForPlacement(1, 1));
  });
});
