---
status: complete
quick_id: 260506-frq
description: POLISH-01..03 + POLISH-06 — deferred polish batch
date: 2026-05-06
commit: 21807e1
---

# Summary 260506-frq

Single atomic commit `21807e1`: `polish: ship deferred v2 polish items`.

Resolved 4 v2 polish items in one pass:
- POLISH-01: windowed BlogPagination with `…` truncation
- POLISH-02: BlogPostCard `sizes` reflects actual 3-column grid
- POLISH-03: not-found "Go Back" hidden unless same-origin referrer (via `useSyncExternalStore`)
- POLISH-06: tsconfig target ES2017 → ES2022

POLISH-04 (Framer Motion audit) and POLISH-05 (image recompression) explicitly remain deferred.

Verification: `pnpm tsc --noEmit && pnpm lint` both 0.
