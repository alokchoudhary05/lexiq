'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ChatSession, DomainKey } from '@/lib/types'
import { User } from '@/lib/types'
import UserMenuPopup from './UserMenuPopup'
import ProfileModal from './ProfileModal'
import SettingsModal from './SettingsModal'
import LogoutConfirmModal from './LogoutConfirmModal'

interface SidebarProps {
  user: User | null
  sessions: ChatSession[]
  activeSessionId: string | null
  activeDomain: DomainKey
  onNewChat: () => void
  onSelectSession: (session: ChatSession) => void
  onSelectDomain: (domain: DomainKey) => void
  onDeleteSession?: (id: string) => void
  onSignOut: () => void
}

export default function Sidebar({
  user,
  sessions,
  activeSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onSignOut,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [hoveredSession, setHoveredSession] = useState<string | null>(null)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Delete confirmation modal
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null)

  // User menu + modals
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showLogout, setShowLogout] = useState(false)
  const userRowRef = useRef<HTMLDivElement>(null)

  // Local copy of user name (updated optimistically after profile save)
  const [displayName, setDisplayName] = useState(user?.full_name ?? '')
  useEffect(() => { setDisplayName(user?.full_name ?? '') }, [user?.full_name])

  // Close session dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null)
      }
    }
    if (menuOpenId) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpenId])

  const initials = displayName
    ? displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? 'U'

  const roleLabel = {
    student: 'Law Student',
    advocate: 'Advocate',
    citizen: 'Citizen',
  }[user?.role ?? 'citizen'] ?? 'Citizen'

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  function handleDeleteClick(e: React.MouseEvent, session: ChatSession) {
    e.stopPropagation()
    setMenuOpenId(null)
    setHoveredSession(null)
    setDeleteConfirm({ id: session.id, title: session.title })
  }

  function handleConfirmDelete() {
    if (deleteConfirm) {
      onDeleteSession?.(deleteConfirm.id)
      setDeleteConfirm(null)
    }
  }

  return (
    <>
      <div style={{
        width: 248, minWidth: 248,
        background: 'var(--bg-sidebar)',
        display: 'flex', flexDirection: 'column',
        height: '100vh',
        borderRight: '0.5px solid var(--border)',
        position: 'relative',
      }}>
        {/* Top Section */}
        <div style={{ padding: '10px 10px 0' }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 6px 12px' }}>
              <div style={{
                width: 30, height: 30, background: 'var(--gold)', borderRadius: 7,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, color: '#0d0d0d', flexShrink: 0,
              }}>⚖</div>
              <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'Georgia, serif', letterSpacing: '0.5px', color: 'var(--text-primary)' }}>
                Lex<span style={{ color: 'var(--gold)' }}>IQ</span>
              </div>
            </div>
          </Link>

          {/* New Chat */}
          <button
            onClick={onNewChat}
            style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '9px 10px', borderRadius: 8, fontSize: 13,
              cursor: 'pointer', color: 'var(--text-primary)',
              width: '100%', background: 'transparent', border: 'none', fontWeight: 500,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New chat
          </button>

          {/* Search */}
          {showSearch ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 10px', borderRadius: 8,
              background: 'var(--bg-surface)', border: '0.5px solid var(--border)', margin: '2px 0',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
                <circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21" strokeLinecap="round"/>
              </svg>
              <input
                autoFocus value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}
                onBlur={() => { if (!searchQuery) setShowSearch(false) }}
              />
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '9px 10px', borderRadius: 8, fontSize: 13,
                cursor: 'pointer', color: 'var(--text-muted)',
                width: '100%', background: 'transparent', border: 'none',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
                <circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21" strokeLinecap="round"/>
              </svg>
              Search chats
            </button>
          )}
        </div>

        {/* Legal GPTs Section */}
        <div style={{ padding: '16px 10px 4px', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
          Legal GPTs
        </div>
        <Link href="/explore" style={{ textDecoration: 'none' }}>
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '8px 10px', borderRadius: 8, fontSize: 12.5,
              cursor: 'pointer', color: 'var(--text-muted)', margin: '1px 4px',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface)'; (e.currentTarget as HTMLElement).style.color = 'var(--gold)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 3" strokeLinecap="round"/>
            </svg>
            Explore Legal GPTs
          </div>
        </Link>

        {/* Divider */}
        <div style={{ height: '0.5px', background: 'var(--border)', margin: '8px 0' }} />

        {/* Recents Section */}
        <div style={{ padding: '0 10px 4px', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
          Recents
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 4px' }}>
          {filteredSessions.length === 0 && (
            <div style={{ padding: '8px 12px', fontSize: 12, color: 'var(--text-dim)' }}>No chats yet</div>
          )}
          {filteredSessions.map((session) => {
            const isActive = activeSessionId === session.id
            const isHovered = hoveredSession === session.id
            const menuOpen = menuOpenId === session.id
            return (
              <div
                key={session.id}
                onClick={() => onSelectSession(session)}
                onMouseEnter={() => setHoveredSession(session.id)}
                onMouseLeave={() => { if (!menuOpen) setHoveredSession(null) }}
                style={{
                  position: 'relative', display: 'flex', alignItems: 'center',
                  padding: '8px 8px 8px 12px', borderRadius: 7, fontSize: 12,
                  cursor: 'pointer',
                  background: isActive ? 'var(--bg-surface)' : isHovered ? 'var(--bg-surface)' : 'transparent',
                  transition: 'background 0.12s',
                }}
              >
                <span style={{
                  flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  color: isActive || isHovered ? 'var(--text-primary)' : 'var(--text-muted)',
                  paddingRight: isHovered || menuOpen ? 4 : 0,
                }}>
                  {session.title}
                </span>

                {(isHovered || menuOpen) && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpen ? null : session.id) }}
                    title="Options"
                    style={{
                      background: menuOpen ? 'var(--bg-surface-2)' : 'transparent',
                      border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                      padding: '2px 4px', borderRadius: 5, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, lineHeight: 1,
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--gold)'; (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface-2)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; if (!menuOpen) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    ···
                  </button>
                )}

                {menuOpen && (
                  <div
                    ref={menuRef}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: 'absolute', right: 4, top: '100%', zIndex: 100,
                      background: 'var(--bg-surface)', border: '0.5px solid var(--border)',
                      borderRadius: 8, padding: '4px', minWidth: 130,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
                    }}
                  >
                    <button
                      onClick={(e) => handleDeleteClick(e, session)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                        padding: '7px 10px', borderRadius: 6, border: 'none',
                        background: 'transparent', cursor: 'pointer',
                        fontSize: 12, color: '#f87171', fontFamily: 'Inter, sans-serif', textAlign: 'left',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(248,113,113,0.1)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                      </svg>
                      Delete chat
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* User Row — clickable to open menu */}
        <div style={{ padding: 8, borderTop: '0.5px solid var(--border)', position: 'relative' }}>
          {/* User menu popup */}
          {userMenuOpen && (
            <UserMenuPopup
              anchorRef={userRowRef}
              onClose={() => setUserMenuOpen(false)}
              onProfile={() => { setShowProfile(true) }}
              onSettings={() => { setShowSettings(true) }}
              onLogout={() => { setShowLogout(true) }}
            />
          )}

          <div
            ref={userRowRef}
            onClick={() => setUserMenuOpen((v) => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '9px 8px', borderRadius: 8, cursor: 'pointer',
              background: userMenuOpen ? 'var(--bg-surface)' : 'transparent',
              transition: 'background 0.12s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
            onMouseLeave={(e) => { if (!userMenuOpen) e.currentTarget.style.background = 'transparent' }}
          >
            {/* Avatar */}
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'var(--gold-faint)', border: '1px solid var(--gold-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: 'var(--gold)', flexShrink: 0,
            }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {displayName || 'User'}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{roleLabel}</div>
            </div>
            {/* Chevron indicating expandable */}
            <svg
              width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round"
              style={{ flexShrink: 0, transform: userMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
            >
              <polyline points="18 15 12 9 6 15"/>
            </svg>
          </div>
        </div>
      </div>

      {/* ── Delete Confirmation Modal ───────────────────── */}
      {deleteConfirm && (
        <div
          onClick={() => setDeleteConfirm(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-surface)',
              border: '0.5px solid var(--border)',
              borderRadius: 14,
              padding: '28px 28px 22px',
              width: 360,
              maxWidth: '90vw',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              animation: 'fadeInScale 0.18s ease',
            }}
          >
            {/* Title */}
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, fontFamily: 'Georgia, serif' }}>
              Delete chat?
            </div>
            {/* Body */}
            <div style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
              This will delete{' '}
              <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                {deleteConfirm.title}
              </strong>
              .
            </div>
            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  padding: '9px 22px', borderRadius: 8, border: '0.5px solid var(--border)',
                  background: 'transparent', cursor: 'pointer',
                  fontSize: 13, fontWeight: 500, color: 'var(--text-primary)',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface-2)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                style={{
                  padding: '9px 22px', borderRadius: 8, border: 'none',
                  background: '#dc2626', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600, color: '#ffffff',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#b91c1c')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#dc2626')}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────── */}
      {showProfile && (
        <ProfileModal
          user={{ ...user!, full_name: displayName }}
          onClose={() => setShowProfile(false)}
          onSaved={(name) => setDisplayName(name)}
        />
      )}
      {showSettings && (
        <SettingsModal
          user={{ ...user!, full_name: displayName }}
          onClose={() => setShowSettings(false)}
        />
      )}
      {showLogout && (
        <LogoutConfirmModal
          userEmail={user?.email ?? ''}
          onConfirm={() => { setShowLogout(false); onSignOut() }}
          onCancel={() => setShowLogout(false)}
        />
      )}
    </>
  )
}
