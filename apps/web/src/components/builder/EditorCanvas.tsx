'use client'

import { Editor, Frame, Element, useEditor, ROOT_NODE } from '@craftjs/core'
import { BlocksTab } from '@/components/builder/BuilderSettings'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { RESOLVER } from '@/components/onboarding/sections'
import BuilderSettings from '@/components/builder/BuilderSettings'
import BuilderTopbar from '@/components/builder/BuilderTopbar'
import { HeroDarkBlock } from '@/components/onboarding/variants/hero/HeroVariants'
import { ProductsGridBlock } from '@/components/onboarding/variants/products/ProductsVariants'
import { FooterDarkBlock } from '@/components/onboarding/variants/AboutFooterVariants'

// ─────────────────────────────────────────────────────────────
// Singleton groups
// ─────────────────────────────────────────────────────────────
const SINGLETON_GROUPS = [
  ['HeaderDarkBlock',   'HeaderMinimalBlock',   'HeaderBoldBlock'    ],
  ['HeroDarkBlock',     'HeroSplitBlock',        'HeroFullwidthBlock' ],
  ['ProductsGridBlock', 'ProductsListBlock',     'ProductsMasonryBlock'],
  ['AboutSplitBlock',   'AboutCenteredBlock',    'AboutDarkBlock'     ],
  ['FooterDarkBlock',   'FooterColumnsBlock',    'FooterMinimalBlock' ],
  ['CTABlock'],
]

// ─────────────────────────────────────────────────────────────
// SingletonGuard
// ─────────────────────────────────────────────────────────────
function SingletonGuard() {
  const { actions, nodes } = useEditor((state) => ({ nodes: state.nodes }))

  useEffect(() => {
    SINGLETON_GROUPS.forEach(group => {
      const found: string[] = []
      Object.entries(nodes).forEach(([nodeId, node]) => {
        if (nodeId === 'ROOT') return
        const name =
          (node as any).data?.type?.resolvedName ??
          (node as any).data?.name ?? ''
        if (group.includes(name)) found.push(nodeId)
      })
      if (found.length > 1) {
        found.slice(0, found.length - 1).forEach(id => {
          try { actions.delete(id) } catch { /* gone */ }
        })
      }
    })
  }, [nodes, actions])

  return null
}

// ─────────────────────────────────────────────────────────────
// RootContainer
// ─────────────────────────────────────────────────────────────
function RootContainer({ children }: { children?: ReactNode }) {
  const { connectors: { connect } } = useEditor()
  return (
    <div
      ref={ref => { if (ref) connect(ref, ROOT_NODE) }}
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      {children}
    </div>
  )
}
RootContainer.craft = {
  displayName: 'Page',
  isCanvas: true,
  rules: { canMoveIn: () => true, canMoveOut: () => true },
}

const RESOLVER_WITH_ROOT = { ...RESOLVER, RootContainer }

// ─────────────────────────────────────────────────────────────
// MediaPanel
// Shows all files uploaded to the store-media Supabase bucket.
// Clicking a file injects its URL into the selected block's
// relevant prop (bgImage, mediaUrl, or imageUrl).
// ─────────────────────────────────────────────────────────────
function MediaPanel() {
  const supabase = useRef(createClient()).current
  const [files, setFiles]       = useState<{ name: string; url: string; type: 'image' | 'video' }[]>([])
  const [loading, setLoading]   = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const fileInputRef            = useRef<HTMLInputElement>(null)

  const { selected, actions } = useEditor((state) => {
    const nodeId = state.events.selected
      ? [...state.events.selected][0]
      : null
    if (!nodeId || !state.nodes[nodeId]) return { selected: null }
    const node = state.nodes[nodeId]
    return {
      selected: {
        nodeId,
        name:  node.data.displayName as string,
        props: node.data.props as Record<string, any>,
      },
    }
  })

  // ── Load files from Supabase Storage ──────────────────────
  const loadFiles = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.storage
        .from('store-media')
        .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } })

      if (error) throw error

      const loaded = (data ?? [])
        .filter(f => f.name !== '.emptyFolderPlaceholder')
        .map(f => {
          const { data: { publicUrl } } = supabase.storage
            .from('store-media')
            .getPublicUrl(f.name)
          const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(f.name)
          return { name: f.name, url: publicUrl, type: isVideo ? 'video' as const : 'image' as const }
        })

      setFiles(loaded)
    } catch (e: any) {
      setError('Could not load media. Check your store-media bucket.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadFiles() }, [])

  // ── Upload new file ────────────────────────────────────────
  const handleUpload = async (file: File) => {
    setUploading(true)
    setError(null)
    try {
      const ext  = file.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage
        .from('store-media')
        .upload(path, file, { upsert: true })
      if (error) throw error
      await loadFiles() // refresh
    } catch (e: any) {
      setError('Upload failed: ' + e.message)
    } finally {
      setUploading(false)
    }
  }

  // ── Delete file ────────────────────────────────────────────
  const handleDelete = async (name: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`Delete ${name}?`)) return
    await supabase.storage.from('store-media').remove([name])
    setFiles(prev => prev.filter(f => f.name !== name))
  }

  // ── Inject URL into selected block ─────────────────────────
  // Detects which prop to set based on the block type
  const handleInsert = (url: string, type: 'image' | 'video') => {
    if (!selected?.nodeId) {
      alert('Click a block on the canvas first, then insert media.')
      return
    }

    const name = selected.name ?? ''

    // Hero blocks → set bgImage + bgType, or mediaUrl + mediaType
    if (name.includes('Hero')) {
      if (name === 'Hero — Split') {
        actions.setProp(selected.nodeId, (p: any) => {
          p.mediaUrl  = url
          p.mediaType = type
        })
      } else {
        actions.setProp(selected.nodeId, (p: any) => {
          p.bgImage = url
          p.bgType  = type
        })
      }
      return
    }

    // About split block → imageUrl
    if (name === 'About — Split') {
      actions.setProp(selected.nodeId, (p: any) => { p.imageUrl = url })
      return
    }

    // Products blocks → show which product slot to fill
    // For simplicity: set imageUrl on first product without an image
    if (name.includes('Products')) {
      actions.setProp(selected.nodeId, (p: any) => {
        if (!Array.isArray(p.products)) return
        const idx = p.products.findIndex((prod: any) => !prod.imageUrl)
        if (idx !== -1) {
          p.products[idx].imageUrl = url
        } else {
          // All have images — set on first
          if (p.products[0]) p.products[0].imageUrl = url
        }
      })
      return
    }

    alert(`The selected block "${name}" doesn't have an image prop.\nSelect a Hero, About, or Products block first.`)
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Header */}
      <div style={{
        padding: '14px 14px 10px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
      }}>
        <div style={{
          fontSize: 9, fontFamily: 'monospace', letterSpacing: 2,
          color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
          marginBottom: 10,
        }}>
          Media Library
        </div>

        {/* Upload button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{
            width: '100%', padding: '8px 12px', borderRadius: 6,
            background: uploading ? 'rgba(255,255,255,0.05)' : 'rgba(45,91,227,0.2)',
            border: '1px dashed rgba(45,91,227,0.4)',
            color: uploading ? 'rgba(255,255,255,0.3)' : '#2d5be3',
            fontSize: 12, fontWeight: 700, cursor: uploading ? 'not-allowed' : 'pointer',
          }}
        >
          {uploading ? 'Uploading...' : '↑ Upload image / video'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          style={{ display: 'none' }}
          onChange={e => {
            const f = e.target.files?.[0]
            if (f) handleUpload(f)
            e.target.value = ''
          }}
        />
      </div>

      {/* Selected block indicator */}
      {selected ? (
        <div style={{
          padding: '6px 14px',
          background: 'rgba(45,91,227,0.08)',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 10, color: '#2d5be3', fontWeight: 700 }}>
            → Click to insert into:
          </span>
          <span style={{
            fontSize: 10, color: 'rgba(255,255,255,0.5)',
            marginLeft: 6, fontFamily: 'monospace',
          }}>
            {selected.name}
          </span>
        </div>
      ) : (
        <div style={{
          padding: '6px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>
            Select a block to insert media
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          padding: '8px 14px', fontSize: 11,
          color: '#e8601a', background: 'rgba(232,96,26,0.08)',
          borderBottom: '1px solid rgba(232,96,26,0.1)',
          flexShrink: 0,
        }}>
          {error}
        </div>
      )}

      {/* Files grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
        {loading ? (
          <div style={{
            textAlign: 'center', color: 'rgba(255,255,255,0.2)',
            fontSize: 12, marginTop: 40,
          }}>
            Loading...
          </div>
        ) : files.length === 0 ? (
          <div style={{
            textAlign: 'center', color: 'rgba(255,255,255,0.2)',
            fontSize: 12, marginTop: 40, lineHeight: 1.6,
          }}>
            No files yet.<br />Upload your first image above.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 6,
          }}>
            {files.map(file => (
              <div
                key={file.name}
                onClick={() => handleInsert(file.url, file.type)}
                style={{
                  position: 'relative',
                  borderRadius: 6,
                  overflow: 'hidden',
                  cursor: selected ? 'pointer' : 'default',
                  border: '1px solid rgba(255,255,255,0.07)',
                  background: '#0f0f18',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => {
                  if (selected)
                    (e.currentTarget as HTMLDivElement).style.borderColor = '#2d5be3'
                }}
                onMouseLeave={e => {
                  ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)'
                }}
                title={selected ? `Insert into ${selected.name}` : file.name}
              >
                {/* Thumbnail */}
                {file.type === 'video' ? (
                  <video
                    src={file.url}
                    style={{ width: '100%', height: 64, objectFit: 'cover', display: 'block' }}
                    muted
                  />
                ) : (
                  <img
                    src={file.url}
                    alt={file.name}
                    style={{ width: '100%', height: 64, objectFit: 'cover', display: 'block' }}
                  />
                )}

                {/* Video badge */}
                {file.type === 'video' && (
                  <div style={{
                    position: 'absolute', top: 4, left: 4,
                    background: 'rgba(0,0,0,0.7)', color: 'white',
                    fontSize: 8, padding: '1px 5px', borderRadius: 3,
                    fontFamily: 'monospace',
                  }}>
                    VIDEO
                  </div>
                )}

                {/* Delete button */}
                <button
                  onClick={e => handleDelete(file.name, e)}
                  style={{
                    position: 'absolute', top: 4, right: 4,
                    width: 18, height: 18, borderRadius: 4,
                    background: 'rgba(232,96,26,0.85)', color: 'white',
                    border: 'none', fontSize: 9, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: 0, transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '0' }}
                  title="Delete"
                >
                  ✕
                </button>

                {/* File name */}
                <div style={{
                  padding: '3px 6px', fontSize: 9,
                  color: 'rgba(255,255,255,0.35)',
                  whiteSpace: 'nowrap', overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  background: 'rgba(0,0,0,0.4)',
                }}>
                  {file.name.split('-').pop()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// CanvasDropZone
// ─────────────────────────────────────────────────────────────
function CanvasDropZone({ savedCanvas }: { savedCanvas: string | null }) {
  return (
    <div style={{ overflow: 'auto', background: '#ede8df', padding: 16 }}>
      {savedCanvas ? (
        <Frame data={savedCanvas} />
      ) : (
        <Frame>
          <Element is={RootContainer} canvas>
            <HeroDarkBlock />
            <ProductsGridBlock />
            <FooterDarkBlock />
          </Element>
        </Frame>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// EditorInner — inside <Editor>, has access to useEditor
// ─────────────────────────────────────────────────────────────
type LeftTab = 'blocks' | 'media' | 'ai'

function EditorInner({
  storeId,
  savedCanvas,
}: {
  storeId: string | null
  savedCanvas: string | null
}) {
  const [activeLeft, setActiveLeft] = useState<LeftTab>('blocks')

  const LEFT_TABS: { id: LeftTab; icon: string; label: string }[] = [
    { id: 'blocks', icon: '⊞', label: 'Blocks' },
    { id: 'media',  icon: '🖼', label: 'Media'  },
    { id: 'ai',     icon: '✦', label: 'AI'     },
  ]

  return (
    <>
      <SingletonGuard />
      <BuilderTopbar storeId={storeId} />

      <div style={{
        flex: 1, display: 'grid', overflow: 'hidden',
        // When media panel is open, give it more width
        gridTemplateColumns: activeLeft === 'media'
          ? '48px 220px 1fr 220px'
          : activeLeft === 'blocks'
          ? '48px 220px 1fr 220px'
          : '48px 1fr 220px',
      }}>

        {/* Icon rail — always visible */}
        <div style={{
          background: '#13131d',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', padding: '10px 0', gap: 4,
        }}>
          {LEFT_TABS.map(tab => (
            <div
              key={tab.id}
              onClick={() => setActiveLeft(prev => prev === tab.id ? 'blocks' : tab.id)}
              style={{
                width: 36, height: 36, borderRadius: 7, cursor: 'pointer',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 2,
                background: activeLeft === tab.id ? '#2d5be3' : 'transparent',
                transition: 'background 0.15s',
              }}
              title={tab.label}
            >
              <span style={{ fontSize: 13 }}>{tab.icon}</span>
              <span style={{
                fontSize: 7, color: activeLeft === tab.id
                  ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)',
                fontFamily: 'monospace',
              }}>
                {tab.label}
              </span>
            </div>
          ))}
        </div>

        {/* Left expandable panel — Blocks or Media */}
        {(activeLeft === 'blocks' || activeLeft === 'media') && (
          <div style={{
            background: '#1a1a24',
            borderRight: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {activeLeft === 'media' ? (
              <MediaPanel />
            ) : (
              <div style={{
                display: 'flex', flexDirection: 'column',
                height: '100%', overflow: 'hidden',
                background: '#1a1a24',
              }}>
                <div style={{
                  padding: '14px 14px 8px', flexShrink: 0,
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  fontSize: 9, fontFamily: 'monospace', letterSpacing: 2,
                  color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
                }}>
                  All blocks
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  <BlocksTab />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Canvas */}
        <CanvasDropZone savedCanvas={savedCanvas} />

        {/* Right settings panel */}
        <BuilderSettings />
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────
export default function EditorCanvas() {
  const searchParams = useSearchParams()
  const urlStoreId   = searchParams.get('storeId')

  const [savedCanvas, setSavedCanvas] = useState<string | null>(null)
  const [storeId, setStoreId]         = useState<string | null>(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState<string | null>(null)

  const supabase = useRef(createClient()).current

  useEffect(() => {
    const load = async () => {
      try {
        if (urlStoreId) {
          const { data: store, error: storeError } = await supabase
            .from('stores').select('id, config_json').eq('id', urlStoreId).single()
          if (storeError && storeError.code !== 'PGRST116') throw storeError
          if (store) {
            setStoreId(store.id)
            const canvas = store.config_json?.canvas
            setSavedCanvas(canvas ? typeof canvas === 'string' ? canvas : JSON.stringify(canvas) : null)
          }
          setLoading(false)
          return
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError) throw authError
        if (!user) { setLoading(false); return }

        const { data: store, error: storeError } = await supabase
          .from('stores').select('id, config_json').eq('user_id', user.id).single()
        if (storeError && storeError.code !== 'PGRST116') throw storeError

        if (store) {
          setStoreId(store.id)
          const canvas = store.config_json?.canvas
          setSavedCanvas(canvas ? typeof canvas === 'string' ? canvas : JSON.stringify(canvas) : null)
        }
      } catch (err) {
        console.error('Failed to load store:', err)
        setError('Failed to load your store.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [supabase, urlStoreId])

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', background: '#13131d',
                  color: 'white', fontFamily: 'sans-serif' }}>
      Loading your store...
    </div>
  )

  if (error) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', background: '#13131d',
                  color: '#e8601a', fontFamily: 'sans-serif', fontSize: 14 }}>
      {error}
    </div>
  )

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column',
                  background: '#13131d', overflow: 'hidden' }}>
      <Editor resolver={RESOLVER_WITH_ROOT}>
        <EditorInner storeId={storeId} savedCanvas={savedCanvas} />
      </Editor>
    </div>
  )
}