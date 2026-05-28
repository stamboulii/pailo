'use client'

import { Editor, Frame } from '@craftjs/core'
import { useEffect, useState, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RESOLVER } from '@/components/onboarding/sections'
import BuilderSettings from '@/components/builder/BuilderSettings'
import BuilderTopbar from '@/components/builder/BuilderTopbar'
import { HeroDarkBlock } from '@/components/onboarding/variants/hero/HeroVariants'
import { ProductsGridBlock } from '@/components/onboarding/variants/products/ProductsVariants'
import { FooterDarkBlock } from '@/components/onboarding/variants/AboutFooterVariants'
import * as Craft from '@craftjs/core'
console.log('All CraftJS exports:', Craft)
console.log('Keys:', Object.keys(Craft))
// Root container component required by Craft.js
function RootContainer({ children }: { children?: ReactNode }) {
  return <div style={{ minHeight: '100%' }}>{children as never}</div>
}

// Debug: log any undefined entries in the resolver
if (typeof window !== 'undefined') {
  const bad = Object.entries(RESOLVER).filter(([, v]) => !v)
  if (bad.length) console.error('RESOLVER has undefined entries:', bad.map(([k]) => k))
}

export default function EditorCanvas() {
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
  
  const canvas = store.config_json?.canvas
  // CraftJS needs a JSON string, but Supabase returns jsonb as an object
  setSavedCanvas(
    canvas
      ? typeof canvas === 'string' ? canvas : JSON.stringify(canvas)
      : null
  )
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
      <Editor resolver={{ ...RESOLVER, RootContainer }}>
        <BuilderTopbar storeId={storeId} />
        <div style={{ flex: 1, display: 'grid', overflow: 'hidden',
                      gridTemplateColumns: '48px 1fr 220px' }}>
          <div style={{ background: '#13131d',
                        borderRight: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', padding: '10px 0', gap: 4 }}>
            {[{ icon: '⊞', label: 'Blocks' },
              { icon: '🖼', label: 'Media' },
              { icon: '✦', label: 'AI' }].map((item, i) => (
              <div key={i} style={{ width: 36, height: 36, borderRadius: 7,
                                    cursor: 'pointer', display: 'flex',
                                    flexDirection: 'column', alignItems: 'center',
                                    justifyContent: 'center', gap: 2,
                                    background: i === 0 ? '#2d5be3' : 'transparent' }}>
                <span style={{ fontSize: 13 }}>{item.icon}</span>
                <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)',
                               fontFamily: 'monospace' }}>{item.label}</span>
              </div>
            ))}
          </div>

          <div style={{ overflow: 'auto', background: '#ede8df', padding: 16 }}>
            {savedCanvas ? (
              // Restore saved canvas from JSON
              <Frame json={savedCanvas} />
            ) : (
              // Fresh canvas with default blocks
              <Frame>
                <RootContainer>
                  <HeroDarkBlock />
                  <ProductsGridBlock />
                  <FooterDarkBlock />
                </RootContainer>
              </Frame>
            )}
          </div>

          <BuilderSettings />
        </div>
      </Editor>
    </div>
  )
}