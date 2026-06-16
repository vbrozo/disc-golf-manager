import { describe, expect, it } from "vitest";
import { applyTraining, getTrainingProgram, rollTrainingBoost } from "@/game";
import { makePlayer } from "./helpers";

const player = makePlayer({ fitness: 99 });

describe("training", () => {
  it("maps Fitness to the fitness attribute", () => {
    expect(getTrainingProgram("Fitness")?.stat).toBe("fitness");
  });

  it("rolls a boost in the +1..+5 range", () => {
    expect(rollTrainingBoost(() => 0)).toBe(1);
    expect(rollTrainingBoost(() => 0.99)).toBe(5);
  });

  it("applies a deterministic boost without mutating the input", () => {
    const out = applyTraining(player, "Power", { rng: () => 0.99 });
    expect(out?.result.boost).toBe(5);
    expect(out?.player.power).toBe(55);
    expect(player.power).toBe(50); // original untouched
  });

  it("caps the trained attribute at 100", () => {
    const out = applyTraining(player, "Fitness", { rng: () => 0.99 });
    expect(out?.result.newValue).toBe(100); // 99 + 5 capped
    expect(out?.result.boost).toBe(1);
  });
});
