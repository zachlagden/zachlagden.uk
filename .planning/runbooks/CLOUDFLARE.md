# Cloudflare — DNS, Proxy, and Cache Procedures

**Phase:** 5 (ENV-04)
**Owner:** zachlagden
**Domain:** zachlagden.uk
**Cloudflare zone ID:** see `~/.claude/credentials/personal-infra.md` (chmod 600)
**CF API token:** see `~/.claude/credentials/personal-infra.md` (chmod 600)

## Current State (AS-IS, per `~/.claude/credentials/personal-infra.md`)

- **Proxy mode:** DNS-only (grey cloud, NOT orange).
- **DNS:** A/AAAA records resolve directly to `72.61.17.83` (zl-vps01, Coolify host).
- **Cache:** none — Cloudflare is acting as DNS only; visitor traffic hits the VPS directly.
- **Cache-Control end-to-end:** Next.js `Cache-Control` headers (set by `next.config.ts` via `headers()` and by route-level `revalidate`) reach the browser unmodified.

**Implication:** Phase 6's planned `export const revalidate = 86400` on `/` works correctly today. The ISR rebuild happens in the standalone server; the response carries `Cache-Control: s-maxage=86400, stale-while-revalidate=...`; browsers honour it. No CF intermediary involved.

## Open Question (Research SUMMARY.md #1, does NOT block Phase 5)

- User has not yet decided whether to flip Cloudflare to orange-cloud (full proxy) for the WAF / CDN benefits.
- The "If/When Proxied" section below is dormant until that decision is made — apply it BEFORE flipping the cloud icon.

---

## If/When Proxied (Future-State — DO NOT APPLY UNLESS YOU ARE FLIPPING THE PROXY)

> **WARNING:** Before changing the DNS proxy state from DNS-only to proxied, apply ALL rules in this section. Skipping any rule risks: (a) admin auth flow breaking (CF caches OAuth state cookie); (b) MongoDB writes appearing to succeed but reads returning stale data (CF caches `/api/*` GET responses); (c) Phase 6's daily-revalidate ISR being clobbered by CF's default 4-hour browser cache TTL.

### Step 1 — Set up Cache Rules (modern; replaces legacy Page Rules)

Cloudflare Cache Rules are configured in Dashboard → Caching → Cache Rules. Apply each in the order below. Rules are processed top-to-bottom; first match wins.

**Rule 1: Bypass cache for /api/***

- When: `(http.request.uri.path matches "^/api/")`
- Then: Bypass cache (do not cache; serve every request from origin)
- Reason: NextAuth OAuth handlers, /api/auth/session reads, /api/blog/* writes, /api/health monitoring all need fresh responses. Caching breaks them silently.

**Rule 2: Aggressive cache for /_next/static/***

- When: `(http.request.uri.path matches "^/_next/static/")`
- Then: Eligible for cache, Edge TTL = 1 month, Browser TTL = 1 month
- Reason: Next.js fingerprints these filenames. Safe to cache forever.

**Rule 3: Respect origin Cache-Control for /uploads/***

- When: `(http.request.uri.path matches "^/uploads/")`
- Then: Eligible for cache, Edge TTL = "Use cache-control header from origin"
- Reason: Uploaded blog images can be cached, but only as long as the upload route allows.

**Rule 4: Respect origin Cache-Control for everything else (HTML)**

- When: `(http.request.uri.path matches "^/")` (default catch-all)
- Then: Eligible for cache, Edge TTL = "Use cache-control header from origin"
- Reason: This is the rule that makes Phase 6's `revalidate: 86400` work end-to-end. CF will honour `s-maxage=86400` from origin.

### Step 2 — Disable Browser Cache TTL override

Dashboard → Caching → Configuration → Browser Cache TTL → set to **"Respect Existing Headers"**. Default is "4 hours" which would override Phase 6's daily-revalidate header for client browsers.

### Step 3 — Flip the proxy

Dashboard → DNS → toggle the cloud icon for the A and AAAA records of `zachlagden.uk` and any subdomains served by the same Coolify deploy. Now orange-cloud (proxied).

### Step 4 — Verify cache behaviour

Run these `curl` commands from a non-CF IP (your laptop, NOT the VPS):

```bash
# /api/health should NOT be cached (rule 1)
curl -sI https://zachlagden.uk/api/health | grep -i "cf-cache-status"
# Expect: cf-cache-status: BYPASS

# /_next/static/<some-hash>.js should be HIT after a warm-up
curl -sI https://zachlagden.uk/_next/static/{the-runtime-bundle-hash}.js | grep -i "cf-cache-status"
# Expect (after 2nd request): cf-cache-status: HIT

# / should be DYNAMIC initially, then HIT/REVALIDATED after first cache fill
curl -sI https://zachlagden.uk/ | grep -iE "(cache-control|cf-cache-status)"
# Expect: Cache-Control: s-maxage=86400, stale-while-revalidate=...
# Expect (after 2nd request): cf-cache-status: HIT
```

If `/api/health` shows `cf-cache-status: HIT`, **Rule 1 is misconfigured — admin auth WILL break**. Fix immediately or flip the proxy back to DNS-only.

## Cache Purge Procedures

Cloudflare's API expects POST + JSON. The Bearer token is in `~/.claude/credentials/personal-infra.md` (do NOT paste the token literal here; use the env var pattern below).

### Purge everything (use sparingly)

```bash
CF_API_TOKEN=<from personal-infra.md>
CF_ZONE_ID=<from personal-infra.md>
curl -X POST -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}' \
  "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache"
```

### Purge specific URL(s) (preferred — avoids cold-cache for the rest of the site)

```bash
curl -X POST -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"files":["https://zachlagden.uk/blog/<slug>","https://zachlagden.uk/"]}' \
  "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache"
```

### Purge by tag (for `unstable_cache` invalidation in Phase 7+)

Phase 7's `getGitHubStats()` uses `unstable_cache(... { tags: ["github-stats"] })`. To invalidate from a server route, call `revalidateTag("github-stats")`. Cloudflare-side purge is independent — the CF cache key for `/stats` is the URL, not the tag. Purge the URL:

```bash
curl -X POST -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"files":["https://zachlagden.uk/stats"]}' \
  "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache"
```

## Expected Cache Behaviour (Reference)

| Path | Expected `cf-cache-status` (proxied mode) | Reason |
|---|---|---|
| `/api/auth/*` | BYPASS | Rule 1 — auth must be live |
| `/api/auth/session` | BYPASS | Rule 1 — session reads must be live |
| `/api/blog/*` (POST) | BYPASS | Rule 1 — writes must be live |
| `/api/health` | BYPASS | Rule 1 — Coolify HEALTHCHECK must hit origin |
| `/_next/static/<hash>.js` | HIT after warm-up | Rule 2 — fingerprinted, immutable |
| `/uploads/<file>` | HIT or REVALIDATED | Rule 3 — origin Cache-Control |
| `/` | HIT after first ISR fill | Rule 4 — origin's `s-maxage=86400` honoured |
| `/blog` | HIT after first ISR fill | Rule 4 |
| `/blog/<slug>` | HIT after first ISR fill | Rule 4 |
| `/stats` (Phase 7+) | HIT after first ISR fill | Rule 4 |
| `/now` (Phase 7+) | HIT (mostly static) | Rule 4 |
| `/freelance` (Phase 8+) | HIT (mostly static) | Rule 4 |
| `/freelance.md` (Phase 8+) | HIT after first fill | Rule 4 — content-derived markdown |

## Why Each Rule Matters (For Future-Zach)

- **Rule 1 (`/api/*` bypass):** Without this, NextAuth OAuth state cookies get cached at CF edge. Sign-in fails with "invalid state" on the second request. MongoDB blog writes appear to succeed but reads return stale data. **Highest-priority rule.**
- **Rule 2 (`/_next/static/*` aggressive):** Without this, every visitor pays the bandwidth tax on every JS chunk. Coolify origin gets 10× more requests than necessary. Performance regression, no correctness risk.
- **Rule 3 (`/uploads/*` honour origin):** Without this, deleted/re-uploaded images stay served from CF cache after `revalidatePath()` runs. Editor confusion when post images don't refresh.
- **Rule 4 (HTML honour origin):** Without this, Phase 6's daily-revalidate ISR is invisible to the visitor — CF serves the build-time HTML for 4 hours, then re-fetches once, repeats. Birthday rollover wouldn't be visible until the next CF revalidation OR a manual purge. **This is the rule that makes Phase 6's age auto-update work end-to-end.**

## Cross-references

- **`.planning/runbooks/AUTH-SMOKE-TEST.md`** — if you flip the proxy and admin sign-in breaks, the smoke test is the deterministic detector. Rule 1 above (`/api/*` bypass) is the most likely culprit.
- **`.planning/runbooks/ENV-VARS.md`** — `AUTH_TRUST_HOST=true` and `AUTH_URL=https://zachlagden.uk` are required regardless of proxy mode (next-auth v5 behind a reverse proxy). The Cloudflare proxy adds another reverse-proxy hop on top of the existing Traefik hop; both env vars stay relevant.
- **`.planning/runbooks/COOLIFY-DEPLOY-KEY.md`** — deploy-key recovery; unrelated to caching but lives in the same runbook directory.

---
*Captured: 2026-05-12T14:28Z*
*Last reviewed: 2026-05-12 — first authoring; no prior reviews*
