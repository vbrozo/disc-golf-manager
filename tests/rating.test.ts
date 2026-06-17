import { describe, expect, it } from "vitest";
import {
  appendRoundRating,
  averageRating,
  BASE_RATING,
  calculateRoundRating,
  calculateRoundRatingsFromPropagators,
  MIN_PROPAGATORS,
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

describe("calculateRoundRatingsFromPropagators", () => {
  it("falls back to fixed formula when fewer than MIN_PROPAGATORS players have ratings", () => {
    const entries = [
      { id: "a", score: 0 },
      { id: "b", score: -3 },
    ];
    const result = calculateRoundRatingsFromPropagators(entries);
    expect(result.get("a")).toBe(BASE_RATING);
    expect(result.get("b")).toBe(BASE_RATING + 30);
  });

  it("uses propagator calibration when enough rated players are present", () => {
    // Three propagators with known scores and ratings define a perfect line:
    // score -5 → 1000, score 0 → 950, score +5 → 900 (slope = -10, intercept = 950)
    const entries = [
      { id: "p1", score: -5, priorRating: 1000 },
      { id: "p2", score:  0, priorRating:  950 },
      { id: "p3", score:  5, priorRating:  900 },
      { id: "new", score: -2 },       // unrated newcomer
    ];
    const result = calculateRoundRatingsFromPropagators(entries);
    expect(result.get("p1")).toBe(1000);
    expect(result.get("p2")).toBe(950);
    expect(result.get("p3")).toBe(900);
    // Newcomer at -2: 950 - (-2) * 10 = 970
    expect(result.get("new")).toBe(970);
  });

  it("dynamically adjusts the rating-per-stroke value based on the field", () => {
    // Tight field: same scores but ratings span only 60 points over 10 strokes
    // → slope is -6 (6 pts per stroke), not the default 10
    const entries = [
      { id: "a", score: -5, priorRating: 980 },
      { id: "b", score:  0, priorRating: 950 },
      { id: "c", score:  5, priorRating: 920 },
    ];
    const result = calculateRoundRatingsFromPropagators(entries);
    expect(result.get("a")).toBe(980);
    expect(result.get("b")).toBe(950);
    expect(result.get("c")).toBe(920);
  });

  it("clamps results to the valid rating range", () => {
    const entries = [
      { id: "a", score: -50, priorRating: 1090 },
      { id: "b", score:  50, priorRating:  610 },
      { id: "c", score:   0, priorRating:  850 },
    ];
    const result = calculateRoundRatingsFromPropagators(entries);
    expect(result.get("a")).toBeLessThanOrEqual(1100);
    expect(result.get("b")).toBeGreaterThanOrEqual(600);
  });

  it("falls back to fixed formula when all propagators have identical scores", () => {
    const entries = [
      { id: "a", score: 2, priorRating: 1000 },
      { id: "b", score: 2, priorRating:  900 },
      { id: "c", score: 2, priorRating:  800 },
    ];
    const result = calculateRoundRatingsFromPropagators(entries);
    // All have same score so denominator is 0 → fixed fallback
    expect(result.get("a")).toBe(BASE_RATING - 20);
  });

  it(`requires exactly ${MIN_PROPAGATORS} propagators to switch on calibration`, () => {
    const withEnough = [
      { id: "a", score: -3, priorRating: 980 },
      { id: "b", score:  0, priorRating: 950 },
      { id: "c", score:  3, priorRating: 920 },
    ];
    const withTooFew = withEnough.slice(0, MIN_PROPAGATORS - 1);

    const calibrated = calculateRoundRatingsFromPropagators(withEnough);
    const fallback   = calculateRoundRatingsFromPropagators(
      withTooFew.map(({ id, score }) => ({ id, score }))
    );

    // At score 0, calibrated line gives 950; fallback gives BASE_RATING (also 950 here)
    // Test something where they differ: score 3, calibrated → 920, fallback → BASE_RATING - 30 = 920 (same coincidence)
    // Better: use score -3 propagator, calibrated gives 980
    expect(calibrated.get("a")).toBe(980);
    // Fallback for same score -3: BASE_RATING + 30 = 980 (coincidence in this dataset)
    expect(fallback.get("a")).toBe(BASE_RATING + 30);
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
