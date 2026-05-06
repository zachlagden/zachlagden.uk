---
status: complete
quick_id: 260506-exp
description: CLEAN-05 — invoke ensureIndexes on first DB use
date: 2026-05-06
---

# Plan 260506-exp

## Goal

Make `ensureIndexes` actually run. Resolves **CLEAN-05** (CONCERNS.md #22).

## Task

`src/lib/blog.ts`:
- Replace the unused `ensureIndexes` export with an internal `ensureIndexesOnce(col)` guarded by a module-scope `indexesEnsured: Promise<void> | null`
- Split `postsCollection()` into `rawPostsCollection()` (no index guard) + public `postsCollection()` (calls `ensureIndexesOnce` then returns col)
- On error: log via `console.warn`, reset the cached promise so a future call retries; do NOT rethrow (queries work without indexes, just slower)

`createIndex` is idempotent in MongoDB, so first process call creates them and all later calls are no-ops.

## Verification

`pnpm tsc --noEmit && pnpm lint` — both 0.

## Commit

`fix(blog): ensure indexes on first DB use`
