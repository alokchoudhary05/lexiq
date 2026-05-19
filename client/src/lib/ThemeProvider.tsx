'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

export type AppTheme = 'system' | 'light' | 'dark'
export type AppLanguage = 'auto' | 'en' | 'hi' | 'hinglish'

interface ThemeContextValue {
  theme: AppTheme
  resolvedTheme: 'light' | 'dark'
  language: AppLanguage
  setTheme: (t: AppTheme) => void
  setLanguage: (l: AppLanguage) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  resolvedTheme: 'dark',
  language: 'auto',
  setTheme: () => {},
  setLanguage: () => {},
})

function resolveTheme(theme: AppTheme): 'light' | 'dark' {
  if (theme === 'light') return 'light'
  if (theme === 'dark') return 'dark'
  // system
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'dark'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>('dark')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark')
  const [language, setLanguageState] = useState<AppLanguage>('auto')
  const [mounted, setMounted] = useState(false)

  // Load saved prefs on mount — never touch <html> data-theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('lexiq-theme') as AppTheme | null
    const savedLang = localStorage.getItem('lexiq-language') as AppLanguage | null
    const t = savedTheme ?? 'dark'
    setThemeState(t)
    setResolvedTheme(resolveTheme(t))
    if (savedLang) setLanguageState(savedLang)
    setMounted(true)
  }, [])

  // Update resolvedTheme whenever theme changes (after mount)
  useEffect(() => {
    if (!mounted) return
    const resolved = resolveTheme(theme)
    setResolvedTheme(resolved)

    // If system, also listen for OS preference changes
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => setResolvedTheme(resolveTheme('system'))
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [theme, mounted])

  const setTheme = useCallback((t: AppTheme) => {
    setThemeState(t)
    localStorage.setItem('lexiq-theme', t)
  }, [])

  const setLanguage = useCallback((l: AppLanguage) => {
    setLanguageState(l)
    localStorage.setItem('lexiq-language', l)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, language, setTheme, setLanguage }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}

/**
 * Wrap ONLY the chat page with this — applies data-theme scoped to this div,
 * so landing/auth pages are never affected by the user's theme preference.
 */
export function ChatThemeWrapper({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme()
  return (
    <div
      data-theme={resolvedTheme}
      style={{ display: 'contents' }}
    >
      {children}
    </div>
  )
}
