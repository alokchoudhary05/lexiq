'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

export type AppTheme = 'system' | 'light' | 'dark'
export type AppTone = 'simple' | 'balanced' | 'professional'
export type AppFontSize = 'small' | 'normal' | 'large'

interface ThemeContextValue {
  theme: AppTheme
  resolvedTheme: 'light' | 'dark'
  tone: AppTone
  fontSize: AppFontSize
  setTheme: (t: AppTheme) => void
  setTone: (t: AppTone) => void
  setFontSize: (s: AppFontSize) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  resolvedTheme: 'dark',
  tone: 'balanced',
  fontSize: 'normal',
  setTheme: () => {},
  setTone: () => {},
  setFontSize: () => {},
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
  const [tone, setToneState] = useState<AppTone>('balanced')
  const [fontSize, setFontSizeState] = useState<AppFontSize>('normal')
  const [mounted, setMounted] = useState(false)

  // Load saved prefs on mount — never touch <html> data-theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('lexiq-theme') as AppTheme | null
    const savedTone = localStorage.getItem('lexiq-tone') as AppTone | null
    const savedFontSize = localStorage.getItem('lexiq-fontsize') as AppFontSize | null
    const t = savedTheme ?? 'dark'
    setThemeState(t)
    setResolvedTheme(resolveTheme(t))
    if (savedTone) setToneState(savedTone)
    if (savedFontSize) setFontSizeState(savedFontSize)
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

  const setTone = useCallback((t: AppTone) => {
    setToneState(t)
    localStorage.setItem('lexiq-tone', t)
  }, [])

  const setFontSize = useCallback((s: AppFontSize) => {
    setFontSizeState(s)
    localStorage.setItem('lexiq-fontsize', s)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, tone, fontSize, setTheme, setTone, setFontSize }}>
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
  const { resolvedTheme, fontSize } = useTheme()
  const fontSizePx = fontSize === 'small' ? '12px' : fontSize === 'large' ? '16px' : '14px'
  
  return (
    <div
      data-theme={resolvedTheme}
      style={{ display: 'contents', '--chat-font-size': fontSizePx } as React.CSSProperties}
    >
      {children}
    </div>
  )
}
