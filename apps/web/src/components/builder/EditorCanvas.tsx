'use client'

import { Editor, Frame } from '@craftjs/core'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RESOLVER } from '@/components/onboarding/sections'
import BuilderSettings from '@/components/builder/BuilderSettings'
import BuilderTopbar from '@/components/builder/BuilderTopbar'
import { HeroDarkBlock } from '@/components/onboarding/variants/hero/HeroVariants'
import { ProductsGridBlock } from '@/components/onboarding/variants/products/ProductsVariants'
import { FooterDarkBlock } from '@/components/onboarding/variants/AboutFooterVariants'

// Root container required by Craft.js as the top-level canvas element
function RootContainer({ children }: { children?: ReactNode }) {
  return <div style={{ minHeight: '100%' }}>{children as never}</div>
}

const RESOLVER_WITH_ROOT = { ...RESOLVER, RootContainer }

export default function EditorCanvas() {
  const [savedCanvas, setSavedCanvas] = useState<string | null>(null)
  const [storeId, setStoreId]         = useState<string | null>(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState<string | null>(null)
  const supabase = useRef(createClient()).current

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError) throw authError
        if (!user) { setLoading(false); return }

        const { data: store, error: storeError } = await supabase
          .from('stores')
          .select('id, config_json')
          .eq('user_id', user.id)
          .single()

        if (storeError && storeError.code !== 'PGRST116') throw storeError

        if (store) {
          setStoreId(store.id)
          const canvas = store.config_json?.canvas
          // Craft.js needs a JSON string, but Supabase returns jsonb as an object
          setSavedCanvas(
            canvas
              ? typeof canvas === 'string' ? canvas : JSON.stringify(canvas)
              : null
          )
        }
      } catch (err) {
        console.error('Failed to load store:', err)
        setError('Failed to load your store.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [supabase])

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', background: '#13131d',
                    color: 'white', fontFamily: 'sans-serif' }}>
        Loading your store...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', background: '#13131d',
                    color: '#e8601a', fontFamily: 'sans-serif', fontSize: 14 }}>
        {error}
      </div>
    )
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column',
                  background: '#13131d', overflow: 'hidden' }}>
      <Editor resolver={RESOLVER_WITH_ROOT}>
        <BuilderTopbar storeId={storeId} />
        <div style={{ flex: 1, display: 'grid', overflow: 'hidden',
                      gridTemplateColumns: '48px 1fr 220px' }}>

          {/* Left sidebar */}
          <div style={{ background: '#13131d',
                        borderRight: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', padding: '10px 0', gap: 4 }}>
            {[{ icon: '⊞', label: 'Blocks' },
              { icon: '🖼', label: 'Media' },
              { icon: '✦', label: 'AI' }].map((item, i) => (
              <div key={item.label} style={{ width: 36, height: 36, borderRadius: 7,
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

          {/* Canvas */}
          <div style={{ overflow: 'auto', background: '#ede8df', padding: 16 }}>
            {savedCanvas ? (
              <Frame data={savedCanvas} />
            ) : (
              <Frame>
                <RootContainer>
                  <HeroDarkBlock />
                  <ProductsGridBlock />
                  <FooterDarkBlock />
                </RootContainer>
              </Frame>
            )}
          </div>

          {/* Right settings panel */}
          <BuilderSettings />
        </div>
      </Editor>
    </div>
  )
}
