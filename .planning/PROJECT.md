# zachlagden.uk

## What This Is

A personal portfolio and blog platform for Zach Lagden — an 18-year-old entrepreneur, technical architect, and full-stack developer based in Ascot, UK. The site showcases skills, experience, and projects while providing a technical blog for sharing knowledge and insights.

## Core Value

A professional online presence that authentically represents who you are and what you build, with a blog that lets you share technical content and engage with your audience.

## Current Milestone: v1.0 Portfolio Refresh

**Goal:** Transform the existing portfolio into a full-featured platform with blog, projects showcase, and modern UX improvements.

**Target features:**
- Full-featured blog with GitHub OAuth authentication
- Projects showcase with optional GitHub integration
- Dark mode toggle
- Improved animations and micro-interactions
- Performance, SEO, and testing improvements
- Comprehensive content refresh

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

- ✓ Next.js 15 App Router with TypeScript — existing foundation
- ✓ Tailwind CSS 4 styling — existing foundation
- ✓ Sections: About, Experience, Education, Skills, Certifications, Contact — existing
- ✓ Smooth scrolling with Lenis — existing
- ✓ Framer Motion animations — existing
- ✓ Content from JSON — existing pattern
- ✓ Sentry error tracking — existing
- ✓ Google Analytics — existing

### Active

<!-- Current scope. Building toward these. -->

**Blog System:**
- [ ] GitHub OAuth authentication (admin for zachlagden, commenter for others)
- [ ] MongoDB storage for posts, comments, reactions
- [ ] Rich editor (WYSIWYG or markdown) for creating posts
- [ ] Categories and tags for post organization
- [ ] Code syntax highlighting in posts
- [ ] Comments system (GitHub login required)
- [ ] Post reactions/likes (GitHub login required)
- [ ] Post drafts (save unpublished work)
- [ ] Reading time calculation
- [ ] Search across blog posts
- [ ] RSS feed for subscribers
- [ ] Related posts suggestions
- [ ] Auto-generated table of contents for long posts

**Projects Showcase:**
- [ ] Project cards with title, description, tech stack, links
- [ ] Optional GitHub repo integration (live stars, commit count)

**UX Improvements:**
- [ ] Dark mode toggle with theme persistence
- [ ] Improved animations and micro-interactions

**Technical Improvements:**
- [ ] Performance optimization (Core Web Vitals)
- [ ] SEO enhancements (structured data, meta tags)
- [ ] Testing (unit and integration tests)

**Content:**
- [ ] Comprehensive content refresh (tone, details, context)

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Detailed project case study pages — Basic cards sufficient for v1, can add later
- Video content support — Complexity not justified for initial blog
- Multi-language support — English-only site for now
- Custom CMS admin panel — Use in-page editor with GitHub auth instead
- Email newsletter — RSS feed covers subscription needs for v1
- Testimonials section — Can add in future milestone if needed

## Context

**Technical environment:**
- Next.js 15.3.8 with App Router
- React 19.1.4, TypeScript 5.8.3
- Tailwind CSS 4.1.10 with Framer Motion 12
- Content currently in `public/content.json`
- Deployed to Vercel with Sentry monitoring

**Current site:** cv.zachlagden.uk (live portfolio with sections)

**New additions needed:**
- MongoDB database for blog content
- GitHub OAuth integration
- Blog routing and pages
- Admin functionality for post management

## Constraints

- **Database**: MongoDB — User's preferred database choice
- **Auth**: GitHub OAuth only — Simplifies auth, aligns with developer identity
- **Hosting**: Vercel — Current deployment platform, maintain compatibility
- **Admin access**: Only zachlagden GitHub username gets admin privileges

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| MongoDB for blog storage | User preference, flexible schema for posts/comments | — Pending |
| GitHub OAuth for auth | Developer-focused audience, simplifies implementation | — Pending |
| Single admin user (zachlagden) | Personal portfolio, no multi-user admin needed | — Pending |

---
*Last updated: 2026-01-21 after initial project definition*
