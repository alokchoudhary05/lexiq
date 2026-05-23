'use client'

import React, { useState, useEffect } from 'react'

export default function HeroShowcase() {
  const [phase, setPhase] = useState(0)
  const [cycle, setCycle] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setPhase((p) => {
          const nextPhase = (p + 1) % 3
          if (nextPhase === 0) {
            setCycle((c) => (c + 1) % 3)
          }
          return nextPhase
        })
        setFade(true)
      }, 500) // smooth fade out
    }, 6500) // increased time: 6.5s per phase

    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
      <div style={{ 
        opacity: fade ? 1 : 0, 
        transition: 'opacity 0.4s ease-in-out',
        width: '100%',
        display: 'flex',
        justifyContent: 'center'
      }}>
        {phase === 0 && <Idea3BuiltFor />}
        {phase === 1 && <Idea1Prompts cycle={cycle} />}
        {phase === 2 && <Idea4ChatSnippet cycle={cycle} />}
      </div>
    </div>
  )
}

function Idea1Prompts({ cycle }: { cycle?: number }) {
  const prompts = [
    '✨ BNS Section 69 kya hai?',
    '✨ How to file an FIR for cyber fraud?',
    '✨ Draft a legal notice for unpaid salary'
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', letterSpacing: '0.5px' }}>
        Try asking LexIQ:
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {prompts.map((prompt, idx) => (
          <div key={prompt} style={{
            background: cycle === idx ? 'rgba(201,168,76,0.15)' : 'var(--navy-mid)',
            border: `0.5px solid ${cycle === idx ? 'var(--gold)' : 'var(--border-gold)'}`,
            borderRadius: 20, padding: '8px 18px', fontSize: 13, color: '#f5f0e8',
            fontFamily: 'Inter, sans-serif', cursor: 'default',
            boxShadow: cycle === idx ? '0 4px 16px rgba(201,168,76,0.2)' : '0 4px 12px rgba(0,0,0,0.15)',
            transform: cycle === idx ? 'scale(1.05)' : 'scale(1)',
            transition: 'all 0.4s ease'
          }}>
            {prompt}
          </div>
        ))}
      </div>
    </div>
  )
}

function Idea3BuiltFor() {
  const [targetIdx, setTargetIdx] = useState(0)
  const targets = ['Everyday Citizens', 'Law Students', 'Advocates']
  
  useEffect(() => {
    const int = setInterval(() => {
      setTargetIdx((i) => (i + 1) % targets.length)
    }, 1800)
    return () => clearInterval(int)
  }, [])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 17, fontFamily: 'Georgia, serif' }}>
      <span style={{ color: 'var(--text-muted)' }}>Intelligently designed for</span>
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(10px)',
        borderRadius: 12, padding: '8px 20px', color: 'var(--gold)',
        fontWeight: 'bold', minWidth: 180, textAlign: 'center',
        textShadow: '0 2px 10px rgba(201,168,76,0.3)'
      }}>
        {targets[targetIdx]}
      </div>
    </div>
  )
}

function Idea4ChatSnippet({ cycle }: { cycle?: number }) {
  const [text, setText] = useState('')
  const answers = [
    'BNS Section 69 deals with sexual intercourse by employing deceitful means or making false promises...',
    'To file a cyber fraud FIR, register a complaint on the National Cyber Crime Reporting Portal (cybercrime.gov.in)...',
    'Drafting Notice: "Under Section 15 of the Payment of Wages Act, I hereby demand my pending salary of..."'
  ]
  const fullText = answers[cycle || 0]

  useEffect(() => {
    let i = 0
    setText('')
    const int = setInterval(() => {
      if (i < fullText.length) {
        setText(fullText.slice(0, i + 1))
        i++
      } else {
        clearInterval(int)
      }
    }, 35)
    return () => clearInterval(int)
  }, [fullText])

  return (
    <div style={{
      background: 'rgba(10,22,40,0.85)', border: '0.5px solid var(--border-gold)',
      borderRadius: 12, padding: '16px 24px', maxWidth: 640,
      display: 'flex', gap: 16, alignItems: 'center',
      boxShadow: '0 8px 30px rgba(0,0,0,0.25)'
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8, background: 'var(--gold)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, color: 'var(--navy)', fontWeight: 'bold', flexShrink: 0
      }}>⚖</div>
      <div style={{ fontSize: 15, color: '#f5f0e8', fontFamily: 'Inter, sans-serif', lineHeight: 1.5, textAlign: 'left' }}>
        <span style={{ color: 'var(--gold)', fontSize: 11, display: 'block', marginBottom: 4, letterSpacing: '0.5px', textTransform: 'uppercase' }}>LexIQ is typing...</span>
        {text}
        <span style={{ display: 'inline-block', width: 2, height: 14, background: 'var(--gold)', marginLeft: 4, animation: 'pulse-gold 1.5s infinite' }} />
      </div>
    </div>
  )
}
