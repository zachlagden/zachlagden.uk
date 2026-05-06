# Testing Patterns

**Analysis Date:** 2026-05-06

## Test Framework

**None.** This codebase has zero automated tests of any kind.

**Searches performed:**

```bash
find /home/zach/development/personal/zachlagden.uk -type f \( -name "*.test.*" -o -name "*.spec.*" \)
# 0 results inside src/ or anywhere outside .git/

find /home/zach/development/personal/zachlagden.uk -type d \( -name "__tests__" -o -name "tests" -o -name "test" \)
# Only matches inside .git/ — no test directories in source tree
```

**Confirmed absent from `package.json`:**
- No `jest`, `@jest/*`, `ts-jest`, or `babel-jest`
- No `vitest`, `@vitest/*`
- No `@testing-library/*` (`react`, `jest-dom`, `user-event`)
- No `playwright`, `@playwright/test`
- No `cypress`
- No `mocha`, `chai`, `sinon`
- No `jsdom`, `happy-dom`

**No test scripts in `package.json`:**

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "node .next/standalone/server.js",
  "lint": "eslint .",
  "format": "prettier --write .",
  "format:check": "prettier --check ."
}
```

There is no `test`, `test:watch`, `test:e2e`, or `coverage` script.

**No test config files:**
- No `jest.config.*`
- No `vitest.config.*`
- No `playwright.config.*`
- No `cypress.config.*`

## Test File Organization

Not applicable — no tests exist.

If tests were added, the conventions implied by the codebase layout would be:

- Co-located unit tests beside source: `src/utils/contentLoader.ts` → `src/utils/contentLoader.test.ts`
- Component tests beside the component: `src/components/ui/SocialIcon.tsx` → `src/components/ui/SocialIcon.test.tsx`
- E2E tests in a top-level `e2e/` or `tests/` directory
- TypeScript path alias `@/*` (`tsconfig.json:22`) would resolve in test files via the runner's TS config

## Test Structure

Not applicable.

## Mocking

Not applicable.

## Fixtures and Factories

Not applicable. The closest thing to test data is the production content file at `public/content.json`, which is loaded by `src/utils/serverContentLoader.ts` and `src/utils/contentLoader.ts`. This could double as a fixture in a future test suite.

## Coverage

**Currently 0%** of the application has automated test coverage.

## CI Workflows

Two GitHub Actions workflows exist (`.github/workflows/`):

**`.github/workflows/lint.yml`** — runs ESLint on push/PR to `main`:

```yaml
name: Lint
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20" }
      - uses: pnpm/action-setup@v4
        with: { version: latest }
      # ... pnpm cache setup ...
      - run: pnpm install
      - run: pnpm run lint
```

**`.github/workflows/prettier.yml`** — runs Prettier in check mode on push/PR to `main`:

```yaml
- run: pnpm run format:check
```

**Inconsistencies / gaps in CI:**
- No build step in CI (`pnpm build` is never run on PRs — broken builds reach `main`)
- No type-check step (`tsc --noEmit` not run; `tsconfig.json` has `noEmit: true` but `tsc` isn't called)
- No test step
- Node version pinned to `"20"` in workflows but no `.nvmrc` or `engines` field in `package.json` to enforce locally
- Two parallel workflows duplicate ~30 lines of setup boilerplate; could be merged into a single matrix or composite job
- No deploy/preview workflow — deployment is presumably manual via Coolify (per user global instructions)

## Dependabot

`.github/dependabot.yml` is configured for weekly npm + GitHub Actions updates with grouped PRs (`next-ecosystem`, `dev-dependencies`, `security-updates`). This catches dependency drift but does not test that updates work — without a test suite, automated dep PRs are merge-by-faith.

## Manual Testing Surface

Per `CLAUDE.md` development guidance:

> 7. **Testing**: Test thoroughly across different browsers and devices

All testing is currently manual: open the browser, click around, check different viewport sizes, verify keyboard shortcuts work. There is no recorded test plan, smoke test checklist, or visual regression baseline.

## What's Tested vs Untested

**Tested:** Nothing automatically.

**Untested (everything):**

| Area | Files | Risk |
|------|-------|------|
| Content loader cache logic | `src/utils/contentLoader.ts` | Cache could serve stale data; no test catches it |
| Server content loader | `src/utils/serverContentLoader.ts` | File I/O failure on missing/malformed `public/content.json` would crash render |
| Date formatting | `src/utils/contentLoader.ts:formatDateRange` | Locale assumptions silently shift (`en-US` hardcoded) |
| Scroll utilities | `src/utils/scrollUtils.ts` | Reduced-motion branching is untested |
| View transitions fallback | `src/utils/viewTransition.ts` | Try/catch around `startViewTransition` swallows errors silently |
| Presence service parsing | `src/utils/presenceService.ts` | `parseSpotifyData`/`parseActivityData` handle external API shape changes with no validation |
| Keyboard navigation | `src/hooks/useKeyboardNavigation.ts` | Arrow + number keys; input/textarea focus exclusion logic |
| Section observer | `src/hooks/useSectionObserver.ts` | IntersectionObserver thresholds and rootMargin are magic numbers |
| Auto-save hook | `src/hooks/useAutoSave.ts` | localStorage quota errors uncaught; corrupt JSON returns `null` silently |
| Parallax hook | `src/hooks/useParallax.ts` | Reduced-motion branching, scroll-target binding |
| Auth callbacks | `src/lib/auth.ts` | `getAdminUsernames` env-var parsing; admin-flag JWT propagation |
| Auth helpers | `src/lib/auth-helpers.ts` | `requireAdmin` 403 response shape |
| Blog CRUD | `src/lib/blog.ts` | `slugify`, `ensureIndexes`, all MongoDB queries; `as unknown as BlogPost` casts hide type errors |
| MongoDB client | `src/lib/mongodb.ts` | Connection pooling, dev hot-reload guard, missing-env-var error |
| File upload | `src/lib/upload.ts` | MIME-type allowlist enforcement happens in route handler, not lib |
| Blog API routes | `src/app/api/blog/**/*` | Auth checks, request-body parsing, status codes, error paths |
| Health endpoint | `src/app/api/health/route.ts` | Trivial — but no smoke test confirms it returns 200 |
| Sitemap generation | `src/app/sitemap.ts` | DB-failure fallback to empty slug list |
| Robots.txt | `src/app/robots.ts` | — |
| RSS feed | `src/app/blog/feed.xml/route.ts` | XML correctness |
| All React components | `src/components/**/*.tsx` | Rendering, accessibility, prop handling, motion variants, reduced-motion branching |
| Intro animation state machine | `src/components/layout/Header.tsx` | 5-phase state machine with timer-driven transitions and font measurement |
| Markdown rendering | `src/components/blog/MarkdownRenderer.tsx` | XSS via `rehype-raw` is mitigated by `rehype-sanitize`, but no test confirms sanitization holds |
| Form submission | `src/components/sections/ContactSection.tsx` | Formspree integration is fire-and-forget — no failure-state test |

## What Would Need to Be Added

To establish a baseline test suite for this codebase:

**1. Test runner — Vitest** (matches Vite-style speed and Next.js compatibility better than Jest in 2026):

```bash
pnpm add -D vitest @vitest/ui jsdom \
  @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Add to `package.json`:

```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage"
}
```

`vitest.config.ts` with `resolve.alias` mapping `@/*` to `./src/*` and `test.environment = "jsdom"`.

**2. Unit tests** (highest ROI given size of codebase):
- `src/utils/contentLoader.test.ts` — cache, error path, date formatting
- `src/utils/scrollUtils.test.ts` — reduced-motion branching
- `src/utils/presenceService.test.ts` — Spotify/activity parsing edge cases
- `src/lib/blog.test.ts` — `slugify`, query building (mock `mongodb` module)
- `src/lib/auth.test.ts` — `getAdminUsernames` env-var parsing
- `src/hooks/useAutoSave.test.ts` — localStorage round-trip, corrupt JSON
- `src/types/blog.test.ts` — `serializePost` ObjectId/Date conversion

**3. Component tests** with React Testing Library:
- `src/components/ui/SocialIcon.test.tsx` — renders link with correct attrs and ARIA label
- `src/components/ui/CopyButton.test.tsx` — clipboard API mocked, success state
- `src/components/blog/MarkdownRenderer.test.tsx` — sanitization (`<script>` stripped), heading IDs generated
- `src/components/layout/MobileMenu.test.tsx` — ARIA expanded/controls, Escape handler
- `src/hooks/useKeyboardNavigation.test.tsx` — arrow keys, number keys, input-focus exclusion

**4. API route tests** (Next.js route handlers can be invoked directly):
- `src/app/api/health/route.test.ts` — returns `{ status: "ok" }`, status 200
- `src/app/api/blog/posts/route.test.ts` — auth gating on POST, query-param parsing on GET
- `src/app/api/blog/upload/route.test.ts` — MIME allowlist, 5MB size cap

**5. E2E tests** with Playwright (catches the things unit tests can't):

```bash
pnpm add -D @playwright/test
npx playwright install
```

Critical user journeys:
- Page loads, intro animation runs, sections render with content
- Keyboard navigation (`?`, `↑`, `↓`, `1`-`6`) jumps to correct sections
- `prefers-reduced-motion` skips intro
- Skip-to-content link is reachable via Tab and focuses `#main-content`
- Mobile menu opens, navigates, closes
- Contact form submits to Formspree (mocked)
- Blog list loads, tag filter works, search filter works, pagination works
- Admin route redirects unauthenticated users to `/`

**6. CI integration** — extend `.github/workflows/lint.yml` (or add `test.yml`):

```yaml
- run: pnpm run lint
- run: pnpm tsc --noEmit          # add type-check
- run: pnpm test --coverage        # unit + component
- run: pnpm build                  # catch build breakage
- run: pnpm playwright install --with-deps
- run: pnpm playwright test        # e2e
```

**7. Visual regression** — optional, but high value for a portfolio site that lives or dies on its visual polish. Either Playwright `toHaveScreenshot()` or a service like Percy/Chromatic.

## Summary

- **Test framework:** none
- **Test files:** none
- **CI runs:** ESLint + Prettier check only (no build, no types, no tests)
- **Coverage:** 0%
- **Manual-testing dependence:** total

A reasonable first milestone is unit-test coverage for the seven `src/utils/*` and `src/lib/*` files (pure functions, no React) plus a single Playwright smoke test that loads `/`, presses `?`, asserts the help modal renders, and presses `2` to verify section navigation. That alone catches the majority of regressions on a portfolio site of this scope.

---

*Testing analysis: 2026-05-06*
