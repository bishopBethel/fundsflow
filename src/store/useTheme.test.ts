// @vitest-environment node
import { describe, expect, it } from 'vitest'

describe('useTheme without browser globals', () => {
  it('runs in an environment that actually lacks them', () => {
    expect(typeof window).toBe('undefined')
    expect(typeof document).toBe('undefined')
    // Newer Node defines localStorage but leaves it method-less; older Node omits it.
    expect(typeof globalThis.localStorage?.setItem).toBe('undefined')
  })

  it('imports without throwing and falls back to light', async () => {
    const { useTheme } = await import('./useTheme')
    expect(useTheme.getState().theme).toBe('light')
  })

  it('toggles without reaching document or localStorage', async () => {
    const { useTheme } = await import('./useTheme')
    const before = useTheme.getState().theme
    expect(() => useTheme.getState().toggleTheme()).not.toThrow()
    expect(useTheme.getState().theme).not.toBe(before)
  })
})
