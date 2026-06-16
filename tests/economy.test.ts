import { describe, expect, it } from "vitest";
import {
  buildSettlement,
  checkEntryEligibility,
  getEntryFee,
  meetsReputationRequirement,
  reputationToUnlock,
  settleClubEconomy,
} from "@/game";
import type { Club } from "@/models/Club";
import type { Tournament } from "@/models/Tournament";

const tournament: Tournament = {
  id: "t1",
  name: "Test Open",
  courseId: "course-city",
  rounds: 4,
  difficulty: 3,
  prizePool: 10000,
  reputationRequired: 50,
};

describe("entry fees", () => {
  it("scales the fee by prize pool and difficulty", () => {
    // 10000 * 5% * (1 + 2*0.1) = 600
    expect(getEntryFee(tournament)).toBe(600);
  });

  it("never returns a negative fee", () => {
    const free: Tournament = { ...tournament, prizePool: 0, difficulty: 1 };
    expect(getEntryFee(free)).toBe(0);
  });
});

describe("reputation gating", () => {
  it("respects the reputation requirement", () => {
    expect(meetsReputationRequirement(49, tournament)).toBe(false);
    expect(meetsReputationRequirement(50, tournament)).toBe(true);
  });

  it("reports how much reputation is still needed", () => {
    expect(reputationToUnlock(20, tournament)).toBe(30);
    expect(reputationToUnlock(80, tournament)).toBe(0);
  });
});

describe("entry eligibility", () => {
  it("blocks locked tournaments before checking funds", () => {
    const club: Club = { id: "c1", name: "C", money: 0, reputation: 0 };
    expect(checkEntryEligibility(club, tournament)).toMatchObject({
      canEnter: false,
      reason: "locked",
    });
  });

  it("blocks when funds are short despite enough reputation", () => {
    const club: Club = { id: "c1", name: "C", money: 100, reputation: 100 };
    expect(checkEntryEligibility(club, tournament)).toMatchObject({
      canEnter: false,
      reason: "insufficient-funds",
    });
  });

  it("allows entry when both gates are cleared", () => {
    const club: Club = { id: "c1", name: "C", money: 5000, reputation: 100 };
    expect(checkEntryEligibility(club, tournament).canEnter).toBe(true);
  });
});

describe("settlement", () => {
  it("computes net money as earnings minus the entry fee", () => {
    const s = buildSettlement(tournament, 2000, 10);
    expect(s.entryFee).toBe(600);
    expect(s.netMoney).toBe(1400);
  });

  it("floors a club's money at zero when settling a loss", () => {
    const club: Club = { id: "c1", name: "C", money: 100, reputation: 5 };
    const s = buildSettlement(tournament, 0, 2); // netMoney = -600
    const after = settleClubEconomy(club, s);
    expect(after.money).toBe(0);
    expect(after.reputation).toBe(7);
  });
});
