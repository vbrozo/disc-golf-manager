import { describe, expect, it } from "vitest";
import { applyTraining, getTrainingProgram, rollTrainingBoost } from "@/game";
import type { Player } from "@/types";

const player: Player = {
  id: "p1",
  name: "P",
  stats: { Driving: 50, Accuracy: 50, Putting: 50, Mental: 50, Stamina: 99 },
};

describe("training", () => {
  it("maps Fitness to the Stamina stat", () => {
    expect(getTrainingProgram("Fitness")?.stat).toBe("Stamina");
  });

  it("rolls a boost in the +1..+5 range", () => {
    expect(rollTrainingBoost(() => 0)).toBe(1);
    expect(rollTrainingBoost(() => 0.99)).toBe(5);
  });

  it("applies a deterministic boost without mutating the input", () => {
    const out = applyTraining(player, "Driving", { rng: () => 0.99 });
    expect(out?.result.boost).toBe(5);
    expect(out?.player.stats.Driving).toBe(55);
    expect(player.stats.Driving).toBe(50); // original untouched
  });

  it("caps the trained stat at 100", () => {
    const out = applyTraining(player, "Fitness", { rng: () => 0.99 });
    expect(out?.result.newValue).toBe(100); // 99 + 5 capped
    expect(out?.result.boost).toBe(1);
  });
});
