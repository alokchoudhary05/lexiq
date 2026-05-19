'use client'

import { useRef, useEffect, useState } from 'react'
import { DomainKey, DOMAIN_OPTIONS } from '@/lib/types'
import GptMenuPopup from './GptMenuPopup'

interface InputBarProps {
  onSend: (text: string) => void
  isStreaming: boolean
  activeDomain: DomainKey
  onSelectDomain: (domain: DomainKey) => void
}

/** Convert #rrggbb hex to rgba(r,g,b,alpha) string */
function hexAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export default function InputBar({ onSend, isStreaming, activeDomain, onSelectDomain }: InputBarProps) {
  const [text, setText] = useState('')
  const [gptMenuOpen, setGptMenuOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const plusBtnRef = useRef<HTMLButtonElement>(null)

  const domainColor = DOMAIN_OPTIONS[activeDomain].color

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
  }, [text])

  function handleSend() {
    const q = text.trim()
    if (!q || isStreaming) return
    setText('')
    onSend(q)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Dynamic keyframe CSS — regenerated whenever domain colour changes
  // Idle: gentle breathing glow  |  Focused: brighter, tighter ring
  const glowCSS = `
    @keyframes inputGlowPulse {
      0%, 100% {
        border-color: ${hexAlpha(domainColor, 0.45)};
        box-shadow:
          0 0 0 3px  ${hexAlpha(domainColor, 0.10)},
          0 0 18px 2px ${hexAlpha(domainColor, 0.08)};
      }
      50% {
        border-color: ${hexAlpha(domainColor, 0.80)};
        box-shadow:
          0 0 0 3px  ${hexAlpha(domainColor, 0.20)},
          0 0 26px 5px ${hexAlpha(domainColor, 0.14)};
      }
    }
    @keyframes inputGlowFocused {
      0%, 100% {
        border-color: ${hexAlpha(domainColor, 0.70)};
        box-shadow:
          0 0 0 4px  ${hexAlpha(domainColor, 0.18)},
          0 0 28px 4px ${hexAlpha(domainColor, 0.16)};
      }
      50% {
        border-color: ${hexAlpha(domainColor, 1.00)};
        box-shadow:
          0 0 0 4px  ${hexAlpha(domainColor, 0.28)},
          0 0 36px 6px ${hexAlpha(domainColor, 0.22)};
      }
    }
  `

  const animationName  = focused ? 'inputGlowFocused' : 'inputGlowPulse'
  const animationSpeed = focused ? '1.6s' : '2.8s'

  return (
    <div style={{ padding: '14px 20px 18px', background: 'var(--bg-primary)' }}>

      {/* Injected animation keyframes — colour updates with domain */}
      <style>{glowCSS}</style>

      {/* Input card */}
      <div
        style={{
          maxWidth: 680,
          margin: '0 auto',
          background: 'var(--bg-surface)',
          border: `1.5px solid ${hexAlpha(domainColor, 0.45)}`,
          borderRadius: 16,
          overflow: 'visible',
          position: 'relative',
          // Breathing glow animation
          animation: `${animationName} ${animationSpeed} ease-in-out infinite`,
          transition: 'background 0.15s',
        }}
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={(e) => {
          // Only mark unfocused if focus left the entire card
          if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget as Node)) {
            setFocused(false)
          }
        }}
      >
        {/* Text row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', padding: '4px 4px 4px 14px' }}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about Indian law..."
            rows={1}
            disabled={isStreaming}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: 14, padding: '10px 0',
              resize: 'none', fontFamily: 'Inter, sans-serif', lineHeight: 1.6,
              minHeight: 44, maxHeight: 120,
            }}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || isStreaming}
            style={{
              width: 34, height: 34, borderRadius: 9,
              border: 'none',
              background: (!text.trim() || isStreaming) ? 'var(--bg-surface-2)' : 'var(--gold)',
              color: (!text.trim() || isStreaming) ? 'var(--text-muted)' : '#0d0d0d',
              fontSize: 15, cursor: (!text.trim() || isStreaming) ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: 4, flexShrink: 0, transition: 'all 0.15s',
            }}
          >
            ↑
          </button>
        </div>

        {/* Footer row — + button with popup */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '4px 12px 10px', position: 'relative' }}>
          <button
            ref={plusBtnRef}
            onClick={() => setGptMenuOpen((v) => !v)}
            title="Switch Legal GPT"
            style={{
              width: 30, height: 30,
              background: gptMenuOpen ? 'var(--gold-faint)' : 'var(--bg-surface-2)',
              border: `0.5px solid ${gptMenuOpen ? 'var(--gold-border)' : 'var(--border)'}`,
              borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: gptMenuOpen ? 'var(--gold)' : 'var(--text-muted)',
              fontSize: 18, fontWeight: 300, flexShrink: 0, transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              if (!gptMenuOpen) {
                (e.currentTarget as HTMLElement).style.color = 'var(--gold)'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--gold-border)'
              }
            }}
            onMouseLeave={(e) => {
              if (!gptMenuOpen) {
                (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
              }
            }}
          >
            +
          </button>

          {/* GPT Menu Popup */}
          {gptMenuOpen && (
            <GptMenuPopup
              anchorRef={plusBtnRef as React.RefObject<HTMLElement>}
              position="above"
              activeDomain={activeDomain}
              onSelect={(d) => { onSelectDomain(d); setGptMenuOpen(false) }}
              onClose={() => setGptMenuOpen(false)}
            />
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{
        maxWidth: 680, margin: '6px auto 0',
        textAlign: 'center', fontSize: 11,
        color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', opacity: 0.75,
      }}>
        LexIQ may make errors. Verify important information with a qualified advocate.
      </div>
    </div>
  )
}
