# Testing Patterns

**Analysis Date:** 2026-01-21

## Test Framework

**Status:** No testing framework configured

**Current State:**
- No test runner installed (Jest, Vitest, etc. not in devDependencies)
- No test configuration files present (`jest.config.*`, `vitest.config.*` not found)
- No test files exist in codebase (no `*.test.*` or `*.spec.*` files)
- No test scripts in package.json

**Recommendation for Adding Tests:**
If testing is to be implemented, the codebase is ready for:
- Vitest (modern, ESM-native, fast, minimal config)
- Jest (industry standard, comprehensive, requires more setup)

## What Would Be Tested

Based on codebase analysis, the following areas would benefit from testing:

**Utility Functions:**
- `src/utils/contentLoader.ts` - Content loading and caching
- `src/utils/serverContentLoader.ts` - Server-side content loading
- `src/utils/scrollUtils.ts` - Scroll navigation and transitions
- `src/utils/viewTransition.ts` - View Transitions API detection and fallbacks
- `src/utils/animationUtils.ts` - Animation variant definitions

**Custom Hooks:**
- `src/hooks/useSectionObserver.ts` - Intersection Observer setup and active section tracking
- `src/hooks/useKeyboardNavigation.ts` - Keyboard event handling and section navigation

**Components (Unit Level):**
- `src/components/ui/CopyButton.tsx` - Copy to clipboard functionality
- `src/components/ui/TimelineItem.tsx` - Component rendering and props handling
- `src/components/ui/SkillCategory.tsx` - Conditional rendering
- `src/components/ui/AnimatedText.tsx` - SplitType initialization and cleanup

**Providers:**
- `src/components/providers/SmoothScrollProvider.tsx` - Lenis initialization, device detection, cleanup

## Current Testing Approach

**Manual Testing Only:**
- Testing is performed manually during development
- No automated test suite
- Testing focuses on browser compatibility and visual/interaction validation

**Development Commands:**
```bash
pnpm dev            # Start development server for manual testing
pnpm devturbo       # Start with Turbopack for faster refreshes
pnpm build          # Verify production build succeeds
```

## Type Safety as Primary Quality Gate

Since no testing framework is configured, **TypeScript strict mode** serves as the primary quality mechanism:

**TypeScript Configuration:**
- Strict mode enabled: catches type errors at development time
- ESLint with React hooks plugin validates custom hook usage
- tsc (TypeScript compiler) validates all code before deployment

**Quality Assurance Strategy:**
1. Type safety through strict TypeScript
2. Linting with ESLint and Next.js configuration
3. Manual testing during development
4. Build-time validation

## Error Boundary Testing Approach

**Current Pattern:**
Components use try-catch blocks with console.error logging for manual verification:

```typescript
// From AnimatedText.tsx
try {
  splitText = new window.SplitType(textRef.current, {
    types: "words,chars",
    tagName: "span",
  });
} catch (error) {
  console.error("Error initializing SplitType:", error);
}
```

**Manual Test Verification:**
- Open browser DevTools Console
- Trigger error conditions
- Verify error messages appear with appropriate context
- Verify fallback behavior activates

## Example: Testing Patterns if Framework Were Added

### Example 1: Utility Function Test

```typescript
// Would test: src/utils/contentLoader.ts
import { formatDate, formatDateRange } from "@/utils/contentLoader";

describe("contentLoader", () => {
  describe("formatDate", () => {
    it("should format date string to localized format", () => {
      const result = formatDate("2024-01-15");
      expect(result).toBe("Jan 2024");
    });
  });

  describe("formatDateRange", () => {
    it("should format date range with start and end date", () => {
      const result = formatDateRange("2024-01-15", "2024-12-15");
      expect(result).toContain("Jan 2024");
      expect(result).toContain("-");
      expect(result).toContain("Dec 2024");
    });

    it("should show Present when endDate is null", () => {
      const result = formatDateRange("2024-01-15", null);
      expect(result).toContain("Present");
    });
  });
});
```

### Example 2: Custom Hook Test

```typescript
// Would test: src/hooks/useSectionObserver.ts
import { renderHook } from "@testing-library/react";
import useSectionObserver from "@/hooks/useSectionObserver";

describe("useSectionObserver", () => {
  it("should observe sections and update active section", () => {
    const mockSetActiveSection = jest.fn();
    const sectionRefs = {
      about: { current: document.createElement("div") },
      experience: { current: document.createElement("div") },
    };

    renderHook(() =>
      useSectionObserver({
        sectionRefs,
        setActiveSection: mockSetActiveSection,
      }),
    );

    // Would verify observer is created and called with correct config
  });
});
```

### Example 3: Component Test

```typescript
// Would test: src/components/ui/CopyButton.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import CopyButton from "@/components/ui/CopyButton";

describe("CopyButton", () => {
  it("should copy text to clipboard on click", async () => {
    const textToCopy = "test@example.com";
    render(<CopyButton textToCopy={textToCopy} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(textToCopy);
  });

  it("should show check icon after copy", async () => {
    const { rerender } = render(<CopyButton textToCopy="test" />);
    const button = screen.getByRole("button");

    fireEvent.click(button);

    // Icon should change to Check
    await screen.findByTestId("check-icon");
  });
});
```

### Example 4: Provider Test

```typescript
// Would test: src/components/providers/SmoothScrollProvider.tsx
import { render } from "@testing-library/react";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";

describe("SmoothScrollProvider", () => {
  it("should not initialize Lenis on reduced motion preference", () => {
    // Mock matchMedia to return prefers-reduced-motion: reduce
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: query.includes("prefers-reduced-motion"),
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    render(
      <SmoothScrollProvider>
        <div>Test</div>
      </SmoothScrollProvider>,
    );

    // Should not initialize Lenis
    expect(window.lenis).toBeUndefined();
  });
});
```

## Suggested Test Coverage Plan

If testing framework were to be added, priority order:

1. **High Priority - Utility Functions (Easy to test):**
   - Content loading and formatting functions
   - Scroll utility functions
   - View Transitions API detection

2. **Medium Priority - Custom Hooks (Requires testing library):**
   - Section observer setup and cleanup
   - Keyboard navigation logic

3. **Medium Priority - UI Components (Interactive):**
   - CopyButton functionality
   - Event handlers and state changes

4. **Low Priority - Providers (Complex to mock):**
   - Lenis initialization
   - Smooth scroll behavior

## Test Data & Fixtures

If testing framework is added:

**Content Fixtures Location:** `src/fixtures/content.ts` (suggested)
```typescript
// Mock content data for tests
export const mockContent: ContentData = {
  metadata: { ... },
  personal: { ... },
  // ... other required fields
};
```

**Mock Services Location:** `src/__mocks__/` (suggested)
```typescript
// Mock browser APIs
jest.mock("lenis");
jest.mock("split-type");
```

## Browser API Testing

**Current Browser APIs Used (would need mocking for testing):**
- `IntersectionObserver` - Used in `useSectionObserver`
- `window.matchMedia` - Used for reduced motion detection
- `navigator.clipboard` - Used in `CopyButton`
- `window.lenis` - Used in scroll utilities
- `window.SplitType` - Used in `AnimatedText`
- `document.startViewTransition` - Used in View Transitions API

## Manual Testing Checklist

Since no automated tests exist, follow this checklist for manual testing:

**Before Deployment:**
- [ ] Test on Chrome/Edge (Chromium-based)
- [ ] Test on Firefox
- [ ] Test on Safari (iOS and macOS)
- [ ] Test keyboard navigation (arrow keys, number keys)
- [ ] Test mouse interactions (hover states, clicks)
- [ ] Test with reduced motion preference enabled
- [ ] Test on touch devices
- [ ] Verify copy-to-clipboard works
- [ ] Check all scroll transitions work smoothly
- [ ] Verify animations don't lag or jitter

**Build & Deployment:**
```bash
pnpm lint              # Verify no linting issues
pnpm format:check      # Verify code formatting
pnpm build             # Verify production build succeeds
```

---

*Testing analysis: 2026-01-21*
