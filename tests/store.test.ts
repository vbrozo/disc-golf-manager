import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "@/store/gameStore";
import { DISCS, getDiscPrice } from "@/game";

const driver = DISCS.find((d) => d.type === "Driver" && d.rarity === "Common")!;

describe("buyDiscs", () => {
  beforeEach(() => {
    // Reset to a known club balance before each test.
    useGameStore.setState({
      club: { name: "Test Club", money: 1000, reputation: 0 },
      inventory: [],
    });
  });

  it("buys multiple copies in one purchase and charges the total", () => {
    const price = getDiscPrice(driver);
    const bought = useGameStore.getState().buyDiscs(driver.id, 3);

    expect(bought).toHaveLength(3);
    expect(useGameStore.getState().inventory).toHaveLength(3);
    expect(useGameStore.getState().club.money).toBe(1000 - price * 3);
  });

  it("gives each purchased copy a unique inventory id", () => {
    useGameStore.getState().buyDiscs(driver.id, 3);
    const ids = useGameStore.getState().inventory.map((d) => d.id);
    expect(new Set(ids).size).toBe(3);
  });

  it("rejects the whole purchase if the club can't afford it all", () => {
    useGameStore.setState({
      club: { name: "Test Club", money: getDiscPrice(driver), reputation: 0 },
      inventory: [],
    });
    const bought = useGameStore.getState().buyDiscs(driver.id, 2);

    expect(bought).toBeNull();
    expect(useGameStore.getState().inventory).toHaveLength(0);
    expect(useGameStore.getState().club.money).toBe(getDiscPrice(driver));
  });

  it("rejects an unknown disc id or a non-positive quantity", () => {
    expect(useGameStore.getState().buyDiscs("unknown-disc", 2)).toBeNull();
    expect(useGameStore.getState().buyDiscs(driver.id, 0)).toBeNull();
  });
});
