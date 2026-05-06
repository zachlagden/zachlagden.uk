---
status: complete
quick_id: 260506-ech
description: SEC-02 + SEC-03 — security headers and poweredByHeader in next.config.ts
date: 2026-05-06
commit: fea6904
---

# Summary 260506-ech: next.config.ts security hardening

## Outcome

Single atomic commit `fea6904`: `fix(security): add response security headers and disable poweredByHeader`.

`next.config.ts` now exports:
- `poweredByHeader: false`
- `async headers()` returning a single `/:path*` rule with 6 security headers (HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-Frame-Options, CSP).

## Verification

- `pnpm tsc --noEmit` — exit 0
- `pnpm lint` — exit 0

## Notes

- CSP retains `'unsafe-inline'` + `'unsafe-eval'` on `script-src` (Next hydration + Framer Motion). Nonce-based tightening is deferred.
- `connect-src` covers `api.lagden.dev` (presence ticker), `formspree.io` (contact form), `google-analytics.com`.
- `img-src` is permissive (`https:`) because blog featured images can come from any HTTPS origin.

## Resolves

- SEC-02 (CONCERNS.md #15) — security headers present in production responses
- SEC-03 (CONCERNS.md #15) — `X-Powered-By: Next.js` no longer emitted
