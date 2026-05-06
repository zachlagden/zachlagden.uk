---
status: complete
quick_id: 260506-enh
description: PERF-03 — CustomCursor event delegation
date: 2026-05-06
---

# Plan 260506-enh

## Goal

Replace per-element listener snapshot with a single `mouseover` delegate on `document.body`, so dynamically-added interactive elements get cursor styling without re-binding. Resolves **PERF-03** (CONCERNS.md #10).

## Task

`src/components/ui/CustomCursor.tsx`:

- Hoist selector to module-level `INTERACTIVE_SELECTOR` constant
- Drop the `querySelectorAll` snapshot + per-element `addEventListener`/`removeEventListener` loop
- Add `handleMouseOver(e)` that calls `e.target.closest(INTERACTIVE_SELECTOR)` and sets variant accordingly
- Bind/unbind a single `mouseover` listener on `document.body`
- `updateMousePosition` always calls `setIsVisible(true)` (idempotent), so `isVisible` no longer needed in deps
- Effect deps: `[prefersReducedMotion, isTouchDevice]` only

## Verification

`pnpm tsc --noEmit && pnpm lint` — both 0.

## Commit

`perf(cursor): use event delegation instead of element snapshots`
