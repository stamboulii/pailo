'use client'

import { useState, useEffect, type ReactNode } from 'react'
import CartProvider from './CartContext'
import CartFAB from './CartFAB'
import CartDrawer from './CartDrawer'

interface Props {
  canvas: string | null
  storeName: string
  products: { id: string; name: string; price: string; emoji: string }[]
  children?: ReactNode
}

export default function PublishedStoreShell({
  canvas,
  storeName,
  products,
}: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div>
        <div className="pailo-store-skeleton" />
      </div>
    )
  }

  return (
    <CartProvider>
      <div>
        <div className="pailo-store-canvas">{storeName ? <p style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>{storeName}</p> : null}</div>
      </div>
      <CartFAB products={products} />
      <CartDrawer />
    </CartProvider>
  )
}
