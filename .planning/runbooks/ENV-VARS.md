# ENV-VARS Audit — v2.0 Phase 5

**Captured:** 2026-05-12T14:20:05Z
**Method:** Coolify API (`GET https://coolify.lagden.dev/api/v1/applications/{uuid}/envs`) reconciled against `.env.example` and `grep -rn "process\.env\." src/`
**Coolify app:** zachlagden-uk (UUID redacted; see `~/.claude/credentials/personal-infra.md`)
**Decisions enacted:** D-05 (audit method), D-06 (GITHUB_PAT provisioning), D-07 (OAuth populate)

## Status taxonomy (D-05)

- **present** — variable exists in Coolify
- **missing** — variable is read by code (`grep process.env`) but absent in Coolify
- **obsolete** — variable is in `.env.example` (or previously was) but not consumed by any source file

## Source taxonomy (D-05)

- **Coolify** — only in Coolify env
- **.env.example** — only in the example file
- **both** — declared in both places

## Reconciliation Table

| Variable | Status | Source | Notes |
|---|---|---|---|
| MONGODB_URI | present | both | Required; consumed by `src/lib/mongodb.ts` |
| AUTH_SECRET | present | both | Required; consumed implicitly by next-auth (no direct `process.env.AUTH_SECRET` grep — Auth.js v5 reads it internally) |
| AUTH_GITHUB_ID | present | both | **Provisioned in Plan 05-03 Task 3** (per D-07). Consumed implicitly by `src/lib/auth.ts` GitHub provider. Existing OAuth App Client ID supplied by user. |
| AUTH_GITHUB_SECRET | present | both | **Provisioned in Plan 05-03 Task 3** (per D-07). Consumed implicitly by `src/lib/auth.ts` GitHub provider. Regenerate annually. |
| AUTH_TRUST_HOST | present | both | **Discovered during 05-04 smoke test (2026-05-12).** Required by next-auth `5.0.0-beta.30` behind a reverse proxy (Cloudflare DNS + Traefik). Without it, `/api/auth/session` and `/admin/blog` return 500 with `UntrustedHost: Host must be trusted. URL was: https://zachlagden.uk/api/auth/session`. Set to `true`. Consumed implicitly by next-auth runtime. Added to `.env.example` 2026-05-12. |
| AUTH_URL | present | both | **Discovered during 05-04 smoke test (2026-05-12).** Required by next-auth `5.0.0-beta.30` to construct the OAuth `redirect_uri` from the canonical public URL rather than the internal request URL. Without it, sign-in reaches GitHub but `redirect_uri=https://0.0.0.0:3000/api/auth/callback/github` (internal container address) which GitHub rejects with "The redirect_uri is not associated with this application." Set to `https://zachlagden.uk` in prod; `http://localhost:3000` in dev (matches `.env.example` default). Added to `.env.example` 2026-05-12. |
| ADMIN_GITHUB_USERNAME | present | both | Required; consumed by `src/lib/auth.ts` isAdmin check |
| GITHUB_PAT | present | both | **Provisioned in Plan 05-03 Task 3** (per D-06). Phase 7 hand-off ready. See "GITHUB_PAT details" below. |
| NIXPACKS_NODE_VERSION | present | Coolify | Coolify build-pack managed; pins Node version for nixpacks builder. Not user-facing. |
| NODE_ENV | present | Coolify | Coolify auto-sets at runtime; not user-facing; not in `.env.example`. |
| BUILD_DATE | obsolete | (neither) | Read by `src/app/sitemap.ts` as an optional fallback for `lastModified` static pages. Not set in Coolify, not in `.env.example`. Code already handles `undefined` gracefully (falls back to `new Date()`). Document but do not provision. |
| NEXT_PUBLIC_GA_ID | obsolete | (removed in Plan 05-03) | **Not consumed by code.** GA ID is read from `public/content.json metadata.googleAnalyticsId` (see `src/app/layout.tsx` `<GoogleAnalytics gaId={metadata.googleAnalyticsId} />`). Previously listed in `.env.example` as confusion; removed in this plan. |

**Total in Coolify (unique keys):** 9 (was 7 after Plan 05-03; +2 added during Plan 05-04 smoke test: AUTH_TRUST_HOST, AUTH_URL).

### Discovered during 05-04 smoke test

The 05-03 audit reconciled `.env.example` ↔ Coolify ↔ explicit `process.env.*` greps. It did NOT surface two implicit-required env vars consumed by `next-auth` v5 internally with no `process.env.AUTH_TRUST_HOST` / `process.env.AUTH_URL` substring anywhere in `src/`. The 05-04 production smoke test surfaced both:

1. **AUTH_TRUST_HOST=true** — when running next-auth behind a reverse proxy (Cloudflare DNS-only still presents to Coolify via Traefik), next-auth v5 refuses to handle requests whose Host header it cannot verify, returning `UntrustedHost`. Setting `AUTH_TRUST_HOST=true` opts into trusting the Host header. Documented at https://authjs.dev/getting-started/deployment#auth_trust_host. **Future audits should grep next-auth source for `trustHost` references rather than relying on `grep process.env` from project code.**

2. **AUTH_URL=https://zachlagden.uk** — when next-auth constructs the OAuth `redirect_uri` for an outbound flow, it uses the canonical site URL (preferred) or falls back to the inbound request URL (which inside a container is `http://0.0.0.0:3000`). Setting `AUTH_URL` explicitly fixes the canonical URL. Documented at https://authjs.dev/getting-started/deployment#auth_url.

**Audit method improvement:** next time the audit happens, supplement the `grep process.env` sweep with a lookup of next-auth runtime config docs. Implicit env vars (next-auth, Next.js, Vercel runtime) do not appear in source greps but are still hard requirements.

## Intentionally removed

| Variable | Removed in | Reason |
|---|---|---|
| NEXT_PUBLIC_DISCORD_USER_ID | Plan 05-03 (.env.example) | Presence widget (`src/components/ui/PresenceStatus.tsx`, `src/utils/presenceService.ts`, `src/types/presence.ts`) is scheduled for removal — user directive 2026-05-12. Variable was never code-read by anything we retain; once the widget components are deleted (separate todo `.planning/todos/pending/remove-presence-widget.md`), the variable is fully retired. NOT provisioned in Coolify. |
| NEXT_PUBLIC_GA_ID | Plan 05-03 (.env.example) | Obsolete — GA ID is sourced from `public/content.json` not from env. The `.env.example` entry created false expectations during local setup. |

## GITHUB_PAT details

- **Provisioned:** 2026-05-12
- **Expires:** `unknown (manual rotation recommended within 12 months — see deviation notes)`
- **Stored in:** Coolify env (`is_runtime=true` × `is_preview={false,true}`), user's password manager (user responsibility)
- **Scope (actual):** `read:user` (verified via `curl -I -H "Authorization: Bearer $PAT" https://api.github.com/user` returning `x-oauth-scopes: read:user`)
- **Validation:**
  - `GET /user` → 200 OK (Profile readable) ✓
  - `POST /graphql` with `viewer.contributionsCollection.contributionCalendar` → returns total (Phase 7 use case verified) ✓
  - No repo write access (classic PAT lacks `repo` scope) ✓

### Deviations from D-06 (documented for future-Zach)

1. **PAT type variance:** D-06 mandates a **fine-grained PAT** (prefix `[g][i][t][h][u][b]_[p][a][t]_`). The supplied PAT is a **classic PAT** (prefix `[g][h][p]_`) with `read:user` scope only.
   - **Why this is acceptable for Phase 7:** `read:user` is the classic-PAT equivalent of fine-grained "Profile: Read-only". Both allow `viewer.contributionsCollection` GraphQL queries (the Phase 7 GitHub heatmap use case per `.planning/research/PITFALLS.md` Pitfall 7). The token does NOT grant repo access — confirmed by absence of `repo` scope in `x-oauth-scopes` header.
   - **v3 hardening todo:** Swap for a fine-grained PAT when convenient. Tracked in `.planning/todos/pending/rotate-github-pat.md`.

2. **PAT expiry variance:** D-06 mandates ≤ 1 year expiry. The supplied PAT was created without an expiry being recorded (classic PATs can be set to "No expiration").
   - **Risk:** No automatic rotation forcing function.
   - **Mitigation:** Manual rotation calendar item — see `.planning/todos/pending/rotate-github-pat.md` (deadline 2027-05-12).
   - **Phase-5 open concern:** Plan 05-03 success criterion "≤ 1y expiry" is technically NOT met. Documented in `05-03-SUMMARY.md` Deviations.

## Notes for future-Zach

### Re-running this audit

```bash
export COOLIFY_URL="https://coolify.lagden.dev"
export COOLIFY_TOKEN="$(grep '^| API token' ~/.claude/credentials/personal-infra.md | awk -F'`' '{print $2}' | sed -n '2p')"
export APP_UUID="swcs4gkg8ws4g48k8wo4c8go"

curl -sf -H "Authorization: Bearer $COOLIFY_TOKEN" \
  "$COOLIFY_URL/api/v1/applications/$APP_UUID/envs" \
  | jq -r '.[].key' | sort -u
```

Diff the result against this table. Any new key needs a row; any removed key updates its row to `obsolete` if `.env.example` still references it.

### GITHUB_PAT rotation procedure

1. Visit `https://github.com/settings/personal-access-tokens` (or `https://github.com/settings/tokens` for classic PATs).
2. Regenerate with the same scope (fine-grained: "Profile: Read-only" + "No repository access"; classic equivalent: `read:user` only).
3. **Set an expiry ≤ 12 months** (closes the D-06 gap for the current token).
4. Update Coolify via API:
   ```bash
   # Find the existing entry UUIDs (one runtime, one preview)
   curl -sf -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/$APP_UUID/envs" \
     | jq '.[] | select(.key == "GITHUB_PAT") | {uuid, is_preview}'

   # PATCH the value via the env-var UUID (consult Coolify v4 API docs for exact endpoint)
   # Or DELETE + POST if PATCH is unavailable for env vars in your Coolify version.
   ```
5. Trigger redeploy:
   ```bash
   curl -sf -X POST -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/deploy?uuid=$APP_UUID"
   ```
6. Verify Phase 7's `/stats` route still renders the heatmap correctly.
7. Delete the old PAT on GitHub.

### Secret hygiene

This runbook commits keys + status + source ONLY. **No value column.** No first-N-chars, no length, no fragment. The Coolify API call sequence is documented above so the audit is reproducible without ever reading values back from Coolify.

### Coolify env-var endpoint quirks (discovered during Plan 05-03)

- `POST /api/v1/applications/{uuid}/envs` with body `{ "key", "value", "is_preview": false }` creates **both** the runtime entry (`is_preview=false`) and a paired preview entry (`is_preview=true`) automatically. No second POST needed.
- `is_build_time` is rejected on input (`422 "This field is not allowed."`); omit it from the payload.
- Each entry has its own UUID; `DELETE /api/v1/applications/{uuid}/envs/{env-uuid}` removes one (runtime or preview) at a time — to fully retire a key you need to find and delete BOTH UUIDs.

### Coolify env-var endpoint quirks (discovered during Plan 05-04 smoke test)

- **`is_preview=true` POST returns 409 if the default-scope entry already exists.** Body: `{"message": "Environment variable already exists. Use PATCH request to update it."}`. The single-POST-creates-both behaviour above only applies when neither entry exists. To explicitly create a preview-scope entry when the default already exists, use PATCH (or DELETE the default first). For this app, preview scope is not exercised (no PR previews configured), so the default-scope entry is sufficient.

## Related runbooks

- **`.planning/runbooks/AUTH-SMOKE-TEST.md`** — manual sign-in test that exercises every auth-related env var end-to-end. Runs after any next-auth bump or Coolify auth-env change.
- **`.planning/runbooks/CLOUDFLARE.md`** — DNS, proxy, and cache procedures. When CF is flipped to full-proxy, `AUTH_TRUST_HOST` and `AUTH_URL` stay relevant (CF adds another reverse-proxy hop on top of the existing Traefik hop).
- **`.planning/runbooks/COOLIFY-DEPLOY-KEY.md`** — what to do when Coolify redeploys fail with `git ls-remote ... Permission denied (publickey)`. Documents the deploy-key public-key value and the GitHub UI fix.

---

*Audit captured: 2026-05-12T14:20:05Z*
