'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useSessions } from '@/lib/hooks/useSessions'
import Sidebar from '@/components/layout/Sidebar'
import { DomainKey } from '@/lib/types'

const GPT_CARDS = [
  {
    key: 'bns' as DomainKey,
    icon: '⚖',
    name: 'Bharatiya Nyaya Sanhita GPT',
    desc: "Expert on BNS 2023 — India's new criminal code replacing IPC. Ask about offences, punishments, and procedures.",
    tags: ['BNS 2023', 'Criminal'],
  },
  {
    key: 'crpc' as DomainKey,
    icon: '📋',
    name: 'CrPC Expert GPT',
    desc: 'Deep knowledge of Code of Criminal Procedure — bail, trials, FIR, appeals, warrants and court processes.',
    tags: ['CrPC', 'Procedure'],
  },
  {
    key: 'ipc' as DomainKey,
    icon: '📜',
    name: 'Indian Penal Code GPT',
    desc: 'Legacy IPC 1860 expert. Useful for cases registered before BNS came into effect and historical legal research.',
    tags: ['IPC 1860', 'Legacy'],
  },
  {
    key: 'ita' as DomainKey,
    icon: '💼',
    name: 'Income Tax Law GPT',
    desc: "Navigate India's Income Tax Act — deductions, exemptions, TDS, returns, assessments and compliance queries.",
    tags: ['IT Act', 'Tax'],
  },
  {
    key: 'criminal' as DomainKey,
    icon: '🔒',
    name: 'Criminal Law GPT',
    desc: 'Broad criminal law assistant covering general principles, defences, evidence, and landmark judgements across statutes.',
    tags: ['Criminal', 'General'],
  },
]

export default function ExplorePageClient() {
  const { user, loading, signOut } = useAuth()
  const { sessions } = useSessions()
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [activeDomain, setActiveDomain] = useState<DomainKey>('auto')

  const filtered = GPT_CARDS.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.desc.toLowerCase().includes(search.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  )

  function handleStartChat(key: DomainKey) {
    setActiveDomain(key)
    router.push(`/chat?domain=${key}`)
  }

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ fontSize: 40 }}>⚖</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <Sidebar
        user={user}
        sessions={sessions}
        activeSessionId={null}
        activeDomain={activeDomain}
        onNewChat={() => router.push('/chat')}
        onSelectSession={() => router.push('/chat')}
        onSelectDomain={(d) => handleStartChat(d)}
        onSignOut={signOut}
      />

      {/* Explore Content */}
      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-primary)' }}>
        <div style={{ padding: '28px 32px 0' }}>
          {/* Back button */}
          <div
            onClick={() => router.push('/chat')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer',
              padding: '6px 10px', borderRadius: 7, width: 'fit-content', marginBottom: 16,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--gold)'; (e.currentTarget as HTMLElement).style.background = 'var(--gold-faint)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back to chat
          </div>

          <h1 style={{ fontSize: 24, fontFamily: 'Georgia, serif', color: 'var(--text-primary)', marginBottom: 4 }}>
            Explore Legal GPTs
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, fontFamily: 'Inter, sans-serif' }}>
            Specialized AI models trained on India&apos;s core legal frameworks
          </p>

          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--bg-surface)', border: '0.5px solid var(--border)',
            borderRadius: 10, padding: '10px 14px', marginBottom: 24,
          }}
            onFocusCapture={(e) => (e.currentTarget.style.borderColor = 'var(--gold-border)')}
            onBlurCapture={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
              <circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21" strokeLinecap="round"/>
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search legal GPTs..."
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontSize: 14, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif',
              }}
            />
          </div>

          <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 14, fontFamily: 'Inter, sans-serif' }}>
            All Legal GPT Models
          </div>
        </div>

        {/* Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 32px 24px' }}>
          {filtered.map((card) => (
            <div
              key={card.key}
              style={{
                background: 'var(--bg-surface)', border: '0.5px solid var(--border)',
                borderRadius: 14, padding: 18, cursor: 'pointer',
                display: 'flex', alignItems: 'flex-start', gap: 14,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold-border)'; (e.currentTarget as HTMLElement).style.background = 'var(--gold-faint)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface)'; }}
            >
              <div style={{
                width: 46, height: 46, borderRadius: 11,
                background: 'var(--gold-faint)', border: '0.5px solid var(--gold-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, flexShrink: 0,
              }}>
                {card.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {card.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--gold)', marginBottom: 6 }}>By LexIQ</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, fontFamily: 'Inter, sans-serif' }}>
                  {card.desc}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
                  {card.tags.map((tag) => (
                    <span key={tag} style={{
                      fontSize: 10, background: 'var(--bg-surface-2)',
                      border: '0.5px solid var(--border)', borderRadius: 4,
                      padding: '2px 7px', color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif',
                    }}>
                      {tag}
                    </span>
                  ))}
                  <span
                    onClick={() => handleStartChat(card.key)}
                    style={{ fontSize: 11, color: 'var(--gold)', marginLeft: 'auto', cursor: 'pointer' }}
                    onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                    onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                  >
                    Start chat →
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Coming Soon Card */}
          <div style={{
            background: 'var(--bg-surface)', border: '0.5px dashed var(--border)',
            borderRadius: 14, padding: 18, opacity: 0.5,
            display: 'flex', alignItems: 'flex-start', gap: 14,
          }}>
            <div style={{
              width: 46, height: 46, borderRadius: 11,
              background: 'var(--bg-surface-2)', border: '0.5px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, color: 'var(--text-muted)', flexShrink: 0,
            }}>
              +
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                More GPTs coming soon
              </div>
              <div style={{ fontSize: 11, color: 'transparent', marginBottom: 6 }}>.</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, fontFamily: 'Inter, sans-serif' }}>
                Constitution, NDPS, Cyber Law, Consumer Protection and more domain GPTs are in development.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
