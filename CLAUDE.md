# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website for Zach Lagden built with Next.js, React, TypeScript, and Tailwind CSS. The site serves as a professional CV/resume showcasing skills, experience, education, and certifications.

## Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19.2, TypeScript 5
- **Styling**: Tailwind CSS 4, PostCSS
- **Animations**: Framer Motion, Split-Type
- **Forms**: Formspree
- **Analytics**: Google Analytics

## Common Commands

### Development

```bash
# Start the development server (uses Turbopack by default)
pnpm dev
```

### Building & Deployment

```bash
# Generate a production build
pnpm build

# Start the production server
pnpm start
```

### Code Quality

```bash
# Run ESLint (uses eslint CLI directly, not next lint)
pnpm lint

# Format code with Prettier
pnpm format
```

## Architecture Overview

The project follows a component-based architecture using Next.js App Router with dynamic content loading:

1. **App Structure**
   - `src/app`: Contains page components and layouts using Next.js App Router
   - Entry point is `src/app/page.tsx` with `src/app/layout.tsx` as the root layout
   - `src/app/HomeClient.tsx`: Main client-side component handling content loading and rendering

2. **Content Management**
   - `public/content.json`: Centralized content data file
   - `src/types/content.ts`: TypeScript interfaces for all content types
   - `src/utils/contentLoader.ts`: Client-side content loading utilities
   - `src/utils/serverContentLoader.ts`: Server-side content loading utilities

3. **Components Organization**
   - `src/components/layout`: Header, Footer, Navigation components (accept content props)
   - `src/components/sections`: Main content sections (About, Experience, Skills, etc.)
   - `src/components/ui`: Reusable UI components
   - `src/components/providers`: Context providers

4. **Custom Hooks**
   - `src/hooks/useKeyboardNavigation.ts`: Handles keyboard navigation for accessibility
   - `src/hooks/useSectionObserver.ts`: Tracks active sections during scrolling

5. **Utilities**
   - `src/utils/animationUtils.ts`: Animation-related utility functions
   - `src/utils/scrollUtils.ts`: Scroll handling utilities
   - `src/utils/viewTransition.ts`: Handles view transitions API with fallbacks

## Key Implementation Details

1. **Dynamic Content Loading**: Content is loaded from `public/content.json` on the client-side with TypeScript type safety.

2. **Component Props Pattern**: All components accept content as props rather than hardcoding data, enabling easy content updates.

3. **Smooth Scrolling**: Uses CSS-based smooth scrolling with fallbacks for reduced motion preferences.

4. **Animations**: Implements progressive enhancement with Framer Motion and text animations via Split-Type.

5. **Accessibility**: Includes keyboard navigation support, proper ARIA attributes, and respects user preferences for reduced motion.

6. **SEO**: Implements comprehensive metadata with OpenGraph tags, structured data, and proper sitemap generation using dynamic content.

## Development Approach

When modifying this codebase:

1. **Content Updates**: Modify `public/content.json` for content changes rather than editing components directly
2. **Type Safety**: Update `src/types/content.ts` when adding new content fields or structures
3. **Component Structure**: Maintain the component-based structure and separation of concerns
4. **Content Props**: Ensure components accept content as props and avoid hardcoding data
5. **Animations & Accessibility**: Follow existing patterns for animations, smooth scrolling, and accessibility
6. **Responsive Design**: Ensure UI components are responsive across all device sizes
7. **Testing**: Test thoroughly across different browsers and devices
8. **Progressive Enhancement**: Preserve accessibility features and progressive enhancement approach

<!-- GSD:project-start source:PROJECT.md -->
## Project

**zachlagden.uk**

A personal portfolio + blog site for Zach Lagden. Started as a static Next.js CV; mid-flight extension added a MongoDB-backed blog with admin UI (Auth.js v5 GitHub OAuth) and a cinematic intro animation. Currently in a half-finished state — runtime gaps, dead code, missing error boundaries, partially-removed Sentry — that needs to be stabilised before further feature work.

**Core Value:** The site renders correctly and stays up. A visitor on `/`, `/blog`, or `/blog/[slug]` should never see a blank page or a 500, regardless of MongoDB availability or transient runtime errors.

### Constraints

- **Tech stack**: Next.js 16 (App Router), React 19.2, TypeScript 5 strict, Tailwind 4, pnpm, Turbopack — locked. No framework migrations during stabilisation.
- **Deployment**: Coolify + Docker (no Vercel, no K8s, no separate CI/CD beyond GitHub Actions lint/prettier checks).
- **Component library**: Radix UI + shadcn/ui + Tailwind per global CLAUDE.md. No alternative libraries.
- **API style**: REST only, no GraphQL.
- **Observability**: None currently (Sentry removed). Reintroducing observability is out of scope for this milestone.
- **No tests**: Zero test framework in place; stabilisation work proceeds without test coverage but each fix verified by `tsc --noEmit` and `pnpm lint`.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript 5.9.3 (resolved; `^5.8.3` in `package.json`) — all application code under `src/`
- TSX (React JSX with TypeScript) — all components under `src/components/`
- CSS via Tailwind 4 — `src/app/globals.css`
- JSON — content/data layer at `public/content.json`
## Runtime
- Node.js 20 (Alpine) — pinned by `Dockerfile` (`FROM node:20-alpine`) and CI (`.github/workflows/lint.yml`, `prettier.yml` use `node-version: "20"`)
- No `.nvmrc` or `.node-version` file present in repo root
- pnpm — enforced via `corepack enable pnpm` in `Dockerfile`
- Lockfile: `pnpm-lock.yaml` (lockfileVersion 9.0) — present
- Workspace config: `pnpm-workspace.yaml` declares `onlyBuiltDependencies` for `@tailwindcss/oxide`, `sharp`, `unrs-resolver`
## Frameworks
- Next.js 16.1.6 (`next`) — App Router, `output: "standalone"` (`next.config.ts`)
- React 19.2.4 (`react`, `react-dom`) — strictly resolved
- `@next/third-parties` 16.1.6 — provides `<GoogleAnalytics>` component used in `src/app/layout.tsx`
- Not detected. No `jest.config.*`, `vitest.config.*`, or `playwright.config.ts` in working tree (a `playwright.config.ts` was referenced in commit `2db2476` redesign but is not present now). No `*.test.*` or `*.spec.*` files under `src/`.
- Turbopack — Next.js 16 default for `next dev` (no explicit flag in `package.json` scripts)
- TypeScript 5.9.3 (resolved; `^5.8.3` declared) — config at `tsconfig.json`, target ES2017, `moduleResolution: "bundler"`, `paths: { "@/*": ["./src/*"] }`
- Tailwind CSS 4.1.18 — PostCSS plugin model (`postcss.config.mjs` registers `@tailwindcss/postcss`)
- ESLint 9.39.2 (resolved; `^9.29.0` declared) — flat config at `eslint.config.mjs` extending `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Prettier 3.8.1 (resolved; `^3.5.3` declared) — runtime dependency (note: it's listed under `dependencies`, not `devDependencies`); no `.prettierrc` config file (defaults only)
## Key Dependencies
- `next` 16.1.6 — App Router framework
- `react` ^19.2.4 / `react-dom` ^19.2.4
- `framer-motion` 12.34.0 (`^12.23.26` declared) — animations across every section/UI component
- `lucide-react` 0.561.0 — icon set used pervasively (Github, Linkedin, Mail, etc.)
- `mongodb` 7.1.0 — direct driver for blog posts (`src/lib/mongodb.ts`, `src/lib/blog.ts`)
- `next-auth` 5.0.0-beta.30 — auth (`src/lib/auth.ts`); pinned exact version
- `@auth/mongodb-adapter` 3.11.1 — Auth.js MongoDB session/account persistence
- `@formspree/react` 3.0.0 — contact form handling (`src/components/sections/ContactSection.tsx`)
- `@next/third-parties` 16.1.6 — Google Analytics wrapper
- `react-markdown` 10.1.0 — used by `src/components/blog/MarkdownRenderer.tsx`
- `remark-gfm` 4.0.1 — GitHub-flavored markdown (tables, strikethrough, etc.)
- `rehype-raw` 7.0.0 — allow raw HTML in markdown
- `rehype-sanitize` 6.0.0 — sanitize raw HTML
- `rehype-highlight` 7.0.2 — code block syntax highlighting
- `reading-time` 1.5.0 — reading time estimation in `src/lib/blog.ts`
- `split-type` 0.3.4 — text split animations (still in deps; usage in modified `src/components/ui/AnimatedText.tsx` — verify wiring)
- `prettier` 3.8.1 — listed under `dependencies` rather than `devDependencies` (likely a mistake)
- `@tailwindcss/postcss` 4.1.18 — Tailwind v4 PostCSS plugin
- `tailwindcss` 4.1.18
- `@types/node` 24.10.13, `@types/react` 19.2.14, `@types/react-dom` 19.2.3
- `eslint` 9.39.2, `eslint-config-next` 16.1.6
- `@sentry/nextjs` — fully removed from `package.json`; runtime config files also deleted. Project has no observability layer.
- Lenis (smooth scrolling) — removed in commit `c449439` ("refactor: remove Lenis smooth scrolling in favor of native CSS"); zero refs in current src.
- Playwright, seed scripts, MongoDB content collections — referenced in commit `2db2476` redesign that never landed cleanly; none present now.
## Configuration
- `.env.example` declares required vars: `MONGODB_URI`, `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `ADMIN_GITHUB_USERNAME`
- `.env.example` declares optional vars: `NEXT_PUBLIC_GA_ID` (note: not actually consumed — Google Analytics ID is read from `public/content.json` `metadata.googleAnalyticsId`, not env), `NEXT_PUBLIC_DISCORD_USER_ID`
- `.env` file present in working tree (gitignored; do not read)
- `next.config.ts` — `output: "standalone"`, single remote image pattern for `avatars.githubusercontent.com`
- `tsconfig.json` — strict mode on, `paths: { "@/*": ["./src/*"] }`, `jsx: "react-jsx"`
- `eslint.config.mjs` — flat config, ignores `.next/**`, `out/**`, `build/**`, `next-env.d.ts`
- `postcss.config.mjs` — single plugin: `@tailwindcss/postcss`
- `Dockerfile` — multi-stage (deps → builder → runner), Node 20 Alpine, Coolify-targeted, exposes port 3000, `HEALTHCHECK` against `/api/health`, declares `VOLUME ["/app/public/uploads"]` for blog image persistence
- `.dockerignore` — excludes `node_modules`, `.next`, `.env*`, `*.md`, `.github`, etc.
- `public/content.json` — primary content source (CV data, social links, GA ID, Formspree ID, site URL)
- `public/site.webmanifest` — PWA manifest
- `public/uploads/` — runtime-mounted volume for uploaded blog images
## Platform Requirements
- Node.js 20.x
- pnpm (latest, via Corepack)
- Local MongoDB (or Atlas connection string in `MONGODB_URI`) for blog/auth features
- GitHub OAuth App credentials for admin sign-in
- Docker via Coolify (per `CLAUDE.md` and commit `231122c` "feat: add Coolify Dockerfile deployment setup")
- Standalone Next.js server: `node .next/standalone/server.js` (or `node server.js` from runner stage)
- Persistent volume for `/app/public/uploads`
- MongoDB instance reachable via `MONGODB_URI`
- GitHub Actions: `.github/workflows/lint.yml` (ESLint) and `.github/workflows/prettier.yml` (`prettier --check`) — both run on push/PR to `main` with pnpm cache
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Tooling Configuration
- Composes Next.js Core Web Vitals + TypeScript rule sets
- No project-specific overrides
- Run with `pnpm lint` (which calls `eslint .`, not `next lint`)
- Prettier 3.5.3 listed in `dependencies` (not `devDependencies` — minor inconsistency)
- **No Prettier config file** (`.prettierrc`, `prettier.config.*`, `.prettierignore`) exists
- Uses Prettier defaults: double quotes, 2-space indent, semicolons, 80-char width, trailing commas (`all`)
- Run with `pnpm format` / `pnpm format:check`
- **Strict mode enabled** — `strict: true`
- `allowJs: true` (JS files allowed but none currently in `src/`)
- Path alias `@/*` → `./src/*` (used everywhere)
- No `noUncheckedIndexedAccess`, no `exactOptionalPropertyTypes`
## Naming Patterns
- React components: PascalCase `.tsx` — `Header.tsx`, `BlogPostCard.tsx`, `AnimatedText.tsx`
- Hooks: camelCase `.ts` with `use` prefix — `useKeyboardNavigation.ts`, `useSectionObserver.ts`, `useAutoSave.ts`, `useParallax.ts`
- Utilities: camelCase `.ts` — `contentLoader.ts`, `scrollUtils.ts`, `animationUtils.ts`, `presenceService.ts`, `viewTransition.ts`
- Lib/services: camelCase `.ts` — `auth.ts`, `auth-helpers.ts`, `blog.ts`, `mongodb.ts`, `upload.ts` (note: `auth-helpers.ts` uses kebab-case — only file in repo with this style)
- Type modules: camelCase `.ts` — `content.ts`, `blog.ts`, `presence.ts`; ambient declarations use `.d.ts` (`next-auth.d.ts`)
- Next.js conventions: lowercase `page.tsx`, `layout.tsx`, `route.ts`, `not-found.tsx`, `sitemap.ts`, `robots.ts`
- camelCase — `loadContent`, `formatDateRange`, `scrollToSection`, `parseSpotifyData`, `slugify`, `getPublishedPosts`
- React components: PascalCase — `Header`, `BlogEditor`, `MobileMenu`
- Hooks: `use` prefix camelCase — `useKeyboardNavigation`, `useAutoSave`
- camelCase for locals/state — `activeSection`, `mobileMenuOpen`, `prefersReducedMotion`, `introComplete`
- SCREAMING_SNAKE_CASE for module-level constants — `INTRO_WIDTH_RATIO`, `SCATTER_INTERVAL`, `SCATTER_SIZES`, `CHAR_INITIAL_DELAY`, `CHAR_STAGGER`, `PRESENCE_API_BASE`, `UPLOAD_DIR` (`src/components/layout/Header.tsx`, `src/components/ui/Section.tsx`, `src/utils/presenceService.ts`, `src/lib/upload.ts`)
- Refs follow pattern `<name>Ref` — `aboutRef`, `experienceRef`, `mainContentRef`, `h1Ref`, `abortControllerRef`, `intervalRef`
- PascalCase, prefer `interface` over `type` for object shapes — `ContentData`, `Personal`, `BlogPost`, `BlogPostInput`, `HomeClientProps`, `IntroPhase`
- Component prop interfaces named `<Component>Props` — `HeaderProps`, `AboutSectionProps`, `BlogEditorProps`, `SocialIconProps`
- Union literal types use `type` — `type IntroPhase = "loading" | "letters" | "fall" | "reveal" | "done";` (`src/components/layout/Header.tsx:18`)
- Lowercase kebab-case Tailwind utilities exclusively
- Custom utility classes: kebab-case — `font-heading`, `font-mono-accent`, `intro-locked`, `loader-fade-out`, `markdown-content`, `section-content` (defined in `src/app/globals.css`)
## Code Style
- 2-space indent (Prettier default)
- Double quotes for strings — enforced by Prettier default
- Semicolons required — Prettier default
- Trailing commas everywhere (multi-line arrays, function args)
- Template literals for interpolated strings — `` `${prefix}${selected}${suffix}` ``
- ES module syntax — `import`/`export`, no `require`
- `import React from "react"` typically used in `.tsx` files even though new JSX transform doesn't require it
- React hook imports destructured — `import React, { useState, useEffect, useCallback, useRef } from "react";`
- Type-only imports: bare `import type` used sparingly — only in `src/app/layout.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/next.config.ts`. Most files import types alongside values without `import type`.
- `const` is the default everywhere; `let` only used when reassignment is genuinely needed (e.g., `let blogPosts` in `src/app/page.tsx:9`, `let nextIndex` in `src/hooks/useKeyboardNavigation.ts:44`)
- No `var` anywhere except the global declaration in `src/lib/mongodb.ts:8` (`var _mongoClientPromise: Promise<MongoClient> | undefined;` — required for `globalThis` typing)
## Import Organization
- Always prefer `@/...` for `src/`-rooted imports — `import Section from "@/components/ui/Section"`
- Relative imports (`../`) only used for sibling/parent components within the same domain — `src/components/sections/AboutSection.tsx:6` uses `import Section from "../ui/Section";`
- **Inconsistency:** `src/components/sections/AboutSection.tsx` uses relative `../ui/Section` while `src/components/ui/Section.tsx` uses `@/utils/animationUtils` — two different conventions appear in the same import graph
## TypeScript Usage
- All component props are typed via `interface FooProps { ... }`
- `forwardRef` always typed: `React.forwardRef<HTMLElement, AboutSectionProps>` (`src/components/sections/AboutSection.tsx:16`)
- Refs typed explicitly: `useRef<HTMLElement>(null) as React.RefObject<HTMLElement>` — the cast is repeated all over `src/app/HomeClient.tsx:134-149` (refs assertion is a code smell — see CONCERNS.md)
- Explicit return types are uncommon — most functions rely on TS inference. Exceptions: `formatDate(dateString: string): string` (`src/utils/contentLoader.ts:29`), `getScrollBehavior(): ScrollBehavior` (`src/utils/scrollUtils.ts:1`)
- `unknown` used over `any` where typing is hard — `Record<string, unknown>` in `src/lib/blog.ts:33` and `src/lib/blog.ts:99`
- Single `@ts-expect-error` exists at `src/components/ui/AnimatedText.tsx:94` for SplitType global script
- Type assertions via `as`: used liberally — `(profile as { login?: string })` (`src/lib/auth.ts:28`), `as unknown as BlogPost` (`src/lib/blog.ts:88`), `as React.MutableRefObject<HTMLElement | null>` (`src/components/ui/Section.tsx:75`)
- `null`/`undefined` distinction observed: optional fields use `?: string | null` for fields that may be explicitly null in JSON content (`src/types/content.ts:63`)
- Domain types live in `src/types/` — `content.ts`, `blog.ts`, `presence.ts`
- Ambient module augmentation in `src/types/next-auth.d.ts`
- `src/types/blog.ts` co-locates the `serializePost(post: BlogPost): BlogPostSerialized` helper with the types — minor convention break (mixes pure types with runtime code)
## Error Handling
- API routes do **not** wrap handlers in `try/catch` — uncaught errors yield default 500s without structured error responses
- No central error logger — every error goes through `console.error` / `console.warn`. Sentry is the user's stated default but **not installed** (no `@sentry/*` packages in `package.json`)
- Mix of `throw error` (rethrow) vs silent swallow with no consistent rule
## Accessibility Patterns
- `aria-label` on every interactive icon-only control — `src/components/ui/SocialIcon.tsx:37`, `src/components/auth/SignInButton.tsx:39`, `src/components/layout/MobileMenu.tsx:55`
- `aria-hidden="true"` on decorative icons — `<Github className="w-5 h-5" aria-hidden="true" />` (`src/app/HomeClient.tsx:330`)
- `aria-expanded`, `aria-controls` on disclosure buttons — `src/components/layout/MobileMenu.tsx:56-57`
- `role="navigation"` + `aria-label` on landmark regions — `src/app/HomeClient.tsx:313`
- `role="list"` for repeated content — `src/components/sections/ExperienceSection.tsx:27`
- Arrow up/down moves between sections
- Number keys 1-9 jump directly to numbered sections
- Skips when `document.activeElement` is `HTMLInputElement` or `HTMLTextAreaElement` to avoid hijacking form controls
- `?` key toggles help dialog (`src/components/ui/KeyboardIndicator.tsx:53`)
- Visible help dialog enumerates all shortcuts with `<kbd>` elements
- Every interactive element has `focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2` — used 20+ times across components
- Keyboard-only skip link via `sr-only focus:not-sr-only` pattern
- Detected via `window.matchMedia("(prefers-reduced-motion: reduce)").matches`
- Subscribed to via `useSyncExternalStore` for SSR-safety in `useParallax`, `AnimatedText`, `KeyboardIndicator`, `Header`
- Conditionally branches all animation durations: `duration: prefersReducedMotion ? 0.1 : 0.4` (`src/app/HomeClient.tsx:323`)
- Drives binary skip behavior in `Header.tsx:60-66` — full intro animation entirely skipped if reduced motion is preferred
- CustomCursor returns `null` when reduced motion is preferred (`src/components/ui/CustomCursor.tsx:111`)
- CSS reinforces the same — `@media (prefers-reduced-motion: no-preference)` gates all keyframes/transitions in `src/app/globals.css:43`, `:77`, `:86`
## Component Prop Patterns
- Components receive their slice of `ContentData` as `content` — never import or fetch JSON themselves
- Pattern is consistent across all `src/components/sections/*` and `src/components/layout/*`
- Type comes from `src/types/content.ts` — sections take a domain type (`About`, `Experience[]`, `Skills`, etc.) not the full `ContentData`
- Booleans default to `false`: `featured = false`, `disableParallax = false`, `once = true`
- Optional callbacks default to no-op or are checked before invocation
- `displayName` is set on every `forwardRef` — required by ESLint `react/display-name`
- Children typed as `React.ReactNode`
- Discriminated unions rare — most variant props are simple string literals like `size?: "sm" | "md"`
## Animation Conventions
- `viewport.once: true` everywhere — animations fire only once on first scroll into view
- `viewport.margin` typically `-50px` to `-100px` to delay trigger
- String easings: `"easeOut"`, `"easeInOut"` (most common)
- Custom cubic-bezier: `[0.22, 1, 0.36, 1]` for the intro fall (`src/components/layout/Header.tsx:280`)
- Spring presets: `{ type: "spring", damping: 30 }` (`src/components/layout/MobileMenu.tsx:70`), `{ type: "spring", mass: 0.1, stiffness: 700, damping: 30 }` (`src/components/ui/CustomCursor.tsx:124`)
- SplitType is the `split-type` package listed in `dependencies`, but **the component loads it via external CDN script** (`https://unpkg.com/split-type@0.3.3/umd/index.min.js`) rather than importing it. The package version (`0.3.4`) doesn't even match the CDN URL (`0.3.3`). See CONCERNS.md.
- Splits text into characters via `new window.SplitType(textRef.current, { types: "words,chars", tagName: "span" })`
- Manually animates each char via `setTimeout` + inline styles — does not use Framer Motion for this
- Component is currently **not used anywhere** in the codebase — `grep` shows zero importers
- State machine via `IntroPhase` union type: `"loading" | "letters" | "fall" | "reveal" | "done"`
- Each phase transitions via `setTimeout` in dedicated `useEffect`s
- Body class `intro-locked` is set globally and removed when intro completes — page scroll is locked during intro
- `document.fonts.ready` is awaited before measuring text width to avoid layout shift
## Logging
- No logging framework — `console.error`, `console.warn` directly
- Used in 7 files (`grep` count): `src/components/ui/PresenceStatus.tsx:68`, `src/components/ui/CopyButton.tsx:29`, `src/components/ui/AnimatedText.tsx` (3x), `src/utils/contentLoader.ts:20`, `src/utils/viewTransition.ts:55`
- No `console.log` in production code (good)
- No `console.debug` or structured logging
- Sentry is **not configured** despite being the global standard — `package.json` has no `@sentry/*` deps and the previously-tracked `instrumentation-client.ts`, `sentry.edge.config.ts`, `sentry.server.config.ts` are deleted (per `git status`)
## Comments
- Sparse — most files have zero comments
- When present, JSDoc-style block comments document utility purpose:
- Inline comments explain non-obvious logic — e.g., `src/components/ui/Section.tsx:98`:
- Section-marker comments delimit groups within large files: `// State`, `// Refs for sections`, `// Components`, `// Hooks and Utils` (`src/app/HomeClient.tsx`)
- No TODO/FIXME/HACK/XXX comments present in `src/`
## Function Design
- Most utility functions are short (5-30 lines)
- Hooks bundle related state + effects together — `useSyncExternalStore` is the standard pattern for SSR-safe client-only detection
- React components frequently exceed the 300-line "small focused components" guidance from `~/.claude/instructions/tech-stack.md`:
- `useCallback` used aggressively — every callback passed to a hook or child component is memoized
- Side-effects in `useEffect` always cleanup — `clearTimeout`, `removeEventListener`, `observer.disconnect()`, `controller.abort()` patterns are consistent
## Module Design
- One default export per file (component or page)
- Named exports for utilities (`scrollToSection`, `formatDate`, `loadContent`)
- No barrel files (`index.ts` re-exports) anywhere
- `src/types/blog.ts` mixes types and runtime code (`serializePost` function) — anti-pattern in a `types/` directory
- API route files only export the HTTP method handlers (`GET`, `POST`, `PUT`, `DELETE`) — consistent with Next.js convention
## Server vs Client Boundary
- `"use client"` directive is the first line of every interactive component file (count: most components)
- Server-only modules: `src/utils/serverContentLoader.ts` (uses `fs/promises`), `src/lib/blog.ts`, `src/lib/auth.ts`, `src/lib/mongodb.ts`, `src/lib/upload.ts`
- Pattern: server `page.tsx` fetches data → passes to a `*Client.tsx` component (`src/app/page.tsx` → `HomeClient.tsx`, `src/app/blog/page.tsx` → `BlogListClient.tsx`)
- `dynamic()` with `ssr: false` only used for components that touch DOM-only APIs (`src/app/HomeClient.tsx:34` — `CustomCursor`)
## Inconsistencies Summary
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## System Overview
```text
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
- Server components do data fetching only (`loadContentServer`, `getLatestPosts`, `getPostBySlug`, `auth()`); they hand serialized props to a single `*Client` component that owns interactivity.
- Static CV/portfolio content is sourced from a JSON file in `public/`, not a CMS or database.
- Dynamic content (blog, sessions, uploads) lives in MongoDB; the `lib/` layer is the only module that touches the driver.
- Animation is concentrated: the home `Header` runs a bespoke multi-phase intro state machine; all other sections share the `Section` wrapper for entry animation, parallax, and section numbering.
- Accessibility is wired through `useKeyboardNavigation`, skip-to-content link, ARIA roles, and `prefers-reduced-motion` checks at every animated component (`useSyncExternalStore` is used to avoid hydration mismatches when reading the media query).
## Layers
- Purpose: Routing, RSC data loading, metadata, SEO routes.
- Location: `src/app/`
- Contains: Server `page.tsx` / `layout.tsx`, route handlers (`route.ts`), client islands suffixed `*Client.tsx`, generated SEO files (`sitemap.ts`, `robots.ts`, `not-found.tsx`).
- Depends on: `lib/` (data + auth), `utils/serverContentLoader`, `types/`, `components/`.
- Used by: Next.js runtime.
- Purpose: Presentational + interactive React components.
- Location: `src/components/{layout,sections,ui,blog,admin,auth,providers}/`
- Contains: Layout chrome (`Header`, `Footer`, `Navigation`, `MobileMenu`), CV sections (`*Section.tsx`), shared UI primitives, blog cards/editor, admin shell, NextAuth session wrapper.
- Depends on: `hooks/`, `utils/`, `types/`.
- Used by: App Router pages and client components.
- Purpose: Encapsulated client-only behaviors.
- Location: `src/hooks/`
- Contains: `useSectionObserver`, `useKeyboardNavigation`, `useParallax`, `useAutoSave` (admin editor draft persistence).
- Depends on: Browser APIs, framer-motion (`useParallax`).
- Used by: `HomeClient`, `Section`, `BlogEditor`.
- Purpose: Server-only data and auth integration.
- Location: `src/lib/`
- Contains: `mongodb.ts` (singleton), `blog.ts` (CRUD + indexes), `auth.ts` (NextAuth config), `auth-helpers.ts`, `upload.ts`.
- Depends on: `mongodb` driver, `next-auth`, Node `fs`/`crypto`.
- Used by: API routes, server pages.
- Constraint: Must never be imported from a `"use client"` module — would leak Mongo URI / break the bundle.
- Purpose: Pure helpers usable from either side of the boundary.
- Location: `src/utils/`
- Contains: `serverContentLoader` (server-only), `contentLoader` (client-only, **orphaned**), `scrollUtils`, `viewTransition`, `animationUtils` (variants), `presenceService` (browser fetch).
- Depends on: `types/`, browser/Node primitives.
- Used by: Components, hooks, app routes.
- Purpose: Shared TypeScript contracts.
- Location: `src/types/`
- Contains: `content.ts` (CV schema mirroring `public/content.json`), `blog.ts` (DB + serialized + input + `serializePost` helper), `presence.ts` (presence API response shapes), `next-auth.d.ts` (session/JWT augmentation).
- Depends on: `mongodb` (`ObjectId`), `next-auth`.
- Used by: Every other layer.
## Data Flow
### Primary Request Path — Home (`/`)
### Blog list (`/blog`)
### Blog post (`/blog/[slug]`)
### Admin write path
### Auth flow
### Presence (Discord/Spotify) flow
- Local `useState` per component; no Redux/Zustand/Context for app state.
- The only React Context in use is `SessionProvider` from `next-auth/react` (`src/components/auth/SessionProvider.tsx`).
- `useAutoSave` persists editor drafts in `localStorage` (`src/hooks/useAutoSave.ts`).
- Cross-section state (active section, mobile menu, intro completion) is owned by `HomeClient` and threaded down via props.
## Key Abstractions
- Purpose: Strongly-typed mirror of `public/content.json`.
- Examples: `src/types/content.ts:1-126`.
- Pattern: Every CV section component receives a slice of `ContentData` (`content.about`, `content.experience`, …) as a prop — the **content-as-props pattern** documented in `CLAUDE.md`. No section reads `content.json` directly.
- Purpose: Shared section chrome — animated header, parallax scatter background, section number badge, view-transition tags.
- Examples: `src/components/ui/Section.tsx`. Used by every `*Section.tsx` (`AboutSection`, `ExperienceSection`, …).
- Pattern: `forwardRef<HTMLElement>` so the parent can attach a section ref for `useSectionObserver`.
- Purpose: Convention for splitting an RSC page from its interactive island.
- Examples: `app/page.tsx` ↔ `app/HomeClient.tsx`, `app/blog/page.tsx` ↔ `app/blog/BlogListClient.tsx`, `app/blog/[slug]/page.tsx` ↔ `app/blog/[slug]/BlogPostClient.tsx`, `app/admin/blog/page.tsx` ↔ `app/admin/blog/AdminBlogClient.tsx`.
- Pattern: Server component fetches, serializes (Mongo `ObjectId`/`Date` → strings via `serializePost`), and passes plain JSON-safe props.
- Purpose: Cinematic page-load name reveal (recent commits `b4bfacb`, `38b2634`, `35c2ba7`).
- Phases: `"loading" → "letters" → "fall" → "reveal" → "done"` (`src/components/layout/Header.tsx:18`).
- Behavior:
- Bypass: If `prefersReducedMotion` is set, the intro skips straight to `done`. If `window.scrollY > 0` on mount (browser restored scroll), the intro is also skipped (`src/components/layout/Header.tsx:107-121`).
- `useSectionObserver` (`src/hooks/useSectionObserver.ts`) builds an `IntersectionObserver` with thresholds `[0, 0.1, …, 1.0]` and `rootMargin: -20% 0px -20% 0px`, picking the section with the highest intersection ratio as active.
- `useKeyboardNavigation` (`src/hooks/useKeyboardNavigation.ts`) binds `ArrowDown`/`ArrowUp` to step through sections and `1`–`9` to jump directly. Inputs/textareas are excluded.
- `scrollToSection` uses native `scrollIntoView({ block: 'start' })` with `scroll-margin-top` set in CSS for the sticky nav offset.
- `supportsViewTransitions()` feature-detects `document.startViewTransition` (`src/utils/viewTransition.ts:11`).
- `Section` writes `viewTransitionName: section-header-${id}` / `section-content-${id}` inline styles when supported (`src/components/ui/Section.tsx:184-208`).
- Global CSS in `src/app/globals.css:25-40` declares `view-transition-name` for `section`, `h2`, and `.section-content` inside an `@supports` guard.
- `scrollToSectionWithTransition` exists but is not wired in — `HomeClient` uses the plainer `scrollToSection` from `scrollUtils.ts`.
## Entry Points
- Location: `src/app/layout.tsx`
- Triggers: Every route.
- Responsibilities: Font variables (`Inter`, `Syne`, `JetBrains_Mono`), `<head>` preconnect/prefetch, `metadataBase` and OpenGraph/Twitter metadata derived from `content.json`, mounts `SessionProvider`, fixed `SignInButton`, Google Analytics via `@next/third-parties/google`, and the CSS `intro-locked` body class.
- Location: `src/app/page.tsx`
- Triggers: `GET /`.
- Responsibilities: Load CV content + latest blog posts, hand to `HomeClient`.
- Location: `src/app/HomeClient.tsx`
- Triggers: First hydration on `/`.
- Responsibilities: Section refs, intro state ownership, dynamic imports of every section, JSON-LD `Person` schema, sticky nav, mobile menu, scroll-to-top button, custom cursor (`ssr: false`), keyboard nav.
## Architectural Constraints
- **Threading:** Single Node.js event loop (Next.js standalone output, `node .next/standalone/server.js`). Mongo client is reused via a module-level `clientPromise` and a `globalThis._mongoClientPromise` singleton in dev (`src/lib/mongodb.ts:7-31`).
- **Global state:**
- **Server/client boundary:** `src/lib/*` and `src/utils/serverContentLoader.ts` MUST stay server-only (use Node `fs`, `mongodb`, secrets). `src/utils/contentLoader.ts` and `src/utils/presenceService.ts` MUST stay client-only (browser `fetch`, `process.env.NEXT_PUBLIC_*`).
- **Standalone build:** `next.config.ts` sets `output: 'standalone'`; production runs from `.next/standalone/server.js`. `public/uploads/` is written at runtime, which is **incompatible with a read-only / multi-replica deployment** — see `CONCERNS.md`.
- **Image domains:** Only `avatars.githubusercontent.com` is whitelisted in `next.config.ts:5-12`. Featured-image URLs uploaded via `/api/blog/upload` resolve to `/uploads/...` (same-origin) so they sidestep `next/image` remote validation, but external images in posts will not render through `next/image`.
- **Environment:** `MONGODB_URI`, `ADMIN_GITHUB_USERNAME`, `AUTH_SECRET` (NextAuth), `AUTH_GITHUB_ID`/`AUTH_GITHUB_SECRET`, and `NEXT_PUBLIC_DISCORD_USER_ID` are required for full functionality. The blog/auth code degrades gracefully when Mongo is missing (try/catch around `getLatestPosts` in `app/page.tsx`, `getAllPublishedSlugs` in `sitemap.ts`, and silent `getAdapter()` fallback).
## Anti-Patterns
### Orphaned client content loader
### Empty `providers/` directory
### Three places mutate `#initial-loader` / `intro-locked`
### Silent failure in `getAdapter()`
## Error Handling
- Server pages wrap Mongo calls in `try/catch` and substitute empty arrays (`src/app/page.tsx:10-15`, `src/app/sitemap.ts:9-14`).
- API route handlers return `NextResponse.json({ error: '...' }, { status: 4xx })` on auth/validation failure — see `requireAdmin` in `src/lib/auth-helpers.ts:13-19` and inline checks in `src/app/api/blog/posts/route.ts:24-27`.
- `viewTransition.ts:50-58` falls back to a regular DOM update if `startViewTransition` throws.
- `getAdapter()` swallows Mongo errors silently (see anti-pattern above).
- Note: `src/app/global-error.tsx` was deleted in the working tree (`git status`) — there is currently no app-level error boundary.
## Cross-Cutting Concerns
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
