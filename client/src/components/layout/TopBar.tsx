'use client'

import { useState, useRef } from 'react'
import { DomainKey, DOMAIN_OPTIONS } from '@/lib/types'
import GptMenuPopup from '@/components/chat/GptMenuPopup'

interface TopBarProps {
  activeDomain: DomainKey
  onSelectDomain: (domain: DomainKey) => void
}

export default function TopBar({ activeDomain, onSelectDomain }: TopBarProps) {
  const [gptMenuOpen, setGptMenuOpen] = useState(false)
  const lexiqBtnRef = useRef<HTMLButtonElement>(null)
  const domain = DOMAIN_OPTIONS[activeDomain]

  return (
    <div style={{
      height: 52,
      padding: '0 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '0.5px solid var(--border)',
      flexShrink: 0,
      position: 'relative',   // needed so popup is positioned relative to TopBar
    }}>

      {/* LexIQ + domain badge — clickable */}
      <div style={{ position: 'relative' }}>
        <button
          ref={lexiqBtnRef}
          onClick={() => setGptMenuOpen((v) => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 14, fontWeight: 600,
            cursor: 'pointer', color: 'var(--text-primary)',
            userSelect: 'none', background: 'none', border: 'none',
            padding: '4px 6px', borderRadius: 8,
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <span style={{ fontFamily: 'Georgia, serif' }}>LexIQ</span>
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: gptMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
          <div style={{
            fontSize: 11, background: 'var(--gold-faint)',
            border: '0.5px solid var(--gold-border)',
            borderRadius: 12, padding: '3px 10px', color: 'var(--gold)',
            marginLeft: 4, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#4ade80', display: 'inline-block',
              animation: 'pulse-gold 2s infinite',
            }} />
            {domain.shortLabel} Active
          </div>
        </button>

        {/* GPT Menu — floats below the LexIQ button */}
        {gptMenuOpen && (
          <GptMenuPopup
            anchorRef={lexiqBtnRef as React.RefObject<HTMLElement>}
            position="below"
            activeDomain={activeDomain}
            onSelect={(d) => { onSelectDomain(d); setGptMenuOpen(false) }}
            onClose={() => setGptMenuOpen(false)}
          />
        )}
      </div>

      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
        {domain.description}
      </div>
    </div>
  )
}
