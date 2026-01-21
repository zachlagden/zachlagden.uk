# Roadmap: zachlagden.uk v1.0

## Overview

This roadmap transforms the existing portfolio into a full-featured platform with blog, projects showcase, and modern UX improvements. The approach builds infrastructure first (dark mode, testing, auth, database), then layers features (blog core, admin, engagement, projects), and finishes with polish and performance optimization. Each phase delivers coherent, verifiable capability.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Dark Mode** - shadcn/ui foundation + theme toggle with persistence, system preference detection, no flash
- [ ] **Phase 2: Testing Infrastructure** - Vitest + Playwright setup, CI integration
- [ ] **Phase 3: Authentication** - GitHub OAuth with session persistence and admin detection
- [ ] **Phase 4: Blog Core** - Blog listing, post pages, categories, search, SEO
- [ ] **Phase 5: Blog Admin** - Rich editor, CRUD operations, drafts, publishing
- [ ] **Phase 6: Blog Engagement** - Comments, reactions, moderation, related posts
- [ ] **Phase 7: Projects Showcase** - Project cards, GitHub integration, technology filters
- [ ] **Phase 8: Polish & Performance** - Animations, Core Web Vitals, content refresh

## Phase Details

### Phase 1: Dark Mode
**Goal**: Users can switch between light and dark themes with a persistent, polished experience
**Depends on**: Nothing (first phase)
**Requirements**: THEME-01, THEME-02, THEME-03, THEME-04, THEME-05
**Success Criteria** (what must be TRUE):
  1. User can toggle between light and dark themes via a visible control (floating button, bottom-left)
  2. Theme preference persists across browser sessions (refreshing or returning later keeps the chosen theme)
  3. First-time visitors see the theme matching their system preference
  4. Page loads without any flash of the wrong theme (no FOUC)
  5. All existing UI elements (sections, cards, navigation) display correctly in both themes
**Foundation**: Radix UI + shadcn/ui installed and configured as first plan
**Plans**: 4 plans in 3 waves

Plans:
- [x] 01-01-PLAN.md - UI Foundation (shadcn/ui setup, next-themes, ThemeProvider, CSS variables)
- [x] 01-02-PLAN.md - Theme Toggle (iOS-style floating toggle with glass effect)
- [x] 01-03-PLAN.md - Dark Mode Styles (update all existing components with dark: variants)
- [ ] 01-04-PLAN.md - Gap Closure (fix missed components: VSCodeDisplay, SpotifyDisplay, ScrollProgress, SkillsVisualization)

### Phase 2: Testing Infrastructure
**Goal**: Establish testing patterns before building complex features
**Depends on**: Nothing (can run parallel with Phase 1)
**Requirements**: TEST-01, TEST-02, TEST-03, TEST-04
**Success Criteria** (what must be TRUE):
  1. Running `pnpm test` executes unit tests for utility functions
  2. Running `pnpm test` executes component tests for key UI components
  3. Running `pnpm test:e2e` executes end-to-end tests
  4. Tests run automatically in CI pipeline on every push/PR
**Plans**: TBD

Plans:
- [ ] 02-01: TBD

### Phase 3: Authentication
**Goal**: Users can sign in with GitHub and admins can access protected functionality
**Depends on**: Phase 1 (UI needs theming), Phase 2 (tests should exist for auth flows)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05
**Success Criteria** (what must be TRUE):
  1. User can click "Sign in with GitHub" and complete OAuth flow
  2. Logged-in state persists across page navigation and browser refresh
  3. User "zachlagden" sees admin UI elements (e.g., "New Post" button) when logged in
  4. Other logged-in users see commenter UI but not admin controls
  5. Visiting a protected route (e.g., /blog/new) while logged out redirects to sign in
**Plans**: TBD

Plans:
- [ ] 03-01: TBD

### Phase 4: Blog Core
**Goal**: Users can browse and read published blog posts with full SEO support
**Depends on**: Phase 3 (MongoDB connection established during auth setup)
**Requirements**: BLOG-01, BLOG-02, BLOG-03, BLOG-04, BLOG-05, BLOG-06, BLOG-07, BLOG-08, BLOG-09, BLOG-10, SEO-01, SEO-02, SEO-03, SEO-04
**Success Criteria** (what must be TRUE):
  1. User can view a list of published blog posts at /blog with title, date, reading time, and categories
  2. User can click a post and view full content at /blog/[slug] with proper typography and code highlighting
  3. User can filter posts by clicking on a category or tag
  4. User can search posts by keyword and see matching results
  5. Blog posts have working SEO (meta tags, OG images, structured data) verifiable via social share preview
  6. Blog generates an RSS feed at /blog/rss.xml that validates
  7. Long posts display an auto-generated table of contents
**Plans**: TBD

Plans:
- [ ] 04-01: TBD

### Phase 5: Blog Admin
**Goal**: Admin can create, edit, and manage blog posts with a rich editor
**Depends on**: Phase 4 (blog display must exist to see created posts)
**Requirements**: ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04, ADMIN-05, ADMIN-06, ADMIN-07, ADMIN-08, PERF-03
**Success Criteria** (what must be TRUE):
  1. Admin can create a new post using a rich text editor at /blog/new
  2. Admin can edit an existing post at /blog/[slug]/edit
  3. Admin can delete a post and it no longer appears in the blog listing
  4. Admin can save a post as draft (unpublished) and later publish it
  5. Editor supports markdown formatting (bold, italic, headings, lists, code blocks, images)
  6. Editor component lazy-loads and does not impact initial page load performance
**Plans**: TBD

Plans:
- [ ] 05-01: TBD

### Phase 6: Blog Engagement
**Goal**: Authenticated users can engage with posts through comments and reactions
**Depends on**: Phase 5 (posts must exist to engage with)
**Requirements**: ENGAGE-01, ENGAGE-02, ENGAGE-03, ENGAGE-04, ENGAGE-05, ENGAGE-06
**Success Criteria** (what must be TRUE):
  1. Logged-in user can post a comment on a blog post
  2. Logged-in user can react to a post (like/heart) and see reaction count update
  3. Comments display author GitHub username, date, and content
  4. Admin can delete inappropriate comments (moderation)
  5. Each post shows related posts suggestions at the bottom
**Plans**: TBD

Plans:
- [ ] 06-01: TBD

### Phase 7: Projects Showcase
**Goal**: Users can browse projects with technology filters and optional GitHub stats
**Depends on**: Phase 1 (theming), Phase 2 (testing)
**Requirements**: PROJ-01, PROJ-02, PROJ-03, PROJ-04, PROJ-05, PROJ-06
**Success Criteria** (what must be TRUE):
  1. User can view a list of projects at /projects
  2. Each project displays title, description, technology stack as badges, and links (demo/source)
  3. User can filter projects by clicking a technology badge
  4. Projects with GitHub repos can optionally display live stats (stars, commits)
**Plans**: TBD

Plans:
- [ ] 07-01: TBD

### Phase 8: Polish & Performance
**Goal**: Site achieves excellent UX with polished animations and optimized performance
**Depends on**: All previous phases (refinement after features complete)
**Requirements**: UX-01, UX-02, UX-03, UX-04, PERF-01, PERF-02, PERF-04, CONTENT-01, CONTENT-02, CONTENT-03, CONTENT-04
**Success Criteria** (what must be TRUE):
  1. Page transitions between routes are smooth and polished
  2. Site respects user's reduced motion preference (animations disabled/reduced)
  3. Interactive elements have consistent hover/focus states across all pages
  4. Core Web Vitals scores are "Good" (LCP < 2.5s, FID < 100ms, CLS < 0.1)
  5. Blog pages use appropriate caching (returning visitors load fast)
  6. Images across the site are optimized and lazy-loaded
  7. All content sections (About, Experience, Skills) are updated and reflect current status
**Plans**: TBD

Plans:
- [ ] 08-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8
(Note: Phases 1 and 2 can run in parallel; Phase 7 can run in parallel with 4-6)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Dark Mode | 3/4 | Gap closure needed | - |
| 2. Testing Infrastructure | 0/TBD | Not started | - |
| 3. Authentication | 0/TBD | Not started | - |
| 4. Blog Core | 0/TBD | Not started | - |
| 5. Blog Admin | 0/TBD | Not started | - |
| 6. Blog Engagement | 0/TBD | Not started | - |
| 7. Projects Showcase | 0/TBD | Not started | - |
| 8. Polish & Performance | 0/TBD | Not started | - |

---
*Roadmap created: 2026-01-21*
*Milestone: v1.0 Portfolio Refresh*
