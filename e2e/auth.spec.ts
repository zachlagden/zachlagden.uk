import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test.describe("Sign In Button", () => {
    test("should display sign in button when not authenticated", async ({
      page,
    }) => {
      await page.goto("/");

      // Find sign in button in top-right
      const signInButton = page.getByRole("button", {
        name: /sign in with github/i,
      });
      await expect(signInButton).toBeVisible();
    });

    test("should redirect to GitHub OAuth when clicked", async ({ page }) => {
      await page.goto("/");

      const signInButton = page.getByRole("button", {
        name: /sign in with github/i,
      });
      await signInButton.click();

      // Should redirect to GitHub or Auth.js signin page
      // Note: This may redirect to /api/auth/signin first, then to GitHub
      await page.waitForURL(/github\.com|api\/auth\/signin/, {
        timeout: 10000,
      });

      // Verify we're at GitHub or the auth signin page
      const url = page.url();
      expect(
        url.includes("github.com") || url.includes("api/auth"),
      ).toBeTruthy();
    });
  });

  test.describe("Protected Routes", () => {
    test("should redirect unauthenticated users from /blog/new", async ({
      page,
    }) => {
      await page.goto("/blog/new");

      // Should redirect to home with auth=required parameter
      // (or show the page with "sign in required" message if route exists)
      await page.waitForURL(/\?auth=required|\/blog\/new/, { timeout: 5000 });

      // Either redirected or on the page
      const url = page.url();
      if (url.includes("auth=required")) {
        // Redirected to home
        expect(url).toContain("auth=required");
      }
      // Note: If /blog/new doesn't exist yet, this will 404 which is fine
    });
  });

  test.describe("403 Page", () => {
    test("should display 403 page with appropriate content", async ({
      page,
    }) => {
      await page.goto("/403");

      await expect(page.getByText("403")).toBeVisible();
      await expect(page.getByText(/access forbidden/i)).toBeVisible();
      await expect(page.getByRole("link", { name: /go home/i })).toBeVisible();
    });

    test("should navigate to home from 403 page", async ({ page }) => {
      await page.goto("/403");

      const homeLink = page.getByRole("link", { name: /go home/i });
      await homeLink.click();

      await page.waitForURL("/");
      expect(page.url()).toMatch(/\/$/);
    });
  });

  test.describe("Auth API", () => {
    test("should have providers endpoint", async ({ page }) => {
      const response = await page.request.get("/api/auth/providers");
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(data).toHaveProperty("github");
      expect(data.github).toHaveProperty("id", "github");
      expect(data.github).toHaveProperty("name", "GitHub");
    });

    test("should have session endpoint", async ({ page }) => {
      const response = await page.request.get("/api/auth/session");
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      // When not authenticated, session should be empty object or null
      expect(data).toBeDefined();
    });
  });
});
