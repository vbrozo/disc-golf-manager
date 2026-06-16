import { describe, expect, it } from "vitest";
import { generateOpponents } from "@/game";

// Deterministic rng cycling through a few values for repeatable tests.
function seededRng(seed = 0.5): () => number {
  let n = seed;
  return () => {
    n = (n * 9301 + 49297) % 233280;
    return n / 233280;
  };
}

describe("generateOpponents", () => {
  it("creates the requested number of opponents flagged as AI", () => {
    const opponents = generateOpponents(5, { rng: seededRng() });
    expect(opponents).toHaveLength(5);
    opponents.forEach((o) => {
      expect(o.isOpponent).toBe(true);
      expect(o.id).toMatch(/^opponent-/);
    });
  });

  it("rolls every stat within the opponent range", () => {
    const opponents = generateOpponents(10, { rng: seededRng(0.1) });
    opponents.forEach((o) => {
      Object.values(o.stats).forEach((value) => {
        expect(value).toBeGreaterThanOrEqual(42);
        expect(value).toBeLessThanOrEqual(68);
      });
    });
  });

  it("returns an empty list for a zero count", () => {
    expect(generateOpponents(0)).toEqual([]);
  });
});
