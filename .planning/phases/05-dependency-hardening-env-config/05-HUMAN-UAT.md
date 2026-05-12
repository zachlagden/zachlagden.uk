---
status: partial
phase: 05-dependency-hardening-env-config
source: [05-VERIFICATION.md]
started: 2026-05-12T15:38:00Z
updated: 2026-05-12T15:38:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. GitHub Dependabot alerts page on `main` shows 0 open alerts
expected: After pushing local main (currently 22 commits ahead of origin/main) to origin, the GitHub repo's Dependabot alerts page (https://github.com/zachlagden/zachlagden.uk/security/dependabot) shows 0 open alerts. The 44 baseline alerts (19 high + 19 moderate + 6 low) were all closed via local Batches A→B→C→D + the `flatted` override added during verification close-out.
result: [pending — requires `git push` + GitHub UI inspection]
how_to_run: `git push origin main`, then open the Security → Dependabot alerts tab.
fallback_if_fails: If alerts persist after push + a few minutes for GitHub's scanner to refresh, capture the specific advisory IDs and create a follow-up todo. Most likely cause is a CVE that re-opened after local close (rare) or a non-default-branch alert.

### 2. Periodic live OAuth re-test against `/admin/blog`
expected: Quarterly (or after any AUTH_GITHUB_ID/SECRET rotation), run AUTH-SMOKE-TEST.md against production to confirm sign-in still works. The 2026-05-12 run passed end-to-end after three unblock cycles (deploy key + AUTH_TRUST_HOST + AUTH_URL).
result: [pending — operational, not phase-blocking]
how_to_run: `.planning/runbooks/AUTH-SMOKE-TEST.md` — six-step checklist in Incognito.

### 3. Confirm Cloudflare proxy mode is still DNS-only
expected: CLOUDFLARE.md documents AS-IS state as DNS-only (orange cloud OFF on `zachlagden.uk` A record). Verifier cannot reach Cloudflare API to check; user confirms by visiting dash.cloudflare.com → zachlagden.uk → DNS.
result: [pending — out-of-codebase check]
how_to_run: Open Cloudflare dashboard → zachlagden.uk zone → DNS → confirm `zachlagden.uk` apex A record has cloud icon GREY (DNS only), not ORANGE (proxied).
note: If state has changed to proxied, the parameterised "if/when proxied" block in CLOUDFLARE.md should be activated and the AS-IS section updated.

### 4. PAT rotation calendar reminder is set
expected: A calendar item exists outside the codebase (Google Calendar / iCal / Reminders) for 2027-05-12 to rotate the GITHUB_PAT classic token (`ghp_…`, `read:user` scope) currently in Coolify. Documented in `.planning/todos/pending/rotate-github-pat.md`. Recommended rotation 1 month earlier (2027-04-12) so there's slack if Phase 7 still needs the token.
result: [pending — out-of-codebase check]
how_to_run: Add a calendar reminder titled "Rotate zachlagden.uk GITHUB_PAT — see .planning/todos/pending/rotate-github-pat.md" for 2027-04-12.

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
