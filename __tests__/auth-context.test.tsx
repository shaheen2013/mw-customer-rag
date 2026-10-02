import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/context/AuthContext";

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to Super Admin when nothing is stored", () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    expect(result.current.user).toEqual(
      expect.objectContaining({
        role: "super_admin",
        email: "admin@mediusware.ai",
      }),
    );
  });

  it("login() stores the user and persists it to localStorage", () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    act(() => {
      result.current.login("acme@mediusware.ai", "tenant_admin", "TechFlow Inc");
    });

    expect(result.current.user).toEqual(
      expect.objectContaining({
        email: "acme@mediusware.ai",
        role: "tenant_admin",
        tenantName: "TechFlow Inc",
        name: "TechFlow Inc Admin",
      }),
    );
    expect(result.current.activeTenant).toBe("TechFlow Inc");

    const stored = JSON.parse(localStorage.getItem("mw_user") ?? "null");
    expect(stored).toEqual(
      expect.objectContaining({ email: "acme@mediusware.ai", role: "tenant_admin" }),
    );
  });

  it("login() names Super Admin correctly regardless of tenant", () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    act(() => {
      result.current.login("admin@mediusware.ai", "super_admin", "Whatever Inc");
    });

    expect(result.current.user?.name).toBe("Super Admin");
  });

  it("logout() clears the user and localStorage", () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem("mw_user")).toBeNull();
  });

  it("restores the user from localStorage on init", () => {
    localStorage.setItem(
      "mw_user",
      JSON.stringify({
        id: "42",
        email: "restored@mediusware.ai",
        name: "Restored User",
        role: "tenant_admin",
      }),
    );

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    expect(result.current.user).toEqual(
      expect.objectContaining({ email: "restored@mediusware.ai" }),
    );
  });
});
