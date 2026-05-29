'use client'

import { Editor, Frame } from '@craftjs/core'
import { useEffect, useState, type ReactNode } from 'react'
import { RESOLVER } from '@/components/onboarding/sections'

interface Props {
  canvas:    string | null
  storeName: string
}

// Must match the RootContainer registered in EditorCanvas
function RootContainer({ children }: { children?: ReactNode }) {
  return <div style={{ minHeight: '100vh' }}>{children as never}</div>
}

const STORE_RESOLVER = { ...RESOLVER, RootContainer }

function StoreRendererInner({ canvas, storeName }: Props) {
  if (!canvas) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px',
                    fontFamily: 'sans-serif' }}>
        <h1>{storeName}</h1>
        <p style={{ color: '#888', marginTop: 12 }}>
          This store is being set up. Check back soon!
        </p>
      </div>
    )
  }

  return (
    <Editor resolver={STORE_RESOLVER} enabled={false}>
      <Frame data={canvas} />
    </Editor>
  )
}

export default function StoreRenderer(props: Props) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return <StoreRendererInner {...props} />
}
