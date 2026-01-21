# Codebase Structure

**Analysis Date:** 2026-01-21

## Directory Layout

```
zachlagden.uk/
├── src/
│   ├── app/                    # Next.js App Router pages and layouts
│   │   ├── page.tsx            # Home page entry point (server component)
│   │   ├── layout.tsx          # Root layout with metadata, providers, fonts
│   │   ├── HomeClient.tsx      # Main client component for interactive features
│   │   ├── global-error.tsx    # Global error boundary with Sentry integration
│   │   ├── not-found.tsx       # 404 page
│   │   ├── robots.ts           # robots.txt generator
│   │   ├── sitemap.ts          # sitemap.xml generator
│   │   └── globals.css         # Global styles and Tailwind directives
│   ├── components/
│   │   ├── layout/             # Page layout components (header, nav, footer)
│   │   │   ├── Header.tsx      # Hero section with name, title, contact info
│   │   │   ├── Navigation.tsx  # Fixed top nav with section links
│   │   │   ├── Footer.tsx      # Footer with links and copyright
│   │   │   └── MobileMenu.tsx  # Mobile hamburger menu drawer
│   │   ├── sections/           # Content sections (dynamically imported)
│   │   │   ├── AboutSection.tsx
│   │   │   ├── ExperienceSection.tsx
│   │   │   ├── EducationSection.tsx
│   │   │   ├── SkillsSection.tsx
│   │   │   ├── CertificationsSection.tsx
│   │   │   └── ContactSection.tsx
│   │   ├── ui/                 # Reusable UI components
│   │   │   ├── Section.tsx     # Section wrapper with animations
│   │   │   ├── AnimatedText.tsx
│   │   │   ├── TimelineItem.tsx
│   │   │   ├── AboutCard.tsx
│   │   │   ├── SkillCategory.tsx
│   │   │   ├── SocialIcon.tsx
│   │   │   ├── CopyButton.tsx
│   │   │   ├── ScrollToTopButton.tsx
│   │   │   ├── KeyboardIndicator.tsx
│   │   │   ├── PresenceStatus.tsx
│   │   │   ├── CustomCursor.tsx
│   │   │   ├── GlobalBackground.tsx
│   │   │   ├── NoiseTexture.tsx
│   │   │   ├── ScrollProgress.tsx
│   │   │   ├── VSCodeDisplay.tsx
│   │   │   ├── SpotifyDisplay.tsx
│   │   │   ├── CertificationItem.tsx
│   │   │   └── NavItem.tsx
│   │   └── providers/          # React context providers
│   │       └── SmoothScrollProvider.tsx
│   ├── hooks/                  # Custom React hooks
│   │   ├── useSectionObserver.ts
│   │   └── useKeyboardNavigation.ts
│   ├── types/                  # TypeScript type definitions
│   │   ├── content.ts          # ContentData and all content types
│   │   └── presence.ts         # Presence/status types
│   ├── utils/                  # Utility functions
│   │   ├── contentLoader.ts    # Client-side content fetch with cache
│   │   ├── serverContentLoader.ts  # Server-side content file read
│   │   ├── scrollUtils.ts      # Scroll helpers with Lenis/View Transitions
│   │   ├── animationUtils.ts   # Framer Motion animation variants
│   │   ├── viewTransition.ts   # View Transitions API wrapper
│   │   └── presenceService.ts  # External presence detection
│   └── instrumentation.ts      # Sentry initialization entry point
├── public/
│   ├── content.json            # Centralized content data (all text, links, metadata)
│   ├── og-image.png            # OpenGraph image
│   ├── twitter-image.png       # Twitter card image
│   ├── android-chrome-*.png    # PWA icons
│   ├── apple-touch-icon.png    # iOS bookmark icon
│   ├── favicon.ico             # Favicon
│   └── site.webmanifest        # PWA manifest
├── .planning/
│   └── codebase/               # Architecture documentation
├── next.config.ts             # Next.js configuration
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── postcss.config.ts          # PostCSS configuration
├── package.json               # Dependencies and scripts
└── pnpm-lock.yaml             # Locked dependencies (pnpm)
```

## Directory Purposes

**src/app:**
- Purpose: Next.js App Router - contains page routes, layouts, and error boundaries
- Contains: Server components (page.tsx, layout.tsx), client error boundary, static file generators, global styles
- Key files: `page.tsx` (server entry), `layout.tsx` (root layout with metadata), `HomeClient.tsx` (client orchestration), `global-error.tsx` (error boundary)

**src/components:**
- Purpose: React component organization by layer (layout, sections, ui, providers)
- Contains: All visual and interactive components organized by responsibility
- Key files: Layout components render fixed page structure; section components render content from `content.json`; UI components are reusable building blocks

**src/components/layout:**
- Purpose: Page structure components rendered once per page
- Contains: Header (hero), Navigation (top nav), Footer, MobileMenu
- Pattern: All accept content as props; render in specific DOM locations (header fullscreen, nav fixed top, footer bottom, menu fixed overlay)

**src/components/sections:**
- Purpose: Major content sections that display portfolio information
- Contains: 6 section components (About, Experience, Education, Skills, Certifications, Contact)
- Pattern: Each section imported dynamically in `HomeClient.tsx` with Suspense boundary; uses `forwardRef` to expose DOM element for scroll tracking; wrapped by `Section.tsx` UI component

**src/components/ui:**
- Purpose: Reusable atomic and composite UI components
- Contains: 17 UI component files for cards, buttons, icons, animations, backgrounds
- Pattern: Stateless components that accept props; some are reusable primitives (SocialIcon, CopyButton), others are specialized (TimelineItem, SkillCategory)

**src/components/providers:**
- Purpose: Context providers for global browser feature management
- Contains: `SmoothScrollProvider` for Lenis initialization and browser capability detection
- Pattern: Wraps children and handles client-side initialization (dynamic imports, media query listeners)

**src/hooks:**
- Purpose: Encapsulate reusable client-side logic
- Contains: `useSectionObserver` (IntersectionObserver for scroll tracking), `useKeyboardNavigation` (keyboard shortcut handler)
- Pattern: Both hooks manage client-side initialization checks (`isClient` state) to avoid SSR mismatches

**src/types:**
- Purpose: TypeScript interface definitions for type safety
- Contains: `content.ts` (complete content schema), `presence.ts` (status/presence types)
- Key file: `content.ts` defines ContentData with nested interfaces for each content section

**src/utils:**
- Purpose: Pure utility functions and helpers
- Contains: Content loaders (server and client), scroll helpers, animation variants, View Transitions wrapper, presence service
- Key files: `contentLoader.ts` (client cache), `serverContentLoader.ts` (server read), `scrollUtils.ts` (progressive scroll fallbacks), `animationUtils.ts` (animation variants)

**public:**
- Purpose: Static assets and content data
- Contains: `content.json` (single source of truth for all text/links/metadata), images (OpenGraph, Twitter, PWA icons), favicon, manifest
- Key file: `content.json` (centralized content - modify this for content updates)

**.planning/codebase:**
- Purpose: Architecture and structure documentation for development guidance
- Contains: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, CONCERNS.md

## Key File Locations

**Entry Points:**
- `src/app/page.tsx`: Server-side page entry point; calls server content loader, renders HomeClient
- `src/app/HomeClient.tsx`: Client-side main component; initializes all state, refs, hooks; orchestrates rendering
- `src/app/layout.tsx`: Root layout; generates metadata, sets up providers, loads fonts
- `src/instrumentation.ts`: Sentry initialization entry point (called by Next.js)

**Configuration:**
- `next.config.ts`: Next.js configuration (Sentry integration, redirects, etc.)
- `tsconfig.json`: TypeScript with path aliases (`@/*` → `src/*`)
- `tailwind.config.ts`: Tailwind CSS customization
- `postcss.config.ts`: PostCSS plugins (Tailwind)
- `package.json`: Dependencies (Next.js 15, React 19, Framer Motion, Lenis, Sentry, etc.)

**Core Logic:**
- `src/utils/serverContentLoader.ts`: Server-side read of `public/content.json`
- `src/utils/contentLoader.ts`: Client-side fetch and cache of `public/content.json`
- `src/types/content.ts`: TypeScript interfaces for all content types
- `src/hooks/useSectionObserver.ts`: IntersectionObserver hook for scroll tracking
- `src/hooks/useKeyboardNavigation.ts`: Keyboard navigation hook

**Animations & Effects:**
- `src/utils/animationUtils.ts`: Framer Motion animation variants
- `src/utils/scrollUtils.ts`: Scroll with Lenis/View Transitions fallback chain
- `src/utils/viewTransition.ts`: View Transitions API feature detection and wrapper
- `src/components/ui/AnimatedText.tsx`: Split-Type text animation component
- `src/components/ui/Section.tsx`: Section wrapper with animations and View Transitions

**Testing:**
- No dedicated test files in src/ (see TESTING.md)

## Naming Conventions

**Files:**
- PascalCase for component files: `AboutSection.tsx`, `SocialIcon.tsx`, `Section.tsx`
- camelCase for utility files: `contentLoader.ts`, `scrollUtils.ts`, `animationUtils.ts`
- camelCase for hook files: `useSectionObserver.ts`, `useKeyboardNavigation.ts`
- lowercase for type files: `content.ts`, `presence.ts`

**Directories:**
- lowercase plural for organizing components by type: `components/`, `sections/`, `ui/`, `hooks/`, `utils/`, `types/`
- `layout/`, `sections/`, `ui/`, `providers/` within components/

**Components:**
- PascalCase component names matching file names: `export default function AboutSection() {}`
- Section components use `React.forwardRef` pattern: `const AboutSection = React.forwardRef<HTMLElement, Props>((props, ref) => {})`
- All component files include `export default` for the main export
- `displayName` set for forwardRef components for better debugging

**Functions & Variables:**
- camelCase for functions: `loadContent()`, `scrollToSection()`, `formatDate()`
- camelCase for variables and props: `activeSection`, `prefersReducedMotion`, `contentData`
- UPPERCASE for constants: Not commonly used; animation variants use camelCase objects
- Boolean props prefixed with `is`, `should`, `has`, `prefers`: `isClient`, `prefersReducedMotion`, `isMobile`, `hasScroll`

**Types & Interfaces:**
- PascalCase for type names: `ContentData`, `About`, `Experience`, `Education`, `Skills`
- PascalCase for interface names: `HeaderProps`, `AboutSectionProps`, `UseSectionObserverProps`
- Props interfaces typically named `ComponentNameProps`: `AboutSectionProps`, `SmoothScrollProviderProps`

**CSS Classes:**
- Tailwind utility classes: `py-16 md:py-24`, `scroll-mt-24`, `animate-pulse`
- Custom CSS classes in `globals.css` use kebab-case: `.lenis-smooth-scroll`
- aria-hidden attribute for decorative elements

## Where to Add New Code

**New Feature (Content Update):**
- Primary content: Modify `public/content.json` directly (add/edit data)
- Type safety: Update `src/types/content.ts` if adding new content fields
- Component: If new section needed, create in `src/components/sections/NewSection.tsx`
- Import: Add dynamic import in `src/app/HomeClient.tsx` with Suspense boundary

**New Component/Module:**
- Simple UI component: `src/components/ui/ComponentName.tsx`
- Layout component: `src/components/layout/ComponentName.tsx`
- Section component: `src/components/sections/SectionName.tsx`
- Provider: `src/components/providers/ProviderName.tsx`
- Pattern: Export default, use forwardRef if needs DOM ref access, accept content as props

**New Utility Function:**
- Helper function: `src/utils/utilityName.ts`
- Animation variants: Add to `src/utils/animationUtils.ts`
- Scroll behavior: Add to `src/utils/scrollUtils.ts`
- Pattern: Export named functions, pure functions without side effects

**New Hook:**
- Custom hook: `src/utils/useHookName.ts` (or `src/hooks/useHookName.ts`)
- Pattern: Start with `use` prefix, include `isClient` check to handle SSR, handle cleanup in useEffect return

**New Type:**
- Add to `src/types/content.ts` if content-related
- Add to `src/types/presence.ts` if presence-related
- Create new file if large/specialized type group

## Special Directories

**src/app:**
- Purpose: Next.js App Router entry points
- Generated: No (manually created)
- Committed: Yes

**public:**
- Purpose: Static assets and content data
- Generated: No (manually managed)
- Committed: Yes, including `content.json` (centralized content source)
- Note: This is where you update content - modify `public/content.json` directly

**public/content.json:**
- Purpose: Single source of truth for all portfolio content
- Structure: ContentData interface with metadata, personal, navigation, about, experience, education, skills, certifications, contact, footer
- How to modify: Edit JSON directly, properties map to component content props
- Reload: Browser will fetch updated file (with cache busting via development)

**.next:**
- Purpose: Build output directory
- Generated: Yes (by `pnpm build`)
- Committed: No

**node_modules:**
- Purpose: Installed dependencies
- Generated: Yes (by `pnpm install`)
- Committed: No

**.planning/codebase:**
- Purpose: Architecture documentation for development
- Generated: No (manually created by gsd mapper)
- Committed: Yes

## Path Aliases

TypeScript path alias configured in `tsconfig.json`:
- `@/*` → `src/*`

This allows imports like:
```typescript
import Section from "@/components/ui/Section"
import { scrollToSection } from "@/utils/scrollUtils"
import { ContentData } from "@/types/content"
```

Instead of relative paths like `../../../utils/scrollUtils`

---

*Structure analysis: 2026-01-21*
