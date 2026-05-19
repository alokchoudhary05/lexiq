'use client'

import { useState, useCallback, useRef } from 'react'
import { Message, DomainKey, getDomainPrefix } from '@/lib/types'
import { v4 as uuidv4 } from 'uuid'

interface UseChat {
  sessionId: string | null
  messages: Message[]
  isStreaming: boolean
  statusMsg: string
  activeDomain: DomainKey
  setActiveDomain: (d: DomainKey) => void
  sendMessage: (query: string, sessionId: string) => Promise<void>
  setMessages: (msgs: Message[]) => void
  clearMessages: () => void
}

export function useChat(): UseChat {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')
  const [activeDomain, setActiveDomain] = useState<DomainKey>('auto')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (query: string, sid: string) => {
    if (isStreaming) return
    setSessionId(sid)

    const prefix = getDomainPrefix(activeDomain)

    // Add user message immediately
    const userMsg: Message = {
      id: uuidv4(),
      session_id: sid,
      role: 'user',
      content: query,
      metadata: {},
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])

    // Add placeholder AI message for streaming
    const aiMsgId = uuidv4()
    const aiPlaceholder: Message = {
      id: aiMsgId,
      session_id: sid,
      role: 'assistant',
      content: '',
      metadata: {},
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, aiPlaceholder])
    setIsStreaming(true)
    setStatusMsg('Connecting to LexIQ...')

    // Save user message to DB
    try {
      await fetch(`/api/sessions/${sid}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'user', content: query, metadata: {} }),
      })
    } catch {
      // Non-blocking
    }

    let fullContent = ''
    let finalMetadata: Message['metadata'] = {}

    try {
      abortRef.current = new AbortController()

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          session_id: sid,
          domain: activeDomain,
          domain_prefix: prefix,
        }),
        signal: abortRef.current.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (raw === '[DONE]') break

          try {
            const event = JSON.parse(raw)
            if (event.type === 'status') {
              setStatusMsg(event.data)
            } else if (event.type === 'token') {
              fullContent += event.data
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId ? { ...m, content: fullContent } : m
                )
              )
            } else if (event.type === 'metadata') {
              finalMetadata = {
                sources: event.data.sources ?? [],
                source_type: event.data.source_type,
                label: event.data.label,
                lang: event.data.lang,
              }
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId ? { ...m, metadata: finalMetadata } : m
                )
              )
            } else if (event.type === 'error') {
              fullContent = `⚠️ Error: ${event.data}`
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId ? { ...m, content: fullContent } : m
                )
              )
            }
          } catch {
            // malformed JSON — skip
          }
        }
      }
    } catch (err: unknown) {
      if ((err as Error)?.name !== 'AbortError') {
        const errMsg = '⚠️ Unable to connect to the AI service. Please ensure FastAPI is running on port 8000.'
        fullContent = errMsg
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId ? { ...m, content: errMsg } : m
          )
        )
      }
    } finally {
      setIsStreaming(false)
      setStatusMsg('')
    }

    // Save AI message to DB
    if (fullContent) {
      try {
        await fetch(`/api/sessions/${sid}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: 'assistant',
            content: fullContent,
            metadata: finalMetadata,
          }),
        })
      } catch {
        // Non-blocking
      }
    }
  }, [isStreaming, activeDomain])

  const clearMessages = useCallback(() => {
    setMessages([])
    setStatusMsg('')
    setSessionId(null)
  }, [])

  return {
    sessionId,
    messages,
    isStreaming,
    statusMsg,
    activeDomain,
    setActiveDomain,
    sendMessage,
    setMessages,
    clearMessages,
  }
}
