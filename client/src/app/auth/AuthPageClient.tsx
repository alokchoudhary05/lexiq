'use client'

import AuthForm from '@/components/auth/AuthForm'

export default function AuthPageClient() {
  return (
    <div style={{ background: 'var(--navy)', color: '#f5f0e8', minHeight: '100vh', display: 'flex' }}>

      {/* LEFT PANEL */}
      <div style={{
        width: '44%', background: 'var(--navy-mid)',
        borderRight: '0.5px solid var(--border-gold)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '60px 48px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Grid bg */}
        <div className="gold-grid-bg" style={{ position: 'absolute', inset: 0 }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48, zIndex: 1 }}>
          <div style={{
            width: 40, height: 40, background: 'var(--gold)', borderRadius: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, color: 'var(--navy)',
          }}>⚖</div>
          <div style={{ fontSize: 22, fontWeight: 'bold', letterSpacing: 1 }}>
            Lex<span style={{ color: 'var(--gold)' }}>IQ</span>
          </div>
        </div>

        {/* Seal */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          border: '1.5px solid var(--border-gold)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, color: 'var(--gold)',
          margin: '40px 0 20px', zIndex: 1,
          background: 'rgba(201,168,76,0.06)',
        }}>⚖</div>

        {/* Quote */}
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 22, lineHeight: 1.5, color: '#f5f0e8', maxWidth: 320, fontStyle: 'italic', zIndex: 1, marginBottom: 20 }}>
          &ldquo;Knowledge of the law is the{' '}
          <span style={{ color: 'var(--gold)' }}>first step</span>{' '}
          towards justice.&rdquo;
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', zIndex: 1 }}>
          India&apos;s AI-powered legal intelligence platform
        </div>



      </div>

      {/* RIGHT PANEL */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', padding: '60px 48px',
      }}>
        <AuthForm />
      </div>
    </div>
  )
}
