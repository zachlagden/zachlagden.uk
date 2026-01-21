# Phase 2: Testing Infrastructure - Research

**Researched:** 2026-01-21
**Domain:** JavaScript/TypeScript testing with Vitest, React Testing Library, and Playwright for Next.js 15 + React 19
**Confidence:** HIGH

## Summary

Modern Next.js 15 testing requires three layers: **Vitest** for unit tests (utilities, pure functions), **React Testing Library** for component tests (user-facing behavior), and **Playwright** for E2E tests (critical user flows). This stack is officially recommended by Next.js and represents the current industry standard as of 2026.

The project uses React 19, Next.js 15 (App Router), TypeScript, Framer Motion, Lenis smooth scrolling, and next-themes for dark mode. Key testing considerations include:
- React 19 deprecates react-test-renderer, making RTL the only supported component testing approach
- Async Server Components cannot be tested with Vitest (E2E only)
- Framer Motion animations must be mocked to prevent slow, flaky tests
- Dark mode testing requires custom render wrappers with theme providers

**Primary recommendation:** Use Vitest + React Testing Library for synchronous components and utilities, Playwright for E2E flows. Mock animations and API calls to keep tests fast and deterministic.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vitest | ^3.x | Test runner for unit/component tests | Official Next.js recommendation, 10-20x faster than Jest, built on Vite (matches dev environment) |
| @testing-library/react | ^16.x | React component testing utilities | Only officially supported library for React 19 component testing (react-test-renderer deprecated) |
| @playwright/test | ^1.x | E2E browser testing framework | Official Next.js recommendation, auto-waits eliminate flaky tests, mature CI integration |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @testing-library/jest-dom | ^6.x | Custom matchers (toBeInTheDocument, etc.) | Every Vitest project using React Testing Library |
| @testing-library/user-event | ^14.x | Realistic user interaction simulation | All component interaction tests (clicks, typing, hover) |
| @vitejs/plugin-react | ^4.x | React JSX transformation in Vitest | Required for testing React components with Vitest |
| vite-tsconfig-paths | ^6.x | TypeScript path mapping (@/* imports) | TypeScript projects using path aliases |
| jsdom | ^25.x | Browser environment simulation | Required by Vitest for DOM-based tests |
| happy-dom | ^15.x | Alternative DOM implementation | Faster than jsdom, but less accurate (use for simple tests only) |
| msw | ^2.x | API mocking (intercepts fetch/axios) | Testing components that make API calls |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vitest | Jest | Jest is mature but 10-20x slower, requires more configuration for ESM/TypeScript, incompatible with Vite dev environment |
| Playwright | Cypress | Cypress has better DevEx but can't test multiple tabs, iframes, or cross-origin, and has slower execution |
| React Testing Library | Enzyme | Enzyme is deprecated and incompatible with React 19 |

**Installation:**
```bash
# Core testing dependencies
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitejs/plugin-react jsdom vite-tsconfig-paths

# E2E testing
pnpm add -D @playwright/test

# API mocking (optional, recommended)
pnpm add -D msw
```

## Architecture Patterns

### Recommended Project Structure
```
project-root/
├── src/
│   ├── components/          # Components with co-located tests
│   │   ├── Button.tsx
│   │   └── Button.test.tsx
│   ├── utils/              # Utilities with co-located tests
│   │   ├── contentLoader.ts
│   │   └── contentLoader.test.ts
│   └── test-utils/         # Shared testing utilities
│       ├── index.ts        # Re-exports RTL + custom render
│       ├── render.tsx      # Custom render with providers
│       ├── mocks.ts        # Mock data/fixtures
│       └── handlers.ts     # MSW request handlers
├── e2e/                    # Playwright E2E tests (separate folder)
│   ├── auth.spec.ts
│   ├── navigation.spec.ts
│   └── fixtures/           # E2E test fixtures
├── vitest.config.ts        # Vitest configuration
├── playwright.config.ts    # Playwright configuration
└── package.json
```

### Pattern 1: Custom Render with Providers

**What:** Wrap React Testing Library's `render` with app-wide providers (theme, smooth scroll, etc.)

**When to use:** Every component test that depends on context providers

**Example:**
```typescript
// src/test-utils/render.tsx
// Source: https://testing-library.com/docs/react-testing-library/setup/
import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { ThemeProvider } from 'next-themes'

interface AllProvidersProps {
  children: React.ReactNode
}

function AllProviders({ children }: AllProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      {children}
    </ThemeProvider>
  )
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options })
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
// Override render method
export { customRender as render }
```

### Pattern 2: Mocking Framer Motion

**What:** Replace Framer Motion components with instant-duration versions to prevent slow, flaky tests

**When to use:** Any test involving components with Framer Motion animations

**Example:**
```typescript
// vitest.config.ts setup file or test file
// Source: https://dev.to/pgarciacamou/mocking-framer-motion-v9-7jh
import { vi } from 'vitest'

vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (target, prop) => {
        // Return a component that renders children without animation
        return ({ children, ...props }: any) => {
          // Filter out motion-specific props
          const { initial, animate, exit, transition, variants, ...rest } = props
          return children
        }
      },
    }
  ),
  AnimatePresence: ({ children }: any) => children,
  MotionConfig: ({ children }: any) => children,
}))
```

### Pattern 3: Fail-Fast CI Workflow

**What:** Run unit tests first, only proceed to E2E if units pass

**When to use:** All CI workflows to save time and provide fast feedback

**Example:**
```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: pnpm install
      - run: pnpm test:unit

  e2e-tests:
    needs: unit-tests  # Only run if unit tests pass
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: pnpm install
      - run: npx playwright install --with-deps chromium
      - run: pnpm test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### Pattern 4: Testing Dark Mode Switching

**What:** Test theme toggle behavior by asserting on data-theme or class attributes

**When to use:** Testing components that depend on theme context

**Example:**
```typescript
// Source: https://oneuptime.com/blog/post/2026-01-15-unit-test-react-vitest-testing-library/view
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import ThemeToggle from '@/components/theme/theme-toggle'

describe('ThemeToggle', () => {
  it('toggles between light and dark themes', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)

    const toggle = screen.getByRole('button', { name: /toggle theme/i })

    // Initial state
    expect(document.documentElement).toHaveClass('light')

    // Click to toggle
    await user.click(toggle)
    expect(document.documentElement).toHaveClass('dark')

    // Click again to toggle back
    await user.click(toggle)
    expect(document.documentElement).toHaveClass('light')
  })
})
```

### Anti-Patterns to Avoid

- **Testing implementation details:** Don't test state variables or internal functions. Test user-visible behavior only.
- **Snapshot testing UI:** Snapshots are brittle and catch meaningless changes. Use semantic assertions instead.
- **Not awaiting async operations:** Leads to "Warning: An update to X inside a test was not wrapped in act(...)" - always use `await` with `waitFor`, `findBy*`, or `user.click()`.
- **Using `getBy*` for elements that might not exist:** Use `queryBy*` when asserting absence, use `findBy*` for async elements.
- **Over-mocking:** Only mock external dependencies (APIs, animations). Don't mock components under test or their children unless absolutely necessary.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| API mocking in tests | Custom fetch mocks, manual request interception | MSW (Mock Service Worker) | Handles both client/server, shared handlers between test/dev, intercepts at network level (no code changes) |
| User interactions (click, type) | Manually firing events with `fireEvent` | `@testing-library/user-event` | Simulates real user behavior (focus, hover, keyboard), fires multiple events per interaction, handles edge cases |
| Waiting for async updates | `setTimeout`, `act()` with promises | `waitFor()`, `findBy*` queries | Built-in retry logic, clear error messages, automatic act() wrapping |
| Custom DOM matchers | Manual `expect(el.classList.contains('active'))` | `@testing-library/jest-dom` | Readable assertions (`toBeInTheDocument`, `toHaveClass`), better error messages |
| Test fixtures/factories | Inline object literals in every test | Centralized fixture files in `test-utils/` | DRY, type-safe, easy to update when types change |

**Key insight:** Testing infrastructure has converged on established patterns. Custom solutions introduce maintenance burden and miss edge cases that libraries have solved (e.g., user-event handles disabled buttons, focus management, keyboard navigation automatically).

## Common Pitfalls

### Pitfall 1: Not Configuring jsdom Environment

**What goes wrong:** Tests fail with "document is not defined" or "window is not defined"

**Why it happens:** Vitest defaults to Node environment, which has no DOM

**How to avoid:** Set `environment: 'jsdom'` in `vitest.config.ts` under the `test` property

**Warning signs:**
- `ReferenceError: document is not defined`
- `TypeError: Cannot read property 'createElement' of undefined`

### Pitfall 2: Missing TypeScript Path Resolution

**What goes wrong:** Tests fail with "Cannot find module '@/components/...'" even though dev server works

**Why it happens:** Vitest doesn't automatically read `tsconfig.json` paths

**How to avoid:** Install `vite-tsconfig-paths` and add to Vitest config plugins array

**Warning signs:** Import errors for `@/*` paths specifically in tests

### Pitfall 3: Async Server Components in Vitest

**What goes wrong:** Tests hang or fail with "async components not supported"

**Why it happens:** Vitest doesn't support React 19's async Server Components

**How to avoid:** Only write unit tests for synchronous Server Components or Client Components. Use Playwright for async Server Components.

**Warning signs:** Component uses `async` keyword or top-level `await`

**Source:** [Next.js Testing: Vitest Documentation](https://nextjs.org/docs/app/guides/testing/vitest)

### Pitfall 4: Not Mocking Timers for Animations

**What goes wrong:** Tests hang indefinitely or timeout when components use `setTimeout`, `setInterval`, debounce, or throttle

**Why it happens:** Tests wait for real time to pass (e.g., 2 second animation delay)

**How to avoid:** Use `vi.useFakeTimers()` before test, `vi.advanceTimersByTime(ms)` to skip forward, `vi.useRealTimers()` after test

**Warning signs:**
- Test timeouts
- "Warning: An update to X inside a test was not wrapped in act(...)"

**Example:**
```typescript
describe('AnimatedComponent', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows element after delay', async () => {
    render(<AnimatedComponent />)
    expect(screen.queryByText('Content')).not.toBeInTheDocument()

    // Fast-forward 500ms
    await vi.advanceTimersByTimeAsync(500)

    expect(screen.getByText('Content')).toBeInTheDocument()
  })
})
```

### Pitfall 5: Playwright Tests Pass Locally, Fail in CI

**What goes wrong:** Tests pass on developer machine but fail in GitHub Actions

**Why it happens:** Race conditions, missing dependencies, or timing differences between environments

**How to avoid:**
- Use `await page.waitForLoadState('networkidle')` before assertions
- Install Playwright with `--with-deps` flag to ensure system dependencies
- Set explicit timeouts for flaky operations
- Use `baseURL` in config instead of hardcoding localhost URLs

**Warning signs:**
- "Target closed" errors
- "Timeout exceeded" in CI only
- Screenshot diffs show missing elements

**Source:** [Getting Started with Integrating Playwright and GitHub Actions](https://autify.com/blog/playwright-github-actions)

### Pitfall 6: Testing Smooth Scrolling (Lenis) Behavior

**What goes wrong:** Smooth scroll tests don't work because Lenis relies on animation frames

**Why it happens:** Test environments don't run requestAnimationFrame loops

**How to avoid:** Don't test smooth scroll behavior in unit/component tests. Test scroll triggers (clicking anchor links) in E2E with Playwright, which runs in real browser.

**Warning signs:** Scroll position doesn't change in tests despite calling scroll methods

**Alternative approach:** Mock the Lenis library to verify calls without testing actual animation

### Pitfall 7: Forgetting to Import jest-dom Matchers

**What goes wrong:** Tests fail with "expect(...).toBeInTheDocument is not a function"

**Why it happens:** Custom matchers from `@testing-library/jest-dom` aren't auto-loaded

**How to avoid:** Create `vitest.setup.ts` and import `@testing-library/jest-dom/vitest`, then reference in `vitest.config.ts` with `setupFiles: ['./vitest.setup.ts']`

**Warning signs:** Any jest-dom matcher (`toBeInTheDocument`, `toHaveClass`, etc.) throws "not a function" error

## Code Examples

Verified patterns from official sources:

### Vitest Configuration for Next.js 15

```typescript
// vitest.config.ts
// Source: https://nextjs.org/docs/app/guides/testing/vitest
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    tsconfigPaths(), // Must come first for path resolution
    react(),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: false, // Recommended: explicit imports instead of global describe/it
    css: true, // Process CSS imports (needed for component tests)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '.next/',
        'e2e/',
        '**/*.config.ts',
        '**/*.d.ts',
      ],
    },
  },
})
```

### Vitest Setup File

```typescript
// vitest.setup.ts
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Clean up after each test
afterEach(() => {
  cleanup()
})

// Mock Framer Motion globally
vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (target, prop) => {
      return ({ children, ...props }: any) => {
        const { initial, animate, exit, transition, variants, whileHover, whileTap, ...rest } = props
        return children
      }
    },
  }),
  AnimatePresence: ({ children }: any) => children,
  MotionConfig: ({ children }: any) => children,
  useMotionValue: () => ({ get: () => 0, set: vi.fn() }),
  useTransform: () => ({ get: () => 0 }),
  useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
}))

// Mock Lenis smooth scroll
vi.mock('lenis', () => ({
  default: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    off: vi.fn(),
    destroy: vi.fn(),
    scrollTo: vi.fn(),
  })),
}))
```

### Playwright Configuration

```typescript
// playwright.config.ts
// Source: https://playwright.dev/docs/test-configuration
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI, // Fail if test.only in CI
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list'], // Minimal output in terminal
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment if multi-browser testing needed
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
```

### Example Utility Function Test

```typescript
// src/utils/contentLoader.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { formatDate, formatDateRange } from './contentLoader'

describe('formatDate', () => {
  it('formats date string to "MMM YYYY" format', () => {
    expect(formatDate('2024-01-15')).toBe('Jan 2024')
    expect(formatDate('2024-12-31')).toBe('Dec 2024')
  })
})

describe('formatDateRange', () => {
  it('formats range with end date', () => {
    expect(formatDateRange('2024-01-01', '2024-12-31')).toBe('Jan 2024 - Dec 2024')
  })

  it('shows "Present" when end date is null', () => {
    expect(formatDateRange('2024-01-01', null)).toBe('Jan 2024 - Present')
  })

  it('shows "Present" when end date is undefined', () => {
    expect(formatDateRange('2024-01-01')).toBe('Jan 2024 - Present')
  })
})
```

### Example Component Test

```typescript
// src/components/theme/theme-toggle.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from './theme-toggle'

describe('ThemeToggle', () => {
  it('renders toggle button', () => {
    render(<ThemeToggle />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('toggles theme on click', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)

    const button = screen.getByRole('button')
    await user.click(button)

    // Assert theme changed (implementation depends on theme provider)
    // This is a placeholder - actual assertion depends on how theme is exposed
  })

  it('has accessible label', () => {
    render(<ThemeToggle />)
    expect(screen.getByRole('button', { name: /theme/i })).toBeInTheDocument()
  })
})
```

### Example E2E Test

```typescript
// e2e/navigation.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Site Navigation', () => {
  test('navigates to all main sections', async ({ page }) => {
    await page.goto('/')

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')

    // Test navigation to About section
    await page.getByRole('link', { name: /about/i }).click()
    await expect(page.locator('#about')).toBeInViewport()

    // Test navigation to Experience section
    await page.getByRole('link', { name: /experience/i }).click()
    await expect(page.locator('#experience')).toBeInViewport()

    // Test navigation to Skills section
    await page.getByRole('link', { name: /skills/i }).click()
    await expect(page.locator('#skills')).toBeInViewport()
  })

  test('mobile menu works', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Open mobile menu
    const menuButton = page.getByRole('button', { name: /menu/i })
    await menuButton.click()

    // Verify menu items visible
    await expect(page.getByRole('link', { name: /about/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /experience/i })).toBeVisible()
  })
})
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Jest | Vitest | 2022-2023 | 10-20x faster tests, native ESM support, Vite integration |
| Enzyme | React Testing Library | 2020 | Focus on user behavior vs implementation, React 19 compatibility |
| Cypress | Playwright | 2021-2022 | Multi-tab/iframe support, faster execution, better CI integration |
| react-test-renderer | React Testing Library | 2024 (React 19) | RTL is now the only officially supported component testing library |
| Manual fetch mocks | MSW | 2021-2024 | Network-level interception, shared dev/test handlers, more realistic |
| Global test utilities | Explicit imports | 2024 (Vitest best practice) | Better IDE support, clearer dependencies |

**Deprecated/outdated:**
- **Enzyme:** Incompatible with React 19, no longer maintained
- **react-test-renderer:** Deprecated in React 19 release notes
- **Jest + CRA:** Create React App deprecated, Jest slow with ESM/Vite projects
- **Karma/Mocha for React:** Replaced by modern frameworks with better DX
- **TestCafe:** Lost market share to Playwright's superior DevEx and performance

## Open Questions

Things that couldn't be fully resolved:

1. **Lenis Smooth Scroll Testing Strategy**
   - What we know: Lenis uses `requestAnimationFrame`, difficult to test in jsdom
   - What's unclear: Best practice for testing scroll-triggered animations
   - Recommendation: Mock Lenis in unit tests, test scroll behavior in E2E only

2. **Coverage Thresholds**
   - What we know: User decided no coverage enforcement, but exact reporting format undefined
   - What's unclear: Should HTML reports be generated on every run or only in CI?
   - Recommendation: HTML reports in CI only (add to `.gitignore`), terminal summary locally

3. **Test Data Management**
   - What we know: Project uses `public/content.json` for content
   - What's unclear: Should tests use real content.json or mock data?
   - Recommendation: Mock content in unit tests (fast, isolated), use real content in E2E (realistic)

## Sources

### Primary (HIGH confidence)

- [Next.js Testing: Vitest](https://nextjs.org/docs/app/guides/testing/vitest) - Official Next.js 15 testing guide
- [Vitest Guide](https://vitest.dev/guide/) - Official Vitest documentation
- [Vitest Common Errors](https://vitest.dev/guide/common-errors) - Official troubleshooting guide
- [Playwright Getting Started](https://playwright.dev/docs/intro) - Official Playwright documentation
- [Playwright CI Setup](https://playwright.dev/docs/ci-intro) - Official CI integration guide
- [React Testing Library Setup](https://testing-library.com/docs/react-testing-library/setup/) - Official custom render pattern

### Secondary (MEDIUM confidence)

- [Setting up Vitest for Next.js 15 - Wisp CMS](https://www.wisp.blog/blog/setting-up-vitest-for-nextjs-15) - Recent Next.js 15 specific setup
- [Testing in 2026: Jest, React Testing Library, and Full Stack Testing Strategies](https://www.nucamp.co/blog/testing-in-2026-jest-react-testing-library-and-full-stack-testing-strategies) - 2026 testing overview
- [How to Unit Test React Components with Vitest and React Testing Library](https://oneuptime.com/blog/post/2026-01-15-unit-test-react-vitest-testing-library/view) - January 2026 tutorial with theme testing
- [Guide to Playwright end-to-end testing in 2026 - DeviQA](https://www.deviqa.com/blog/guide-to-playwright-end-to-end-testing-in-2025/) - 2026 best practices
- [15 Best Practices for Playwright testing in 2026 | BrowserStack](https://www.browserstack.com/guide/playwright-best-practices) - Industry best practices
- [React Testing Library + Vitest: The Mistakes That Bite](https://medium.com/@samueldeveloper/react-testing-library-vitest-the-mistakes-that-haunt-developers-and-how-to-fight-them-like-ca0a0cda2ef8) - Common pitfalls (November 2025)
- [Mocking framer-motion v9 - DEV Community](https://dev.to/pgarciacamou/mocking-framer-motion-v9-7jh) - Framer Motion testing patterns
- [Getting Started with Integrating Playwright and GitHub Actions](https://autify.com/blog/playwright-github-actions) - GitHub Actions integration guide

### Tertiary (LOW confidence)

- [Mock Service Worker (MSW) in Next.js – A Guide for API Mocking and Testing](https://dev.to/mehakb7/mock-service-worker-msw-in-nextjs-a-guide-for-api-mocking-and-testing-e9m) - MSW patterns (no date, needs verification)
- Various GitHub issues about Playwright CI failures - Patterns observed but not authoritative

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Next.js docs, Vitest docs, Playwright docs all recommend this exact stack
- Architecture: HIGH - Patterns from official Testing Library setup docs and Next.js examples
- Pitfalls: HIGH - Documented in official Vitest Common Errors page, verified with recent 2026 sources
- Framer Motion mocking: MEDIUM - Community pattern, no official guidance but widely adopted
- Lenis testing: LOW - No established patterns found, recommendation based on general principles

**Research date:** 2026-01-21
**Valid until:** ~60 days (testing tools are stable, but framework integrations evolve with Next.js releases)
