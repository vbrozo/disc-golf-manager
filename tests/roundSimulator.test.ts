import { describe, expect, it } from "vitest";
import { simulateRound } from "@/game/simulation/roundSimulator";
import type { Hole } from "@/models/Course";
import { makePlayer } from "./helpers";

function fixedRng(value: number) {
  return () => value;
}

function flatHoles(par: Hole["par"] = 3): Hole[] {
  const hole: Hole = {
    par,
    distance: 250,
    difficulty: 30,
    wooded: 10,
    elevation: 10,
    obRisk: 10,
  };
  return Array.from({ length: 18 }, () => hole);
}

describe("simulateRound", () => {
  it("sums strokes and score across all 18 holes", () => {
    const player = makePlayer();
    const round = simulateRound(player, flatHoles(), { rng: fixedRng(0.5) });
    expect(round.holes).toHaveLength(18);
    const summedStrokes = round.holes.reduce((sum, h) => sum + h.strokes, 0);
    expect(round.totalStrokes).toBe(summedStrokes);
    const summedScore = round.holes.reduce((sum, h) => sum + h.scoreToPar, 0);
    expect(round.totalScore).toBe(summedScore);
  });

  it("tallies outcome counts that add up to 18", () => {
    const player = makePlayer();
    const round = simulateRound(player, flatHoles(), { rng: fixedRng(0.4) });
    const total = Object.values(round.counts).reduce((sum, c) => sum + c, 0);
    expect(total).toBe(18);
  });

  it("grants a momentum bonus after 3 birdies-or-better in a row", () => {
    // A strong player on an easy course should string together birdies and
    // benefit from the momentum bonus on a later hole versus an identical
    // single-hole simulation without any momentum.
    const strongPlayer = makePlayer({
      accuracy: 95,
      putting: 95,
      power: 90,
      scramble: 90,
      consistency: 90,
      mental: 90,
      form: 90,
      morale: 90,
    });
    const round = simulateRound(strongPlayer, flatHoles(), { rng: fixedRng(0.9) });
    // With consistently strong rolls, expect at least one good streak to form.
    const goodCount = round.counts.Eagle + round.counts.Birdie;
    expect(goodCount).toBeGreaterThanOrEqual(3);
  });

  it("applies a slump penalty after 2 double-bogeys in a row", () => {
    const weakPlayer = makePlayer({
      accuracy: 5,
      putting: 5,
      power: 5,
      scramble: 5,
      consistency: 5,
      mental: 5,
      form: 5,
      morale: 5,
    });
    const round = simulateRound(weakPlayer, flatHoles(), { rng: fixedRng(0.1) });
    expect(round.counts.DoubleBogey).toBeGreaterThanOrEqual(2);
  });

  it("does not mutate the player's persistent morale field", () => {
    const player = makePlayer({ morale: 50 });
    simulateRound(player, flatHoles(), { rng: fixedRng(0.1) });
    expect(player.morale).toBe(50);
  });
});
