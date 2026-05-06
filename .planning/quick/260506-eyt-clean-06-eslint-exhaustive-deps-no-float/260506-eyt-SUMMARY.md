---
status: complete
quick_id: 260506-eyt
description: CLEAN-06 — ESLint exhaustive-deps + no-floating-promises
date: 2026-05-06
commit: cc8561e
---

# Summary 260506-eyt

Single atomic commit `cc8561e`: `chore(lint): enforce exhaustive-deps and no-floating-promises`.

`eslint.config.mjs` now scopes a type-aware block to `src/**/*.{ts,tsx}` with `parserOptions.projectService: true`, and bumps the two rules to error.

6 pre-existing floating-promise sites fixed with `void` prefix:
- `src/app/blog/BlogListClient.tsx` × 3 (search, tag, pagination handlers)
- `src/components/admin/ImageUpload.tsx` × 2 (drop and file change)
- `src/utils/viewTransition.ts` × 1 (scroll wrapper)

Verification: `pnpm tsc --noEmit && pnpm lint` both 0.

Resolves CLEAN-06 (CONCERNS.md #25).
