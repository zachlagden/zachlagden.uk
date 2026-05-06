---
status: complete
quick_id: 260506-frq
description: POLISH-01..03 + POLISH-06 — deferred polish batch
date: 2026-05-06
---

# Plan 260506-frq

## Goal

Ship the small v2 polish items now that the v1 stabilisation milestone is closed. POLISH-04 (Framer Motion audit) and POLISH-05 (image recompression) remain deferred — they need broader scope and tooling not present in this pass.

## Tasks (one atomic commit)

- **POLISH-01** (CONCERNS #28) — `src/components/blog/BlogPagination.tsx`: replace linear N-button render with windowed list (first / `…` / current ± 1 / `…` / last). Keep full list for ≤ 7 pages.
- **POLISH-02** (CONCERNS #29) — `src/components/blog/BlogPostCard.tsx`: `sizes` updated to `(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw` to match the 3-column lg grid.
- **POLISH-03** (CONCERNS #27) — `src/app/not-found.tsx`: render "Go Back" only when a same-origin referrer exists. Use `useSyncExternalStore` for SSR-safe derivation (avoids `react-hooks/set-state-in-effect` lint).
- **POLISH-06** (CONCERNS #26) — `tsconfig.json`: `target` ES2017 → ES2022.

## Verification

`pnpm tsc --noEmit && pnpm lint` — both 0.

## Commit

`polish: ship deferred v2 polish items`
