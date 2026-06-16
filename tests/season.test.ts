import { describe, expect, it } from "vitest";
import {
  advanceRound,
  createStarterRoster,
  INITIAL_SEASON_STATE,
  isSeasonComplete,
  recordRoundResult,
  startSeason,
  summariseSeason,
} from "@/game";

const roundResult = {
  tournamentId: "t1",
  tournamentName: "Open",
  placement: 1,
  earnings: 1000,
  reputationGained: 5,
};

describe("season loop state machine", () => {
  it("starts season 1 in the select phase", () => {
    const s = startSeason(INITIAL_SEASON_STATE);
    expect(s.season).toBe(1);
    expect(s.round).toBe(1);
    expect(s.phase).toBe("select");
  });

  it("records a result only from the select phase, moving to training", () => {
    const s = startSeason(INITIAL_SEASON_STATE);
    const after = recordRoundResult(s, roundResult);
    expect(after.phase).toBe("training");
    expect(after.results).toHaveLength(1);
    // No-op when not in select.
    expect(recordRoundResult(after, roundResult)).toBe(after);
  });

  it("advances through rounds and completes the season", () => {
    let s = startSeason(INITIAL_SEASON_STATE, 2);
    s = recordRoundResult(s, roundResult);
    s = advanceRound(s); // round 2, select
    expect(s.round).toBe(2);
    expect(s.phase).toBe("select");
    s = recordRoundResult(s, roundResult);
    s = advanceRound(s); // last round done -> complete
    expect(isSeasonComplete(s)).toBe(true);
  });

  it("keeps the season counter when starting the next season", () => {
    const first = startSeason(INITIAL_SEASON_STATE);
    const second = startSeason(first);
    expect(second.season).toBe(2);
    expect(second.results).toHaveLength(0);
  });
});

describe("season summary", () => {
  it("aggregates earnings, wins and best placement", () => {
    let s = startSeason(INITIAL_SEASON_STATE, 2);
    s = recordRoundResult(s, { ...roundResult, placement: 1, earnings: 1000 });
    s = advanceRound(s);
    s = recordRoundResult(s, { ...roundResult, placement: 3, earnings: 500 });
    const summary = summariseSeason(s);
    expect(summary.roundsPlayed).toBe(2);
    expect(summary.totalEarnings).toBe(1500);
    expect(summary.wins).toBe(1);
    expect(summary.bestPlacement).toBe(1);
  });
});

describe("starter roster", () => {
  it("creates three players with no discs equipped", () => {
    const roster = createStarterRoster();
    expect(roster).toHaveLength(3);
    roster.forEach((p) => expect(p.equipped).toBeUndefined());
  });
});
