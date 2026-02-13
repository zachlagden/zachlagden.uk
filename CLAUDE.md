# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio and blog site for Zach Lagden built with Next.js, React, TypeScript, and Tailwind CSS. A dark-themed, multi-page site backed by MongoDB for all content management. Features a blog with MDX support, project showcase with GitHub integration, and an about page with full CV details.

## Technology Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript 5
- **Styling**: Tailwind CSS 4, PostCSS
- **Animations**: Framer Motion (entrance animations only — no scroll-linked effects)
- **Fonts**: Space Grotesk (headings), Inter (body), JetBrains Mono (code/accents) via `next/font/google`
- **Database**: MongoDB 7 (all content stored in DB, no static JSON files)
- **Auth**: NextAuth v5 (beta) with MongoDB adapter
- **Blog**: MDX via next-mdx-remote, Tiptap rich text editor, reading-time estimates
- **Monitoring**: Sentry
- **Analytics**: Google Analytics
- **UI Primitives**: Radix UI (alert-dialog, label, slot, switch, tooltip), Lucide icons
- **Validation**: Zod
- **URL State**: nuqs
- **Testing**: Vitest (unit), Playwright (e2e)

## Common Commands

### Development

```bash
pnpm dev          # Start the development server
pnpm devturbo     # Start with Turbopack (faster refreshes)
```

### Building & Deployment

```bash
pnpm build        # Generate a production build
pnpm start        # Start the production server
```

### Code Quality

```bash
pnpm lint         # Run ESLint
pnpm format       # Format code with Prettier
pnpm format:check # Check formatting without writing
```

### Testing

```bash
pnpm test          # Run Vitest in watch mode
pnpm test:unit     # Run unit tests once
pnpm test:coverage # Run with coverage report
pnpm test:e2e      # Run Playwright end-to-end tests
pnpm test:e2e:ui   # Run Playwright with UI
```

### Database

```bash
pnpm seed          # Seed MongoDB from public/content.json (idempotent)
# Equivalent to: npx tsx scripts/seed-content.ts
# Requires MONGODB_URI env var
```

## Architecture Overview

The project is a multi-page Next.js App Router application with server-side data fetching from MongoDB.

### 1. App Structure (Pages)

```
src/app/
├── page.tsx              # Homepage (server component, fetches latest posts)
├── HomeClient.tsx        # Homepage client shell (hero, featured work, skills, testimonials, blog, contact)
├── about/page.tsx        # About page (experience, education, certifications, skills)
├── blog/
│   ├── page.tsx          # Blog listing (search, category filters, post grid)
│   ├── [slug]/page.tsx   # Individual blog post (reading view, comments, reactions)
│   ├── [slug]/edit/      # Blog post editor (protected)
│   ├── new/              # New blog post (protected)
│   └── rss.xml/route.ts  # RSS feed
├── projects/
│   ├── page.tsx          # Projects listing (tech filters, project grid)
│   └── new/page.tsx      # New project (protected)
├── 403/page.tsx          # Forbidden error page
├── layout.tsx            # Root layout (fonts, nav, footer, auth, analytics)
├── globals.css           # Global styles and Tailwind CSS theme tokens
├── sitemap.ts            # Dynamic sitemap generation
└── global-error.tsx      # Sentry error boundary
```

### 2. Content Management (MongoDB)

All site content is stored in MongoDB. No static `content.json` files are used for content delivery.

**Collections**:

- `site_settings` — Key-value store for site metadata and configuration
- `homepage_hero` — Hero section content (name, tagline, social links)
- `featured_work` — Highlighted work items for homepage
- `skills_preview` — Abbreviated skill categories for homepage
- `testimonials` — Client/colleague testimonials
- `about_intro` — About page intro text
- `experience` — Work experience entries (timeline)
- `education` — Education entries (timeline)
- `certifications` — Professional certifications
- `skills_full` — Full skill categories for about page
- `contact_info` — Contact details and social links
- `posts` — Blog posts (MDX content)
- `comments` — Blog post comments
- `reactions` — Blog post reactions
- `projects` — Project entries

**Data Access Layer**:

- `src/lib/content/site.ts` — DAL for site content collections (homepage, about, settings)
- `src/lib/dal/about.ts` — DAL specifically for about page data (with `getAboutPageData()` combined fetch)
- `src/lib/dal.ts` — Core DAL utilities
- `src/lib/dal/comments.ts` — Comments DAL
- `src/lib/dal/reactions.ts` — Reactions DAL
- `src/lib/blog/posts.ts` — Blog posts DAL and queries
- `src/lib/projects/projects.ts` — Projects DAL

**Models** (`src/models/`):

- `SiteContent.ts` — TypeScript interfaces for all site content collections (with Serialized variants)
- `Post.ts` — Blog post model
- `Comment.ts` — Comment model
- `Reaction.ts` — Reaction model
- `Project.ts` — Project model (if applicable)

### 3. Components Organization

```
src/components/
├── about/              # About page client component
│   └── AboutClient.tsx
├── auth/               # Authentication components
│   ├── AdminFAB.tsx
│   ├── AuthStatus.tsx
│   ├── ProtectedContent.tsx
│   ├── SessionProvider.tsx
│   ├── SignInButton.tsx
│   └── UserMenu.tsx
├── blog/               # Blog components
│   ├── CategoryPills.tsx
│   ├── Comment.tsx
│   ├── CommentForm.tsx
│   ├── CommentList.tsx
│   ├── CommentSection.tsx
│   ├── DeleteCommentButton.tsx
│   ├── DeletePostButton.tsx
│   ├── EditorToolbar.tsx
│   ├── EmptyState.tsx
│   ├── MDXContent.tsx
│   ├── PostCard.tsx
│   ├── PostContent.tsx
│   ├── PostEditor.tsx
│   ├── PostForm.tsx
│   ├── PostHeader.tsx
│   ├── ReactionButton.tsx
│   ├── RelatedPosts.tsx
│   ├── SearchFilter.tsx
│   └── TableOfContents.tsx
├── layout/             # Shared layout
│   ├── Header.tsx      # Hero section (gradient text, social links, scroll indicator)
│   ├── Navigation.tsx  # Sticky dark top nav with mobile hamburger menu
│   └── Footer.tsx      # Dark footer with links and social icons
├── projects/           # Project components
│   ├── EmptyState.tsx
│   ├── ProjectCard.tsx
│   ├── ProjectForm.tsx
│   ├── TechnologyBadge.tsx
│   └── TechnologyFilters.tsx
├── sections/           # Homepage sections
│   ├── AboutSection.tsx
│   ├── CertificationsSection.tsx
│   ├── ContactSection.tsx
│   ├── ContactStripSection.tsx
│   ├── EducationSection.tsx
│   ├── ExperienceSection.tsx
│   ├── FeaturedWorkSection.tsx
│   ├── LatestPostsSection.tsx
│   ├── SkillsPreviewSection.tsx
│   ├── SkillsSection.tsx
│   └── TestimonialsSection.tsx
├── syntax/             # Code syntax highlighting
│   └── CodeBlock.tsx
└── ui/                 # Reusable UI primitives (Radix-based + custom)
    ├── AboutCard.tsx
    ├── CertificationItem.tsx
    ├── CopyButton.tsx
    ├── KeyboardIndicator.tsx
    ├── ScrollToTopButton.tsx
    ├── Section.tsx
    ├── SkillCategory.tsx
    ├── SkillsVisualization.tsx
    ├── SocialIcon.tsx
    ├── TimelineItem.tsx
    ├── alert-dialog.tsx
    ├── button.tsx
    ├── input.tsx
    ├── label.tsx
    ├── skeleton.tsx
    ├── switch.tsx
    ├── textarea.tsx
    └── tooltip.tsx
```

### 4. Server Actions

- `src/lib/actions/posts.ts` — Blog post CRUD
- `src/lib/actions/comments.ts` — Comment CRUD
- `src/lib/actions/reactions.ts` — Reaction management
- `src/lib/actions/projects.ts` — Project CRUD

### 5. Custom Hooks

- `src/hooks/useKeyboardNavigation.ts` — Keyboard navigation for accessibility
- `src/hooks/useSectionObserver.ts` — Tracks active sections during scrolling

### 6. Utilities

- `src/lib/utils.ts` — General utilities (cn class merging, etc.)
- `src/lib/blog/metadata.ts` — Blog post metadata generation
- `src/lib/blog/search.ts` — Blog search logic
- `src/lib/blog/toc.ts` — Table of contents extraction
- `src/lib/blog/validation.ts` — Blog post validation (Zod schemas)
- `src/lib/blog/indexes.ts` — MongoDB index setup for blog
- `src/lib/projects/github.ts` — GitHub API integration (Octokit)
- `src/lib/auth.ts` / `src/lib/auth.config.ts` — NextAuth configuration
- `src/lib/db.ts` — MongoDB client connection

### 7. Monitoring and Instrumentation

- `sentry.client.config.ts` / `sentry.server.config.ts` / `sentry.edge.config.ts` — Sentry configuration
- `src/instrumentation.ts` — Next.js instrumentation hook

## Design System

The site uses a dark theme with these design tokens (defined in `globals.css`):

- **Background**: `#0a0a0a` (primary), `#111111` (elevated), `#18181b` (subtle)
- **Text**: `#fafafa` (primary), `#a1a1aa` (secondary), `#52525b` (muted)
- **Accent**: `#06b6d4` (cyan-500, primary), `#3b82f6` (blue-500, secondary)
- **Borders**: `#27272a`

Typography uses CSS variables: `--font-space-grotesk`, `--font-inter`, `--font-jetbrains-mono`.

## Key Implementation Details

1. **MongoDB-backed content**: All content is fetched server-side from MongoDB via DAL functions. The seed script (`scripts/seed-content.ts`) migrates legacy `content.json` data into MongoDB.

2. **Server-first data fetching**: Page components are async server components that fetch data via DAL functions, then pass serialized data as props to client components.

3. **Animations**: Framer Motion is used only for entrance animations (`initial → animate` with fade + translate). No scroll-linked animations, no parallax. `prefers-reduced-motion` is respected.

4. **Authentication**: NextAuth v5 with MongoDB adapter. Protected routes use `ProtectedContent` wrapper. `AdminFAB` provides quick access to admin actions.

5. **Blog system**: MDX content rendered via next-mdx-remote with rehype plugins (syntax highlighting, auto-linking headings, slug generation). Tiptap editor for post creation/editing.

6. **SEO**: Dynamic metadata generation, OpenGraph tags, structured data (JSON-LD), sitemap, RSS feed.

7. **Error handling**: Sentry for error tracking with custom client/server/edge configurations.

## Development Approach

When modifying this codebase:

1. **Content changes**: Update MongoDB data (via seed script or admin UI) rather than editing components directly
2. **Type safety**: Update `src/models/SiteContent.ts` when adding new content collections
3. **Data access**: Add new DAL functions in `src/lib/content/site.ts` or `src/lib/dal/` for new collections
4. **Component structure**: Maintain the component-based structure with server components fetching data and client components rendering UI
5. **Animations**: Use Framer Motion entrance animations only — no scroll effects or parallax
6. **Responsive design**: All components must work across breakpoints
7. **Testing**: Unit tests with Vitest, e2e tests with Playwright
