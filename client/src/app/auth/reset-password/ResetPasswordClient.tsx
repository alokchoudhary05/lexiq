'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordClient() {
  const router = useRouter()
  const supabase = createClient()

  const [ready, setReady] = useState(false)       // true once RECOVERY session confirmed
  const [invalid, setInvalid] = useState(false)    // true if link is bad / expired
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout>

    // Set up listener FIRST — catches PASSWORD_RECOVERY if the SSR client fires it
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sess) => {
      if (cancelled) return
      if ((event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') && sess) {
        clearTimeout(timer)
        setReady(true)
      }
    })

    async function handleResetLink() {
      // ── PRIMARY: manually parse the #access_token hash (implicit flow) ────────
      // @supabase/ssr's createBrowserClient uses cookies, NOT hash detection.
      // So we must read the hash ourselves and call setSession() explicitly.
      // The email link lands here as:
      //   /auth/reset-password#access_token=xxx&refresh_token=xxx&type=recovery
      const hash = window.location.hash.slice(1)          // strip the leading #
      const hashParams = new URLSearchParams(hash)
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token') ?? ''
      const type = hashParams.get('type')

      if (accessToken && type === 'recovery') {
        // Establish the session from the tokens Supabase put in the URL
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        if (cancelled) return

        if (error || !data.session) {
          console.error('[reset-password] setSession error:', error)
          setInvalid(true)
          return
        }

        // Session established — show the new-password form
        setReady(true)
        // Clean hash from URL so a page refresh doesn't re-use the token
        window.history.replaceState({}, '', window.location.pathname)
        return
      }

      // ── SECONDARY: existing session (e.g. page refresh after token exchange) ──
      const { data: { session } } = await supabase.auth.getSession()
      if (cancelled) return
      if (session) {
        setReady(true)
        return
      }

      // ── TERTIARY: ?code= PKCE exchange (shouldn't happen with implicit flow) ──
      const searchParams = new URLSearchParams(window.location.search)
      const code = searchParams.get('code')
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (cancelled) return
        if (error || !data.session) {
          setInvalid(true)
          return
        }
        setReady(true)
        window.history.replaceState({}, '', window.location.pathname)
        return
      }

      // ── FALLBACK: nothing matched — start 8s timeout then mark invalid ────────
      timer = setTimeout(() => {
        if (!cancelled) setInvalid(true)
      }, 8000)
    }

    handleResetLink()

    return () => {
      cancelled = true
      clearTimeout(timer)
      subscription.unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/chat'), 2500)
    }
  }

  /* ── Styles ────────────────────────────────────────────────────── */
  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'var(--navy)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    fontFamily: 'Inter, sans-serif',
  }

  const cardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: 420,
    background: 'var(--navy-mid)',
    border: '0.5px solid var(--border-gold)',
    borderRadius: 16,
    padding: '40px 36px',
    position: 'relative',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: 8,
    background: 'var(--navy)',
    border: '0.5px solid var(--border-gold)',
    color: 'var(--text-primary)',
    fontSize: 14,
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const submitStyle: React.CSSProperties = {
    width: '100%',
    padding: 13,
    borderRadius: 8,
    border: 'none',
    background: 'var(--gold)',
    color: 'var(--navy)',
    fontSize: 15,
    fontWeight: 700,
    fontFamily: 'Inter, sans-serif',
    cursor: loading ? 'not-allowed' : 'pointer',
    marginTop: 8,
    letterSpacing: '0.3px',
    opacity: loading ? 0.7 : 1,
  }

  /* ── Render ────────────────────────────────────────────────────── */
  return (
    <div style={pageStyle}>
      <div style={cardStyle}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
          <div style={{
            width: 34, height: 34, background: 'var(--gold)', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 17, color: 'var(--navy)',
          }}>⚖</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: 1 }}>
            Lex<span style={{ color: 'var(--gold)' }}>IQ</span>
          </div>
        </div>

        {/* ── SUCCESS STATE ── */}
        {success && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <div style={{ fontSize: 22, fontFamily: 'Georgia, serif', color: 'var(--text-primary)', marginBottom: 10 }}>
              Password updated!
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Your password has been changed successfully. Redirecting you to the dashboard…
            </div>
          </div>
        )}

        {/* ── INVALID LINK STATE ── */}
        {!success && invalid && !ready && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <div style={{ fontSize: 22, fontFamily: 'Georgia, serif', color: 'var(--text-primary)', marginBottom: 10 }}>
              Link expired or invalid
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
              This password reset link has expired or already been used. Please request a new one.
            </div>
            <button
              onClick={() => router.push('/auth')}
              style={{ ...submitStyle, marginTop: 0 }}
            >
              Back to Login
            </button>
          </div>
        )}

        {/* ── LOADING STATE ── */}
        {!success && !invalid && !ready && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              border: '2px solid var(--border-gold)',
              borderTopColor: 'var(--gold)',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 20px',
            }} />
            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Verifying reset link…</div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* ── NEW PASSWORD FORM ── */}
        {!success && ready && (
          <form onSubmit={handleSubmit}>
            <div style={{ fontSize: 24, fontFamily: 'Georgia, serif', color: 'var(--text-primary)', marginBottom: 6 }}>
              Set new password
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 28, lineHeight: 1.6 }}>
              Choose a strong password for your LexIQ account. Minimum 8 characters.
            </div>

            {/* Error */}
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

            {/* Password field */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.4px' }}>
                New Password
              </label>
              <input
                type="password"
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                style={inputStyle}
                autoFocus
              />
            </div>

            {/* Confirm password field */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.4px' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Repeat your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={8}
                style={inputStyle}
              />
            </div>

            {/* Strength hint */}
            {password.length > 0 && (
              <PasswordStrength password={password} />
            )}

            <button type="submit" disabled={loading} style={submitStyle}>
              {loading ? 'Updating password…' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

/* ── Password strength indicator ──────────────────────────────── */
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'Contains a number', pass: /\d/.test(password) },
    { label: 'Contains a special character', pass: /[^A-Za-z0-9]/.test(password) },
  ]
  return (
    <div style={{ marginBottom: 16 }}>
      {checks.map((c) => (
        <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
          <div style={{
            width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
            background: c.pass ? '#4ade80' : 'var(--border-gold)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, color: c.pass ? '#0a1628' : 'transparent',
            transition: 'background 0.2s',
          }}>✓</div>
          <span style={{ fontSize: 11, color: c.pass ? '#4ade80' : 'var(--text-muted)', transition: 'color 0.2s' }}>
            {c.label}
          </span>
        </div>
      ))}
    </div>
  )
}
