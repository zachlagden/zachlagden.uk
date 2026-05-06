---
status: complete
quick_id: 260506-et0
description: PERF-04 — BlogSearch skip initial empty-query fetch
date: 2026-05-06
commit: 5ea16d3
---

# Summary 260506-et0

Single atomic commit `5ea16d3`: `perf(blog): skip BlogSearch initial empty-query fetch`.

`BlogSearch.tsx` adds a first-run ref so the debounce effect bails out on initial mount. Real user input still triggers the 300ms debounced `onSearch`.

Verification: `pnpm tsc --noEmit && pnpm lint` both 0.

Resolves PERF-04 (CONCERNS.md #11).
