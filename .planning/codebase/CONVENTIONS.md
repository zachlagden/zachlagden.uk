# Coding Conventions

**Analysis Date:** 2026-01-21

## Naming Patterns

**Files:**
- Components: PascalCase with `.tsx` extension (e.g., `TimelineItem.tsx`, `AnimatedText.tsx`)
- Utilities: camelCase with `.ts` extension (e.g., `contentLoader.ts`, `scrollUtils.ts`)
- Hooks: camelCase starting with `use` prefix (e.g., `useSectionObserver.ts`, `useKeyboardNavigation.ts`)
- Types: PascalCase in `types/` directory (e.g., `content.ts` contains `ContentData`, `Experience`, etc.)
- Configuration: lowercase with dots (e.g., `eslint.config.mjs`, `next.config.ts`)

**Functions:**
- Utility functions: camelCase (e.g., `loadContent()`, `formatDate()`, `scrollToSection()`)
- Custom hooks: Start with `use` prefix in camelCase (e.g., `useSectionObserver`, `useKeyboardNavigation`)
- Component functions: PascalCase (e.g., `AnimatedText`, `TimelineItem`)
- Event handlers: `handle` prefix in camelCase (e.g., `handleCopy`, `handleKeyDown`, `handleReducedMotionChange`)
- Helper/check functions: Descriptive names with verb-first (e.g., `checkPrefersReducedMotion()`, `supportsViewTransitions()`)

**Variables:**
- State variables: camelCase (e.g., `isClient`, `isSplitTypeLoaded`, `prefersReducedMotion`)
- Boolean variables: prefixed with `is`, `has`, `can`, `should` (e.g., `isInView`, `isTouchDevice`, `hasElement`)
- Regular variables: camelCase (e.g., `contentCache`, `lenisInstance`, `animationId`)
- Object destructuring: Used for cleaner prop extraction

**Types:**
- Interface names: PascalCase with `Props` suffix for component props (e.g., `CopyButtonProps`, `SkillCategoryProps`)
- Interface names for models: PascalCase plural or singular (e.g., `Experience`, `Education`, `Certification`)
- Generic types: Descriptive PascalCase (e.g., `AnimatedTextProps<E extends ElementType>`)
- Union types: Used with `|` operator for options (e.g., `"sm" | "md"`)

## Code Style

**Formatting:**
- Prettier v3.5.3 is used for code formatting
- Format command: `pnpm format` (writes formatted code)
- Format check: `pnpm format:check` (validates formatting without changes)
- No explicit Prettier config file; uses Prettier defaults
- Run before committing to ensure consistency

**Linting:**
- ESLint v9.29.0 with flat config system
- Config file: `eslint.config.mjs`
- Extends: `"next/core-web-vitals"` and `"next/typescript"`
- Lint command: `pnpm lint`
- Configuration includes React hooks plugin for custom hook validation

**TypeScript:**
- Strict mode enabled: `"strict": true`
- No emit: `"noEmit": true` (Next.js handles compilation)
- Target: ES2017
- Module resolution: bundler
- JSX: preserve (Next.js handles JSX)
- Isolated modules: enabled
- tsconfig.json located at root

## Import Organization

**Order:**
1. External/third-party imports (React, Next.js, libraries)
2. Type imports from external packages
3. Absolute imports using path aliases (`@/`)
4. Relative imports for local files

**Examples:**
```typescript
// External libraries first
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Script from "next/script";

// Third-party UI components/icons
import { Copy, Check } from "lucide-react";

// Type imports
import type { Metadata } from "next";

// Absolute imports for project code
import { ContentData } from "@/types/content";
import { scrollToSection } from "@/utils/scrollUtils";

// Components
import Header from "@/components/layout/Header";
```

**Path Aliases:**
- `@/*` → `./src/*` (configured in tsconfig.json)
- Used consistently across all modules for cleaner imports
- Enables easy file relocation without changing imports

## Error Handling

**Patterns:**
- Try-catch blocks used for async operations and API calls
- Error logging via `console.error()` with context-specific messages
- Graceful fallbacks implemented for browser APIs
- Explicit null/undefined checks before accessing properties
- Type guards used to narrow types (e.g., `entry.isIntersecting`)

**Examples:**
```typescript
// From contentLoader.ts
catch (error) {
  console.error("Error loading content:", error);
  throw error;
}

// From scrollUtils.ts - fallback pattern
try {
  window.lenis.scrollTo(element, { ... });
  return;
} catch {
  console.warn("Lenis scroll failed, falling back to default");
}

// From AnimatedText.tsx - error handling in effect cleanup
catch (error) {
  console.error("Error initializing SplitType:", error);
}

// From SmoothScrollProvider.tsx - async error handling
.catch((err) => {
  console.error("Failed to load Lenis:", err);
  document.documentElement.classList.remove("lenis-smooth-scroll");
});
```

**Feature Detection:**
- Browser capabilities checked before use (e.g., `window.lenis`, `window.SplitType`)
- User preferences respected (e.g., `prefers-reduced-motion` media query)
- Graceful degradation with fallbacks for missing APIs

## Logging

**Framework:** `console` (native browser APIs)

**Patterns:**
- `console.error()` for errors and failures
- `console.warn()` for degradation warnings (fallback activation)
- No systematic logging for successful operations
- Contextual messages that include what failed and why

**When to Log:**
- Component initialization errors
- Async operation failures
- API/fetch errors with response status
- Feature detection/fallback activation
- Animation/transition failures

## Comments

**When to Comment:**
- Complex algorithms or non-obvious logic
- Browser API compatibility notes
- Accessibility considerations
- Performance-critical sections
- TODO/FIXME items for future improvements
- Inline explanations for type assertions or workarounds

**JSDoc/TSDoc:**
- Used selectively for public functions and custom hooks
- Documents purpose, parameters, and return values
- Example from `useSectionObserver.ts`:
```typescript
/**
 * Custom hook to observe sections and update active section based on scroll position
 */
const useSectionObserver = ({ ... }) => { ... };
```
- Example from `viewTransition.ts`:
```typescript
/**
 * Checks if the browser supports the View Transitions API
 */
export const supportsViewTransitions = (): boolean => { ... };
```

## Function Design

**Size:** Typically 20-80 lines for component functions, 10-30 lines for utilities
- Aim for single responsibility
- Break down complex logic into helper functions
- Use effect hooks to separate concerns in components

**Parameters:**
- Props passed as destructured objects in components
- Interfaces defined for prop types
- Optional props marked with `?` in interfaces
- Default values provided using ES6 default parameters

**Examples:**
```typescript
// Component with destructured props and interface
const TimelineItem: React.FC<TimelineItemProps> = ({
  title,
  company,
  companyLink,
  date,
  location,
  children,
}) => { ... };

// Utility with optional parameters
export function formatDateRange(
  startDate: string,
  endDate?: string | null,
): string { ... }

// Hook with parameter interface
const useSectionObserver = ({
  sectionRefs,
  setActiveSection,
}: UseSectionObserverProps) => { ... };
```

**Return Values:**
- Explicit return types declared in TypeScript
- Components return `JSX.Element` or `React.ReactNode`
- Utilities return specific types or `void`
- Hooks return nothing (void) or effect cleanup functions

## Module Design

**Exports:**
- Named exports for utilities: `export function loadContent()`, `export const formatDate()`
- Default export for components: `export default TimelineItem`
- Mixed exports for providers and hooks: default export for the main function/component

**Barrel Files:**
- Not used in this codebase
- Each component/utility imported directly from its specific file

**Organization by Layer:**
- `src/components/` - UI components (layout, sections, ui)
- `src/hooks/` - Custom React hooks
- `src/utils/` - Utility functions and helpers
- `src/types/` - TypeScript interfaces and types
- `src/app/` - Next.js App Router pages and layouts

## Client/Server Boundaries

**Client Components:**
- Marked with `"use client"` directive at the top of file
- Used for interactivity, state, event listeners
- Examples: `AnimatedText.tsx`, `CopyButton.tsx`, `TimelineItem.tsx`, `SmoothScrollProvider.tsx`

**Server Components:**
- No directive needed (default in App Router)
- Used for data loading and SEO
- Example: `src/app/page.tsx` loads content server-side

**Server-to-Client Data Flow:**
- Server components fetch data and pass props to client components
- Keeps data fetching on server, rendering/interactivity on client
- Example pattern: `page.tsx` → `HomeClient.tsx`

---

*Convention analysis: 2026-01-21*
