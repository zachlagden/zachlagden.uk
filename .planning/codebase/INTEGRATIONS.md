# External Integrations

**Analysis Date:** 2026-05-06

> **State:** Project is half-complete. Sentry observability has been fully ripped out (no package, no config, no runtime hooks). Auth + MongoDB + blog stack is partially wired (admin UI components and API routes exist but the feature surface is incomplete and dependent on external Mongo + GitHub OAuth setup). Public-facing CV integrations (Formspree, Google Analytics, Discord presence) are functional.

## APIs & External Services

**Forms / Contact:**
- **Formspree** — contact form submission
  - SDK/Client: `@formspree/react` 3.0.0
  - Wired in: `src/components/sections/ContactSection.tsx` via `useForm(content.formspreeId)` and `<ValidationError>`
  - Form ID: `mqapzrgk` (committed in `public/content.json` at `contact.formspreeId`) — not env-driven
  - Auth: none (form ID is the only credential; safe to commit)
  - Endpoint: hosted on `formspree.io` (handled internally by SDK)

**Analytics:**
- **Google Analytics 4** — page view + traffic analytics
  - SDK/Client: `@next/third-parties` 16.1.6 (`<GoogleAnalytics gaId={...}>`)
  - Wired in: `src/app/layout.tsx` line 144-146
  - Measurement ID: `G-JGDJX5L7B9` (committed in `public/content.json` at `metadata.googleAnalyticsId`) — sourced from JSON, NOT from `NEXT_PUBLIC_GA_ID` env var despite `.env.example` listing it
  - Auth: none beyond public measurement ID

**Discord Presence (Lanyard-like):**
- **Lagden.dev Watcher API** — real-time Discord status (Spotify currently playing + VS Code activity)
  - Endpoint: `https://api.lagden.dev/v1/watcher/{userId}` (defined in `src/utils/presenceService.ts` line 9)
  - Polled client-side every 5 seconds via `setInterval` in `src/components/ui/PresenceStatus.tsx`
  - Renders `src/components/ui/SpotifyDisplay.tsx` (shows track name, artists, progress, links to `open.spotify.com`) and `src/components/ui/VSCodeDisplay.tsx`
  - Auth: none (public watcher API)
  - User ID: `process.env.NEXT_PUBLIC_DISCORD_USER_ID` (optional; component renders nothing if unset)
  - Note: this also implicitly integrates with Spotify (links out to `open.spotify.com/search/...` and uses `track.url` from the Discord Spotify status payload — no direct Spotify Web API call)

**Authentication / Identity:**
- **GitHub OAuth** (via Auth.js v5 / next-auth beta)
  - SDK/Client: `next-auth` 5.0.0-beta.30 with `next-auth/providers/github`
  - Wired in: `src/lib/auth.ts` — exports `handlers`, `auth`, `signIn`, `signOut`
  - Route handler: `src/app/api/auth/[...nextauth]/route.ts` (re-exports `GET`, `POST` from `handlers`)
  - Sign-in surface: `src/components/auth/SignInButton.tsx` → calls `signIn("github")`
  - Custom sign-in page: `src/app/auth/signin/page.tsx` (configured via `pages.signIn` in `src/lib/auth.ts`)
  - Session strategy: JWT (`session: { strategy: "jwt" }`)
  - Adapter: `@auth/mongodb-adapter` 3.11.1 — wraps `getClientPromise()` from `src/lib/mongodb.ts`; gracefully returns `undefined` if MongoDB connection throws (so JWT sessions still work without persistence)
  - Admin gating: `jwt` callback compares GitHub `login` against comma-separated `ADMIN_GITHUB_USERNAME` env var, sets `token.isAdmin`; surfaced as `session.user.isAdmin`
  - Required env: `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `ADMIN_GITHUB_USERNAME`
  - Type augmentation: `src/types/next-auth.d.ts` adds `githubUsername` and `isAdmin` to `Session.user` and `JWT`

## Data Storage

**Databases:**
- **MongoDB** (self-hosted or Atlas)
  - Driver: `mongodb` 7.1.0 (direct driver, no ODM)
  - Connection wrapper: `src/lib/mongodb.ts` — global-cached `MongoClient` in dev, fresh client per cold-start in prod
  - Required env: `MONGODB_URI` (throws at first call if unset)
  - Used by:
    - `src/lib/blog.ts` — `posts` collection (CRUD, indexes on `slug`, `status+publishedAt`, `tags`, `author.githubUsername`)
    - `@auth/mongodb-adapter` (when reachable) — accounts/sessions/users/verification tokens collections
  - Collections: `posts` (typed via `src/types/blog.ts` `BlogPost`)

**File Storage:**
- **Local filesystem** — uploaded blog images
  - Implementation: `src/lib/upload.ts` — writes to `process.cwd()/public/uploads/` with random hex-suffixed filenames
  - Persisted in production via Docker volume `VOLUME ["/app/public/uploads"]` declared in `Dockerfile` (per Coolify deployment pattern)
  - Upload endpoint: `src/app/api/blog/upload/route.ts` — admin-only, 5MB limit, allowlist `image/jpeg|png|gif|webp|svg+xml`

**Caching:**
- None at infrastructure level (no Redis, no Memcached)
- In-memory: `src/utils/contentLoader.ts` caches the parsed `public/content.json` in module-scoped `contentCache` for client-side calls
- HTTP: RSS feed `src/app/blog/feed.xml/route.ts` returns `Cache-Control: public, max-age=3600`

## Authentication & Identity

(See "GitHub OAuth" under APIs above — Auth.js v5 + GitHub provider + JWT sessions + MongoDB adapter when available.)

**Protected surfaces:**
- All blog admin API routes (`POST /api/blog/posts`, `PUT/DELETE /api/blog/posts/[id]`, `POST /api/blog/upload`, `GET /api/blog/posts/[id]`) gate on `session.user.isAdmin`
- Admin UI under `src/app/admin/*` (page components exist; layout in `src/app/admin/layout.tsx`)

## Monitoring & Observability

**Error Tracking:**
- **None.** Sentry has been fully removed.
  - Deleted files (per `git status`): `sentry.edge.config.ts`, `sentry.server.config.ts`, `instrumentation-client.ts`, `src/instrumentation.ts`, `src/app/global-error.tsx`
  - `@sentry/nextjs` is no longer in `package.json` `dependencies`
  - Zero `Sentry`, `@sentry/`, or `instrumentation` references remain in `src/`
  - Last working Sentry commit: `c1f4720` ("⚙️ Update Sentry instrumentation and add server configuration"); subsequent redesign commit `2db2476` and current working tree have stripped it out
  - **Implication:** unhandled errors will only surface to browser console / Next.js logs. No error aggregation, no source maps uploaded, no release tracking.

**Logs:**
- Console only. `console.warn` in `src/components/ui/PresenceStatus.tsx` (presence API errors) and `console.error` in `src/utils/contentLoader.ts` (content load failures). No structured logging library.

**Health checks:**
- `GET /api/health` (`src/app/api/health/route.ts`) returns `{ status: "ok" }` — wired into Dockerfile `HEALTHCHECK` directive

## CI/CD & Deployment

**Hosting:**
- Coolify (per project `CLAUDE.md` global rules and commit `231122c`) using the Traefik reverse proxy that ships with Coolify
- Docker image built from `Dockerfile` (Node 20 Alpine, multi-stage, non-root `nextjs` user, port 3000)

**CI Pipeline:**
- GitHub Actions:
  - `.github/workflows/lint.yml` — runs `pnpm run lint` (ESLint) on push/PR to `main`
  - `.github/workflows/prettier.yml` — runs `pnpm run format:check` on push/PR to `main`
- Both use Node 20 + pnpm latest with pnpm store caching keyed on `pnpm-lock.yaml` hash
- No build/test/deploy stages; deployment is Coolify-driven (likely git-push → rebuild webhook)

**Dependabot:**
- `.github/dependabot.yml` present (modified in working tree) — auto-PRs for npm dependency updates

## Environment Configuration

**Required env vars** (declared in `.env.example`, consumed in source):
- `MONGODB_URI` — Mongo connection string. Read in `src/lib/mongodb.ts`. Throws if unset and DB is touched. Sitemap and `getLatestPosts` calls in `src/app/page.tsx` swallow the resulting error gracefully.
- `AUTH_SECRET` — Auth.js JWT signing secret. Required by `next-auth` for any sign-in flow.
- `AUTH_GITHUB_ID` — GitHub OAuth App client ID. Required by GitHub provider.
- `AUTH_GITHUB_SECRET` — GitHub OAuth App client secret. Required by GitHub provider.
- `ADMIN_GITHUB_USERNAME` — comma-separated GitHub usernames granted `isAdmin: true`. Read in `src/lib/auth.ts` `getAdminUsernames()`.

**Optional env vars:**
- `NEXT_PUBLIC_DISCORD_USER_ID` — read in `src/components/ui/PresenceStatus.tsx`. If unset, the presence widget renders nothing.
- `NEXT_PUBLIC_GA_ID` — listed in `.env.example` but **NOT consumed anywhere in source.** Google Analytics ID actually comes from `public/content.json` `metadata.googleAnalyticsId`. (Likely stale `.env.example` entry.)

**Runtime-only:**
- `NODE_ENV` — branched in `src/lib/mongodb.ts` to enable global client caching in dev only
- `NEXT_RUNTIME` — was branched in deleted `src/instrumentation.ts`; no longer referenced

**Secrets location:**
- `.env` file present at repo root (gitignored via `.env*` rule with `!.env.example` exception)
- For production, secrets are managed by Coolify env-var UI (per `CLAUDE.md` infra docs)

## Webhooks & Callbacks

**Incoming:**
- `GET /api/auth/[...nextauth]` — Auth.js callback handler (GitHub OAuth callback URL: `{siteUrl}/api/auth/callback/github`)
- `GET /api/health` — used by Docker healthcheck (`Dockerfile`)
- `GET /api/blog/posts` — public blog listing
- `GET /api/blog/tags` — public tag listing
- `GET /api/blog/posts/[id]` — admin-only, fetch by ID
- `PUT /api/blog/posts/[id]` — admin-only, update
- `DELETE /api/blog/posts/[id]` — admin-only, delete
- `POST /api/blog/posts` — admin-only, create
- `POST /api/blog/upload` — admin-only, image upload
- `GET /blog/feed.xml` — RSS feed (`src/app/blog/feed.xml/route.ts`)
- `GET /sitemap.xml`, `GET /robots.txt` — generated via `src/app/sitemap.ts` and `src/app/robots.ts`

**Outgoing:**
- `https://api.lagden.dev/v1/watcher/{userId}` — Discord presence polling (every 5s, client-side)
- `https://fonts.googleapis.com` / `https://fonts.gstatic.com` — Google Fonts (Inter, Syne, JetBrains Mono via `next/font/google` in `src/app/layout.tsx`); `<link rel="preconnect">` declared
- `https://avatars.githubusercontent.com` — admin user avatars after GitHub OAuth; allowlisted in `next.config.ts` `images.remotePatterns`
- `https://www.googletagmanager.com` — Google Analytics script (loaded by `<GoogleAnalytics>`)
- `https://formspree.io` — contact form POST target (handled by `@formspree/react`)
- Share button targets (no API, just URL handoff): `https://twitter.com/intent/tweet`, `https://www.linkedin.com/sharing/share-offsite/` — wired in `src/components/blog/ShareButtons.tsx`

---

*Integration audit: 2026-05-06*
