import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'
import { render, screen } from '@/test-utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('test-utils exports work', () => {
    // Just validate imports compile
    expect(render).toBeDefined()
    expect(screen).toBeDefined()
  })
})
