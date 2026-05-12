---
phase: 05-dependency-hardening-env-config
plan: 2
subsystem: tooling
tags: [knip, devdeps, baseline, regression-prevention, runbook]

# Dependency graph
requires:
  - phase: 04-cleanup-tooling
    provides: dead-code removal baseline (CLEAN-01..03, commit 44de169) — referenced because the unused-files/exports knip surfaces are the residue NOT cleaned in v1
provides:
  - "knip 6.13.0 installed as devDependency (caret-pinned ^6.13.0)"
  - ".planning/runbooks/KNIP-BASELINE.md — verbatim v2-open baseline (3 unused files, 1 unused devDep, 18 unused exports, 16 unused exported types)"
  - "Header records capture datetime + 40-hex commit SHA + tool versions for v3 reproducibility"
affects: [05-03-env-audit, 05-04-runbooks, 05-05-dep-batches, v3-cleanup]

# Tech tracking
tech-stack:
  added:
    - "knip ^6.13.0 (devDependency) — TS/Next-aware unused-code detector"
  patterns:
    - "Verbatim baseline runbook: tool output captured uncurated, header pins reproducibility metadata (datetime + SHA + tool versions)"

key-files:
  created:
    - .planning/runbooks/KNIP-BASELINE.md
  modified:
    - package.json
    - pnpm-lock.yaml

key-decisions:
  - "Kept pnpm dlx download progress lines verbatim in the baseline (per D-08 signal preservation; they document the exact pnpm resolution behaviour at capture)"
  - "Captured SHA points at parent (53fb99b — Plan 5 Plan 1 commit) because the plan contract atomic-commits all three files together; the source-code state at HEAD is identical to the parent (knip is a devDep only)"

patterns-established:
  - "Pattern: tool-output runbooks include capture metadata (datetime + SHA + tool versions) so future-Zach can re-run the same command and meaningfully diff"

requirements-completed: [DEP-02]

# Metrics
duration: 4min
completed: 2026-05-12
---

# Phase 5 Plan 2: Knip Baseline Summary

**knip 6.13.0 installed as a devDep; verbatim baseline of unused code (3 unused files, 1 unused devDep, 18 unused exports, 16 unused exported types) captured at `.planning/runbooks/KNIP-BASELINE.md` for v3 regression comparison.**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-05-12T11:01:30Z
- **Completed:** 2026-05-12T11:05:18Z
- **Tasks:** 3
- **Files modified:** 2 (`package.json`, `pnpm-lock.yaml`)
- **Files created:** 1 (`.planning/runbooks/KNIP-BASELINE.md`)
- **Commits:** 1 atomic (`4e6910f`)

## Accomplishments

- Installed `knip@6.13.0` as a `devDependency` with caret pin (`^6.13.0`) — Node engine compatible (knip 6.x requires `^20.19.0 || >=22.12.0`; current Node v22.22.2 satisfies). No engine-fallback to knip@5 was triggered.
- Captured the verbatim `pnpm dlx knip --reporter markdown` output as the v2-open baseline. Header records ISO-8601 capture datetime, full 40-hex commit SHA, branch, and three tool versions (knip / Node / pnpm).
- Created `.planning/runbooks/` directory (first runbook in the project — Plans 03 and 04 will add ENV-VARS.md, AUTH-SMOKE-TEST.md, CLOUDFLARE.md alongside).
- All three files committed atomically in one chore(deps) commit per the plan contract.
- Verification floor v2 (`pnpm install --frozen-lockfile && tsc --noEmit && pnpm lint && pnpm build`) passes — knip install introduces zero transitive churn that breaks the build.

## Task Commits

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1, 2, 3 | Atomic: install knip + capture baseline + verify floor | `4e6910f` | `package.json`, `pnpm-lock.yaml`, `.planning/runbooks/KNIP-BASELINE.md` |

(Per the plan contract, Tasks 1 / 2 / 3 produce one atomic commit — Task 1 produces the package.json + lockfile edit, Task 2 writes the baseline, Task 3 verifies and commits all three together.)

## Files Created/Modified

- `package.json` — Added `"knip": "^6.13.0"` to `devDependencies`. Single-line addition; no other key touched (verified via `git diff package.json` showing only the knip line).
- `pnpm-lock.yaml` — Updated to register knip in the importer's `devDependencies` block (line 84) plus knip's transitives (oxc-parser, oxc-resolver, fdir, formatly, get-tsconfig, jiti, minimist, picomatch, plus emnapi natives). Net: +672 lines, -50 lines (Packages: +32 -14 per pnpm add output — pnpm dedupe folded some old transitives).
- `.planning/runbooks/KNIP-BASELINE.md` — NEW (91 lines). Metadata header (capture datetime, SHA, branch, knip/Node/pnpm versions, command, purpose) followed by `## Knip Report (verbatim)` and the unedited markdown report.

## Knip Findings (synthesis for SUMMARY only — NOT added to KNIP-BASELINE.md)

| Category | Count | Notes |
|----------|------:|-------|
| Unused files | 3 | `scripts/optimize-images.mjs` (one-shot tool from POLISH-05; legitimately dormant), `.remember/tmp/last-ndc.ts` (Claude Code session state, gitignored-adjacent), `src/lib/auth-helpers.ts` (defines `getSession`/`isAdmin`/`requireAdmin`; knip false-positive — these ARE used by API route handlers) |
| Unused devDependencies | 1 | `sharp` (used by `scripts/optimize-images.mjs` only — also flagged unused by knip; both findings are coherent) |
| Unused exports | 18 | Animation utility variants in `src/utils/animationUtils.ts` (10), `src/utils/viewTransition.ts` helpers (2), `src/utils/scrollUtils.ts` `scrollToTop` (1), `src/utils/presenceService.ts` `getPrimaryActivity` (1), `src/lib/blog.ts` `getAllPublishedSlugs` (1, false-positive — used by `app/sitemap.ts`), `src/lib/auth.ts` `signIn`/`signOut` re-exports (2) |
| Unused exported types | 16 | 11 from `src/types/presence.ts` (intermediate types not consumed), 4 from `src/types/content.ts` (`Footer`, `SkillCategory`, `PresenceData`, `Metadata`, `Personal` — false-positives, used by section components via prop destructuring patterns knip cannot trace through), 1 ancillary |

**Per D-08:** acting on these findings is deferred to v3. The baseline is read-only data — captured to allow v3 diff, not a cleanup checklist.

## Verification Floor

| Step | Command | Exit code | Notes |
|------|---------|-----------|-------|
| 1 | `pnpm install --frozen-lockfile` | 0 | "Lockfile is up to date" — no drift after `pnpm add -D knip`'s lockfile update |
| 2 | `pnpm exec tsc --noEmit` | 0 | Clean — no source changes |
| 3 | `pnpm lint` | 0 | Clean — no source changes; knip not yet wired into eslint |
| 4 | `pnpm build` | 0 | All 18 routes prerendered. MongoServerSelectionError messages emit on stderr (local MongoDB not running); build succeeds because v1 phase-0 hardening (commit `a0e1dfa`) wraps `getLatestPosts`/`getAllPublishedSlugs` in try/catch and degrades to empty arrays per the PROJECT.md core-value contract. Same pattern as Plan 5 Plan 1. |

## Decisions Made

- **Kept pnpm dlx download progress lines verbatim in the baseline.** The first 4 lines of the captured output are pnpm-dlx package-resolution chatter (`Progress: resolved 65, reused 27, downloaded 0, added 21, done`). Per D-08 (signal preservation > aesthetics) AND the explicit plan instruction to capture stderr (`2>&1`), these lines are part of the captured signal — they document exactly what pnpm did at capture, useful if the v3 re-run produces a different download profile.
- **Captured SHA points at the parent commit (`53fb99b`), not at this plan's atomic commit.** The plan contract requires Task 1/2/3 to commit as ONE atomic commit. So when Task 2 ran, `git rev-parse HEAD` was the Plan 5 Plan 1 commit. The source-code state of the codebase at the time knip ran is identical to the source-code state at HEAD (knip install only adds a devDep — no application source changes), so the parent SHA is the truthful reference for the baseline. Documented inline in KNIP-BASELINE.md so future-Zach is not surprised.
- **No engine fallback to knip@^5 needed.** Node v22.22.2 satisfies the knip 6.x requirement (`^20.19.0 || >=22.12.0`). The fallback code path documented in the plan (`knip@^5` for Node ≥18.18) was not exercised.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 — Bug] Plan's automated verification command for Task 1 has under-anchored matchers**

- **Found during:** Task 1 verification.
- **Issue:** The plan's automated verify line is:
  ```sh
  { pnpm list --depth=0 knip 2>/dev/null | grep -q "^knip " || [ "$(grep -cE '^  knip@' pnpm-lock.yaml)" = "1" ]; }
  ```
  Both branches fail in practice:
  - `pnpm list --depth=0 knip` produces tree-style output (`└── knip@6.13.0`), not a line starting with `knip ` (space-after).
  - `grep -cE '^  knip@' pnpm-lock.yaml` returns `2`, not `1`, because pnpm 9-format lockfiles list each package twice (once in `packages:` declarations and once in `snapshots:` resolved records). Both matches are knip itself; neither is a transitive.
- **Fix:** Verified knip's actual presence in the importer's `devDependencies:` block at `pnpm-lock.yaml:84` directly (line `      knip:` with `specifier: ^6.13.0`). The plan's PROSE intent ("knip is present in the importer section of the lockfile") IS satisfied; only the executable check was buggy. No file modification needed — this is a meta-deviation flagged for the verifier so the planner can correct it for similar future plans.
- **Files modified:** None (no fix-in-source needed).
- **Commit:** N/A.

## Issues Encountered

- **Peer-dependency warning on `pnpm add -D knip`** — pnpm reported `@auth/mongodb-adapter 3.11.1 has unmet peer mongodb@^6: found 7.1.0`. This is a PRE-EXISTING warning (the `mongodb` driver was bumped to v7 prior to Phase 5; the adapter still declares its peer range as `^6`). NOT caused by this plan; it surfaces because pnpm re-evaluates peer ranges on every `add`. Resolution is owed by Plan 5 Plan 5 (Batch B — Next + React ecosystem, where `mongodb` and `@auth/mongodb-adapter` "MUST move together" per D-01). No action taken in this plan.
- **MongoDB ECONNREFUSED during `pnpm build`** — Same pre-existing v1-hardened graceful-degradation behavior documented in Plan 5 Plan 1's SUMMARY (commit `a0e1dfa` wraps Mongo calls in try/catch). Build exit 0; routes degrade to empty arrays per PROJECT.md core-value contract. No regression.

## Threat Model Coverage

All three STRIDE threats from the plan's `<threat_model>` are mitigated as designed:

| Threat ID | Mitigation Status | Evidence |
|-----------|-------------------|----------|
| T-05-06 (Information Disclosure — KNIP-BASELINE.md committed to public repo) | Accept (per plan) | knip output lists file paths and unused export names; manual review of the captured baseline confirms zero secrets, no env values, no credentials. Repo is already public per PROJECT.md. |
| T-05-07 (Tampering — knip 6.x supply chain) | Mitigated | Caret-pinned `^6.13.0` in `package.json` AND registered with integrity hash in `pnpm-lock.yaml` (lockfileVersion 9.0). Future bumps subject to Dependabot rules established in Plan 5 Plan 1 (knip will fall under the `dev-dependencies` group). |
| T-05-08 (Denial of Service — false positives → developer deletes used file → runtime regression) | Accept (per plan) | The baseline is captured-not-acted-upon. Two known knip false-positives surfaced in the Findings table above (`src/lib/auth-helpers.ts`, `src/lib/blog.ts:getAllPublishedSlugs`, several `content.ts` types) — annotated for v3 cleanup so the cleaner doesn't blindly delete. |

No new threat surface introduced.

## User Setup Required

None — no external service configuration required.

## Wave Note

**Plan 02 + Plan 01 share Wave 1.** This plan touches `package.json`, `pnpm-lock.yaml`, and `.planning/runbooks/KNIP-BASELINE.md`. Plan 01 touched `.github/dependabot.yml`. Disjoint files — could have run in parallel; this run was sequential because Plan 01 was already complete on `main` when this executor spawned. The atomic-commit hash (`4e6910f`) is one above Plan 01's `bfe3ad3`.

## Next Phase Readiness

- **Wave 2 (Plan 03 — env audit, Plan 04 — runbooks):** Unblocked. The `.planning/runbooks/` directory now exists; Plans 03 and 04 add sibling files (`ENV-VARS.md`, `AUTH-SMOKE-TEST.md`, `CLOUDFLARE.md`) without conflict.
- **Wave 3 (Plan 05 — dep batches):** Unblocked. knip's findings inform v3 cleanup planning, not v2 dep batches. The `mongodb`/`@auth/mongodb-adapter` peer mismatch noted above is owed by Batch B in Plan 05.
- **v3:** Future-Zach can run `pnpm dlx knip --reporter markdown` on the v3 milestone open commit and `diff` against `.planning/runbooks/KNIP-BASELINE.md` to surface drift.
- **No blockers, no concerns.**

## Self-Check: PASSED

- File `.planning/runbooks/KNIP-BASELINE.md` exists — verified via `test -f`.
- File `package.json` modified with `"knip": "^6.13.0"` — verified via `node -e` JSON parse.
- File `pnpm-lock.yaml` modified, knip in importer block at line 84 — verified.
- Commit `4e6910f` exists in `git log` — verified.
- All 6 Task 1 ACs effectively pass (one verification command was buggy; knip is genuinely installed — see Deviations).
- All 8 Task 2 ACs pass.
- All 8 Task 3 ACs pass.
- Verification floor exit codes all 0.

---
*Phase: 05-dependency-hardening-env-config*
*Completed: 2026-05-12*
