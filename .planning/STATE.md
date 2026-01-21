# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-21)

**Core value:** A professional online presence that authentically represents who you are and what you build, with a blog for sharing technical content.
**Current focus:** Phase 2 Complete - Ready for Phase 3

## Current Position

Phase: 3 of 8 (Authentication)
Plan: 1 of 4 in current phase (In progress)
Status: Auth.js foundation complete
Last activity: 2026-01-21 - Completed 03-01-PLAN.md (Auth.js setup)

Progress: [██░-------] ~26% milestone (2 phases + 1 plan complete)

## Performance Metrics

**Velocity:**
- Total plans completed: 8
- Average duration: 7.5 min
- Total execution time: 1.1 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-dark-mode | 4 | 47min | 12min |
| 02-testing-infrastructure | 3 | 11min | 3.7min |
| 03-authentication | 1 | 6min | 6min |

**Recent Trend:**
- Last 5 plans: 02-01 (3min), 02-02 (2min), 02-03 (6min), 03-01 (6min)
- Trend: Consistent efficiency (avg 4.25min across last 4 plans)

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

| Decision | Phase | Rationale |
|----------|-------|-----------|
| Database session strategy for multi-device support | 03-01 | Enables "sign out everywhere" and active session management |
| Separate auth.config.ts for Edge runtime | 03-01 | MongoDB adapter incompatible with Edge; split config for future middleware |
| Admin detection via ADMIN_GITHUB_USERNAME env var | 03-01 | Flexibility to change admin without code deploy |
| Defer MongoDB URI validation to runtime | 03-01 | Allows builds without environment variables for CI/CD |
| Chromium-only for E2E tests | 02-03 | Fast CI, covers most users; per CONTEXT.md decision |
| Fail-fast CI pattern (unit → E2E) | 02-03 | Skip expensive E2E tests if unit tests fail |
| Playwright webServer auto-starts dev | 02-03 | DX improvement - no manual server startup needed |
| Playwright reports only on failure | 02-03 | Save storage costs, reports only needed for debugging |
| Mock ResizeObserver globally in setup | 02-02 | Radix UI components require ResizeObserver which isn't in jsdom |
| Mock entire next-themes module for tests | 02-02 | Testing component behavior, not next-themes implementation; bypasses localStorage/hydration issues |
| Co-located test files next to source | 02-02 | Improves discoverability, follows Vitest convention |
| Use .tsx extension for vitest.setup file | 02-01 | JSX syntax requires TSX extension for proper compilation |
| Mock Framer Motion globally in setup | 02-01 | Prevents animation timeouts that cause test hangs |
| Mock Lenis globally in setup | 02-01 | Smooth scroll library not needed in test environment |
| Custom render wraps ThemeProvider | 02-01 | Most components depend on theme context for dark mode |
| test script runs watch mode by default | 02-01 | Aligns with development workflow, test:unit for CI |
| Removed hardcoded color prop from ScrollProgress | 01-04 | Simplified API by using Tailwind dark: classes instead of inline styles |
| ScrollProgress uses inverted colors | 01-04 | Dark bar on light background, light bar on dark background for optimal visibility |
| Filter buttons use neutral-800 dark background | 01-04 | Ensures buttons stand out from page background (#0a0a0a) |
| Presence indicator text hierarchy | 01-04 | Container (neutral-500/400), links (neutral-400/500), hover (lighter) for consistent readability |
| Custom iOS-style switch instead of shadcn/ui Switch | 01-02 | Precise control over visual appearance while maintaining accessibility via ARIA |
| Glass effect design for toggle container | 01-02 | backdrop-blur-md with semi-transparent backgrounds creates modern, premium aesthetic |
| Fixed bottom-left positioning for toggle | 01-02 | Consistent location (bottom-6 left-6 z-50) makes toggle easy to find across all pages |
| Mounted state pattern for theme components | 01-02 | Prevents hydration mismatch errors with next-themes client-side rendering |
| Consistent color mapping pattern across all components | 01-03 | Ensures predictable dark mode behavior: neutral-800→#e5e5e5, neutral-600→neutral-400, etc. |
| Skill badges use 950-level dark colors | 01-03 | Maintains color identity while ensuring proper contrast against #0a0a0a background |
| Shadow to glow replacement in dark mode | 01-03 | Shadows don't work on dark backgrounds; subtle white glow provides depth |
| Form inputs use #1a1a1a background | 01-03 | Elevated surface color distinguishes interactive elements from page background |
| shadcn/ui New York style with Neutral base | 01-01 | Cleaner aesthetic, good foundation for custom dark colors |
| defaultTheme="system" with enableSystem | 01-01 | Respects OS preference on first visit, auto-syncs with system changes |
| Dark colors: #0a0a0a bg, #e5e5e5 text | 01-01 | Reduces eye strain vs pure black/white, modern aesthetic |
| 150ms theme transitions with reduced motion support | 01-01 | Smooth UX for most users, instant for accessibility |
| MongoDB for blog storage | project | User preference |
| GitHub OAuth for authentication | project | Developer-focused audience |
| Admin privileges restricted to zachlagden | project | Personal portfolio, single admin needed |

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-01-21T19:58:31Z
Stopped at: Completed 03-01-PLAN.md
Resume file: None
Next: Phase 3 Plan 2 (UI Components) - ready for execution
