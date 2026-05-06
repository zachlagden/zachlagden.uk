<!-- refreshed: 2026-05-06 -->
# Architecture

**Analysis Date:** 2026-05-06

> **Repo state caveat:** The user describes this project as "half-complete and somewhat broken." This document captures the architecture **as it currently exists**, including orphaned modules, partially wired flows, and divergences from the patterns documented in `CLAUDE.md` / `README.md`. Cross-reference `CONCERNS.md` for the corresponding inventory of debt and broken wiring.

## System Overview

```text
┌─────────────────────────────────────────────────────────────────────┐
│                       Browser (Next.js client)                       │
├──────────────────────┬───────────────────────┬──────────────────────┤
│   Marketing/CV (/)    │   Blog (/blog/...)    │  Admin (/admin/...)  │
│  `app/HomeClient.tsx` │ `app/blog/...Client`  │ `app/admin/...`      │
└──────────┬───────────┴──────────┬────────────┴──────────┬───────────┘
           │                       │                       │
           ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   Next.js App Router (RSC + Routes)                  │
│  Server pages: `src/app/**/page.tsx`, `layout.tsx`, `route.ts`       │
│  - generateMetadata pulls from content.json + Mongo                  │
│  - Server pages fetch data, then hand off to "...Client" components  │
└──────────┬───────────────────────────────────┬──────────────────────┘
           │                                   │
           ▼                                   ▼
┌──────────────────────────────┐   ┌──────────────────────────────────┐
│  Static content layer         │   │  Dynamic data layer (blog/auth) │
│  `public/content.json`        │   │  `src/lib/blog.ts` (Mongo)      │
│  `src/utils/serverContent`    │   │  `src/lib/mongodb.ts`           │
│  `src/types/content.ts`       │   │  `src/lib/auth.ts` (NextAuth)   │
│                               │   │  `src/lib/upload.ts` (FS)       │
└──────────────────────────────┘   └──────────────┬───────────────────┘
                                                  │
                                                  ▼
                                   ┌──────────────────────────────────┐
                                   │  External stores                  │
                                   │  - MongoDB (posts, auth adapter)  │
                                   │  - GitHub OAuth                   │
                                   │  - Local FS `public/uploads/`     │
                                   │  - api.lagden.dev (presence)      │
                                   │  - Formspree (contact)            │
                                   └──────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Root layout | HTML shell, fonts, GA, intro loader, NextAuth `SessionProvider`, global `SignInButton` | `src/app/layout.tsx` |
| Home server page | RSC: load `content.json` + latest blog posts, render `HomeClient` | `src/app/page.tsx` |
| Home client | Wires every CV section, intro state, refs, observers, keyboard nav, structured data | `src/app/HomeClient.tsx` |
| Header (intro) | Multi-phase name reveal animation (`loading → letters → fall → reveal → done`) | `src/components/layout/Header.tsx` |
| Section observer | Tracks active section via `IntersectionObserver` | `src/hooks/useSectionObserver.ts` |
| Keyboard nav | Arrow-up/down + 1-9 jump shortcuts | `src/hooks/useKeyboardNavigation.ts` |
| Section wrapper | Shared section chrome: title, scatter background, parallax, view-transition tags | `src/components/ui/Section.tsx` |
| Server content loader | `fs.readFile` of `public/content.json` (server-side only) | `src/utils/serverContentLoader.ts` |
| Client content loader | `fetch('/content.json')` with in-memory cache — **currently unused** | `src/utils/contentLoader.ts` |
| Blog data layer | Mongo CRUD for `posts` collection, slug/index/reading-time logic | `src/lib/blog.ts` |
| Mongo client | Lazy singleton `MongoClient` with dev-mode global cache | `src/lib/mongodb.ts` |
| Auth | NextAuth v5 (beta) with GitHub provider + Mongo adapter, JWT session strategy | `src/lib/auth.ts` |
| Auth helpers | `getSession`, `isAdmin`, `requireAdmin` for route handlers | `src/lib/auth-helpers.ts` |
| Upload | Writes uploaded images to `public/uploads/` with random filenames | `src/lib/upload.ts` |
| Presence service | Polls `api.lagden.dev/v1/watcher/<discordId>` for live Discord/Spotify status | `src/utils/presenceService.ts` |
| View transitions util | Wraps `document.startViewTransition` with feature detection | `src/utils/viewTransition.ts` |
| Scroll utils | `scrollToSection` / `scrollToTop` honoring `prefers-reduced-motion` | `src/utils/scrollUtils.ts` |
| Animation constants | Reusable Framer Motion variants | `src/utils/animationUtils.ts` |
| `ClearIntro` | Removes intro loader / unlocks body for non-home routes | `src/components/ui/ClearIntro.tsx` |

## Pattern Overview

**Overall:** Next.js 16 App Router with a thin RSC shell and heavyweight client islands.

**Key Characteristics:**
- Server components do data fetching only (`loadContentServer`, `getLatestPosts`, `getPostBySlug`, `auth()`); they hand serialized props to a single `*Client` component that owns interactivity.
- Static CV/portfolio content is sourced from a JSON file in `public/`, not a CMS or database.
- Dynamic content (blog, sessions, uploads) lives in MongoDB; the `lib/` layer is the only module that touches the driver.
- Animation is concentrated: the home `Header` runs a bespoke multi-phase intro state machine; all other sections share the `Section` wrapper for entry animation, parallax, and section numbering.
- Accessibility is wired through `useKeyboardNavigation`, skip-to-content link, ARIA roles, and `prefers-reduced-motion` checks at every animated component (`useSyncExternalStore` is used to avoid hydration mismatches when reading the media query).

## Layers

**App Router (`src/app/`):**
- Purpose: Routing, RSC data loading, metadata, SEO routes.
- Location: `src/app/`
- Contains: Server `page.tsx` / `layout.tsx`, route handlers (`route.ts`), client islands suffixed `*Client.tsx`, generated SEO files (`sitemap.ts`, `robots.ts`, `not-found.tsx`).
- Depends on: `lib/` (data + auth), `utils/serverContentLoader`, `types/`, `components/`.
- Used by: Next.js runtime.

**Components (`src/components/`):**
- Purpose: Presentational + interactive React components.
- Location: `src/components/{layout,sections,ui,blog,admin,auth,providers}/`
- Contains: Layout chrome (`Header`, `Footer`, `Navigation`, `MobileMenu`), CV sections (`*Section.tsx`), shared UI primitives, blog cards/editor, admin shell, NextAuth session wrapper.
- Depends on: `hooks/`, `utils/`, `types/`.
- Used by: App Router pages and client components.

**Hooks (`src/hooks/`):**
- Purpose: Encapsulated client-only behaviors.
- Location: `src/hooks/`
- Contains: `useSectionObserver`, `useKeyboardNavigation`, `useParallax`, `useAutoSave` (admin editor draft persistence).
- Depends on: Browser APIs, framer-motion (`useParallax`).
- Used by: `HomeClient`, `Section`, `BlogEditor`.

**Lib (`src/lib/`):**
- Purpose: Server-only data and auth integration.
- Location: `src/lib/`
- Contains: `mongodb.ts` (singleton), `blog.ts` (CRUD + indexes), `auth.ts` (NextAuth config), `auth-helpers.ts`, `upload.ts`.
- Depends on: `mongodb` driver, `next-auth`, Node `fs`/`crypto`.
- Used by: API routes, server pages.
- Constraint: Must never be imported from a `"use client"` module — would leak Mongo URI / break the bundle.

**Utils (`src/utils/`):**
- Purpose: Pure helpers usable from either side of the boundary.
- Location: `src/utils/`
- Contains: `serverContentLoader` (server-only), `contentLoader` (client-only, **orphaned**), `scrollUtils`, `viewTransition`, `animationUtils` (variants), `presenceService` (browser fetch).
- Depends on: `types/`, browser/Node primitives.
- Used by: Components, hooks, app routes.

**Types (`src/types/`):**
- Purpose: Shared TypeScript contracts.
- Location: `src/types/`
- Contains: `content.ts` (CV schema mirroring `public/content.json`), `blog.ts` (DB + serialized + input + `serializePost` helper), `presence.ts` (presence API response shapes), `next-auth.d.ts` (session/JWT augmentation).
- Depends on: `mongodb` (`ObjectId`), `next-auth`.
- Used by: Every other layer.

## Data Flow

### Primary Request Path — Home (`/`)

1. Next.js invokes the server `Home` component (`src/app/page.tsx:6`).
2. `loadContentServer()` reads and parses `public/content.json` synchronously per-request (`src/utils/serverContentLoader.ts:5`).
3. `getLatestPosts(3)` queries MongoDB, wrapped in a `try/catch` that swallows errors and falls back to `[]` (`src/app/page.tsx:11-15`, `src/lib/blog.ts:132`).
4. Posts are serialized via `serializePost` (`src/types/blog.ts:53`) and passed alongside `content` to `HomeClient` (`src/app/page.tsx:17`).
5. `HomeClient` renders the static shell SSR'd HTML, then on hydrate:
   - `Header` enters the intro state machine (`src/components/layout/Header.tsx:36-200`).
   - Heavy sections are loaded via `next/dynamic` with `Suspense` fallbacks (`src/app/HomeClient.tsx:39-95`).
   - `useSectionObserver` and `useKeyboardNavigation` mount once hydrated.
6. JSON-LD structured data is injected via `next/script` for SEO (`src/app/HomeClient.tsx:266-270`).

### Blog list (`/blog`)

1. `BlogPage` server component reads `searchParams`, calls `getPublishedPosts(page, 10, tag)` and `getAllTags()` in parallel (`src/app/blog/page.tsx:21-24`).
2. Posts are serialized and passed to `BlogListClient` for client-side filtering/pagination (`src/app/blog/BlogListClient.tsx`).
3. `BlogLayout` wraps with shared `BlogNav`, shared `Footer`, and a `ClearIntro` to dispose of the home-route intro loader (`src/app/blog/layout.tsx`).

### Blog post (`/blog/[slug]`)

1. `generateMetadata` loads the post + content for OG tags; falls back to "Post Not Found" if missing (`src/app/blog/[slug]/page.tsx:8-41`).
2. `BlogPostPage` resolves the post, fetches `getAdjacentPosts` for prev/next nav, and serializes to `BlogPostClient` (`src/app/blog/[slug]/page.tsx:43-69`).

### Admin write path

1. `AdminLayout` calls `auth()` server-side and `redirect("/")` if `!session.user.isAdmin` (`src/app/admin/layout.tsx:10-13`).
2. `/admin` redirects to `/admin/blog` (`src/app/admin/page.tsx`).
3. Editor pages (`new`, `[slug]/edit`) render `BlogEditor` which calls `useAutoSave` for draft persistence in `localStorage` (`src/components/admin/BlogEditor.tsx`, `src/hooks/useAutoSave.ts`).
4. Editor submits to `/api/blog/posts` (`POST` create) or `/api/blog/posts/[id]` (`PUT` update / `DELETE`) — every handler re-checks `session.user.isAdmin` (`src/app/api/blog/posts/route.ts`, `src/app/api/blog/posts/[id]/route.ts`).
5. Image uploads go to `/api/blog/upload` → `saveUploadedFile` writes into `public/uploads/` with a random filename (`src/app/api/blog/upload/route.ts`, `src/lib/upload.ts`).

### Auth flow

1. `/auth/signin` calls `signIn('github', { callbackUrl: '/' })` from `next-auth/react` (`src/app/auth/signin/page.tsx:25`).
2. NextAuth handlers are mounted at `/api/auth/[...nextauth]/route.ts` (re-exporting `handlers` from `src/lib/auth.ts`).
3. The `jwt` callback reads `profile.login` (GitHub username) and sets `token.isAdmin = ADMIN_GITHUB_USERNAME contains login` (`src/lib/auth.ts:26-32`).
4. The `session` callback hydrates `session.user.githubUsername` and `session.user.isAdmin` (`src/lib/auth.ts:34-41`).
5. Mongo adapter is wrapped in `getAdapter()` which silently swallows errors and returns `undefined` if Mongo is unavailable (`src/lib/auth.ts:14-20`).

### Presence (Discord/Spotify) flow

1. `Header` renders `PresenceStatus` once intro completes (`src/components/layout/Header.tsx:386`).
2. `PresenceStatus` reads `process.env.NEXT_PUBLIC_DISCORD_USER_ID`, polls `https://api.lagden.dev/v1/watcher/{id}` via `presenceService.fetchPresenceData` with `cache: 'no-store'` (`src/components/ui/PresenceStatus.tsx`, `src/utils/presenceService.ts:14`).
3. Spotify and VS Code activities are parsed and prioritized by `getPrimaryActivity` (`src/utils/presenceService.ts:100-125`).

**State Management:**
- Local `useState` per component; no Redux/Zustand/Context for app state.
- The only React Context in use is `SessionProvider` from `next-auth/react` (`src/components/auth/SessionProvider.tsx`).
- `useAutoSave` persists editor drafts in `localStorage` (`src/hooks/useAutoSave.ts`).
- Cross-section state (active section, mobile menu, intro completion) is owned by `HomeClient` and threaded down via props.

## Key Abstractions

**`ContentData` schema:**
- Purpose: Strongly-typed mirror of `public/content.json`.
- Examples: `src/types/content.ts:1-126`.
- Pattern: Every CV section component receives a slice of `ContentData` (`content.about`, `content.experience`, …) as a prop — the **content-as-props pattern** documented in `CLAUDE.md`. No section reads `content.json` directly.

**`Section` wrapper:**
- Purpose: Shared section chrome — animated header, parallax scatter background, section number badge, view-transition tags.
- Examples: `src/components/ui/Section.tsx`. Used by every `*Section.tsx` (`AboutSection`, `ExperienceSection`, …).
- Pattern: `forwardRef<HTMLElement>` so the parent can attach a section ref for `useSectionObserver`.

**`*Client` companion components:**
- Purpose: Convention for splitting an RSC page from its interactive island.
- Examples: `app/page.tsx` ↔ `app/HomeClient.tsx`, `app/blog/page.tsx` ↔ `app/blog/BlogListClient.tsx`, `app/blog/[slug]/page.tsx` ↔ `app/blog/[slug]/BlogPostClient.tsx`, `app/admin/blog/page.tsx` ↔ `app/admin/blog/AdminBlogClient.tsx`.
- Pattern: Server component fetches, serializes (Mongo `ObjectId`/`Date` → strings via `serializePost`), and passes plain JSON-safe props.

**Intro state machine:**
- Purpose: Cinematic page-load name reveal (recent commits `b4bfacb`, `38b2634`, `35c2ba7`).
- Phases: `"loading" → "letters" → "fall" → "reveal" → "done"` (`src/components/layout/Header.tsx:18`).
- Behavior:
  - `loading`: CSS-only `#initial-loader` dot is visible; body has class `intro-locked`. `document.fonts.ready` gates progression.
  - `letters`: Each character animates in (delay = 0.3s + i × 0.05s, duration 0.4s) at a dynamically computed font size sized to fill ~92% of viewport width.
  - `fall`: After a 0.3s post-letters pause, font-size swap is hidden by a measured `scale` ramp; a 3D rotateX + Y bounce plays.
  - `reveal`: Subtitle, contact row, presence, mobile social links, and scroll indicator slide up in stagger.
  - `done`: `body.intro-locked` removed; sticky nav and side rails fade in; scroll-driven opacity/scale on the header activates.
- Bypass: If `prefersReducedMotion` is set, the intro skips straight to `done`. If `window.scrollY > 0` on mount (browser restored scroll), the intro is also skipped (`src/components/layout/Header.tsx:107-121`).

**Section navigation:**
- `useSectionObserver` (`src/hooks/useSectionObserver.ts`) builds an `IntersectionObserver` with thresholds `[0, 0.1, …, 1.0]` and `rootMargin: -20% 0px -20% 0px`, picking the section with the highest intersection ratio as active.
- `useKeyboardNavigation` (`src/hooks/useKeyboardNavigation.ts`) binds `ArrowDown`/`ArrowUp` to step through sections and `1`–`9` to jump directly. Inputs/textareas are excluded.
- `scrollToSection` uses native `scrollIntoView({ block: 'start' })` with `scroll-margin-top` set in CSS for the sticky nav offset.

**View Transitions API:**
- `supportsViewTransitions()` feature-detects `document.startViewTransition` (`src/utils/viewTransition.ts:11`).
- `Section` writes `viewTransitionName: section-header-${id}` / `section-content-${id}` inline styles when supported (`src/components/ui/Section.tsx:184-208`).
- Global CSS in `src/app/globals.css:25-40` declares `view-transition-name` for `section`, `h2`, and `.section-content` inside an `@supports` guard.
- `scrollToSectionWithTransition` exists but is not wired in — `HomeClient` uses the plainer `scrollToSection` from `scrollUtils.ts`.

## Entry Points

**HTTP entry — root layout:**
- Location: `src/app/layout.tsx`
- Triggers: Every route.
- Responsibilities: Font variables (`Inter`, `Syne`, `JetBrains_Mono`), `<head>` preconnect/prefetch, `metadataBase` and OpenGraph/Twitter metadata derived from `content.json`, mounts `SessionProvider`, fixed `SignInButton`, Google Analytics via `@next/third-parties/google`, and the CSS `intro-locked` body class.

**HTTP entry — home page:**
- Location: `src/app/page.tsx`
- Triggers: `GET /`.
- Responsibilities: Load CV content + latest blog posts, hand to `HomeClient`.

**HTTP entry — home client island:**
- Location: `src/app/HomeClient.tsx`
- Triggers: First hydration on `/`.
- Responsibilities: Section refs, intro state ownership, dynamic imports of every section, JSON-LD `Person` schema, sticky nav, mobile menu, scroll-to-top button, custom cursor (`ssr: false`), keyboard nav.

**HTTP entry — blog routes:** `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`, `src/app/blog/feed.xml/route.ts`.
**HTTP entry — admin routes:** `src/app/admin/layout.tsx` (auth gate), `src/app/admin/blog/page.tsx`, `src/app/admin/blog/new/page.tsx`, `src/app/admin/blog/[slug]/edit/page.tsx`.
**HTTP entry — auth:** `src/app/api/auth/[...nextauth]/route.ts`, `src/app/auth/signin/page.tsx`.
**HTTP entry — API:** `src/app/api/health/route.ts`, `src/app/api/blog/posts/route.ts`, `src/app/api/blog/posts/[id]/route.ts`, `src/app/api/blog/tags/route.ts`, `src/app/api/blog/upload/route.ts`.
**SEO entries:** `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/blog/feed.xml/route.ts`.
**Error entry:** `src/app/not-found.tsx` (note: `global-error.tsx` was deleted — see `git status`).

## Architectural Constraints

- **Threading:** Single Node.js event loop (Next.js standalone output, `node .next/standalone/server.js`). Mongo client is reused via a module-level `clientPromise` and a `globalThis._mongoClientPromise` singleton in dev (`src/lib/mongodb.ts:7-31`).
- **Global state:**
  - `contentCache` module variable in `src/utils/contentLoader.ts:3` (currently unreachable code path; module is unused).
  - `clientPromise` and `global._mongoClientPromise` in `src/lib/mongodb.ts`.
  - DOM globals: `document.body.classList` toggling `intro-locked`, `#initial-loader` element manipulated from multiple places (`Header.tsx`, `ClearIntro.tsx`, `auth/signin/page.tsx`).
- **Server/client boundary:** `src/lib/*` and `src/utils/serverContentLoader.ts` MUST stay server-only (use Node `fs`, `mongodb`, secrets). `src/utils/contentLoader.ts` and `src/utils/presenceService.ts` MUST stay client-only (browser `fetch`, `process.env.NEXT_PUBLIC_*`).
- **Standalone build:** `next.config.ts` sets `output: 'standalone'`; production runs from `.next/standalone/server.js`. `public/uploads/` is written at runtime, which is **incompatible with a read-only / multi-replica deployment** — see `CONCERNS.md`.
- **Image domains:** Only `avatars.githubusercontent.com` is whitelisted in `next.config.ts:5-12`. Featured-image URLs uploaded via `/api/blog/upload` resolve to `/uploads/...` (same-origin) so they sidestep `next/image` remote validation, but external images in posts will not render through `next/image`.
- **Environment:** `MONGODB_URI`, `ADMIN_GITHUB_USERNAME`, `AUTH_SECRET` (NextAuth), `AUTH_GITHUB_ID`/`AUTH_GITHUB_SECRET`, and `NEXT_PUBLIC_DISCORD_USER_ID` are required for full functionality. The blog/auth code degrades gracefully when Mongo is missing (try/catch around `getLatestPosts` in `app/page.tsx`, `getAllPublishedSlugs` in `sitemap.ts`, and silent `getAdapter()` fallback).

## Anti-Patterns

### Orphaned client content loader

**What happens:** `src/utils/contentLoader.ts` exports `loadContent`, `getContent`, and `formatDate(Range)` but **no module imports any of them** (verified by grep across `src/`).
**Why it's wrong:** `CLAUDE.md` and `README.md` document the data flow as `content.json → contentLoader → components`, but the actual flow is `content.json → serverContentLoader (RSC) → component props`. Future contributors will follow the documented (broken) path and ship a duplicate fetch on the client.
**Do this instead:** Either delete `contentLoader.ts` or wire it as the canonical loader for client-only consumers. Update `CLAUDE.md` to describe the server-loader-then-props pattern that's actually in use (`src/utils/serverContentLoader.ts` → `src/app/page.tsx` → `HomeClient`).

### Empty `providers/` directory

**What happens:** `src/components/providers/` is documented in `CLAUDE.md` ("Context providers") and `README.md` but contains zero files. The only provider in use is `src/components/auth/SessionProvider.tsx`, located outside `providers/`.
**Why it's wrong:** Misleading documentation; planners that load `STRUCTURE.md` will assume providers live in that directory.
**Do this instead:** Move `SessionProvider` to `src/components/providers/`, or delete the empty directory and update docs.

### Three places mutate `#initial-loader` / `intro-locked`

**What happens:** `Header.tsx` (intro state machine), `ClearIntro.tsx` (blog/admin layouts), and `auth/signin/page.tsx` all directly call `document.getElementById('initial-loader')` and `document.body.classList.remove('intro-locked')`.
**Why it's wrong:** State that should live in one place is spread across three components, producing race conditions when navigating between routes that share the root layout.
**Do this instead:** Promote intro/loader control to a single client provider or a hook (`useIntroLifecycle`) that every non-home route calls explicitly.

### Silent failure in `getAdapter()`

**What happens:** `src/lib/auth.ts:14-20` wraps `MongoDBAdapter(getClientPromise())` in `try { ... } catch { return undefined; }`.
**Why it's wrong:** When Mongo is unreachable, NextAuth silently falls back to JWT-only sessions with no persistence. Users can sign in but accounts/sessions aren't recorded; admin role checks still work because `isAdmin` is computed in the JWT callback, but `User` records won't exist. There's no log line.
**Do this instead:** Log the error at module load and surface a clear "Auth running without persistence" warning, or fail fast in production.

## Error Handling

**Strategy:** Defensive try/catch around external calls; UI fallbacks ("Post Not Found", "No posts yet. Check back soon!"); Next.js conventional `not-found.tsx`.

**Patterns:**
- Server pages wrap Mongo calls in `try/catch` and substitute empty arrays (`src/app/page.tsx:10-15`, `src/app/sitemap.ts:9-14`).
- API route handlers return `NextResponse.json({ error: '...' }, { status: 4xx })` on auth/validation failure — see `requireAdmin` in `src/lib/auth-helpers.ts:13-19` and inline checks in `src/app/api/blog/posts/route.ts:24-27`.
- `viewTransition.ts:50-58` falls back to a regular DOM update if `startViewTransition` throws.
- `getAdapter()` swallows Mongo errors silently (see anti-pattern above).
- Note: `src/app/global-error.tsx` was deleted in the working tree (`git status`) — there is currently no app-level error boundary.

## Cross-Cutting Concerns

**Logging:** None. The only `console.error` calls are in `contentLoader.ts:21` (orphan) and `viewTransition.ts:54`. No structured logging, no Sentry — despite global instructions specifying "Sentry for everything," `instrumentation-client.ts`, `sentry.edge.config.ts`, and `sentry.server.config.ts` are deleted (`git status`).

**Validation:** Light. `/api/blog/upload/route.ts:18-35` validates MIME type and 5 MB size. POST/PUT to `/api/blog/posts` accept `request.json()` directly with no schema validation (no Zod, no manual checks) — see `CONCERNS.md`.

**Authentication:** NextAuth v5 (beta) with GitHub OAuth + JWT sessions. Admin authorization is a string-list check against `process.env.ADMIN_GITHUB_USERNAME` performed inside the JWT callback and re-checked in every protected route handler.

**SEO:** Per-route `generateMetadata`, JSON-LD `Person` schema in `HomeClient`, JSON-LD `BlogPosting` is **not** present, dynamic `sitemap.ts` includes blog slugs, RSS feed at `/blog/feed.xml`, OG/Twitter images via `content.json`.

**Accessibility:** `prefers-reduced-motion` honored in every animated component via `useSyncExternalStore` to avoid hydration mismatch; skip-to-content link; ARIA labels and roles throughout; keyboard navigation hook; `tabIndex={-1}` on `<main>` to receive focus from skip link.

---

*Architecture analysis: 2026-05-06*
