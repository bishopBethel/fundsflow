import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { StateStorage } from 'zustand/middleware'

export type Theme = 'light' | 'dark'

// Kept in sync by hand with the pre-paint script in index.html; a mismatch there
// costs a flash of the wrong theme on load, not an error.
export const THEME_STORAGE_KEY = 'fundsflow-theme'

type ThemeState = {
  theme: Theme
  toggleTheme: () => void
}

const systemTheme = (): Theme =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
}

// Node ships a method-less stub and blocked site data throws on write, so probe
// with a real round-trip rather than trusting the global to exist.
const webStorage = (): StateStorage => {
  try {
    if (typeof localStorage !== 'undefined') {
      const probeKey = '__fundsflow_probe__'
      localStorage.setItem(probeKey, probeKey)
      localStorage.removeItem(probeKey)
      return localStorage
    }
  } catch {
    /* unavailable */
  }
  return noopStorage
}

const applyTheme = (theme: Theme) => {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = theme
  }
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      theme: systemTheme(),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
    }),
    {
      name: THEME_STORAGE_KEY,
      storage: createJSONStorage(webStorage),
    },
  ),
)

applyTheme(useTheme.getState().theme)
useTheme.subscribe((s) => applyTheme(s.theme))
