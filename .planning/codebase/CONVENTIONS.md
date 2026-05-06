# Coding Conventions

**Analysis Date:** 2026-05-06

## Tooling Configuration

**ESLint** (`eslint.config.mjs`):

```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
```

- Composes Next.js Core Web Vitals + TypeScript rule sets
- No project-specific overrides
- Run with `pnpm lint` (which calls `eslint .`, not `next lint`)

**Prettier** (`package.json`):
- Prettier 3.5.3 listed in `dependencies` (not `devDependencies` — minor inconsistency)
- **No Prettier config file** (`.prettierrc`, `prettier.config.*`, `.prettierignore`) exists
- Uses Prettier defaults: double quotes, 2-space indent, semicolons, 80-char width, trailing commas (`all`)
- Run with `pnpm format` / `pnpm format:check`

**TypeScript** (`tsconfig.json`):

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "strict": true,
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "isolatedModules": true,
    "paths": { "@/*": ["./src/*"] }
  }
}
```

- **Strict mode enabled** — `strict: true`
- `allowJs: true` (JS files allowed but none currently in `src/`)
- Path alias `@/*` → `./src/*` (used everywhere)
- No `noUncheckedIndexedAccess`, no `exactOptionalPropertyTypes`

## Naming Patterns

**Files:**
- React components: PascalCase `.tsx` — `Header.tsx`, `BlogPostCard.tsx`, `AnimatedText.tsx`
- Hooks: camelCase `.ts` with `use` prefix — `useKeyboardNavigation.ts`, `useSectionObserver.ts`, `useAutoSave.ts`, `useParallax.ts`
- Utilities: camelCase `.ts` — `contentLoader.ts`, `scrollUtils.ts`, `animationUtils.ts`, `presenceService.ts`, `viewTransition.ts`
- Lib/services: camelCase `.ts` — `auth.ts`, `auth-helpers.ts`, `blog.ts`, `mongodb.ts`, `upload.ts` (note: `auth-helpers.ts` uses kebab-case — only file in repo with this style)
- Type modules: camelCase `.ts` — `content.ts`, `blog.ts`, `presence.ts`; ambient declarations use `.d.ts` (`next-auth.d.ts`)
- Next.js conventions: lowercase `page.tsx`, `layout.tsx`, `route.ts`, `not-found.tsx`, `sitemap.ts`, `robots.ts`

**Functions:**
- camelCase — `loadContent`, `formatDateRange`, `scrollToSection`, `parseSpotifyData`, `slugify`, `getPublishedPosts`
- React components: PascalCase — `Header`, `BlogEditor`, `MobileMenu`
- Hooks: `use` prefix camelCase — `useKeyboardNavigation`, `useAutoSave`

**Variables:**
- camelCase for locals/state — `activeSection`, `mobileMenuOpen`, `prefersReducedMotion`, `introComplete`
- SCREAMING_SNAKE_CASE for module-level constants — `INTRO_WIDTH_RATIO`, `SCATTER_INTERVAL`, `SCATTER_SIZES`, `CHAR_INITIAL_DELAY`, `CHAR_STAGGER`, `PRESENCE_API_BASE`, `UPLOAD_DIR` (`src/components/layout/Header.tsx`, `src/components/ui/Section.tsx`, `src/utils/presenceService.ts`, `src/lib/upload.ts`)
- Refs follow pattern `<name>Ref` — `aboutRef`, `experienceRef`, `mainContentRef`, `h1Ref`, `abortControllerRef`, `intervalRef`

**Types/Interfaces:**
- PascalCase, prefer `interface` over `type` for object shapes — `ContentData`, `Personal`, `BlogPost`, `BlogPostInput`, `HomeClientProps`, `IntroPhase`
- Component prop interfaces named `<Component>Props` — `HeaderProps`, `AboutSectionProps`, `BlogEditorProps`, `SocialIconProps`
- Union literal types use `type` — `type IntroPhase = "loading" | "letters" | "fall" | "reveal" | "done";` (`src/components/layout/Header.tsx:18`)

**CSS classes (Tailwind):**
- Lowercase kebab-case Tailwind utilities exclusively
- Custom utility classes: kebab-case — `font-heading`, `font-mono-accent`, `intro-locked`, `loader-fade-out`, `markdown-content`, `section-content` (defined in `src/app/globals.css`)

## Code Style

**Formatting:**
- 2-space indent (Prettier default)
- Double quotes for strings — enforced by Prettier default
- Semicolons required — Prettier default
- Trailing commas everywhere (multi-line arrays, function args)
- Template literals for interpolated strings — `` `${prefix}${selected}${suffix}` ``

**Imports:**
- ES module syntax — `import`/`export`, no `require`
- `import React from "react"` typically used in `.tsx` files even though new JSX transform doesn't require it
- React hook imports destructured — `import React, { useState, useEffect, useCallback, useRef } from "react";`
- Type-only imports: bare `import type` used sparingly — only in `src/app/layout.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/next.config.ts`. Most files import types alongside values without `import type`.

**Const vs let:**
- `const` is the default everywhere; `let` only used when reassignment is genuinely needed (e.g., `let blogPosts` in `src/app/page.tsx:9`, `let nextIndex` in `src/hooks/useKeyboardNavigation.ts:44`)
- No `var` anywhere except the global declaration in `src/lib/mongodb.ts:8` (`var _mongoClientPromise: Promise<MongoClient> | undefined;` — required for `globalThis` typing)

## Import Organization

**Convention observed in `src/app/HomeClient.tsx`:**

```typescript
"use client";

// 1. React + framework
import React, { useState, useRef, useEffect, useCallback, ... } from "react";
import dynamic from "next/dynamic";
import Script from "next/script";

// 2. Third-party libs
import { Github, Linkedin, Instagram, Mail } from "lucide-react";
import { motion } from "framer-motion";

// 3. Components (with section comments)
// Components
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
// ...

// 4. Types
// Types
import { ContentData } from "@/types/content";
import { BlogPostSerialized } from "@/types/blog";

// 5. Hooks and Utils
// Hooks and Utils
import useSectionObserver from "@/hooks/useSectionObserver";
import { scrollToSection } from "@/utils/scrollUtils";
```

**Inconsistency:** Most other files don't use the `// Components` / `// Types` section comments — only `HomeClient.tsx` does. Smaller components mix all imports together without grouping.

**Path aliases:**
- Always prefer `@/...` for `src/`-rooted imports — `import Section from "@/components/ui/Section"`
- Relative imports (`../`) only used for sibling/parent components within the same domain — `src/components/sections/AboutSection.tsx:6` uses `import Section from "../ui/Section";`
- **Inconsistency:** `src/components/sections/AboutSection.tsx` uses relative `../ui/Section` while `src/components/ui/Section.tsx` uses `@/utils/animationUtils` — two different conventions appear in the same import graph

## TypeScript Usage

**Strict mode is on** (`tsconfig.json:7`). Runtime impact:

- All component props are typed via `interface FooProps { ... }`
- `forwardRef` always typed: `React.forwardRef<HTMLElement, AboutSectionProps>` (`src/components/sections/AboutSection.tsx:16`)
- Refs typed explicitly: `useRef<HTMLElement>(null) as React.RefObject<HTMLElement>` — the cast is repeated all over `src/app/HomeClient.tsx:134-149` (refs assertion is a code smell — see CONCERNS.md)
- Explicit return types are uncommon — most functions rely on TS inference. Exceptions: `formatDate(dateString: string): string` (`src/utils/contentLoader.ts:29`), `getScrollBehavior(): ScrollBehavior` (`src/utils/scrollUtils.ts:1`)
- `unknown` used over `any` where typing is hard — `Record<string, unknown>` in `src/lib/blog.ts:33` and `src/lib/blog.ts:99`
- Single `@ts-expect-error` exists at `src/components/ui/AnimatedText.tsx:94` for SplitType global script
- Type assertions via `as`: used liberally — `(profile as { login?: string })` (`src/lib/auth.ts:28`), `as unknown as BlogPost` (`src/lib/blog.ts:88`), `as React.MutableRefObject<HTMLElement | null>` (`src/components/ui/Section.tsx:75`)
- `null`/`undefined` distinction observed: optional fields use `?: string | null` for fields that may be explicitly null in JSON content (`src/types/content.ts:63`)

**Type definition organization:**
- Domain types live in `src/types/` — `content.ts`, `blog.ts`, `presence.ts`
- Ambient module augmentation in `src/types/next-auth.d.ts`
- `src/types/blog.ts` co-locates the `serializePost(post: BlogPost): BlogPostSerialized` helper with the types — minor convention break (mixes pure types with runtime code)

**Generic component pattern** (`src/components/ui/AnimatedText.tsx:49`):

```typescript
function AnimatedText<E extends ElementType = "div">({
  text, el, className = "", ...props
}: AnimatedTextProps<E>): JSX.Element { ... }
```

## Error Handling

**Patterns by layer:**

**Client utilities** — log + rethrow:

```typescript
// src/utils/contentLoader.ts:10
try {
  const response = await fetch("/content.json");
  if (!response.ok) throw new Error(`Failed to load content: ${response.statusText}`);
  // ...
} catch (error) {
  console.error("Error loading content:", error);
  throw error;
}
```

**Client UI components** — log + swallow (graceful degradation):

```typescript
// src/components/ui/CopyButton.tsx:24
try {
  await navigator.clipboard.writeText(textToCopy);
  setCopied(true);
} catch (err) {
  console.error("Failed to copy text: ", err);
}
```

**Server pages** — silent fallback to empty data:

```typescript
// src/app/page.tsx:9
let blogPosts: ReturnType<typeof serializePost>[] = [];
try {
  const posts = await getLatestPosts(3);
  blogPosts = posts.map(serializePost);
} catch {
  blogPosts = [];
}

// src/app/sitemap.ts:9
try {
  slugs = await getAllPublishedSlugs();
} catch {
  // MongoDB not available, skip blog URLs
}
```

**API routes** — manual status code returns:

```typescript
// src/app/api/blog/posts/route.ts:24
const session = await auth();
if (!session?.user?.isAdmin) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
}
```

**Inconsistencies:**
- API routes do **not** wrap handlers in `try/catch` — uncaught errors yield default 500s without structured error responses
- No central error logger — every error goes through `console.error` / `console.warn`. Sentry is the user's stated default but **not installed** (no `@sentry/*` packages in `package.json`)
- Mix of `throw error` (rethrow) vs silent swallow with no consistent rule

## Accessibility Patterns

**Skip-to-content link** (`src/app/HomeClient.tsx:273`):

```tsx
<a
  href="#about"
  className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-black"
  onClick={(e) => {
    e.preventDefault();
    mainContentRef.current?.focus();
    scrollToSection("about");
  }}
>
  Skip to main content
</a>
```

**ARIA usage:**
- `aria-label` on every interactive icon-only control — `src/components/ui/SocialIcon.tsx:37`, `src/components/auth/SignInButton.tsx:39`, `src/components/layout/MobileMenu.tsx:55`
- `aria-hidden="true"` on decorative icons — `<Github className="w-5 h-5" aria-hidden="true" />` (`src/app/HomeClient.tsx:330`)
- `aria-expanded`, `aria-controls` on disclosure buttons — `src/components/layout/MobileMenu.tsx:56-57`
- `role="navigation"` + `aria-label` on landmark regions — `src/app/HomeClient.tsx:313`
- `role="list"` for repeated content — `src/components/sections/ExperienceSection.tsx:27`

**Keyboard navigation** (`src/hooks/useKeyboardNavigation.ts`):
- Arrow up/down moves between sections
- Number keys 1-9 jump directly to numbered sections
- Skips when `document.activeElement` is `HTMLInputElement` or `HTMLTextAreaElement` to avoid hijacking form controls
- `?` key toggles help dialog (`src/components/ui/KeyboardIndicator.tsx:53`)
- Visible help dialog enumerates all shortcuts with `<kbd>` elements

**Focus styles:**
- Every interactive element has `focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2` — used 20+ times across components
- Keyboard-only skip link via `sr-only focus:not-sr-only` pattern

**Reduced motion (`prefers-reduced-motion`):**
- Detected via `window.matchMedia("(prefers-reduced-motion: reduce)").matches`
- Subscribed to via `useSyncExternalStore` for SSR-safety in `useParallax`, `AnimatedText`, `KeyboardIndicator`, `Header`
- Conditionally branches all animation durations: `duration: prefersReducedMotion ? 0.1 : 0.4` (`src/app/HomeClient.tsx:323`)
- Drives binary skip behavior in `Header.tsx:60-66` — full intro animation entirely skipped if reduced motion is preferred
- CustomCursor returns `null` when reduced motion is preferred (`src/components/ui/CustomCursor.tsx:111`)
- CSS reinforces the same — `@media (prefers-reduced-motion: no-preference)` gates all keyframes/transitions in `src/app/globals.css:43`, `:77`, `:86`

**Inconsistency:** `prefersReducedMotion` is sometimes a prop drilled from `HomeClient` and sometimes detected locally in the same component (e.g., `CustomCursor` detects locally even though `HomeClient` already has it).

## Component Prop Patterns

**Content-as-props** is the project's stated rule (per `CLAUDE.md`):

```typescript
// src/components/sections/AboutSection.tsx:10
interface AboutSectionProps {
  prefersReducedMotion: boolean;
  content: About;
  sectionIndex?: number;
}
```

- Components receive their slice of `ContentData` as `content` — never import or fetch JSON themselves
- Pattern is consistent across all `src/components/sections/*` and `src/components/layout/*`
- Type comes from `src/types/content.ts` — sections take a domain type (`About`, `Experience[]`, `Skills`, etc.) not the full `ContentData`

**Component declaration styles** (inconsistent — both forms appear):

1. **`React.FC<Props>` arrow function** (most UI components):

```typescript
// src/components/ui/SocialIcon.tsx:14
const SocialIcon: React.FC<SocialIconProps> = ({ href, icon, ... }) => { ... };
```

2. **`React.forwardRef<E, Props>`** (any component that needs ref forwarding):

```typescript
// src/components/sections/AboutSection.tsx:16
const AboutSection = React.forwardRef<HTMLElement, AboutSectionProps>(
  ({ prefersReducedMotion, content, sectionIndex }, ref) => { ... }
);
AboutSection.displayName = "AboutSection";
```

3. **`function default export`** (page-level / admin / blog components):

```typescript
// src/app/HomeClient.tsx:107
export default function HomeClient({ content, blogPosts = [] }: HomeClientProps) { ... }

// src/components/admin/BlogEditor.tsx:43
export default function BlogEditor({ post }: BlogEditorProps) { ... }
```

**Prop conventions:**
- Booleans default to `false`: `featured = false`, `disableParallax = false`, `once = true`
- Optional callbacks default to no-op or are checked before invocation
- `displayName` is set on every `forwardRef` — required by ESLint `react/display-name`
- Children typed as `React.ReactNode`
- Discriminated unions rare — most variant props are simple string literals like `size?: "sm" | "md"`

## Animation Conventions

**Framer Motion patterns:**

**Shared variants library** at `src/utils/animationUtils.ts` — defines `hoverAnimation`, `tapAnimation`, `fadeInAnimation`, `slideUpAnimation`, `staggerContainerAnimation`, `sectionAnimation`, `cardEntranceAnimation`, etc. Imported by `src/components/ui/Section.tsx:12`.

**Stagger pattern** (`src/components/sections/ContactSection.tsx:19`):

```typescript
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
```

**`whileInView` for scroll-triggered animations:**

```tsx
<motion.div
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: "-100px" }}
  variants={sectionAnimation}
>
```

- `viewport.once: true` everywhere — animations fire only once on first scroll into view
- `viewport.margin` typically `-50px` to `-100px` to delay trigger

**Duration ternary pattern** is universal:

```tsx
transition={{ duration: prefersReducedMotion ? 0.1 : 0.4, ease: "easeOut" }}
```

Reduced-motion duration is `0.1` (effectively instant) — never `0`.

**Easing values:**
- String easings: `"easeOut"`, `"easeInOut"` (most common)
- Custom cubic-bezier: `[0.22, 1, 0.36, 1]` for the intro fall (`src/components/layout/Header.tsx:280`)
- Spring presets: `{ type: "spring", damping: 30 }` (`src/components/layout/MobileMenu.tsx:70`), `{ type: "spring", mass: 0.1, stiffness: 700, damping: 30 }` (`src/components/ui/CustomCursor.tsx:124`)

**Scroll-driven animations** via `useScroll` + `useTransform` (`src/components/layout/Header.tsx:40-43`):

```typescript
const { scrollY } = useScroll();
const headerOpacity = useTransform(scrollY, [0, 300], [1, 0.3]);
```

**`useParallax` hook** (`src/hooks/useParallax.ts`) wraps Framer Motion's `useScroll`/`useTransform` with reduced-motion gating — returns zero offset when reduced motion is preferred.

**Split-Type integration** (`src/components/ui/AnimatedText.tsx`):
- SplitType is the `split-type` package listed in `dependencies`, but **the component loads it via external CDN script** (`https://unpkg.com/split-type@0.3.3/umd/index.min.js`) rather than importing it. The package version (`0.3.4`) doesn't even match the CDN URL (`0.3.3`). See CONCERNS.md.
- Splits text into characters via `new window.SplitType(textRef.current, { types: "words,chars", tagName: "span" })`
- Manually animates each char via `setTimeout` + inline styles — does not use Framer Motion for this
- Component is currently **not used anywhere** in the codebase — `grep` shows zero importers

**Intro animation pattern** (`src/components/layout/Header.tsx`):
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

```typescript
// src/utils/viewTransition.ts:1
/**
 * Utility for implementing the View Transitions API
 *
 * This provides a way to smoothly transition between UI states
 * with a fallback for browsers that don't support it.
 */
```

- Inline comments explain non-obvious logic — e.g., `src/components/ui/Section.tsx:98`:

```typescript
// Deterministic seed derived from section id — never changes between reloads
const sectionSeed = useMemo(...);
```

- Section-marker comments delimit groups within large files: `// State`, `// Refs for sections`, `// Components`, `// Hooks and Utils` (`src/app/HomeClient.tsx`)
- No TODO/FIXME/HACK/XXX comments present in `src/`

## Function Design

- Most utility functions are short (5-30 lines)
- Hooks bundle related state + effects together — `useSyncExternalStore` is the standard pattern for SSR-safe client-only detection
- React components frequently exceed the 300-line "small focused components" guidance from `~/.claude/instructions/tech-stack.md`:
  - `src/app/HomeClient.tsx` — 476 lines
  - `src/components/layout/Header.tsx` — 468 lines
  - `src/components/admin/BlogEditor.tsx` — 300 lines
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

Items where the codebase does not follow a single convention:

1. **Component declaration style** — three different forms (`React.FC`, `forwardRef`, `function`) appear without clear reason
2. **Import organization** — only `HomeClient.tsx` uses section comments; everywhere else mixes imports
3. **Path aliases** — `src/components/sections/AboutSection.tsx` uses relative `../ui/Section`, while sibling files use `@/components/...`
4. **`prefers-reduced-motion` source** — sometimes prop-drilled, sometimes detected locally in the same render tree
5. **`type` vs `interface`** — `interface` for object shapes is the rule, but file `src/components/layout/Header.tsx:18` uses `type` for a string-literal union (acceptable, but no documented rule)
6. **`auth-helpers.ts`** is the only kebab-case `.ts` file — every other lib file is camelCase
7. **Prettier** is in `dependencies` rather than `devDependencies`
8. **Sentry references** in user/global instructions but **not installed**; instrumentation files were recently deleted (`git status` shows `D instrumentation-client.ts`, `D sentry.edge.config.ts`, `D sentry.server.config.ts`)
9. **`split-type`** package is installed (v0.3.4) but `AnimatedText.tsx` loads v0.3.3 from CDN instead of importing the npm package
10. **`AnimatedText.tsx`** has zero importers — it's dead code
11. **Error handling** — no consistent pattern: rethrow, swallow + log, silent swallow with comment, and unwrapped (let it 500) all coexist
12. **Type module purity** — `src/types/blog.ts` mixes types with the `serializePost` function

---

*Convention analysis: 2026-05-06*
