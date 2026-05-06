---
status: complete
quick_id: 260506-euf
description: CLEAN-01..03 — delete dead code, dead deps, stale config
date: 2026-05-06
---

# Plan 260506-euf

## Goal

Resolve **CLEAN-01**, **CLEAN-02**, **CLEAN-03** in one atomic commit (related housekeeping).

## Tasks

- **CLEAN-01** — Delete `src/components/ui/AnimatedText.tsx` (no importers). Drop `split-type` from `package.json` (only AnimatedText used it).
- **CLEAN-02** — Trim `src/utils/contentLoader.ts` to keep only `formatDate` and `formatDateRange` (CONCERNS doc was wrong about those being unused — three section files import them). Drop the unused `loadContent`/`getContent`.
- **CLEAN-03** — Delete `pnpm-workspace.yaml`. Move its `onlyBuiltDependencies` directive into `package.json` under `"pnpm"` key.
- **Bonus**: move `prettier` from `dependencies` to `devDependencies` (CONCERNS.md noted this misclassification but didn't list it as a separate requirement).

## Verification

- `pnpm install` — exit 0, lockfile updated, `split-type` removed
- `pnpm tsc --noEmit` — exit 0
- `pnpm lint` — exit 0

## Commit

`chore: remove dead code, dead deps, and stale config`
