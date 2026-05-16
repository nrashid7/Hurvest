import { describe, expect, it } from "vitest";
import {
  asOrderStatus,
  asFarmCategory,
  asFrequency,
  asSubscriptionStatus,
  asUserRole,
  isSlug,
  isUuid,
  parseBoxItems,
  sanitizeNextPath,
  serializeBoxItems,
} from "./forms";

describe("form helpers", () => {
  it("keeps post-login redirects on relative app paths", () => {
    expect(sanitizeNextPath("/account")).toBe("/account");
    expect(sanitizeNextPath("/boxes/friday-produce-box?checkout=1")).toBe("/boxes/friday-produce-box?checkout=1");
    expect(sanitizeNextPath("https://evil.example")).toBe("/account");
    expect(sanitizeNextPath("//evil.example")).toBe("/account");
    expect(sanitizeNextPath("/\\evil")).toBe("/account");
  });

  it("validates route identifiers before PostgREST filters", () => {
    expect(isUuid("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa")).toBe(true);
    expect(isSlug("friday-produce-box")).toBe(true);
    expect(isSlug("bad,slug")).toBe(false);
  });

  it("parses weekly box item lines with quantities", () => {
    expect(parseBoxItems("1 bunch | Radishes\n2 lb Carrots\nPasture eggs")).toEqual([
      { name: "Radishes", quantity: "1 bunch", sort_order: 1 },
      { name: "Carrots", quantity: "2 lb", sort_order: 2 },
      { name: "Pasture eggs", quantity: null, sort_order: 3 },
    ]);
  });

  it("serializes box items back into editable rows", () => {
    expect(serializeBoxItems([{ name: "Radishes", quantity: "1 bunch" }, { name: "Herbs", quantity: null }])).toBe("1 bunch | Radishes\nHerbs");
  });

  it("rejects unknown roles and statuses", () => {
    expect(asUserRole("farmer")).toBe("farmer");
    expect(asUserRole("owner")).toBeNull();
    expect(asOrderStatus("packed")).toBe("packed");
    expect(asOrderStatus("lost")).toBeNull();
    expect(asSubscriptionStatus("paused")).toBe("paused");
    expect(asSubscriptionStatus("refunded")).toBeNull();
    expect(asFarmCategory("produce")).toBe("produce");
    expect(asFarmCategory("flowers")).toBeNull();
    expect(asFrequency("weekly")).toBe("weekly");
    expect(asFrequency("daily")).toBeNull();
  });
});
