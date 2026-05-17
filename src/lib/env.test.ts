import { describe, expect, it } from "vitest";
import { isDemoModeAllowed } from "./env";

describe("environment helpers", () => {
  it("allows demo data by default outside production", () => {
    expect(isDemoModeAllowed({ NODE_ENV: "development" })).toBe(true);
    expect(isDemoModeAllowed({ NODE_ENV: "test" })).toBe(true);
  });

  it("requires explicit opt-in for demo data in production", () => {
    expect(isDemoModeAllowed({ NODE_ENV: "production" })).toBe(false);
    expect(isDemoModeAllowed({ NODE_ENV: "production", HURVEST_DEMO_MODE: "true" })).toBe(true);
    expect(isDemoModeAllowed({ NODE_ENV: "production", HURVEST_DEMO_MODE: "false" })).toBe(false);
  });
});
