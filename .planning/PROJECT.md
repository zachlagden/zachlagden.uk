# zachlagden.uk

## What This Is

A personal portfolio + blog site for Zach Lagden. Started as a static Next.js CV; mid-flight extension added a MongoDB-backed blog with admin UI (Auth.js v5 GitHub OAuth) and a cinematic intro animation. Currently in a half-finished state — runtime gaps, dead code, missing error boundaries, partially-removed Sentry — that needs to be stabilised before further feature work.

## Core Value

The site renders correctly and stays up. A visitor on `/`, `/blog`, or `/blog/[slug]` should never see a blank page or a 500, regardless of MongoDB availability or transient runtime errors.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

- ✓ Static portfolio: hero, about, experience, education, skills, certifications, contact — content-as-props from `public/content.json` — existing
- ✓ Cinematic intro animation with font-readiness gate — existing (recent commits 35c2ba7…38b2634)
- ✓ Live presence ticker (Spotify + VS Code via `api.lagden.dev`) — existing
- ✓ Custom cursor, scroll progress, keyboard nav, reduced-motion support — existing
- ✓ Coolify Docker deployment with `output: "standalone"` — existing
- ✓ Blog list, individual posts, RSS feed scaffolding — existing (needs hardening)
- ✓ GitHub-OAuth-gated admin UI for creating/editing posts — existing (needs hardening)
- ✓ Sentry instrumentation removed — Phase 0 (commit 248cc36)
- ✓ BlogEditor render-loop bug — Phase 0 (commit 96203a3)
- ✓ MongoDB-down guards on `/blog`, `/blog/feed.xml`, `/sitemap.xml`, `/` — Phase 0 (commit a0e1dfa)

### Active

<!-- Current scope. Building toward these. -->

- [ ] Error boundaries restored — `app/error.tsx` and `app/global-error.tsx` (CONCERNS #4)
- [ ] README rewritten to match current architecture (CONCERNS #5)
- [ ] Markdown rendering hardened against XSS (CONCERNS #3)
- [ ] Security headers + CSP added to `next.config.ts` (CONCERNS #15)
- [ ] Auth adapter failure surfaced loudly instead of silent JWT-only fallback (CONCERNS #17)
- [ ] SVG uploads disabled or sanitised; magic-number sniffing for uploads (CONCERNS #18)
- [ ] Intro animation race conditions fixed (font-ready timeout, rAF cancel guard, intro-locked dedup) (CONCERNS #7, #14)
- [ ] `useSectionObserver` no longer rebuilds on every render (CONCERNS #9)
- [ ] `PresenceStatus` polling backs off and pauses when tab hidden (CONCERNS #8)
- [ ] `CustomCursor` uses event delegation, not snapshot listeners (CONCERNS #10)
- [ ] `BlogSearch` skips initial empty-query fetch (CONCERNS #11)
- [ ] Dead code removed: `AnimatedText.tsx`, `contentLoader.ts`, `pnpm-workspace.yaml` (CONCERNS #12, #13, #24)
- [ ] `useAutoSave` quota-safe; restore-on-mount wired up (CONCERNS #21)
- [ ] `ensureIndexes()` invoked on first DB use (CONCERNS #22)
- [ ] ESLint config enforces `react-hooks/exhaustive-deps` and `no-floating-promises` (CONCERNS #25)
- [ ] Sitemap `lastModified` derived from real change dates, not `new Date()` (CONCERNS #31)
- [ ] Markdown heading IDs via `rehype-slug`; TOC consumes the same IDs (CONCERNS #30)

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Test suite (Vitest + integration tests) — significant scope; tracked separately, will land after stabilisation
- Migrating uploads to Cloudflare R2 (CONCERNS #16) — keep filesystem + Coolify volume for now; revisit when scale demands it
- Bringing Sentry back — explicitly removed; if observability is needed later, evaluate alternatives
- TypeScript target bump to ES2022 (CONCERNS #26) — low-impact, defer
- Pagination ellipsis (CONCERNS #28) — won't matter until 50+ posts exist
- `BlogPostCard` `sizes` tuning (CONCERNS #29) — micro-optimisation, defer
- `not-found.tsx` history.back guard (CONCERNS #27) — defer; current behaviour is harmless
- Reducing Framer Motion bundle (CONCERNS #20) — defer; not blocking ship
- OG/Twitter PNG re-compression (CONCERNS #19) — defer; current size is fine

## Context

**Codebase state:** Full map in `.planning/codebase/` (7 documents, ~2200 lines). 31 concerns documented in `CONCERNS.md` (6 HIGH, 12 MED, 13 LOW). The blog/admin subsystem is bolted onto a previously-static site, which explains many of the half-finished seams.

**Recent activity:** Major dependency bumps (Next 15.3 → 16.1, React 19.1 → 19.2). Cinematic intro animation added across 5 recent commits. Sentry instrumentation removed. All committed in commit 248cc36 as a snapshot.

**Required env vars** (currently undocumented in README): `MONGODB_URI`, `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `ADMIN_GITHUB_USERNAME`. Optional: `NEXT_PUBLIC_GA_ID`.

**Deployment:** Coolify on the DigiGrow server. Docker `output: "standalone"`. Persistent volume needed for `public/uploads/`.

## Constraints

- **Tech stack**: Next.js 16 (App Router), React 19.2, TypeScript 5 strict, Tailwind 4, pnpm, Turbopack — locked. No framework migrations during stabilisation.
- **Deployment**: Coolify + Docker (no Vercel, no K8s, no separate CI/CD beyond GitHub Actions lint/prettier checks).
- **Component library**: Radix UI + shadcn/ui + Tailwind per global CLAUDE.md. No alternative libraries.
- **API style**: REST only, no GraphQL.
- **Observability**: None currently (Sentry removed). Reintroducing observability is out of scope for this milestone.
- **No tests**: Zero test framework in place; stabilisation work proceeds without test coverage but each fix verified by `tsc --noEmit` and `pnpm lint`.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Stabilise before adding features | 31 concerns including 6 HIGH-severity bugs in production code path | — Pending |
| Skip Sentry restoration | User explicitly removed Sentry; observability is out-of-scope for this milestone | ✓ Good |
| Defer test suite | Significant scope; would slow stabilisation; revisit after milestone | — Pending |
| Coarse phase granularity | Stabilisation work is naturally categorical (stability / security / cleanup); fewer larger phases reduce overhead | — Pending |
| Skip per-phase research | Brownfield with a complete codebase map; no domain to discover | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-06 after initialization*
