'use client'

import { useState, useEffect, type ReactNode } from 'react'
import CartProvider from './CartContext'
import CartModal from './CartModal'
import { useCart } from './CartContext'

interface Props {
  canvas: string | null
  storeName: string
  products: { id: string; name: string; price: string; emoji: string }[]
  children?: ReactNode
}

function CartHeaderButton() {
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
        <span style={{
          background: '#e8601a',
          color: 'white',
          borderRadius: 999,
          padding: '2px 8px',
          fontSize: 11,
          fontWeight: 800,
        }}>
          {totalItems}
        </span>
      )}
    </button>
  )
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
      <CartHeaderButton />
      <div>
        <div className="pailo-store-canvas">{storeName ? <p style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>{storeName}</p> : null}</div>
      </div>
      <CartModal />
    </CartProvider>
  )
}
