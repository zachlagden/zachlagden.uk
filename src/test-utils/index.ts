// Re-export everything from React Testing Library
export * from '@testing-library/react'

// Override render with our custom render that includes providers
export { render } from './render'

// Re-export user-event for convenience
export { default as userEvent } from '@testing-library/user-event'
