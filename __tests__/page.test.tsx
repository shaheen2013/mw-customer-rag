import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthProvider } from "@/context/AuthContext";
import Home from "@/app/page";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("Home page", () => {
  it("shows the loading state and redirects based on the user role", () => {
    render(
      <AuthProvider>
        <Home />
      </AuthProvider>,
    );

    expect(
      screen.getByText(/Loading Mediusware AI Platform/i),
    ).toBeInTheDocument();

    const pushedTo = push.mock.calls.map(([to]) => to);
    expect(pushedTo).toEqual(
      expect.arrayContaining([
        expect.toSatisfy((to: string) => ["/login", "/admin", "/portal"].includes(to)),
      ]),
    );
  });
});
