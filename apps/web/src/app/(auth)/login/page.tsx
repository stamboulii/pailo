'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword

  const passwordBorderColor = (isConfirm: boolean) => {
    if (!isConfirm) {
      if (!confirmPassword) return '#1a1a1a'
      return passwordsMatch ? '#18b96a' : passwordsMismatch ? '#e8601a' : '#1a1a1a'
    } else {
      if (!confirmPassword) return '#1a1a1a'
      return passwordsMatch ? '#18b96a' : '#e8601a'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    const { data, error } = isSignUp
      ? await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } }
        })
      : await supabase.auth.signInWithPassword({ email, password })

    if (error) setError(error.message)
    else if (data.user) router.push('/dashboard')
    setLoading(false)
  }

  const handleMagicLink = async () => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` }
    })
    setLoading(false)
    if (error) setError(error.message)
    else alert('Magic link sent to your email')
  }

  const inputStyle = (borderColor = '#1a1a1a'): React.CSSProperties => ({
    width: '100%',
    padding: '12px 14px',
    borderRadius: 8,
    border: `1px solid ${borderColor}`,
    background: '#000',
    color: 'white',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  })

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    fontWeight: 500,
    color: '#666',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: 360, position: 'relative' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <svg width="40" height="40" viewBox="0 0 100 100" fill="none" style={{ margin: '0 auto 12px' }}>
            <rect width="100" height="100" rx="10" fill="#2d5be3"/>
            <path d="M25 30h50v12H25zm0 20h50v12H25z" fill="white"/>
          </svg>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'white', margin: 0, letterSpacing: -0.3 }}>
            Pailo
          </h1>
        </div>

        {/* Form */}
        <div style={{ background: '#0a0a0a', borderRadius: 12, padding: 28, border: '1px solid #1a1a1a' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'white', marginBottom: 24, fontFamily: 'monospace', letterSpacing: 1, textTransform: 'uppercase' }}>
            {isSignUp ? 'Create account' : 'Sign in'}
          </h2>

          {error && (
            <div style={{
              background: 'rgba(232,96,26,0.15)',
              border: '1px solid #e8601a',
              color: '#e8601a',
              padding: 10,
              borderRadius: 6,
              fontSize: 12,
              marginBottom: 16,
              fontFamily: 'monospace'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Full name — signup only */}
            {isSignUp && (
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Full name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="John Doe"
                  style={inputStyle()}
                />
              </div>
            )}

            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={inputStyle()}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle(passwordBorderColor(false))}
              />
            </div>

            {/* Confirm password — signup only */}
            {isSignUp && (
              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>
                  Confirm password
                  {confirmPassword.length > 0 && (
                    <span style={{
                      marginLeft: 8,
                      fontSize: 10,
                      fontWeight: 600,
                      color: passwordsMatch ? '#18b96a' : '#e8601a',
                      textTransform: 'none',
                      letterSpacing: 0,
                    }}>
                      {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </span>
                  )}
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  style={inputStyle(passwordBorderColor(true))}
                />
              </div>
            )}

            {!isSignUp && <div style={{ marginBottom: 8 }} />}

            <button
              type="submit"
              disabled={!email || !password || (isSignUp && (!confirmPassword || !fullName || passwordsMismatch)) || loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 8,
                background: loading ? '#1a3ab0' : '#2d5be3',
                color: 'white',
                border: 'none',
                fontSize: 13,
                fontWeight: 600,
                cursor: loading ? 'default' : 'pointer',
                transition: 'background 0.2s',
                opacity: (!email || !password || (isSignUp && (!confirmPassword || !fullName || passwordsMismatch))) ? 0.5 : 1,
              }}
            >
              {loading ? (isSignUp ? 'Creating...' : 'Signing in...') : (isSignUp ? 'Sign up' : 'Sign in')}
            </button>
          </form>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '24px 0' }} />

          <button
            onClick={handleMagicLink}
            disabled={!email || loading}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 8,
              background: 'transparent',
              color: '#666',
              border: '1px solid #1a1a1a',
              fontSize: 13,
              fontWeight: 500,
              cursor: loading ? 'default' : 'pointer'
            }}
          >
            Send magic link
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(null); setConfirmPassword(''); setFullName('') }}
            style={{
              background: 'none',
              border: 'none',
              color: '#666',
              fontSize: 13,
              cursor: 'pointer'
            }}
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>

      </div>
    </div>
  )
}