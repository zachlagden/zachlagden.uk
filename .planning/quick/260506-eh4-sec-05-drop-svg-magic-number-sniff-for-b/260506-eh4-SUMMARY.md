---
status: complete
quick_id: 260506-eh4
description: SEC-05 — drop SVG, magic-number sniff blog uploads
date: 2026-05-06
commit: 89597f5
---

# Summary 260506-eh4

Single atomic commit `89597f5`: `fix(security): drop SVG and magic-number sniff blog uploads`.

## Changes

`src/lib/upload.ts`:
- Inline `sniffImageType(buffer)` checks the first 12 bytes for JPEG / PNG / GIF / WebP magic numbers.
- `UnsupportedImageTypeError` exported.
- `saveUploadedFile` rejects unsupported buffers and derives the extension from the sniffed type rather than `path.extname(file.name)`.

`src/app/api/blog/upload/route.ts`:
- `image/svg+xml` removed from `allowedTypes`.
- `saveUploadedFile` wrapped in try/catch — `UnsupportedImageTypeError` → 400, everything else → 500 with `console.error`.

No new npm dependency added.

## Verification

- `pnpm tsc --noEmit` — exit 0
- `pnpm lint` — exit 0

## Resolves

- SEC-05 (CONCERNS.md #18)
