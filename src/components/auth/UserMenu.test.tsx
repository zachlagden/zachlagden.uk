import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/test-utils";
import userEvent from "@testing-library/user-event";
import { UserMenu } from "./UserMenu";

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
  signOut: vi.fn(),
}));

describe("UserMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when no session", async () => {
    const { useSession } = await import("next-auth/react");
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: "unauthenticated",
      update: vi.fn(),
    });

    render(<UserMenu />);
    // Should not render the user menu button or dropdown
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("shows user avatar and name when authenticated", async () => {
    const { useSession } = await import("next-auth/react");
    vi.mocked(useSession).mockReturnValue({
      data: {
        user: {
          id: "123",
          name: "Test User",
          email: "test@example.com",
          image: "https://example.com/avatar.png",
          role: "user",
        },
        expires: "2030-01-01",
      },
      status: "authenticated",
      update: vi.fn(),
    });

    render(<UserMenu />);
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /test user/i })).toBeInTheDocument();
  });

  it("shows admin badge for admin users", async () => {
    const { useSession } = await import("next-auth/react");
    vi.mocked(useSession).mockReturnValue({
      data: {
        user: {
          id: "123",
          name: "Admin User",
          email: "admin@example.com",
          image: "https://example.com/avatar.png",
          role: "admin",
        },
        expires: "2030-01-01",
      },
      status: "authenticated",
      update: vi.fn(),
    });

    render(<UserMenu />);
    // Admin badge with "A" text
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("opens dropdown on click", async () => {
    const { useSession } = await import("next-auth/react");
    vi.mocked(useSession).mockReturnValue({
      data: {
        user: {
          id: "123",
          name: "Test User",
          email: "test@example.com",
          image: "https://example.com/avatar.png",
          role: "user",
        },
        expires: "2030-01-01",
      },
      status: "authenticated",
      update: vi.fn(),
    });

    const user = userEvent.setup();
    render(<UserMenu />);

    const trigger = screen.getByRole("button");
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Sign out")).toBeInTheDocument();
      expect(screen.getByText("Sign out everywhere")).toBeInTheDocument();
    });
  });

  it("calls signOut when sign out clicked", async () => {
    const { useSession, signOut } = await import("next-auth/react");
    vi.mocked(useSession).mockReturnValue({
      data: {
        user: {
          id: "123",
          name: "Test User",
          email: "test@example.com",
          image: "https://example.com/avatar.png",
          role: "user",
        },
        expires: "2030-01-01",
      },
      status: "authenticated",
      update: vi.fn(),
    });

    const user = userEvent.setup();
    render(<UserMenu />);

    // Open dropdown
    await user.click(screen.getByRole("button"));

    // Click sign out
    await waitFor(async () => {
      const signOutButton = screen.getByText("Sign out");
      await user.click(signOutButton);
    });

    expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/" });
  });
});
