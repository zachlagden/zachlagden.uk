---
status: complete
quick_id: 260506-f2v
description: CLEAN-07 + CLEAN-08 — rehype-slug headings and real sitemap dates
date: 2026-05-06
commit: ae144e2
---

# Summary 260506-f2v

Single atomic commit `ae144e2`: `fix(blog): rehype-slug for headings + real sitemap dates`.

## CLEAN-08

`MarkdownRenderer` now uses `rehype-slug` so headings with inline markdown still get IDs. `TableOfContents` uses `github-slugger` directly so anchor links match.

Added `rehype-slug@^6.0.0` and `github-slugger@^2.0.0` runtime deps.

## CLEAN-07

Sitemap blog URLs now use `post.updatedAt`. Static URLs use a stable per-process `BUILD_DATE` constant (configurable via `process.env.BUILD_DATE` for true build-time stamping).

Added `getAllPublishedSlugsWithDates` in `src/lib/blog.ts`.

## Verification

`pnpm tsc --noEmit && pnpm lint` both 0.

## Resolves

- CLEAN-07 (CONCERNS.md #31)
- CLEAN-08 (CONCERNS.md #30)

## Phase 4 status: complete (8/8). All v1 requirements done (23/23).
