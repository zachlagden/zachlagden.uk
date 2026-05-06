# Requirements: zachlagden.uk

**Defined:** 2026-05-06
**Core Value:** The site renders correctly and stays up — no blank pages, no 500s, regardless of MongoDB availability or transient runtime errors.

## v1 Requirements

Stabilisation milestone. Each requirement maps to one CONCERNS.md entry in `.planning/codebase/CONCERNS.md`.

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
- [x] **CLEAN-02**: `src/utils/contentLoader.ts` trimmed to only the imported `formatDate`/`formatDateRange` exports (the original CONCERNS claim that those were unused was wrong) (CONCERNS #13)
- [x] **CLEAN-03**: `pnpm-workspace.yaml` deleted; `onlyBuiltDependencies` relocated to `package.json` `pnpm` key (CONCERNS #24)
- [x] **CLEAN-04**: `useAutoSave` wraps `localStorage.setItem` in try/catch and surfaces quota errors; restore-on-mount wired into `BlogEditor` (CONCERNS #21)
- [x] **CLEAN-05**: `ensureIndexes()` invoked on first DB use via lazy guard in `postsCollection()` so blog queries get the documented indexes (CONCERNS #22)
- [x] **CLEAN-06**: `eslint.config.mjs` enforces `react-hooks/exhaustive-deps: "error"` and `@typescript-eslint/no-floating-promises: "error"` with all violations fixed (CONCERNS #25)
- [x] **CLEAN-07**: Sitemap `lastModified` uses real change dates — `BUILD_DATE` constant for static pages, `post.updatedAt` for blog (CONCERNS #31)
- [x] **CLEAN-08**: Markdown heading IDs generated via `rehype-slug`; `TableOfContents` consumes the same `github-slugger` algorithm (CONCERNS #30)

## v2 Requirements

Acknowledged but deferred to a later milestone.

### Testing

- **TEST-01**: Vitest + integration tests for `src/lib/auth.ts` (security-critical) and `src/lib/blog.ts` (data correctness)
- **TEST-02**: Smoke tests for the intro animation state machine and `useSectionObserver` / `useParallax` hooks

### Infrastructure

- **INFRA-01**: Migrate `public/uploads/` to Cloudflare R2 (or another S3-compatible store) so uploads survive redeploys without volume config

### Polish

- ✓ **POLISH-01**: `BlogPagination` windowed pagination with `…` truncation — shipped (commit 21807e1)
- ✓ **POLISH-02**: `BlogPostCard` `sizes` tuned for 3-column lg grid — shipped (commit 21807e1)
- ✓ **POLISH-03**: `not-found.tsx` hides "Go Back" unless same-origin referrer — shipped (commit 21807e1)
- **POLISH-04**: Framer Motion usage audited; trivial fades replaced by CSS keyframes from `globals.css` (CONCERNS #20) — *deferred: ~30 files of state-dependent animation; bigger than polish, defer to a dedicated refactor*
- ✓ **POLISH-05**: OG/Twitter/icon PNGs re-compressed via sharp palette quantization — shipped (commit 297aedf, ~290 KB saved)
- ✓ **POLISH-06**: TypeScript `target` ES2017 → ES2022 — shipped (commit 21807e1)

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

| Requirement | Phase | Status | Commit |
|-------------|-------|--------|--------|
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

**Coverage:**
- v1 requirements: 23 total
- Mapped to phases: 23 ✓
- Complete: 23 ✓
- Pending: 0

---
*Requirements defined: 2026-05-06*
*Last updated: 2026-05-06 after milestone close (all v1 requirements complete)*
