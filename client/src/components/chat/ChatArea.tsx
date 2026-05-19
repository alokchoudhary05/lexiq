'use client'

import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import { Message } from '@/lib/types'

interface ChatAreaProps {
  messages: Message[]
  isStreaming: boolean
  statusMsg: string
  userInitials: string
  sourcesOpen: boolean   // kept for future use but layout shift handled by parent
  onSuggestionClick: (text: string) => void
  onShowSources: (sources: string[]) => void
}

const SUGGESTIONS = [
  { text: 'Explain Section 103 BNS — Murder & punishment', sub: 'Bharatiya Nyaya Sanhita' },
  { text: 'How to file an FIR? Step by step process', sub: 'CrPC procedure' },
  { text: 'BNS vs IPC — key changes & differences', sub: 'Comparative analysis' },
  { text: 'Bail conditions and eligibility criteria', sub: 'Criminal procedure' },
]

export default function ChatArea({
  messages,
  isStreaming,
  statusMsg,
  userInitials,
  onSuggestionClick,
  onShowSources,
}: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  const showWelcome = messages.length === 0 && !isStreaming

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '32px 0',
      }}
    >
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 20px' }}>

        {/* Welcome State */}
        {showWelcome && (
          <div style={{ textAlign: 'center', padding: '40px 0 28px' }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>⚖</div>
            <div style={{ fontSize: 28, fontFamily: 'Georgia, serif', color: 'var(--text-primary)', marginBottom: 8 }}>
              What&apos;s on your mind today?
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto 32px', lineHeight: 1.6 }}>
              Ask anything about Indian law — BNS, CrPC, IPC, Income Tax, or Criminal procedure.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {SUGGESTIONS.map((s, i) => (
                <div
                  key={i}
                  onClick={() => onSuggestionClick(s.text)}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '0.5px solid var(--border)',
                    borderRadius: 12,
                    padding: '14px 16px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold-border)'
                    ;(e.currentTarget as HTMLElement).style.background = 'var(--gold-faint)'
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                    ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-surface)'
                  }}
                >
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.4 }}>
                    {s.text}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isStreaming={isStreaming && i === messages.length - 1 && msg.role === 'assistant'}
            userInitials={userInitials}
            onShowSources={onShowSources}
          />
        ))}

        {/* Status message */}
        {statusMsg && (
          <div className="fade-in" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 12, color: 'var(--text-muted)',
            padding: '4px 0 12px',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--gold)',
              display: 'inline-block',
              animation: 'pulse-gold 1s infinite',
            }} />
            {statusMsg}
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
