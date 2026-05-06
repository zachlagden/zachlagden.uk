---
status: complete
quick_id: 260506-elm
description: PERF-02 — PresenceStatus polling backoff + visibility gating
date: 2026-05-06
---

# Plan 260506-elm

## Goal

Replace 5-second `setInterval` polling with a self-rescheduling `setTimeout` loop that respects tab visibility and applies exponential backoff on consecutive errors. Resolves **PERF-02** (CONCERNS.md #8).

## Task

`src/components/ui/PresenceStatus.tsx`:

- Move polling constants to module scope (`BASE_INTERVAL_MS = 30_000`, `BACKOFF_STEPS_MS = [5s, 10s, 30s, 60s, 300s]`)
- `fetchData` returns `Promise<boolean>` indicating success
- New `consecutiveErrorsRef` tracks failure count
- `useEffect` body builds `tick()`/`schedule()` self-rescheduling loop, listens to `visibilitychange`:
  - On `tick`: if hidden, return without scheduling; else fetch and schedule next based on success
  - On `visibilitychange` to visible: cancel any pending timer, fire `tick` immediately
  - On `visibilitychange` to hidden: cancel pending timer, leave it cancelled until visible again
- `cancelled` flag in cleanup; abort in-flight fetch and clear timeout

## Verification

`pnpm tsc --noEmit && pnpm lint` — both 0.

## Commit

`perf(presence): back-off polling, pause when tab hidden`
