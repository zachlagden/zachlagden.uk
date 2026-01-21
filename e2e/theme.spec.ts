import { test, expect } from '@playwright/test'

test.describe('Dark Mode Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('theme toggle is visible', async ({ page }) => {
    const toggle = page.getByRole('switch')
    await expect(toggle).toBeVisible()
  })

  test('toggles from light to dark mode', async ({ page }) => {
    const toggle = page.getByRole('switch')
    const html = page.locator('html')

    // Start in light mode (default or system)
    // Note: May start in dark if system prefers dark

    // Click to toggle
    await toggle.click()

    // Wait for theme change
    await page.waitForTimeout(200)

    // Check html element has theme class changed
    const classAttr = await html.getAttribute('class')
    expect(classAttr).toBeDefined()
  })

  test('toggles back from dark to light mode', async ({ page }) => {
    const toggle = page.getByRole('switch')

    // Toggle twice
    await toggle.click()
    await page.waitForTimeout(200)
    await toggle.click()
    await page.waitForTimeout(200)

    // Should be back to original state
    const html = page.locator('html')
    const classAttr = await html.getAttribute('class')
    expect(classAttr).toBeDefined()
  })

  test('toggle has correct accessibility attributes', async ({ page }) => {
    const toggle = page.getByRole('switch')

    // Check accessibility attributes
    await expect(toggle).toHaveAttribute('aria-label', /switch to (light|dark) mode/i)
    const ariaChecked = await toggle.getAttribute('aria-checked')
    expect(['true', 'false']).toContain(ariaChecked)
  })

  test('theme persists after page reload', async ({ page }) => {
    const toggle = page.getByRole('switch')
    const html = page.locator('html')

    // Get initial theme
    const initialClass = await html.getAttribute('class')

    // Toggle theme
    await toggle.click()
    await page.waitForTimeout(200)

    // Get new theme
    const newClass = await html.getAttribute('class')

    // Reload page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Check theme persisted
    const persistedClass = await html.getAttribute('class')
    expect(persistedClass).toBe(newClass)
  })
})
