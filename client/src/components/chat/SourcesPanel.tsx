'use client'

import { useEffect } from 'react'

interface SourcesPanelProps {
  sources: string[]
  onClose: () => void
}

/** Derive a display title and domain from a raw source string like
 *  "Bharatiya Nyaya Sanhita, 2023 — Section 103: [1] Whoever commits..."
 *  We strip the long citation text and show a clean title + subtitle. */
function parseSource(raw: string): { title: string; subtitle: string; icon: string } {
  // Try to extract "Act/Code, Year — Section X" pattern
  const sectionMatch = raw.match(/^(.+?),?\s*(\d{4})?\s*[—–-]+\s*(.+?)(?:\[|:)/i)
  if (sectionMatch) {
    const act = sectionMatch[1].trim()
    const year = sectionMatch[2] ? `, ${sectionMatch[2]}` : ''
    const section = sectionMatch[3].trim()
    return {
      title: `${act}${year}`,
      subtitle: section,
      icon: getActIcon(act),
    }
  }

  // Fallback: use the first 60 chars as title
  const short = raw.length > 60 ? raw.slice(0, 57) + '…' : raw
  return { title: short, subtitle: '', icon: '📄' }
}

function getActIcon(act: string): string {
  const l = act.toLowerCase()
  if (l.includes('nyaya') || l.includes('bns')) return '⚖️'
  if (l.includes('penal') || l.includes('ipc')) return '📜'
  if (l.includes('crpc') || l.includes('procedure')) return '📋'
  if (l.includes('income') || l.includes('tax')) return '💼'
  if (l.includes('constitution')) return '🏛️'
  return '📄'
}

export default function SourcesPanel({ sources, onClose }: SourcesPanelProps) {
  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const displayed = sources.slice(0, 5)

  return (
    <>

      {/* Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 300, zIndex: 201,
          background: 'var(--bg-sidebar)',
          borderLeft: '0.5px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.35)',
          animation: 'slideInFromRight 0.22s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 16px 14px',
          borderBottom: '0.5px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>📚</span>
            <span style={{
              fontSize: 14, fontWeight: 700,
              fontFamily: 'Georgia, serif',
              color: 'var(--text-primary)',
              letterSpacing: '0.2px',
            }}>
              Sources
            </span>
            <span style={{
              fontSize: 10, fontWeight: 600,
              background: 'var(--gold-faint)',
              border: '0.5px solid var(--gold-border)',
              borderRadius: 10, padding: '1px 7px',
              color: 'var(--gold)',
            }}>
              {displayed.length}
            </span>
          </div>

          <button
            onClick={onClose}
            title="Close sources"
            style={{
              background: 'transparent', border: 'none',
              cursor: 'pointer', color: 'var(--text-muted)',
              padding: '4px', borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'
              ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-surface-2)'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'
              ;(e.currentTarget as HTMLElement).style.background = 'transparent'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Subtitle */}
        <div style={{
          padding: '10px 16px 6px',
          fontSize: 11, color: 'var(--text-muted)',
          lineHeight: 1.5,
        }}>
          Legal references retrieved from verified documents for this response.
        </div>

        {/* Source List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px 16px' }}>
          {displayed.map((src, i) => {
            const { title, subtitle, icon } = parseSource(src)
            return (
              <div
                key={i}
                style={{
                  padding: '12px 12px',
                  borderRadius: 10,
                  marginBottom: 6,
                  background: 'var(--bg-surface)',
                  border: '0.5px solid var(--border)',
                  cursor: 'default',
                  transition: 'all 0.15s',
                  animation: `fadeInSlide 0.25s ease ${i * 0.06}s both`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold-border)'
                  ;(e.currentTarget as HTMLElement).style.background = 'var(--gold-faint)'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                  ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-surface)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 12.5, fontWeight: 600,
                      color: 'var(--text-primary)',
                      lineHeight: 1.4,
                      marginBottom: subtitle ? 3 : 0,
                    }}>
                      {title}
                    </div>
                    {subtitle && (
                      <div style={{
                        fontSize: 11, color: 'var(--gold)',
                        lineHeight: 1.4, fontStyle: 'italic',
                      }}>
                        {subtitle}
                      </div>
                    )}
                  </div>
                  {/* Source index badge */}
                  <span style={{
                    fontSize: 9, fontWeight: 700,
                    background: 'var(--bg-surface-2)',
                    border: '0.5px solid var(--border)',
                    borderRadius: 6, padding: '2px 5px',
                    color: 'var(--text-muted)', flexShrink: 0,
                    marginTop: 1,
                  }}>
                    {i + 1}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer note */}
        <div style={{
          padding: '10px 16px 14px',
          borderTop: '0.5px solid var(--border)',
          fontSize: 10.5, color: 'var(--text-dim)',
          lineHeight: 1.5, textAlign: 'center',
        }}>
          Sources are extracted from verified legal documents only.
          Always verify with a qualified advocate.
        </div>
      </div>

      <style>{`
        @keyframes slideInFromRight {
          from { transform: translateX(100%); opacity: 0.6; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes fadeInSlide {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </>
  )
}
