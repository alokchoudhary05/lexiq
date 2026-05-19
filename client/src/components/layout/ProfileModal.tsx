'use client'

import { useState, useEffect, useRef } from 'react'
import { User } from '@/lib/types'

interface ProfileModalProps {
  user: User | null
  onClose: () => void
  onSaved: (newName: string) => void
}

export default function ProfileModal({ user, onClose, onSaved }: ProfileModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  const [displayName, setDisplayName] = useState(user?.full_name ?? '')
  const [username, setUsername] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Load existing username
  useEffect(() => {
    fetch('/api/me')
      .then((r) => r.json())
      .then((d) => { if (d.username) setUsername(d.username) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const initials = displayName
    ? displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? 'U'

  async function handleSave() {
    if (!displayName.trim()) { setError('Display name cannot be empty.'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: displayName.trim(), username: username.trim() }),
      })
      if (!res.ok) { setError('Failed to save. Please try again.'); return }
      onSaved(displayName.trim())
      onClose()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.15s ease',
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        .profile-input { transition: border-color 0.15s; }
        .profile-input:focus { border-color: var(--gold-border) !important; outline: none; }
      `}</style>

      <div style={{
        background: 'var(--bg-surface)',
        border: '0.5px solid var(--border)',
        borderRadius: 16, padding: '28px 28px 24px',
        width: '100%', maxWidth: 400,
        animation: 'slideUp 0.2s ease',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div style={{ fontSize: 18, fontFamily: 'Georgia, serif', color: 'var(--text-primary)' }}>
            Edit profile
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Avatar */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <div style={{
            width: 88, height: 88, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--gold) 0%, #b8922a 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30, fontWeight: 700, color: '#0d0d0d',
            letterSpacing: 1,
          }}>
            {initials}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(248,113,113,0.1)', border: '0.5px solid rgba(248,113,113,0.3)',
            borderRadius: 8, padding: '9px 14px', fontSize: 12, color: '#f87171', marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        {/* Display name */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.4px', fontFamily: 'Inter, sans-serif' }}>
            Display name
          </label>
          <input
            className="profile-input"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your full name"
            style={{
              width: '100%', padding: '11px 14px', borderRadius: 9,
              background: 'var(--bg-primary)', border: '0.5px solid var(--border)',
              color: 'var(--text-primary)', fontSize: 14, fontFamily: 'Inter, sans-serif',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Username */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.4px', fontFamily: 'Inter, sans-serif' }}>
            Username
          </label>
          <input
            className="profile-input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
            placeholder="e.g. alokc03"
            style={{
              width: '100%', padding: '11px 14px', borderRadius: 9,
              background: 'var(--bg-primary)', border: '0.5px solid var(--border)',
              color: 'var(--text-primary)', fontSize: 14, fontFamily: 'Inter, sans-serif',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              padding: '9px 20px', borderRadius: 40, border: '0.5px solid var(--border)',
              background: 'transparent', color: 'var(--text-muted)', fontSize: 13,
              fontFamily: 'Inter, sans-serif', cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--gold-border)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '9px 24px', borderRadius: 40, border: 'none',
              background: 'var(--text-primary)', color: 'var(--bg-primary)', fontSize: 13,
              fontWeight: 600, fontFamily: 'Inter, sans-serif',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1, transition: 'opacity 0.15s',
            }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
