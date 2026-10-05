import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthProvider } from "@/context/AuthContext";
import LandingPage from "@/app/page";
import DashboardPage from "@/app/(dashboard)/dashboard/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/",
}));

describe("Landing Page", () => {
  it("renders the landing page hero and core value proposition", () => {
    render(
      <AuthProvider>
        <LandingPage />
      </AuthProvider>,
    );

    expect(
      screen.getByText(/Grounded in Your Knowledge/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Create Organization Workspace/i),
    ).toBeInTheDocument();
  });
});

describe("Tenant Dashboard Page", () => {
  it("renders tenant workspace dashboard metrics and title", () => {
    render(
      <AuthProvider>
        <DashboardPage />
      </AuthProvider>,
    );

    expect(
      screen.getByText(/Tenant Dashboard/i),
    ).toBeInTheDocument();
  });
});
