import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { ThemeProvider } from 'next-themes'

interface AllProvidersProps {
  children: React.ReactNode
}

/**
 * Wraps components with all necessary providers for testing.
 * Currently includes ThemeProvider for dark mode support.
 * Add additional providers here as needed (e.g., auth context).
 */
function AllProviders({ children }: AllProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  )
}

/**
 * Custom render function that wraps components with all app providers.
 * Use this instead of @testing-library/react's render for component tests.
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options })
}

export { customRender as render }
