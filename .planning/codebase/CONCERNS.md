# Codebase Concerns

**Analysis Date:** 2026-01-21

## Tech Debt

**HomeClient Component Size:**
- Issue: The main client component at `src/app/HomeClient.tsx` is 407 lines, handling state management, device detection, keyboard navigation setup, event listeners, and multiple section refs in a single file. This creates a maintenance burden and makes testing difficult.
- Files: `src/app/HomeClient.tsx`
- Impact: Difficult to test individual concerns, increased risk of introducing bugs during modifications, harder to reason about component lifecycle.
- Fix approach: Extract device detection, keyboard navigation setup, and scroll handling into custom hooks. Consider creating a separate context provider for device state to reduce prop drilling.

**Content Loader Separation:**
- Issue: Two separate content loader implementations (`src/utils/contentLoader.ts` for client, `src/utils/serverContentLoader.ts` for server) maintain duplicate logic. Server loader uses JSON parsing without error handling.
- Files: `src/utils/contentLoader.ts`, `src/utils/serverContentLoader.ts`
- Impact: Inconsistent error handling between server and client, difficult to maintain two versions, potential for sync bugs when content schema changes.
- Fix approach: Create a unified content schema validation layer, add try-catch in serverContentLoader.ts, consider using a shared validation library like Zod.

**Dynamic Import Loading States:**
- Issue: All dynamically imported sections in `src/app/HomeClient.tsx` (lines 31-79) use identical placeholder loading UI with hardcoded dimensions. Changes to loading state styling must be updated in 5 places.
- Files: `src/app/HomeClient.tsx` (lines 31-79)
- Impact: Duplicate code, hard to maintain consistent UX, loading states may not accurately reflect actual content dimensions.
- Fix approach: Extract loading skeleton into a reusable SectionSkeleton component, use it across all dynamic imports.

**Presence API Polling:**
- Issue: The PresenceStatus component polls Discord API every 5 seconds (line 81 in `src/components/ui/PresenceStatus.tsx`), regardless of visibility or whether user is viewing the page. No throttling or backoff strategy for API failures.
- Files: `src/components/ui/PresenceStatus.tsx`, `src/components/ui/SpotifyDisplay.tsx`, `src/components/ui/VSCodeDisplay.tsx`
- Impact: Potential performance degradation, unnecessary network requests when tab is not visible, possible API rate limiting issues, battery drain on mobile devices.
- Fix approach: Implement visibility detection (Page Visibility API), add exponential backoff on API errors, consider using useEffect dependency array more carefully to avoid redundant refetches.

**Multiple Global Event Listeners Without Cleanup Verification:**
- Issue: Multiple components register event listeners on window and document (CustomCursor, KeyboardIndicator, HomeClient, KeyboardNavigation, etc.) but cleanup depends on correct dependency arrays in useEffect.
- Files: `src/app/HomeClient.tsx` (lines 150-151, 183), `src/components/ui/CustomCursor.tsx` (lines 59-74), `src/components/ui/KeyboardIndicator.tsx` (line 62), `src/hooks/useKeyboardNavigation.ts` (line 65)
- Impact: Memory leaks possible if dependencies are missed, multiple listeners for same events, potential performance degradation on long sessions.
- Fix approach: Create a custom hook useWindowEventListener that handles cleanup automatically, audit all event listener dependencies.

## Known Bugs

**CustomCursor Motion Tracking Lag:**
- Symptoms: Custom cursor may appear to lag or jitter on slower devices due to high-frequency mousemove updates triggering state changes and re-renders.
- Files: `src/components/ui/CustomCursor.tsx` (lines 53-55)
- Trigger: Moving mouse quickly on devices with lower refresh rates or high CPU load.
- Workaround: Component is already disabled on touch devices and respects reduced motion preference. Consider throttling mousemove handler with requestAnimationFrame.

**Presence API Timezone Issues:**
- Symptoms: Spotify track progress calculation may show incorrect elapsed time if client timezone differs significantly from server.
- Files: `src/utils/presenceService.ts` (lines 39-46), `src/components/ui/SpotifyDisplay.tsx` (lines 25-33)
- Trigger: When Spotify API returns timestamps in different timezone than client browser.
- Workaround: Use relative time calculations instead of absolute timestamps. All startTime and endTime should be UTC-normalized.

**Contact Form Lacks Loading Indication:**
- Symptoms: User cannot easily distinguish between processing and idle state beyond disabled button. No error message if form submission fails.
- Files: `src/components/sections/ContactSection.tsx` (lines 144-157)
- Trigger: When clicking Send Message button with slow network.
- Workaround: Button shows "Processing" text but no visual loading indicator (spinner or loader).

**Keyboard Navigation When Active Section Not Found:**
- Symptoms: Arrow key navigation may silently fail if activeSection is not in sectionIds array.
- Files: `src/hooks/useKeyboardNavigation.ts` (line 41)
- Trigger: If navigation data doesn't match section refs, or if a section is dynamically removed.
- Workaround: Add bounds checking for currentIndex before navigation.

## Security Considerations

**Content JSON Injection:**
- Risk: `public/content.json` is user-modifiable and contains URLs, social links, and text that gets rendered. If content is ever served from an API or user-controlled source, XSS becomes possible.
- Files: `src/utils/serverContentLoader.ts`, `src/utils/contentLoader.ts`, `public/content.json`
- Current mitigation: File is static and co-located, no user input path.
- Recommendations: Add schema validation with Zod on load, sanitize URLs before rendering links, consider CSP headers to restrict script execution.

**Structured Data JSON Encoding:**
- Risk: Inline JSON-LD on line 241 of `src/app/HomeClient.tsx` injects serialized data, but JSON.stringify is used which is safe. However, if content data ever contains user input, this is a vulnerability vector.
- Files: `src/app/HomeClient.tsx` (line 241)
- Current mitigation: Content is currently static JSON file, JSON.stringify is used (which is safe).
- Recommendations: Add a content validation schema, ensure any future user-generated content is properly escaped before serialization.

**Presence API Endpoint Hardcoding:**
- Risk: API endpoint URL is hardcoded as `https://api.lagden.dev/v1/watcher` (line 9 in `src/utils/presenceService.ts`). No authentication or CORS validation.
- Files: `src/utils/presenceService.ts` (line 9)
- Current mitigation: Request is read-only for Discord presence data.
- Recommendations: Move endpoint to environment variable, add request signing if API supports it, validate response structure.

**Environment Variables Not Validated:**
- Risk: `NEXT_PUBLIC_DISCORD_USER_ID` and `NEXT_PUBLIC_*` variables are accessed without validation. If missing, component silently fails to render.
- Files: `src/components/ui/PresenceStatus.tsx` (line 30)
- Current mitigation: Component gracefully returns null if ID is missing.
- Recommendations: Add startup validation that warns if required env vars are missing, create a `.env.example` file.

## Performance Bottlenecks

**Large Component Bundle Import:**
- Problem: All dynamically imported sections still get included in bundle during build. No clear code splitting boundary.
- Files: `src/app/HomeClient.tsx` (lines 31-79)
- Cause: Next.js dynamic imports with ssr: true may not reduce bundle as much as expected.
- Improvement path: Verify actual bundle size with next/bundle-analyzer, consider lazy loading more aggressively, measure Core Web Vitals impact.

**Frequent Re-renders from Motion Components:**
- Problem: Framer Motion animations trigger re-renders on every animation frame, even for non-critical animations.
- Files: `src/components/ui/CustomCursor.tsx`, `src/components/ui/PresenceStatus.tsx`, `src/components/sections/ContactSection.tsx`
- Cause: Motion components with high-frequency state updates (especially CustomCursor with mousemove events).
- Improvement path: Profile with React DevTools, consider using skipAnimationInitially for below-fold content, use will-change CSS sparingly.

**Lenis Smooth Scrolling Overhead:**
- Problem: Lenis library adds requestAnimationFrame loop even when Smooth Scroll Provider is only used for provider context.
- Files: `src/components/providers/SmoothScrollProvider.tsx` (lines 84-151)
- Cause: Dynamic import and RAF loop runs on all browsers that support smooth scrolling.
- Improvement path: Profile Largest Contentful Paint (LCP) and First Input Delay (FID), consider disabling Lenis on low-end devices, verify performance impact on mobile.

**Content JSON Size Growth:**
- Problem: `public/content.json` is 330 lines and loaded on every client pageload (not cached in contentLoader). As portfolio content grows, this becomes heavier.
- Files: `src/utils/contentLoader.ts` (line 11), `public/content.json`
- Cause: Full content object loaded even if only some sections are needed.
- Improvement path: Implement aggressive client-side caching with versioning, add cache busting headers, consider splitting content into multiple JSON files.

## Fragile Areas

**Device Detection Initialization:**
- Files: `src/app/HomeClient.tsx` (lines 125-160)
- Why fragile: Device detection runs in multiple places (HomeClient, CustomCursor, SmoothScrollProvider, KeyboardIndicator) independently, leading to potential state mismatches.
- Safe modification: Create a single useDeviceDetection hook that all components consume from context.
- Test coverage: No unit tests verify device detection works correctly across all components.

**Section Observer Dependency Management:**
- Files: `src/hooks/useSectionObserver.ts` (lines 26-66)
- Why fragile: IntersectionObserver threshold array (line 51) has 11 values which may cause excessive callback triggers. Changes to margins or thresholds need manual synchronization with HomeClient setup (line 84 in HomeClient).
- Safe modification: Document the intersection thresholds, add unit tests verifying observer fires only when expected.
- Test coverage: No tests verify section observer detects correct active section during scroll.

**Presence API Response Parsing:**
- Files: `src/utils/presenceService.ts` (lines 52-58), `src/components/ui/PresenceStatus.tsx` (line 52)
- Why fragile: Response structure from external API (response.ok, response.presence_data) is not validated. If API changes structure, parsing silently fails.
- Safe modification: Add Zod schema validation for PresenceResponse, add error logging to identify API changes early.
- Test coverage: No tests verify API response parsing with various payload structures.

**Keyboard Navigation Section Mapping:**
- Files: `src/hooks/useKeyboardNavigation.ts`, `src/app/HomeClient.tsx` (line 192)
- Why fragile: Section IDs from navigation content must match ref names (about, experience, education, etc.). Mismatch causes silent failures.
- Safe modification: Use TypeScript enums for section IDs, add runtime validation that all nav items have matching refs.
- Test coverage: No tests verify keyboard navigation works for all declared sections.

## Scaling Limits

**Presence API Polling:**
- Current capacity: 5-second polling interval with no rate limiting considerations.
- Limit: If Discord API has rate limits, concurrent users could hit limits. Each browser makes independent requests.
- Scaling path: Implement server-side proxy with caching, deduplicate requests across users, use API webhooks instead of polling.

**Event Listener Registration:**
- Current capacity: One mousemove listener on CustomCursor, one keydown listener on KeyboardIndicator, one resize listener on HomeClient.
- Limit: Each event listener adds overhead. With 10+ interactive elements in CustomCursor, performance degrades on mobile.
- Scaling path: Use event delegation pattern for interactive element detection, batch resize and scroll handlers with debounce and throttle.

**Dynamic Section Loading:**
- Current capacity: 5 dynamically imported sections load sequentially via Suspense boundaries.
- Limit: If more sections are added, page becomes chunky with loading skeletons. No preloading strategy.
- Scaling path: Implement predictive preloading based on viewport intersection, consider route-level code splitting.

## Dependencies at Risk

**Lenis Smooth Scrolling:**
- Risk: Lenis library maintained by single developer. No TypeScript definitions included, custom interface types required.
- Impact: If library updates break API, custom types must be updated manually.
- Migration plan: Vendor Lenis types, evaluate native CSS scroll-behavior: smooth as fallback, consider Web Standards Scrolling API updates.

**Formspree Integration:**
- Risk: Form submission depends entirely on Formspree endpoint. No offline handling or fallback form submission mechanism.
- Impact: If Formspree API is down or slow, users cannot submit contact form. No error indication to user.
- Migration plan: Add error boundaries around form submission, implement retry logic, consider client-side validation enhancement.

**Split-Type Animation Library:**
- Risk: Used for text animations but library is less actively maintained. Event listener pattern is non-standard.
- Impact: Page listens for custom splittype-loaded event (line 74 in AnimatedText.tsx) which may not fire reliably.
- Migration plan: Evaluate Framer Motion alternatives for text animations, test Split-Type compatibility with latest Next.js.

**Google Analytics:**
- Risk: Loading external GA script adds performance overhead and depends on Google's infrastructure.
- Impact: If GA script fails, page may still load but analytics disabled. GDPR and privacy implications of tracking.
- Migration plan: Verify GA consent management, consider privacy-focused analytics alternatives, add fallback if GA fails to load.

## Missing Critical Features

**No Offline Support:**
- Problem: Portfolio is entirely static but has no service worker or offline page. If API requests fail, nothing graceful happens.
- Blocks: Users with poor connectivity see loading states that never resolve for presence data.

**No Error Boundaries:**
- Problem: No Error Boundary components wrap sections or dynamic imports. A single component error could crash entire page.
- Blocks: Robustness testing difficult, users see white screen on error.

**No Analytics Event Tracking:**
- Problem: Google Analytics is loaded but no custom events track user interactions (section views, clicks, form submissions).
- Blocks: Cannot measure feature usage or identify problematic areas.

**No A/B Testing Infrastructure:**
- Problem: No variant management system for testing different layouts or content.
- Blocks: Cannot optimize without manual deployments for each test.

## Test Coverage Gaps

**No Unit Tests for Utilities:**
- Untested area: All utility functions in `src/utils/` (contentLoader, presenceService, animationUtils, scrollUtils, viewTransition) have zero test coverage.
- Files: `src/utils/*.ts`
- Risk: Breaking changes in content schema or API parsing go undetected until runtime. Refactoring utilities is high-risk.
- Priority: High - these are core business logic functions.

**No Component Integration Tests:**
- Untested area: Components that depend on content data (Experience, Education, Skills sections) are never tested with actual or mock content.
- Files: `src/components/sections/*.tsx`
- Risk: Content schema changes break rendering silently. Component props interfaces may not match actual usage.
- Priority: High - sections are rendered to all users.

**No Keyboard Navigation Tests:**
- Untested area: Keyboard shortcuts (arrow keys, number keys, ?) are never tested.
- Files: `src/hooks/useKeyboardNavigation.ts`, `src/components/ui/KeyboardIndicator.tsx`
- Risk: Keyboard navigation may break in browsers or during refactoring. Accessibility feature goes unverified.
- Priority: Medium - accessibility is important but not critical to functionality.

**No Presence API Tests:**
- Untested area: Discord presence data fetching, parsing, and display logic has no tests with mock API responses.
- Files: `src/utils/presenceService.ts`, `src/components/ui/PresenceStatus.tsx`, `src/components/ui/SpotifyDisplay.tsx`, `src/components/ui/VSCodeDisplay.tsx`
- Risk: API structure changes cause silent failures. Elapsed time calculations may be incorrect.
- Priority: Medium - presence is a nice-to-have feature, not core functionality.

**No Performance Tests:**
- Untested area: No metrics capture for bundle size, LCP, FID, or animation frame rate.
- Files: Entire codebase
- Risk: Performance regressions go unnoticed. Slow interactions degrade user experience without awareness.
- Priority: Medium - portfolio is visible to hiring managers; performance matters.

**No E2E Tests:**
- Untested area: No tests verify user workflows (scroll through sections, click links, submit contact form).
- Files: Entire application
- Risk: Page-breaking bugs discovered by users instead of CI and CD.
- Priority: Medium - critical user paths should be tested before deployment.

---

*Concerns audit: 2026-01-21*
