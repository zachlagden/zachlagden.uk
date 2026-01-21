# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-21)

**Core value:** A professional online presence that authentically represents who you are and what you build, with a blog for sharing technical content.
**Current focus:** Phase 3 Complete - Ready for Phase 4

## Current Position

Phase: 4 of 8 (Blog Core)
Plan: 2 of 5 in current phase (In progress)
Status: Phase 4 in progress - data layer and rendering complete
Last activity: 2026-01-21 - Completed 04-02-PLAN.md (Blog Data Layer & Code Highlighting)

Progress: [████░-----] ~43% milestone (3 phases complete, 4th in progress)

## Performance Metrics

**Velocity:**
- Total plans completed: 14
- Average duration: 6.1 min
- Total execution time: 1.6 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-dark-mode | 4 | 47min | 12min |
| 02-testing-infrastructure | 3 | 11min | 3.7min |
| 03-authentication | 5 | 24min | 4.8min |
| 04-blog-core | 2 | 17min | 8.5min |

**Recent Trend:**
- Last 5 plans: 03-04 (3min), 03-05 (8min), 04-01 (9min), 04-02 (8min)
- Trend: Consistent efficiency (avg 7min across last 4 plans)

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

| Decision | Phase | Rationale |
|----------|-------|-----------|
| Custom syntax highlighting CSS | 04-02 | External highlight.js themes not available; custom GitHub-inspired CSS eliminates dependency while matching site aesthetic |
| SerializedPost for API responses | 04-02 | Converts ObjectId/Date to strings for Next.js API route compatibility; ensures all responses serializable |
| Filter interfaces for MongoDB queries | 04-02 | Type-safe query building instead of 'any' types; improves IDE autocomplete and catches errors at compile time |
| rehype-highlight for syntax highlighting | 04-01 | Integrates with rehype plugin pipeline, provides GitHub-style code blocks without additional complexity |
| Compound text search index design | 04-01 | Equality conditions (published, categories) before text fields optimizes MongoDB query performance |
| previous_slugs array for redirects | 04-01 | Enables redirect support when post slugs change, prevents 404s on bookmarked links |
| Three-tier type system for Post | 04-01 | Post (DB schema), PostDocument (MongoDB ops), SerializedPost (API) for clear separation of concerns |
| Manual verification checkpoint for full OAuth flow | 03-05 | Automated tests can't complete GitHub OAuth; human verification confirms end-to-end functionality |
| Mock next-auth/react in component tests | 03-05 | OAuth requires browser interaction and external service; mocking enables isolated component testing |
| E2E tests verify redirect initiation | 03-05 | Tests confirm OAuth redirect to GitHub but stop before completion (manual interaction required) |
| DAL provides real security layer | 03-04 | Middleware is lightweight first check; DAL verifies auth server-side before data access |
| Middleware uses auth.config.ts not auth.ts | 03-04 | Edge runtime cannot use MongoDB adapter; split config for compatibility |
| Sign out everywhere via deleteMany | 03-04 | DELETE /api/auth/sessions with {all: true} revokes all user sessions for security |
| AdminFAB shows context-aware actions | 03-04 | New Post on blog pages, Edit/Delete only on individual posts based on pathname |
| Loading skeleton during session check | 03-03 | Prevents UI flash by showing skeleton in fixed position while session loads |
| Admin badge positioned on avatar | 03-03 | Amber badge with "A" indicator provides clear visual distinction for admin users |
| Glass effect pattern for auth UI | 03-03 | Matches ThemeToggle styling (backdrop-blur-md, semi-transparent) for visual consistency |
| SessionProvider wraps content inside ThemeProvider | 03-02 | Ensures theme context available to auth components while auth context available to all pages |
| 5-minute session refetch interval | 03-02 | Balances session freshness with API load |
| refetchOnWindowFocus enabled | 03-02 | Multi-tab session sync; logout in one tab reflects in others |
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

Last session: 2026-01-21T22:01:30Z
Stopped at: Completed 04-02-PLAN.md (Blog Data Layer & Code Highlighting)
Resume file: None
Next: Continue Phase 4 - 04-03 (Blog List Page)
