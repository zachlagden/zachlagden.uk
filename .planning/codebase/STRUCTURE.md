# Codebase Structure

**Analysis Date:** 2026-05-06

> **Repo state caveat:** Project is described by the user as "half-complete and somewhat broken." `git status` shows several deleted top-level files (`instrumentation-client.ts`, `sentry.*.config.ts`, `src/app/global-error.tsx`) — they are **not** present in the working tree and are excluded from this layout. See `CONCERNS.md`.

## Directory Layout

```
zachlagden.uk/
├── public/                       # Static assets served at the site root
│   ├── content.json              # Centralized CV data (single source of truth)
│   ├── site.webmanifest
│   ├── favicon / og / twitter / android-chrome / apple-touch-icon images
│   └── uploads/                  # Runtime-written blog featured images
├── src/
│   ├── app/                      # Next.js App Router (RSC + routes)
│   ├── components/               # React components, grouped by role
│   ├── hooks/                    # Custom client hooks
│   ├── lib/                      # Server-only data + auth integrations
│   ├── types/                    # Shared TypeScript types
│   └── utils/                    # Pure helpers + transition/animation/scroll utils
├── CLAUDE.md                     # Project guidance for Claude Code
├── README.md                     # Public README (partly out of date)
├── LICENCE                       # ZML-PL license
├── Dockerfile                    # Container build for Coolify deploy
├── eslint.config.mjs             # Flat-config ESLint (next/core-web-vitals)
├── next.config.ts                # output: 'standalone' + image remote pattern
├── postcss.config.mjs            # Tailwind v4 PostCSS plugin
├── tsconfig.json                 # Path alias `@/* → src/*`
├── package.json                  # Scripts + deps (Next 16, React 19, Tailwind 4)
├── pnpm-lock.yaml                # pnpm lockfile
└── pnpm-workspace.yaml
```

## `src/` Tree (full)

```
src/
├── app/
│   ├── layout.tsx                # Root layout: fonts, GA, SessionProvider, intro loader
│   ├── page.tsx                  # Home server component (loads content + latest posts)
│   ├── HomeClient.tsx            # Home interactive island (intro, sections, observers)
│   ├── globals.css               # Tailwind import + view-transition + intro CSS
│   ├── favicon.ico
│   ├── not-found.tsx             # 404 page
│   ├── robots.ts                 # robots.txt generator
│   ├── sitemap.ts                # sitemap.xml generator (includes blog slugs)
│   ├── auth/
│   │   └── signin/
│   │       └── page.tsx          # GitHub OAuth sign-in screen
│   ├── admin/
│   │   ├── layout.tsx            # Auth gate: redirects non-admins to /
│   │   ├── page.tsx              # Redirects /admin → /admin/blog
│   │   └── blog/
│   │       ├── page.tsx          # All-posts table (server)
│   │       ├── AdminBlogClient.tsx  # Search + delete (client)
│   │       ├── new/
│   │       │   └── page.tsx      # New-post editor wrapper
│   │       └── [slug]/
│   │           └── edit/
│   │               └── page.tsx  # Edit-post editor wrapper
│   ├── blog/
│   │   ├── layout.tsx            # Blog shell (BlogNav + Footer + ClearIntro)
│   │   ├── page.tsx              # Blog list (server)
│   │   ├── BlogListClient.tsx    # Search/filter/paginate (client)
│   │   ├── feed.xml/
│   │   │   └── route.ts          # RSS 2.0 feed
│   │   └── [slug]/
│   │       ├── page.tsx          # Post detail (server)
│   │       └── BlogPostClient.tsx # Article + TOC + share + adjacent nav
│   └── api/
│       ├── health/
│       │   └── route.ts          # GET /api/health → { status: 'ok' }
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts      # Re-exports NextAuth handlers
│       └── blog/
│           ├── posts/
│           │   ├── route.ts      # GET (list) + POST (create, admin)
│           │   └── [id]/
│           │       └── route.ts  # GET/PUT/DELETE single post (admin)
│           ├── tags/
│           │   └── route.ts      # GET distinct tags
│           └── upload/
│               └── route.ts      # POST image upload (admin, ≤5MB)
├── components/
│   ├── admin/
│   │   ├── AdminSidebar.tsx
│   │   ├── BlogEditor.tsx        # Markdown editor + autosave + preview
│   │   └── ImageUpload.tsx
│   ├── auth/
│   │   ├── SessionProvider.tsx   # Wraps next-auth/react SessionProvider
│   │   └── SignInButton.tsx      # Fixed top-right sign-in / user pill
│   ├── blog/
│   │   ├── BlogNav.tsx           # /blog header
│   │   ├── BlogPagination.tsx
│   │   ├── BlogPostCard.tsx
│   │   ├── BlogSearch.tsx
│   │   ├── BlogTagBadge.tsx
│   │   ├── MarkdownRenderer.tsx  # react-markdown + rehype/remark plugins
│   │   ├── ShareButtons.tsx
│   │   └── TableOfContents.tsx
│   ├── layout/
│   │   ├── Footer.tsx
│   │   ├── Header.tsx            # Multi-phase intro animation (loading→letters→fall→reveal→done)
│   │   ├── MobileMenu.tsx
│   │   └── Navigation.tsx        # Sticky left-edge icon nav (≥lg)
│   ├── providers/                # EMPTY — orphaned per CLAUDE.md/README.md
│   ├── sections/
│   │   ├── AboutSection.tsx
│   │   ├── BlogSection.tsx
│   │   ├── CertificationsSection.tsx
│   │   ├── ContactSection.tsx    # Formspree-backed
│   │   ├── EducationSection.tsx
│   │   ├── ExperienceSection.tsx
│   │   └── SkillsSection.tsx
│   └── ui/
│       ├── AboutCard.tsx
│       ├── AnimatedText.tsx
│       ├── CertificationItem.tsx
│       ├── ClearIntro.tsx        # Disposes intro loader on non-home routes
│       ├── CopyButton.tsx
│       ├── CustomCursor.tsx      # Loaded with ssr:false from HomeClient
│       ├── GlobalBackground.tsx  # Three parallax color blobs
│       ├── KeyboardIndicator.tsx
│       ├── NavItem.tsx
│       ├── NoiseTexture.tsx
│       ├── PresenceStatus.tsx    # Polls api.lagden.dev for Discord/Spotify
│       ├── ScrollProgress.tsx
│       ├── ScrollToTopButton.tsx
│       ├── Section.tsx           # Shared section wrapper (parallax + scatter bg)
│       ├── SkillCategory.tsx
│       ├── SkillsVisualization.tsx
│       ├── SocialIcon.tsx
│       ├── SpotifyDisplay.tsx
│       ├── TimelineItem.tsx
│       └── VSCodeDisplay.tsx
├── hooks/
│   ├── useAutoSave.ts            # localStorage draft autosave for editor
│   ├── useKeyboardNavigation.ts  # ↑/↓ + 1-9 to jump sections
│   ├── useParallax.ts            # framer-motion parallax for Section
│   └── useSectionObserver.ts     # IntersectionObserver active-section tracker
├── lib/
│   ├── auth.ts                   # NextAuth v5 config (GitHub + Mongo adapter + JWT)
│   ├── auth-helpers.ts           # getSession / isAdmin / requireAdmin
│   ├── blog.ts                   # Mongo CRUD for `posts` collection
│   ├── mongodb.ts                # Lazy MongoClient singleton
│   └── upload.ts                 # Writes uploads to public/uploads/
├── types/
│   ├── blog.ts                   # BlogPost / BlogPostSerialized / serializePost()
│   ├── content.ts                # ContentData mirroring public/content.json
│   ├── next-auth.d.ts            # Augments Session/JWT with githubUsername+isAdmin
│   └── presence.ts               # Discord watcher API response shapes
└── utils/
    ├── animationUtils.ts         # Reusable framer-motion variants
    ├── contentLoader.ts          # Client fetch('/content.json') — ORPHAN, no callers
    ├── presenceService.ts        # Calls api.lagden.dev/v1/watcher/{id}
    ├── scrollUtils.ts            # scrollIntoView with reduced-motion respect
    ├── serverContentLoader.ts    # fs.readFile public/content.json (server-only)
    └── viewTransition.ts         # Wrapper for document.startViewTransition
```

## Directory Purposes

**`src/app/`:**
- Purpose: Next.js App Router routing and SSR/RSC entry points.
- Contains: Server `page.tsx`/`layout.tsx`, route handlers (`route.ts`), client islands (`*Client.tsx`), SEO files (`sitemap.ts`, `robots.ts`).
- Key files: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/HomeClient.tsx`, `src/app/sitemap.ts`.

**`src/app/api/`:**
- Purpose: REST API endpoints (Next.js Route Handlers).
- Contains: Health check, NextAuth catch-all, blog CRUD + tags + upload.
- Key files: `src/app/api/blog/posts/route.ts`, `src/app/api/blog/upload/route.ts`, `src/app/api/auth/[...nextauth]/route.ts`.

**`src/app/admin/` & `src/app/blog/`:**
- Purpose: Feature route groups with their own `layout.tsx` shell.
- Contains: Admin and blog UIs. Both reuse `ClearIntro` to dispose of the home-route intro loader on cross-tree navigation.

**`src/components/`:**
- Purpose: Presentational + interactive React components, grouped by role.
- Subdirectories:
  - `admin/` — admin-only UI (sidebar, editor, image upload).
  - `auth/` — NextAuth client integration.
  - `blog/` — blog list/detail UI primitives.
  - `layout/` — page chrome shared across the home tree.
  - `providers/` — **EMPTY directory** (documented but contains no files).
  - `sections/` — one component per CV section, all wrap `<Section>`.
  - `ui/` — reusable primitives (buttons, badges, cards, scroll progress, presence display).

**`src/hooks/`:**
- Purpose: Encapsulated client-only behaviors.
- Key files: `useSectionObserver.ts`, `useKeyboardNavigation.ts`, `useParallax.ts`, `useAutoSave.ts`.

**`src/lib/`:**
- Purpose: Server-only data integrations. Anything touching MongoDB, secrets, or filesystem belongs here.
- Key files: `mongodb.ts` (singleton client), `blog.ts` (CRUD + indexes), `auth.ts` (NextAuth config), `auth-helpers.ts`, `upload.ts`.
- Constraint: Never imported from `"use client"` modules.

**`src/types/`:**
- Purpose: Shared TypeScript types.
- Key files: `content.ts` (CV schema), `blog.ts` (DB + serialized + input types), `presence.ts`, `next-auth.d.ts` (session augmentation).

**`src/utils/`:**
- Purpose: Pure helpers usable by either side of the boundary, plus thin browser-only wrappers.
- Key files: `serverContentLoader.ts`, `scrollUtils.ts`, `viewTransition.ts`, `animationUtils.ts`, `presenceService.ts`.
- Note: `contentLoader.ts` is an unused client-side wrapper — see `CONCERNS.md`.

**`public/`:**
- Purpose: Static assets served at site root.
- Key files: `content.json` (CV source of truth), social/og images, `site.webmanifest`.
- Special: `public/uploads/` is **runtime-written** by `/api/blog/upload`. Files written here are not committed (see `.gitignore`) and will not survive a stateless redeploy in standalone Docker mode.

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx` — root HTML, fonts, providers.
- `src/app/page.tsx` — home server entry.
- `src/app/HomeClient.tsx` — home interactive island.
- `src/app/blog/layout.tsx`, `src/app/admin/layout.tsx` — feature shells.

**Configuration:**
- `next.config.ts` — `output: 'standalone'`, image remote patterns.
- `tsconfig.json` — `@/* → src/*` path alias, `strict: true`.
- `eslint.config.mjs` — flat config.
- `postcss.config.mjs` — Tailwind v4 plugin.
- `Dockerfile` — multi-stage build for Coolify deploy.

**Core Logic:**
- `src/lib/blog.ts` — blog persistence + queries.
- `src/lib/auth.ts` — NextAuth setup + admin check.
- `src/lib/mongodb.ts` — Mongo singleton.
- `src/utils/serverContentLoader.ts` — CV data load.

**Routing:**
- `src/app/api/blog/posts/route.ts` (+ `[id]/route.ts`) — blog REST.
- `src/app/api/blog/upload/route.ts` — image upload.
- `src/app/api/auth/[...nextauth]/route.ts` — auth handlers.

**Content / Data:**
- `public/content.json` — CV content source of truth.
- `src/types/content.ts` — `ContentData` schema.
- `src/types/blog.ts` — `BlogPost` / `BlogPostSerialized` + `serializePost`.

**SEO:**
- `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/blog/feed.xml/route.ts`.
- Structured data: inline JSON-LD in `src/app/HomeClient.tsx:266-270`.

**Testing:**
- None. There are no `*.test.*`, `*.spec.*`, `__tests__/`, `vitest.config.*`, or `jest.config.*` files.

## Naming Conventions

**Files:**
- React components: `PascalCase.tsx` (e.g. `HomeClient.tsx`, `BlogPostCard.tsx`).
- Hooks: `useXxx.ts` (camelCase, `use`-prefixed).
- Utilities/libs: `camelCase.ts` (e.g. `serverContentLoader.ts`, `auth-helpers.ts` — note the lone kebab-case exception).
- Type modules: `camelCase.ts` (e.g. `content.ts`, `blog.ts`, `presence.ts`); ambient declarations: `*.d.ts` (`next-auth.d.ts`).
- Next.js conventions: `page.tsx`, `layout.tsx`, `route.ts`, `not-found.tsx`, `sitemap.ts`, `robots.ts` (lowercase, framework-mandated).
- Client islands paired with server pages: `XxxClient.tsx` (e.g. `HomeClient.tsx`, `BlogListClient.tsx`, `BlogPostClient.tsx`, `AdminBlogClient.tsx`).

**Directories:**
- All lowercase, single-word. Multi-word would be kebab-case but no examples currently.
- Dynamic Next.js segments: `[slug]`, `[id]`, `[...nextauth]`.

**Components:**
- CV sections always end in `Section` (e.g. `AboutSection`, `ExperienceSection`, `BlogSection`).
- Shared primitives live in `components/ui/` and are role-specific (e.g. `Section.tsx` is the wrapper, not a primitive).

**Routes vs IDs:**
- Section IDs (`about`, `experience`, …) are sourced from `content.navigation` in `public/content.json` and used both as DOM IDs (`<section id="about">`) and as nav targets in `useKeyboardNavigation`.

## Where to Add New Code

**New CV section (e.g. "Projects"):**
1. Add the field + nav entry to `public/content.json`.
2. Extend the `ContentData` interface in `src/types/content.ts`.
3. Create `src/components/sections/ProjectsSection.tsx` using `forwardRef<HTMLElement>` and wrapping `<Section>` from `src/components/ui/Section.tsx`.
4. Wire it in `src/app/HomeClient.tsx`: import, add a `ref`, register it in the `useSectionObserver` map, render inside `<Suspense>` in `<main>`.
5. Add the icon mapping in `src/components/layout/Navigation.tsx` and `src/components/layout/MobileMenu.tsx` `iconMap`.

**New blog feature:**
- Server data ops → `src/lib/blog.ts`.
- API → `src/app/api/blog/<feature>/route.ts` (call `auth()` and check `session.user.isAdmin` for write paths).
- UI → `src/components/blog/` for shared widgets, `src/app/blog/...` or `src/app/admin/blog/...` for routes.

**New API route:**
- `src/app/api/<feature>/route.ts`.
- Use `requireAdmin()` from `src/lib/auth-helpers.ts` for admin-gated routes, or inline `auth()` checks for finer control (see existing pattern).
- Use `NextResponse.json` for JSON responses; raw `Response` for non-JSON (RSS, plain text).

**New client hook:** `src/hooks/useXxx.ts`. Always include `"use client"` and use `useSyncExternalStore` if reading media queries / `window` properties to avoid hydration mismatch (existing pattern).

**New type:** `src/types/<domain>.ts`. Augmenting third-party types (e.g. NextAuth) goes in a `*.d.ts` file.

**New utility:**
- Pure / shared → `src/utils/<name>.ts`.
- Server-only with secrets/db/fs → `src/lib/<name>.ts` (NOT `src/utils/`).
- Client-only with browser APIs → `src/utils/<name>.ts` and ensure callers are `"use client"`.

**New static asset:** `public/<filename>`. Reference as `/<filename>` from components.

**New CV content:** Modify `public/content.json` — never hardcode in components. If adding a new field, update `src/types/content.ts` first so the change is type-checked everywhere.

**New page route:** `src/app/<route>/page.tsx` (server by default). Pair with `<Route>Client.tsx` if it needs interactivity, and add a `layout.tsx` if the route group needs shared chrome. Non-home routes must include `<ClearIntro />` (or equivalent) to dispose of the root-layout intro loader.

## Special Directories

**`src/components/providers/`:**
- Purpose: Documented as the home for context providers.
- Generated: No.
- Committed: Yes.
- Status: **EMPTY**. No files. The only provider in use (`SessionProvider`) lives at `src/components/auth/SessionProvider.tsx`.

**`public/uploads/`:**
- Purpose: Destination for `/api/blog/upload` writes.
- Generated: Yes (at runtime).
- Committed: No (excluded by `.gitignore`).
- Note: Persistence depends on a writable, persistent volume mounted at runtime. With `output: 'standalone'` and a stateless container, uploads are lost on redeploy.

**`.next/`:**
- Purpose: Next.js build output.
- Generated: Yes.
- Committed: No (`tsconfig.tsbuildinfo` is the only adjacent file checked in by Next).

**`.planning/`:**
- Purpose: GSD workflow artefacts (this document and siblings).
- Generated: By GSD commands.
- Committed: Conventionally yes.

---

*Structure analysis: 2026-05-06*
