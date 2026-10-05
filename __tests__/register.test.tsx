import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import TenantRegisterPage from "@/app/register/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/register",
}));

describe("TenantRegisterPage", () => {
  it("renders organization registration fields", () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TenantRegisterPage />
        </AuthProvider>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/ORGANIZATION ADMIN SIGNUP/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Acme Corporation Ltd/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/admin@acme.com/i)).toBeInTheDocument();
  });
});
