---
status: complete
quick_id: 260506-fu2
description: POLISH-05 — image compression
date: 2026-05-06
commit: 297aedf
---

# Summary 260506-fu2

Single atomic commit `297aedf`: `perf(assets): re-compress OG/Twitter/icon PNGs with sharp palette`.

Quantized 5 brand PNGs to 256-color palette via `scripts/optimize-images.mjs`:

| File | Before | After | Saved |
|---|---|---|---|
| og-image.png | 126,326 | 46,600 | -63.1% |
| twitter-image.png | 126,877 | 46,746 | -63.1% |
| android-chrome-512x512.png | 137,343 | 43,276 | -68.5% |
| android-chrome-192x192.png | 32,481 | 11,533 | -64.5% |
| apple-touch-icon.png | 29,172 | 10,507 | -64.0% |
| **Total** | **452,199** | **158,662** | **-290 KB** |

`sharp` added to devDependencies (was previously transitive-only). Script is reusable.

URLs in `public/content.json` unchanged (still `.png`).

Resolves POLISH-05 (CONCERNS.md #19).
