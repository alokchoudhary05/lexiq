'use client'

import { useState, useCallback, useEffect } from 'react'
import { ChatSession } from '@/lib/types'

export function useSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch('/api/sessions')
      if (!res.ok) return
      const data = await res.json()
      setSessions(data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const createSession = useCallback(async (gpt_model = 'auto', title = 'New Chat') => {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, gpt_model }),
      })
      if (!res.ok) return null
      const session: ChatSession = await res.json()
      setSessions((prev) => [session, ...prev])
      setActiveSessionId(session.id)
      return session
    } catch {
      return null
    }
  }, [])

  const updateSessionTitle = useCallback(async (sessionId: string, title: string) => {
    // Optimistic update
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, title } : s))
    )
  }, [])

  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      await fetch(`/api/sessions?id=${sessionId}`, { method: 'DELETE' })
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
      if (activeSessionId === sessionId) {
        setActiveSessionId(null)
      }
    } catch {
      // ignore
    }
  }, [activeSessionId])

  const getMessages = useCallback(async (sessionId: string) => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/messages`)
      if (!res.ok) return []
      return await res.json()
    } catch {
      return []
    }
  }, [])

  return {
    sessions,
    loading,
    activeSessionId,
    setActiveSessionId,
    fetchSessions,
    createSession,
    updateSessionTitle,
    deleteSession,
    getMessages,
  }
}
