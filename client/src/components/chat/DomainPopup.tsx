'use client'

import { useRouter } from 'next/navigation'
import { DomainKey, DOMAIN_OPTIONS } from '@/lib/types'

interface DomainPopupProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (domain: DomainKey) => void
  activeDomain: DomainKey
}

const POPUP_DOMAINS: DomainKey[] = ['bns', 'crpc', 'ipc', 'ita', 'criminal']

export default function DomainPopup({ isOpen, onClose, onSelect, activeDomain }: DomainPopupProps) {
  const router = useRouter()

  if (!isOpen) return null

  function handleSelect(domain: DomainKey) {
    onSelect(domain)
    onClose()
  }

  function handleExplore() {
    onClose()
    router.push('/explore')
  }

  return (
    <div
      style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 20,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        paddingBottom: 80,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: '#1e1e1e',
        border: '0.5px solid var(--gold-border)',
        borderRadius: 16,
        padding: 16,
        width: 360,
      }}>
        <div style={{
          fontSize: 11, color: 'var(--text-muted)',
          letterSpacing: '0.8px', textTransform: 'uppercase',
          marginBottom: 12, padding: '0 2px',
        }}>
          Switch to a Legal GPT
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {POPUP_DOMAINS.map((key) => {
            const d = DOMAIN_OPTIONS[key]
            const isActive = activeDomain === key
            return (
              <div
                key={key}
                onClick={() => handleSelect(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 10,
                  background: isActive ? 'var(--gold-faint)' : 'var(--bg-surface-2)',
                  border: isActive ? '0.5px solid var(--gold-border)' : '0.5px solid var(--border)',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold-border)'; (e.currentTarget as HTMLElement).style.background = 'var(--gold-faint)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = isActive ? 'var(--gold-border)' : 'var(--border)'; (e.currentTarget as HTMLElement).style.background = isActive ? 'var(--gold-faint)' : 'var(--bg-surface-2)'; }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'var(--gold-faint)', border: '0.5px solid var(--gold-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, flexShrink: 0,
                }}>
                  {d.icon}
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.3 }}>
                    {d.label}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{d.description.slice(0, 28)}...</div>
                </div>
              </div>
            )
          })}

          {/* Explore All */}
          <div
            onClick={handleExplore}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10,
              background: 'var(--bg-surface-2)', border: '0.5px solid var(--border)',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold-border)'; (e.currentTarget as HTMLElement).style.background = 'var(--gold-faint)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface-2)'; }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--gold-faint)', border: '0.5px solid var(--gold-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, flexShrink: 0, color: 'var(--gold)',
            }}>
              ↗
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.3 }}>
                Explore All GPTs
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Browse full list</div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right', marginTop: 10 }}>
          <button
            onClick={onClose}
            style={{
              fontSize: 11, color: 'var(--text-muted)',
              background: 'transparent', border: 'none', cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            Close ✕
          </button>
        </div>
      </div>
    </div>
  )
}
