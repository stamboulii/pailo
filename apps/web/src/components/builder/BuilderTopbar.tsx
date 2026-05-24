'use client'

import { useEditor } from '@craftjs/core'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function BuilderTopbar({ storeId }: { storeId: string | null }) {
  const { query } = useEditor()
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const supabase = createClient()

  const handlePublish = async () => {
    if (!storeId) {
      alert('No store found. Create a store first from the dashboard.')
      return
    }
    setStatus('saving')

    // Craft.js serializes the full canvas to a JSON string
    const canvas = query.serialize()

    const { error } = await supabase
      .from('stores')
      .update({
        config_json:  { canvas },
        published_at: new Date().toISOString(),
      })
      .eq('id', storeId)

    setStatus(error ? 'error' : 'saved')
    if (!error) setTimeout(() => setStatus('idle'), 2500)
  }

  const btnBg =
    status === 'saved'  ? '#18b96a' :
    status === 'saving' ? '#1a3ab0' :
    status === 'error'  ? '#e8601a' : '#2d5be3'

  const btnLabel =
    status === 'saving' ? 'Publishing...' :
    status === 'saved'  ? '✓ Published!'  :
    status === 'error'  ? 'Error — retry' : 'Publish →'

  return (
    <div style={{ background: '#111114', height: 48, flexShrink: 0,
                  display: 'flex', alignItems: 'center', padding: '0 16px',
                  gap: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>

      <Link href="/dashboard"
        style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)',
                 textDecoration: 'none' }}>
        ← Dashboard
      </Link>

      <span style={{ flex: 1, color: 'white', fontSize: 13, fontWeight: 700 }}>
        Store Builder
      </span>

      <button
        onClick={handlePublish}
        disabled={status === 'saving'}
        style={{ background: btnBg, color: 'white', border: 'none',
                 padding: '8px 20px', borderRadius: 6, fontSize: 13,
                 fontWeight: 700, cursor: status === 'saving' ? 'not-allowed' : 'pointer',
                 transition: 'background 0.2s' }}>
        {btnLabel}
      </button>
    </div>
  )
}