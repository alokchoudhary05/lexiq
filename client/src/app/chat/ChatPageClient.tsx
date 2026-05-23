'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useChat } from '@/lib/hooks/useChat'
import { useSessions } from '@/lib/hooks/useSessions'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import ChatArea from '@/components/chat/ChatArea'
import InputBar from '@/components/chat/InputBar'
import SourcesPanel from '@/components/chat/SourcesPanel'
import { ChatSession, DomainKey, Message } from '@/lib/types'
import { ChatThemeWrapper } from '@/lib/ThemeProvider'

/** Generate a short smart title from the user's first prompt */
function generateTitle(prompt: string): string {
  const stopWords = new Set([
    'a','an','the','is','are','was','were','be','been','being',
    'have','has','had','do','does','did','will','would','shall','should',
    'may','might','must','can','could','to','of','in','on','at','for',
    'with','by','from','and','or','but','not','this','that','these',
    'those','it','its','what','how','why','when','where','who','which',
    'me','my','we','our','you','your','he','his','she','her','they','their',
    'i','about','tell','explain','describe','give','write','provide','please',
  ])
  const words = prompt
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !stopWords.has(w.toLowerCase()))
  const titleWords = words.slice(0, 5)
  if (titleWords.length === 0) return prompt.slice(0, 40)
  return titleWords.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export default function ChatPageClient() {
  const { user, loading, getInitials, signOut } = useAuth()
  const {
    messages, isStreaming, statusMsg,
    activeDomain, setActiveDomain,
    sendMessage, setMessages, clearMessages,
  } = useChat()
  const {
    sessions, activeSessionId, setActiveSessionId,
    createSession, getMessages, updateSessionTitle, deleteSession,
  } = useSessions()

  // ── Sources panel state (lifted here so layout can shift) ─────────────────
  const [activeSources, setActiveSources] = useState<string[] | null>(null)

  const userInitials = user
    ? getInitials(user.full_name ?? user.email ?? 'U')
    : 'U'

  // Handle sending a message
  const handleSend = useCallback(async (query: string) => {
    let sid = activeSessionId

    // Create session if none active
    if (!sid) {
      const smartTitle = generateTitle(query)
      const session = await createSession(activeDomain, smartTitle)
      if (!session) return
      sid = session.id
      setActiveSessionId(sid)
      await updateSessionTitle(sid, smartTitle)
    }

    await sendMessage(query, sid)
  }, [activeSessionId, activeDomain, createSession, sendMessage, setActiveSessionId, updateSessionTitle])

  // Handle selecting a past session
  const handleSelectSession = useCallback(async (session: ChatSession) => {
    setActiveSessionId(session.id)
    clearMessages()
    setActiveSources(null)           // close sources panel on session switch
    const msgs: Message[] = await getMessages(session.id)
    setMessages(msgs)
  }, [setActiveSessionId, clearMessages, getMessages, setMessages])

  // Handle new chat
  const handleNewChat = useCallback(() => {
    setActiveSessionId(null)
    clearMessages()
    setActiveSources(null)           // close sources panel on new chat
  }, [setActiveSessionId, clearMessages])

  // Handle domain change — allow changing mid-conversation
  const handleSelectDomain = useCallback((domain: DomainKey) => {
    setActiveDomain(domain)
  }, [setActiveDomain])

  if (loading) {
    return (
      <ChatThemeWrapper>
        <div style={{
          height: '100vh', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: 'var(--bg-primary)',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16, color: 'var(--gold)' }}>⚖</div>
            <div style={{ color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', fontSize: 14 }}>
              Loading LexIQ...
            </div>
          </div>
        </div>
      </ChatThemeWrapper>
    )
  }

  const sourcesOpen = activeSources !== null

  return (
    <ChatThemeWrapper>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-primary)' }}>
        {/* Left Sidebar */}
        <Sidebar
          user={user}
          sessions={sessions}
          activeSessionId={activeSessionId}
          activeDomain={activeDomain}
          onNewChat={handleNewChat}
          onSelectSession={handleSelectSession}
          onSelectDomain={handleSelectDomain}
          onDeleteSession={(id) => {
            deleteSession(id)
            if (activeSessionId === id) {
              handleNewChat()
            }
          }}
          onSignOut={signOut}
        />

        {/* Main Area — shifts right content away when sources panel is open */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
          position: 'relative',
          // Smooth width compression when sources panel slides in
          marginRight: sourcesOpen ? 300 : 0,
          transition: 'margin-right 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
        }}>
          <TopBar
            activeDomain={activeDomain}
            onSelectDomain={handleSelectDomain}
          />
          <ChatArea
            messages={messages}
            isStreaming={isStreaming}
            statusMsg={statusMsg}
            userInitials={userInitials}
            onShowSources={(sources) => setActiveSources(sources)}
            onResubmit={handleSend}
          />
          <InputBar
            onSend={handleSend}
            isStreaming={isStreaming}
            activeDomain={activeDomain}
            onSelectDomain={handleSelectDomain}
          />
        </div>

        {/* Right Sources Panel — fixed, slides in from right */}
        {sourcesOpen && (
          <SourcesPanel
            sources={activeSources!}
            onClose={() => setActiveSources(null)}
          />
        )}
      </div>
    </ChatThemeWrapper>
  )
}
