---
status: complete
quick_id: 260506-euf
description: CLEAN-01..03 — delete dead code, dead deps, stale config
date: 2026-05-06
commit: 44de169
---

# Summary 260506-euf

Single atomic commit `44de169`: `chore: remove dead code, dead deps, and stale config`.

Resolved 3 cleanup requirements + 1 bonus fix:
- **CLEAN-01**: `src/components/ui/AnimatedText.tsx` deleted, `split-type` removed from `package.json`
- **CLEAN-02**: `src/utils/contentLoader.ts` trimmed to `formatDate`/`formatDateRange` only (the original CONCERNS doc claim that those were unused was wrong — three section components import them)
- **CLEAN-03**: `pnpm-workspace.yaml` deleted; `onlyBuiltDependencies` moved into `package.json` under `"pnpm"` key
- **Bonus**: `prettier` moved from `dependencies` to `devDependencies`

`pnpm install` updated the lockfile (net -1893 lines including the lockfile churn). `pnpm tsc --noEmit` and `pnpm lint` both 0.
