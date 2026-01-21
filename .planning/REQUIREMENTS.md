# Requirements: zachlagden.uk v1.0

**Defined:** 2026-01-21
**Core Value:** A professional online presence that authentically represents who you are and what you build, with a blog for sharing technical content.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Dark Mode

- [ ] **THEME-01**: User can toggle between light and dark themes
- [ ] **THEME-02**: Theme preference persists across sessions (localStorage)
- [ ] **THEME-03**: Theme defaults to system preference on first visit
- [ ] **THEME-04**: No flash of wrong theme on page load
- [ ] **THEME-05**: All UI elements respond correctly to theme changes

### Authentication

- [ ] **AUTH-01**: User can sign in with GitHub OAuth
- [ ] **AUTH-02**: Session persists across page navigation and browser refresh
- [ ] **AUTH-03**: Admin user (zachlagden) sees admin UI when logged in
- [ ] **AUTH-04**: Non-admin users can log in (for commenting/reactions)
- [ ] **AUTH-05**: Protected routes redirect unauthenticated users to login

### Blog Core

- [ ] **BLOG-01**: User can view list of published blog posts
- [ ] **BLOG-02**: User can view individual blog post with full content
- [ ] **BLOG-03**: Blog posts display title, date, reading time, categories
- [ ] **BLOG-04**: Blog posts render code blocks with syntax highlighting
- [ ] **BLOG-05**: Blog posts have SEO metadata (title, description, OG images)
- [ ] **BLOG-06**: Blog posts support categories/tags for organization
- [ ] **BLOG-07**: User can filter posts by category/tag
- [ ] **BLOG-08**: Blog generates RSS feed for subscribers
- [ ] **BLOG-09**: User can search across blog posts
- [ ] **BLOG-10**: Long posts display auto-generated table of contents

### Blog Admin

- [ ] **ADMIN-01**: Admin can create new blog posts with rich text editor
- [ ] **ADMIN-02**: Admin can edit existing blog posts
- [ ] **ADMIN-03**: Admin can delete blog posts
- [ ] **ADMIN-04**: Admin can save posts as drafts (unpublished)
- [ ] **ADMIN-05**: Admin can publish/unpublish posts
- [ ] **ADMIN-06**: Editor supports markdown formatting (bold, italic, headings, lists)
- [ ] **ADMIN-07**: Editor supports code blocks with language selection
- [ ] **ADMIN-08**: Editor supports image embedding

### Blog Engagement

- [ ] **ENGAGE-01**: Authenticated users can comment on blog posts
- [ ] **ENGAGE-02**: Authenticated users can react to blog posts (like/heart)
- [ ] **ENGAGE-03**: Comments display author (GitHub username), date, content
- [ ] **ENGAGE-04**: Post displays reaction count
- [ ] **ENGAGE-05**: Admin can moderate comments (approve/delete)
- [ ] **ENGAGE-06**: Related posts shown at end of each post

### Projects Showcase

- [ ] **PROJ-01**: User can view list of projects
- [ ] **PROJ-02**: Projects display title, description, technology stack
- [ ] **PROJ-03**: Projects display live demo link and source code link
- [ ] **PROJ-04**: Projects can optionally show GitHub stats (stars, commits)
- [ ] **PROJ-05**: User can filter projects by technology
- [ ] **PROJ-06**: Technology stack displayed as visual badges

### Animations & UX

- [ ] **UX-01**: Page transitions are smooth and polished
- [ ] **UX-02**: Animations respect user's reduced motion preference
- [ ] **UX-03**: Interactive elements have appropriate hover/focus states
- [ ] **UX-04**: Micro-interactions enhance user feedback

### Performance

- [ ] **PERF-01**: Site achieves good Core Web Vitals scores
- [ ] **PERF-02**: Blog pages use appropriate caching strategy
- [ ] **PERF-03**: Heavy components (editor) are lazy-loaded
- [ ] **PERF-04**: Images are optimized and lazy-loaded

### SEO

- [ ] **SEO-01**: All pages have appropriate meta tags
- [ ] **SEO-02**: Blog posts have structured data (Article schema)
- [ ] **SEO-03**: Sitemap includes blog posts dynamically
- [ ] **SEO-04**: Social sharing cards work correctly (OG images)

### Testing

- [ ] **TEST-01**: Unit tests exist for utility functions
- [ ] **TEST-02**: Component tests exist for key UI components
- [ ] **TEST-03**: E2E tests cover critical user flows (auth, blog viewing)
- [ ] **TEST-04**: Tests run in CI pipeline

### Content Refresh

- [ ] **CONTENT-01**: About section updated to reflect current status
- [ ] **CONTENT-02**: Experience section updated with latest roles
- [ ] **CONTENT-03**: Skills section updated with current competencies
- [ ] **CONTENT-04**: All content reflects authentic voice and tone

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Blog Enhancements

- **BLOG-V2-01**: Email newsletter subscription
- **BLOG-V2-02**: Post series/collections grouping
- **BLOG-V2-03**: View count tracking
- **BLOG-V2-04**: Comment replies (threaded comments)

### Projects Enhancements

- **PROJ-V2-01**: Detailed case study pages for select projects
- **PROJ-V2-02**: Project metrics/outcomes display
- **PROJ-V2-03**: Client testimonials

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Multi-language support | English-only site, complexity not justified |
| Video content in blog | Storage/bandwidth costs, not needed for v1 |
| Multiple admin users | Single-admin site (zachlagden only) |
| Disqus/external comments | Privacy concerns, custom solution preferred |
| Real-time chat | Complexity not justified for portfolio |
| Mobile app | Web-first, responsive design sufficient |
| Payment integration | Not a commerce site |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| THEME-01 | TBD | Pending |
| THEME-02 | TBD | Pending |
| THEME-03 | TBD | Pending |
| THEME-04 | TBD | Pending |
| THEME-05 | TBD | Pending |
| AUTH-01 | TBD | Pending |
| AUTH-02 | TBD | Pending |
| AUTH-03 | TBD | Pending |
| AUTH-04 | TBD | Pending |
| AUTH-05 | TBD | Pending |
| BLOG-01 | TBD | Pending |
| BLOG-02 | TBD | Pending |
| BLOG-03 | TBD | Pending |
| BLOG-04 | TBD | Pending |
| BLOG-05 | TBD | Pending |
| BLOG-06 | TBD | Pending |
| BLOG-07 | TBD | Pending |
| BLOG-08 | TBD | Pending |
| BLOG-09 | TBD | Pending |
| BLOG-10 | TBD | Pending |
| ADMIN-01 | TBD | Pending |
| ADMIN-02 | TBD | Pending |
| ADMIN-03 | TBD | Pending |
| ADMIN-04 | TBD | Pending |
| ADMIN-05 | TBD | Pending |
| ADMIN-06 | TBD | Pending |
| ADMIN-07 | TBD | Pending |
| ADMIN-08 | TBD | Pending |
| ENGAGE-01 | TBD | Pending |
| ENGAGE-02 | TBD | Pending |
| ENGAGE-03 | TBD | Pending |
| ENGAGE-04 | TBD | Pending |
| ENGAGE-05 | TBD | Pending |
| ENGAGE-06 | TBD | Pending |
| PROJ-01 | TBD | Pending |
| PROJ-02 | TBD | Pending |
| PROJ-03 | TBD | Pending |
| PROJ-04 | TBD | Pending |
| PROJ-05 | TBD | Pending |
| PROJ-06 | TBD | Pending |
| UX-01 | TBD | Pending |
| UX-02 | TBD | Pending |
| UX-03 | TBD | Pending |
| UX-04 | TBD | Pending |
| PERF-01 | TBD | Pending |
| PERF-02 | TBD | Pending |
| PERF-03 | TBD | Pending |
| PERF-04 | TBD | Pending |
| SEO-01 | TBD | Pending |
| SEO-02 | TBD | Pending |
| SEO-03 | TBD | Pending |
| SEO-04 | TBD | Pending |
| TEST-01 | TBD | Pending |
| TEST-02 | TBD | Pending |
| TEST-03 | TBD | Pending |
| TEST-04 | TBD | Pending |
| CONTENT-01 | TBD | Pending |
| CONTENT-02 | TBD | Pending |
| CONTENT-03 | TBD | Pending |
| CONTENT-04 | TBD | Pending |

**Coverage:**
- v1 requirements: 54 total
- Mapped to phases: 0
- Unmapped: 54 ⚠️

---
*Requirements defined: 2026-01-21*
*Last updated: 2026-01-21 after initial definition*
