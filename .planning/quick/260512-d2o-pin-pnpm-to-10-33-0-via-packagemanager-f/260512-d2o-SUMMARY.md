---
phase: quick-260512-d2o
plan: 01
subsystem: build/toolchain
tags: [build, docker, pnpm, corepack, coolify, hotfix]
requires: []
provides:
  - corepack-pinned-pnpm-version
affects:
  - package.json
tech-stack:
  added: []
  patterns:
    - "Corepack `packageManager` field for cross-environment toolchain pinning"
key-files:
  created: []
  modified:
    - package.json
decisions:
  - "Pinned pnpm to 10.33.0 (matches Zach's local install) — no hash, per Corepack docs the bare `pnpm@<version>` form is sufficient"
metrics:
  duration: "~3 minutes"
  completed: "2026-05-12"
  task-count: 1
  files-changed: 1
  commit: 41657a0
---

# Phase quick-260512-d2o Plan 01: Pin pnpm to 10.33.0 via packageManager Summary

## One-liner

Added `"packageManager": "pnpm@10.33.0"` to `package.json` so Corepack installs the exact pnpm version on every host (dev, CI, Coolify Docker build) instead of pulling pnpm 11.x, which requires Node 22 for `node:sqlite` and was crashing the prod build.

## What changed

**`package.json`** — one-line insertion immediately after `"private": true` and before `"scripts"`:

```diff
   "name": "cv.zachlagden.uk",
   "version": "1.0.0",
   "private": true,
+  "packageManager": "pnpm@10.33.0",
   "scripts": {
```

No other field, dependency, or block touched. Lockfile and Dockerfile untouched.

## Verification

| Check | Command | Result |
|-------|---------|--------|
| Field present | `node -p "require('./package.json').packageManager"` | `pnpm@10.33.0` |
| Local pnpm matches pin | `pnpm --version` | `10.33.0` |
| Lockfile drift | `pnpm install --frozen-lockfile` | `Lockfile is up to date, resolution step is skipped` / `Already up to date` / `Done in 769ms using pnpm v10.33.0` |
| Dockerfile + lockfile untouched | `git diff --exit-code pnpm-lock.yaml Dockerfile` | exit 0 (no diff) |
| Only package.json modified | `git status --porcelain` (ignoring planning files) | `M package.json` only |

## Commit

- `41657a0` — `fix(build): pin pnpm to 10.33.0 via packageManager to unblock prod docker build`

## Deviations from Plan

None — plan executed exactly as written. Single one-line addition, single commit, all four verification checks green.

## Why this fixes the prod 503

The Coolify Docker build runs `corepack enable pnpm` in both the `deps` and `builder` stages on a `node:20-alpine` base. Without a `packageManager` field, Corepack falls back to the latest pnpm version (currently `11.1.0`), which transitively requires Node 22.13+ for the new `node:sqlite` import. On Node 20 the build crashes immediately. Pinning to `10.33.0` (the version Zach already uses locally and the version that produced the existing `lockfileVersion: 9.0` lockfile) gives Corepack a deterministic target that's Node-20-compatible.

## Next deploy

Re-trigger the Coolify deployment on `main` after this commit (`41657a0`) is pushed. The deploy should now:

1. `corepack enable pnpm` → fetches pnpm 10.33.0 (cached in `~/.cache/corepack/`)
2. `pnpm install --frozen-lockfile` → no-op against existing lockfile
3. `pnpm build` → succeeds on Node 20

If a future build requires pnpm 11+, the upgrade should be deliberate: bump `packageManager` to `pnpm@11.x.x`, regenerate the lockfile against pnpm 11, AND bump the Dockerfile `FROM node:20-alpine` to `node:22-alpine` in the same commit. None of that is in scope here.

## Self-Check: PASSED

- `package.json`: FOUND, contains `"packageManager": "pnpm@10.33.0"`
- Commit `41657a0`: FOUND on `main`
- `pnpm-lock.yaml`: byte-identical to HEAD~1 (verified via `git diff --exit-code`)
- `Dockerfile`: byte-identical to HEAD~1 (verified via `git diff --exit-code`)
