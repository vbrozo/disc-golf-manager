import { describe, expect, it } from "vitest";
import { t } from "@/i18n";

describe("i18n", () => {
  it("returns the translation for the active language", () => {
    expect(t("en", "newgame.button")).toBe("New Game");
    expect(t("hr", "newgame.button")).toBe("Nova igra");
  });

  it("interpolates {placeholder} params", () => {
    expect(t("en", "shop.bought", { name: "Tour Driver" })).toBe(
      "Bought Tour Driver."
    );
    expect(t("hr", "shop.bought", { name: "Tour Driver" })).toBe(
      "Kupljeno: Tour Driver."
    );
  });

  it("falls back to the raw key when a translation is missing", () => {
    expect(t("en", "does.not.exist")).toBe("does.not.exist");
  });
});
