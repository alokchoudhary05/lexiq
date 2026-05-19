'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'

type TabType = 'login' | 'signup' | 'forgot'
type RoleType = 'student' | 'advocate' | 'citizen'

export default function AuthForm() {
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const router = useRouter()

  const [tab, setTab] = useState<TabType>('login')
  const [role, setRole] = useState<RoleType>('citizen')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Signup form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('')
  // Resend countdown: -1 = idle, 0 = can resend, >0 = seconds remaining
  const [resendCountdown, setResendCountdown] = useState(-1)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(loginEmail, loginPassword)
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      router.push('/chat')
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const full_name = `${firstName} ${lastName}`.trim()
    const { data, error } = await signUp(signupEmail, signupPassword, full_name, role)
    setLoading(false)
    if (error) {
      setError(error.message)
    } else if (data?.user && !data.session) {
      setSuccess('Account created! Please check your email to confirm your account.')
    } else {
      router.push('/chat')
    }
  }

  async function sendForgotPasswordRequest(email: string) {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const json = await res.json()
      setLoading(false)

      if (!res.ok) {
        if (json.code === 'EMAIL_NOT_REGISTERED') {
          setError(
            'No account found with this email. Please check the address or create a new account.'
          )
        } else if (json.code === 'RATE_LIMITED') {
          setError(
            'Too many reset emails sent. Please wait a few minutes before trying again.'
          )
        } else {
          setError(json.error ?? 'Something went wrong. Please try again.')
        }
        return
      }

      // Success — start 180-second countdown
      setSuccess(
        'Password reset link sent! Check your inbox (and spam folder) and click the link to set a new password.'
      )
      startResendCountdown()
    } catch {
      setLoading(false)
      setError('Network error. Please check your connection and try again.')
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    await sendForgotPasswordRequest(forgotEmail)
  }

  async function handleResend() {
    setSuccess('')
    await sendForgotPasswordRequest(forgotEmail)
  }

  function startResendCountdown() {
    // Clear any existing timer
    if (countdownRef.current) clearInterval(countdownRef.current)
    setResendCountdown(180)
    countdownRef.current = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!)
          countdownRef.current = null
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  async function handleGoogle() {
    setError('')
    await signInWithGoogle()
  }

  function switchTab(t: TabType) {
    setTab(t)
    setError('')
    setSuccess('')
    // Clear countdown when leaving forgot tab
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
    setResendCountdown(-1)
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [])

  return (
    <div style={{ width: '100%', maxWidth: 380 }}>
      {/* Tab Switcher — only show for login/signup */}
      {tab !== 'forgot' && (
        <div style={{
          display: 'flex',
          background: 'var(--navy-mid)',
          borderRadius: 10,
          padding: 4,
          marginBottom: 32,
          border: '0.5px solid var(--border-gold)',
        }}>
          <button
            onClick={() => switchTab('login')}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 7,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              border: 'none',
              background: tab === 'login' ? 'var(--gold)' : 'transparent',
              color: tab === 'login' ? 'var(--navy)' : 'var(--text-muted)',
              fontWeight: tab === 'login' ? 700 : 400,
              transition: 'all 0.2s',
            }}
          >
            Log In
          </button>
          <button
            onClick={() => switchTab('signup')}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 7,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              border: 'none',
              background: tab === 'signup' ? 'var(--gold)' : 'transparent',
              color: tab === 'signup' ? 'var(--navy)' : 'var(--text-muted)',
              fontWeight: tab === 'signup' ? 700 : 400,
              transition: 'all 0.2s',
            }}
          >
            Sign Up
          </button>
        </div>
      )}

      {/* Error / Success */}
      {error && (
        <div style={{
          background: 'rgba(248,113,113,0.1)',
          border: '0.5px solid rgba(248,113,113,0.3)',
          borderRadius: 8,
          padding: '10px 14px',
          fontSize: 13,
          color: '#f87171',
          marginBottom: 16,
        }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{
          background: 'rgba(74,222,128,0.1)',
          border: '0.5px solid rgba(74,222,128,0.3)',
          borderRadius: 8,
          padding: '10px 14px',
          fontSize: 13,
          color: '#4ade80',
          marginBottom: 16,
        }}>
          {success}
        </div>
      )}

      {/* LOGIN FORM */}
      {tab === 'login' && (
        <form onSubmit={handleLogin}>
          <div style={{ fontSize: 24, color: '#f5f0e8', marginBottom: 6, fontFamily: 'Georgia, serif' }}>
            Welcome back
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', marginBottom: 28 }}>
            Log into your LexIQ account
          </div>

          <InputGroup label="Email Address">
            <input
              type="email"
              placeholder="alok@example.com"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </InputGroup>
          <InputGroup label="Password">
            <input
              type="password"
              placeholder="••••••••"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
              style={inputStyle}
            />
          </InputGroup>

          <div style={{ textAlign: 'right', marginBottom: 16 }}>
            <button
              type="button"
              onClick={() => switchTab('forgot')}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: 12,
                color: 'var(--gold)',
                fontFamily: 'Inter, sans-serif',
                cursor: 'pointer',
                textDecoration: 'underline',
                textUnderlineOffset: 3,
              }}
            >
              Forgot password?
            </button>
          </div>

          <button type="submit" disabled={loading} style={submitBtnStyle}>
            {loading ? 'Logging in...' : 'Log In to LexIQ'}
          </button>

          <OrDivider />
          <SocialButtons onGoogle={handleGoogle} />

          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', marginTop: 20 }}>
            Don&apos;t have an account?{' '}
            <a onClick={() => switchTab('signup')} style={{ color: 'var(--gold)', cursor: 'pointer' }}>
              Sign up free
            </a>
          </div>
        </form>
      )}

      {/* SIGNUP FORM */}
      {tab === 'signup' && (
        <form onSubmit={handleSignup}>
          <div style={{ fontSize: 24, color: '#f5f0e8', marginBottom: 6, fontFamily: 'Georgia, serif' }}>
            Create account
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', marginBottom: 28 }}>
            Join LexIQ — free to start
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <InputGroup label="First Name" style={{ flex: 1 }}>
              <input
                type="text"
                placeholder="Alok"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                style={inputStyle}
              />
            </InputGroup>
            <InputGroup label="Last Name" style={{ flex: 1 }}>
              <input
                type="text"
                placeholder="Choudhary"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                style={inputStyle}
              />
            </InputGroup>
          </div>

          <InputGroup label="Email Address">
            <input
              type="email"
              placeholder="alok@example.com"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </InputGroup>
          <InputGroup label="Password">
            <input
              type="password"
              placeholder="Min 8 characters"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              required
              minLength={8}
              style={inputStyle}
            />
          </InputGroup>

          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', marginBottom: 8 }}>I am a —</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[
              { key: 'citizen', label: 'Citizen', icon: '👤' },
              { key: 'student', label: 'Law Student', icon: '🎓' },
              { key: 'advocate', label: 'Advocate', icon: '⚖️' },
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setRole(key as RoleType)}
                style={{
                  flex: 1,
                  padding: '9px 8px',
                  borderRadius: 8,
                  textAlign: 'center',
                  fontSize: 11,
                  fontFamily: 'Inter, sans-serif',
                  cursor: 'pointer',
                  border: role === key ? '0.5px solid var(--gold)' : '0.5px solid var(--border-gold)',
                  color: role === key ? 'var(--gold)' : 'var(--text-muted)',
                  background: role === key ? 'var(--gold-faint)' : 'var(--navy-mid)',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ display: 'block', fontSize: 16, marginBottom: 3 }}>{icon}</span>
                {label}
              </button>
            ))}
          </div>

          <button type="submit" disabled={loading} style={submitBtnStyle}>
            {loading ? 'Creating account...' : 'Create My Account'}
          </button>

          <OrDivider />
          <SocialButtons onGoogle={handleGoogle} />

          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', marginTop: 20 }}>
            Already have an account?{' '}
            <a onClick={() => switchTab('login')} style={{ color: 'var(--gold)', cursor: 'pointer' }}>
              Log in
            </a>
          </div>
        </form>
      )}

      {/* FORGOT PASSWORD FORM */}
      {tab === 'forgot' && (
        <form onSubmit={handleForgotPassword}>
          {/* Back button */}
          <button
            type="button"
            onClick={() => switchTab('login')}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              color: 'var(--text-muted)',
              fontFamily: 'Inter, sans-serif',
              cursor: 'pointer',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Login
          </button>

          {/* Lock icon */}
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(201,168,76,0.08)',
            border: '1px solid var(--border-gold)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, marginBottom: 20,
          }}>
            🔐
          </div>

          <div style={{ fontSize: 24, color: '#f5f0e8', marginBottom: 6, fontFamily: 'Georgia, serif' }}>
            Forgot password?
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', marginBottom: 28, lineHeight: 1.6 }}>
            Enter your registered email and we&apos;ll send you a secure link to reset your password.
          </div>

          <InputGroup label="Email Address">
            <input
              type="email"
              placeholder="alok@example.com"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
              style={inputStyle}
              autoFocus
            />
          </InputGroup>

          {/* Send / Resend button area */}
          {resendCountdown === -1 && (
            <button
              type="submit"
              disabled={loading}
              style={{ ...submitBtnStyle, opacity: loading ? 0.7 : 1, cursor: loading ? 'default' : 'pointer' }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          )}

          {resendCountdown > 0 && (
            <>
              {/* Countdown info bar */}
              <div style={{
                background: 'rgba(201,168,76,0.07)',
                border: '0.5px solid var(--border-gold)',
                borderRadius: 8,
                padding: '12px 14px',
                marginTop: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}>
                <span style={{ fontSize: 18 }}>⏱</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: 'var(--gold)', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                    Email sent! Didn&apos;t receive it?
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', marginTop: 2 }}>
                    Resend available in{' '}
                    <span style={{ color: '#f5f0e8', fontWeight: 600 }}>
                      {Math.floor(resendCountdown / 60)}:{String(resendCountdown % 60).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Disabled resend button with progress */}
              <button
                type="button"
                disabled
                style={{
                  ...submitBtnStyle,
                  marginTop: 10,
                  opacity: 0.45,
                  cursor: 'not-allowed',
                  background: 'var(--navy-mid)',
                  color: 'var(--text-muted)',
                  border: '0.5px solid var(--border-gold)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Progress fill */}
                <span style={{
                  position: 'absolute',
                  left: 0, top: 0, bottom: 0,
                  width: `${((180 - resendCountdown) / 180) * 100}%`,
                  background: 'rgba(201,168,76,0.12)',
                  transition: 'width 1s linear',
                }} />
                <span style={{ position: 'relative' }}>Resend Email</span>
              </button>
            </>
          )}

          {resendCountdown === 0 && (
            <button
              type="button"
              disabled={loading}
              onClick={handleResend}
              style={{
                ...submitBtnStyle,
                marginTop: 8,
                background: 'transparent',
                color: 'var(--gold)',
                border: '1px solid var(--gold)',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'default' : 'pointer',
              }}
            >
              {loading ? 'Resending...' : '🔄 Resend Email'}
            </button>
          )}

          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', marginTop: 24 }}>
            Remembered it?{' '}
            <a onClick={() => switchTab('login')} style={{ color: 'var(--gold)', cursor: 'pointer' }}>
              Go back to login
            </a>
          </div>
        </form>
      )}
    </div>
  )
}

function InputGroup({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ marginBottom: 16, ...style }}>
      <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', marginBottom: 6, letterSpacing: '0.4px' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function OrDivider() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      margin: '20px 0', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{ flex: 1, height: '0.5px', background: 'var(--border-gold)' }} />
      or continue with
      <div style={{ flex: 1, height: '0.5px', background: 'var(--border-gold)' }} />
    </div>
  )
}

function SocialButtons({ onGoogle }: { onGoogle: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <button
        type="button"
        onClick={onGoogle}
        style={{
          width: '100%', padding: 11, borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontSize: 13, fontFamily: 'Inter, sans-serif',
          cursor: 'pointer', background: 'var(--navy-mid)',
          border: '0.5px solid var(--border-gold)', color: '#f5f0e8',
          transition: 'border-color 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--gold)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-gold)')}
      >
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 8,
  background: 'var(--navy-mid)',
  border: '0.5px solid var(--border-gold)',
  color: '#f5f0e8',
  fontSize: 14,
  fontFamily: 'Inter, sans-serif',
  outline: 'none',
}

const submitBtnStyle: React.CSSProperties = {
  width: '100%',
  padding: 13,
  borderRadius: 8,
  border: 'none',
  background: 'var(--gold)',
  color: 'var(--navy)',
  fontSize: 15,
  fontWeight: 700,
  fontFamily: 'Inter, sans-serif',
  cursor: 'pointer',
  marginTop: 8,
  letterSpacing: '0.3px',
}
