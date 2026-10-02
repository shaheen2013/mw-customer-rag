import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/Header";

describe("Header tenant selector", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the title and the active tenant", () => {
    render(
      <AuthProvider>
        <Header title="Tenants" subtitle="Manage tenants" />
      </AuthProvider>,
    );

    expect(screen.getByText("Tenants")).toBeInTheDocument();
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
  });

  it("switches the active tenant from the dropdown", () => {
    render(
      <AuthProvider>
        <Header title="Tenants" />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByText("Acme Corp"));

    const dropdown = screen.getByText("Switch Tenant").parentElement!;
    fireEvent.click(within(dropdown).getByText("TechFlow Inc"));

    expect(screen.getByText("TechFlow Inc")).toBeInTheDocument();
  });
});
