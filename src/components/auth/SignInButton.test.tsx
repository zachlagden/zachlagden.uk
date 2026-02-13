import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test-utils";
import userEvent from "@testing-library/user-event";
import { SignInButton } from "./SignInButton";

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));

describe("SignInButton", () => {
  it("renders sign in button", () => {
    render(<SignInButton />);
    expect(
      screen.getByRole("button", { name: /sign in with github/i }),
    ).toBeInTheDocument();
  });

  it("has glass effect styling", () => {
    render(<SignInButton />);
    const button = screen.getByRole("button", { name: /sign in with github/i });
    expect(button).toHaveClass("backdrop-blur-md");
  });

  it("calls signIn with github provider when clicked", async () => {
    const { signIn } = await import("next-auth/react");
    const user = userEvent.setup();

    render(<SignInButton />);
    const button = screen.getByRole("button", { name: /sign in with github/i });
    await user.click(button);

    expect(signIn).toHaveBeenCalledWith(
      "github",
      expect.objectContaining({
        callbackUrl: expect.any(String),
      }),
    );
  });

  it("includes GitHub icon", () => {
    render(<SignInButton />);
    // SVG should be present (GitHub logo)
    const button = screen.getByRole("button", { name: /sign in with github/i });
    expect(button.querySelector("svg")).toBeInTheDocument();
  });
});
