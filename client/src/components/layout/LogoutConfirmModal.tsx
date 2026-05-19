'use client'

import { useEffect, useRef } from 'react'

interface LogoutConfirmModalProps {
  userEmail: string
  onConfirm: () => void
  onCancel: () => void
}

export default function LogoutConfirmModal({ userEmail, onConfirm, onCancel }: LogoutConfirmModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onCancel])

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onCancel() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.15s ease',
      }}
    >
      <style>{`@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }`}
      </style>

      <div style={{
        background: 'var(--bg-surface)',
        border: '0.5px solid var(--border)',
        borderRadius: 16,
        padding: '36px 32px 28px',
        width: '100%', maxWidth: 360,
        textAlign: 'center',
        animation: 'slideUp 0.2s ease',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        <div style={{ fontSize: 22, fontFamily: 'Georgia, serif', color: 'var(--text-primary)', marginBottom: 12, lineHeight: 1.4 }}>
          Are you sure you want<br />to log out?
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', marginBottom: 28, lineHeight: 1.5 }}>
          Log out of LexIQ as{' '}
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{userEmail}</span>?
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={onConfirm}
            style={{
              width: '100%', padding: '13px',
              borderRadius: 40, border: 'none',
              background: 'var(--text-primary)', color: 'var(--bg-primary)',
              fontSize: 14, fontWeight: 600, fontFamily: 'Inter, sans-serif',
              cursor: 'pointer', transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Log out
          </button>
          <button
            onClick={onCancel}
            style={{
              width: '100%', padding: '13px',
              borderRadius: 40,
              border: '0.5px solid var(--border)',
              background: 'var(--bg-surface-2)', color: 'var(--text-muted)',
              fontSize: 14, fontWeight: 500, fontFamily: 'Inter, sans-serif',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
