// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'

describe('useTheme without browser globals', () => {
  it('runs in an environment that actually lacks them', () => {
    expect(typeof window).toBe('undefined')
    expect(typeof document).toBe('undefined')
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

  it('falls back to no-op storage when localStorage throws on write', async () => {
    vi.resetModules()
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => {
        throw new Error('blocked')
      },
      removeItem: () => {},
    })
    try {
      const { useTheme } = await import('./useTheme')
      expect(() => useTheme.getState().toggleTheme()).not.toThrow()
    } finally {
      vi.unstubAllGlobals()
      vi.resetModules()
    }
  })
})
