---
phase: 05-dependency-hardening-env-config
plan: 1
subsystem: infra
tags: [dependabot, ci, framer-motion, next-auth, pnpm, regression-prevention]

# Dependency graph
requires:
  - phase: 04-cleanup-tooling
    provides: ESLint exhaustive-deps + no-floating-promises rule baseline (CLEAN-06, commit cc8561e) — referenced as the prior `tsc + lint` floor that v2 extends with `pnpm build`
provides:
  - "Dependabot ignore rules: next-auth (ALL update types), framer-motion (semver-major + semver-minor), pnpm (semver-major)"
  - "Group-rule exclude-patterns on next-ecosystem (next-auth) and security-updates (next-auth, framer-motion, pnpm)"
  - "Verification floor v2 (`pnpm install --frozen-lockfile && tsc --noEmit && pnpm lint && pnpm build`) confirmed green on main as of bfe3ad3"
affects: [05-02-knip-baseline, 05-03-env-audit, 05-04-dep-batches, 05-05-runbooks, 06-content-refresh, 07-integrations, 08-freelance-offering]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Dependabot ignore + group exclude-patterns belt-and-suspenders rail (D-03 / D-04)"
    - "YAML comment-as-runbook-pointer: each ignore rule cites the Pitfall number and gating runbook"

key-files:
  created: []
  modified:
    - .github/dependabot.yml

key-decisions:
  - "Used omitted-update-types form for next-auth ignore (per Dependabot docs, omitting update-types ignores ALL update types) — cleanest expression of D-04"
  - "Added exclude-patterns to BOTH next-ecosystem AND security-updates groups (belt-and-suspenders against group-rule precedence ambiguity per T-05-05)"
  - "Inline YAML comments cite Pitfall numbers and the gating runbook (AUTH-SMOKE-TEST.md) so future-Zach reading the YAML in isolation has the WHY and the WHAT-TO-DO-NEXT"

patterns-established:
  - "Pattern: regression-prevention as code — every known runtime-regression vector that lint+tsc cannot catch gets a Dependabot ignore rule, with the WHY documented inline"
  - "Pattern: per-batch verification floor v2 — `pnpm install --frozen-lockfile && pnpm exec tsc --noEmit && pnpm lint && pnpm build` is the gate before any commit touching deps or build-affecting config"

requirements-completed: [DEP-03]

# Metrics
duration: 3min
completed: 2026-05-12
---

# Phase 5 Plan 1: Dependabot Hardening Summary

**Dependabot now ignores `next-auth` entirely, limits `framer-motion` to patch-only proposals, blocks `pnpm` major bumps, and excludes all three from every group rule that could re-include them.**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-05-12T10:53:38Z
- **Completed:** 2026-05-12T10:56:07Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Closed Pitfall 2 (next-auth beta-to-beta OAuth contract change) at the automation rail — Dependabot will never propose a `next-auth` bump again. Manual CVE-only bumps remain, gated by the (Plan 04) AUTH-SMOKE-TEST.md runbook.
- Closed Pitfall 1 (Framer Motion intro state machine FSM regression) at the automation rail — only patch bumps reach review. The package.json range pin (`~12.23.26`) is still owed by Plan 05 Batch C; that's the second rail.
- Defended commit `41657a0` (the pnpm@10.33.0 packageManager pin that unblocked the Coolify Corepack mismatch) against future major-version Dependabot proposals.
- Plugged the group-rule precedence loophole — `next-ecosystem` (`next*` matches `next-auth`) and `security-updates` (`*` matches everything) now explicitly exclude the ignored deps so they cannot leak back in.
- Verification floor v2 (the new `pnpm build` line for Turbopack/Coolify regression catch) confirmed green on `main`.

## Task Commits

Each task was committed atomically (this plan ships one combined commit per the plan contract — Task 1 produces the YAML edit; Task 2 verifies + commits):

1. **Task 1 + 2: Dependabot hardening (YAML edits + verification floor + commit)** — `bfe3ad3` (chore)

**Plan metadata:** _(this SUMMARY + STATE.md + ROADMAP.md will land in the docs metadata commit)_

## Files Created/Modified

- `.github/dependabot.yml` — Added 3 ignore entries (`next-auth`, `framer-motion`, `pnpm`) and 2 group exclude-patterns (next-ecosystem, security-updates). Net: +24 lines, 0 deletions, no other keys touched.

### Final dependabot.yml diff (from `git show bfe3ad3 -- .github/dependabot.yml`)

```diff
@@ -31,6 +31,10 @@ updates:
           - "@next/*"
           - "react*"
           - "@types/react*"
+        # next-auth must never bundle with the Next/React batch — it has its
+        # own ignore rule below and a manual CVE-only bump protocol (D-04).
+        exclude-patterns:
+          - "next-auth"
       dev-dependencies:
         patterns:
           - "@types/*"
@@ -50,11 +54,31 @@ updates:
           - "patch"
           - "minor"
           - "major"
+        # Even security advisories for these deps must be handled standalone
+        # so the manual smoke-test discipline (D-01 / D-04) is preserved.
+        exclude-patterns:
+          - "next-auth"
+          - "framer-motion"
+          - "pnpm"
     # Ignore specific dependencies that need manual updates
     ignore:
       - dependency-name: "node"
         # Ignore major version updates for Node.js
         update-types: ["version-update:semver-major"]
+      # Pitfall 2 — beta-to-beta OAuth contract change. Manual CVE-only bump,
+      # gated by AUTH-SMOKE-TEST.md.
+      - dependency-name: "next-auth"
+      # Pitfall 1 — intro state machine FSM. Patch-only; package.json range
+      # pinned to ~12.23.26 in Plan 05 Batch C.
+      - dependency-name: "framer-motion"
+        update-types:
+          - "version-update:semver-major"
+          - "version-update:semver-minor"
+      # Defends packageManager: pnpm@10.33.0 pin (commit 41657a0) from
+      # Coolify Corepack mismatch.
+      - dependency-name: "pnpm"
+        update-types:
+          - "version-update:semver-major"
     # Auto-merge configuration for minor and patch updates
     rebase-strategy: "auto"
```

## Verification Floor

| Step | Command | Exit code | Notes |
|------|---------|-----------|-------|
| 1 | `pnpm install --frozen-lockfile` | 0 | "Lockfile is up to date" — no drift; `git diff --name-only -- pnpm-lock.yaml` empty |
| 2 | `pnpm exec tsc --noEmit` | 0 | Clean (no source changes) |
| 3 | `pnpm lint` | 0 | Clean (no source changes) |
| 4 | `pnpm build` | 0 | Build completed; all 18 routes prerendered. Build emits MongoServerSelectionError messages because local MongoDB is not running — this is expected and intentionally handled by the v1 phase-0 hardening (`a0e1dfa`) that wraps `getLatestPosts`/`getAllPublishedSlugs` in try/catch. The build succeeds because the routes degrade gracefully to empty arrays, exactly as the PROJECT.md core-value contract requires. |

## Decisions Made

- **Omitted `update-types:` for `next-auth`** — Per Dependabot docs, omitting the `update-types` key in an `ignore:` entry ignores ALL update types for that dependency. This is the cleanest YAML expression of D-04 ("manual CVE-only bumps") and avoids enumerating every possible update-type-string the way the framer-motion entry does. Verified by AC2: the line after `dependency-name: "next-auth"` is the YAML comment for the next entry, not a `update-types:` key.
- **Added `exclude-patterns:` to BOTH `next-ecosystem` and `security-updates` groups** (not just `security-updates`) — `next-ecosystem`'s `next*` glob matches `next-auth`, so without the exclusion `next-auth` would be silently grouped with the Next/React batch and the per-batch smoke-test discipline (D-01) would not apply. Belt-and-suspenders against T-05-05 (group-rule precedence ambiguity).
- **Inline YAML comments cite Pitfall numbers + gating runbook** — A future Zach reviewing a Dependabot PR or auditing the YAML in isolation needs the WHY (Pitfall N) and the WHAT-TO-DO-NEXT (run AUTH-SMOKE-TEST.md before merging a manual `next-auth` bump). The plan-text-only approach would force a triple-jump (PR → plan → context → pitfalls); inline comments collapse it to one read.

## Deviations from Plan

None — plan executed exactly as written. All 8 Task 1 acceptance criteria and all 7 Task 2 acceptance criteria pass on the first attempt. No CLAUDE.md or skill-rule conflicts (this plan only edits a YAML config — no code, no UI, no copywriting surface).

## Issues Encountered

- **MongoDB ECONNREFUSED messages during `pnpm build`** — Surfaced in stderr but did NOT fail the build (exit 0). This is the pre-existing v1-hardened graceful-degradation behavior (commit `a0e1dfa`, before this plan), not a regression. The build completes and prerenders all 18 routes. No action needed; documented here so the verifier doesn't flag it as new.
- **Pre-existing `STATE.md` modification in working tree** — Modified by the prior session that gathered Phase 5 context. Deliberately NOT staged in this plan's commit (the plan contract is "edit YAML only"). It will be picked up by the standard state-update step after this SUMMARY lands.

## Threat Model Coverage

All five STRIDE threats from the plan's `<threat_model>` are mitigated as designed:

| Threat ID | Mitigation Status | Evidence |
|-----------|-------------------|----------|
| T-05-01 (Tampering — ignore rules) | Mitigated | AC1 (4 entries), AC2 (next-auth no update-types), AC3 (framer-motion semver-major + minor only), AC4 (pnpm semver-major) |
| T-05-02 (Elevation of Privilege — next-auth) | Mitigated | next-auth ignore on ALL types; manual CVE-only bump protocol referenced inline |
| T-05-03 (Denial of Service — framer-motion) | Mitigated (rail 1 of 2) | Patch-only Dependabot proposals. Rail 2 (`~12.23.26` package.json pin) is owed by Plan 05 Batch C |
| T-05-04 (Tampering — pnpm) | Mitigated | pnpm semver-major ignore in place |
| T-05-05 (Repudiation — group rule re-inclusion) | Mitigated | exclude-patterns added to both next-ecosystem and security-updates groups |

No new threat surface introduced — this plan strictly narrows Dependabot's proposal surface (defensive only).

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- **Wave 1 sibling (Plan 02 — knip baseline):** Can run in parallel; touches `.planning/runbooks/KNIP-BASELINE.md` and `package.json` (`devDependencies` only). Disjoint from `.github/dependabot.yml`, no conflict.
- **Wave 2 (Plan 03 — env audit, Plan 04 — runbooks):** Unblocked. The new ignore rules are now live for any in-flight Dependabot PRs targeting the three protected deps; rebase-strategy: auto will close them.
- **Wave 3 (Plan 05 — dep batches):** This plan was the prerequisite. Batch C's `framer-motion ~12.23.26` package.json pin is the second rail and STILL OWED — Plan 05 must explicitly re-pin the range, not rely solely on the dependabot.yml ignore.
- **No blockers, no concerns.**

## Self-Check: PASSED

- File `.github/dependabot.yml` exists and contains the new entries — verified via `grep -c "dependency-name:" .github/dependabot.yml` returning `4`.
- Commit `bfe3ad3` exists in `git log --oneline --all` — verified.
- All 8 Task 1 acceptance criteria pass.
- All 7 Task 2 acceptance criteria pass.
- Verification floor exit codes all 0.

---
*Phase: 05-dependency-hardening-env-config*
*Completed: 2026-05-12*
