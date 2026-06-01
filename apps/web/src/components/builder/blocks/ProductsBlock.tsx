'use client'

import { useNode, useEditor } from '@craftjs/core'
import { useCallback, type Ref } from 'react'

interface ProductsProps {
  title: string
  bgColor: string
  products: { id?: string; name: string; price: string | number; emoji: string }[]
}

export function ProductsBlock({
  title = 'Our products',
  bgColor = '#ffffff',
  products = [],
}: Partial<ProductsProps>) {
  const { connectors } = useNode()
  const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }))
  const connect = connectors.connect as any

  return (
    <div
      ref={enabled ? (connect as unknown as Ref<HTMLDivElement>) : undefined}
      style={{ background: bgColor, padding: '32px 24px', cursor: enabled ? 'move' : 'default' }}
    >
      <h2 style={{ fontSize: 22, fontWeight: 800, textAlign: 'center', marginBottom: 20 }}>
        {title}
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {products.map((p, i) => {
          const id = String(p.id ?? `product-${title}-${i}`)
          const name = String(p.name ?? 'Produit')
          const price = typeof p.price === 'number' ? p.price : Number.parseFloat(String(p.price ?? '0')) || 0
          const emoji = String(p.emoji ?? '📦')

          return (
            <div
              key={id ?? i}
              style={{ background: '#f8f5ef', borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
              <div
                style={{
                  height: 80,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#eee9df',
                  fontSize: 32,
                }}
              >
                {emoji}
              </div>
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{name}</div>
                <div style={{ color: '#2d5be3', fontWeight: 700, fontSize: 13 }}>
                  {price.toFixed(2)} TND
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

ProductsBlock.craft = {
  displayName: 'Products Grid',
  props: { title: 'Our products', bgColor: '#ffffff', products: [] },
}
