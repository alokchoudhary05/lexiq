'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AuthForm from '@/components/auth/AuthForm'

const LAW_QUOTES = [
  { text: "The safety of the people shall be the ", highlight: "highest law", text2: "", author: "Marcus Tullius Cicero" },
  { text: "Injustice anywhere is a ", highlight: "threat to justice", text2: " everywhere", author: "Martin Luther King Jr." },
  { text: "The end of law is not to abolish or restrain, but to ", highlight: "preserve and enlarge freedom", text2: "", author: "John Locke" },
  { text: "It is the ", highlight: "spirit and not the form", text2: " of law that keeps justice alive", author: "Earl Warren" },
  { text: "The law is ", highlight: "reason", text2: ", free from passion", author: "Aristotle" },
  { text: "Justice is the constant and perpetual will to ", highlight: "allot to every man his due", text2: "", author: "Domitius Ulpian" },
  { text: "A law is valuable, not because it is a law, but because ", highlight: "there is right in it", text2: "", author: "Henry Ward Beecher" },
  { text: "No man is ", highlight: "above the law", text2: " and no man is below it", author: "Theodore Roosevelt" },
  { text: "The good of the people is the ", highlight: "greatest law", text2: "", author: "Marcus Tullius Cicero" },
  { text: "Knowledge of the law is the ", highlight: "first step", text2: " towards justice", author: "LexIQ" }
]

export default function AuthPageClient() {
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setQuoteIndex(Math.floor(Math.random() * LAW_QUOTES.length))
    setMounted(true)
  }, [])

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
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48, zIndex: 1, textDecoration: 'none', cursor: 'pointer' }}>
          <div style={{
            width: 40, height: 40, background: 'var(--gold)', borderRadius: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, color: 'var(--navy)',
          }}>⚖</div>
          <div style={{ fontSize: 22, fontWeight: 'bold', letterSpacing: 1, color: '#f5f0e8' }}>
            Lex<span style={{ color: 'var(--gold)' }}>IQ</span>
          </div>
        </Link>

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
        <div style={{
          fontFamily: 'Georgia, serif', fontSize: 22, lineHeight: 1.5, color: '#f5f0e8',
          maxWidth: 350, fontStyle: 'italic', zIndex: 1, marginBottom: 20,
          opacity: mounted ? 1 : 0, transition: 'opacity 0.6s ease-in'
        }}>
          &ldquo;{LAW_QUOTES[quoteIndex].text}
          {LAW_QUOTES[quoteIndex].highlight && <span style={{ color: 'var(--gold)' }}>{LAW_QUOTES[quoteIndex].highlight}</span>}
          {LAW_QUOTES[quoteIndex].text2}&rdquo;

          <div style={{ fontSize: 16, marginTop: 14, color: 'var(--gold)', textAlign: 'right', fontWeight: 600, fontFamily: 'Inter, sans-serif', fontStyle: 'normal' }}>
            ~ {LAW_QUOTES[quoteIndex].author}
          </div>
        </div>

        <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', zIndex: 1, opacity: mounted ? 1 : 0, transition: 'opacity 0.6s ease-in' }}>
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
