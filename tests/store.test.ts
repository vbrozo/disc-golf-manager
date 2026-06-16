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

describe("enterTournament", () => {
  beforeEach(() => {
    useGameStore.setState({
      club: { name: "Test Club", money: 100000, reputation: 1000 },
      players: [
        {
          id: "p1",
          name: "Ivan",
          stats: { Driving: 60, Accuracy: 60, Putting: 60, Mental: 60, Stamina: 60 },
        },
        {
          id: "p2",
          name: "Marko",
          stats: { Driving: 55, Accuracy: 55, Putting: 55, Mental: 55, Stamina: 55 },
        },
      ],
      tournaments: [],
      lastTournament: null,
    });
  });

  it("fills the field with AI opponents and ranks the whole field", () => {
    const tournamentId = "local-open"; // first catalogue tournament (rep 0)
    const outcome = useGameStore.getState().enterTournament(tournamentId);
    expect(outcome).not.toBeNull();

    const summary = useGameStore.getState().lastTournament!;
    // 2 club players + opponents (default field of 8) → 8 ranked rows.
    expect(summary.rows).toHaveLength(8);
    // Exactly the two club players are flagged as ours.
    expect(summary.rows.filter((r) => r.isClubPlayer)).toHaveLength(2);
    // Placements are 1..8 with no gaps.
    const placements = summary.rows.map((r) => r.placement).sort((a, b) => a - b);
    expect(placements).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("banks the sum of the club players' earnings", () => {
    const tournamentId = "local-open";
    const outcome = useGameStore.getState().enterTournament(tournamentId)!;
    const summary = useGameStore.getState().lastTournament!;
    const clubEarnings = summary.rows
      .filter((r) => r.isClubPlayer)
      .reduce((sum, r) => sum + r.earnings, 0);
    expect(outcome.settlement.earnings).toBe(clubEarnings);
  });
});
