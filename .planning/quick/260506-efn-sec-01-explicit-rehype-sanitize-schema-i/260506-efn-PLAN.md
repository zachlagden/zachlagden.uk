---
status: complete
quick_id: 260506-efn
description: SEC-01 — explicit allow-list schema for rehype-sanitize
date: 2026-05-06
---

# Plan 260506-efn: explicit rehype-sanitize schema

## Goal

`MarkdownRenderer` invokes `rehypeSanitize` with an explicit allow-list schema, not the default schema.

Resolves **SEC-01** (CONCERNS.md #3).

## Approach

Build a schema by spreading `defaultSchema` and adjusting:

1. `attributes.code`: allow `className` matching `^language-`, `^hljs$`, or `^hljs language-` (rehype-highlight emits these forms)
2. `attributes.span`: allow `className` matching `^hljs(-.+)?$` (syntax highlighting tokens)
3. `protocols.href`: restrict to `http`, `https`, `mailto` (drop `xmpp`, `irc`, `ircs` from defaultSchema)
4. `protocols.src`: restrict to `http`, `https`

Pass the schema as the second element of the rehypePlugins tuple: `[rehypeSanitize, sanitizeSchema]`.

Use the `Options` type re-exported from `rehype-sanitize` (aliased as `SanitizeSchema`) so we don't need a direct dep on `hast-util-sanitize`.

## Verification

- `pnpm tsc --noEmit` — exit 0
- `pnpm lint` — exit 0

## Commit

`fix(security): pass explicit allow-list schema to rehype-sanitize`
