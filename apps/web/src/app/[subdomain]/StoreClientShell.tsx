'use client'

import { useEffect, useState } from 'react'
import StoreRenderer from '@/components/builder/StoreRenderer'
import { CartProvider, useCart } from '@/components/store/CartContext'
import CartModal from '@/components/store/CartModal'

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

function CartButton() {
  const { toggleCart, totalItems } = useCart()

  return (
    <button
      type="button"
      onClick={toggleCart}
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 9999,
        background: '#111',
        color: 'white',
        border: 'none',
        borderRadius: 8,
        padding: '10px 16px',
        fontSize: 14,
        fontWeight: 700,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <span>🛒</span>
      {totalItems > 0 && (
        <span
          style={{
            background: '#e8601a',
            color: 'white',
            borderRadius: 999,
            padding: '2px 8px',
            fontSize: 11,
            fontWeight: 800,
          }}
        >
          {totalItems}
        </span>
      )}
    </button>
  )
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

  return (
    <CartProvider>
      <CartButton />
      <StoreRenderer canvas={canvas} storeName={storeName} />
      <CartModal />
    </CartProvider>
  )
}
