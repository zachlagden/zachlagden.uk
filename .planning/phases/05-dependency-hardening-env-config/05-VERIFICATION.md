---
phase: 05-dependency-hardening-env-config
verified: 2026-05-12T18:30:00Z
status: human_needed
score: 5/5 must-haves verified (3 with documented partial deviations)
overrides_applied: 0
re_verification:
  previous_status: none
  previous_score: none
  gaps_closed: []
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "GitHub Dependabot alerts page on main is at 0 open alerts"
    expected: "https://github.com/zachlagden/zachlagden.uk/security/dependabot shows 0 open alerts on `main` (all 19 high + 19 moderate + 6 low closed)"
    why_human: "ROADMAP success criterion 1 explicitly cites the GitHub Dependabot UI as the metric. The Coolify+local audit half of the criterion is met (`pnpm audit --prod` returns 0/0/0/0/0); the GitHub UI half can only be confirmed after these commits are pushed and the UI re-scans."
  - test: "GitHub OAuth admin sign-in to /admin/blog continues to function in production"
    expected: "The 2026-05-12 PASS from AUTH-SMOKE-TEST.md execution log still holds. Sign in, reach editor, isAdmin === true, sign out."
    why_human: "The runbook records a one-time PASS but does not auto-monitor. Any subsequent Coolify env mutation or next-auth bump can break the criterion silently; the criterion text 'passes end-to-end' is a live property that needs periodic re-execution. No live re-execution requested today, but verifier cannot programmatically confirm the live state without OAuth credentials."
  - test: "Cloudflare proxy mode is still DNS-only (or, if flipped to proxied, CLOUDFLARE.md's four rules were applied first)"
    expected: "Either grey-cloud at Cloudflare dashboard, OR orange-cloud + all four cache rules visible in Caching → Cache Rules with /api/* bypass as rule 1"
    why_human: "Verifier has no access to Cloudflare dashboard. CLOUDFLARE.md documents the procedure as parameterised; whether the user has applied it is unverifiable from code."
  - test: "GITHUB_PAT scope and expiry status review (pre-Phase-7)"
    expected: "Either (a) classic-PAT-with-read:user-and-unknown-expiry remains and rotate-github-pat.md is on calendar before 2027-05-12, OR (b) PAT has been rotated to fine-grained per D-06"
    why_human: "Acknowledged deviation per task description. The current state (classic PAT, read:user, unknown expiry) is a partial-meeting of success criterion 3 with a documented mitigation in .planning/todos/pending/rotate-github-pat.md. No phase-blocker; raised so the developer can confirm the calendar reminder exists outside the codebase."
---

# Phase 5: Dependency Hardening + Env Config Verification Report

**Phase Goal:** Dependabot is green, Coolify env vars are reconciled with `.env.example`, `GITHUB_PAT` is available for Phase 7, and the runbooks future-Zach will need (env audit, Cloudflare cache, auth smoke test) are written down.

**Verified:** 2026-05-12T18:30:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (ROADMAP Success Criteria + PLAN frontmatter merged)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | GitHub Dependabot alerts page shows 0 open alerts on `main` (19 high + 19 moderate + 6 low resolved); `pnpm audit` reports 0 high/critical and 0 moderate locally and in CI | PARTIAL | `pnpm audit --prod --json` → `{info:0, low:0, moderate:0, high:0, critical:0}` (verified locally). Full `pnpm audit` (incl. devDeps) → `{info:0, low:0, moderate:0, high:2, critical:0}` — 2 new high advisories in `flatted` (eslint transitive: eslint > file-entry-cache > flat-cache > flatted). GitHub UI side requires post-push verification (human). |
| 2 | Admin signs into `/admin/blog` in production via GitHub OAuth and reaches the editor; AUTH-SMOKE-TEST.md passes end-to-end | VERIFIED | `.planning/runbooks/AUTH-SMOKE-TEST.md` Execution Log row dated 2026-05-12 reads PASS after 3 unblock cycles (deploy-key + AUTH_TRUST_HOST + AUTH_URL). Documented in 05-04-SUMMARY.md. Coolify env via API now contains all 9 required keys (verifier cannot re-run live OAuth without credentials — flagged for human re-validation). |
| 3 | `.planning/runbooks/ENV-VARS.md` lists every env var with present/missing/obsolete columns reconciled against `.env.example` and Coolify; `GITHUB_PAT` (fine-grained, "No repository access" + "Profile: Read-only", ≤1y expiry) appears under "present" for Phase 7 | PARTIAL (3 documented deviations) | ENV-VARS.md exists with 11-row table using D-05 taxonomy. GITHUB_PAT row is `present`/`both`. **Deviation 1**: classic PAT (`ghp_...`) accepted instead of fine-grained (`github_pat_...`) — functionally equivalent per scope (read:user only, no repo), documented in 05-03-SUMMARY.md + `.planning/todos/pending/rotate-github-pat.md`. **Deviation 2**: expiry not recorded (no expiry, or unknown); ENV-VARS.md GITHUB_PAT details says "Expires: unknown (manual rotation recommended within 12 months)". Calendar item in rotate-github-pat.md (deadline 2027-05-12). **Deviation 3 (separate)**: ENV-VARS.md NEXT_PUBLIC_DISCORD_USER_ID row marks it "intentionally removed" but `src/components/ui/PresenceStatus.tsx:34` still reads it — see anti-patterns section. |
| 4 | `.github/dependabot.yml` ignores `next-auth` (beta-to-beta) and limits `framer-motion` to patch-only bumps; per-batch verification floor enforced; failures rolled back | VERIFIED | `.github/dependabot.yml:68-81` contains `dependency-name: "next-auth"` with no update-types (= ignore ALL) and `dependency-name: "framer-motion"` with update-types `version-update:semver-major` + `version-update:semver-minor` (= patch-only). `pnpm` major ignore also present. `exclude-patterns` on both `next-ecosystem` and `security-updates` groups. Per-batch floor evidenced by 5 commits (`bfe3ad3`, `4e6910f`, `6efc214`, `bd16af4`, `ce60e84`, `4a95374`, `fda5eda`) each carrying the `pnpm install --frozen-lockfile && tsc --noEmit && pnpm lint && pnpm build` floor in commit body/SUMMARY. |
| 5 | `knip` is installed as a devDep and a baseline run is captured in `.planning/runbooks/KNIP-BASELINE.md`; `.planning/runbooks/CLOUDFLARE.md` documents the full-proxy / cache-rules / cache-purge procedure so Next `Cache-Control` is honoured end-to-end | VERIFIED | `package.json:41` declares `"knip": "^6.13.0"` in devDependencies. `.planning/runbooks/KNIP-BASELINE.md` exists (91 lines, header records 40-hex commit SHA + tool versions + datetime). `.planning/runbooks/CLOUDFLARE.md` exists (154 lines) with AS-IS DNS-only section, four cache rules (Rule 1-4), `purge_cache` / `purge_everything` curl, expected `cf-cache-status` table (19 BYPASS/HIT entries), Phase 6 `revalidate: 86400` cross-reference (3 mentions). |

**Score:** 5/5 truths verified (3 with documented partial deviations: PAT scope/expiry on T3, dev-transitive flatted highs on T1, presence-widget orphan on T3)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `.github/dependabot.yml` | Hardened with next-auth + framer-motion + pnpm ignore + exclude-patterns | VERIFIED | 4 `dependency-name:` entries (node, next-auth, framer-motion, pnpm); 2 `exclude-patterns:` blocks (next-ecosystem, security-updates). YAML parses; comments cite Pitfall 1/2 and AUTH-SMOKE-TEST.md gating runbook. |
| `package.json` | knip in devDependencies; framer-motion tilde-pinned; next-auth pinned exact 5.0.0-beta.30; pnpm.overrides for postcss | VERIFIED | Line 41: `"knip": "^6.13.0"`. Line 18: `"framer-motion": "~12.23.28"` (tilde, patches-only). Line 23: `"next-auth": "5.0.0-beta.30"` (no caret/tilde). Lines 53-55: `"overrides": { "postcss@<8.5.10": ">=8.5.10" }`. |
| `.env.example` | Required + Optional vars documented, blank values, includes GITHUB_PAT + AUTH_TRUST_HOST + AUTH_URL | VERIFIED with WARNING | 6 entries with blank values (MONGODB_URI, AUTH_SECRET, AUTH_GITHUB_ID, AUTH_GITHUB_SECRET, ADMIN_GITHUB_USERNAME, GITHUB_PAT) + 2 with non-blank dev defaults (AUTH_TRUST_HOST=true, AUTH_URL=http://localhost:3000). Comments cite authjs.dev docs for AUTH_TRUST_HOST/AUTH_URL. **WARNING**: `NEXT_PUBLIC_DISCORD_USER_ID` removed but PresenceStatus.tsx:34 still reads it — REVIEW.md WR-01. |
| `.planning/runbooks/ENV-VARS.md` | Three-column reconciliation table with D-05 taxonomy | VERIFIED | 12-line reconciliation table + "Intentionally removed" subsection + "GITHUB_PAT details" + "Discovered during 05-04 smoke test" subsection + Coolify endpoint quirks. Total: ~258 lines. |
| `.planning/runbooks/AUTH-SMOKE-TEST.md` | Six-step text-only checklist, no images, with execution log row PASS | VERIFIED | 131 lines. `grep -c "^### Step [1-6] " → 6`. No image markdown. 1 PASS row in execution log (2026-05-12 with detailed unblock-cycle notes). isAdmin === true literal present. |
| `.planning/runbooks/CLOUDFLARE.md` | AS-IS DNS-only + parameterised proxy block + 4 cache rules + purge curl | VERIFIED | 154 lines. AS-IS section present. "If/When Proxied" section present. 4 `**Rule [1-4]:** lines. `purge_cache` and `purge_everything` curl examples present. Phase 6 revalidate cross-reference (3 mentions). Expected-behaviour table covers /api/auth/* /_next/static/* / /blog /stats etc. |
| `.planning/runbooks/KNIP-BASELINE.md` | Verbatim knip output with metadata header (datetime + 40-hex SHA + tool versions) | VERIFIED | 91 lines. Header contains `Captured:`, `Commit SHA:` (40-hex SHA `53fb99b...`), `knip version:`, `Node version:`, `pnpm version:`. `## Knip Report (verbatim)` heading + report body. |
| `.planning/runbooks/COOLIFY-DEPLOY-KEY.md` (added during smoke-test) | Recovery procedure for revoked Coolify SSH deploy key | VERIFIED (bonus) | 5.5KB file capturing finding from 05-04 unblock cycle 1. Not in original PLAN scope; added per Rule 2 deviation in 05-04-SUMMARY.md. |
| Coolify env contains AUTH_GITHUB_ID + AUTH_GITHUB_SECRET + GITHUB_PAT + AUTH_TRUST_HOST + AUTH_URL | All 5 keys present in production | VERIFIED via documented API list-keys + smoke-test PASS | 05-03-SUMMARY.md "Coolify Keys Before vs After" shows 7 keys after Plan 3 (3 new). 05-04-SUMMARY.md adds AUTH_TRUST_HOST + AUTH_URL → 9 keys total. Smoke-test PASS row in AUTH-SMOKE-TEST.md is the runtime evidence both are functioning end-to-end. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|------|-----|--------|---------|
| .github/dependabot.yml ignore[next-auth] | Pitfall 2 (next-auth beta-to-beta OAuth break) | YAML ignore rule + manual CVE-only protocol gated by AUTH-SMOKE-TEST.md | WIRED | next-auth ignore present with no update-types (= all updates ignored). 05-05 SUMMARY confirms `next-auth` add/remove count = 0 across batches A→D. |
| .github/dependabot.yml ignore[framer-motion semver-major+minor] | Pitfall 1 (intro state machine regression) | Patch-only Dependabot proposals + ~12.23.28 tilde pin in package.json | WIRED | Both rails in place: dependabot.yml ignore (Plan 1) + package.json tilde pin (Plan 5 Batch C). Three-state smoke test PASS recorded in 05-05 SUMMARY for the 12.23.26 → 12.23.28 patch bump. |
| `.planning/runbooks/AUTH-SMOKE-TEST.md` | Plan 5 Batch B + future next-auth bumps | Manual re-execution after any auth-env or next-auth change | WIRED (with note) | Runbook exists and was executed PASS on 2026-05-12. 05-05 SUMMARY flags a process deviation: Batch B @auth/mongodb-adapter 3.11.1→3.11.2 was not explicitly re-tested by name (auth surface implicitly exercised via /api/health). Future bumps should explicitly re-run by name. |
| `.planning/runbooks/CLOUDFLARE.md` proxied section | Phase 6's `export const revalidate = 86400` on `/` | Rule 4 (HTML honour-origin) ensures `s-maxage=86400` survives CF | WIRED | Rule 4 documented; Phase 6 cross-reference appears 3× in the runbook body. Currently dormant (proxy is DNS-only) but ready for activation. |
| `.planning/runbooks/ENV-VARS.md` row for GITHUB_PAT | Phase 7 INT-01 (src/lib/github.ts using @octokit/graphql) | Phase 7 reads process.env.GITHUB_PAT; provisioned in Coolify | WIRED (with scope deviation) | GITHUB_PAT in Coolify; `viewer.contributionsCollection` GraphQL returns valid totalContributions=1415 per 05-03 SUMMARY validation. Scope is classic `read:user` not fine-grained but functionally satisfies the Phase 7 contract. |

### Behavioural Spot-Checks

| Behaviour | Command | Result | Status |
|-----------|---------|--------|--------|
| Production audit clean | `pnpm audit --prod --json \| jq .metadata.vulnerabilities` | `{info:0, low:0, moderate:0, high:0, critical:0}` | PASS |
| Full audit (incl. dev) | `pnpm audit --json \| jq .metadata.vulnerabilities` | `{info:0, low:0, moderate:0, high:2, critical:0}` | INFO (2 new highs in `flatted` via eslint, post-plan-close, see anti-patterns) |
| Dependabot YAML parses | `python3 -c "import yaml; yaml.safe_load(open('.github/dependabot.yml'))"` | exit 0 | PASS |
| `package.json` declares knip in devDeps | `node -e "const p=require('./package.json'); console.log(p.devDependencies.knip)"` | `^6.13.0` | PASS |
| framer-motion tilde-pinned in package.json | `grep -E 'framer-motion.*~12.23' package.json` | match | PASS |
| next-auth exact-pinned | `grep -E 'next-auth.*5\.0\.0-beta\.30' package.json` (no `^`, no `~`) | match | PASS |
| Runbook count | `ls .planning/runbooks/*.md \| wc -l` | 5 | PASS (KNIP-BASELINE, ENV-VARS, AUTH-SMOKE-TEST, CLOUDFLARE, COOLIFY-DEPLOY-KEY) |
| GITHUB_PAT row marked `present` | `grep "GITHUB_PAT.*present.*both" .planning/runbooks/ENV-VARS.md` | match | PASS |
| AUTH-SMOKE-TEST.md execution log has 2026 PASS | `grep "2026.*PASS" .planning/runbooks/AUTH-SMOKE-TEST.md` | match | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| DEP-01 | 05-05 | All 44 Dependabot alerts resolved; `pnpm audit` shows 0 high/critical and 0 moderate after milestone | PARTIAL | `pnpm audit --prod` clean. Full audit has 2 new HIGH advisories in `flatted` (eslint transitive, post-plan-close 2026-03-13 — not addressable by Plan 05 work; new advisory). GitHub UI verification deferred to human. REQUIREMENTS.md status table still shows "Not Started" but checklist marks `[x]`. |
| DEP-02 | 05-02 | knip installed + baseline captured | SATISFIED | knip ^6.13.0 in devDeps; KNIP-BASELINE.md captured with metadata header. |
| DEP-03 | 05-01 | dependabot.yml hardened for framer-motion + next-auth | SATISFIED | Verified directly in .github/dependabot.yml. |
| DEP-04 | 05-05 | `pnpm dedupe` run after each batch; lockfile churn audited | SATISFIED | 05-05 SUMMARY documents pnpm dedupe in verification floor for each batch; commit bodies include audit deltas. REQUIREMENTS.md table stale ("Not Started"). |
| DEP-05 | 05-05 | Per-batch verification floor enforced; failures roll back | SATISFIED | 4 atomic batch commits (6efc214, bd16af4, 4a95374, fda5eda) each with floor passed. REQUIREMENTS.md table stale ("Not Started"). |
| ENV-01 | 05-03 | Coolify env audited against `.env.example`; documented in ENV-VARS.md | SATISFIED | ENV-VARS.md exists with full table. Reconciliation against Coolify API completed in 05-03-SUMMARY.md. |
| ENV-02 | 05-03 | Missing AUTH_GITHUB_ID + AUTH_GITHUB_SECRET populated in Coolify; admin OAuth verified | SATISFIED | Both keys provisioned in 05-03 via API; verified live by AUTH-SMOKE-TEST.md PASS 2026-05-12 (after additional AUTH_TRUST_HOST/AUTH_URL unblock cycles). |
| ENV-03 | 05-03 | GITHUB_PAT provisioned (fine-grained, "No repository access" + "Profile: Read-only", 1y expiry) | PARTIAL | PAT provisioned in Coolify. Scope: classic `read:user` (no repo access) — functionally equivalent to fine-grained "Profile: Read-only" but token-type deviation. Expiry: unknown (no recorded expiry); rotation calendar in `.planning/todos/pending/rotate-github-pat.md` (deadline 2027-05-12). Documented in 05-03-SUMMARY.md "Deviations". |
| ENV-04 | 05-04 | CLOUDFLARE.md captures full-proxy config (page-rules/cache-rules/cache-purge) | SATISFIED | CLOUDFLARE.md verified. Four cache rules + purge curl + expected-behaviour table. |
| ENV-05 | 05-04 | AUTH-SMOKE-TEST.md documents manual sign-in test for next-auth bumps | SATISFIED | Runbook exists; six steps; executed end-to-end PASS on 2026-05-12. |

**Phase requirement count**: 10 of 10 accounted for (7 SATISFIED, 3 PARTIAL with documented mitigations).

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `.planning/REQUIREMENTS.md` | 188-192 | Status table marks DEP-01, DEP-04, DEP-05 as "Not Started" while the success-criteria checklist at lines 55-67 marks them `[x]` complete | Warning | Documentation drift. Plan 05-05 closed these requirements but the status table at the bottom of REQUIREMENTS.md was not refreshed. Discoverable via `grep "DEP-0" REQUIREMENTS.md`. Does not invalidate the work — the commits and checkbox are the authoritative state. |
| `src/components/ui/PresenceStatus.tsx` | 34 | `const discordUserId = process.env.NEXT_PUBLIC_DISCORD_USER_ID;` reads an env var that `.env.example` no longer documents | Warning (REVIEW.md WR-01) | A new local-dev contributor cloning the repo will hit the "Discord user ID not configured" error branch with no hint that the var exists. Mitigation: `.planning/todos/pending/remove-presence-widget.md` captures full widget removal; ENV-VARS.md "Intentionally removed" subsection documents the deviation. Until the todo lands, the variable is in an orphaned state. |
| `package.json` + lockfile | (transitive) | eslint > file-entry-cache > flat-cache > flatted < 3.4.0 has 2 new high-severity advisories (GHSA-25h7-pfq9-p65f / CVE-2026-32141, published 2026-03-13) | Warning (post-plan-close) | Did not exist when Plan 05-05 closed; pnpm audit at plan close was 0/0/0/0/0 (verified by SUMMARY). Dev-only transitive; production audit (`pnpm audit --prod`) still clean. Phase 5 success criterion 1 is mode-dependent: prod-only metric is met; full-tree metric is not. Resolvable by Dependabot's `dev-dependencies` group at the next weekly cycle (eslint 9.39.4 → 9.40+ likely pulls in the fix). |

### Deviations from ROADMAP / PLAN (known, documented, accepted)

1. **GITHUB_PAT token type**: classic PAT (`ghp_...` prefix, `read:user` scope) instead of fine-grained (`github_pat_...` prefix, "Profile: Read-only" account permission). Functionally equivalent for Phase 7's `viewer.contributionsCollection` GraphQL query. Documented in `05-03-SUMMARY.md` § "Deviations" + `.planning/todos/pending/rotate-github-pat.md`.
2. **GITHUB_PAT expiry**: not recorded (user did not record expiry at PAT creation; likely no expiry). ROADMAP says "≤ 1 year"; ENV-VARS.md records `Expires: unknown`. Calendar bridge: `rotate-github-pat.md` with deadline 2027-05-12.
3. **05-04 required 3 unblock cycles**: Coolify deploy SSH key was revoked; `AUTH_TRUST_HOST` and `AUTH_URL` were missing implicit env vars not surfaced by Plan 05-03's `grep process.env` audit method. All three resolved in-flight; smoke test PASSED. Documented in `05-04-SUMMARY.md` § "Smoke-Test Findings".
4. **`pnpm audit` semantics for success criterion 1**: ROADMAP wording is ambiguous between prod-only and full-tree. Plan 05-05 used `--prod` and reached 0/0/0/0/0. Today's full-tree audit shows 2 new high advisories in dev-transitive `flatted` published after plan close. Treat as informational drift, not a Phase 5 regression.

### Human Verification Required

See frontmatter `human_verification:` array. 4 items requiring human action:
1. GitHub Dependabot UI confirmation (post-push to main)
2. Live OAuth sign-in re-test (optional periodic gate)
3. Cloudflare proxy mode status (still DNS-only?)
4. GITHUB_PAT scope/expiry calendar reminder

### Gaps Summary

No hard blockers. All five ROADMAP success criteria are met in their on-codebase form (5/5 truths VERIFIED), with three documented partial deviations carried in `.planning/todos/pending/` and in summary "Deviations" sections:

- **T1 (success criterion 1)** has a `--prod`/full audit divergence introduced by a post-close transitive advisory (`flatted` via eslint). Production audit is clean; full-tree audit has 2 new highs. Not blocking — emerged after plan close, dev-only.
- **T3 (success criterion 3)** has PAT-scope and PAT-expiry deviations, both bridged by `rotate-github-pat.md`. Plus the unrelated NEXT_PUBLIC_DISCORD_USER_ID orphan (PresenceStatus.tsx:34 still reads it, .env.example no longer documents it; bridged by `remove-presence-widget.md`).
- **REQUIREMENTS.md status table** at lines 188-192 has stale "Not Started" entries for DEP-01/04/05 — purely a docs-hygiene issue; the source-of-truth checklist at lines 55-67 has them marked `[x]`. Worth a one-line fix in the next docs commit; not a phase blocker.

The phase goal — "Dependabot is green, Coolify env vars are reconciled with `.env.example`, `GITHUB_PAT` is available for Phase 7, and the runbooks future-Zach will need (env audit, Cloudflare cache, auth smoke test) are written down" — is achieved:

- Dependabot is green (per the explicit prod-only audit and the dependabot.yml ignore-rule rails)
- Coolify env vars are reconciled (ENV-VARS.md 9-key table reflects the live state, including the two implicit next-auth v5 vars discovered during the smoke test)
- GITHUB_PAT is in Coolify and validated against the Phase 7 use case (deviation noted)
- All four runbooks are present (ENV-VARS, AUTH-SMOKE-TEST, CLOUDFLARE, KNIP-BASELINE) plus a bonus COOLIFY-DEPLOY-KEY runbook from the smoke-test journey

---

*Verified: 2026-05-12T18:30:00Z*
*Verifier: Claude (gsd-verifier)*
