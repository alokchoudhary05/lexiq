'use client'

import { useEffect, useRef, useState } from 'react'
import MessageBubble from './MessageBubble'
import { Message } from '@/lib/types'

interface ChatAreaProps {
  messages: Message[]
  isStreaming: boolean
  statusMsg: string
  userInitials: string
  onShowSources: (sources: string[]) => void
  onResubmit?: (newText: string) => void
}



const GREETINGS = [
  "What's on your mind today?",
  "How can I assist you with Indian law?",
  "Ready to decode legal complexities?",
  "Need guidance on a legal query?",
  "Navigate the legal system with LexIQ.",
  "What legal topic shall we explore today?",
  "Your personal AI legal assistant is ready.",
  "Have a question about the legal law?",
  "Simplifying legal law for you.",
  "Let's find the legal answers you need.",
  "Empowering you with legal knowledge.",
  "Ask anything about your legal rights.",
  "Clear and concise legal insights await.",
  "Demystifying the Indian law.",
  "How can LexIQ help you today?"
]

export default function ChatArea({
  messages,
  isStreaming,
  statusMsg,
  userInitials,
  onShowSources,
  onResubmit,
}: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const [greeting, setGreeting] = useState(GREETINGS[0])

  useEffect(() => {
    setGreeting(GREETINGS[Math.floor(Math.random() * GREETINGS.length)])
  }, [])

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
            <div style={{ fontSize: 28, fontFamily: 'Georgia, serif', color: 'var(--text-primary)', marginBottom: 8, transition: 'opacity 0.3s' }}>
              {greeting}
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto 32px', lineHeight: 1.6 }}>
              Ask anything about Indian law - BNS, CrPC, IPC, Income Tax, or Criminal procedure, etc...
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
            onResubmit={onResubmit}
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
