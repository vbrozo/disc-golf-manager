import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "@/store/gameStore";
import { DISCS, getDiscPrice } from "@/game";
import { makePlayer } from "./helpers";

const driver = DISCS.find((d) => d.type === "Driver" && d.rarity === "Common")!;

describe("buyDiscs", () => {
  beforeEach(() => {
    // Reset to a known club balance before each test.
    useGameStore.setState({
      club: { id: "c1", name: "Test Club", money: 1000, reputation: 0 },
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
      club: { id: "c1", name: "Test Club", money: getDiscPrice(driver), reputation: 0 },
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
      club: { id: "c1", name: "Test Club", money: 100000, reputation: 1000 },
      players: [
        makePlayer({
          id: "p1",
          firstName: "Ivan",
          lastName: "Horvat",
          power: 60,
          accuracy: 60,
          putting: 60,
          scramble: 60,
          consistency: 60,
          mental: 60,
          fitness: 60,
        }),
        makePlayer({
          id: "p2",
          firstName: "Marko",
          lastName: "Kovačević",
          power: 55,
          accuracy: 55,
          putting: 55,
          scramble: 55,
          consistency: 55,
          mental: 55,
          fitness: 55,
        }),
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

  it("gives each club player a rating after the tournament", () => {
    // "local-open" has 3 rounds, so each tournament adds 3 per-round entries.
    useGameStore.getState().enterTournament("local-open");
    const players = useGameStore.getState().players;
    players.forEach((p) => {
      expect(p.ratingHistory).toHaveLength(3);
      expect(typeof p.rating).toBe("number");
    });
    // A second tournament adds 3 more entries (6 total, well within the 8-round window).
    useGameStore.getState().enterTournament("local-open");
    expect(useGameStore.getState().players[0].ratingHistory).toHaveLength(6);
  });
});
