# Requirements: zachlagden.uk

**Defined:** 2026-05-06
**Core Value:** The site renders correctly and stays up — no blank pages, no 500s, regardless of MongoDB availability or transient runtime errors.

## v1 Requirements

Stabilisation milestone. Each requirement maps to one CONCERNS.md entry in `.planning/codebase/CONCERNS.md`.

### Stability

- [ ] **STAB-01**: Root error boundary at `src/app/error.tsx` recovers from runtime errors with a "Try again" + "Back to Home" affordance and logs the error via `console.error` (CONCERNS #4)
- [ ] **STAB-02**: Global error boundary at `src/app/global-error.tsx` (with its own `<html><body>` wrapper) recovers from root-layout errors (CONCERNS #4)
- [ ] **STAB-03**: Intro animation has a 5-second fallback when `document.fonts.ready` stalls; the body never stays `intro-locked` indefinitely (CONCERNS #7)
- [ ] **STAB-04**: Intro `requestAnimationFrame` callback respects the cancelled flag and never calls `setState` after unmount (CONCERNS #7)
- [ ] **STAB-05**: `intro-locked` class is removed from a single canonical location instead of being duplicated across `Header`, `ClearIntro`, three layouts, and `signin/page.tsx` (CONCERNS #14)

### Security

- [ ] **SEC-01**: `MarkdownRenderer` invokes `rehypeSanitize` with an explicit allow-list schema, not the default schema (CONCERNS #3)
- [ ] **SEC-02**: `next.config.ts` returns security headers — at minimum `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, and a CSP that allows GA + same-origin (CONCERNS #15)
- [ ] **SEC-03**: `next.config.ts` sets `poweredByHeader: false` (CONCERNS #15)
- [ ] **SEC-04**: `getAdapter()` in `src/lib/auth.ts` logs the underlying error with `console.error` instead of silently returning `undefined` (CONCERNS #17)
- [ ] **SEC-05**: SVG removed from upload allow-list in `src/app/api/blog/upload/route.ts`, and uploaded file MIME is validated by magic-number sniff, not client-claimed `file.type` (CONCERNS #18)

### Documentation

- [ ] **DOC-01**: `README.md` documents required env vars (`MONGODB_URI`, `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `ADMIN_GITHUB_USERNAME`), optional vars (`NEXT_PUBLIC_GA_ID`), MongoDB dependency, GitHub OAuth setup, Coolify deployment, and the blog/admin features (CONCERNS #5)

### Performance

- [ ] **PERF-01**: `useSectionObserver` no longer rebuilds its `IntersectionObserver` on every render of `HomeClient` — `sectionRefs` is stable (CONCERNS #9)
- [ ] **PERF-02**: `PresenceStatus` polls at 30s base, pauses when `document.hidden`, and applies exponential backoff on consecutive errors (CONCERNS #8)
- [ ] **PERF-03**: `CustomCursor` uses event delegation on `document.body` so dynamically-added interactive elements are covered (CONCERNS #10)
- [ ] **PERF-04**: `BlogSearch` skips its initial empty-query fetch (CONCERNS #11)

### Cleanup

- [ ] **CLEAN-01**: `src/components/ui/AnimatedText.tsx` deleted; `split-type` removed from `package.json` if no remaining importer (CONCERNS #12)
- [ ] **CLEAN-02**: `src/utils/contentLoader.ts` deleted (CONCERNS #13)
- [ ] **CLEAN-03**: `pnpm-workspace.yaml` deleted (CONCERNS #24)
- [ ] **CLEAN-04**: `useAutoSave` wraps `localStorage.setItem` in try/catch and surfaces quota errors; restore-on-mount wired into `BlogEditor` (CONCERNS #21)
- [ ] **CLEAN-05**: `ensureIndexes()` invoked on first DB use (e.g. lazy guard inside `getDb`) so blog queries get the documented indexes (CONCERNS #22)
- [ ] **CLEAN-06**: `eslint.config.mjs` enforces `react-hooks/exhaustive-deps: "error"` and `@typescript-eslint/no-floating-promises: "error"` with all violations fixed (CONCERNS #25)
- [ ] **CLEAN-07**: Sitemap `lastModified` uses real change dates (build timestamp for static pages, `post.updatedAt` for blog) instead of `new Date()` (CONCERNS #31)
- [ ] **CLEAN-08**: Markdown heading IDs generated via `rehype-slug`; `TableOfContents` consumes the same IDs (CONCERNS #30)

## v2 Requirements

Acknowledged but deferred to a later milestone.

### Testing

- **TEST-01**: Vitest + integration tests for `src/lib/auth.ts` (security-critical) and `src/lib/blog.ts` (data correctness)
- **TEST-02**: Smoke tests for the intro animation state machine and `useSectionObserver` / `useParallax` hooks

### Infrastructure

- **INFRA-01**: Migrate `public/uploads/` to Cloudflare R2 (or another S3-compatible store) so uploads survive redeploys without volume config

### Polish

- **POLISH-01**: `BlogPagination` shows first 2 / current ± 1 / last 2 with `…` truncation (CONCERNS #28)
- **POLISH-02**: `BlogPostCard` `sizes` tuned to actual 33vw column at `lg` breakpoint (CONCERNS #29)
- **POLISH-03**: `not-found.tsx` only shows "Go Back" when `document.referrer` is same-origin (CONCERNS #27)
- **POLISH-04**: Framer Motion usage audited; trivial fades replaced by CSS keyframes from `globals.css` (CONCERNS #20)
- **POLISH-05**: OG/Twitter PNGs re-compressed or converted to optimised JPEG/WebP (CONCERNS #19)
- **POLISH-06**: TypeScript `target` bumped to `ES2022` (CONCERNS #26)

## Out of Scope

Explicitly excluded from the stabilisation milestone.

| Feature | Reason |
|---------|--------|
| Reintroducing Sentry | User explicitly removed it; observability is a separate decision |
| Migrating to Vercel | Project deploys via Coolify per global instructions |
| Switching component library | Locked on Radix + shadcn + Tailwind |
| GraphQL API for the blog | REST-only per global instructions |
| Multi-author blog | Admin allow-list is single-user (`ADMIN_GITHUB_USERNAME`); markdown sanitiser tightening assumes trusted-author model |

## Traceability

Populated by the roadmapper.

| Requirement | Phase | Status |
|-------------|-------|--------|
| STAB-01 | Phase 1 | Pending |
| STAB-02 | Phase 1 | Pending |
| STAB-03 | Phase 1 | Pending |
| STAB-04 | Phase 1 | Pending |
| STAB-05 | Phase 1 | Pending |
| SEC-01 | Phase 2 | Pending |
| SEC-02 | Phase 2 | Pending |
| SEC-03 | Phase 2 | Pending |
| SEC-04 | Phase 2 | Pending |
| SEC-05 | Phase 2 | Pending |
| DOC-01 | Phase 2 | Pending |
| PERF-01 | Phase 3 | Pending |
| PERF-02 | Phase 3 | Pending |
| PERF-03 | Phase 3 | Pending |
| PERF-04 | Phase 3 | Pending |
| CLEAN-01 | Phase 4 | Pending |
| CLEAN-02 | Phase 4 | Pending |
| CLEAN-03 | Phase 4 | Pending |
| CLEAN-04 | Phase 4 | Pending |
| CLEAN-05 | Phase 4 | Pending |
| CLEAN-06 | Phase 4 | Pending |
| CLEAN-07 | Phase 4 | Pending |
| CLEAN-08 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 23 total
- Mapped to phases: 23 ✓
- Unmapped: 0

---
*Requirements defined: 2026-05-06*
*Last updated: 2026-05-06 after roadmap creation (traceability populated)*
