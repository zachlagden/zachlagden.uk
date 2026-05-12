# zachlagden.uk

## What This Is

A personal portfolio + blog site for Zach Lagden. Started as a static Next.js CV; mid-flight extension added a MongoDB-backed blog with admin UI (Auth.js v5 GitHub OAuth) and a cinematic intro animation. Currently in a half-finished state — runtime gaps, dead code, missing error boundaries, partially-removed Sentry — that needs to be stabilised before further feature work.

## Core Value

The site renders correctly and stays up. A visitor on `/`, `/blog`, or `/blog/[slug]` should never see a blank page or a 500, regardless of MongoDB availability or transient runtime errors.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

#### Pre-existing capabilities (carried forward)

- ✓ Static portfolio: hero, about, experience, education, skills, certifications, contact — content-as-props from `public/content.json` — existing
- ✓ Cinematic intro animation with font-readiness gate — existing (recent commits 35c2ba7…38b2634)
- ✓ Live presence ticker (Spotify + VS Code via `api.lagden.dev`) — existing
- ✓ Custom cursor, scroll progress, keyboard nav, reduced-motion support — existing
- ✓ Coolify Docker deployment with `output: "standalone"` — existing
- ✓ Blog list, individual posts, RSS feed scaffolding — existing (now hardened)
- ✓ GitHub-OAuth-gated admin UI for creating/editing posts — existing (now hardened)

#### Phase 0 — pre-init fixes

- ✓ Sentry instrumentation removed — Phase 0 (commit 248cc36)
- ✓ BlogEditor render-loop bug — Phase 0 (commit 96203a3)
- ✓ MongoDB-down guards on `/blog`, `/blog/feed.xml`, `/sitemap.xml`, `/` — Phase 0 (commit a0e1dfa)

#### Phase 1 — Runtime Stability

- ✓ STAB-01 + STAB-02: error boundaries (`app/error.tsx`, `app/global-error.tsx`) — Phase 1 (commit 909d7f2)
- ✓ STAB-03 + STAB-04: intro animation race fixes (font-ready timeout, rAF cancel guard) — Phase 1 (commit 6edb503)
- ✓ STAB-05: `intro-locked` lifecycle centralised to home route only — Phase 1 (commit b1dfac3)

#### Phase 2 — Security & Documentation

- ✓ SEC-01: explicit allow-list schema for `rehype-sanitize` — Phase 2 (commit 16060dd)
- ✓ SEC-02 + SEC-03: response security headers + `poweredByHeader: false` — Phase 2 (commit fea6904)
- ✓ SEC-04: auth adapter logs init failures instead of silent fallback — Phase 2 (commit 58daa80)
- ✓ SEC-05: SVG dropped from upload allow-list, magic-number sniffing — Phase 2 (commit 89597f5)
- ✓ DOC-01: README rewritten to match current architecture — Phase 2 (commit 5900a69)

#### Phase 3 — Performance Hardening

- ✓ PERF-01: `sectionRefs` memoised so `IntersectionObserver` is stable — Phase 3 (commit b5fdb0f)
- ✓ PERF-02: presence polling backoff + visibility gating — Phase 3 (commit 4931ff6)
- ✓ PERF-03: `CustomCursor` event delegation — Phase 3 (commit e8fedc3)
- ✓ PERF-04: `BlogSearch` skips initial empty-query fetch — Phase 3 (commit 5ea16d3)

#### Phase 4 — Cleanup & Tooling

- ✓ CLEAN-01..03: dead code removed (`AnimatedText.tsx`, parts of `contentLoader.ts`, `pnpm-workspace.yaml`); deps cleaned — Phase 4 (commit 44de169)
- ✓ CLEAN-04: `useAutoSave` quota-safe + restore-on-mount in `BlogEditor` — Phase 4 (commit fefc60c)
- ✓ CLEAN-05: `ensureIndexes()` invoked on first DB use — Phase 4 (commit 7ba4c33)
- ✓ CLEAN-06: ESLint enforces `react-hooks/exhaustive-deps` and `no-floating-promises` — Phase 4 (commit cc8561e)
- ✓ CLEAN-07 + CLEAN-08: real sitemap `lastModified` dates + `rehype-slug` for markdown headings — Phase 4 (commit ae144e2)

#### Phase 5 — Dependency Hardening + Env Config

- ✓ DEP-01: 44 Dependabot alerts resolved via Batches A→B→C→D + late `flatted` override; `pnpm audit` clean — Phase 5 (commit fda5eda / override 02fd752)
- ✓ DEP-02: `knip` v6.13.0 devDep + verbatim v2-open baseline at `.planning/runbooks/KNIP-BASELINE.md` — Phase 5 (commit 4e6910f)
- ✓ DEP-03: `.github/dependabot.yml` ignores `next-auth` (all), `framer-motion` (non-patch), `pnpm` (major) — Phase 5 (commit bfe3ad3)
- ✓ DEP-04 + DEP-05: per-batch verification floor + rollback rule honoured across all four batches — Phase 5 (commit fda5eda)
- ✓ ENV-01..03: Coolify env audit in `.planning/runbooks/ENV-VARS.md`; `AUTH_GITHUB_ID`/`AUTH_GITHUB_SECRET` + `GITHUB_PAT` (classic, `read:user`) provisioned for Phase 7 — Phase 5 (commit 7008400)
- ✓ ENV-04 + ENV-05: `AUTH-SMOKE-TEST.md` PASSED end-to-end against prod after 3 unblock cycles (revoked GitHub deploy key re-added; `AUTH_TRUST_HOST=true` + `AUTH_URL=https://zachlagden.uk` added as missed implicit env vars); `CLOUDFLARE.md` documents DNS-only AS-IS + parameterised proxied block; bonus `COOLIFY-DEPLOY-KEY.md` runbook captures deploy-key recovery procedure — Phase 5 (commit a48b90e)

### Active

<!-- Current scope. Building toward these. -->

(See "Current Milestone" below — full requirements live in REQUIREMENTS.md after roadmap is generated.)

## Current Milestone: v2.0 Polish, Integrations & Freelance

**Goal:** Ship the post-stabilisation evolution — clean up the dependency surface, refresh stale content, add live data integrations, and launch a freelance offering — without diluting the personal-site identity.

**Target features:**

- **Phase 5 — Dependency hardening + env config:** Resolve all 44 Dependabot alerts (high + mod + low); audit Coolify envs against `.env.example`; add missing `AUTH_GITHUB_ID`/`AUTH_GITHUB_SECRET`; capture env-vars runbook
- **Phase 6 — Content refresh:** Full audit of `public/content.json` (about, experience, skills, education, certs, hero, metadata); add `personal.birthday` + server-computed age; refresh tagline + skills
- **Phase 7 — Integrations + /stats page:** GitHub commit heatmap (public + private via PAT), Tokscale.ai stats (API research → scrape fallback), pinned repos w/ live stars, `/now` page, RSS subscriber count; placement = homepage teasers + dedicated `/stats` page
- **Phase 8 — Freelance offering:** Homepage "available for work" callout (toggle via content.json flag); `/freelance` page with visible pricing tiers, service categories, "what I don't do" list, Cal.com CTA + GA event tracking, "Areas I cover" list (Berkshire towns); `Service` schema + `/freelance.md` machine-readable file; robots.txt AI-bot audit; tone reference = Linear/Vercel/Plain

**Key context:**

- Phase numbering continues from v1 (5–8). Old phase directories were never created in v1 (all v1 work was `/gsd-quick` tasks); no archive needed.
- Deferred-from-v1 items (TEST-01/02, INFRA-01, POLISH-04) remain deferred to v3 — not in scope for v2.
- Cut from Phase 8 explicitly: FAQ section, `LocalBusiness` schema, testimonials, mocked case studies, programmatic town pages.
- Verification floor stays the same as v1: `tsc --noEmit` + `pnpm lint` per batch. No test framework introduced.

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

**Required env vars** (full audit at `.planning/runbooks/ENV-VARS.md`): `MONGODB_URI`, `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `ADMIN_GITHUB_USERNAME`, `AUTH_TRUST_HOST=true`, `AUTH_URL` (canonical site URL). Phase-7 reserved: `GITHUB_PAT`. Removed obsolete: `NEXT_PUBLIC_GA_ID` (GA ID is read from `public/content.json`), `NEXT_PUBLIC_DISCORD_USER_ID` (presence widget deletion deferred to Phase 6).

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
| Stabilise before adding features | 31 concerns including 6 HIGH-severity bugs in production code path | ✓ Good — all 23 v1 reqs shipped in 20 atomic source commits |
| Skip Sentry restoration | User explicitly removed Sentry; observability is out-of-scope for this milestone | ✓ Good |
| Defer test suite | Significant scope; would slow stabilisation; revisit after milestone | ✓ Good — `tsc --noEmit` + `pnpm lint` floor held; CLEAN-06 added type-aware lint to catch future regressions |
| Coarse phase granularity | Stabilisation work is naturally categorical (stability / security / cleanup); fewer larger phases reduce overhead | ✓ Good — 4 phases, no rework, no dependencies missed |
| Skip per-phase research | Brownfield with a complete codebase map; no domain to discover | ✓ Good — codebase map covered every concern fix |
| Accept classic PAT instead of fine-grained for Phase 7 | User supplied `ghp_…` (classic, `read:user`) rather than fine-grained `github_pat_…`; rotation calendar item planned for 2027-04-12 | Documented variance — works for Phase 7's contributions GraphQL query; `.planning/todos/pending/rotate-github-pat.md` tracks fine-grained migration |
| Remove presence widget entirely vs. fix env var | `NEXT_PUBLIC_DISCORD_USER_ID` was missing from Coolify (silently broken); user chose removal over fix; widget deletion scope deferred to Phase 6 | `.planning/todos/pending/remove-presence-widget.md` captures deletion list (PresenceStatus.tsx, presenceService.ts, presence.ts type, layout preconnect, README mention) |

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
*Last updated: 2026-05-12 — Phase 5 (Dependency Hardening + Env Config) complete; phase 6 (Content Refresh + Auto-age) next*
