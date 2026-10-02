// @vitest-environment node
import { describe, it, expect } from "vitest";

import { query, mockDatabase } from "@/lib/db";

describe("query()", () => {
  it("returns null when the MySQL query fails (fallback path)", async () => {
    const result = await query("SELECT * FROM tenants");

    expect(result).toBeNull();
  });
});

describe("mockDatabase fallback data", () => {
  it("has tenants with the fields the admin UI expects", () => {
    expect(mockDatabase.tenants.length).toBeGreaterThan(0);
    for (const tenant of mockDatabase.tenants) {
      expect(tenant).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
          plan: expect.any(String),
          status: expect.any(String),
        }),
      );
    }
  });

  it("has conversations with gap detection fields", () => {
    expect(mockDatabase.conversations.length).toBeGreaterThan(0);
    for (const conversation of mockDatabase.conversations) {
      expect(conversation).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          status: expect.any(String),
          confidence: expect.any(String),
          gapDetected: expect.any(Boolean),
        }),
      );
    }
  });
});
