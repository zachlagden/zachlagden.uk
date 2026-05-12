# Phase 5: Dependency Hardening + Env Config - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-12
**Phase:** 05-dependency-hardening-env-config
**Mode:** `--auto` (single-pass, recommended options auto-selected — no interactive AskUserQuestion calls)
**Areas discussed:** Dependabot batching, framer-motion pinning, next-auth ignore policy, Coolify env audit method, GITHUB_PAT scope/timing, knip baseline format, AUTH-SMOKE-TEST runbook depth, CLOUDFLARE.md scope

---

## Dependabot Batching & Merge Protocol

| Option | Description | Selected |
|--------|-------------|----------|
| Sequential 4-batch with verification floor between merges; framer-motion isolated | A=dev deps, B=Next/React, C=framer-motion alone, D=transitive cleanup. `tsc + lint + build + dedupe + audit` between each. | ✓ |
| Single bulk merge of all 44 alerts | One PR; minimal review overhead | |
| Severity-grouped (high/moderate/low as separate PRs) | Easier triage but ignores ecosystem coupling | |
| Per-package PRs (44 separate merges) | Maximum granularity; impractical merge churn | |

**Selection rationale:** Recommended per `.planning/research/PITFALLS.md` Pitfall 1 + Pitfall 2; ecosystem coupling (Next + React + eslint-config-next) and intro-animation regression risk make framer-motion isolation mandatory.

---

## Framer Motion Pinning

| Option | Description | Selected |
|--------|-------------|----------|
| Tilde range `~12.23.x` AND dependabot ignore for non-patch | Belt-and-suspenders: package.json + dependabot config | ✓ |
| Tilde range only | Trust dependabot to respect tilde semantics | |
| Dependabot ignore only | Leave caret in package.json, let CI block bumps | |
| Exact pin `12.23.26` | Maximum pin; loses security patches | |

**Selection rationale:** No test framework + intro animation lives in one ~300-line FSM that recent commits churned heavily; runtime regressions invisible to `tsc + lint`. Belt-and-suspenders justified.

---

## next-auth Ignore Policy

| Option | Description | Selected |
|--------|-------------|----------|
| Full ignore (manual bump only on CVE) | `dependency-name: "next-auth"` blocks all update types | ✓ |
| Allow patches only | Block major/minor; let beta-patch bumps through | |
| No ignore (current state) | Continue accepting Dependabot proposals | |

**Selection rationale:** PITFALLS Pitfall 2 — Auth.js v5 explicitly makes breaking changes between betas. Single admin user means broken auth is silent and unrecoverable without local-dev access. Manual gate forces AUTH-SMOKE-TEST.md run on every bump.

---

## Coolify Env Audit Method

| Option | Description | Selected |
|--------|-------------|----------|
| API dump diffed against `.env.example`, three-column table | Reproducible; script-friendly; no UI clicks | ✓ |
| Manual UI inspection + screenshots | Human-verifiable; rots fast | |
| Hybrid (API for present/missing; manual for obsolete confirmation) | Compromise; more work | |

**Selection rationale:** Coolify API at `https://coolify.lagden.dev` documented in `~/.claude/credentials/personal-infra.md`; reproducible audit beats one-shot screenshots.

---

## GITHUB_PAT Scope & Provisioning Timing

| Option | Description | Selected |
|--------|-------------|----------|
| Provision now in Phase 5; fine-grained, "No repo access" + "Profile: Read-only", 1y expiry | Phase 7 hand-off unblocked; minimal blast radius | ✓ |
| Provision lazy in Phase 7 when needed | Defers credential management | |
| Use classic PAT with `read:user` scope | Simpler; broader-scoped historically | |
| Use a GitHub App instead of PAT | Better long-term; over-engineered for one-user portfolio | |

**Selection rationale:** ENV-03 requirement is explicit. PITFALLS Pitfall 4 mandates fine-grained + minimal scope. Phase 7 dependency on env presence makes upfront provisioning the safer ordering.

---

## knip Baseline Format

| Option | Description | Selected |
|--------|-------------|----------|
| Verbatim markdown report (`pnpm dlx knip --reporter markdown`) | Preserve signal; raw diff for v3 | ✓ |
| Curated highlights with prose explanations | Easier to read; loses signal | |
| JSON output for tooling | Machine-readable; harder for humans | |

**Selection rationale:** DEP-02's purpose is regression comparison for v3. Signal preservation > aesthetics; future-Zach diffs raw output. Date + commit SHA in header gives the comparison anchor.

---

## AUTH-SMOKE-TEST Runbook Depth

| Option | Description | Selected |
|--------|-------------|----------|
| 6-step text checklist (sign-out → OAuth → DevTools session check → editor → save → sign-out) | Survives screenshot rot; copy-pastable curl/console commands | ✓ |
| Full screenshot-backed flow | Visually verifiable; rots in months as UI shifts | |
| Automated test (Vitest + Playwright) | Highest fidelity; out of scope (no test framework) | |

**Selection rationale:** Test framework is deferred to v3 (TEST-01/02). Text-only checklist is the right fidelity for a manual smoke test triggered ≤ once per next-auth bump.

---

## CLOUDFLARE.md Runbook Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Current DNS-only AS-IS + parameterised cache-rules block for future proxy mode | Documents present truth; ready when user flips proxy | ✓ |
| Current DNS-only only (no future-state) | Minimal but leaves Phase 6 ISR cache behaviour undocumented | |
| Full proxy mode plan (assume future flip) | Premature; user open question #1 not answered | |
| Skip — defer to when proxy mode is actually flipped | Loses the runbook habit | |

**Selection rationale:** Open question #1 (proxy mode confirmation) explicitly does NOT block Phase 5. Documenting both states gives Phase 6's `revalidate: 86400` ISR header a clear cache-interaction story without blocking on user input.

---

## Claude's Discretion

- Exact ordering within Batch A (alphabetical vs by package size).
- Whether to split Batch B into B1/B2 sub-batches if `pnpm dedupe` reveals deep transitives.
- Whether AUTH-SMOKE-TEST.md lives at `.planning/runbooks/` (recommended) or `docs/runbooks/`.
- Whether to amend the existing dependabot `dev-dependencies` group rule or replace it with a tighter Phase-5-aware grouping.

## Deferred Ideas

- Add `pnpm build` as a third CI workflow (`build.yml`) — stretch goal; manual per-batch build is sufficient for Phase 5 success criteria.
- Auto-merge for patch-level Dependabot PRs — possible v3 improvement once the manual protocol is proven.
- Migrate from Dependabot to Renovate for richer grouping — out of scope; Dependabot is sufficient with D-03/D-04 rules.
- Add `pnpm` to dependabot ignore for major-version bumps (just-pinned to `10.33.0` for Coolify Corepack stability) — flagged in CONTEXT code_context; planner may include if low-cost.
- Test framework introduction (Vitest) — already deferred to v3 (TEST-01/02).
- Sentry restoration — explicitly out of scope per PROJECT.md.
