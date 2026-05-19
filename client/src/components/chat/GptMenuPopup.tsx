'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { DomainKey, DOMAIN_OPTIONS } from '@/lib/types'

const MENU_DOMAINS: { key: DomainKey; showDividerBefore?: boolean }[] = [
  { key: 'auto' },
  { key: 'bns', showDividerBefore: true },
  { key: 'crpc' },
  { key: 'ipc' },
  { key: 'ita' },
  { key: 'criminal' },
]

interface GptMenuPopupProps {
  anchorRef: React.RefObject<HTMLElement>
  position: 'above' | 'below'
  activeDomain: DomainKey
  onSelect: (domain: DomainKey) => void
  onClose: () => void
}

export default function GptMenuPopup({
  anchorRef, position, activeDomain, onSelect, onClose,
}: GptMenuPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

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

  const slideAnim = position === 'above' ? 'slideUpMenu' : 'slideDownMenu'

  return (
    <>
      <style>{`
        @keyframes slideUpMenu {
          from { opacity:0; transform:translateY(8px) }
          to   { opacity:1; transform:translateY(0) }
        }
        @keyframes slideDownMenu {
          from { opacity:0; transform:translateY(-8px) }
          to   { opacity:1; transform:translateY(0) }
        }
        .gpt-menu-item:hover { background: var(--bg-surface-2) !important; color: var(--text-primary) !important; }
      `}</style>

      <div
        ref={popupRef}
        style={{
          position: 'absolute',
          ...(position === 'above' ? { bottom: '100%', marginBottom: 8 } : { top: '100%', marginTop: 8 }),
          left: 0,
          background: 'var(--bg-surface)',
          border: '0.5px solid var(--border)',
          borderRadius: 12,
          padding: '6px',
          zIndex: 300,
          minWidth: 220,
          boxShadow: position === 'above'
            ? '0 -4px 24px rgba(0,0,0,0.35)'
            : '0 8px 24px rgba(0,0,0,0.35)',
          animation: `${slideAnim} 0.18s ease`,
        }}
      >
        {/* Section label */}
        <div style={{
          fontSize: 10, color: 'var(--text-muted)',
          letterSpacing: '0.8px', textTransform: 'uppercase',
          padding: '4px 10px 6px', fontFamily: 'Inter, sans-serif',
        }}>
          Legal GPT
        </div>

        {MENU_DOMAINS.map(({ key, showDividerBefore }) => {
          const d = DOMAIN_OPTIONS[key]
          const isActive = activeDomain === key
          return (
            <div key={key}>
              {showDividerBefore && (
                <div style={{ height: '0.5px', background: 'var(--border)', margin: '4px 6px' }} />
              )}
              <button
                className="gpt-menu-item"
                onClick={() => { onSelect(key); onClose() }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '8px 10px', borderRadius: 8,
                  border: 'none',
                  background: isActive ? 'var(--gold-faint)' : 'transparent',
                  color: isActive ? 'var(--gold)' : 'var(--text-muted)',
                  fontSize: 13, fontFamily: 'Inter, sans-serif',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.12s',
                }}
              >
                {/* Domain icon */}
                <span style={{
                  width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                  background: isActive ? 'var(--gold-faint)' : 'var(--bg-surface-2)',
                  border: `0.5px solid ${isActive ? 'var(--gold-border)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13,
                }}>
                  {d.icon}
                </span>
                <span style={{ flex: 1 }}>{d.label}</span>
                {/* Active check */}
                {isActive && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
            </div>
          )
        })}

        {/* Divider + Explore */}
        <div style={{ height: '0.5px', background: 'var(--border)', margin: '4px 6px' }} />
        <button
          className="gpt-menu-item"
          onClick={() => { onClose(); router.push('/explore') }}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            width: '100%', padding: '8px 10px', borderRadius: 8,
            border: 'none', background: 'transparent',
            color: 'var(--text-muted)', fontSize: 13,
            fontFamily: 'Inter, sans-serif', cursor: 'pointer', textAlign: 'left',
            transition: 'all 0.12s',
          }}
        >
          <span style={{
            width: 26, height: 26, borderRadius: 7, flexShrink: 0,
            background: 'var(--bg-surface-2)', border: '0.5px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, color: 'var(--gold)',
          }}>↗</span>
          Explore All Legal GPTs
        </button>
      </div>
    </>
  )
}
