---
status: complete
quick_id: 260506-eyt
description: CLEAN-06 — ESLint exhaustive-deps + no-floating-promises
date: 2026-05-06
---

# Plan 260506-eyt

## Goal

Enforce stricter lint rules + fix the violations they surface. Resolves **CLEAN-06** (CONCERNS.md #25).

## Tasks

`eslint.config.mjs`:
- Add a config block scoped to `src/**/*.{ts,tsx}` with `languageOptions.parserOptions.projectService: true` for type-aware linting (config files keep the syntactic parser to avoid project-info errors)
- Set `react-hooks/exhaustive-deps: "error"`
- Set `@typescript-eslint/no-floating-promises: "error"`

Fix the 6 violations the type-aware run surfaces:
- `src/app/blog/BlogListClient.tsx` (3 sites): fire-and-forget `fetchPosts(...)` calls — prefix with `void`
- `src/components/admin/ImageUpload.tsx` (2 sites): fire-and-forget `upload(file)` calls — prefix with `void`
- `src/utils/viewTransition.ts` (1 site): fire-and-forget `updateWithTransition(...)` — prefix with `void`

## Verification

`pnpm tsc --noEmit && pnpm lint` — both 0.

## Commit

`chore(lint): enforce exhaustive-deps and no-floating-promises`
