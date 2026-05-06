---
status: complete
quick_id: 260506-ekf
description: PERF-01 — stabilise sectionRefs prop to useSectionObserver
date: 2026-05-06
---

# Plan 260506-ekf

## Goal

Wrap the `sectionRefs` object literal in `useMemo` so `useSectionObserver` doesn't tear down + rebuild the IntersectionObserver on every render of HomeClient. Resolves **PERF-01** (CONCERNS.md #9).

## Task

`src/app/HomeClient.tsx`:
- Add `useMemo` to React imports
- Replace inline `sectionRefs: { ... }` argument with `const sectionRefs = useMemo(() => ({...}), [])` and pass that into `useSectionObserver`
- Empty deps array is correct because `useRef` produces stable refs

## Verification

`pnpm tsc --noEmit && pnpm lint` — both exit 0

## Commit

`perf(observer): memoize sectionRefs so IntersectionObserver is stable`
