# Requirements: zachlagden.uk

**v1 defined:** 2026-05-06
**v2 defined:** 2026-05-12
**Core Value:** The site renders correctly and stays up — no blank pages, no 500s, regardless of MongoDB availability or transient runtime errors.

## v1 Requirements

Stabilisation milestone. Each requirement maps to one CONCERNS.md entry in `.planning/codebase/CONCERNS.md`. All shipped 2026-05-06.

### Stability

- [x] **STAB-01**: Root error boundary at `src/app/error.tsx` recovers from runtime errors with a "Try again" + "Back to Home" affordance and logs the error via `console.error` (CONCERNS #4)
- [x] **STAB-02**: Global error boundary at `src/app/global-error.tsx` (with its own `<html><body>` wrapper) recovers from root-layout errors (CONCERNS #4)
- [x] **STAB-03**: Intro animation has a 5-second fallback when `document.fonts.ready` stalls; the body never stays `intro-locked` indefinitely (CONCERNS #7)
- [x] **STAB-04**: Intro `requestAnimationFrame` callback respects the cancelled flag and never calls `setState` after unmount (CONCERNS #7)
- [x] **STAB-05**: `intro-locked` class is removed from a single canonical location instead of being duplicated across `Header`, `ClearIntro`, three layouts, and `signin/page.tsx` (CONCERNS #14)

### Security

- [x] **SEC-01**: `MarkdownRenderer` invokes `rehypeSanitize` with an explicit allow-list schema, not the default schema (CONCERNS #3)
- [x] **SEC-02**: `next.config.ts` returns security headers — at minimum `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, and a CSP that allows GA + same-origin (CONCERNS #15)
- [x] **SEC-03**: `next.config.ts` sets `poweredByHeader: false` (CONCERNS #15)
- [x] **SEC-04**: `getAdapter()` in `src/lib/auth.ts` logs the underlying error with `console.error` instead of silently returning `undefined` (CONCERNS #17)
- [x] **SEC-05**: SVG removed from upload allow-list in `src/app/api/blog/upload/route.ts`, and uploaded file MIME is validated by magic-number sniff, not client-claimed `file.type` (CONCERNS #18)

### Documentation

- [x] **DOC-01**: `README.md` documents required env vars (`MONGODB_URI`, `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `ADMIN_GITHUB_USERNAME`), optional vars (`NEXT_PUBLIC_GA_ID`), MongoDB dependency, GitHub OAuth setup, Coolify deployment, and the blog/admin features (CONCERNS #5)

### Performance

- [x] **PERF-01**: `useSectionObserver` no longer rebuilds its `IntersectionObserver` on every render of `HomeClient` — `sectionRefs` is stable (CONCERNS #9)
- [x] **PERF-02**: `PresenceStatus` polls at 30s base, pauses when `document.hidden`, and applies exponential backoff on consecutive errors (CONCERNS #8)
- [x] **PERF-03**: `CustomCursor` uses event delegation on `document.body` so dynamically-added interactive elements are covered (CONCERNS #10)
- [x] **PERF-04**: `BlogSearch` skips its initial empty-query fetch (CONCERNS #11)

### Cleanup

- [x] **CLEAN-01**: `src/components/ui/AnimatedText.tsx` deleted; `split-type` removed from `package.json` if no remaining importer (CONCERNS #12)
- [x] **CLEAN-02**: `src/utils/contentLoader.ts` trimmed to only the imported `formatDate`/`formatDateRange` exports (CONCERNS #13)
- [x] **CLEAN-03**: `pnpm-workspace.yaml` deleted; `onlyBuiltDependencies` relocated to `package.json` `pnpm` key (CONCERNS #24)
- [x] **CLEAN-04**: `useAutoSave` wraps `localStorage.setItem` in try/catch and surfaces quota errors; restore-on-mount wired into `BlogEditor` (CONCERNS #21)
- [x] **CLEAN-05**: `ensureIndexes()` invoked on first DB use via lazy guard in `postsCollection()` so blog queries get the documented indexes (CONCERNS #22)
- [x] **CLEAN-06**: `eslint.config.mjs` enforces `react-hooks/exhaustive-deps: "error"` and `@typescript-eslint/no-floating-promises: "error"` with all violations fixed (CONCERNS #25)
- [x] **CLEAN-07**: Sitemap `lastModified` uses real change dates — `BUILD_DATE` constant for static pages, `post.updatedAt` for blog (CONCERNS #31)
- [x] **CLEAN-08**: Markdown heading IDs generated via `rehype-slug`; `TableOfContents` consumes the same `github-slugger` algorithm (CONCERNS #30)

## v2 Requirements

Polish, Integrations & Freelance milestone. Each requirement is atomic, testable, and assigned to one phase. Verification floor for v2 is `tsc --noEmit && pnpm lint && pnpm build` per batch (`pnpm build` added beyond v1 — catches Turbopack/Coolify regressions).

### Dependency Hardening

- [ ] **DEP-01**: All 44 Dependabot alerts resolved (19 high + 19 moderate + 6 low); `pnpm audit` shows 0 high/critical and 0 moderate after the milestone closes
- [x] **DEP-02**: `knip` installed as a devDep; baseline run captured in `.planning/runbooks/KNIP-BASELINE.md` showing pre-v2 unused-code state for regression comparison
- [x] **DEP-03**: `.github/dependabot.yml` configured to ignore `next-auth` (beta-to-beta) and to limit `framer-motion` to patch-only bumps so future automated PRs do not regress STAB-03/04 or auth flow
- [ ] **DEP-04**: `pnpm dedupe` run after each batch; lockfile churn audited for unintended transitive duplicates
- [ ] **DEP-05**: Per-batch verification floor enforced: `tsc --noEmit && pnpm lint && pnpm build` must pass before each Dependabot batch is merged; failures roll back the batch

### Environment & Runbooks

- [x] **ENV-01**: Coolify env vars audited against `.env.example`; documented in `.planning/runbooks/ENV-VARS.md` with present / missing / obsolete columns
- [x] **ENV-02**: Missing `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` populated in Coolify; admin GitHub OAuth signin at `/admin/blog` verified working in prod
- [x] **ENV-03**: New `GITHUB_PAT` provisioned (fine-grained, "No repository access" + "Profile: Read-only", 1-year max expiry) and added to Coolify env vars for Phase 7
- [x] **ENV-04**: `.planning/runbooks/CLOUDFLARE.md` captures Cloudflare full-proxy configuration — page-rules / cache-rules / cache-purge procedure — so Next `Cache-Control` is honored end-to-end
- [x] **ENV-05**: `.planning/runbooks/AUTH-SMOKE-TEST.md` documents the manual sign-in test that must pass after any `next-auth` bump

### Content Refresh

- [ ] **CONT-01**: `personal.birthday: "YYYY-MM-DD"` field added to `public/content.json` and `src/types/content.ts` (server-only type variant)
- [ ] **CONT-02**: `src/utils/age.ts` exports `computeAge(birthday: string, now?: Date): number` using `Intl.DateTimeFormat` with `timeZone: "Europe/London"`; pure function, no library deps
- [ ] **CONT-03**: `src/utils/serverContentLoader.ts` computes age from birthday, injects into `Personal`, and strips `birthday` before returning ContentData — single chokepoint
- [ ] **CONT-04**: `Personal` interface type-split — server-only variant includes `birthday`, client-facing variant omits it; type system enforces the boundary
- [ ] **CONT-05**: All hardcoded age literals (e.g. "18-year-old") in content.json and component copy replaced with the computed `age` field
- [ ] **CONT-06**: `export const revalidate = 86400` on `/` so age refreshes daily without manual redeploy; `pnpm build` output verifies `/` is ISR not pure Static
- [ ] **CONT-07**: Build-time assertion: `grep -r "birthday" .next/static/` returns empty after every build; CI-style guard added to `package.json` scripts or runbook
- [ ] **CONT-08**: About-section tagline, skills, experience, and metadata updated (user-supplied at execution); British English consistency pass across all copy changes
- [ ] **CONT-09**: Certifications section confirmed untouched (already accurate per user)
- [ ] **CONT-10**: Content-audit decisions log captured in `.planning/runbooks/CONTENT-AUDIT-2026-05.md` so future-Zach knows why each field changed

### Integrations & /stats + /now pages

- [ ] **INT-01**: `src/lib/github.ts` server-only module added using `@octokit/graphql@^9.0.3`; single GraphQL query covers `contributionsCollection` (public + private), `pinnedItems`, and live star/fork counts
- [ ] **INT-02**: `unstable_cache` wrapper around `getGitHubStats()` with 1h revalidate; rate-limit-aware (5000/hr authenticated)
- [ ] **INT-03**: `src/components/stats/GitHubHeatmap.tsx` renders 53×7 SVG with GitHub's 5-bucket green palette (light + dark variants), year selector, day-cell tooltip with date and count; honors `prefers-reduced-motion`
- [ ] **INT-04**: `src/components/stats/PinnedRepos.tsx` renders auto-balanced grid (graceful at 0 / 1 / 3 / 6 cards via `grid-cols-[repeat(auto-fill,minmax(280px,1fr))]`); each card shows name, description, primary language with linguist color, star count, fork count
- [ ] **INT-05**: `src/components/stats/TokscaleEmbed.tsx` embeds `https://tokscale.ai/api/embed/zachlagden/svg` via `<object>` with a fallback graphic if the embed returns 404 or fails
- [ ] **INT-06**: `src/app/stats/page.tsx` (RSC) composes heatmap, pinned repos, Tokscale, and existing presence ticker; uses `Promise.allSettled` so a single integration failure does not kill the page
- [ ] **INT-07**: `src/app/stats/error.tsx` segment error boundary catches any unhandled failures within the /stats subtree
- [ ] **INT-08**: `src/app/now/page.tsx` (RSC, static) reads `content.now` from content.json; renders staleness banner when `lastUpdated` > 90 days; emits `<meta name="robots" content="noindex">` when > 180 days
- [ ] **INT-09**: `content.now: { lastUpdated, focus, learning, sideProjects, location }` field added to content.json and `src/types/content.ts`
- [ ] **INT-10**: Homepage `StatsTeaser` component — small summary tile (commits this year, top language, current streak) linking to /stats; lives outside the section/keyboard-nav system
- [ ] **INT-11**: `src/app/sitemap.ts` updated to include `/stats` and `/now`
- [ ] **INT-12**: `/stats` and `/now` linked from site footer (NOT primary header nav)

### Freelance Offering

- [ ] **FREE-01**: `src/app/freelance/page.tsx` (RSC, mostly static) — entry route for freelance offering
- [ ] **FREE-02**: Hero with 5–10 word direct H1 (Linear/Plain/Vercel reference tone — plain, no buzzwords) + primary Cal.com CTA button
- [ ] **FREE-03**: Pricing component with 3+1 visual layout — Starter £750 / Standard £1,800 / Pro from £3,500 in a price-anchored row, AI Integration from £1,500 as a separate add-on row below; no "Most popular" highlight in v2
- [ ] **FREE-04**: "What I do" services section listing brochure sites, booking systems, WordPress fixes/rebuilds, AI integrations, and custom builds
- [ ] **FREE-05**: "What I don't do" list — 4–6 lowercase imperative bullets positioned between pricing and "How it works"; aligned with brief (no logo work, no SEO-as-standalone, no hosting contracts, no sub-£750)
- [ ] **FREE-06**: "How it works" 4-step explainer — Book call → Quote → Build → Launch
- [ ] **FREE-07**: "Areas I cover" list — Ascot / Sunninghill / Sunningdale / Bracknell / Windsor / Egham / Virginia Water / Camberley + "UK-wide via remote"; bounded to ≤15-mile radius to avoid over-claim
- [ ] **FREE-08**: Past-work section omitted (per user decision); replace with single line "Past work available on request"
- [ ] **FREE-09**: Final Cal.com CTA repeat at page bottom
- [ ] **FREE-10**: All Cal.com link clicks wired to `sendGAEvent('freelance_cta_click', { placement })` via `@next/third-parties`; payload is click-only and PII-free
- [ ] **FREE-11**: Cal.com URL stored in `content.personal.freelance.calLink` (single read site, never hardcoded in components); supplied at execution time
- [ ] **FREE-12**: `personal.freelance.available: boolean` toggle in content.json; homepage `AvailabilityCallout` reads it — when false the callout hides entirely
- [ ] **FREE-13**: `personal.freelance.availability.asOf: string` dated field; build-time `console.warn` if older than 30 days so it never silently goes stale
- [ ] **FREE-14**: `src/app/freelance.md/route.ts` dynamic handler returns `text/markdown` derived from content.json — machine-readable mirror of /freelance for AI agents evaluating vendors programmatically
- [ ] **FREE-15**: `Service` JSON-LD via `schema-dts@^2.0.0` (type-only); composed in `@graph` with stable `@id` cross-ref to the existing `Person` schema; `areaServed` lists the same towns as FREE-07; verified clean against Google Rich Results Test
- [ ] **FREE-16**: `src/app/robots.ts` extended with explicit Allow rules for AI bots — `GPTBot`, `ClaudeBot`, `Claude-Web`, `PerplexityBot`, `CCBot`, `anthropic-ai`, `Google-Extended`, `Applebot-Extended`; Disallow `/admin` and `/api` for `*`
- [ ] **FREE-17**: Header navigation updated to include `/freelance` link; `src/app/sitemap.ts` updated to include `/freelance`
- [ ] **FREE-18**: `.planning/runbooks/PRICING-RATIONALE.md` captures peer comparison (≥3 Berkshire-area senior dev rates) and market-positioning logic so future-Zach can adjust tiers with context

## Future Requirements

Deferred to v3 or later.

### Testing

- **TEST-01**: Vitest + integration tests for `src/lib/auth.ts` (security-critical) and `src/lib/blog.ts` (data correctness)
- **TEST-02**: Smoke tests for the intro animation state machine and `useSectionObserver` / `useParallax` hooks

### Infrastructure

- **INFRA-01**: Migrate `public/uploads/` to Cloudflare R2 (or another S3-compatible store) so uploads survive redeploys without volume config — less urgent now that Coolify persistent volume is configured

### Polish

- **POLISH-04**: Framer Motion usage audited; trivial fades replaced by CSS keyframes from `globals.css` (CONCERNS #20) — ~30 files of state-dependent animation; bigger than polish

## Out of Scope

Explicitly excluded from v2 (decisions documented inline to prevent re-adding):

| Item | Reason |
|---|---|
| Reintroducing Sentry / observability | Explicitly deferred; was out of scope in v1 too, no new pressure to revisit |
| Migrating to Vercel | Deploys via Coolify per global instructions |
| Switching component library | Locked on Radix + shadcn + Tailwind |
| GraphQL API | REST-only per global instructions |
| Multi-author blog | Admin allow-list remains single-user |
| `LocalBusiness` schema markup | Nudges site identity toward agency; user explicitly cut |
| FAQ section on /freelance | Pricing + "what I don't do" filter does the same job; cut |
| Testimonials section on /freelance | Deferred until 2–3 real quotes exist (v3+) |
| Mocked SMB case-study demos | Sophisticated buyers smell mockups; cut |
| Programmatic per-town pages (`/freelance/ascot`, etc.) | Doorway-page anti-pattern; one strong page + areas list does the same SEO work |
| Cal.com inline embed widget | Adds page weight + consent burden; outbound link is the brief's call |
| RSS subscriber count on /stats | No honest measurement source; fabrication would damage brand |
| Wakatime / coding time stats | Out of scope for v2; revisit only if you start using Wakatime |
| Last.fm / Letterboxd / "currently reading" tiles | Out of scope; not picked during brainstorm |
| Mastodon / Bluesky last-post tile | Out of scope; not picked during brainstorm |
| /now page being a separate markdown file | Recommended path is content.json field for consistency with content-as-props |
| Pricing tier highlight ("Most popular" on Standard) in v2 | No conversion data yet; revisit in v3 once GA events accumulate |

## Traceability

Populated by the roadmapper after v2 roadmap approval.

| Requirement | Phase | Status | Commit |
|---|---|---|---|
| STAB-01 | Phase 1 | Complete | 909d7f2 |
| STAB-02 | Phase 1 | Complete | 909d7f2 |
| STAB-03 | Phase 1 | Complete | 6edb503 |
| STAB-04 | Phase 1 | Complete | 6edb503 |
| STAB-05 | Phase 1 | Complete | b1dfac3 |
| SEC-01 | Phase 2 | Complete | 16060dd |
| SEC-02 | Phase 2 | Complete | fea6904 |
| SEC-03 | Phase 2 | Complete | fea6904 |
| SEC-04 | Phase 2 | Complete | 58daa80 |
| SEC-05 | Phase 2 | Complete | 89597f5 |
| DOC-01 | Phase 2 | Complete | 5900a69 |
| PERF-01 | Phase 3 | Complete | b5fdb0f |
| PERF-02 | Phase 3 | Complete | 4931ff6 |
| PERF-03 | Phase 3 | Complete | e8fedc3 |
| PERF-04 | Phase 3 | Complete | 5ea16d3 |
| CLEAN-01 | Phase 4 | Complete | 44de169 |
| CLEAN-02 | Phase 4 | Complete | 44de169 |
| CLEAN-03 | Phase 4 | Complete | 44de169 |
| CLEAN-04 | Phase 4 | Complete | fefc60c |
| CLEAN-05 | Phase 4 | Complete | 7ba4c33 |
| CLEAN-06 | Phase 4 | Complete | cc8561e |
| CLEAN-07 | Phase 4 | Complete | ae144e2 |
| CLEAN-08 | Phase 4 | Complete | ae144e2 |
| DEP-01 | Phase 5 | Not Started | — |
| DEP-02 | Phase 5 | Complete | 4e6910f |
| DEP-03 | Phase 5 | Complete | bfe3ad3 |
| DEP-04 | Phase 5 | Not Started | — |
| DEP-05 | Phase 5 | Not Started | — |
| ENV-01 | Phase 5 | Complete | 7008400 |
| ENV-02 | Phase 5 | Complete | 7008400 |
| ENV-03 | Phase 5 | Complete | 7008400 |
| ENV-04 | Phase 5 | Complete | a48b90e |
| ENV-05 | Phase 5 | Complete | a48b90e |
| CONT-01 | Phase 6 | Not Started | — |
| CONT-02 | Phase 6 | Not Started | — |
| CONT-03 | Phase 6 | Not Started | — |
| CONT-04 | Phase 6 | Not Started | — |
| CONT-05 | Phase 6 | Not Started | — |
| CONT-06 | Phase 6 | Not Started | — |
| CONT-07 | Phase 6 | Not Started | — |
| CONT-08 | Phase 6 | Not Started | — |
| CONT-09 | Phase 6 | Not Started | — |
| CONT-10 | Phase 6 | Not Started | — |
| INT-01 | Phase 7 | Not Started | — |
| INT-02 | Phase 7 | Not Started | — |
| INT-03 | Phase 7 | Not Started | — |
| INT-04 | Phase 7 | Not Started | — |
| INT-05 | Phase 7 | Not Started | — |
| INT-06 | Phase 7 | Not Started | — |
| INT-07 | Phase 7 | Not Started | — |
| INT-08 | Phase 7 | Not Started | — |
| INT-09 | Phase 7 | Not Started | — |
| INT-10 | Phase 7 | Not Started | — |
| INT-11 | Phase 7 | Not Started | — |
| INT-12 | Phase 7 | Not Started | — |
| FREE-01 | Phase 8 | Not Started | — |
| FREE-02 | Phase 8 | Not Started | — |
| FREE-03 | Phase 8 | Not Started | — |
| FREE-04 | Phase 8 | Not Started | — |
| FREE-05 | Phase 8 | Not Started | — |
| FREE-06 | Phase 8 | Not Started | — |
| FREE-07 | Phase 8 | Not Started | — |
| FREE-08 | Phase 8 | Not Started | — |
| FREE-09 | Phase 8 | Not Started | — |
| FREE-10 | Phase 8 | Not Started | — |
| FREE-11 | Phase 8 | Not Started | — |
| FREE-12 | Phase 8 | Not Started | — |
| FREE-13 | Phase 8 | Not Started | — |
| FREE-14 | Phase 8 | Not Started | — |
| FREE-15 | Phase 8 | Not Started | — |
| FREE-16 | Phase 8 | Not Started | — |
| FREE-17 | Phase 8 | Not Started | — |
| FREE-18 | Phase 8 | Not Started | — |

**v1 coverage:**

- v1 requirements: 23 total
- Mapped to phases: 23 ✓
- Complete: 23 ✓
- Pending: 0

**v2 coverage:**

- v2 requirements: 40 total
- Mapped to phases: 40 ✓ (Phase 5: 10, Phase 6: 10, Phase 7: 12, Phase 8: 18)
- Complete: 7 (DEP-02, DEP-03, ENV-01, ENV-02, ENV-03, ENV-04, ENV-05)
- Pending: 33

---

*v1 requirements defined: 2026-05-06; complete 2026-05-06.*
*v2 requirements defined: 2026-05-12 — milestone v2.0 Polish, Integrations & Freelance.*
*v2 roadmap mapped: 2026-05-12.*
