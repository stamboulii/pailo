'use client'

import { useCart } from './CartContext'

export default function CartFAB({ products }: { products: any[] }) {
  const { toggleCart, items } = useCart()

  const qty = items.reduce((s, p) => s + p.quantity, 0)
  if (qty === 0) return null

  return (
    <button
      type="button"
      className="pailo-cart-fab"
      onClick={toggleCart}
    >
      <span className="pailo-cart-fab-emoji" aria-hidden>
        🛒
      </span>
      <span className="pailo-cart-fab-badge">{qty}</span>
    </button>
  )
}
