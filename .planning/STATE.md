---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: Polish, Integrations & Freelance
status: verifying
stopped_at: Completed 05-04-PLAN.md
last_updated: "2026-05-12T15:54:15.888Z"
last_activity: 2026-05-12
progress:
  total_phases: 8
  completed_phases: 1
  total_plans: 5
  completed_plans: 5
  percent: 100
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-12)

**Core value:** The site renders correctly and stays up — no blank pages, no 500s, regardless of MongoDB availability or transient runtime errors.
**Current focus:** Phase 05 — dependency-hardening-env-config

## Current Position

Phase: 05 (dependency-hardening-env-config) — EXECUTING
Plan: 5 of 5
Status: Phase complete — ready for verification
Last activity: 2026-05-12

**Execution order (serial, hard):** Phase 5 → 6 → 7 → 8. No parallelisation — three later phases share `public/content.json` schema; serial keeps `tsc --noEmit` honest.

## Performance Metrics

**Velocity:**

- Total plans completed: 0
- Average duration: —
- Total execution time: 0.0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1–4 (v1) | n/a (quick batch) | — | — |
| 5 | 0 | — | — |
| 6 | 0 | — | — |
| 7 | 0 | — | — |
| 8 | 0 | — | — |

**Recent Trend:**

- Last 5 plans: —
- Trend: —

*Updated after each plan completion*
| Phase 05 P1 | 3min | 2 tasks | 1 files |
| Phase 05 P2 | 4min | 3 tasks | 3 files |
| Phase 05 P3 | 6min | 4 tasks | 4 files |
| Phase 05 P04 | 90min | 4 tasks | 5 files |
| Phase 05 P05 | 105min | 9 tasks | 2 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- v2.0 init: Phase numbering continues from v1 (5–8); no reset. v1 work was done as `/gsd-quick` tasks, so no phase directories exist to archive.
- v2.0 init: Verification floor extended to `tsc --noEmit && pnpm lint && pnpm build` per batch (added `pnpm build` beyond v1 — Docker/Coolify regression catch).
- v2.0 init: Phase execution is HARD-serial 5 → 6 → 7 → 8. Three later phases extend the same `public/content.json` + `src/types/content.ts`; parallel execution would cause schema drift (Pitfall 23).
- v2.0 init: Locked cross-cutting decisions (do NOT re-evaluate during planning): native `Date` for age, `@octokit/graphql` over full octokit, `schema-dts` type-only, `knip` over `depcheck`, Tokscale via public SVG embed, RSS subscriber count cut.
- v2.0 init: Out-of-scope items locked: FAQ, `LocalBusiness` schema, testimonials, mocked case studies, programmatic town pages, Sentry restoration, Vercel migration, test suite.
- v2.0 init: Deferred-from-v1 items (TEST-01/02, INFRA-01, POLISH-04) remain deferred to v3.
- [Phase 05]: Phase 5 Plan 1: omitted update-types for next-auth ignore (cleanest expression of 'ignore ALL update types' per Dependabot docs)
- [Phase 05]: Phase 5 Plan 1: added exclude-patterns to BOTH next-ecosystem AND security-updates Dependabot groups (belt-and-suspenders against group-rule precedence ambiguity per T-05-05)
- [Phase 05]: Phase 5 Plan 1: framer-motion ~12.23.26 package.json range pin OWED to Plan 05 Batch C (rail 2 of 2; this plan only added Dependabot rail 1)
- [Phase ?]: [Phase 05]: Phase 5 Plan 2: kept pnpm dlx download progress lines verbatim in KNIP-BASELINE.md (D-08 signal preservation > aesthetics)
- [Phase ?]: [Phase 05]: Phase 5 Plan 2: knip 6.13.0 baseline = 3 unused files + 1 unused devDep + 18 unused exports + 16 unused exported types; acting on findings deferred to v3 per D-08
- [Phase ?]: [Phase 05]: Phase 5 Plan 2: no Node engine fallback to knip@^5 needed (Node v22.22.2 satisfies knip 6.x requirement)
- [Phase ?]: Phase 05 Plan 3: Coolify single-POST pattern (is_preview=false auto-creates paired preview entry) matches existing AUTH_SECRET/MONGODB_URI shape
- [Phase ?]: Phase 05 Plan 3: classic PAT with read:user scope accepted over D-06 fine-grained spec (functionally equivalent for Phase 7; rotate-github-pat.md tracks v3 hardening)
- [Phase ?]: Phase 05 Plan 3: removed NEXT_PUBLIC_DISCORD_USER_ID + NEXT_PUBLIC_GA_ID from .env.example (presence widget deletion deferred to remove-presence-widget.md; GA ID sourced from content.json)
- [Phase ?]: Phase 5 Plan 4: bundled smoke-test discoveries (AUTH_TRUST_HOST, AUTH_URL, deploy-key recovery) into single atomic commit instead of plan literal 'exactly two files' criterion
- [Phase ?]: Phase 5 Plan 4: created COOLIFY-DEPLOY-KEY.md as standalone runbook (different blast radius and audience from CLOUDFLARE.md)
- [Phase ?]: Phase 5 Plan 4: audit-method gap identified — grep process.env.* misses framework-internal env vars (next-auth v5 AUTH_TRUST_HOST + AUTH_URL); future audits need framework-runtime-config doc lookup pass
- [Phase ?]: Phase 5 Plan 5: Batch D scope collapsed — only postcss override needed (8 of 10 candidates were no-op; lucide-react 0→1 deferred due to brand-icon removal)
- [Phase ?]: Phase 5 Plan 5: postcss <8.5.10 closed via pnpm.overrides surgical pin ('postcss@<8.5.10': '>=8.5.10') — keeps Tailwind v4's direct postcss path untouched
- [Phase ?]: Phase 5 Plan 5: lucide-react 1.x bump deferred — v1 removes brand icons (Github, Linkedin, Instagram used in 4 files); icon-substitution work needs its own plan
- [Phase ?]: Phase 5 Plan 5: all four batches (A=dev, B=Next/React/Mongo, C=framer-motion 12.23.28, D=postcss override) closed pnpm audit from 20 advisories → 0 across all severities

### Pending Todos

None yet.

### Blockers/Concerns

User-input items to gather during Phase 7 / Phase 8 planning (research/SUMMARY.md "Open Questions"):

- Cloudflare proxy mode (DNS-only vs full proxy) — affects ENV-04 runbook contents
- GitHub PAT type confirmation (fine-grained recommended) — needed for ENV-03 → INT-01
- Cal.com booking URL — needed for FREE-11
- Pricing tier final numbers confirmation — needed for FREE-03
- Past-work client clearance for citation — needed for FREE-08
- Pricing layout 3+1 sign-off — needed for FREE-03

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260506-dyv | STAB-01 + STAB-02: add error boundaries (app/error.tsx, app/global-error.tsx) | 2026-05-06 | 909d7f2 | [260506-dyv-stab-01-stab-02-add-error-boundaries-app](./quick/260506-dyv-stab-01-stab-02-add-error-boundaries-app/) |
| 260506-e2t | STAB-03 + STAB-04: intro animation race fixes (font-ready timeout, rAF cancel guard) | 2026-05-06 | 6edb503 | [260506-e2t-stab-03-stab-04-intro-animation-race-fix](./quick/260506-e2t-stab-03-stab-04-intro-animation-race-fix/) |
| 260506-e71 | STAB-05: centralise intro-locked lifecycle to home route only | 2026-05-06 | b1dfac3 | [260506-e71-stab-05-centralise-intro-locked-removal-](./quick/260506-e71-stab-05-centralise-intro-locked-removal-/) |
| 260506-ech | SEC-02 + SEC-03: security headers and poweredByHeader in next.config.ts | 2026-05-06 | fea6904 | [260506-ech-sec-02-sec-03-security-headers-and-power](./quick/260506-ech-sec-02-sec-03-security-headers-and-power/) |
| 260506-ee3 | SEC-04: auth adapter fail-loud logging | 2026-05-06 | 58daa80 | [260506-ee3-sec-04-auth-adapter-fail-loud](./quick/260506-ee3-sec-04-auth-adapter-fail-loud/) |
| 260506-efn | SEC-01: explicit allow-list schema for rehype-sanitize | 2026-05-06 | 16060dd | [260506-efn-sec-01-explicit-rehype-sanitize-schema-i](./quick/260506-efn-sec-01-explicit-rehype-sanitize-schema-i/) |
| 260506-eh4 | SEC-05: drop SVG, magic-number sniff blog uploads | 2026-05-06 | 89597f5 | [260506-eh4-sec-05-drop-svg-magic-number-sniff-for-b](./quick/260506-eh4-sec-05-drop-svg-magic-number-sniff-for-b/) |
| 260506-eig | DOC-01: rewrite README to match current architecture | 2026-05-06 | 5900a69 | [260506-eig-doc-01-rewrite-readme-to-match-current-a](./quick/260506-eig-doc-01-rewrite-readme-to-match-current-a/) |
| 260506-ekf | PERF-01: stabilise sectionRefs prop to useSectionObserver | 2026-05-06 | b5fdb0f | [260506-ekf-perf-01-stabilise-sectionrefs-prop-to-us](./quick/260506-ekf-perf-01-stabilise-sectionrefs-prop-to-us/) |
| 260506-elm | PERF-02: PresenceStatus polling backoff + visibility gating | 2026-05-06 | 4931ff6 | [260506-elm-perf-02-presencestatus-polling-backoff-v](./quick/260506-elm-perf-02-presencestatus-polling-backoff-v/) |
| 260506-enh | PERF-03: CustomCursor event delegation | 2026-05-06 | e8fedc3 | [260506-enh-perf-03-customcursor-event-delegation](./quick/260506-enh-perf-03-customcursor-event-delegation/) |
| 260506-et0 | PERF-04: BlogSearch skip initial empty-query fetch | 2026-05-06 | 5ea16d3 | [260506-et0-perf-04-blogsearch-skip-initial-empty-qu](./quick/260506-et0-perf-04-blogsearch-skip-initial-empty-qu/) |
| 260506-euf | CLEAN-01..03: delete dead code, dead deps, stale config | 2026-05-06 | 44de169 | [260506-euf-clean-01-03-delete-dead-code-and-stale-c](./quick/260506-euf-clean-01-03-delete-dead-code-and-stale-c/) |
| 260506-ew4 | CLEAN-04: useAutoSave quota-safe + restore-on-mount | 2026-05-06 | fefc60c | [260506-ew4-clean-04-useautosave-quota-safe-restore-](./quick/260506-ew4-clean-04-useautosave-quota-safe-restore-/) |
| 260506-exp | CLEAN-05: invoke ensureIndexes on first DB use | 2026-05-06 | 7ba4c33 | [260506-exp-clean-05-invoke-ensureindexes-on-first-d](./quick/260506-exp-clean-05-invoke-ensureindexes-on-first-d/) |
| 260506-eyt | CLEAN-06: ESLint exhaustive-deps + no-floating-promises | 2026-05-06 | cc8561e | [260506-eyt-clean-06-eslint-exhaustive-deps-no-float](./quick/260506-eyt-clean-06-eslint-exhaustive-deps-no-float/) |
| 260506-f2v | CLEAN-07 + CLEAN-08: rehype-slug headings and real sitemap dates | 2026-05-06 | ae144e2 | [260506-f2v-clean-07-clean-08-rehype-slug-headings-a](./quick/260506-f2v-clean-07-clean-08-rehype-slug-headings-a/) |
| 260506-frq | POLISH-01..03 + POLISH-06: deferred polish batch | 2026-05-06 | 21807e1 | [260506-frq-polish-01-03-06-deferred-polish-batch](./quick/260506-frq-polish-01-03-06-deferred-polish-batch/) |
| 260506-fu2 | POLISH-05: image compression (~290 KB saved) | 2026-05-06 | 297aedf | [260506-fu2-polish-05-image-compression](./quick/260506-fu2-polish-05-image-compression/) |
| 260512-d2o | Pin pnpm to 10.33.0 via packageManager to unblock prod Docker build | 2026-05-12 | 41657a0 | [260512-d2o-pin-pnpm-to-10-33-0-via-packagemanager-f](./quick/260512-d2o-pin-pnpm-to-10-33-0-via-packagemanager-f/) |

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| Testing | TEST-01 (Vitest + integration tests for auth/blog libs) | Deferred to v3 | v1 close (2026-05-06) |
| Testing | TEST-02 (Smoke tests for intro state machine + observer hooks) | Deferred to v3 | v1 close (2026-05-06) |
| Infrastructure | INFRA-01 (Migrate `public/uploads/` to Cloudflare R2) | Deferred to v3 | v1 close (2026-05-06) |
| Polish | POLISH-04 (Audit Framer Motion, replace trivial fades with CSS) | Deferred to v3 | v1 close (2026-05-06) |

## Session Continuity

Last session: 2026-05-12T15:53:52.101Z
Stopped at: Completed 05-04-PLAN.md
Resume file: None
