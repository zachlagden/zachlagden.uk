# Phase 5: Dependency Hardening + Env Config - Context

**Gathered:** 2026-05-12
**Status:** Ready for planning
**Mode:** `--auto` — recommended options selected without interactive prompts; review the Implementation Decisions section before planning if any choice should be overridden.

<domain>
## Phase Boundary

Resolve all 44 open Dependabot alerts (19 high + 19 moderate + 6 low) on `main`, harden Dependabot's future behaviour against the two regression vectors known to break this codebase (Framer Motion intro state machine; `next-auth` beta-to-beta OAuth contract), reconcile Coolify env vars against `.env.example`, provision the `GITHUB_PAT` that Phase 7 will consume, and capture the three runbooks future-Zach will need (env audit, Cloudflare proxy/cache, auth smoke test). Add `knip` as a devDep with a baseline report committed for v3 regression comparison.

**In scope:** DEP-01..05 + ENV-01..05 (10 requirements). Per-batch verification floor `tsc --noEmit && pnpm lint && pnpm build` MUST pass before each batch merges.

**Out of scope:** Any feature work, Sentry restoration, test framework introduction, framework migrations. Bumping `framer-motion` past `~12.23.x` until v2.0 ships. Bumping `next-auth` for any non-CVE reason.

</domain>

<decisions>
## Implementation Decisions

### Dependabot Batching & Merge Protocol (DEP-01, DEP-04, DEP-05)

- **D-01:** Resolve the 44 alerts in **four sequential batches**, each its own PR, each gated by the verification floor `tsc --noEmit && pnpm lint && pnpm build` AND `pnpm dedupe` AND `pnpm audit` before merge:
  - **Batch A — Dev dependencies (low risk):** `eslint`, `eslint-config-next`, `prettier`, `typescript`, `@types/*`, `@tailwindcss/postcss`, `tailwindcss`, `sharp`. Merge first.
  - **Batch B — Next + React ecosystem (version-locked):** `next`, `react`, `react-dom`, `@next/third-parties`, `eslint-config-next` (must move together — `eslint-config-next` version pins to `next`). Merge second; smoke-test `/blog` route renders.
  - **Batch C — Framer Motion ALONE in its own commit:** `framer-motion` patch-level only (`~12.23.26` → latest `12.23.x`). Merged third with mandatory home-route smoke test in three states: (a) cold load, `prefers-reduced-motion: no-preference`; (b) cold load, reduced-motion; (c) navigate `/blog` → `/` (intro must skip; `intro-locked` must clear). NEVER bundled with anything else.
  - **Batch D — Transitive cleanup:** Run `pnpm audit --fix` for any remaining advisories, then `pnpm dedupe`. Manual override for hold-outs documented in PR description.
  - **`mongodb` and `@auth/mongodb-adapter` MUST move together** in whichever batch (likely B or as its own micro-batch); the adapter version tracks the driver tightly.
- **D-02:** A failing batch rolls back atomically (revert the merge commit). No "fix forward in main" — the per-batch contract is all-or-nothing.

### Framer Motion Pinning (DEP-03)

- **D-03:** Pin `framer-motion` to a tilde range `~12.23.26` in `package.json` (patch-only via tilde range). Belt-and-suspenders: also configure `.github/dependabot.yml` to `ignore` `framer-motion` for `version-update:semver-major` and `version-update:semver-minor` so Dependabot only proposes patch bumps. Reason: no test framework + intro animation lives in one ~300-line FSM that recent commits churned heavily; runtime regressions are invisible to `tsc --noEmit && pnpm lint`.

### `next-auth` Beta Handling (DEP-03)

- **D-04:** Configure `.github/dependabot.yml` with `ignore: { dependency-name: "next-auth" }` for ALL update types. The dep moves only on a manual CVE-triggered bump, accompanied by a successful run of the AUTH-SMOKE-TEST.md runbook (D-09). Pair the bump with the matching `@auth/mongodb-adapter` version per Auth.js docs of the day.

### Coolify Env Audit Method (ENV-01)

- **D-05:** Reconcile env vars by **API-driven dump**: query the Coolify API at `https://coolify.lagden.dev` (token in `~/.claude/credentials/personal-infra.md`, chmod 600) for the zachlagden.uk app's env-var list, diff against `.env.example`, and write a three-column table (Variable / Status `present|missing|obsolete` / Source `Coolify|.env.example|both`) to `.planning/runbooks/ENV-VARS.md`. Reproducible — re-runnable any time without UI clicks. Manual UI inspection is the fallback only if the API call returns 0 rows or fails.

### `GITHUB_PAT` Provisioning (ENV-02, ENV-03)

- **D-06:** Provision `GITHUB_PAT` in **Phase 5, immediately** (not lazy-loaded in Phase 7). Token type: **fine-grained personal access token**. Repository access: **No repository access**. Account permissions: **Profile: Read-only**. Expiry: **1 year max** (forces rotation cadence). Add to Coolify env via API. Record in ENV-VARS.md "present" column. Phase 7 hand-off requires this exact configuration — confirmed against PITFALLS.md Pitfall 7 (lines 189–217).
- **D-07:** Populate the missing `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` in Coolify (per ENV-02 — currently absent, blocking admin OAuth in production). Verify by completing AUTH-SMOKE-TEST.md end-to-end against the prod URL.

### `knip` Baseline (DEP-02)

- **D-08:** Install `knip` as a `devDependency`. Generate the baseline by running `pnpm dlx knip --reporter markdown > .planning/runbooks/KNIP-BASELINE.md` from a clean working tree on the v2-open commit. Commit verbatim — no curation. Header includes capture date and the commit SHA so v3 regression comparison has a known reference point. Justification: signal preservation > aesthetics; future-Zach diffs raw output, not summaries.

### AUTH-SMOKE-TEST.md Runbook Depth (ENV-05)

- **D-09:** Text-only six-step checklist, no screenshots. Steps:
  1. Sign out of `/admin/blog` (clear session cookies).
  2. Visit `/admin/blog` — expect redirect to GitHub OAuth.
  3. Authorize via GitHub, return to `/admin/blog`.
  4. Open DevTools console, run `(await fetch('/api/auth/session').then(r => r.json())).user.isAdmin === true` — expect `true`.
  5. Create + save a dummy draft post; verify it persists via list refresh.
  6. Sign out — verify session clears and `/admin/blog` redirects to OAuth again.
  Run after every `next-auth` bump, every `@auth/mongodb-adapter` bump, and once per Coolify deploy that touches auth env vars. Screenshots rot in months; text steps survive.

### CLOUDFLARE.md Runbook Scope (ENV-04)

- **D-10:** Document **current DNS-only mode** as the authoritative state (per `~/.claude/credentials/personal-infra.md`). Add a parameterised "if/when proxied" section covering: (a) which page-rules / cache-rules to set so Next `Cache-Control` headers (especially the `revalidate: 86400` ISR header Phase 6 will add to `/`) are honoured end-to-end; (b) the `curl` cache-purge command for the API token; (c) expected cache behaviour for `/stats`, `/now`, `/freelance` and the `/api/*` routes (must stay uncached). Open question #1 (proxy mode confirmation) is recorded inline — does NOT block Phase 5; the future-state block is dormant until user flips proxy mode.

### Inherited Locked Decisions (do NOT re-evaluate during planning)

The following are locked at the milestone level (PROJECT.md + research/SUMMARY.md). Planner MUST NOT propose alternatives:

- **Verification floor:** `tsc --noEmit && pnpm lint && pnpm build` per batch — `pnpm build` is the only line of defence for Turbopack/Coolify regressions since there is no test framework.
- **Serial phase execution 5 → 6 → 7 → 8** — no parallelisation; later phases share `public/content.json` schema.
- **`knip` over `depcheck`** — better Next 16 / TS 5 awareness.
- **Native `Date` for age** — Phase 6 concern; flagged here so dep batches don't preemptively add `date-fns`/`dayjs` to satisfy a transitive.
- **`@octokit/graphql` over full `octokit`** and **`schema-dts` type-only** — Phase 7/8 concerns; flagged here so they don't accidentally land in Phase 5 batches.
- **Sentry stays removed** — no observability dep should land in any batch.

### Claude's Discretion

- Exact ordering within Batch A (alphabetical vs by package size — either is fine).
- Whether to split Batch B into B1 (Next/React) and B2 (`@next/third-parties` + `eslint-config-next` follow-ups) if `pnpm dedupe` reveals deep transitives.
- Whether the AUTH-SMOKE-TEST runbook lives at `.planning/runbooks/AUTH-SMOKE-TEST.md` or `docs/runbooks/AUTH-SMOKE-TEST.md` — research recommends `.planning/runbooks/`, but if the planner sees a stronger reason to surface it in `docs/`, fine.
- Whether to upgrade the existing `dev-dependencies` Dependabot group rule (currently broad `@types/*`, `eslint*`, `prettier*`, `typescript`, `autoprefixer`, `postcss`, `tailwindcss*`) or replace it entirely with a tighter Phase-5-aware grouping.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and requirements
- `.planning/PROJECT.md` — milestone goals, locked decisions, out-of-scope items
- `.planning/REQUIREMENTS.md` §"Dependency Hardening" + §"Environment & Runbooks" — DEP-01..05 + ENV-01..05 (10 requirements)
- `.planning/ROADMAP.md` §"Phase 5: Dependency Hardening + Env Config" — Goal + 5 success-criteria predicates
- `.planning/STATE.md` — current position, accumulated decisions, deferred items

### Research grounding (locked)
- `.planning/research/SUMMARY.md` §"Locked Cross-Cutting Decisions" + §"Phase 5 — Dep hardening + env config" + §"Build Order" — ALL locked
- `.planning/research/PITFALLS.md` Pitfall 1 (Framer Motion intro state machine), Pitfall 2 (`next-auth` beta-to-beta OAuth contract), Pitfall 7 (PAT over-scoping, lines 189–217)
- `.planning/research/STACK.md` §"Phase 5" — anti-deps list and per-batch protocol
- `.planning/research/FEATURES.md` §"Phase 5" — table-stakes vs differentiators vs anti-features for this phase

### Codebase context
- `.planning/codebase/STACK.md` — current versions and pin strategy
- `.planning/codebase/CONCERNS.md` — known concerns (most relevant: render-loop classes, missing observability)
- `.planning/codebase/STRUCTURE.md` — file layout context for runbook placement decisions

### Files to be modified or referenced
- `.github/dependabot.yml` — current Dependabot config to amend with `next-auth` ignore + `framer-motion` non-patch ignore
- `.github/workflows/lint.yml` and `.github/workflows/prettier.yml` — current CI gates; verify floor is enforced via these and not bypassed
- `package.json` — current deps + `packageManager: "pnpm@10.33.0"` pin
- `.env.example` — env audit reference; Required vars: `MONGODB_URI`, `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `ADMIN_GITHUB_USERNAME`. Optional: `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_DISCORD_USER_ID`. NEW for v2: `GITHUB_PAT`.

### Operational credentials
- `~/.claude/credentials/personal-infra.md` (chmod 600) — Coolify API endpoint `https://coolify.lagden.dev`, SSH alias `personal-vps`, current Cloudflare proxy mode

### Runbooks to be created
- `.planning/runbooks/ENV-VARS.md` (NEW) — env var audit per ENV-01
- `.planning/runbooks/AUTH-SMOKE-TEST.md` (NEW) — auth flow per ENV-05
- `.planning/runbooks/CLOUDFLARE.md` (NEW) — proxy + cache config per ENV-04
- `.planning/runbooks/KNIP-BASELINE.md` (NEW) — unused-code baseline per DEP-02

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- `.github/dependabot.yml` — already has `groups:` (next-ecosystem, dev-dependencies, security-updates), `ignore:` for Node major versions, weekly schedule. Amend rather than rewrite.
- `.github/workflows/lint.yml` and `.github/workflows/prettier.yml` — pin Node 20 + pnpm cache; they ALREADY enforce part of the floor on PR. The missing piece is `pnpm build` — currently neither workflow runs it. Plan-phase should consider whether to add a `build.yml` workflow OR keep `pnpm build` as a manual per-batch local check (research-aligned: manual local check is acceptable for v2.0 since Coolify build is the production gate).
- `Dockerfile` — pins Node 20 Alpine + Corepack pnpm; defines `HEALTHCHECK` against `/api/health`. Verifies health-check passes after each Coolify redeploy (post-batch).
- `package.json` `packageManager: "pnpm@10.33.0"` — recently pinned (commit `41657a0`) to fix Coolify Corepack/Node 20 mismatch. Dependabot proposing pnpm major bumps could break this; consider adding `pnpm` to dependabot ignore.
- `pnpm-lock.yaml` — lockfileVersion 9.0; `pnpm dedupe` is the canonical post-batch cleanup.

### Established Patterns

- **Atomic commits gated by verification:** v1 shipped 23 reqs across 20 atomic source commits with `tsc --noEmit && pnpm lint` per batch. Same discipline extends to `+ pnpm build` for v2.
- **Runbooks live in `.planning/runbooks/`:** No runbooks exist yet (`ls .planning/runbooks/` empty), but `.planning/quick/`, `.planning/codebase/`, `.planning/research/` show the convention — single subdirectory per concern, markdown only.
- **Quick batch atomic git commits** with `Co-Authored-By: Claude` footer per global git workflow standard. Conventional-commits format: `chore(deps): bump <package> from X to Y` for Dependabot batches; `docs(runbooks): add ENV-VARS audit` for runbooks.

### Integration Points

- **`next.config.ts`** — already exports security headers (SEC-02/03 from v1). No Phase 5 changes expected here, but a `next` major bump could regress the headers shape; smoke-test response headers in Batch B.
- **`src/lib/auth.ts`** — `getAdapter()` now `console.error`s on init failure (SEC-04, v1). Use Coolify container logs to verify after AUTH-SMOKE-TEST run.
- **Coolify deploy via Dockerfile + persistent volume** — every batch merge triggers a redeploy. Watch the build log for `MongoServerSelectionError` floods (v1 known concern, mostly mitigated; could regress on `mongodb` driver bump).

</code_context>

<specifics>
## Specific Ideas

- **`AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` are confirmed missing from Coolify** (per ENV-02 + STATE.md). Sign-in via GitHub at `/admin/blog` is currently broken in production. Phase 5 plan must surface this as the first env-fix action so the rest of the smoke-test gating is verifiable.
- **`GITHUB_PAT` exact scopes** (from research/PITFALLS.md Pitfall 7 (lines 189–217) + STATE.md user input):
  - Token type: fine-grained personal access token
  - Repository access: **No repository access**
  - Account permissions: **Profile: Read-only**
  - Expiry: 1 year maximum (rotation forcing function)
  - Storage: Coolify env (write); 1Password vault (write); ENV-VARS.md "present" column (no value, just attestation)
- **Cloudflare proxy mode is currently DNS-only** per `~/.claude/credentials/personal-infra.md`. CLOUDFLARE.md documents this as the source-of-truth state; the future-state block is informational for when the user decides to proxy. Open question #1 (research/SUMMARY.md) explicitly does not block Phase 5.
- **`pnpm audit` thresholds:** `0 high/critical AND 0 moderate` after milestone close (per DEP-01). `low` advisories are tolerated only if no fix is available — document each in a "Known Low Advisories" appendix to KNIP-BASELINE.md.
- **No CI build gate yet:** `.github/workflows/` runs lint + prettier on PR but does NOT run `pnpm build`. Per-batch `pnpm build` is enforced manually before merge. If the planner sees value in adding a `build.yml` workflow, that's an acceptable stretch goal — but not required by any of DEP-01..05 or ENV-01..05.

</specifics>

<deferred>
## Deferred Ideas

- **Add `pnpm build` to CI** as a third workflow (`build.yml`). Stretch goal — Phase 5 success criteria can be met with manual per-batch builds. If added, should be a separate atomic commit after the dep batches land so it doesn't conflict with merge churn.
- **Auto-merge for patch-level Dependabot PRs** — possible v3 improvement once the per-batch protocol is proven manually. NOT for v2 (manual gating is the safety net while there are no tests).
- **Migration to renovate** from Dependabot for richer batching/grouping — out of scope; Dependabot's `groups:` + `ignore:` is sufficient for v2 with the rules in D-03/D-04.
- **`pnpm` major-version ignore in dependabot.yml** — flagged in code_context. Add if the planner agrees; otherwise track for v3.
- **Test framework introduction (Vitest)** — already deferred to v3 (TEST-01/02 in REQUIREMENTS Future Requirements section).
- **Sentry restoration** — explicitly out of scope per PROJECT.md Constraints.

</deferred>

---

*Phase: 05-dependency-hardening-env-config*
*Context gathered: 2026-05-12 (--auto mode)*
