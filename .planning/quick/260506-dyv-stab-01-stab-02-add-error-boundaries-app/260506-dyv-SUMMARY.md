---
quick_id: 260506-dyv
phase: quick
requirements: [STAB-01, STAB-02]
tags: [error-boundary, next-app-router, framer-motion, stability]
dependency_graph:
  requires: []
  provides: [error.tsx, global-error.tsx]
  affects: [src/app/layout.tsx]
tech_stack:
  added: []
  patterns: [Next.js App Router error boundaries, client component error logging]
key_files:
  created:
    - src/app/error.tsx
    - src/app/global-error.tsx
  modified: []
decisions:
  - "Try again is the primary action (button with reset()) and Back to Home is secondary (Link) — opposite order from not-found.tsx where navigation is primary, because error recovery is more likely the desired action"
  - "global-error.tsx uses &mdash; entity alongside &apos; for the em dash in body copy — avoids raw Unicode in JSX"
metrics:
  duration: ~3 minutes
  completed: 2026-05-06
---

# Quick Task 260506-dyv: Add Route and Global Error Boundaries

Route-level and root-layout error boundaries with framer-motion choreography, console.error logging, and Try again / Back to Home affordances — matching not-found.tsx neutral palette exactly.

## What Was Built

**`src/app/error.tsx`** — Next.js App Router route-level error boundary (renders inside root layout). Client component accepting `{ error, reset }` props. Logs via `console.error` in a `useEffect`. Renders a styled fallback with `AlertTriangle` icon, "Something went wrong" heading, and two action buttons.

**`src/app/global-error.tsx`** — Root-layout error boundary that replaces `<html><body>` when the root layout itself throws. Same prop contract and logging. Renders its own minimal `<html lang="en"><body>` with classes applied directly on the body element. No project layout components imported — only `framer-motion`, `lucide-react`, and `next/link`.

## Verification

- `pnpm tsc --noEmit` — exit 0
- `pnpm lint` — exit 0
- All plan automated checks passed (`"use client"`, `console.error`, `<html>`/`<body>` in global only, `reset()` in both)

## Commits

| Hash    | Message                                        | Files                                   |
| ------- | ---------------------------------------------- | --------------------------------------- |
| 909d7f2 | feat(error): add route and global error boundaries | src/app/error.tsx, src/app/global-error.tsx |

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- `src/app/error.tsx` exists with all required patterns
- `src/app/global-error.tsx` exists with `<html>` and `<body>` and all required patterns
- Commit 909d7f2 confirmed on disk
- Exactly two task files staged (plus pre-staged config.json from orchestrator)
