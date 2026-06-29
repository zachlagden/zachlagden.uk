# zachlagden.uk

![Next.js Version](https://img.shields.io/badge/Next.js-16.1.6-black)
![React Version](https://img.shields.io/badge/React-19.2.4-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4-teal)
![License](https://img.shields.io/badge/License-ZML--PL-green)

Personal portfolio + blog for Zach Lagden. A Next.js 16 App Router site combining a static CV (hero, experience, skills, education, certifications, contact) with a MongoDB-backed blog and a GitHub-OAuth-gated admin UI.

![Portfolio Preview](/public/og-image.png)

## What's in this repo

- **Portfolio (`/`)** — content-as-props hero/about/experience/education/skills sections sourced from `public/content.json`. Cinematic intro animation gated on font readiness. Live presence ticker (Spotify + VS Code) via `api.lagden.dev`.
- **Blog (`/blog`)** — markdown posts persisted to MongoDB. Public list, individual posts with reading time, RSS at `/blog/feed.xml`, tag filtering, paginated.
- **Admin (`/admin`)** — single-author CMS gated by GitHub OAuth (Auth.js v5). Markdown editor with live preview, image upload (filesystem with magic-number sniffing), autosave to localStorage.

## Tech stack

- **Framework**: Next.js 16 (App Router, Turbopack, `output: "standalone"`)
- **UI**: React 19.2, TypeScript 5 (strict), Tailwind CSS 4
- **Animation**: Framer Motion 12, Split-Type
- **Database**: MongoDB 7 (direct driver, not Mongoose)
- **Auth**: Auth.js v5 (`next-auth@5.0.0-beta`) with GitHub provider + MongoDB adapter
- **Markdown**: `react-markdown` + `remark-gfm` + `rehype-raw` + `rehype-sanitize` (allow-list schema) + `rehype-highlight`
- **Forms**: Formspree (contact form)
- **Analytics**: Google Analytics via `@next/third-parties` (ID read from `public/content.json`)
- **Package manager**: pnpm (Node 20+)

## Prerequisites

- Node.js 20.x
- pnpm (via Corepack: `corepack enable pnpm`)
- A MongoDB instance (local Docker or Atlas)
- A GitHub OAuth App for admin sign-in

## Required environment variables

The site **will not run** without these. Copy `.env.example` to `.env`, then fill in:

| Variable                | Purpose                                                                                                                                |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `MONGODB_URI`           | MongoDB connection string. Used by the blog and the Auth.js MongoDB adapter.                                                           |
| `AUTH_SECRET`           | Random 32-byte secret for Auth.js. Generate with `openssl rand -base64 32`.                                                            |
| `AUTH_GITHUB_ID`        | GitHub OAuth App Client ID.                                                                                                            |
| `AUTH_GITHUB_SECRET`    | GitHub OAuth App Client Secret.                                                                                                        |
| `ADMIN_GITHUB_USERNAME` | Comma-separated GitHub usernames allowed admin access. Anyone signing in with another username gets `isAdmin: false` on their session. |

Optional:

| Variable                      | Purpose                                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_DISCORD_USER_ID` | Discord user ID for the presence widget (Spotify + VS Code via `api.lagden.dev/v1/watcher/{id}`). |

> The Google Analytics ID is **not** an env var — it's read from `public/content.json` at `metadata.googleAnalyticsId`.

### Setting up the GitHub OAuth App

1. GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
2. Homepage URL: `http://localhost:3000` (dev) or your production URL
3. Authorization callback URL: `http://localhost:3000/api/auth/callback/github` (dev) or `https://yourdomain/api/auth/callback/github` (prod)
4. Generate a client secret. Both the Client ID and the secret go into `.env`.

## Local development

```bash
pnpm install
cp .env.example .env  # then fill in the vars
pnpm dev
```

The dev server runs on `http://localhost:3000`. Without `MONGODB_URI`, blog and admin routes will log errors and degrade gracefully — the home portfolio page still renders.

If `MONGODB_URI` is set but unreachable:

- `/blog` and `/blog/feed.xml` are `force-dynamic` and return empty content
- `/sitemap.xml` skips blog URLs
- `/` (home) falls back to an empty "Latest posts" section
- `/admin/*` will fail when the editor tries to save

## Building & running production

```bash
pnpm build           # next build with output: "standalone"
pnpm start           # node .next/standalone/server.js
```

`pnpm start` runs the standalone server output. Static assets are NOT auto-copied to `.next/standalone/` by `next build` in standalone mode — the included `Dockerfile` handles that, but if running standalone outside Docker you need to copy `.next/static` and `public` next to the standalone server.

## Quality

```bash
pnpm tsc --noEmit    # typecheck (no script alias yet)
pnpm lint            # ESLint with Next core-web-vitals + TypeScript rules
pnpm format          # Prettier
pnpm format:check    # Prettier check (CI)
```

There is **no test suite**. CI (`.github/workflows/`) runs ESLint and Prettier-check only. Stabilisation work proceeds with `tsc --noEmit` + `pnpm lint` as the verification floor.

## Deployment

This project deploys via **Coolify** (self-hosted PaaS, not Vercel). The included `Dockerfile`:

- Multi-stage Node 20 Alpine build
- Builds with Turbopack, outputs `.next/standalone`
- Final stage runs `node .next/standalone/server.js` on port 3000
- Declares `VOLUME ["/app/public/uploads"]` for blog image persistence
- `HEALTHCHECK` hits `/api/health`

In Coolify, point a service at the Dockerfile and configure a persistent volume mount for `/app/public/uploads` — without it, uploaded blog images are lost on every redeploy.

The `Vercel` deploy button has been removed from this README; the project depends on a writable filesystem for uploads which Vercel's serverless functions don't provide.

## Architecture notes

**Content sources:**

- Static CV content: `public/content.json` (loaded server-side via `src/utils/serverContentLoader.ts`)
- Blog posts: MongoDB via `src/lib/blog.ts` (uses `src/lib/mongodb.ts`)

**Auth model:**

- GitHub OAuth → Auth.js v5 (`src/lib/auth.ts`)
- JWT sessions (default `strategy: "jwt"`)
- `isAdmin` set in the JWT callback by checking `ADMIN_GITHUB_USERNAME` allow-list — there is no DB-side admin flag
- Without `MONGODB_URI`, the adapter falls back to JWT-only and logs a warning

**Intro animation:**

- Owned by `src/app/(home)`-equivalent route — only the home route renders the loader and applies `intro-locked` to body via `HomeIntroBootstrap`
- `Header.tsx` runs the state machine: `loading → letters → fall → reveal → done`
- 5-second fallback if `document.fonts.ready` stalls

**Error handling:**

- `src/app/error.tsx` — route-level error boundary
- `src/app/global-error.tsx` — root-layout error boundary (replaces `<html>` and `<body>`)
- Both log to `console.error`; there is **no** Sentry or other observability layer

**Security headers:** `next.config.ts` returns HSTS, CSP, Referrer-Policy, X-Frame-Options, X-Content-Type-Options, Permissions-Policy on every response. `poweredByHeader: false`.

**Markdown sanitisation:** `MarkdownRenderer` extends `defaultSchema` from `rehype-sanitize` — allow-list approach, restricted URL protocols (http/https/mailto only), syntax-highlight class names allowed.

**Upload validation:** `src/lib/upload.ts` sniffs the first 12 bytes against magic numbers (JPEG/PNG/GIF/WebP) and derives the saved file's extension from the sniffed type. SVG is **not** accepted (XSS risk via inline `<script>`).

## Project structure

```
.planning/                 # GSD project planning (git-tracked)
  codebase/                # Codebase map docs (STACK, ARCHITECTURE, CONCERNS, etc.)
  quick/                   # Quick-task records
  PROJECT.md               # Project context
  REQUIREMENTS.md          # v1 requirements with traceability
  ROADMAP.md               # Phase breakdown
  STATE.md                 # Current position
public/
  content.json             # Static CV content
  uploads/                 # Blog image uploads (gitignored, Docker volume in prod)
  *.png, *.ico, ...        # Static assets
src/
  app/
    layout.tsx             # Root layout (Auth provider, fonts, GA)
    page.tsx               # Home (renders loader + HomeIntroBootstrap + HomeClient)
    HomeClient.tsx         # Home content sections
    error.tsx              # Route error boundary
    global-error.tsx       # Root error boundary
    not-found.tsx          # 404
    sitemap.ts, robots.ts
    api/
      auth/[...nextauth]/  # Auth.js handlers
      blog/                # Blog CRUD + upload route
      health/              # Healthcheck for Docker
    blog/                  # Public blog routes (force-dynamic)
    admin/                 # GitHub-gated admin UI
    auth/signin/           # Custom signin page
  components/
    layout/                # Header, Footer, Navigation, MobileMenu
    sections/              # CV sections (About, Experience, Skills, etc.)
    ui/                    # Reusable UI components
    blog/                  # Blog-specific UI (renderer, search, pagination)
    admin/                 # Admin UI (editor, sidebar, image upload)
    auth/                  # Session provider, sign-in button
  lib/                     # Server-side primitives (auth, blog DB, mongodb, upload)
  hooks/                   # Custom hooks
  types/                   # TypeScript types
  utils/                   # Utility functions (content loaders, animation, scroll)
Dockerfile                 # Multi-stage build for Coolify
next.config.ts             # output: standalone + security headers + CSP
eslint.config.mjs          # Flat config, Next core-web-vitals + TypeScript
```

## Customizing

If you're forking this for your own use:

1. Replace content in `public/content.json`
2. Replace OG/Twitter/icon images in `public/`
3. Update `src/app/layout.tsx` metadata defaults
4. Adjust colors/typography in `src/app/globals.css` and `tailwind.config.*`
5. Update `src/types/content.ts` if you add new content fields
6. The blog/admin subsystem is optional — strip `src/app/{blog,admin,auth,api/{auth,blog}}` and remove the related deps from `package.json` if you only want the CV

## License

[Zachariah Michael Lagden Public License (ZML-PL)](./LICENCE).

## Contact

Zach Lagden — [zach@zachlagden.uk](mailto:zach@zachlagden.uk)

Project: [https://zachlagden.uk](https://zachlagden.uk)
