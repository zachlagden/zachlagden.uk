# Roadmap: zachlagden.uk Stabilisation

## Overview

Brownfield stabilisation milestone for a Next.js 16 portfolio + blog. Three HIGH-severity items (BlogEditor render loop, MongoDB-down guards, Sentry removal) were already fixed inline before this roadmap was written and are recorded in PROJECT.md's Validated section. The 23 remaining v1 requirements harden the codebase across four phases: first restoring runtime safety nets (error boundaries + intro animation race fixes), then closing the security and documentation surface, then fixing the React performance bugs in shared hooks/components, and finally cleaning up dead code, wiring up dormant features (autosave restore, DB indexes), and turning on the ESLint rules that prevent regression. Phase 4 must come last because the ESLint enforcement step depends on Phase 3 hook fixes already being merged.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Runtime Stability** - Error boundaries restored and the cinematic intro animation can no longer leave the site permanently locked
- [ ] **Phase 2: Security & Documentation** - Markdown XSS surface, security headers, auth failure visibility, SVG upload risk, and the lying README are all addressed
- [ ] **Phase 3: Performance Hardening** - Hot-path React hooks and components stop thrashing on every render and stop wasting requests
- [ ] **Phase 4: Cleanup & Tooling** - Dead code removed, dormant features wired up, sitemap honesty restored, and ESLint enforces the rules that would have caught these bugs

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
**Plans**: TBD

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
**Plans**: TBD

### Phase 3: Performance Hardening
**Goal**: Hot-path hooks and components stop wasting renders, listeners, and requests
**Depends on**: Phase 2
**Requirements**: PERF-01, PERF-02, PERF-03, PERF-04
**Success Criteria** (what must be TRUE):
  1. Scrolling on the home page no longer tears down and rebuilds the `IntersectionObserver` on every render — `sectionRefs` is stable and `useSectionObserver` re-runs only when a referenced element actually changes
  2. With the home tab in the background, the `PresenceStatus` component issues zero requests to `api.lagden.dev`; in the foreground it polls at 30s base and applies exponential backoff on consecutive errors
  3. The custom cursor's hover-style listener fires on dynamically added interactive elements (e.g. mobile menu buttons, blog pagination buttons mounted after first paint) without re-attaching listeners every time the cursor enters the viewport
  4. Loading `/blog` issues no extra request from `BlogSearch` on initial mount — the empty-query debounce no longer duplicates the SSR data
**Plans**: TBD

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
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Runtime Stability | 0/TBD | Not started | - |
| 2. Security & Documentation | 0/TBD | Not started | - |
| 3. Performance Hardening | 0/TBD | Not started | - |
| 4. Cleanup & Tooling | 0/TBD | Not started | - |
