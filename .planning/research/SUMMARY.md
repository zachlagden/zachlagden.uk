# Research Summary

**Date:** 2026-01-21
**Milestone:** v1.0 Portfolio Refresh
**Confidence:** HIGH (verified with official documentation and multiple authoritative sources)

## Executive Summary

This portfolio refresh extends an existing Next.js 15 App Router site with a full-featured blog system, projects showcase, and dark mode. The existing codebase follows solid patterns (Server Components by default, props-driven components, content from JSON) that should be preserved and extended. The recommended approach is to build infrastructure first (dark mode, auth, database), then layer features (blog, projects) on top.

The blog system uses MongoDB for storage, GitHub OAuth via Auth.js v5 for admin authentication, and Tiptap for rich text editing. Projects showcase can pull from GitHub API for automatic updates. Dark mode implementation uses next-themes with Tailwind CSS 4's CSS-based variant configuration. Testing infrastructure splits between Vitest for unit/integration tests and Playwright for E2E (required for async Server Components).

Key risks center on Auth.js v5 being in beta (pin versions carefully), MongoDB connection pooling in serverless (use the global singleton pattern), and content sanitization for XSS prevention (use react-markdown or DOMPurify from day one). The architecture research shows clear dependency ordering: dark mode affects all UI so comes first, auth/database are prerequisites for blog, and projects showcase can proceed independently.

## Key Recommendations

### Stack Additions

| Package | Version | Purpose |
|---------|---------|---------|
| `next-auth@beta` | v5 | GitHub OAuth for admin |
| `@auth/mongodb-adapter` | latest | Session storage in MongoDB |
| `mongodb` | ^6.x | Database driver |
| `@tiptap/react` | ^3.x | Rich text editor |
| `@tiptap/starter-kit` | ^3.x | Editor extensions bundle |
| `@octokit/rest` | ^22.x | GitHub API for projects |
| `next-themes` | ^0.4.x | Theme management |
| `vitest` | ^3.x | Unit/integration testing |
| `@playwright/test` | ^1.50.x | E2E testing |
| `@testing-library/react` | latest | Component testing |

**Install commands:**
```bash
# Core features
pnpm add next-auth@beta @auth/mongodb-adapter mongodb
pnpm add @tiptap/react @tiptap/pm @tiptap/starter-kit
pnpm add @octokit/rest next-themes

# Testing (dev)
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom vite-tsconfig-paths @playwright/test
```

### Feature Table Stakes

**Blog (must have):**
- Post listing page with title, date, excerpt
- Individual post pages with proper typography
- Estimated reading time (~200-250 words/minute)
- Code syntax highlighting (Tiptap extension)
- SEO metadata per post (Next.js metadata API)
- 1-3 categories/tags

**Projects Showcase (must have):**
- Project listing with thumbnails
- Live demo + source code links
- Technology stack badges
- Featured projects (2-4) on homepage

**Dark Mode (must have):**
- Toggle in header
- System preference detection
- localStorage persistence
- No flash on load (critical UX)
- Proper contrast (dark gray #121212, not pure black)

**Defer to v2:**
- Table of contents auto-generation
- Dynamic OG images
- RSS feed
- Search functionality
- Comment system (add later if needed)
- Newsletter signup

### Architecture Highlights

The existing architecture uses a parallel route pattern that should be extended:

```
RootLayout (Server)
  |-- ThemeProvider (NEW)
  |-- SessionProvider (NEW)
  |-- SmoothScrollProvider (existing)
        |-- / (Home - existing)
        |-- /blog (NEW route tree)
        |     |-- /blog/[slug]
        |     |-- /blog/new (auth required)
        |     |-- /blog/[slug]/edit (auth required)
        |-- /projects (NEW route tree)
        |-- /api/auth/[...nextauth] (NEW)
        |-- /api/blog/* (NEW)
```

**Key integration points:**
- `layout.tsx` wraps with ThemeProvider and SessionProvider
- `globals.css` adds CSS variables for theming
- Header gets ThemeToggle and Blog/Projects links
- Existing content.json pattern can extend for projects (or use GitHub API)

**Data flow:**
- Blog: MongoDB -> API Routes -> Server Components -> Props to Client Components
- Projects: GitHub API -> Server Components -> Props to Client Components
- Auth: GitHub OAuth -> Auth.js -> MongoDB Adapter -> Session in Server/Client

### Watch Out For

1. **MongoDB Connection Pool Exhaustion** (Critical)
   - Use global singleton pattern for connections
   - Never close connection after each query
   - Pattern: `global._mongoClientPromise`

2. **Auth.js v5 Breaking Changes** (High)
   - Pin to specific beta version (e.g., `5.0.0-beta.25`)
   - Monitor Auth.js releases before updates
   - Create separate GitHub OAuth apps per environment

3. **Flash of Wrong Theme (FOUC)** (High)
   - Use next-themes with `suppressHydrationWarning` on `<html>`
   - Implement "mounted" pattern for theme toggle UI

4. **Tailwind 4 Dark Mode Config** (High)
   - Use CSS-based config: `@custom-variant dark (&:is(.dark *))`
   - NOT tailwind.config.js darkMode option (doesn't exist in v4)

5. **XSS in Blog Content** (Critical)
   - Store as Tiptap JSON, not raw HTML
   - Render with react-markdown or sanitize with DOMPurify
   - Sanitize from day one, not as an afterthought

6. **Tiptap SSR Hydration Errors** (Medium)
   - Set `immediatelyRender: false` in useEditor
   - Use `next/dynamic` with `ssr: false` for editor component

7. **Async Server Components Not Testable with Vitest** (Medium)
   - Use Playwright for async Server Component testing
   - Reserve Vitest for Client Components and utils

## Implementation Order

Based on dependency analysis and risk mitigation:

### Phase 1: Theme Infrastructure
**Rationale:** Affects all UI, isolated change, no external dependencies. Implement before adding new pages so everything gets dark mode from the start.

**Delivers:**
- ThemeProvider wrapping app
- CSS variables for light/dark themes
- ThemeToggle component in Header
- No flash on page load

**Stack:** next-themes
**Avoids:** FOUC, Tailwind 4 dark mode misconfiguration

### Phase 2: Testing Infrastructure
**Rationale:** Establish testing patterns before building complex features. Easier to write tests as you build than retrofit.

**Delivers:**
- Vitest configuration with jsdom
- Playwright setup for E2E
- Example tests for existing components
- CI/test script setup

**Stack:** vitest, @playwright/test, @testing-library/react
**Note:** Can run parallel with Phase 1

### Phase 3: Database + Auth Foundation
**Rationale:** Required before blog can store/retrieve data. Highest integration risk, validate early.

**Delivers:**
- MongoDB connection singleton
- Auth.js configuration with GitHub OAuth
- Protected route middleware
- SessionProvider wrapper

**Stack:** mongodb, next-auth@beta, @auth/mongodb-adapter
**Avoids:** Connection pool exhaustion, missing AUTH_SECRET

### Phase 4: Blog Core
**Rationale:** Uses infrastructure from Phase 3. Core feature that differentiates the portfolio.

**Delivers:**
- Blog listing page (/blog)
- Individual post pages (/blog/[slug])
- BlogCard, BlogContent components
- API routes for CRUD
- SEO metadata per post

**Stack:** Uses Phase 3 infrastructure
**Avoids:** XSS via content rendering

### Phase 5: Blog Admin
**Rationale:** Extends Phase 4 with auth-protected mutations. Requires working auth from Phase 3.

**Delivers:**
- Tiptap editor integration
- Create/edit post pages (protected)
- Admin UI in header when logged in
- Post management interface

**Stack:** @tiptap/react, @tiptap/starter-kit
**Avoids:** Editor bundle bloat (lazy load), SSR hydration errors

### Phase 6: Projects Showcase
**Rationale:** Independent of blog, can technically start after Phase 1. Simpler than blog.

**Delivers:**
- Projects listing page (/projects)
- ProjectCard, ProjectGrid components
- GitHub API integration (or content.json extension)
- Technology badges and filters

**Stack:** @octokit/rest
**Note:** Can run parallel with Phases 4-5

### Phase 7: Polish + Integration
**Rationale:** Refinement after all routes exist.

**Delivers:**
- Navigation unification across pages
- Consistent breadcrumbs
- Animation consistency
- Performance optimization
- Bundle size audit

**Avoids:** Breaking existing smooth scroll/animations

## Research Flags

**Needs deeper research during planning:**
- Phase 3 (Auth): Auth.js v5 is beta, may need to check for updates/breaking changes
- Phase 5 (Blog Admin): Tiptap extension selection for code blocks, images

**Standard patterns (skip research-phase):**
- Phase 1 (Dark Mode): Well-documented with multiple verified sources
- Phase 2 (Testing): Official Next.js documentation covers this thoroughly
- Phase 6 (Projects): GitHub API is stable, well-documented

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All packages verified with official docs, versions current |
| Features | HIGH | Multiple portfolio best-practice sources cross-referenced |
| Architecture | HIGH | Follows existing codebase patterns, official Next.js guidance |
| Pitfalls | HIGH | Documented in official docs and community sources |

**Overall confidence:** HIGH

### Gaps to Address

1. **Auth.js v5 API stability** - Pin versions, check for updates before major deployment
2. **Tiptap extension selection** - Decide during Phase 5 planning which extensions needed (code-block-lowlight, image, link)
3. **Projects data source** - Decide between GitHub API (recommended) vs extending content.json
4. **Admin allow-list** - Decide if single-admin (just zachlagden) or multi-admin pattern

## Open Questions

1. **Projects source preference:** GitHub API provides automatic updates but requires token. content.json is simpler but manual. Recommendation: GitHub API with static fallback.

2. **Comment system scope:** Research flagged comments as potential anti-feature (maintenance burden). Defer to v2? Or include minimal implementation in v1?

3. **Multi-environment OAuth:** Need separate GitHub OAuth apps for local/staging/production. Create these during Phase 3 planning.

## Sources

### Primary (HIGH confidence)
- [Auth.js Installation Guide](https://authjs.dev/getting-started/installation)
- [Auth.js MongoDB Adapter](https://authjs.dev/getting-started/adapters/mongodb)
- [Next.js Vitest Guide](https://nextjs.org/docs/app/guides/testing/vitest)
- [Next.js Playwright Guide](https://nextjs.org/docs/pages/guides/testing/playwright)
- [Tiptap React Installation](https://tiptap.dev/docs/editor/getting-started/install/react)
- [Octokit REST.js v22](https://octokit.github.io/rest.js/v22/)
- [next-themes GitHub](https://github.com/pacocoursey/next-themes)
- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)

### Secondary (MEDIUM confidence)
- [Dark Mode with Tailwind v4 and Next.js](https://www.thingsaboutweb.dev/en/posts/dark-mode-with-tailwind-v4-nextjs)
- [Connecting MongoDB to Next.js 15](https://qasim.au/connecting-mongodb-to-a-nextjs-15-application)
- [Setting up Vitest for Next.js 15](https://www.wisp.blog/blog/setting-up-vitest-for-nextjs-15)

---
*Research completed: 2026-01-21*
*Ready for roadmap: yes*
