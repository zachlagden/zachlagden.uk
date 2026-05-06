---
status: complete
quick_id: 260506-exp
description: CLEAN-05 — invoke ensureIndexes on first DB use
date: 2026-05-06
commit: 7ba4c33
---

# Summary 260506-exp

Single atomic commit `7ba4c33`: `fix(blog): ensure indexes on first DB use`.

`src/lib/blog.ts` now ensures the four documented indexes (unique slug, status+publishedAt, tags, author) on the first call to `postsCollection()`. The guard caches the index-creation promise so subsequent calls are no-ops. On failure, it logs and resets the cache so the next call retries.

Verification: `pnpm tsc --noEmit && pnpm lint` both 0.

Resolves CLEAN-05 (CONCERNS.md #22).
