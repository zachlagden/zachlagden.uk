# Architecture

**Analysis Date:** 2026-01-21

## Pattern Overview

**Overall:** Next.js App Router with Client-Side Content Loading and Dynamic Section Rendering

**Key Characteristics:**
- Server-side metadata generation and static content loading, with client-side hydration
- Dynamic section imports with Suspense boundaries for progressive loading
- Content-first architecture: all data sourced from centralized JSON file
- Layered component organization: layout → sections → UI primitives
- Preference-aware rendering: respects reduced motion, touch capabilities, and viewport size
- Smooth scrolling with progressive fallbacks (Lenis → View Transitions API → native scroll)

## Layers

**Page Layer (App Router):**
- Purpose: Server-side entry point and metadata generation
- Location: `src/app/page.tsx`, `src/app/layout.tsx`
- Contains: Route handlers, metadata generation, root layout
- Depends on: `utils/serverContentLoader.ts`, `components/providers/SmoothScrollProvider`
- Used by: Renders `HomeClient` component

**Client Layer (Main Client Component):**
- Purpose: Client-side orchestration of all interactive features and content rendering
- Location: `src/app/HomeClient.tsx`
- Contains: State management (activeSection, scroll position, mobile menu), refs for section tracking, keyboard/scroll event listeners
- Depends on: All section components, layout components, hooks, utils
- Used by: `src/app/page.tsx`

**Layout Layer:**
- Purpose: Static UI structure (Header, Navigation, Footer, Mobile Menu)
- Location: `src/components/layout/`
- Contains: `Header.tsx`, `Navigation.tsx`, `Footer.tsx`, `MobileMenu.tsx`
- Depends on: Content from props, UI components, animation utilities
- Used by: `HomeClient.tsx`, renders in specific DOM locations

**Section Layer:**
- Purpose: Page sections rendered dynamically with content props
- Location: `src/components/sections/`
- Contains: `AboutSection.tsx`, `ExperienceSection.tsx`, `EducationSection.tsx`, `SkillsSection.tsx`, `CertificationsSection.tsx`, `ContactSection.tsx`
- Depends on: Content types, UI components, animation utilities
- Used by: `HomeClient.tsx` via dynamic imports with Suspense fallbacks

**UI Component Layer:**
- Purpose: Reusable atomic and composite UI components
- Location: `src/components/ui/`
- Contains: `Section.tsx` (section wrapper), `TimelineItem.tsx`, `AboutCard.tsx`, `SkillCategory.tsx`, `AnimatedText.tsx`, `SocialIcon.tsx`, `CopyButton.tsx`, `ScrollToTopButton.tsx`, `KeyboardIndicator.tsx`, `PresenceStatus.tsx`, `CustomCursor.tsx`, `GlobalBackground.tsx`, `NoiseTexture.tsx`, `ScrollProgress.tsx`, `VSCodeDisplay.tsx`, `SpotifyDisplay.tsx`, `CertificationItem.tsx`, `NavItem.tsx`
- Depends on: Animation utils, Framer Motion, Lucide React icons
- Used by: Section and layout components

**Provider Layer:**
- Purpose: Global context and browser capability management
- Location: `src/components/providers/`
- Contains: `SmoothScrollProvider.tsx` (initializes Lenis, detects reduced motion/touch)
- Depends on: Lenis library, browser APIs
- Used by: Root layout wraps all children

**Content Layer:**
- Purpose: Type-safe content structure and loading
- Location: `src/types/content.ts`, `src/utils/contentLoader.ts`, `src/utils/serverContentLoader.ts`
- Contains: TypeScript interfaces for all content types, client-side fetch with caching, server-side file system read
- Depends on: `public/content.json`
- Used by: All components receive content via props

**Hook Layer:**
- Purpose: Reusable client-side logic encapsulation
- Location: `src/hooks/`
- Contains: `useSectionObserver.ts` (IntersectionObserver for active section tracking), `useKeyboardNavigation.ts` (keyboard shortcuts and section navigation)
- Depends on: Browser APIs
- Used by: `HomeClient.tsx`

**Utility Layer:**
- Purpose: Pure functions and helpers for animations, scrolling, transitions, and utilities
- Location: `src/utils/`
- Contains: `animationUtils.ts` (Framer Motion variants), `scrollUtils.ts` (scroll with Lenis/View Transitions), `viewTransition.ts` (View Transitions API detection and fallbacks), `presenceService.ts` (external presence detection)
- Depends on: External libraries (Lenis, Framer Motion)
- Used by: Components, hooks, and other utilities

## Data Flow

**Server-Side Render:**

1. Browser requests `/`
2. `src/app/page.tsx` (server component) calls `loadContentServer()`
3. `src/utils/serverContentLoader.ts` reads `public/content.json` from filesystem
4. `generateMetadata()` in `src/app/layout.tsx` uses content to build SEO metadata
5. Content passed as prop to `HomeClient` component
6. Server returns HTML with metadata and client component

**Client-Side Hydration & Interaction:**

1. `HomeClient.tsx` receives content from server
2. Client-side effects initialize:
   - Device detection (mobile, touch, reduced motion preferences)
   - Refs created for each section (about, experience, education, skills, certifications, contact)
3. `SmoothScrollProvider` initializes:
   - Detects Lenis capability and user preferences
   - Dynamically imports Lenis library
   - Sets up requestAnimationFrame loop for smooth scrolling
   - Stores instance on `window.lenis`
4. Dynamic imports with Suspense load section components:
   - `ExperienceSection`, `EducationSection`, `SkillsSection`, `CertificationsSection`, `ContactSection` lazy-load
   - Loading fallback shows skeleton UI
   - `AboutSection` and layout components load synchronously
5. Hooks initialize:
   - `useSectionObserver` attaches IntersectionObserver to section refs
   - `useKeyboardNavigation` adds keydown listener for navigation shortcuts
6. User interaction:
   - Scroll triggers `activeSection` state update via IntersectionObserver
   - Keyboard press (arrow keys or number keys) calls `scrollToSection(id)`
   - `scrollToSection` uses Lenis if available, falls back to View Transitions API, then native scroll

**State Management:**

- `activeSection`: Tracks which section is in viewport (set by `useSectionObserver`)
- `showScrollButton`: Tracks scroll position > 300px to show/hide scroll-to-top button
- `mobileMenuOpen`: Tracks mobile menu toggle state
- `isMobile`: Tracks viewport < 768px breakpoint
- `prefersReducedMotion`: Tracks user's reduced motion preference
- `isTouchDevice`: Tracks if device supports touch or has no hover capability
- Content cache: `src/utils/contentLoader.ts` caches content after first fetch (client-side only)

## Key Abstractions

**ContentData Interface:**
- Purpose: Single source of truth for all content structure
- Location: `src/types/content.ts`
- Pattern: Nested TypeScript interfaces matching JSON schema (Metadata, Personal, About, Experience[], Education[], Skills, Certifications[], Contact, Footer)
- Used by: All components receive typed content as props

**Section Component Pattern:**
- Purpose: Consistent wrapper for all major page sections
- Location: `src/components/ui/Section.tsx` (wrapper), `src/components/sections/*Section.tsx` (implementations)
- Pattern: React forwardRef to expose section refs, uses `whileInView` animation trigger, applies View Transitions names if supported
- Example: `src/components/sections/AboutSection.tsx` wraps content cards with Section component and Framer Motion animations

**Animation Variants Registry:**
- Purpose: Centralized animation definitions for consistency
- Location: `src/utils/animationUtils.ts`
- Exports: `hoverAnimation`, `tapAnimation`, `fadeInAnimation`, `slideUpAnimation`, `staggerContainerAnimation`, `sectionAnimation`, `listItemAnimation`, `tooltipAnimation`
- Used by: Components import and apply variants via Framer Motion `variants` prop

**Scroll Abstraction:**
- Purpose: Progressive fallback chain for scroll behavior
- Location: `src/utils/scrollUtils.ts`
- Implementation: `scrollToSection()` tries Lenis → View Transitions API → native scroll (respects reduced motion preference at each step)
- Used by: Navigation, keyboard navigation, scroll-to-top button

**View Transitions API Wrapper:**
- Purpose: Safe feature detection and fallback for View Transitions
- Location: `src/utils/viewTransition.ts`
- Exports: `supportsViewTransitions()`, `updateWithTransition()`, `scrollToSectionWithTransition()`
- Used by: Scroll utils, Section component for transition names

## Entry Points

**Server Entry Point:**
- Location: `src/app/page.tsx`
- Triggers: Browser navigation to `/`
- Responsibilities: Calls server-side content loader, returns JSX with `HomeClient` prop
- Output: HTML with preloaded content and Server-Side Rendering metadata

**Client Entry Point:**
- Location: `src/app/HomeClient.tsx`
- Triggers: Hydration after server render
- Responsibilities: Initialize all client state, refs, hooks; render layout, header, sections, footer; manage user interactions
- Output: Fully interactive portfolio page with smooth scrolling, keyboard navigation, dynamic section loading

**Metadata Generation:**
- Location: `src/app/layout.tsx` → `generateMetadata()` function
- Triggers: Server-side execution before render
- Responsibilities: Build SEO metadata from content JSON (title, description, OpenGraph, Twitter cards, structured data)
- Output: Metadata object passed to Next.js

**Error Handling Entry Point:**
- Location: `src/app/global-error.tsx`
- Triggers: Unhandled errors during client-side execution
- Responsibilities: Capture error with Sentry, render default Next.js error page
- Output: Error page with logging to Sentry

**Instrumentation Entry Point:**
- Location: `src/instrumentation.ts`
- Triggers: Next.js server initialization (nodejs and edge runtimes)
- Responsibilities: Dynamic import of Sentry configuration based on runtime
- Output: Sentry initialized for error tracking

## Error Handling

**Strategy:** Multi-layer error handling with Sentry integration and graceful fallbacks

**Patterns:**

1. **Content Loading Errors:**
   - Server-side (`loadContentServer`): Throws error if JSON parse fails; Next.js will render error page
   - Client-side (`loadContent`): Logs to console, throws error (component should have suspense boundary)

2. **Scroll/Navigation Errors:**
   - `scrollToSection`: Tries Lenis, catches error and falls back to View Transitions, then native scroll
   - `scrollToTop`: Same fallback chain with try-catch blocks

3. **Animation/Library Import Errors:**
   - `SmoothScrollProvider`: Catches failed Lenis import, logs to console, removes lenis class from document
   - `CustomCursor`: Loaded dynamically with ssr: false to avoid SSR errors

4. **Browser API Errors:**
   - IntersectionObserver: Only initialized on client (checked with `isClient` state)
   - Lenis: Checked for existence before calling methods (`window.lenis?.scrollTo()`)
   - View Transitions: Checked for support before use (`supportsViewTransitions()`)

5. **Global Error Boundary:**
   - `global-error.tsx`: Catches all unhandled errors, logs to Sentry via `useEffect`, renders error page

## Cross-Cutting Concerns

**Logging:** Browser console (development only, no structured logging in production)

**Validation:** Type safety via TypeScript interfaces; no runtime validation on content

**Authentication:** Not applicable (public portfolio)

**Accessibility:**
- Keyboard navigation via arrow keys and number keys (`useKeyboardNavigation`)
- Respects `prefers-reduced-motion` (disables Lenis, animations; uses reduced durations)
- ARIA labels on all interactive elements and icons
- Focus management: skip-to-content link, proper tabindex attributes
- Semantic HTML: `<section>`, `<header>`, `<footer>`, `<main>`, `<nav>` elements
- Screen reader support: aria-hidden on decorative elements

**Responsive Design:**
- Breakpoints: mobile (< 768px), desktop (≥ 768px)
- Tailwind CSS with responsive prefixes (sm:, md:, lg:, xl:)
- Custom cursor disabled on mobile/touch devices
- Header animation intensity varies by viewport size

**Performance:**
- Code splitting: Sections imported dynamically with Next.js `dynamic()`
- Content caching: Client-side cache in `contentLoader.ts` prevents redundant fetches
- Font optimization: Google Fonts with `preload: true, display: "swap"`
- Image optimization: Critical assets prefetched in layout head
- CSS: Tailwind CSS 4 with optimized output
- RequestAnimationFrame: Lenis uses raf loop instead of scroll listeners

**SEO:**
- Metadata generation on server (`generateMetadata()`)
- OpenGraph and Twitter cards with images and descriptions
- Structured data (schema.org Person type) embedded as JSON-LD
- Sitemap generation via `sitemap.ts`
- Robots.txt via `robots.ts`
- Canonical URL set in metadata

---

*Architecture analysis: 2026-01-21*
