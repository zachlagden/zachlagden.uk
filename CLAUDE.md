# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website for Zach Lagden built with Next.js, React, TypeScript, and Tailwind CSS. The site serves as a professional CV/resume showcasing skills, experience, education, and certifications.

## Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript 5
- **Styling**: Tailwind CSS 4, PostCSS
- **Animations**: Framer Motion, Split-Type, Lenis (smooth scrolling)
- **Forms**: Formspree
- **Monitoring**: Sentry
- **Analytics**: Google Analytics

## Common Commands

### Development

```bash
# Start the development server
pnpm dev

# Start development with Turbopack (faster refreshes)
pnpm devturbo
```

### Building & Deployment

```bash
# Generate a production build
pnpm build

# Start the production server
pnpm start
```

### Code Quality

```bash
# Run ESLint
pnpm lint

# Format code with Prettier
pnpm format
```

## Architecture Overview

The project follows a component-based architecture using Next.js App Router with dynamic content loading:

1. **App Structure**

   - `src/app`: Contains page components and layouts using Next.js App Router
   - Entry point is `src/app/page.tsx` with `src/app/layout.tsx` as the root layout
   - `src/app/HomeClient.tsx`: Main client-side component handling content loading and rendering

2. **Content Management**

   - `public/content.json`: Centralized content data file
   - `src/types/content.ts`: TypeScript interfaces for all content types
   - `src/utils/contentLoader.ts`: Client-side content loading utilities
   - `src/utils/serverContentLoader.ts`: Server-side content loading utilities

3. **Components Organization**

   - `src/components/layout`: Header, Footer, Navigation components (accept content props)
   - `src/components/sections`: Main content sections (About, Experience, Skills, etc.)
   - `src/components/ui`: Reusable UI components
   - `src/components/providers`: Context providers (e.g., SmoothScrollProvider)

4. **Custom Hooks**

   - `src/hooks/useKeyboardNavigation.ts`: Handles keyboard navigation for accessibility
   - `src/hooks/useSectionObserver.ts`: Tracks active sections during scrolling

5. **Utilities**

   - `src/utils/animationUtils.ts`: Animation-related utility functions
   - `src/utils/scrollUtils.ts`: Scroll handling utilities
   - `src/utils/viewTransition.ts`: Handles view transitions API with fallbacks

6. **Monitoring and Instrumentation**
   - Sentry integration via `sentry.*.config.ts` files
   - Instrumentation setup in `src/instrumentation.ts`

## Key Implementation Details

1. **Dynamic Content Loading**: Content is loaded from `public/content.json` on the client-side with TypeScript type safety.

2. **Component Props Pattern**: All components accept content as props rather than hardcoding data, enabling easy content updates.

3. **Smooth Scrolling**: Uses Lenis for smooth scrolling with a provider pattern and fallbacks for reduced motion preferences.

4. **Animations**: Implements progressive enhancement with Framer Motion and text animations via Split-Type.

5. **Accessibility**: Includes keyboard navigation support, proper ARIA attributes, and respects user preferences for reduced motion.

6. **SEO**: Implements comprehensive metadata with OpenGraph tags, structured data, and proper sitemap generation using dynamic content.

7. **Error Handling**: Uses Sentry for error tracking and monitoring with custom configuration.

## Development Approach

When modifying this codebase:

1. **Content Updates**: Modify `public/content.json` for content changes rather than editing components directly
2. **Type Safety**: Update `src/types/content.ts` when adding new content fields or structures
3. **Component Structure**: Maintain the component-based structure and separation of concerns
4. **Content Props**: Ensure components accept content as props and avoid hardcoding data
5. **Animations & Accessibility**: Follow existing patterns for animations, smooth scrolling, and accessibility
6. **Responsive Design**: Ensure UI components are responsive across all device sizes
7. **Testing**: Test thoroughly across different browsers and devices
8. **Progressive Enhancement**: Preserve accessibility features and progressive enhancement approach
