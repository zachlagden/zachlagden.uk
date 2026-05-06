---
status: complete
quick_id: 260506-ew4
description: CLEAN-04 — useAutoSave quota-safe + restore-on-mount
date: 2026-05-06
commit: fefc60c
---

# Summary 260506-ew4

Single atomic commit `fefc60c`: `fix(autosave): wrap setItem in try/catch and wire restore-on-mount`.

`useAutoSave` now catches QuotaExceededError and exposes an `error` field. `BlogEditor` reads the autosave on mount and shows a Restore/Discard banner if a draft exists and differs from current state. Quota errors surface as a red banner.

Verification: `pnpm tsc --noEmit && pnpm lint` both 0.

Resolves CLEAN-04 (CONCERNS.md #21).
