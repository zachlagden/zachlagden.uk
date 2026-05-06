---
status: complete
quick_id: 260506-efn
description: SEC-01 — explicit allow-list schema for rehype-sanitize
date: 2026-05-06
commit: 16060dd
---

# Summary 260506-efn

Single atomic commit `16060dd`: `fix(security): pass explicit allow-list schema to rehype-sanitize`.

`src/components/blog/MarkdownRenderer.tsx` now imports `defaultSchema` from `rehype-sanitize`, builds a customised schema spreading it, and passes the schema as the second element of the rehypePlugins tuple.

Customisations vs defaultSchema:
- `attributes.code`: regex allow-list for `language-*`, `hljs`, `hljs language-*` className values
- `attributes.span`: regex allow-list for `hljs-*` className values
- `protocols.href`: dropped to http/https/mailto (was http/https/mailto/xmpp/irc/ircs)
- `protocols.src`: dropped to http/https

Type imported via `Options as SanitizeSchema` from `rehype-sanitize` to avoid a direct dep on `hast-util-sanitize`.

## Verification

- `pnpm tsc --noEmit` — exit 0
- `pnpm lint` — exit 0

## Resolves

- SEC-01 (CONCERNS.md #3)
