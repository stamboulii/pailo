'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function OnboardingPage() {
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const res = await fetch('/api/generate-store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to generate store')
      }

      const store = await res.json()
      router.push(`/dashboard`)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px' }}>
      <Link href="/dashboard" style={{ display: 'inline-block', marginBottom: 24 }}
        onMouseOver={(e: React.MouseEvent<HTMLAnchorElement>) => { (e.currentTarget as HTMLAnchorElement).style.color = '#2d5be3' }}
        onMouseOut={(e: React.MouseEvent<HTMLAnchorElement>) => { (e.currentTarget as HTMLAnchorElement).style.color = '#888' }}>
        ← Back to dashboard
      </Link>

      <div style={{
        background: 'white', borderRadius: 16,
        padding: 40, border: '1px solid rgba(17,17,20,0.08)'
      }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
          Create your store with AI
        </h1>
        <p style={{ color: '#888', fontSize: 15, marginBottom: 32 }}>
          Describe your business in one sentence and we'll generate a complete store for you.
          You can customize everything in the builder afterwards.
        </p>

        <form onSubmit={handleSubmit}>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. A boutique coffee shop selling artisanal beans and brewing equipment"
            style={{
              width: '100%', minHeight: 120, padding: 16,
              fontSize: 15, borderRadius: 10,
              border: '1px solid rgba(17,17,20,0.12)',
              background: 'rgba(17,17,20,0.02)',
              fontFamily: 'inherit', resize: 'vertical'
            }}
            disabled={loading}
            required
          />

          <button
            type="submit"
            disabled={loading || !description.trim()}
            style={{
              marginTop: 16,
              width: '100%',
              padding: '14px 24px',
              background: '#2d5be3',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Generating your store...' : 'Generate Store'}
          </button>

          {error && (
            <p style={{ color: '#e8601a', fontSize: 13, marginTop: 12 }}>
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

function Link({ href, children, style, onMouseOver, onMouseOut }: any) {
  const router = useRouter()
  return (
    <a
      href={href}
      onClick={(e) => { e.preventDefault(); router.push(href) }}
      style={style}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      {children}
    </a>
  )
}
