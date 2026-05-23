import Link from 'next/link'

export const metadata = { title: 'Terms of Use — LexIQ', description: 'LexIQ terms of use and service agreement.' }

export default function TermsPage() {
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
        <h1 style={{ fontSize: 40, marginBottom: 8, lineHeight: 1.2 }}>Terms of Use</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', marginBottom: 24 }}>Last updated: June 2026</p>
        <div style={{ width: 60, height: 2, background: 'var(--gold)', marginBottom: 40, borderRadius: 2 }} />

        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.9 }}>
          {[
            {
              title: '1. Acceptance of Terms',
              body: 'By using the LexIQ platform, you agree to these Terms of Use. If you do not agree with any part, please do not use the platform.'
            },
            {
              title: '2. Informational Use Only',
              body: 'LexIQ is an informational platform. The information provided by the platform is not formal legal advice. LexIQ is not a substitute for professional legal counsel. You must consult a qualified lawyer for matters requiring formal legal opinions or court representation.'
            },
            {
              title: '3. Account Responsibility',
              body: 'You are responsible for keeping your account details safe. You are fully responsible for all activities that happen under your account. Please notify us immediately if you suspect any unauthorized access.'
            },
            {
              title: '4. Acceptable Use',
              body: 'You may not use LexIQ for unlawful purposes, to create harmful content, to bypass security, or to claim platform responses are formal legal advice. Breaking these rules will result in your account being closed.'
            },
            {
              title: '5. Intellectual Property',
              body: 'All content and design of the LexIQ platform is the property of LexIQ. You may not copy, share, or create new works from our platform without written permission.'
            },
            {
              title: '6. Limitation of Liability',
              body: 'LexIQ is not liable for any direct or indirect damages resulting from your use of the platform or reliance on its answers. The service is provided "as is" without any guarantees.'
            },
            {
              title: '7. Modifications',
              body: 'We may update these Terms at any time. If you continue to use the platform after changes are made, it means you accept the new Terms.'
            },
            {
              title: '8. Governing Law',
              body: 'These Terms are governed by the laws of India. Any disputes will be handled exclusively by Indian courts.'
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
