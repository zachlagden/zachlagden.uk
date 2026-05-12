# Auth Smoke Test — Manual Sign-In Flow

**Phase:** 5 (ENV-05)
**Owner:** zachlagden (only admin)
**When to run** (per D-09):

- After every `next-auth` bump (manual CVE-only bumps; see `.github/dependabot.yml` ignore rule).
- After every `@auth/mongodb-adapter` bump.
- After every Coolify deploy that touches `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `AUTH_SECRET`, `ADMIN_GITHUB_USERNAME`, or `MONGODB_URI`.
- On suspicion that admin sign-in is broken (e.g. you tried to log in and got a redirect loop).

**Why this is text-only** (per D-09):

- Screenshots rot in months when GitHub redesigns its OAuth screen or Next.js changes its error pages.
- Text steps survive across UI refreshes.
- Future-Zach can run this in 60 seconds; future-Claude can run it via a browser MCP.

**Why this exists at all:**

- There is no test framework in this codebase (TEST-01 deferred to v3 — see REQUIREMENTS.md Future Requirements).
- `next-auth@5.0.0-beta.30` is a beta and **explicitly documents breaking changes between betas** — every bump is a contract risk.
- The admin user (Zach) is the only person who would notice a regression, and may not log in for weeks. This runbook is the only deterministic detection.

## Pre-flight (do these once, save the answers)

Before Step 1, confirm these are still true (one-time checks; if they ever change, update this section):

- **Production URL:** `https://zachlagden.uk` (matches `siteUrl` in `public/content.json`).
- **GitHub OAuth App callback URL:** `https://zachlagden.uk/api/auth/callback/github` (confirm at https://github.com/settings/developers → OAuth Apps → zachlagden.uk).
- **Coolify env:** `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `AUTH_SECRET`, `ADMIN_GITHUB_USERNAME`, `MONGODB_URI`, `AUTH_TRUST_HOST=true`, `AUTH_URL=https://zachlagden.uk` are all set. Audit via `.planning/runbooks/ENV-VARS.md` (re-run the Coolify API list-keys command if uncertain). `AUTH_TRUST_HOST` and `AUTH_URL` were added 2026-05-12 — next-auth v5 behind a reverse proxy (Cloudflare + Traefik) requires both; without them, sign-in returns "Server error" (UntrustedHost) or GitHub rejects the redirect_uri.
- **Coolify deploy key on GitHub:** confirm the Coolify deploy key (Coolify private_key_id 1, fingerprint `SHA256:IXd0UiBbMExW+wtASb3Iplnmmk1XI4dYSk+07IjmAZ4`) is registered as a read-only deploy key on `https://github.com/zachlagden/zachlagden.uk/settings/keys`. If revoked, the Coolify redeploy fails before any code runs. Recovery procedure: `.planning/runbooks/COOLIFY-DEPLOY-KEY.md`.
- **GitHub OAuth App callback URL:** must match the canonical site URL exactly — `https://zachlagden.uk/api/auth/callback/github`. Mismatch causes GitHub to reject the redirect_uri parameter at step 3.
- **Browser:** use Incognito / Private mode for steps 1–6 to avoid cookie state leakage between attempts.

## The Six Steps (per D-09)

### Step 1 — Sign out and clear session cookies

1. Open Incognito (Cmd/Ctrl+Shift+N in Chrome / Cmd+Shift+P in Firefox).
2. Visit `https://zachlagden.uk/admin/blog`.
3. If you are NOT redirected to a GitHub OAuth screen, you are already signed in from a previous session — click any "Sign out" link, OR open DevTools → Application → Cookies → `https://zachlagden.uk` → delete all cookies whose name starts with `__Secure-authjs.` (or the legacy `next-auth.` prefix) and reload.

**Pass criterion:** the page eventually shows a GitHub OAuth-style "Sign in with GitHub" button OR redirects directly to `https://github.com/login/oauth/authorize?...`.

**Fail mode:** if `/admin/blog` renders the editor without asking for sign-in, your previous session is still active — clear cookies more aggressively or use a different browser profile.

### Step 2 — Trigger redirect to GitHub OAuth

1. From the cleared state in Step 1, visit `https://zachlagden.uk/admin/blog`.
2. Observe the redirect chain in DevTools → Network → preserve log enabled.

**Pass criterion:** the URL bar lands on `https://github.com/login/oauth/authorize?client_id=...&redirect_uri=https%3A%2F%2Fzachlagden.uk%2Fapi%2Fauth%2Fcallback%2Fgithub&...`.

**Fail modes:**

- 500 error from `/api/auth/[...nextauth]` → check Coolify container logs for `getAdapter()` errors (SEC-04 from v1 ensures these are now visible).
- 404 on the authorize URL → `AUTH_GITHUB_ID` is empty or wrong; re-verify Plan 03 Task 3 wrote it correctly.
- Redirect to `/api/auth/error` → check the `?error=` query string for the next-auth-specific code; common causes: bad callback URL configured in the GitHub OAuth App (must match exactly).

### Step 3 — Authorize and return to /admin/blog

1. Click "Authorize" on the GitHub screen (you may already see it as pre-authorized if you have signed in before — that's fine).
2. GitHub redirects to `https://zachlagden.uk/api/auth/callback/github?code=...&state=...`.
3. NextAuth processes the callback and redirects to `https://zachlagden.uk/admin/blog`.

**Pass criterion:** the URL bar lands on `/admin/blog` AND the page renders the editor UI (NOT the sign-in screen).

**Fail modes:**

- Stuck on `/api/auth/callback/github` with a 500 → `AUTH_GITHUB_SECRET` is wrong or `@auth/mongodb-adapter` cannot reach MongoDB. Check Coolify logs for `MongoServerSelectionError`.
- Returns to `/admin/blog` but renders the sign-in UI again → the GitHub username is not the admin (`ADMIN_GITHUB_USERNAME` mismatch); re-check the env value via `.planning/runbooks/ENV-VARS.md`.
- Returns to `/admin/blog` but renders an error boundary (Phase 1 STAB-01 wrap) → click "Try again"; if persistent, check Coolify logs for stack traces.

### Step 4 — Verify isAdmin === true via DevTools

1. With `/admin/blog` rendered (Step 3 passed), open DevTools console (Cmd/Ctrl+Option+I → Console tab).
2. Run exactly:
   ```js
   (await fetch("/api/auth/session").then((r) => r.json())).user.isAdmin === true;
   ```
3. The console should print `true`.

**Pass criterion:** console output is the literal `true`.

**Fail modes:**

- Output is `false` → `ADMIN_GITHUB_USERNAME` does not match the signed-in account's GitHub username. Verify via:
  ```js
  (await fetch("/api/auth/session").then((r) => r.json())).user;
  ```
  and compare the `name` / `email` fields against `ADMIN_GITHUB_USERNAME` in Coolify.
- Output is `undefined` → the `isAdmin` field is not being set in the JWT callback. Likely cause: `next-auth` version drift (Pitfall 2 — beta-to-beta contract change). Check `src/lib/auth.ts` for the `jwt` callback that adds `token.isAdmin`.
- Network 401 → session cookie missing; reload and try Steps 1–3 again.

### Step 5 — Save a dummy draft post

1. In the editor (`/admin/blog` is showing the post-creation UI), click "New post" or equivalent.
2. Set title: `AUTH-SMOKE-TEST scratch`. Set status: Draft. Set body: `delete me`.
3. Click "Save".
4. Reload the post-list view (`/admin/blog` root).

**Pass criterion:** the dummy post appears in the list with status "draft".

**Fail modes:**

- "Save" returns 401 → `requireAdmin()` middleware rejected the request despite `isAdmin === true` in Step 4 — likely a session-cookie / API-cookie mismatch from a Cloudflare proxy misconfiguration (see CLOUDFLARE.md's `/api/*` bypass rule).
- "Save" returns 500 → MongoDB write failed; check Coolify logs.

### Step 6 — Sign out and verify clearing

1. Click the sign-out affordance (top-right or wherever the SignOutButton renders).
2. Visit `https://zachlagden.uk/admin/blog` again.

**Pass criterion:** the page redirects back to GitHub OAuth (same shape as Step 2).

**Fail mode:** if `/admin/blog` still renders the editor after sign-out, the session cookie did not clear — check DevTools → Cookies for residual `__Secure-authjs.*` entries; if present, NextAuth's signOut handler is broken.

## Cleanup

After Step 6 passes:

1. Delete the dummy draft post created in Step 5 (you are signed out now — sign back in via Steps 1–3 if needed, delete it, sign out again).
2. Close the Incognito window to nuke all session state.

## Execution Log

Record every successful execution here as a one-line entry. NO secret values, NO session payloads — date + outcome only.

| Date (UTC) | Trigger | Outcome | Notes |
|---|---|---|---|
| 2026-05-12 | Plan 04 initial run (Phase 5 ENV-05) | PASS | First execution after Plan 03 populated AUTH_GITHUB_ID/AUTH_GITHUB_SECRET in Coolify. Surfaced three Phase-5 audit gaps that required unblock steps: (a) Coolify deploy SSH key not registered on the GitHub repo — user re-added the read-only deploy key; (b) `AUTH_TRUST_HOST=true` missing from Coolify env — added (next-auth v5 behind reverse proxy); (c) `AUTH_URL=https://zachlagden.uk` missing from Coolify env — added (next-auth callback URL construction). After all three fixes: all six steps PASS end-to-end against https://zachlagden.uk/admin/blog. Closes ROADMAP Phase-5 success criterion 2. See `.planning/runbooks/COOLIFY-DEPLOY-KEY.md` (deploy-key recovery) and `.planning/runbooks/ENV-VARS.md` (AUTH_TRUST_HOST + AUTH_URL rows). |
