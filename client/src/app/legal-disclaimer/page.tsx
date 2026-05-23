import Link from 'next/link'

export const metadata = { title: 'Legal Disclaimer — LexIQ', description: 'LexIQ legal disclaimer — not a substitute for professional legal advice.' }

export default function LegalDisclaimerPage() {
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
        <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', marginBottom: 12 }}>Legal</div>
        <h1 style={{ fontSize: 40, marginBottom: 8, lineHeight: 1.2 }}>Legal Disclaimer</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', marginBottom: 24 }}>Last updated: June 2026</p>
        <div style={{ width: 60, height: 2, background: 'var(--gold)', marginBottom: 40, borderRadius: 2 }} />

        {/* Important notice box */}
        <div style={{ background: 'rgba(201,168,76,0.08)', border: '0.5px solid var(--gold)', borderRadius: 12, padding: '24px 28px', marginBottom: 48 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 22 }}>⚠️</span>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#f5f0e8', lineHeight: 1.7 }}>
              <strong>LexIQ is not a law firm and does not provide legal advice.</strong> The information provided on this platform is for educational and informational purposes only. It should not be treated as formal legal advice or professional legal opinion.
            </div>
          </div>
        </div>

        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.9 }}>
          {[
            {
              title: 'No Attorney-Client Relationship',
              body: 'Using LexIQ does not create an attorney-client relationship between you and LexIQ. The platform\'s answers are not legal opinions and cannot be used as evidence in court.'
            },
            {
              title: 'Accuracy of Information',
              body: 'While we work hard to provide accurate information based on current Indian law, laws change quickly. The platform might occasionally be slightly behind recent updates or court decisions. Always double-check important legal information with official government sources or a qualified lawyer.'
            },
            {
              title: 'Consult a Legal Professional',
              body: 'For situations involving potential legal trouble, criminal charges, property disputes, or binding contracts, you must consult a qualified lawyer in your area.'
            },
            {
              title: 'Jurisdiction Limitations',
              body: 'LexIQ is built specifically for Indian law. The information provided does not apply to other countries and should not be used for international legal matters.'
            },
            {
              title: 'Limitation of Liability',
              body: 'LexIQ is not responsible for any loss or damage that comes from relying on the platform\'s answers. The service is provided "as is", without absolute guarantees of accuracy or completeness.'
            },
          ].map((section) => (
            <div key={section.title} style={{ marginBottom: 32 }}>
              <h2 style={{ color: '#f5f0e8', fontSize: 18, marginBottom: 12, fontFamily: 'Georgia, serif' }}>{section.title}</h2>
              <p style={{ margin: 0 }}>{section.body}</p>
            </div>
          ))}
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
