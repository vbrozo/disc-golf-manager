import { describe, expect, it } from "vitest";
import {
  appendRoundRating,
  averageRating,
  BASE_RATING,
  calculateConsistency,
  calculateRoundRating,
  RATING_ROUNDS_WINDOW,
} from "@/game";

describe("calculateRoundRating", () => {
  it("rates a par round at the baseline", () => {
    expect(calculateRoundRating(0, 18)).toBe(BASE_RATING);
  });

  it("rates under-par rounds above and over-par below the baseline", () => {
    expect(calculateRoundRating(-5, 18)).toBe(BASE_RATING + 50);
    expect(calculateRoundRating(5, 18)).toBe(BASE_RATING - 50);
  });

  it("normalises 9-hole rounds to an 18-hole basis", () => {
    // -5 over 9 holes projects to -10 over 18 → +100.
    expect(calculateRoundRating(-5, 9)).toBe(BASE_RATING + 100);
  });

  it("clamps extreme scores into the rating range", () => {
    expect(calculateRoundRating(-100, 18)).toBeLessThanOrEqual(1100);
    expect(calculateRoundRating(100, 18)).toBeGreaterThanOrEqual(600);
  });
});

describe("rating history", () => {
  it("keeps only the most recent window of ratings", () => {
    let history: number[] = [];
    for (let i = 0; i < RATING_ROUNDS_WINDOW + 3; i++) {
      history = appendRoundRating(history, 900 + i);
    }
    expect(history).toHaveLength(RATING_ROUNDS_WINDOW);
    expect(history[history.length - 1]).toBe(900 + RATING_ROUNDS_WINDOW + 2);
  });

  it("averages the history, or returns undefined when empty", () => {
    expect(averageRating([900, 950, 1000])).toBe(950);
    expect(averageRating([])).toBeUndefined();
    expect(averageRating(undefined)).toBeUndefined();
  });
});

describe("calculateConsistency", () => {
  it("is undefined until at least two rated rounds exist", () => {
    expect(calculateConsistency(undefined)).toBeUndefined();
    expect(calculateConsistency([])).toBeUndefined();
    expect(calculateConsistency([950])).toBeUndefined();
  });

  it("scores a player who rates the same every round at 100", () => {
    expect(calculateConsistency([950, 950, 950])).toBe(100);
  });

  it("scores a wider spread lower than a tighter one", () => {
    const tight = calculateConsistency([945, 950, 955])!;
    const loose = calculateConsistency([850, 950, 1050])!;
    expect(tight).toBeGreaterThan(loose);
    expect(loose).toBeGreaterThanOrEqual(0);
  });

  it("floors very swingy players at 0", () => {
    expect(calculateConsistency([700, 1100])).toBe(0);
  });
});
