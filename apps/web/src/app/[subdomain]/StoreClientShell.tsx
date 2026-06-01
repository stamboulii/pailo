'use client'

import { useEffect, useState } from 'react'
import StoreRenderer from '@/components/builder/StoreRenderer'
import { CartProvider } from '@/components/store/CartContext'
import CartDrawer from '@/components/store/CartDrawer'
import CartFAB from '@/components/store/CartFAB'

interface Product {
  id: string
  name: string
  price: number
  emoji: string
}

interface Props {
  canvas: string | null
  storeName: string
  products: Product[]
}

export default function StoreClientShell({ canvas, storeName, products }: Props) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div>
        <div className="pailo-store-skeleton" />
      </div>
    )
  }

  const cartProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    emoji: p.emoji,
  }))

  return (
    <CartProvider>
      <div>
        <StoreRenderer canvas={canvas} storeName={storeName} />
      </div>
      <CartFAB products={cartProducts} />
      <CartDrawer />
    </CartProvider>
  )
}
