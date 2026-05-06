---
status: complete
quick_id: 260506-eig
description: DOC-01 — rewrite README to match current architecture
date: 2026-05-06
commit: 5900a69
---

# Summary 260506-eig

Single atomic commit `5900a69`: `docs: rewrite README to match current architecture`.

README.md fully rewritten:
- Required env vars now documented (5 required + 1 optional)
- Vercel deploy button removed; Coolify deployment notes added
- Blog, admin, and auth subsystems documented
- GitHub OAuth App setup walkthrough included
- Architecture notes added (intro animation, error boundaries, security headers, markdown sanitisation, upload sniffing)
- Project tree updated to reflect current src/ layout
- Note that no test suite exists; CI runs ESLint and Prettier-check only

Net change: 150 insertions / 151 deletions (full rewrite at similar length).

## Resolves

- DOC-01 (CONCERNS.md #5)
