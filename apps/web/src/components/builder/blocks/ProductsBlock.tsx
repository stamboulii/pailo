'use client'

import { useNode } from '@craftjs/core'

interface ProductsProps {
  title:    string
  bgColor:  string
  products: { name: string; price: string; emoji: string }[]
}

const DEFAULT_PRODUCTS = [
  { name: 'Product 1', price: '0.00', emoji: '📦' },
  { name: 'Product 2', price: '0.00', emoji: '📦' },
  { name: 'Product 3', price: '0.00', emoji: '📦' },
]

export function ProductsBlock({
  title    = 'Our products',
  bgColor  = '#ffffff',
  products = DEFAULT_PRODUCTS,
}: Partial<ProductsProps>) {
  const { connectors: { connect, drag } } = useNode()

  return (
    <div ref={ref => { if (ref) connect(drag(ref)) }}
      style={{ background: bgColor, padding: '32px 24px', cursor: 'move' }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, textAlign: 'center',
                   marginBottom: 20 }}>{title}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {products.map((p, i) => (
          <div key={i} style={{ background: '#f8f5ef', borderRadius: 8,
                                 overflow: 'hidden' }}>
            <div style={{ height: 80, display: 'flex', alignItems: 'center',
                          justifyContent: 'center', background: '#eee9df',
                          fontSize: 32 }}>{p.emoji}</div>
            <div style={{ padding: '10px 12px' }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{p.name}</div>
              <div style={{ color: '#2d5be3', fontWeight: 700, fontSize: 13 }}>
                {p.price} TND
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

ProductsBlock.craft = {
  displayName: 'Products Grid',
  props: { title: 'Our products', bgColor: '#ffffff', products: DEFAULT_PRODUCTS },
}