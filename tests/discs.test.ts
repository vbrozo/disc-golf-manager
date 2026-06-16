import { describe, expect, it } from "vitest";
import {
  applyDiscBonuses,
  createDisc,
  effectivePlayer,
  equipDisc,
  getDiscPrice,
  unequipDisc,
} from "@/game";
import { makePlayer } from "./helpers";

describe("disc pricing", () => {
  it("scales price with the disc's bonus", () => {
    const common = createDisc("d1", "Common Driver", "Driver", "Common");
    const sig = createDisc("d2", "Signature Driver", "Driver", "Signature");
    expect(getDiscPrice(common)).toBe(100); // bonus 2 * 50
    expect(getDiscPrice(sig)).toBe(450); // bonus 9 * 50
  });
});

describe("equip rules", () => {
  it("allows one disc per type, replacing the slot", () => {
    const first = createDisc("d1", "Driver A", "Driver", "Common");
    const second = createDisc("d2", "Driver B", "Driver", "Pro");
    const loadout = equipDisc(equipDisc({}, first), second);
    expect(loadout.Driver?.id).toBe("d2");
  });

  it("unequip clears the slot without mutating the input", () => {
    const disc = createDisc("d1", "Putter", "Putter", "Rare");
    const equipped = equipDisc({}, disc);
    const cleared = unequipDisc(equipped, "Putter");
    expect(cleared.Putter).toBeUndefined();
    expect(equipped.Putter?.id).toBe("d1"); // original untouched
  });
});

describe("bonus application", () => {
  it("caps boosted stats at 100", () => {
    const player = makePlayer({ putting: 98 });
    const putter = createDisc("d1", "Putter", "Putter", "Signature"); // +9
    const boosted = applyDiscBonuses(player, { Putter: putter });
    expect(boosted.putting).toBe(100); // 98 + 9 capped
  });

  it("effectivePlayer returns the same player when nothing is equipped", () => {
    const player = makePlayer();
    expect(effectivePlayer(player)).toEqual(player);
  });
});
