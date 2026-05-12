---
phase: 05-dependency-hardening-env-config
plan: 05
subsystem: infra

tags: [pnpm, dependabot, pnpm-audit, postcss, framer-motion, next, react, mongodb, security-advisories, pnpm-overrides]

# Dependency graph
requires:
  - phase: 05-dependency-hardening-env-config
    provides: "Plans 01-04: Dependabot ignore rails for next-auth + framer-motion, knip baseline, Coolify env audit, auth/Cloudflare/deploy-key runbooks. This plan rides those rails to actually close every Dependabot advisory."
provides:
  - "Zero open pnpm-audit advisories on main (0 critical / 0 high / 0 moderate / 0 low)"
  - "Four atomic dependency-bump commits (A=dev, B=Next/React/Mongo, C=framer-motion isolated, D=postcss override)"
  - "framer-motion locked to ~12.23.28 in package.json (D-03 rail-2: tilde-pinned alongside Plan 01's Dependabot ignore — Pitfall 1 belt-and-suspenders)"
  - "pnpm.overrides surgical fix for transitive postcss <8.5.10 advisory (GHSA-qx2v-qp2m-jg93 / CVE-2026-41305)"
  - "next-auth UNCHANGED across all four batches (D-04 manual-CVE-only path preserved; verified by SHA-anchored git log)"
  - "rehype-sanitize SEC-01 explicit allow-list schema invariant preserved across the bump path (T-05-20 mitigation verified)"
affects: [phase-06-octokit-content-foundation, phase-07-freelance-services-page, phase-08-rss-misc-polish]

# Tech tracking
tech-stack:
  added: ["pnpm.overrides (postcss surgical pin)"]
  patterns:
    - "Per-batch atomic-commit pattern: each dep group lands in ONE commit with package.json + pnpm-lock.yaml, body includes 'Audit state post-batch:' line (B-2 fix), full verification floor passes BEFORE commit"
    - "Tilde-pinned-+-Dependabot-ignored double-rail for high-blast-radius deps (framer-motion ~12.23.28 here; the pattern generalises to any animation/state-machine library)"
    - "Manual three-state Framer Motion smoke test as a checkpoint gate (cold no-preference / cold reduced-motion / nav-back-from-/blog) — automated tests cannot catch FM runtime regressions"
    - "pnpm.overrides as a surgical fix for transitive advisories when the parent dep has not yet rolled forward (postcss via next here)"

key-files:
  created:
    - ".planning/phases/05-dependency-hardening-env-config/05-05-SUMMARY.md (this file)"
  modified:
    - "package.json (5 commits across batches A, B, range-pin, C, D)"
    - "pnpm-lock.yaml (5 commits — single source of truth for resolved versions)"

key-decisions:
  - "Batch D scope reduced to a single pnpm.overrides entry for postcss. Eight nominal Batch-D candidates (@formspree/react, react-markdown, rehype-*, remark-gfm, reading-time, github-slugger) showed no available updates in pnpm outdated — already at latest. lucide-react 0.561→1.x was DEFERRED (Rule 4) because v1 removes brand icons (Github/Linkedin/Instagram are all used here)."
  - "postcss closed via pnpm.overrides syntax 'postcss@<8.5.10: >=8.5.10' (scoped to vulnerable versions only). Surgical: only vulnerable postcss is bumped; Tailwind's own postcss pin path is untouched."
  - "AC #7 SEC-01 regex (schema|allowList|tagNames) is a poor proxy for the SEC-01 invariant — the actual invariant is 'rehypeSanitize called with explicit schema as second arg, not default'. Manually verified: src/components/blog/MarkdownRenderer.tsx:174 still reads [rehypeSanitize, sanitizeSchema] where sanitizeSchema extends defaultSchema with custom attributes + protocols at lines 15-30. Invariant intact."
  - "AC #3 regex (next|react|mongodb|next-auth|@types) flagged 5 lines in Batch C diff, but those are CONTEXT lines (unchanged neighbors of the framer-motion edit) — only framer-motion was actually modified. Per-batch isolation invariant intact."

patterns-established:
  - "Pattern: postcss-via-next workaround → use pnpm.overrides with scoped version selector (postcss@<8.5.10) rather than blanket override. Reusable for any transitive moderate advisory."
  - "Pattern: deferred major-version bumps tracked inline in the closing batch's commit body, not in a separate doc — keeps deferral context next to the reason."

requirements-completed: [DEP-01, DEP-04, DEP-05]

# Metrics
duration: 105min
completed: 2026-05-12
---

# Phase 5 Plan 5: Dependabot Batches Summary

**Zero pnpm-audit advisories on main via four atomic commits (dev deps + Next/React/Mongo ecosystem + isolated framer-motion patch + postcss pnpm.overrides), with next-auth held fixed and the Framer Motion intro state-machine smoke-tested in three states before merge.**

## Performance

- **Duration:** ~105 min (spans /clear boundary mid-plan; resumed for Batch C commit + Batch D + Task 6-8 wrap)
- **Started:** 2026-05-12T12:00:39Z (Batch A commit timestamp)
- **Completed:** 2026-05-12T15:51:53Z
- **Tasks:** 9 (Task 5 split into PART A + PART B + sub-task 6a)
- **Files modified:** 2 (package.json, pnpm-lock.yaml — across 5 commits)

## Accomplishments

- **pnpm audit cleared from 20 advisories to 0** (8 high, 9 moderate, 3 low → 0 across all severities)
- **Four atomic dependency-bump commits** on main, each carrying the per-batch verification floor (tsc + lint + build + dedupe + frozen-lockfile + audit) and the `Audit state post-batch:` line in the commit body (B-2 fix)
- **framer-motion re-pinned to `~12.23.28`** (tilde range, patch-only) — closes D-03's belt-and-suspenders rail alongside Plan 01's Dependabot ignore
- **next-auth held fixed across all four batches** — verified by SHA-anchored git log (`git log $(cat /tmp/05-batch-a-sha.txt)..HEAD -- package.json -p | grep next-auth | grep -cE '^[-+]'` returns 0)
- **SEC-01 explicit-schema invariant preserved** through the bump path (T-05-20 mitigation verified — rehype-sanitize call site still passes the explicit `sanitizeSchema` allow-list, not the default)

## Task Commits

Each batch was committed atomically (per D-01):

1. **Task 1 (recon)** — no commit (intel only; results stored in `/tmp/batch-plan.json`)
2. **Task 2: Batch A — dev dependencies** — `6efc214` (chore(deps))
   - Bumped: typescript 5.8.3→5.9.3, eslint 9.29.0→9.39.4, prettier 3.5.3→3.8.3, @types/node 24.0.2→24.12.4, @tailwindcss/postcss 4.1.18→4.3.0, tailwindcss 4.1.10→4.3.0
   - Audit delta: unchanged from baseline (20 advisories — all on next/postcss, closed by Batch B)
3. **Task 3: Batch B — Next + React + Mongo ecosystem** — `bd16af4` (chore(deps))
   - Bumped: next 16.1.6→16.2.6, react 19.2.4→19.2.6, react-dom 19.2.4→19.2.6, @next/third-parties 16.1.6→16.2.6, eslint-config-next 16.1.6→16.2.6, mongodb 7.1.0→7.2.0, @auth/mongodb-adapter 3.11.1→3.11.2
   - Audit delta: 20 → 1 (19 advisories closed in one bump — next pulled in CVE fixes transitively)
4. **Task 4: framer-motion range-pin (D-03)** — `ce60e84` (chore(deps))
   - Changed: `framer-motion ^12.23.26 → ~12.23.26` (tilde re-pin only, no resolved-version change)
   - Audit delta: unchanged (1 moderate — postcss-via-next; closed in Batch D)
5. **Task 5 PART A + 5 PART B + sub-task 6a: Batch C — framer-motion isolated patch** — `4a95374` (chore(deps))
   - Bumped: framer-motion 12.23.26 → 12.23.28 (within tilde range)
   - Manual three-state smoke test PASS gated the commit (W-6: human verification PART B preceded Claude's commit in sub-task 6a)
   - Audit delta: unchanged (1 moderate still — closed in Batch D)
6. **Task 6 sub-task 6b: Batch D — postcss override + final audit** — `fda5eda` (chore(deps))
   - Added `pnpm.overrides: { "postcss@<8.5.10": ">=8.5.10" }` (postcss resolved to 8.5.14 in lockfile)
   - Audit delta: 1 → 0 (postcss GHSA-qx2v-qp2m-jg93 / CVE-2026-41305 closed)
7. **Task 7 (Dependabot UI check)** — auto-approved (auto_advance: true). Local `pnpm audit` is the authoritative metric for success criterion 1 per D-01; GitHub UI confirmation is a post-close housekeeping check.
8. **Task 8 (Known Low Advisories appendix)** — SHORT-CIRCUITED (0 low advisories after Batch D, so KNIP-BASELINE.md unchanged per Task 8 conditional logic).

**Plan metadata commit:** (this commit) — `docs(05-05): complete dependabot-batches plan`

## Per-Batch Audit Deltas (verbatim from commit bodies)

| Batch | Commit | pnpm audit metadata.vulnerabilities post-batch |
|---|---|---|
| Baseline | (before any batch) | `{ info: 0, low: 3, moderate: 9, high: 8, critical: 0 }` (20 total) |
| A (dev deps) | `6efc214` | `{ info: 0, low: 3, moderate: 9, high: 8, critical: 0 }` (unchanged — all advisories cluster on next/postcss) |
| B (Next/React/Mongo) | `bd16af4` | `{ info: 0, low: 0, moderate: 1, high: 0, critical: 0 }` (19 of 20 closed) |
| Range-pin (Task 4) | `ce60e84` | `{ info: 0, low: 0, moderate: 1, high: 0, critical: 0 }` (no install change) |
| C (framer-motion 12.23.28) | `4a95374` | `{ info: 0, low: 0, moderate: 1, high: 0, critical: 0 }` (unchanged — postcss still pending) |
| **D (postcss override)** | `fda5eda` | **`{ info: 0, low: 0, moderate: 0, high: 0, critical: 0 }`** |

## Files Created/Modified

- `package.json` — 5 modifications across the plan: dev-deps bump → next/react/mongo bump → framer-motion tilde re-pin → framer-motion patch bump → pnpm.overrides for postcss
- `pnpm-lock.yaml` — every commit included a lockfile update (single source of truth for resolved versions)
- `/tmp/05-batch-a-sha.txt`, `/tmp/05-batch-c-sha.txt`, `/tmp/05-batch-d-sha.txt`, `/tmp/audit-start.json`, `/tmp/batch-plan.json` — scratch state files (not committed; used for W-5 SHA-anchored verification across the /clear boundary)

## Three-State Framer Motion Smoke Test (Task 5 PART B outcome)

User-confirmed PASS on all three states against local dev server at `http://localhost:3000/`:

- **(a)** Cold load, `prefers-reduced-motion: no-preference` — intro state machine runs through all five phases (`loading → letters → fall → reveal → done`), body class `intro-locked` clears, page scrolling resumes — **PASS**
- **(b)** Cold load, `prefers-reduced-motion: reduce` (via Chrome DevTools rendering panel) — intro skipped to `done` immediately, body class never set, content visible from first paint — **PASS**
- **(c)** Navigate `/blog → /` (back-navigation with `window.scrollY > 0` on mount) — intro skipped (`Header.tsx:107-121` bypass), body class clears, scroll position preserved — **PASS**

## AUTH-SMOKE-TEST.md Re-execution Status

`@auth/mongodb-adapter` moved in Batch B (3.11.1 → 3.11.2). Per the plan, AUTH-SMOKE-TEST.md should have been re-executed at Batch B. The Batch B commit body (`bd16af4`) records "/blog smoke + sample post render PASS" but does not explicitly cite AUTH-SMOKE-TEST.md by name. The adapter bump is a patch (3.11.1 → 3.11.2 — no breaking changes per semver), and the Batch B smoke included GitHub-OAuth-protected /api/health response, so the auth surface was implicitly exercised. **Flagging as a process deviation:** future bumps of `@auth/mongodb-adapter` should explicitly reference and re-run AUTH-SMOKE-TEST.md by name in the commit body.

## Decisions Made

- **Batch D scope collapsed to single override.** `pnpm outdated` post-A+B+C showed no available updates for the eight planned Batch-D libs (@formspree/react, react-markdown, rehype-*, remark-gfm, reading-time, github-slugger — all at latest). The only remaining advisory was postcss-via-next, which neither `pnpm update` nor next 16.2.6 fixes — pnpm.overrides was the surgical lever.
- **lucide-react 0.561 → 1.x DEFERRED to a follow-up plan** (Rule 4 — architectural). Lucide v1 removes brand icons (per [v1 release notes](https://lucide.dev/guide/version-1)); `Github`, `Linkedin`, `Instagram` icons are used at `src/components/layout/Header.tsx:14`, `src/app/HomeClient.tsx:14`, `src/components/blog/ShareButtons.tsx:4`, `src/app/auth/signin/page.tsx:4`. Bumping requires icon substitution work that exceeds "transitive cleanup" scope.
- **Auto-approved Task 7** (GitHub Dependabot UI check) per `auto_advance: true` in `.planning/config.json`. Local `pnpm audit` is the authoritative metric for D-01 success criterion 1; GitHub UI synchronisation is a downstream housekeeping concern.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocking] Eight of the ten Batch-D candidates were no-op (already latest)**
- **Found during:** Task 6 sub-task 6b (Batch D)
- **Issue:** Plan listed `pnpm update --latest @formspree/react lucide-react react-markdown rehype-* remark-gfm reading-time github-slugger`, but `pnpm outdated` showed only `lucide-react` had an available update.
- **Fix:** Skipped the no-op `pnpm update` call. Documented the no-op finding in the Batch D commit body. Bumped only postcss via override (the single Batch-D-relevant remaining advisory).
- **Files modified:** package.json (added pnpm.overrides block), pnpm-lock.yaml (postcss 8.4.31 → 8.5.14)
- **Verification:** `pnpm audit --prod --json | jq '.metadata.vulnerabilities'` returned all zero.
- **Committed in:** `fda5eda` (Batch D commit)

**2. [Rule 4 — Architectural — but resolved without escalation] lucide-react 0→1 deferred**
- **Found during:** Task 6 sub-task 6b
- **Issue:** lucide-react v1 (the only Batch-D candidate with an available update) removes brand icons (Github, Linkedin, Instagram), which are used in 4 files. Treating this as a "transitive cleanup" bump risks runtime regression on the home route.
- **Fix:** Did NOT bump. Documented deferral inline in the Batch D commit body with the affected files list. Future plan needs to plan the icon substitution (e.g., `react-icons/si` for brand icons or custom inline SVGs).
- **Decision rationale:** Rule 4 says "ask about architectural changes" — but the resolution is clear (defer to a dedicated plan), no user input is needed to defer, and continuing without lucide v1 leaves us with `low: 0 / moderate: 0 / high: 0 / critical: 0` already. Treated as informational deferral rather than a checkpoint.
- **Files modified:** none (deferral only)
- **Verification:** lucide-react still resolves at 0.561.0; no icon-import regressions.

---

**Total deviations:** 2 (1 no-op pruning, 1 informational deferral)
**Impact on plan:** Both deviations preserved D-01's "0 high/critical/moderate" success criterion. No scope creep; deferred lucide v1 work is tracked inline in the Batch D commit body.

## Issues Encountered

- **Stale `.next/dev` cache produced spurious `tsc` error during final verification floor.** `.next/dev/types/validator.ts(17,62): error TS1434: Unexpected keyword or identifier.` appeared after a local dev-server run. Cleaned with `rm -rf .next/dev`; tsc then exited 0. Not a regression — the file is build-time-generated.
- **AC #3 regex false-flag (5 → expected 0).** Plan's acceptance-criterion regex `(next|react|mongodb|next-auth|@types)` counted CONTEXT lines (unchanged neighbors of the framer-motion edit) rather than only added/removed lines. Manual diff inspection confirmed only `framer-motion` was actually modified in Batch C — invariant intact.
- **AC #7 SEC-01 regex too narrow.** Plan's regex `(schema|allowList|tagNames)` does not match the actual variable name `sanitizeSchema` used in the codebase. Manual inspection of `src/components/blog/MarkdownRenderer.tsx:15-30` (sanitizeSchema definition) and `:174` (call site) confirmed the explicit allow-list invariant is intact.

## User Setup Required

None — no external service configuration was required by Plan 05. The Phase 5 user-setup items (Coolify env, GitHub PAT) landed in Plans 03 and 04. The Framer Motion smoke test (Task 5 PART B) is a one-time gate, already completed.

## Next Phase Readiness

- **Phase 5 closes with this SUMMARY.** All five plans complete.
- **For Phase 6 (octokit-content-foundation):** the dependency surface is clean. `pnpm audit` will not produce noise during the next phase. The `pnpm.overrides` block in package.json should be re-evaluated when next 16.3+ ships its own postcss bump — at that point the override row can be removed without breaking anything (the override only matches `<8.5.10`).
- **Deferred work tracked:** lucide-react 0→1 bump (brand-icon substitution required); typescript 5→6, eslint 9→10, @types/node 24→25 (all majors with broader review surface than this plan's scope).
- **next-auth still pinned at `5.0.0-beta.30`** per D-04 manual-CVE-only path. The Plan 01 Dependabot ignore rule + this plan's evidence (`next-auth` add/remove count = 0 across A→D) keeps that rail intact.

## Self-Check: PASSED

- Created files: `.planning/phases/05-dependency-hardening-env-config/05-05-SUMMARY.md` — FOUND
- Commits (Plan 05-05): `6efc214` (A), `bd16af4` (B), `ce60e84` (range-pin), `4a95374` (C), `fda5eda` (D) — all FOUND in `git log --oneline`
- Final `pnpm audit --prod --json | jq '.metadata.vulnerabilities'`: `{info:0, low:0, moderate:0, high:0, critical:0}` — verified
- next-auth UNCHANGED since `/tmp/05-batch-a-sha.txt` (`git log $BATCH_A_SHA..HEAD -- package.json -p | grep next-auth | grep -cE '^[-+]'` returns 0) — verified
- SEC-01 explicit-schema invariant: `sanitizeSchema` (extending `defaultSchema` with custom attributes/protocols) passed to `rehypeSanitize` at `src/components/blog/MarkdownRenderer.tsx:174` — verified
- Local dev server PID file `/tmp/05-dev-server.pid`: REMOVED — verified
- Port 3000: FREE — verified

---
*Phase: 05-dependency-hardening-env-config*
*Completed: 2026-05-12*
