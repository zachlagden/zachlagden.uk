# Pitfalls Research

**Research Date:** 2026-01-21
**Focus:** Blog system with auth, MongoDB, comments, dark mode, and testing setup
**Confidence:** HIGH (verified with official documentation and multiple sources)

## Blog Pitfalls

### Rich Text Editor XSS Vulnerabilities
- **Risk:** User-submitted content containing malicious scripts can execute in visitors' browsers.
- **Warning signs:** Using raw HTML rendering without sanitization.
- **Prevention:**
  - Use DOMPurify or similar library to sanitize all HTML before rendering
  - Configure Content Security Policy headers
  - Use react-markdown instead of raw HTML rendering
- **Phase:** Blog Editor phase - implement sanitization from day one

### Tiptap Editor Bundle Size Bloat
- **Risk:** Rich text editors can significantly increase bundle size.
- **Warning signs:** Lighthouse performance scores dropping, large JavaScript bundles.
- **Prevention:**
  - Use dynamic imports to lazy load the editor only when needed
  - Only include extensions you actually use
  - Set `immediatelyRender: false` in useEditor hook
- **Phase:** Blog Editor phase - implement lazy loading from the start

### Tiptap SSR Hydration Errors
- **Risk:** Tiptap relies on browser APIs, causing hydration mismatches.
- **Warning signs:** "Hydration failed" console errors.
- **Prevention:**
  - Always set `immediatelyRender: false` in useEditor hook
  - Use `next/dynamic` with `ssr: false` for editor component
- **Phase:** Blog Editor phase - configure correctly from initial implementation

## Auth Pitfalls

### AUTH_SECRET Not Set for Production
- **Risk:** Auth.js will throw `MissingSecretError` in production without AUTH_SECRET.
- **Warning signs:** Works locally but fails in production.
- **Prevention:**
  - Generate strong secret with `openssl rand -base64 32`
  - Add AUTH_SECRET check to deployment checklist
- **Phase:** Authentication phase - validate before first deployment

### HTTPS Required for Secure Cookies
- **Risk:** Auth.js will not set secure cookies over HTTP.
- **Warning signs:** Login works locally but fails in production.
- **Prevention:**
  - Ensure AUTH_URL uses HTTPS in production
  - Test authentication flow on staging with HTTPS
- **Phase:** Infrastructure/Deployment phase - configure before auth goes live

### Client-Side Only Protection
- **Risk:** Hiding UI elements without server-side verification allows bypassing authorization.
- **Warning signs:** Protected routes accessible via direct URL.
- **Prevention:**
  - Always verify session on server or through middleware
  - Use Auth.js middleware for route protection
  - Check authentication in every API route handler
- **Phase:** Authentication phase - implement server checks first

### GitHub OAuth Callback URL Limitation
- **Risk:** GitHub only allows one callback URL per Client ID.
- **Warning signs:** OAuth works in one environment but fails in others.
- **Prevention:**
  - Create separate GitHub OAuth apps for each environment
  - Document environment-specific OAuth configuration
- **Phase:** Authentication phase - plan multi-environment setup early

## MongoDB Pitfalls

### Connection Pool Exhaustion in Serverless
- **Risk:** Without connection caching, you can exceed MongoDB Atlas connection limits.
- **Warning signs:** "Too many open connections" errors, intermittent timeouts.
- **Prevention:**
  - Cache database connections in global scope
  - Use the recommended MongoDB connection pattern for Next.js
  - Use `global._mongoClientPromise` pattern
- **Phase:** Database Setup phase - implement correct pattern from the start

### Slow Cold Start Connections
- **Risk:** MongoDB connections in serverless can take >1 second.
- **Warning signs:** First request to sleeping function is very slow.
- **Prevention:**
  - Reuse connections within warm function instances
  - Use MongoDB Atlas close to your serverless region
- **Phase:** Database Setup phase - monitor from initial deployment

### Closing Connections After Each Query
- **Risk:** Causes connection storms, slow responses.
- **Warning signs:** Very slow database operations.
- **Prevention:**
  - Never close connection after each query
  - Let MongoDB driver manage the connection pool
- **Phase:** Database Setup phase - verify connection handling in code review

## Comments Pitfalls

### No Authentication for Comments
- **Risk:** Unauthenticated comments enable bot spam.
- **Warning signs:** Flood of comments, spam content.
- **Prevention:**
  - Require authentication before commenting
  - Implement rate limiting per user
- **Phase:** Comments phase - require auth from initial implementation

### No Moderation Workflow
- **Risk:** Offensive content appears immediately.
- **Warning signs:** Offensive comments visible to all users.
- **Prevention:**
  - Add `approved` boolean field to comment schema
  - Implement moderation queue
- **Phase:** Comments phase - build moderation into initial schema design

### Unsafe Comment Rendering
- **Risk:** Rendering comment HTML without sanitization enables XSS attacks.
- **Warning signs:** Comments containing scripts.
- **Prevention:**
  - Sanitize all comment content before rendering
  - Consider Markdown only (no HTML) for comments
- **Phase:** Comments phase - implement sanitization from first comment

## Dark Mode Pitfalls

### Flash of Unstyled Content (FOUC)
- **Risk:** Page briefly displays light mode before switching to dark.
- **Warning signs:** Brief light flash on page load in dark mode.
- **Prevention:**
  - Add inline script in `<head>` to set theme class before paint
  - Use next-themes library with proper configuration
  - Add `suppressHydrationWarning` to `<html>` tag
- **Phase:** Dark Mode phase - test immediately on implementation

### Hydration Mismatch Errors
- **Risk:** Server renders one theme while client switches to another.
- **Warning signs:** Console warnings about hydration mismatch.
- **Prevention:**
  - Use "mounted" pattern - delay theme UI rendering until client mount
  - Add `suppressHydrationWarning` to `<html>` tag
- **Phase:** Dark Mode phase - implement mounted check pattern

### Tailwind 4 Dark Mode Configuration
- **Risk:** Tailwind 4 requires CSS-based configuration for dark mode.
- **Warning signs:** Theme toggle has no effect.
- **Prevention:**
  - Use `@custom-variant dark (&:is(.dark *))` in CSS
  - Don't expect tailwind.config.js darkMode option to work
- **Phase:** Dark Mode phase - configure at start of implementation

## Testing Pitfalls

### Async Server Components Not Testable with Vitest
- **Risk:** Vitest does not support testing async Server Components.
- **Warning signs:** Tests failing for async components.
- **Prevention:**
  - Use E2E tests (Playwright) for async Server Components
  - Reserve Vitest for Client Components and synchronous Server Components
- **Phase:** Testing Setup phase - plan test strategy around this limitation

### Jest/Vitest and Playwright Test Collision
- **Risk:** Running unit tests may accidentally include E2E tests.
- **Warning signs:** Tests failing with browser-related errors.
- **Prevention:**
  - Add E2E directory to `testPathIgnorePatterns`
  - Use separate npm scripts for unit vs E2E tests
- **Phase:** Testing Setup phase - configure exclusions from the start

### Not Running Production Build for E2E
- **Risk:** Testing against dev server may miss production-only issues.
- **Warning signs:** Tests pass locally but features broken in production.
- **Prevention:**
  - Run `pnpm build` and `pnpm start` before E2E tests
  - Use Playwright's webServer feature
- **Phase:** Testing Setup phase - configure production E2E from initial setup

## Integration Pitfalls

### Breaking Existing Smooth Scroll
- **Risk:** New features may conflict with existing Lenis smooth scrolling.
- **Warning signs:** Scroll behavior changing, navigation jumping.
- **Prevention:**
  - Test all new features with smooth scroll enabled
  - Ensure new components respect `prefers-reduced-motion`
- **Phase:** All phases - test integration with existing providers

### Breaking Existing Animation System
- **Risk:** New features may interfere with Framer Motion animations.
- **Warning signs:** Animations not playing, flickering.
- **Prevention:**
  - Maintain existing animation patterns in new components
  - Test animation sequences with new features
- **Phase:** All phases - verify animations remain smooth

### Bundle Size Growth
- **Risk:** Adding many dependencies increases bundle size significantly.
- **Warning signs:** Lighthouse scores dropping, slow page loads.
- **Prevention:**
  - Monitor bundle size with each feature addition
  - Use dynamic imports for heavy dependencies
  - Run bundle analyzer regularly
- **Phase:** All phases - track metrics throughout

## Sources

- [Auth.js MongoDB Adapter](https://authjs.dev/getting-started/adapters/mongodb)
- [NextAuth.js FAQ](https://next-auth.js.org/faq)
- [MongoDB Next.js Discussion](https://github.com/vercel/next.js/discussions/12229)
- [Next-themes GitHub](https://github.com/pacocoursey/next-themes)
- [Next.js Testing Guide](https://nextjs.org/docs/app/guides/testing)
- [Tiptap Next.js Integration](https://tiptap.dev/docs/editor/getting-started/install/nextjs)
