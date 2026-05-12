# Roadmap: zachlagden.uk

## Overview

v1 (phases 1–4, 23 requirements) stabilised a brownfield Next.js 16 portfolio + blog: error boundaries, security headers, sanitised markdown, perf fixes, dead-code cleanup, type-aware lint. All 23 v1 reqs shipped 2026-05-06; status frozen in the Traceability table.

**v2.0 — Polish, Integrations & Freelance** is the post-stabilisation evolution. Four serial phases (5 → 6 → 7 → 8) extend the stabilised base across one mutable surface (`public/content.json` + `src/types/content.ts`) and one verification floor (`tsc --noEmit && pnpm lint && pnpm build` per batch — `pnpm build` added beyond v1 to catch Turbopack/Coolify regressions). Three small libraries land (`@octokit/graphql`, `schema-dts` type-only, `knip` dev-only); no framework migrations, no test framework, no Sentry, no observability — those remain out of scope. Deferred-from-v1 items (TEST-01/02, INFRA-01, POLISH-04) stay deferred to v3.

Phase ordering is HARD-serial, not preference. Phase 5 provisions `GITHUB_PAT` that Phase 7 needs. Phase 6's `birthday`-strip pattern must be solid before Phase 8 introduces `Service` JSON-LD (another DOB leak surface). All three later phases (6, 7, 8) extend the same JSON schema — serial execution prevents drift and keeps `tsc --noEmit` honest. Phase numbering continues from v1; there is no reset.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3, 4): v1 stabilisation — complete
- Integer phases (5, 6, 7, 8): v2.0 milestone — this roadmap
- Decimal phases (e.g. 5.1): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

**v1 (complete):**
- [x] **Phase 1: Runtime Stability** - Error boundaries restored and the cinematic intro animation can no longer leave the site permanently locked
- [x] **Phase 2: Security & Documentation** - Markdown XSS surface, security headers, auth failure visibility, SVG upload risk, and the lying README are all addressed
- [x] **Phase 3: Performance Hardening** - Hot-path React hooks and components stop thrashing on every render and stop wasting requests
- [x] **Phase 4: Cleanup & Tooling** - Dead code removed, dormant features wired up, sitemap honesty restored, and ESLint enforces the rules that would have caught these bugs

**v2.0:**
- [ ] **Phase 5: Dependency Hardening + Env Config** - All 44 Dependabot alerts resolved, env vars audited against Coolify, `GITHUB_PAT` provisioned for Phase 7, runbooks captured
- [ ] **Phase 6: Content Refresh + Auto-age** - `personal.birthday` server-only field + computed `age` injected at the loader chokepoint, hardcoded ages templated, ISR daily revalidate on `/`, full copy audit
- [ ] **Phase 7: Integrations + /stats + /now** - GitHub heatmap + pinned repos (public + private contributions via PAT), Tokscale SVG embed, `/stats` route with per-source fallback, `/now` page with staleness banner
- [ ] **Phase 8: Freelance Offering** - `/freelance` page with 3+1 pricing, "What I don't do", Cal.com CTAs with GA events, `Service` JSON-LD cross-ref'd to `Person`, robots.txt AI-bot allow rules, `/freelance.md` machine-readable mirror

## Phase Details

### Phase 1: Runtime Stability
**Goal**: A runtime error or stalled font load can never leave a visitor staring at a blank page or a permanently scroll-locked body
**Depends on**: Nothing (first phase)
**Requirements**: STAB-01, STAB-02, STAB-03, STAB-04, STAB-05
**Success Criteria** (what must be TRUE):
  1. A thrown error inside any client component on `/`, `/blog`, or `/blog/[slug]` renders the `app/error.tsx` recovery UI (with "Try again" + "Back to Home" affordances and a `console.error` log) instead of Next's default fallback or a white screen
  2. An error thrown from inside the root layout renders `app/global-error.tsx` (with its own `<html><body>` wrapper) instead of unmounting the app
  3. Loading the home page on a network where `document.fonts.ready` never resolves still drops `intro-locked` and starts the cinematic intro within 5 seconds; the body is never stuck `overflow: hidden` indefinitely
  4. Navigating away from `/` mid-intro produces no `setState on unmounted component` warning in the console — the cancelled flag is honoured inside the rAF callback
  5. The `intro-locked` class is removed from a single canonical hook/component; `Header`, `ClearIntro`, the three layouts, and `signin/page.tsx` no longer each carry their own copy of the removal logic
**Plans**: Complete (v1)

### Phase 2: Security & Documentation
**Goal**: The blog/admin attack surface is hardened and the README accurately describes how to run the project
**Depends on**: Phase 1
**Requirements**: SEC-01, SEC-02, SEC-03, SEC-04, SEC-05, DOC-01
**Success Criteria** (what must be TRUE):
  1. A blog post containing raw `<script>`, `<svg onload=...>`, or `<a href="javascript:...">` markdown renders as inert text — `MarkdownRenderer` invokes `rehypeSanitize` with an explicit allow-list schema, not the default
  2. A response from any route in production includes `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, and a CSP that permits GA + same-origin; `X-Powered-By` is absent because `poweredByHeader: false`
  3. Booting the app with a missing or unreachable `MONGODB_URI` writes a clearly-formatted `console.error` from `getAdapter()` instead of silently degrading to JWT-only sessions
  4. The blog upload endpoint rejects SVGs and rejects files whose magic-number signature does not match an allowed image type, regardless of the client-claimed `file.type`
  5. A new contributor can clone the repo, follow the README, and get the full app (blog, admin, OAuth, MongoDB, Coolify deployment) running locally — required env vars (`MONGODB_URI`, `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `ADMIN_GITHUB_USERNAME`) and optional `NEXT_PUBLIC_GA_ID` are documented, and the README no longer claims "no env vars required"
**Plans**: Complete (v1)

### Phase 3: Performance Hardening
**Goal**: Hot-path hooks and components stop wasting renders, listeners, and requests
**Depends on**: Phase 2
**Requirements**: PERF-01, PERF-02, PERF-03, PERF-04
**Success Criteria** (what must be TRUE):
  1. Scrolling on the home page no longer tears down and rebuilds the `IntersectionObserver` on every render — `sectionRefs` is stable and `useSectionObserver` re-runs only when a referenced element actually changes
  2. With the home tab in the background, the `PresenceStatus` component issues zero requests to `api.lagden.dev`; in the foreground it polls at 30s base and applies exponential backoff on consecutive errors
  3. The custom cursor's hover-style listener fires on dynamically added interactive elements (e.g. mobile menu buttons, blog pagination buttons mounted after first paint) without re-attaching listeners every time the cursor enters the viewport
  4. Loading `/blog` issues no extra request from `BlogSearch` on initial mount — the empty-query debounce no longer duplicates the SSR data
**Plans**: Complete (v1)

### Phase 4: Cleanup & Tooling
**Goal**: Dead code is gone, dormant features are wired up, and ESLint enforces the rules that would have caught these regressions in the first place
**Depends on**: Phase 3 (CLEAN-06's `react-hooks/exhaustive-deps` enforcement requires the Phase 3 hook fixes to already be merged so `pnpm lint` does not regress)
**Requirements**: CLEAN-01, CLEAN-02, CLEAN-03, CLEAN-04, CLEAN-05, CLEAN-06, CLEAN-07, CLEAN-08
**Success Criteria** (what must be TRUE):
  1. `src/components/ui/AnimatedText.tsx`, `src/utils/contentLoader.ts`, and `pnpm-workspace.yaml` are gone from the tree, and `split-type` is gone from `package.json` if no remaining importer uses it
  2. The blog editor restores the autosaved draft on mount with a "restore unsaved draft?" prompt, and `localStorage.setItem` is wrapped in try/catch so a `QuotaExceededError` surfaces a user-visible message instead of crashing autosave
  3. The first DB query of a fresh process triggers `ensureIndexes()` exactly once (lazy guard inside `getDb`), so the documented blog indexes (slug unique, status+publishedAt, tags, author) actually exist in production
  4. `pnpm lint` runs clean with `react-hooks/exhaustive-deps: "error"` and `@typescript-eslint/no-floating-promises: "error"` enforced; existing violations are fixed, not suppressed
  5. The sitemap reports honest `lastModified` values (build timestamp for static pages, `post.updatedAt` for blog posts) and the `TableOfContents` anchors resolve to the same heading IDs that `MarkdownRenderer` emits via `rehype-slug`
**Plans**: Complete (v1)

### Phase 5: Dependency Hardening + Env Config
**Goal**: Dependabot is green, Coolify env vars are reconciled with `.env.example`, `GITHUB_PAT` is available for Phase 7, and the runbooks future-Zach will need (env audit, Cloudflare cache, auth smoke test) are written down
**Depends on**: Phase 4 (v1 stabilisation — type-aware lint and intro animation race fixes must be in place before mass dep bumps can land safely)
**Requirements**: DEP-01, DEP-02, DEP-03, DEP-04, DEP-05, ENV-01, ENV-02, ENV-03, ENV-04, ENV-05
**Success Criteria** (what must be TRUE):
  1. GitHub Dependabot alerts page for the repo shows **0 open alerts on `main`** (all 19 high + 19 moderate + 6 low resolved); `pnpm audit` reports 0 high/critical and 0 moderate locally and in CI
  2. Admin signs into `/admin/blog` in production via GitHub OAuth and reaches the editor (`AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` populated in Coolify); the manual sign-in flow documented in `.planning/runbooks/AUTH-SMOKE-TEST.md` passes end-to-end
  3. `.planning/runbooks/ENV-VARS.md` lists every env var with a present/missing/obsolete column reconciled against `.env.example` and Coolify; `GITHUB_PAT` (fine-grained, "No repository access" + "Profile: Read-only", ≤1y expiry) appears under "present" for the Phase 7 hand-off
  4. `.github/dependabot.yml` ignores `next-auth` (beta-to-beta) and limits `framer-motion` to patch-only bumps so future automated PRs cannot regress the intro state machine or OAuth contract; per-batch verification floor (`tsc --noEmit && pnpm lint && pnpm build`) is enforced before each batch merges, with failures rolled back
  5. `knip` is installed as a devDep and a baseline run is captured in `.planning/runbooks/KNIP-BASELINE.md` for v3 regression comparison; `.planning/runbooks/CLOUDFLARE.md` documents the full-proxy / cache-rules / cache-purge procedure so Next `Cache-Control` is honoured end-to-end
**Plans**: 5 plans
- [x] 05-01-PLAN.md — Harden .github/dependabot.yml (ignore next-auth all updates, framer-motion non-patch, pnpm major) — DEP-03
- [x] 05-02-PLAN.md — Install knip devDep + capture verbatim v2-open baseline at .planning/runbooks/KNIP-BASELINE.md — DEP-02
- [x] 05-03-PLAN.md — Coolify env audit + populate AUTH_GITHUB_ID/AUTH_GITHUB_SECRET + provision fine-grained GITHUB_PAT + write ENV-VARS.md three-column table — ENV-01, ENV-02, ENV-03
- [x] 05-04-PLAN.md — Author AUTH-SMOKE-TEST.md (six-step text-only) + CLOUDFLARE.md (DNS-only AS-IS + parameterised proxied block); execute smoke test against prod — ENV-04, ENV-05
- [ ] 05-05-PLAN.md — Execute four Dependabot batches A→B→C→D (dev / Next+React+Mongo / framer-motion alone / transitive cleanup) with verification floor + pnpm dedupe + pnpm audit per batch; Batch C gated by three-state home-route smoke test — DEP-01, DEP-04, DEP-05

### Phase 6: Content Refresh + Auto-age
**Goal**: The site's static content stops drifting — age computes from a single server-side `personal.birthday` field, hardcoded ages are gone, copy is current and consistent British English, and the build provably never ships the DOB to the client
**Depends on**: Phase 5 (env runbooks established; brings content.json schema-edit discipline online before Phases 7/8 stack more fields onto the same surface)
**Requirements**: CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06, CONT-07, CONT-08, CONT-09, CONT-10
**Success Criteria** (what must be TRUE):
  1. The About section on `/` displays the visitor's currently-correct age, computed at request time from a single server-only `personal.birthday: "YYYY-MM-DD"` field using `src/utils/age.ts` (`Intl.DateTimeFormat` with `timeZone: "Europe/London"`, native `Date`, no library deps); no hardcoded age literal ("18-year-old", etc.) remains in any component or `content.json` copy
  2. `grep -r "birthday" .next/static/` returns **empty** after a fresh `pnpm build` — the `Personal` interface is type-split so `birthday` exists only on the server-only variant; `loadContentServer` is the single chokepoint that strips it before returning ContentData to client islands
  3. `/` rebuilds daily without manual redeploy — `export const revalidate = 86400` is declared on the home route, and `pnpm build` output classifies `/` as **ISR** (not pure Static); on rollover into the next birthday, the next request after revalidation shows the incremented age
  4. About-section tagline, skills, experience entries, and metadata are refreshed against user-supplied current values; a manual British English consistency pass is recorded; certifications are confirmed untouched (already accurate per user)
  5. `.planning/runbooks/CONTENT-AUDIT-2026-05.md` captures the audit decision log (what changed, what didn't, why) so future content edits inherit context rather than re-litigate
**Plans**: TBD
**UI hint**: yes

### Phase 7: Integrations + /stats + /now
**Goal**: `/stats` shows live (cached) GitHub activity + Tokscale embed + presence ticker behind a per-source fallback strategy that survives any single integration outage; `/now` page exists with a staleness-aware lifecycle; both are linked from the footer (not primary nav) with a small homepage teaser
**Depends on**: Phase 6 (content.json schema discipline established) and Phase 5 (`GITHUB_PAT` provisioned in Coolify env)
**Requirements**: INT-01, INT-02, INT-03, INT-04, INT-05, INT-06, INT-07, INT-08, INT-09, INT-10, INT-11, INT-12
**Success Criteria** (what must be TRUE):
  1. Visiting `/stats` renders the GitHub heatmap (53×7 SVG, canonical 5-bucket green palette in light + dark, year selector, day-cell tooltip), pinned repos in an auto-balanced grid that looks correct at 0 / 1 / 3 / 6 cards, the Tokscale SVG embed, and the existing presence ticker — composed via `Promise.allSettled` so a single integration outage degrades that panel only and leaves the rest of the page intact
  2. When a GitHub or Tokscale fetch fails (rate-limit, 5xx, network), the affected panel shows its own fallback graphic instead of taking down `/stats`; uncaught failures within the subtree are caught by `src/app/stats/error.tsx` rather than bubbling to the root error boundary
  3. `getGitHubStats()` is wrapped in `unstable_cache` with `revalidate: 3600`, uses `@octokit/graphql` with `contributionsCollection` (public + private via the Phase-5 PAT) + `pinnedItems` + live star/fork counts in a single request, and the request count never approaches the 5000/hr authenticated GitHub rate limit even under refresh-button abuse
  4. `/now` renders `content.now` from `content.json`, shows a visible staleness banner when `lastUpdated` is older than 90 days, and emits `<meta name="robots" content="noindex">` when older than 180 days — pure static otherwise; both `/stats` and `/now` appear in `src/app/sitemap.ts` and are linked from the site footer (not the primary header nav)
  5. The homepage `StatsTeaser` tile (commits this year, top language, current streak) links out to `/stats`; it lives outside the section / keyboard-nav system so it can't break the home keyboard shortcut behaviour
**Plans**: TBD
**UI hint**: yes

### Phase 8: Freelance Offering
**Goal**: `/freelance` exists with Linear/Plain/Vercel-style direct tone, visible pricing tiers, a "What I don't do" filter, Cal.com CTAs tied to GA events, `Service` JSON-LD cross-referenced to `Person` via `@graph`, a machine-readable `/freelance.md` mirror for AI agent vendor-evaluation, and AI-bot-friendly robots.txt
**Depends on**: Phase 6 (computed age + `birthday`-strip pattern reused; copy references age), Phase 7 (inherits `unstable_cache` + typed-JSON-LD patterns), Phase 5 (verification floor)
**Requirements**: FREE-01, FREE-02, FREE-03, FREE-04, FREE-05, FREE-06, FREE-07, FREE-08, FREE-09, FREE-10, FREE-11, FREE-12, FREE-13, FREE-14, FREE-15, FREE-16, FREE-17, FREE-18
**Success Criteria** (what must be TRUE):
  1. Visiting `/freelance` shows a direct 5–10-word H1, visible pricing above the fold (3+1 layout — Starter £750 / Standard £1,800 / Pro from £3,500 in a row, AI Integration from £1,500 as a separate add-on row below; no "Most popular" highlight in v2), "What I do" services, "What I don't do" 4–6 lowercase bullets between pricing and "How it works", the 4-step "How it works" (Book call → Quote → Build → Launch), "Areas I cover" bounded to ≤15-mile radius around Ascot, the "Past work available on request" line, and a final Cal.com CTA — all read from `content.json`, no hardcoded prices or links in components
  2. Clicking any Cal.com CTA fires `sendGAEvent('freelance_cta_click', { placement })` via `@next/third-parties` with a PII-free click-only payload; the Cal.com URL resolves from a single `content.personal.freelance.calLink` read site; the homepage `AvailabilityCallout` shows when `personal.freelance.available === true` and hides entirely when false, with a build-time `console.warn` if `availability.asOf` is older than 30 days
  3. Google's Rich Results Test passes the page's structured data: `Person` and `Service` JSON-LD are composed in `@graph` with a stable `@id` cross-ref, typed via `schema-dts`; `areaServed` lists the same towns as the on-page "Areas I cover" copy; no `birthDate` appears anywhere in the JSON-LD payload
  4. `robots.txt` (served by `src/app/robots.ts`) explicitly **allows** GPTBot, ClaudeBot, Claude-Web, PerplexityBot, CCBot, anthropic-ai, Google-Extended, Applebot-Extended, and **disallows** `/admin` and `/api` for `*`; `/freelance.md` returns `text/markdown` content derived from `content.json` (dynamic route handler, not pre-build codegen) so AI agents evaluating vendors get the machine-readable mirror; `/freelance` is added to the header navigation and `src/app/sitemap.ts`
  5. `.planning/runbooks/PRICING-RATIONALE.md` captures peer comparison data (≥3 Berkshire-area senior dev rates) and the market-positioning logic so the tiers can be adjusted later with context rather than guesswork
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**

v1 phases execute in numeric order: 1 → 2 → 3 → 4 (complete).
v2 phases execute in numeric order: 5 → 6 → 7 → 8 (serial, hard — no parallelisation).

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Runtime Stability | n/a (quick batch) | Complete | 2026-05-06 |
| 2. Security & Documentation | n/a (quick batch) | Complete | 2026-05-06 |
| 3. Performance Hardening | n/a (quick batch) | Complete | 2026-05-06 |
| 4. Cleanup & Tooling | n/a (quick batch) | Complete | 2026-05-06 |
| 5. Dependency Hardening + Env Config | 4/5 | In Progress|  |
| 6. Content Refresh + Auto-age | 0/TBD | Not started | - |
| 7. Integrations + /stats + /now | 0/TBD | Not started | - |
| 8. Freelance Offering | 0/TBD | Not started | - |
