# Phase 2: Testing Infrastructure - Context

**Gathered:** 2026-01-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish testing patterns before building complex features. Set up Vitest for unit/component tests and Playwright for E2E tests, integrated with CI. This phase creates the testing foundation — actual test coverage for features happens as those features are built.

</domain>

<decisions>
## Implementation Decisions

### Test coverage scope
- Focus on critical paths only — high-value flows like auth, blog CRUD, and forms
- No coverage threshold enforced — flexibility over enforcement
- Chromium-only for E2E tests — fast CI, covers most users

### CI behavior
- Failing tests block PR merges — required status check
- GitHub Actions summary for reporting — built-in status checks and workflow logs
- Run on push + PR to main branch
- Sequential execution — unit tests first, E2E only if units pass (fail fast)

### Test output format
- Minimal verbosity (dots) for local runs — details only on failure
- HTML reports generated only on failure for E2E
- Watch mode enabled by default for `pnpm test`
- Inline diffs for failure output — expected vs actual in terminal

### Test organization
- Co-located test files — `Button.test.tsx` next to `Button.tsx`
- Naming convention: `*.test.ts(x)`
- E2E tests in separate `e2e/` folder at project root
- Dedicated `src/test-utils/` folder for shared utilities, render helpers, mocks, fixtures

### Claude's Discretion
- E2E test scope — determine appropriate coverage based on existing pages
- Specific test utility patterns to include initially
- Vitest configuration details (reporters, globals, etc.)

</decisions>

<specifics>
## Specific Ideas

- "Fail fast" approach preferred — run unit tests first, only run E2E if units pass
- Watch mode should be the default developer experience for rapid feedback

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-testing-infrastructure*
*Context gathered: 2026-01-21*
