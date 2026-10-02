import { describe, it, expect, vi, beforeEach } from "vitest";

const { query } = vi.hoisted(() => ({ query: vi.fn() }));

vi.mock("@/lib/db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/db")>();
  return { ...actual, query };
});

import { GET, POST } from "@/app/api/tenants/route";
import { mockDatabase } from "@/lib/db";

describe("GET /api/tenants", () => {
  beforeEach(() => {
    query.mockReset();
  });

  it("returns MySQL rows when the database has data", async () => {
    const rows = [{ id: 7, name: "MySQL Corp", plan: "Growth" }];
    query.mockResolvedValueOnce(rows);

    const response = await GET();
    const body = await response.json();

    expect(body.success).toBe(true);
    expect(body.source).toBe("mysql");
    expect(body.data).toEqual(rows);
  });

  it("falls back to mock data when MySQL is unavailable", async () => {
    query.mockResolvedValueOnce(null);

    const response = await GET();
    const body = await response.json();

    expect(body.success).toBe(true);
    expect(body.source).toBe("mock");
    expect(body.data).toEqual(mockDatabase.tenants);
  });
});

describe("POST /api/tenants", () => {
  beforeEach(() => {
    query.mockReset();
  });

  it("inserts a tenant with the given name and plan", async () => {
    const insertResult = { insertId: 9 };
    query.mockResolvedValueOnce(insertResult);

    const request = new Request("http://localhost/api/tenants", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Test Corp", plan: "Business" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.inserted).toEqual(insertResult);
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO tenants"),
      ["Test Corp", "Business", "Active", "0 / 5K", "0.1 GB", 1, "$79.00", "Just now"],
    );
  });

  it("returns 500 when the insert throws", async () => {
    query.mockRejectedValueOnce(new Error("db down"));

    const request = new Request("http://localhost/api/tenants", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Broken Corp" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
  });
});
