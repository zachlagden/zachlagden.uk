import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from './theme-toggle'

// Mock next-themes
const mockSetTheme = vi.fn()
let mockResolvedTheme = 'light'

vi.mock('next-themes', () => ({
  useTheme: () => ({
    setTheme: mockSetTheme,
    resolvedTheme: mockResolvedTheme,
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}))

describe('ThemeToggle', () => {
  beforeEach(() => {
    mockSetTheme.mockClear()
    mockResolvedTheme = 'light'
  })

  it('renders toggle button with switch role', () => {
    render(<ThemeToggle />)
    expect(screen.getByRole('switch')).toBeInTheDocument()
  })

  it('has accessible aria-label describing action', () => {
    render(<ThemeToggle />)
    const toggle = screen.getByRole('switch')
    expect(toggle).toHaveAttribute('aria-label', 'Switch to dark mode')
  })

  it('shows aria-checked=false in light mode', () => {
    mockResolvedTheme = 'light'
    render(<ThemeToggle />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false')
  })

  it('shows aria-checked=true in dark mode', () => {
    mockResolvedTheme = 'dark'
    render(<ThemeToggle />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
  })

  it('calls setTheme("dark") when clicked in light mode', async () => {
    mockResolvedTheme = 'light'
    const user = userEvent.setup()
    render(<ThemeToggle />)

    await user.click(screen.getByRole('switch'))
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('calls setTheme("light") when clicked in dark mode', async () => {
    mockResolvedTheme = 'dark'
    const user = userEvent.setup()
    render(<ThemeToggle />)

    await user.click(screen.getByRole('switch'))
    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })

  it('updates aria-label based on current theme', () => {
    mockResolvedTheme = 'dark'
    render(<ThemeToggle />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-label', 'Switch to light mode')
  })
})
