import type { Player } from "@/models/Player";

/** Build a fully-specified v2 test player, overriding only what a test cares about. */
export function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: "p1",
    firstName: "Test",
    lastName: "Player",
    age: 25,
    nationality: "Croatia",
    overall: 50,
    power: 50,
    accuracy: 50,
    putting: 50,
    scramble: 50,
    consistency: 50,
    mental: 50,
    fitness: 50,
    morale: 50,
    potential: 60,
    salary: 500,
    form: 50,
    popularity: 0,
    preferredShotShape: "Straight",
    injuries: [],
    ...overrides,
  };
}
