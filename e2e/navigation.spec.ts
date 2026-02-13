import { test, expect } from "@playwright/test";

test.describe("Site Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("loads homepage with header", async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Zach Lagden/i);

    // Check header is visible
    const header = page.locator("header");
    await expect(header).toBeVisible();
  });

  test("navigates to About section", async ({ page }) => {
    await page.getByRole("link", { name: /about/i }).first().click();

    // Wait for scroll and check section is in view
    const aboutSection = page.locator("#about");
    await expect(aboutSection).toBeInViewport({ timeout: 5000 });
  });

  test("navigates to Experience section", async ({ page }) => {
    await page
      .getByRole("link", { name: /experience/i })
      .first()
      .click();

    const experienceSection = page.locator("#experience");
    await expect(experienceSection).toBeInViewport({ timeout: 5000 });
  });

  test("navigates to Skills section", async ({ page }) => {
    await page
      .getByRole("link", { name: /skills/i })
      .first()
      .click();

    const skillsSection = page.locator("#skills");
    await expect(skillsSection).toBeInViewport({ timeout: 5000 });
  });

  test("navigates to Contact section", async ({ page }) => {
    await page
      .getByRole("link", { name: /contact/i })
      .first()
      .click();

    const contactSection = page.locator("#contact");
    await expect(contactSection).toBeInViewport({ timeout: 5000 });
  });
});

test.describe("Mobile Navigation", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("mobile menu opens and shows navigation links", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Find and click mobile menu button
    const menuButton = page.getByRole("button", { name: /menu|toggle/i });
    await menuButton.click();

    // Check navigation links are visible
    await expect(page.getByRole("link", { name: /about/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /experience/i })).toBeVisible();
  });
});
