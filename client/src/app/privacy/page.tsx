import Link from 'next/link'

export const metadata = { title: 'Privacy Policy — LexIQ', description: 'LexIQ privacy policy and data handling practices.' }

export default function PrivacyPage() {
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
        <h1 style={{ fontSize: 40, marginBottom: 8, lineHeight: 1.2 }}>Privacy Policy</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', marginBottom: 24 }}>Last updated: June 2026</p>
        <div style={{ width: 60, height: 2, background: 'var(--gold)', marginBottom: 40, borderRadius: 2 }} />

        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.9 }}>
          {[
            {
              title: '1. Information We Collect',
              body: 'We collect information you provide when creating an account, including your name, email address, and professional role. We also securely log conversation histories to remember your past chats and improve your experience.'
            },
            {
              title: '2. How We Use Your Information',
              body: 'We use your data strictly to operate and improve the LexIQ platform. Email addresses are used for login and important service updates. Conversation logs are kept only to provide your chat history. We do not sell or share personal data with third parties for marketing purposes.'
            },
            {
              title: '3. Data Storage',
              body: 'Your account data and conversation history are stored securely using cloud infrastructure, utilizing high-level encryption both in transit and at rest. All data is hosted on secure servers that follow applicable data protection laws.'
            },
            {
              title: '4. Data Retention',
              body: 'Account data is kept for as long as your account is active. You have the right to ask us to delete your account completely at any time. You can also delete your conversation histories directly through the app.'
            },
            {
              title: '5. Cookies',
              body: 'LexIQ uses simple session cookies that are needed for logging in. We do not use tracking or third-party advertising cookies. Note that the platform requires login cookies to work properly.'
            },
            {
              title: '6. Third-Party Services',
              body: 'We use cloud infrastructure for authentication and data storage, and OpenAI API infrastructure. These partners operate under strict privacy policies. We only share the minimum amount of information needed to make the service work.'
            },
            {
              title: '7. Your Rights',
              body: 'You have full rights to access, correct, or delete your personal data. You can request a copy of your stored information at any time. To do this, please contact our support team.'
            },
            {
              title: '8. Contact',
              body: 'For privacy inquiries or data requests, please contact us directly via the LexIQ platform interface.'
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
