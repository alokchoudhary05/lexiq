'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@/lib/types'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  // Memoize client so it isn't recreated on every render
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    // Safety timeout — never stay loading > 5 seconds
    const timeout = setTimeout(() => setLoading(false), 5000)

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfile(session.user.id, session.user)
      } else {
        clearTimeout(timeout)
        setLoading(false)
      }
    }).catch(() => {
      clearTimeout(timeout)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await loadProfile(session.user.id, session.user)
        } else {
          setUser(null)
          clearTimeout(timeout)
          setLoading(false)
        }
      }
    )

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function loadProfile(userId: string, sessionUser?: any) {
    try {
      // Use server-side API route — bypasses client JWT/RLS issues completely
      const res = await fetch('/api/me')
      if (res.ok) {
        const profile = await res.json()
        setUser({
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          role: profile.role,
          avatar_url: profile.avatar_url,
        })
      } else {
        // API failed — fall back to session data
        if (sessionUser) {
          setUser({
            id: sessionUser.id,
            email: sessionUser.email ?? '',
            full_name: sessionUser.user_metadata?.full_name
              ?? sessionUser.user_metadata?.name
              ?? sessionUser.email?.split('@')[0]
              ?? 'User',
            role: sessionUser.user_metadata?.role ?? 'citizen',
            avatar_url: sessionUser.user_metadata?.avatar_url ?? null,
          })
        }
      }
    } catch {
      // Network error — fall back to session data
      if (sessionUser) {
        setUser({
          id: sessionUser.id,
          email: sessionUser.email ?? '',
          full_name: sessionUser.user_metadata?.full_name
            ?? sessionUser.user_metadata?.name
            ?? sessionUser.email?.split('@')[0]
            ?? 'User',
          role: sessionUser.user_metadata?.role ?? 'citizen',
          avatar_url: sessionUser.user_metadata?.avatar_url ?? null,
        })
      }
    } finally {
      setLoading(false)
    }
  }


  const signUp = useCallback(async (
    email: string,
    password: string,
    full_name: string,
    role: string
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name, role },
      },
    })
    return { data, error }
  }, [supabase])

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }, [supabase])

  const signInWithGoogle = useCallback(async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    return { data, error }
  }, [supabase])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }, [supabase, router])

  const resetPassword = useCallback(async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    return { data, error }
  }, [supabase])

  const updatePassword = useCallback(async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword })
    return { data, error }
  }, [supabase])

  const getInitials = useCallback((name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }, [])

  return {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    getInitials,
  }
}
