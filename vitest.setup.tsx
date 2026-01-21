import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import React from 'react'

// Clean up after each test
afterEach(() => {
  cleanup()
})

// Mock Framer Motion globally to prevent animation timeouts
vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_target, prop) => {
      // Return a component that renders children without animation props
      const Component = ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => {
        // Filter out motion-specific props
        const {
          initial, animate, exit, transition, variants,
          whileHover, whileTap, whileInView, whileFocus, whileDrag,
          drag, dragConstraints, dragElastic, dragMomentum,
          layout, layoutId, onAnimationStart, onAnimationComplete,
          ...rest
        } = props

        // Return element with filtered props
        const Tag = typeof prop === 'string' ? prop : 'div'
        return React.createElement(Tag, rest as React.HTMLAttributes<HTMLElement>, children)
      }
      return Component
    },
  }),
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => children,
  MotionConfig: ({ children }: { children?: React.ReactNode }) => children,
  useMotionValue: () => ({ get: () => 0, set: vi.fn() }),
  useTransform: () => ({ get: () => 0 }),
  useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
  useInView: () => true,
  useAnimation: () => ({ start: vi.fn(), stop: vi.fn() }),
}))

// Mock Lenis smooth scroll
vi.mock('lenis', () => ({
  default: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    off: vi.fn(),
    destroy: vi.fn(),
    scrollTo: vi.fn(),
    raf: vi.fn(),
  })),
}))

// Mock window.lenis for scrollUtils
Object.defineProperty(window, 'lenis', {
  value: {
    scrollTo: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    destroy: vi.fn(),
  },
  writable: true,
})

// Mock ResizeObserver (required by Radix UI components like Tooltip)
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver

// Mock window.matchMedia (required by next-themes)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
