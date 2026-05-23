import Link from 'next/link'

export const metadata = { title: 'About — LexIQ', description: 'Learn about LexIQ, India\'s legal intelligence platform.' }

export default function AboutPage() {
  return (
    <div style={{ background: 'var(--navy)', color: '#f5f0e8', fontFamily: 'Georgia, serif', minHeight: '100vh' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 48px', borderBottom: '0.5px solid var(--border-gold)', background: 'rgba(10,22,40,0.95)', backdropFilter: 'blur(12px)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--navy)', fontWeight: 'bold' }}>⚖</div>
          <div style={{ fontSize: 20, fontWeight: 'bold', color: '#f5f0e8', letterSpacing: 1 }}>Lex<span style={{ color: 'var(--gold)' }}>IQ</span></div>
        </Link>
        <Link href="/" style={{ fontSize: 13, color: 'var(--gold)', fontFamily: 'Inter, sans-serif', textDecoration: 'none' }}>← Back to Home</Link>
      </nav>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '72px 48px' }}>
        <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', marginBottom: 12 }}>About</div>
        <h1 style={{ fontSize: 40, marginBottom: 24, lineHeight: 1.2 }}>India&apos;s Legal Intelligence Platform</h1>
        <div style={{ width: 60, height: 2, background: 'var(--gold)', marginBottom: 40, borderRadius: 2 }} />

        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.9 }}>
          <p style={{ marginBottom: 24 }}>
            <strong style={{ color: '#f5f0e8' }}>LexIQ</strong> is an advanced legal intelligence platform built to make Indian law accessible to everyone. We provide a powerful and easy-to-use tool for legal professionals, students, and citizens, ensuring that trusted legal knowledge is always within reach.
          </p>
          <p style={{ marginBottom: 24 }}>
            Our platform covers the foundational pillars of Indian law: the <strong style={{ color: '#f5f0e8' }}>Bharatiya Nyaya Sanhita (BNS 2023)</strong>, the <strong style={{ color: '#f5f0e8' }}>Code of Criminal Procedure (CrPC)</strong>, the <strong style={{ color: '#f5f0e8' }}>Indian Penal Code (IPC 1860)</strong>, <strong style={{ color: '#f5f0e8' }}>Income Tax statutes</strong>, and <strong style={{ color: '#f5f0e8' }}>general criminal law</strong>. These resources are brought together in one easy-to-use interface.
          </p>

          <h2 style={{ color: '#f5f0e8', fontSize: 22, marginBottom: 16, marginTop: 40, fontFamily: 'Georgia, serif' }}>Our Mission</h2>
          <p style={{ marginBottom: 24 }}>
            Our objective is to break down complex legal language. We turn difficult legal texts into clear, practical answers. By delivering exact section references and easy-to-understand explanations in both Hindi and English, LexIQ empowers users to understand their rights with confidence.
          </p>

          <h2 style={{ color: '#f5f0e8', fontSize: 22, marginBottom: 16, marginTop: 40, fontFamily: 'Georgia, serif' }}>Who We Serve</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
            {[
              { icon: '👤', title: 'Citizens', desc: 'Clear, jargon-free explanations of fundamental rights and legal procedures for better understanding.' },
              { icon: '🎓', title: 'Law Students', desc: 'Fast research, exact section references, and exam prep support across core legal areas.' },
              { icon: '⚖', title: 'Advocates', desc: 'Quick case law analysis, fast section lookups, and smart drafting support to save time.' },
            ].map((item) => (
              <div key={item.title} style={{ background: 'var(--navy-mid)', border: '0.5px solid var(--border-gold)', borderRadius: 12, padding: 24 }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{item.icon}</div>
                <div style={{ color: '#f5f0e8', fontFamily: 'Georgia, serif', marginBottom: 8 }}>{item.title}</div>
                <div style={{ fontSize: 13, lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            ))}
          </div>

          <h2 style={{ color: '#f5f0e8', fontSize: 22, marginBottom: 16, marginTop: 40, fontFamily: 'Georgia, serif' }}>Important Notice</h2>
          <div style={{ background: 'rgba(201,168,76,0.08)', border: '0.5px solid var(--border-gold)', borderRadius: 10, padding: '20px 24px' }}>
            <p style={{ margin: 0 }}>
              LexIQ is an informational tool and does not constitute legal advice. Always consult a qualified legal professional for matters requiring formal legal opinion or representation. See our <Link href="/legal-disclaimer" style={{ color: 'var(--gold)' }}>Legal Disclaimer</Link> for full details.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function Footer() {
  return (
    <footer style={{ padding: '24px 48px', borderTop: '0.5px solid var(--border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>
      <span>LexIQ | India&apos;s Legal Intelligence Platform</span>
      <div style={{ display: 'flex', gap: 20 }}>
        {[['About', '/about'], ['Privacy Policy', '/privacy'], ['Terms of Use', '/terms'], ['Legal Disclaimer', '/legal-disclaimer']].map(([l, h]) => (
          <Link key={l} href={h} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{l}</Link>
        ))}
        <span style={{ color: 'var(--gold)' }}>© 2026 LexIQ</span>
      </div>
    </footer>
  )
}
