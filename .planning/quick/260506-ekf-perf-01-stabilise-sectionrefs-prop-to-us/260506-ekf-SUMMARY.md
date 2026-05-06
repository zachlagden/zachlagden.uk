---
status: complete
quick_id: 260506-ekf
description: PERF-01 — stabilise sectionRefs prop to useSectionObserver
date: 2026-05-06
commit: b5fdb0f
---

# Summary 260506-ekf

Single atomic commit `b5fdb0f`: `perf(observer): memoize sectionRefs so IntersectionObserver is stable`.

`HomeClient.tsx` now wraps the `sectionRefs` object in `useMemo(() => ({...}), [])`. Refs from `useRef` are stable, so empty deps are correct.

Verification: `pnpm tsc --noEmit && pnpm lint` — both 0.

Resolves PERF-01 (CONCERNS.md #9).
