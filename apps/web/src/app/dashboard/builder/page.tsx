'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DashboardBuilderPage() {
  const [loading, setLoading] = useState(true)
  const [store, setStore] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadStore = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: store, error } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error || !store) {
        router.push('/dashboard/onboarding')
        return
      }

      setStore(store)
      setLoading(false)
    }

    loadStore()
  }, [router, supabase])

  const handleOpenEditor = () => {
    router.push('/editor')
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: '#f8f5ef'
      }}>
        Loading your store...
      </div>
    )
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
          Store Builder
        </h1>
        <p style={{ color: '#888', fontSize: 15, marginBottom: 32 }}>
          Edit your store &quot;{store?.name}&quot; in the builder.
        </p>

        <button
          onClick={handleOpenEditor}
          style={{
            width: '100%',
            padding: '14px 24px',
            background: '#2d5be3',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Open Builder
        </button>

        <div style={{
          marginTop: 16, padding: 16,
          background: 'rgba(17,17,20,0.02)',
          borderRadius: 8, fontSize: 13, color: '#666'
        }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Store URL</div>
          <div style={{ color: '#888' }}>
            {typeof window !== 'undefined' 
              ? `${window.location.origin}/editor`
              : '...'}
          </div>
        </div>

        <div style={{
          marginTop: 12, padding: 16,
          background: 'rgba(45,91,227,0.08)',
          borderRadius: 8, fontSize: 13, color: '#2d5be3'
        }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Live Store URL</div>
          <div>{typeof window !== 'undefined' 
            ? `${window.location.origin}/${store?.subdomain}`
            : '...'}
          </div>
        </div>
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
