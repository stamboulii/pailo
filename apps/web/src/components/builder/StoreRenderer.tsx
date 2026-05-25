'use client'

import { Editor, Frame } from '@craftjs/core'
import { HeroBlock } from './blocks/HeroBlock'
import { ProductsBlock } from './blocks/ProductsBlock'
import { CTABlock } from './blocks/CTABlock'
import { useEffect, useState } from 'react'

interface Props {
  canvas:    string | null
  storeName: string
}

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
    <div>
      <Editor resolver={{ HeroBlock, ProductsBlock, CTABlock }} enabled={false}>
        <Frame json={canvas} />
      </Editor>
    </div>
  )
}

export default function StoreRenderer(props: Props) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return <StoreRendererInner {...props} />
}