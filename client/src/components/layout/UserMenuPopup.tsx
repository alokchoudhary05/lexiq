'use client'

import { useEffect, useRef } from 'react'

interface UserMenuPopupProps {
  anchorRef: React.RefObject<HTMLDivElement>
  onProfile: () => void
  onSettings: () => void
  onLogout: () => void
  onClose: () => void
}

const menuItems = [
  {
    id: 'profile',
    label: 'Profile',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7"/>
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.07 4.93A10 10 0 105.07 19.07M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
      </svg>
    ),
  },
  { id: 'divider' },
  {
    id: 'logout',
    label: 'Log out',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
      </svg>
    ),
    danger: false,
  },
]

export default function UserMenuPopup({ anchorRef, onProfile, onSettings, onLogout, onClose }: UserMenuPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null)

  // Close on outside click or Escape
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        popupRef.current && !popupRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) {
        onClose()
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose, anchorRef])

  const handlers: Record<string, () => void> = {
    profile: onProfile,
    settings: onSettings,
    logout: onLogout,
  }

  return (
    <>
      <style>{`
        @keyframes slideUpMenu { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        .user-menu-item:hover { background: var(--bg-surface-2) !important; color: var(--text-primary) !important; }
      `}</style>

      <div
        ref={popupRef}
        style={{
          position: 'absolute',
          bottom: '100%',
          left: 8,
          right: 8,
          marginBottom: 6,
          background: 'var(--bg-surface)',
          border: '0.5px solid var(--border)',
          borderRadius: 12,
          padding: '6px',
          zIndex: 200,
          boxShadow: '0 -4px 24px rgba(0,0,0,0.4)',
          animation: 'slideUpMenu 0.15s ease',
        }}
      >
        {menuItems.map((item) => {
          if (item.id === 'divider') {
            return <div key="divider" style={{ height: '0.5px', background: 'var(--border)', margin: '5px 4px' }} />
          }
          return (
            <button
              key={item.id}
              className="user-menu-item"
              onClick={() => { onClose(); handlers[item.id]?.() }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '9px 12px', borderRadius: 8,
                border: 'none', background: 'transparent',
                color: 'var(--text-muted)', fontSize: 13,
                fontFamily: 'Inter, sans-serif', cursor: 'pointer',
                textAlign: 'left', transition: 'all 0.12s',
              }}
            >
              {item.icon}
              {item.label}
            </button>
          )
        })}
      </div>
    </>
  )
}
