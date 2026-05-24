'use client'

import { Editor, Frame, Canvas } from '@craftjs/core'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { HeroBlock } from '@/components/builder/blocks/HeroBlock'
import { ProductsBlock } from '@/components/builder/blocks/ProductsBlock'
import { CTABlock } from '@/components/builder/blocks/CTABlock'
import BuilderTopbar from '@/components/builder/BuilderTopbar'
import BuilderSettings from '@/components/builder/BuilderSettings'

// Register ALL blocks — required for JSON deserialization
const RESOLVER = { HeroBlock, ProductsBlock, CTABlock }

export default function EditorPage() {
  const [savedCanvas, setSavedCanvas] = useState<string | null>(null)
  const [storeId, setStoreId]         = useState<string | null>(null)
  const [loading, setLoading]         = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: store } = await supabase
        .from('stores')
        .select('id, config_json')
        .eq('user_id', user.id)
        .single()

      if (store) {
        setStoreId(store.id)
        // config_json.canvas holds the Craft.js serialized state
        setSavedCanvas(store.config_json?.canvas ?? null)
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', background: '#13131d',
                    color: 'white', fontFamily: 'sans-serif' }}>
        Loading your store...
      </div>
    )
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column',
                  background: '#13131d', overflow: 'hidden' }}>

      <Editor resolver={RESOLVER}>

        <BuilderTopbar storeId={storeId} />

        <div style={{ flex: 1, display: 'grid', overflow: 'hidden',
                      gridTemplateColumns: '48px 1fr 220px' }}>

          <div style={{ background: '#13131d',
                        borderRight: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', padding: '10px 0', gap: 4 }}>
            {[
              { icon: '⊞', label: 'Blocks' },
              { icon: '🖼', label: 'Media' },
              { icon: '✦', label: 'AI' },
            ].map((item, i) => (
              <div key={i} style={{
                width: 36, height: 36, borderRadius: 7, cursor: 'pointer',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 2,
                background: i === 0 ? '#2d5be3' : 'transparent',
              }}>
                <span style={{ fontSize: 13 }}>{item.icon}</span>
                <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)',
                               fontFamily: 'monospace' }}>{item.label}</span>
              </div>
            ))}
          </div>

          <div style={{ overflow: 'auto', background: '#ede8df', padding: 16 }}>
              <Frame json={savedCanvas ?? undefined}>
                {/* Default layout — replaced by AI generation in the next step */}
                {!savedCanvas && (
                  <Canvas canvas
                    style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <HeroBlock />
                    <ProductsBlock />
                    <CTABlock />
                  </Canvas>
                )}
              </Frame>
          </div>

          <BuilderSettings />

        </div>
      </Editor>
    </div>
  )
}