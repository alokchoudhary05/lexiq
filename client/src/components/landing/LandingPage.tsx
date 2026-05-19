'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LandingPage() {
  const router = useRouter()

  return (
    <div style={{ background: 'var(--navy)', color: '#f5f0e8', fontFamily: 'Georgia, serif', minHeight: '100vh' }}>

      {/* NAVBAR — no nav links */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 48px', borderBottom: '0.5px solid var(--border-gold)',
        background: 'rgba(10,22,40,0.95)', position: 'sticky', top: 0, zIndex: 10,
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 'bold', color: 'var(--navy)', fontFamily: 'Georgia, serif',
          }}>⚖</div>
          <div style={{ fontSize: 20, fontWeight: 'bold', color: '#f5f0e8', letterSpacing: 1 }}>
            Lex<span style={{ color: 'var(--gold)' }}>IQ</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => router.push('/auth')}
            style={{
              padding: '8px 20px', border: '0.5px solid var(--gold)', borderRadius: 6,
              color: 'var(--gold)', background: 'transparent', fontSize: 13,
              cursor: 'pointer', fontFamily: 'Inter, sans-serif', letterSpacing: '0.3px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(201,168,76,0.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            Log In
          </button>
          <button
            onClick={() => router.push('/auth')}
            style={{
              padding: '8px 20px', border: 'none', borderRadius: 6,
              background: 'var(--gold)', color: 'var(--navy)', fontSize: 13,
              cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Inter, sans-serif',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--gold-light)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--gold)')}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{
        minHeight: '88vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: '60px 48px', position: 'relative', overflow: 'hidden',
      }}>
        <div className="gold-grid-bg" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(201,168,76,0.12)', border: '0.5px solid var(--border-gold)',
          borderRadius: 20, padding: '6px 16px', fontSize: 12,
          color: 'var(--gold)', marginBottom: 28, fontFamily: 'Inter, sans-serif', letterSpacing: '0.5px',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', animation: 'pulse-gold 2s infinite' }} />
          India&apos;s Premier Legal Intelligence Platform
        </div>

        <h1 style={{ fontSize: 56, lineHeight: 1.15, color: '#f5f0e8', maxWidth: 700, marginBottom: 20, letterSpacing: '-0.5px' }}>
          Your <span style={{ color: 'var(--gold)' }}>Legal Counsel</span>, Available 24/7
        </h1>

        <p style={{ fontSize: 17, color: 'var(--text-muted)', maxWidth: 520, lineHeight: 1.7, marginBottom: 40, fontFamily: 'Inter, sans-serif' }}>
          LexIQ provides specialized legal guidance on BNS, CrPC, IPC, Income Tax &amp; Criminal Law — built for every Indian, from students to advocates.
        </p>

        {/* Single centered CTA */}
        <div style={{ marginBottom: 64 }}>
          <button
            onClick={() => router.push('/auth')}
            style={{
              padding: '14px 40px', borderRadius: 8, fontSize: 15,
              cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600,
              background: 'var(--gold)', color: 'var(--navy)', border: 'none', letterSpacing: '0.3px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--gold-light)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--gold)')}
          >
            Start Free Consultation
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 48 }}>
          {[
            { num: '5+', label: 'Legal Domains' },
            { num: '3', label: 'User Segments' },
            { num: '24/7', label: 'Availability' },
            { num: 'Hi+En', label: 'Bilingual Support' },
          ].map((stat, i, arr) => (
            <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: 48 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 26, color: 'var(--gold)', fontWeight: 'bold' }}>{stat.num}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', letterSpacing: '0.8px', textTransform: 'uppercase' }}>{stat.label}</div>
              </div>
              {i < arr.length - 1 && <div style={{ width: 1, height: 36, background: 'var(--border-gold)' }} />}
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section style={{ padding: '80px 48px' }}>
        <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', textAlign: 'center', marginBottom: 12 }}>
          What LexIQ Offers
        </div>
        <h2 style={{ fontSize: 34, textAlign: 'center', marginBottom: 12, color: '#f5f0e8' }}>
          Legal Intelligence, Reimagined
        </h2>
        <div style={{ width: 60, height: 2, background: 'var(--gold)', margin: '0 auto 48px', borderRadius: 2 }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, maxWidth: 1100, margin: '0 auto' }}>
          {FEATURES.map((f) => (
            <div
              key={f.title}
              style={{
                background: 'var(--navy-mid)', border: '0.5px solid var(--border-gold)',
                borderRadius: 12, padding: 28, transition: 'border-color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--gold)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-gold)')}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: 'rgba(201,168,76,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
              }}>
                <span style={{ fontSize: 22 }}>{f.icon}</span>
              </div>
              <div style={{ fontSize: 16, color: '#f5f0e8', marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* LEGAL DOMAINS SECTION — all cards uniform, no special first-card border */}
      <section style={{ padding: '80px 48px', background: 'var(--navy-mid)' }}>
        <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', textAlign: 'center', marginBottom: 12 }}>
          Specialized Coverage
        </div>
        <h2 style={{ fontSize: 34, textAlign: 'center', marginBottom: 12, color: '#f5f0e8' }}>Choose Your Legal Domain</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 15, fontFamily: 'Inter, sans-serif', margin: '0 auto 40px', maxWidth: 500 }}>
          Five specialized areas of Indian law, each focused on specific statutes and provisions.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, maxWidth: 1100, margin: '0 auto' }}>
          {LEGAL_DOMAINS.map((m) => (
            <div
              key={m.name}
              onClick={() => router.push('/auth')}
              style={{
                background: 'var(--navy)',
                border: '0.5px solid var(--border-gold)',
                borderRadius: 10, padding: '20px 14px', textAlign: 'center', cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold)'; (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,76,0.06)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-gold)'; (e.currentTarget as HTMLElement).style.background = 'var(--navy)'; }}
            >
              <div style={{ fontSize: 28, marginBottom: 10 }}>{m.icon}</div>
              <div style={{ fontSize: 12, color: '#f5f0e8', fontFamily: 'Inter, sans-serif', fontWeight: 600, lineHeight: 1.4 }}>{m.name}</div>
              <div style={{ fontSize: 10, color: 'var(--gold)', fontFamily: 'Inter, sans-serif', marginTop: 4, letterSpacing: '0.5px' }}>{m.tag}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA SECTION — Continue as Guest removed */}
      <section style={{ padding: '80px 48px', textAlign: 'center', background: 'linear-gradient(180deg, var(--navy) 0%, var(--navy-mid) 100%)', borderTop: '0.5px solid var(--border-gold)' }}>
        <div style={{
          maxWidth: 580, margin: '0 auto',
          background: 'var(--navy-light)', border: '0.5px solid var(--gold)',
          borderRadius: 16, padding: 48,
        }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>⚖</div>
          <h2 style={{ fontSize: 30, marginBottom: 12 }}>Justice Begins With Knowledge</h2>
          <p style={{ color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>
            Join students, lawyers, and citizens using LexIQ to understand their rights and navigate the Indian legal system.
          </p>
          <button
            onClick={() => router.push('/auth')}
            style={{
              width: '100%', padding: '14px 0', borderRadius: 8, border: 'none',
              background: 'var(--gold)', color: 'var(--navy)', fontSize: 15, fontWeight: 700,
              fontFamily: 'Inter, sans-serif', cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--gold-light)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--gold)')}
          >
            Create Free Account
          </button>
        </div>
      </section>

      {/* FOOTER — About added before Privacy Policy, year 2026, real page links */}
      <footer style={{
        padding: '24px 48px', borderTop: '0.5px solid var(--border-gold)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, background: 'var(--gold)', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--navy)', fontWeight: 'bold' }}>⚖</div>
          <span style={{ color: '#f5f0e8', fontWeight: 600 }}>LexIQ</span>
          <span>— India&apos;s Legal Intelligence Platform</span>
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          {[
            { label: 'About', href: '/about' },
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Terms of Use', href: '/terms' },
            { label: 'Legal Disclaimer', href: '/legal-disclaimer' },
          ].map((l) => (
            <Link key={l.label} href={l.href}
              style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >{l.label}</Link>
          ))}
          <span style={{ color: 'var(--gold)' }}>© 2026 LexIQ</span>
        </div>
      </footer>
    </div>
  )
}

const FEATURES = [
  { icon: '📄', title: 'Specialized Legal Coverage', desc: 'Focused guidance on BNS, CrPC, IPC, Income Tax, and Criminal Law — each grounded in domain-specific statutes and provisions.' },
  { icon: 'ℹ️', title: 'General Legal Queries', desc: 'A broad-spectrum assistant for everyday legal questions — citations, explanations, and plain-language summaries instantly.' },
  { icon: '👥', title: 'For Everyone', desc: 'Students, advocates, and citizens — LexIQ adapts its response depth and language based on your profile and needs.' },
  { icon: '💬', title: 'Hindi + English', desc: 'Full bilingual support — ask in Hindi, get answers in English or vice versa. Legal knowledge without language barriers.' },
  { icon: '📦', title: 'Consultation History', desc: 'Save and revisit past consultations. Build a personal legal knowledge base over time with your conversation history.' },
  { icon: '📋', title: 'Bare Acts Reference', desc: 'Instant access to full text of Indian statutes. Ask about any section and get the exact wording with a clear explanation.' },
]

const LEGAL_DOMAINS = [
  { icon: '⚖', name: 'Bharatiya Nyaya Sanhita', tag: 'BNS 2023' },
  { icon: '📋', name: 'Code of Criminal Procedure', tag: 'CrPC' },
  { icon: '📜', name: 'Indian Penal Code (Legacy)', tag: 'IPC 1860' },
  { icon: '💼', name: 'Income Tax Law', tag: 'IT Act' },
  { icon: '🔒', name: 'Criminal Law', tag: 'General' },
]
