import { describe, expect, it } from "vitest";
import {
  basePerformance,
  formBonus,
  holeDifficultyScore,
  moraleBonus,
  outcomeForDifference,
  simulateHole,
  strokesForOutcome,
} from "@/game/simulation/holeSimulator";
import type { Hole } from "@/models/Course";
import { makePlayer } from "./helpers";

function fixedRng(value: number) {
  return () => value;
}

const easyHole: Hole = {
  par: 3,
  distance: 200,
  difficulty: 10,
  wooded: 5,
  elevation: 5,
  obRisk: 5,
};

describe("basePerformance", () => {
  it("weights accuracy/putting/power/scramble/consistency/mental as specified", () => {
    const player = makePlayer({
      accuracy: 80,
      putting: 70,
      power: 60,
      scramble: 50,
      consistency: 40,
      mental: 30,
    });
    const expected = 80 * 0.25 + 70 * 0.2 + 60 * 0.15 + 50 * 0.1 + 40 * 0.1 + 30 * 0.1;
    expect(basePerformance(player)).toBeCloseTo(expected);
  });
});

describe("form/morale bonus", () => {
  it("is zero at the neutral value of 50", () => {
    expect(formBonus(50)).toBe(0);
    expect(moraleBonus(50)).toBe(0);
  });

  it("is positive above 50 and negative below", () => {
    expect(formBonus(100)).toBeGreaterThan(0);
    expect(formBonus(0)).toBeLessThan(0);
    expect(moraleBonus(75)).toBe(5);
  });
});

describe("outcomeForDifference", () => {
  it("maps the exact thresholds from the spec", () => {
    expect(outcomeForDifference(15)).toBe("Eagle");
    expect(outcomeForDifference(8)).toBe("Birdie");
    expect(outcomeForDifference(-7)).toBe("Par");
    expect(outcomeForDifference(-15)).toBe("Bogey");
    expect(outcomeForDifference(-16)).toBe("DoubleBogey");
  });

  it("falls into the bucket just below each threshold", () => {
    expect(outcomeForDifference(14.9)).toBe("Birdie");
    expect(outcomeForDifference(7.9)).toBe("Par");
    expect(outcomeForDifference(-7.1)).toBe("Bogey");
  });
});

describe("strokesForOutcome", () => {
  it("maps outcomes relative to the hole's par", () => {
    expect(strokesForOutcome("Eagle", 4)).toBe(2);
    expect(strokesForOutcome("Birdie", 4)).toBe(3);
    expect(strokesForOutcome("Par", 4)).toBe(4);
    expect(strokesForOutcome("Bogey", 4)).toBe(5);
    expect(strokesForOutcome("DoubleBogey", 4)).toBe(6);
  });
});

describe("holeDifficultyScore", () => {
  it("increases with each contributing factor", () => {
    const base = holeDifficultyScore(easyHole);
    expect(holeDifficultyScore({ ...easyHole, difficulty: 50 })).toBeGreaterThan(base);
    expect(holeDifficultyScore({ ...easyHole, obRisk: 80 })).toBeGreaterThan(base);
    expect(holeDifficultyScore({ ...easyHole, distance: 600 })).toBeGreaterThan(base);
  });
});

describe("simulateHole", () => {
  it("is deterministic for a fixed rng", () => {
    const player = makePlayer();
    const a = simulateHole(player, easyHole, { rng: fixedRng(0.5) });
    const b = simulateHole(player, easyHole, { rng: fixedRng(0.5) });
    expect(a).toEqual(b);
  });

  it("applies the momentum bonus on top of performance", () => {
    const player = makePlayer();
    const plain = simulateHole(player, easyHole, { rng: fixedRng(0.5) });
    const boosted = simulateHole(player, easyHole, { rng: fixedRng(0.5), momentumBonus: 2 });
    expect(boosted.performance).toBeCloseTo(plain.performance + 2);
  });
});
