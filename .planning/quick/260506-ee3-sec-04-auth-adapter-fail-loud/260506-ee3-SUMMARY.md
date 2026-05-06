---
status: complete
quick_id: 260506-ee3
description: SEC-04 — auth adapter fail-loud logging
date: 2026-05-06
commit: 58daa80
---

# Summary 260506-ee3

Single atomic commit `58daa80`: `fix(auth): log MongoDB adapter init failure instead of silent fallback`.

`getAdapter()` in `src/lib/auth.ts` now logs the underlying error via `console.error` and explains the JWT-only fallback consequences before returning `undefined`. Behaviour is otherwise unchanged.

## Verification

- `pnpm tsc --noEmit` — exit 0
- `pnpm lint` — exit 0

## Resolves

- SEC-04 (CONCERNS.md #17)
