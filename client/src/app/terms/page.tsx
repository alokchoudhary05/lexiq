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
        <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', marginBottom: 24 }}>Last updated: April 2026</p>
        <div style={{ width: 60, height: 2, background: 'var(--gold)', marginBottom: 40, borderRadius: 2 }} />

        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.9 }}>
          {[
            {
              title: '1. Acceptance of Terms',
              body: 'By accessing or using LexIQ, you agree to be bound by these Terms of Use. If you do not agree with any part of these terms, you must not use the platform.'
            },
            {
              title: '2. Informational Use Only',
              body: 'LexIQ is an informational platform only. The content provided through the platform does not constitute legal advice. You should not rely solely on LexIQ for legal decisions — always consult a qualified advocate or legal professional for matters requiring formal opinion or court representation.'
            },
            {
              title: '3. Account Responsibility',
              body: 'You are responsible for maintaining the confidentiality of your account credentials. Any activity that occurs under your account is your responsibility. Notify us immediately of any unauthorized use of your account.'
            },
            {
              title: '4. Acceptable Use',
              body: 'You agree not to use LexIQ for any unlawful purpose, to generate harmful content, to attempt to circumvent any security features, or to misrepresent the platform\'s responses as formal legal advice. Misuse of the platform may result in account suspension.'
            },
            {
              title: '5. Intellectual Property',
              body: 'All content, design, and functionality of the LexIQ platform is the property of LexIQ and its licensors. You may not reproduce, distribute, or create derivative works from the platform\'s content without express written permission.'
            },
            {
              title: '6. Limitation of Liability',
              body: 'LexIQ and its operators shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of the platform or reliance on any information provided. The platform is provided "as is" without warranties of any kind.'
            },
            {
              title: '7. Modifications',
              body: 'We reserve the right to modify these Terms at any time. Continued use of the platform after modifications constitutes acceptance of the updated Terms.'
            },
            {
              title: '8. Governing Law',
              body: 'These Terms are governed by the laws of India. Any disputes arising shall be subject to the jurisdiction of the courts of India.'
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
      <span>LexIQ — India&apos;s Legal Intelligence Platform</span>
      <div style={{ display: 'flex', gap: 20 }}>
        {[['About', '/about'], ['Privacy Policy', '/privacy'], ['Terms of Use', '/terms'], ['Legal Disclaimer', '/legal-disclaimer']].map(([l, h]) => (
          <Link key={l} href={h} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{l}</Link>
        ))}
        <span style={{ color: 'var(--gold)' }}>© 2026 LexIQ</span>
      </div>
    </footer>
  )
}
