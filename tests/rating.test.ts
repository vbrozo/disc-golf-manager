import { describe, expect, it } from "vitest";
import {
  appendRoundRating,
  averageRating,
  BASE_RATING,
  calculateRoundRating,
  RATING_ROUNDS_WINDOW,
} from "@/game";

describe("calculateRoundRating", () => {
  it("rates a par round at the baseline", () => {
    expect(calculateRoundRating(0)).toBe(BASE_RATING);
  });

  it("rates under-par rounds above and over-par below the baseline", () => {
    expect(calculateRoundRating(-5)).toBe(BASE_RATING + 50);
    expect(calculateRoundRating(5)).toBe(BASE_RATING - 50);
  });

  it("clamps extreme scores into the rating range", () => {
    expect(calculateRoundRating(-100)).toBeLessThanOrEqual(1100);
    expect(calculateRoundRating(100)).toBeGreaterThanOrEqual(600);
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
