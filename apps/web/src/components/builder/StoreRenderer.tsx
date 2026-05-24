'use client'

import { Editor, Frame } from '@craftjs/core'
import { HeroBlock } from './blocks/HeroBlock'
import { ProductsBlock } from './blocks/ProductsBlock'
import { CTABlock } from './blocks/CTABlock'

interface Props {
  canvas:    string | null
  storeName: string
}

export default function StoreRenderer({ canvas, storeName }: Props) {
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
      {/*
        Editor in view-only mode — enabled=false means no drag/drop.
        Frame reads the serialized JSON and renders the blocks.
        Customers see the exact same visual as what was built in the editor.
      */}
       <Editor resolver={{ HeroBlock, ProductsBlock, CTABlock }} enabled={false}>
        <Frame json={canvas} />
      </Editor>
    </div>
  )
}