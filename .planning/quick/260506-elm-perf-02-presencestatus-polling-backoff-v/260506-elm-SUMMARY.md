---
status: complete
quick_id: 260506-elm
description: PERF-02 — PresenceStatus polling backoff + visibility gating
date: 2026-05-06
commit: 4931ff6
---

# Summary 260506-elm

Single atomic commit `4931ff6`: `perf(presence): back-off polling, pause when tab hidden`.

`src/components/ui/PresenceStatus.tsx`:
- `setInterval(fetchData, 5000)` replaced with `setTimeout`-driven `tick()` self-rescheduling loop
- 30s baseline, exponential backoff on errors (5s → 10s → 30s → 60s → 300s cap)
- `document.hidden` skips ticks; `visibilitychange` listener fetches immediately on resume
- Backoff counter resets to 0 on first success; AbortError no longer counts as failure

Lint required moving `BASE_INTERVAL_MS` and `BACKOFF_STEPS_MS` to module scope (otherwise `react-hooks/exhaustive-deps` flagged them).

Verification: `pnpm tsc --noEmit && pnpm lint` both 0.

Resolves PERF-02 (CONCERNS.md #8).
