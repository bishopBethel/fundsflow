import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark'

type ThemeState = {
  theme: Theme
  toggleTheme: () => void
}

const systemTheme = (): Theme =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'

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
    { name: 'fundsflow-theme' },
  ),
)

applyTheme(useTheme.getState().theme)
useTheme.subscribe((s) => applyTheme(s.theme))
