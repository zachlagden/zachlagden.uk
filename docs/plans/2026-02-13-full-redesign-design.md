# Full Site Redesign — Design Document

**Date**: 2026-02-13
**Author**: Team Lead (Claude)
**Status**: Approved

---

## Overview

Complete UI/UX overhaul of zachlagden.uk. Moving from a bland, light-themed single-page portfolio to a dark, multi-page site with personality. All content moves from static `content.json` to MongoDB with a full admin dashboard.

**Guiding principle**: "Let the work speak for itself." Confident, nonchalant, no fluff.

---

## Design Foundation

### Color System

| Token                | Value                    | Usage                                  |
| -------------------- | ------------------------ | -------------------------------------- |
| `--bg-primary`       | `#0a0a0a`                | Page backgrounds                       |
| `--bg-elevated`      | `#111111`                | Cards, nav, footer                     |
| `--bg-subtle`        | `#18181b`                | Code blocks, inputs, hover states      |
| `--border`           | `#27272a`                | Dividers, card borders                 |
| `--text-primary`     | `#fafafa`                | Headings, primary text                 |
| `--text-secondary`   | `#a1a1aa`                | Body text, descriptions                |
| `--text-muted`       | `#52525b`                | Dates, tertiary info                   |
| `--accent-primary`   | `#06b6d4`                | Links, active states, CTAs (cyan-500)  |
| `--accent-secondary` | `#3b82f6`                | Gradients, hover highlights (blue-500) |
| `--accent-glow`      | `rgba(6, 182, 212, 0.1)` | Subtle card hover glow                 |

### Typography

| Role         | Font           | Weights       | Usage                                     |
| ------------ | -------------- | ------------- | ----------------------------------------- |
| Headings     | Space Grotesk  | 500, 600, 700 | Page titles, section headers, hero text   |
| Body         | Inter          | 400, 500, 600 | Paragraphs, descriptions, UI text         |
| Code/Accents | JetBrains Mono | 400, 500      | Code blocks, dates, stats, subtle accents |

### Spacing

- Max content width: `max-w-6xl` (1152px)
- Section vertical padding: `py-24` to `py-32`
- Card padding: `p-6` to `p-8`
- Component gaps: `gap-6` to `gap-8`

---

## Site Structure

```
/                   → Homepage (hero + featured work + skills + testimonials + blog + contact)
/about              → About page (full CV: experience, education, certifications, skills)
/blog               → Blog listing (search, filters, post grid)
/blog/[slug]        → Blog post (reading view, comments, reactions)
/blog/[slug]/edit   → Blog post editor
/blog/new           → New blog post
/projects           → Projects listing (tech filters, project grid)
/projects/new       → New project
/admin              → Admin dashboard (protected)
/admin/homepage     → Manage homepage sections
/admin/about        → Manage CV content
/admin/blog         → Blog management
/admin/projects     → Project management
/admin/settings     → Site settings
```

---

## Page Designs

### Shared Layout

**Navigation (all pages)**

- Sticky top bar: `bg-[#0a0a0a]/80 backdrop-blur-md border-b border-zinc-800`
- Left: "Zach Lagden" in Space Grotesk 600 (home link)
- Right: Home, About, Blog, Projects, Contact — Inter 400, `text-zinc-400`, hover `text-white`, active `text-cyan-500`
- Mobile: Hamburger icon → slide-down menu with the same links
- Height: `h-16`

**Footer (all pages)**

- Simple dark footer: `bg-[#111111] border-t border-zinc-800`
- Left: copyright + name
- Center: Quick links to pages
- Right: Social icons (GitHub, LinkedIn, Instagram, Email)
- Compact, not oversized

### Homepage

**1. Hero Section** (full viewport)

- Centered content, generous whitespace
- Name in Space Grotesk 700, `text-7xl md:text-8xl`, with CSS `background-clip: text` gradient (cyan → blue)
- Tagline below in Inter 400, `text-xl`, `text-zinc-400`
- Row of social links: icon + text, `text-zinc-500`, hover `text-cyan-500`
- Subtle scroll indicator: CSS-animated chevron at bottom
- No parallax, no noise, no grid background. Just bold type on dark space.

**2. What I'm Building** section

- Section title in Space Grotesk 600, `text-3xl`
- 2-3 featured work cards in a grid
- Each card: dark bg (`bg-zinc-900`), border (`border-zinc-800`), hover glow (`border-cyan-500/20`)
- Card content: project name, one-line description, link arrow
- Content managed via admin, with drag-to-reorder and visibility toggles

**3. Skills Preview** section

- Compact skills display — categorized pills/badges
- Categories from admin (Languages, Frameworks, Infrastructure, etc.)
- Each skill as a small badge: `bg-zinc-800 text-zinc-300 border border-zinc-700`
- Links to full skills on /about

**4. Testimonials** section

- Horizontal scroll or grid of testimonial cards
- Each card: quote text in Inter italic, person name + role in JetBrains Mono, optional avatar
- Subtle quotation mark decorative element in accent color
- Managed via admin

**5. Latest Blog Posts** section

- 2-3 most recent posts as compact cards
- Post title, date (JetBrains Mono), excerpt, category pill
- "View all posts →" link
- Cards link to individual blog posts

**6. Get in Touch** strip

- Simple CTA section: heading + email link + social icons
- Not a full form — just contact info
- Clean, minimal

### About Page

**Header**: Page title "About" + brief intro paragraph

**Experience** section

- Timeline layout with left accent border (cyan)
- Each entry: company name (Space Grotesk), role, date range (JetBrains Mono), description
- Dark cards, consistent styling

**Education** section

- Same timeline layout as experience

**Certifications** section

- Grid of cards: certification name, issuer, date, credential link
- Dark cards with subtle borders

**Skills (full)** section

- Categorized grid, more detailed than homepage preview
- Each category as a card with skill list

All content admin-editable.

### Blog Page (redesigned)

**Layout**:

- Full-width header with title + description
- Prominent search bar: dark input (`bg-zinc-900 border-zinc-800`), cyan focus ring
- Category/tag filters: horizontal pill row below search (not sidebar)
- Post grid: responsive cards

**Post cards**:

- `bg-zinc-900 border border-zinc-800`, hover: `border-cyan-500/20`
- Post title (Space Grotesk), date (JetBrains Mono, muted), excerpt (Inter, zinc-400)
- Category pill, reading time estimate
- Cover image if available

**Individual post** (`/blog/[slug]`):

- Clean reading layout, `max-w-prose` centered
- Dark-themed code blocks with syntax highlighting
- Table of contents sidebar on desktop (sticky)
- Comments section below (redesigned to dark theme)
- Reactions (redesigned)

### Projects Page (redesigned)

**Layout**:

- Full-width header with title + description
- Technology filter pills (horizontal row)
- Project card grid

**Project cards**:

- Larger than blog cards
- `bg-zinc-900 border border-zinc-800`, hover glow
- Project name (Space Grotesk), description, tech stack as small badges
- GitHub stats (stars, forks, language) in JetBrains Mono, muted
- Links to live site and repo
- Cover image/screenshot if available

### Admin Dashboard

**Layout**:

- Route: `/admin` (protected via NextAuth)
- Dark sidebar nav on left: Dashboard, Homepage, About, Blog, Projects, Settings
- Content area on right
- Same dark theme as main site

**Homepage management** (`/admin/homepage`):

- Edit hero text (name, tagline)
- Manage featured work items (CRUD, reorder, toggle visibility)
- Manage skills preview (CRUD categories and skills)
- Manage testimonials (CRUD, toggle visibility)
- Edit contact info

**About management** (`/admin/about`):

- Manage experience entries (CRUD, reorder)
- Manage education entries (CRUD, reorder)
- Manage certifications (CRUD)
- Manage full skills list (CRUD categories and skills)

**Blog management** (`/admin/blog`):

- List of posts with edit/delete/publish toggle
- Links to post editor

**Projects management** (`/admin/projects`):

- List of projects with edit/delete/visibility toggle
- Links to project editor

**Settings** (`/admin/settings`):

- Site metadata (title, description, OG image URL)
- Section visibility toggles (global show/hide for any homepage section)
- Social links

---

## Technical Implementation

### What Gets Removed

| Component/Feature      | File(s)                                      | Reason                         |
| ---------------------- | -------------------------------------------- | ------------------------------ |
| Lenis smooth scrolling | `SmoothScrollProvider.tsx`                   | Performance issues, not needed |
| Custom cursor          | `CustomCursor.tsx`                           | Gimmick, no value              |
| Noise texture          | `NoiseTexture.tsx`                           | Visual clutter                 |
| Grid background        | `GlobalBackground.tsx`                       | Visual clutter                 |
| Split-Type animations  | `AnimatedText.tsx`                           | Laggy, over-engineered         |
| Scroll-linked parallax | Header.tsx transforms                        | Lag source                     |
| Spotify display        | `SpotifyDisplay.tsx`                         | Gimmick                        |
| VS Code display        | `VSCodeDisplay.tsx`                          | Gimmick                        |
| Presence status        | `PresenceStatus.tsx`                         | Gimmick                        |
| content.json           | `public/content.json`                        | Replaced by MongoDB            |
| contentLoader utils    | `contentLoader.ts`, `serverContentLoader.ts` | Replaced by DB queries         |

### What Stays (Rebuilt)

| Feature             | Notes                                                    |
| ------------------- | -------------------------------------------------------- |
| Scroll progress bar | Thin accent-colored line at top of viewport              |
| Keyboard navigation | Accessibility support, rebuilt for multi-page            |
| Framer Motion       | Only for page entrance animations (fade + translate)     |
| Section observer    | Used on About page for section tracking                  |
| NextAuth            | Already set up, used for admin protection                |
| MongoDB             | Already used for blog/projects, extended for all content |
| Sentry              | Keep error monitoring                                    |
| Google Analytics    | Keep analytics                                           |

### New MongoDB Collections

```
site_settings        → { key, value } — site metadata, social links, etc.
homepage_hero        → { name, tagline, socialLinks[] }
featured_work        → { title, description, url, order, visible }
skills_preview       → { category, skills[], order, visible }
testimonials         → { quote, personName, personRole, avatarUrl?, order, visible }
about_intro          → { text }
experience           → { company, role, dateRange, description, order, visible }
education            → { institution, degree, dateRange, description, order, visible }
certifications       → { name, issuer, date, credentialUrl?, visible }
skills_full          → { category, skills[], order }
contact_info         → { email, location, locationMapUrl, socialLinks[] }
```

### Animation Approach

- **CSS transitions**: All hovers, focus states, color changes, border changes
- **Framer Motion**: Only for entrance animations on page load
  - Pattern: `initial={{ opacity: 0, y: 20 }}` → `animate={{ opacity: 1, y: 0 }}`
  - Stagger children with `transition={{ delay: index * 0.1 }}`
  - No `whileInView`, no scroll transforms, no parallax
- **`prefers-reduced-motion`**: Respected — disable all motion when set
- **No Lenis**: Use native scroll behavior (`scroll-behavior: smooth` in CSS)

### Font Loading

```tsx
// layout.tsx
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  weight: ["500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: ["400", "500"],
});
```

---

## Implementation Phases

### Phase 1: Foundation — COMPLETE

- [x] Set up new color system and typography (Tailwind CSS variables, @theme inline tokens, font loading)
- [x] Build new shared layout (dark sticky top nav, dark footer)
- [x] Remove dropped components (11 files: Lenis, custom cursor, noise, grid, AnimatedText, SpotifyDisplay, VSCodeDisplay, PresenceStatus, ScrollProgress, NavItem, MobileMenu)
- [x] Remove packages (lenis, split-type)
- [x] Update layout.tsx (dark body, fonts, remove SmoothScrollProvider)
- [x] Set up MongoDB collections (11 collections, TypeScript interfaces, DAL functions)
- [x] Create seed script (scripts/seed-content.ts)
- [x] QA passed: build, lint, Prettier, design doc alignment all clean

### Phase 2: Homepage — COMPLETE

- [x] Build hero section (Header.tsx rewritten — gradient text, social links, CSS scroll indicator)
- [x] Build "What I'm building" section (FeaturedWorkSection.tsx — 3 cards: DigiGrow, Donna, Lagden Dev)
- [x] Build skills preview section (SkillsPreviewSection.tsx — 4 categories with pill badges)
- [x] Build testimonials section (TestimonialsSection.tsx — 3 placeholder cards)
- [x] Build latest blog posts section (LatestPostsSection.tsx — server data via props)
- [x] Build contact strip (ContactStripSection.tsx — email + social icons)
- [x] Restructure homepage (page.tsx fetches posts server-side, HomeClient.tsx simplified)
- [x] QA passed: build, lint, Prettier, design doc alignment all clean

### Phase 3: About Page — COMPLETE

- [x] Build about page layout (server component with AboutClient, DAL via `src/lib/dal/about.ts`)
- [x] Experience timeline (ExperienceSection.tsx with TimelineItem.tsx)
- [x] Education timeline (EducationSection.tsx with TimelineItem.tsx)
- [x] Certifications grid (CertificationsSection.tsx with CertificationItem.tsx)
- [x] Full skills grid (SkillsSection.tsx with SkillCategory.tsx)
- [x] Migrate content.json data to MongoDB (seed script covers about_intro, experience, education, certifications, skills_full)

### Phase 4: Blog Redesign — COMPLETE

- [x] Redesign blog listing page (dark theme, new layout with SearchFilter and PostCard grid)
- [x] Redesign post cards (PostCard.tsx — dark cards with category pills, reading time)
- [x] Redesign individual post page (PostContent.tsx, PostHeader.tsx, TableOfContents sidebar)
- [x] Redesign comments/reactions (CommentSection.tsx, ReactionButton.tsx — dark themed)
- [x] Redesign search/filter UI (SearchFilter.tsx, CategoryPills.tsx — dark inputs, horizontal pill filters)

### Phase 5: Projects Redesign — COMPLETE

- [x] Redesign projects listing page (dark theme, full-width header, technology filters, project grid with GitHub stats)
- [x] Redesign project cards (ProjectCard.tsx — dark cards with tech badges, GitHub stats, hover glow)
- [x] Redesign technology filters (TechnologyFilters.tsx — horizontal pill row with URL-based state)

### Phase 6: Admin Dashboard — COMPLETE

- [x] Admin layout (sidebar nav via AdminSidebar.tsx, protected routes via `requireAdmin()` in layout.tsx, `noindex` robots)
- [x] Homepage content management (HomepageAdmin.tsx — hero, featured work, skills preview, testimonials, contact info CRUD)
- [x] About content management (AboutAdmin.tsx — intro, experience, education, certifications, skills CRUD)
- [x] Blog management integration (BlogAdmin.tsx — post listing with edit/delete/publish controls)
- [x] Projects management integration (ProjectsAdmin.tsx — project listing with edit/delete/visibility controls)
- [x] Site settings management (SettingsAdmin.tsx — site metadata, section visibility, configuration)

### Phase 7: Polish & QA

- Responsive testing across all breakpoints
- Accessibility audit
- Performance optimization
- Prettier formatting pass
- Build verification
- Cross-browser testing

---

## Team Assignment

| Agent            | Phases                               | Scope                                                          |
| ---------------- | ------------------------------------ | -------------------------------------------------------------- |
| **backend-dev**  | 1 (DB), 3 (migration), 6 (admin API) | MongoDB collections, server actions, admin API, data migration |
| **frontend-dev** | 1 (layout), 2, 3 (UI), 4, 5          | All page UI, components, animations, responsive design         |
| **root-dev**     | 1 (config)                           | Tailwind config, font setup, CSS variables, cleanup old files  |
| **qa-agent**     | 7                                    | Build, lint, format, accessibility, responsive, cross-browser  |

Backend and frontend devs coordinate on data shapes, server actions, and component props for each phase.
