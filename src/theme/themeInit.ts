import { THEME_STORAGE_KEY, type Theme } from './theme.types'

/** Light mode is the primary demo experience; dark mode remains available. */
export function resolveSystemTheme(): Theme {
  return 'light'
}

export function readStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'dark' || stored === 'light') return stored
  } catch {
    /* localStorage unavailable */
  }

  return null
}

export function resolveInitialTheme(): Theme {
  return readStoredTheme() ?? resolveSystemTheme()
}

export function applyThemeToDocument(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme)
  document.documentElement.style.colorScheme = theme
}
