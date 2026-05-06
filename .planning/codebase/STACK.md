# Technology Stack

**Analysis Date:** 2026-05-06

> **State:** Project is half-complete and somewhat broken. Sentry observability has been ripped out (deleted: `sentry.edge.config.ts`, `sentry.server.config.ts`, `instrumentation-client.ts`, `src/instrumentation.ts`, `src/app/global-error.tsx`) but `@sentry/nextjs` is also gone from `package.json` so the dependency tree is consistent — only the runtime wiring is missing. ~50+ source files are modified in working tree relative to HEAD.

## Languages

**Primary:**
- TypeScript 5.9.3 (resolved; `^5.8.3` in `package.json`) — all application code under `src/`
- TSX (React JSX with TypeScript) — all components under `src/components/`

**Secondary:**
- CSS via Tailwind 4 — `src/app/globals.css`
- JSON — content/data layer at `public/content.json`

## Runtime

**Environment:**
- Node.js 20 (Alpine) — pinned by `Dockerfile` (`FROM node:20-alpine`) and CI (`.github/workflows/lint.yml`, `prettier.yml` use `node-version: "20"`)
- No `.nvmrc` or `.node-version` file present in repo root

**Package Manager:**
- pnpm — enforced via `corepack enable pnpm` in `Dockerfile`
- Lockfile: `pnpm-lock.yaml` (lockfileVersion 9.0) — present
- Workspace config: `pnpm-workspace.yaml` declares `onlyBuiltDependencies` for `@tailwindcss/oxide`, `sharp`, `unrs-resolver`

## Frameworks

**Core:**
- Next.js 16.1.6 (`next`) — App Router, `output: "standalone"` (`next.config.ts`)
- React 19.2.4 (`react`, `react-dom`) — strictly resolved
- `@next/third-parties` 16.1.6 — provides `<GoogleAnalytics>` component used in `src/app/layout.tsx`

**Testing:**
- Not detected. No `jest.config.*`, `vitest.config.*`, or `playwright.config.ts` in working tree (a `playwright.config.ts` was referenced in commit `2db2476` redesign but is not present now). No `*.test.*` or `*.spec.*` files under `src/`.

**Build/Dev:**
- Turbopack — Next.js 16 default for `next dev` (no explicit flag in `package.json` scripts)
- TypeScript 5.9.3 (resolved; `^5.8.3` declared) — config at `tsconfig.json`, target ES2017, `moduleResolution: "bundler"`, `paths: { "@/*": ["./src/*"] }`
- Tailwind CSS 4.1.18 — PostCSS plugin model (`postcss.config.mjs` registers `@tailwindcss/postcss`)
- ESLint 9.39.2 (resolved; `^9.29.0` declared) — flat config at `eslint.config.mjs` extending `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Prettier 3.8.1 (resolved; `^3.5.3` declared) — runtime dependency (note: it's listed under `dependencies`, not `devDependencies`); no `.prettierrc` config file (defaults only)

## Key Dependencies

**Critical (production):**
- `next` 16.1.6 — App Router framework
- `react` ^19.2.4 / `react-dom` ^19.2.4
- `framer-motion` 12.34.0 (`^12.23.26` declared) — animations across every section/UI component
- `lucide-react` 0.561.0 — icon set used pervasively (Github, Linkedin, Mail, etc.)
- `mongodb` 7.1.0 — direct driver for blog posts (`src/lib/mongodb.ts`, `src/lib/blog.ts`)
- `next-auth` 5.0.0-beta.30 — auth (`src/lib/auth.ts`); pinned exact version
- `@auth/mongodb-adapter` 3.11.1 — Auth.js MongoDB session/account persistence
- `@formspree/react` 3.0.0 — contact form handling (`src/components/sections/ContactSection.tsx`)
- `@next/third-parties` 16.1.6 — Google Analytics wrapper

**Markdown / blog rendering:**
- `react-markdown` 10.1.0 — used by `src/components/blog/MarkdownRenderer.tsx`
- `remark-gfm` 4.0.1 — GitHub-flavored markdown (tables, strikethrough, etc.)
- `rehype-raw` 7.0.0 — allow raw HTML in markdown
- `rehype-sanitize` 6.0.0 — sanitize raw HTML
- `rehype-highlight` 7.0.2 — code block syntax highlighting
- `reading-time` 1.5.0 — reading time estimation in `src/lib/blog.ts`

**Other:**
- `split-type` 0.3.4 — text split animations (still in deps; usage in modified `src/components/ui/AnimatedText.tsx` — verify wiring)
- `prettier` 3.8.1 — listed under `dependencies` rather than `devDependencies` (likely a mistake)

**Infrastructure / DX (devDependencies):**
- `@tailwindcss/postcss` 4.1.18 — Tailwind v4 PostCSS plugin
- `tailwindcss` 4.1.18
- `@types/node` 24.10.13, `@types/react` 19.2.14, `@types/react-dom` 19.2.3
- `eslint` 9.39.2, `eslint-config-next` 16.1.6

**Removed / not present (referenced in `<why_this_matters>` notes):**
- `@sentry/nextjs` — fully removed from `package.json`; runtime config files also deleted. Project has no observability layer.
- Lenis (smooth scrolling) — removed in commit `c449439` ("refactor: remove Lenis smooth scrolling in favor of native CSS"); zero refs in current src.
- Playwright, seed scripts, MongoDB content collections — referenced in commit `2db2476` redesign that never landed cleanly; none present now.

## Configuration

**Environment:**
- `.env.example` declares required vars: `MONGODB_URI`, `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `ADMIN_GITHUB_USERNAME`
- `.env.example` declares optional vars: `NEXT_PUBLIC_GA_ID` (note: not actually consumed — Google Analytics ID is read from `public/content.json` `metadata.googleAnalyticsId`, not env), `NEXT_PUBLIC_DISCORD_USER_ID`
- `.env` file present in working tree (gitignored; do not read)

**Build / framework configs:**
- `next.config.ts` — `output: "standalone"`, single remote image pattern for `avatars.githubusercontent.com`
- `tsconfig.json` — strict mode on, `paths: { "@/*": ["./src/*"] }`, `jsx: "react-jsx"`
- `eslint.config.mjs` — flat config, ignores `.next/**`, `out/**`, `build/**`, `next-env.d.ts`
- `postcss.config.mjs` — single plugin: `@tailwindcss/postcss`

**Container / deploy configs:**
- `Dockerfile` — multi-stage (deps → builder → runner), Node 20 Alpine, Coolify-targeted, exposes port 3000, `HEALTHCHECK` against `/api/health`, declares `VOLUME ["/app/public/uploads"]` for blog image persistence
- `.dockerignore` — excludes `node_modules`, `.next`, `.env*`, `*.md`, `.github`, etc.

**Content / static:**
- `public/content.json` — primary content source (CV data, social links, GA ID, Formspree ID, site URL)
- `public/site.webmanifest` — PWA manifest
- `public/uploads/` — runtime-mounted volume for uploaded blog images

## Platform Requirements

**Development:**
- Node.js 20.x
- pnpm (latest, via Corepack)
- Local MongoDB (or Atlas connection string in `MONGODB_URI`) for blog/auth features
- GitHub OAuth App credentials for admin sign-in

**Production:**
- Docker via Coolify (per `CLAUDE.md` and commit `231122c` "feat: add Coolify Dockerfile deployment setup")
- Standalone Next.js server: `node .next/standalone/server.js` (or `node server.js` from runner stage)
- Persistent volume for `/app/public/uploads`
- MongoDB instance reachable via `MONGODB_URI`

**CI:**
- GitHub Actions: `.github/workflows/lint.yml` (ESLint) and `.github/workflows/prettier.yml` (`prettier --check`) — both run on push/PR to `main` with pnpm cache

---

*Stack analysis: 2026-05-06*
