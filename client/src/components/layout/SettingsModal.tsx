'use client'

import { useState, useEffect, useRef } from 'react'
import { User } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { useTheme, AppTheme, AppLanguage } from '@/lib/ThemeProvider'

type SettingsTab = 'general' | 'account'

interface SettingsModalProps {
  user: User | null
  onClose: () => void
}

export default function SettingsModal({ user, onClose }: SettingsModalProps) {
  const router = useRouter()
  const overlayRef = useRef<HTMLDivElement>(null)
  const { theme, language, setTheme, setLanguage } = useTheme()

  const [tab, setTab] = useState<SettingsTab>('general')

  // Delete account flow
  const [deleteStep, setDeleteStep] = useState<'idle' | 'confirm'>('idle')
  const [deleteInput, setDeleteInput] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  async function handleDeleteAccount() {
    if (deleteInput !== 'DELETE') { setDeleteError('Please type DELETE to confirm.'); return }
    setDeleting(true)
    setDeleteError('')
    try {
      const res = await fetch('/api/me', { method: 'DELETE' })
      if (!res.ok) { setDeleteError('Failed to delete account. Please try again.'); setDeleting(false); return }
      // Clear local prefs
      localStorage.removeItem('lexiq-theme')
      localStorage.removeItem('lexiq-language')
      router.push('/')
    } catch {
      setDeleteError('Network error. Please try again.')
      setDeleting(false)
    }
  }

  const navItems: { key: SettingsTab; icon: React.ReactNode; label: string }[] = [
    {
      key: 'general',
      label: 'General',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
      ),
    },
    {
      key: 'account',
      label: 'Account',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7"/>
        </svg>
      ),
    },
  ]

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.15s ease',
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        .del-input:focus { outline:none; border-color: #f87171 !important; }
        .s-nav-btn:hover { background: var(--bg-surface-2) !important; }
      `}</style>

      <div style={{
        background: 'var(--bg-surface)',
        border: '0.5px solid var(--border)',
        borderRadius: 16,
        width: '100%', maxWidth: 640, maxHeight: '82vh',
        display: 'flex', overflow: 'hidden',
        animation: 'slideUp 0.2s ease',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>

        {/* Left nav */}
        <div style={{
          width: 188, flexShrink: 0,
          background: 'var(--bg-sidebar)',
          borderRight: '0.5px solid var(--border)',
          padding: '20px 10px',
          display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          <button
            onClick={onClose}
            className="s-nav-btn"
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 10px', borderRadius: 8, border: 'none',
              background: 'transparent', color: 'var(--text-muted)',
              fontSize: 13, cursor: 'pointer', marginBottom: 12,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
            Close
          </button>

          {navItems.map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => { setTab(key); setDeleteStep('idle'); setDeleteInput(''); setDeleteError('') }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8, border: 'none',
                background: tab === key ? 'var(--bg-surface-2)' : 'transparent',
                color: tab === key ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                fontWeight: tab === key ? 500 : 400, textAlign: 'left', width: '100%',
                transition: 'all 0.12s',
              }}
              onMouseEnter={(e) => { if (tab !== key) (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface-2)' }}
              onMouseLeave={(e) => { if (tab !== key) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* Right panel */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>

          {/* ── GENERAL TAB ─────────────────────────────── */}
          {tab === 'general' && (
            <>
              <h2 style={{ fontSize: 20, fontFamily: 'Georgia, serif', color: 'var(--text-primary)', marginBottom: 20, fontWeight: 400 }}>
                General
              </h2>
              <div style={{ height: '0.5px', background: 'var(--border)', marginBottom: 20 }} />

              {/* Appearance */}
              <SettingsRow label="Appearance">
                <CustomSelect<AppTheme>
                  value={theme}
                  options={[
                    { value: 'system', label: 'System' },
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' },
                  ]}
                  onChange={setTheme}
                />
              </SettingsRow>
              <div style={{ height: '0.5px', background: 'var(--border)', marginBottom: 20 }} />

              {/* Language */}
              <SettingsRow label="Language">
                <CustomSelect<AppLanguage>
                  value={language}
                  options={[
                    { value: 'auto', label: 'Auto-detect' },
                    { value: 'en', label: 'English' },
                    { value: 'hi', label: 'हिन्दी (Hindi)' },
                    { value: 'hinglish', label: 'Hinglish' },
                  ]}
                  onChange={setLanguage}
                />
              </SettingsRow>
              <div style={{ height: '0.5px', background: 'var(--border)' }} />
            </>
          )}

          {/* ── ACCOUNT TAB ─────────────────────────────── */}
          {tab === 'account' && (
            <>
              <h2 style={{ fontSize: 20, fontFamily: 'Georgia, serif', color: 'var(--text-primary)', marginBottom: 20, fontWeight: 400 }}>
                Account
              </h2>
              <div style={{ height: '0.5px', background: 'var(--border)', marginBottom: 20 }} />

              <SettingsRow label="Name">
                <span style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
                  {user?.full_name ?? '—'}
                </span>
              </SettingsRow>
              <div style={{ height: '0.5px', background: 'var(--border)', marginBottom: 20 }} />

              <SettingsRow label="Email">
                <span style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
                  {user?.email ?? '—'}
                </span>
              </SettingsRow>
              <div style={{ height: '0.5px', background: 'var(--border)', marginBottom: 20 }} />

              <SettingsRow label="Role">
                <span style={{
                  fontSize: 12, color: 'var(--gold)', fontFamily: 'Inter, sans-serif',
                  background: 'var(--gold-faint)', border: '0.5px solid var(--gold-border)',
                  padding: '3px 10px', borderRadius: 20, textTransform: 'capitalize',
                }}>
                  {user?.role ?? 'citizen'}
                </span>
              </SettingsRow>
              <div style={{ height: '0.5px', background: 'var(--border)', marginBottom: 28 }} />

              {/* Delete account */}
              {deleteStep === 'idle' && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 14, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif', marginBottom: 3 }}>
                      Delete account
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>
                      Permanently delete your LexIQ account and all data.
                    </div>
                  </div>
                  <button
                    onClick={() => setDeleteStep('confirm')}
                    style={{
                      padding: '7px 18px', borderRadius: 40,
                      border: '1px solid #f87171',
                      background: 'transparent', color: '#f87171',
                      fontSize: 13, fontFamily: 'Inter, sans-serif',
                      cursor: 'pointer', flexShrink: 0, marginLeft: 16,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.1)' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  >
                    Delete
                  </button>
                </div>
              )}

              {deleteStep === 'confirm' && (
                <div style={{
                  background: 'rgba(248,113,113,0.06)',
                  border: '0.5px solid rgba(248,113,113,0.25)',
                  borderRadius: 12, padding: '20px',
                }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#f87171', fontFamily: 'Inter, sans-serif', marginBottom: 8 }}>
                    ⚠️ This action cannot be undone
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', lineHeight: 1.6, marginBottom: 16 }}>
                    All your chats, messages, and account data will be permanently deleted.
                    Type <strong style={{ color: 'var(--text-primary)' }}>DELETE</strong> below to confirm.
                  </div>
                  <input
                    className="del-input"
                    type="text"
                    value={deleteInput}
                    onChange={(e) => { setDeleteInput(e.target.value); setDeleteError('') }}
                    placeholder="Type DELETE to confirm"
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 8,
                      background: 'var(--bg-primary)', border: '0.5px solid var(--border)',
                      color: 'var(--text-primary)', fontSize: 13, fontFamily: 'Inter, sans-serif',
                      boxSizing: 'border-box', marginBottom: 8,
                    }}
                  />
                  {deleteError && (
                    <div style={{ fontSize: 12, color: '#f87171', fontFamily: 'Inter, sans-serif', marginBottom: 12 }}>
                      {deleteError}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => { setDeleteStep('idle'); setDeleteInput(''); setDeleteError('') }}
                      style={{
                        padding: '8px 18px', borderRadius: 40, border: '0.5px solid var(--border)',
                        background: 'transparent', color: 'var(--text-muted)', fontSize: 13,
                        fontFamily: 'Inter, sans-serif', cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleting || deleteInput !== 'DELETE'}
                      style={{
                        padding: '8px 20px', borderRadius: 40, border: 'none',
                        background: deleteInput === 'DELETE' ? '#f87171' : 'var(--bg-surface-2)',
                        color: deleteInput === 'DELETE' ? '#fff' : 'var(--text-muted)',
                        fontSize: 13, fontFamily: 'Inter, sans-serif',
                        cursor: deleteInput === 'DELETE' && !deleting ? 'pointer' : 'not-allowed',
                        transition: 'all 0.15s',
                      }}
                    >
                      {deleting ? 'Deleting…' : 'Delete account'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Sub-components ─────────────────────────────────────────── */
function SettingsRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
      <span style={{ fontSize: 14, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>{label}</span>
      {children}
    </div>
  )
}

/* ── Custom Select Dropdown ─────────────────────────────────── */
function CustomSelect<T extends string>({
  value, options, onChange,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const currentLabel = options.find((o) => o.value === value)?.label ?? value

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative', userSelect: 'none' }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '7px 12px', borderRadius: 8,
          border: `0.5px solid ${open ? 'var(--gold-border)' : 'var(--border)'}`,
          background: 'var(--bg-surface-2)',
          color: 'var(--text-primary)',
          fontSize: 13, fontFamily: 'Inter, sans-serif',
          cursor: 'pointer', minWidth: 130, justifyContent: 'space-between',
          transition: 'border-color 0.15s',
        }}
      >
        {currentLabel}
        <svg
          width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 4px)',
          background: 'var(--bg-surface)',
          border: '0.5px solid var(--border)',
          borderRadius: 10, overflow: 'hidden',
          zIndex: 200, minWidth: '100%',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          animation: 'fadeIn 0.1s ease',
        }}>
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              style={{
                display: 'block', width: '100%',
                padding: '9px 14px', border: 'none',
                background: opt.value === value ? 'var(--gold-faint)' : 'transparent',
                color: opt.value === value ? 'var(--gold)' : 'var(--text-primary)',
                fontSize: 13, fontFamily: 'Inter, sans-serif',
                cursor: 'pointer', textAlign: 'left',
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => { if (opt.value !== value) (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface-2)' }}
              onMouseLeave={(e) => { if (opt.value !== value) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
