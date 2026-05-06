---
phase: quick-260506-e2t
plan: 01
subsystem: intro-animation
tags: [stability, animation, font-loading, race-condition, unmount-safety]
requirements: [STAB-03, STAB-04]
key-files:
  modified:
    - src/components/layout/Header.tsx
decisions:
  - "Used separate setTimeout + .then() form rather than Promise.race constructor — avoids dual-timeout leak that arises when the Promise.race resolver itself creates a second handle that overwrites the outer handle variable before cleanup can cancel the first one"
  - "Outer fallbackTimeoutHandle set once per branch (fonts-defined vs fonts-undefined) so a single clearTimeout in cleanup is sufficient"
metrics:
  duration: ~5 minutes
  completed: 2026-05-06
---

# Quick Task 260506-e2t: Harden font-ready gate (STAB-03 + STAB-04)

Patched the font-readiness `useEffect` in `src/components/layout/Header.tsx` so the intro animation cannot deadlock on a stalled `document.fonts.ready` and cannot call `setState` after unmount via a stray `requestAnimationFrame`.

## What Changed in Header.tsx

Seven structural changes were made to the single effect guarded by `if (introPhase !== "loading") return;`:

1. **Hoisted cancellation token** — `let cancelled = false` moved to the top of the effect, before the `wasScrolledOnLoad` branch. Both code paths now share the same flag.

2. **Added handle variables** — `rafHandle`, `fallbackTimeoutHandle`, and `fadeTimeoutHandle` declared at the top so the cleanup function can target them precisely.

3. **wasScrolledOnLoad rAF guarded (STAB-04 fix)** — The `requestAnimationFrame` callback now starts with `if (cancelled) return;`. The handle is captured in `rafHandle`. A dedicated early-return cleanup (`cancelled = true; cancelAnimationFrame(rafHandle)`) is returned from this branch.

4. **`runContinuation` function (STAB-03 fix)** — Extracted the font-ready body into a named function with a `didRun` closure guard at the top (`if (didRun || cancelled) return; didRun = true`). This prevents double-execution if both the `.ready` promise and the 5s fallback fire in quick succession.

5. **5-second fallback timer** — `fallbackTimeoutHandle = setTimeout(runContinuation, 5000)` is set whenever `document.fonts` is defined. `document.fonts.ready.then(runContinuation).catch(runContinuation)` races it. When `document.fonts` is undefined (very old browser), only the timeout drives the continuation.

6. **Race form chosen** — The simpler `setTimeout + .then()` form was used rather than `Promise.race`. The `Promise.race` constructor form was considered but discarded: placing `fallbackTimeoutHandle = setTimeout(resolve, 5000)` inside the race constructor would overwrite the outer handle assignment before the cleanup closure captures the final value, leaving the outer timer uncancellable. The `setTimeout + .then()` form assigns exactly one handle and keeps cleanup trivial.

7. **Unified cleanup** — Returns `() => { cancelled = true; if (rafHandle !== null) cancelAnimationFrame(rafHandle); if (fallbackTimeoutHandle !== null) clearTimeout(fallbackTimeoutHandle); if (fadeTimeoutHandle !== null) clearTimeout(fadeTimeoutHandle); }`. Covers: stray rAF (STAB-04), 5s fallback leak (STAB-03), and 300ms loader-fade leak.

Dependency array left unchanged: `[introPhase, wasScrolledOnLoad, measureIntroFontSize, onIntroComplete]`.

## Commit

`6edb503` — `fix(intro): guard font-ready and rAF against unmount and stalls`

## Verification

- `pnpm tsc --noEmit` — exited 0, no output
- `pnpm lint` — exited 0, no output
- Only `src/components/layout/Header.tsx` staged and committed

## Deviations from Plan

One deviation from the plan spec: the plan offered `Promise.race` as an acceptable alternative form. The simpler `setTimeout + .then()` form was chosen instead because the `Promise.race` constructor approach creates a dual-timeout variable-overwrite hazard (the inner `setTimeout` in the race constructor would clobber `fallbackTimeoutHandle` after the outer assignment, leaving the outer timer handle lost). The `didRun` guard keeps both paths safe from double-execution; the simpler form avoids the cleanup ambiguity entirely. Happy-path behaviour is identical.

## Self-Check

- `src/components/layout/Header.tsx` exists and contains the hardened effect: VERIFIED
- Commit `6edb503` exists on `main`: VERIFIED
- `cancelled` declared before `wasScrolledOnLoad` branch: VERIFIED (line 112)
- rAF callback starts with `if (cancelled) return;`: VERIFIED (line 122)
- `runContinuation` starts with `if (didRun || cancelled) return; didRun = true;`: VERIFIED (lines 135-136)
- Fallback timeout = 5000ms: VERIFIED (line 153)
- Cleanup clears rAF + both setTimeouts: VERIFIED (lines 166-171)

## Self-Check: PASSED
