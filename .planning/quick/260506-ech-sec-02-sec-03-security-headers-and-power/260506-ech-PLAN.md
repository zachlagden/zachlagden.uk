---
status: in-progress
quick_id: 260506-ech
description: SEC-02 + SEC-03 — security headers and poweredByHeader in next.config.ts
date: 2026-05-06
---

# Plan 260506-ech: next.config.ts security hardening

## Goal

Add security response headers and disable the `X-Powered-By: Next.js` header in `next.config.ts`.

Resolves REQUIREMENTS:
- **SEC-02**: `next.config.ts` returns security headers — at minimum `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, and a CSP that allows GA + same-origin.
- **SEC-03**: `next.config.ts` sets `poweredByHeader: false`.

## Task

Single atomic edit to `next.config.ts`.

**Add to `nextConfig`:**
- `poweredByHeader: false`
- `async headers()` returning a single rule applying to all paths (`source: '/:path*'`)

**Headers in the rule:**
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` — 2-year HSTS with subdomain coverage and preload eligibility
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()` — no permissions used by site
- `X-Frame-Options: DENY` — defence in depth alongside CSP frame-ancestors
- `Content-Security-Policy:` — see below

**CSP value (single line, sources separated by spaces):**

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com data:;
img-src 'self' data: https: blob:;
connect-src 'self' https://www.google-analytics.com https://api.lagden.dev https://formspree.io;
frame-ancestors 'none';
base-uri 'self';
form-action 'self' https://formspree.io;
```

**Notes on CSP choices:**
- `'unsafe-inline'` and `'unsafe-eval'` on `script-src` are required because Next.js inlines scripts for hydration/bootstrap and Framer Motion/React DevTools rely on eval. Tightening this to nonces requires changing the layout to use `next/script` with strategy + nonces from middleware — out of scope.
- `'unsafe-inline'` on `style-src` is required because Framer Motion injects inline styles. Tightening requires CSS-only animations.
- `connect-src` includes `https://api.lagden.dev` (presence ticker) and `https://formspree.io` (contact form) and Google Analytics endpoint.
- `img-src` allows `https:` broadly because blog post images and OG images come from various hosts (Next/Image proxies them but the underlying source must be allowed).
- `frame-ancestors 'none'` blocks framing site-wide; pairs with `X-Frame-Options: DENY` for older-browser fallback.

## Verification

- `pnpm tsc --noEmit` exits 0
- `pnpm lint` exits 0
- The exported `nextConfig` has both `poweredByHeader: false` and an async `headers` function

## Commit

`fix(security): add response security headers and disable poweredByHeader`
