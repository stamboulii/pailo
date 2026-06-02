'use client'

import { useCart } from './CartContext'
import { useState, type FormEvent } from 'react'

export default function CartModal() {
  const {
    items,
    isOpen,
    closeCart,
    setQuantity,
    removeItem,
    totalItems,
    totalPrice,
    clear,
  } = useCart()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
  })

  const resetForm = () =>
    setForm({ customerName: '', customerPhone: '', customerAddress: '' })
  const resetMessages = () => {
    setError(null)
    setSuccess(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    resetMessages()
    setLoading(true)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(({ id, name, price, emoji, quantity }) => ({
            id,
            name,
            price,
            emoji,
            quantity,
          })),
          total: totalPrice,
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          customerAddress: form.customerAddress,
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json?.error ?? 'Failed to create order')
      }

      setSuccess('Commande créée avec succès !')
      clear()
      resetForm()
      setTimeout(() => {
        closeCart()
        setSuccess(null)
      }, 1800)
    } catch (err: any) {
      setError(err?.message ?? 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="pailo-cart-overlay" onClick={closeCart}>
      <div className="pailo-cart-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pailo-cart-header">
          <h2 className="pailo-cart-title">Panier ({totalItems})</h2>
          <button
            type="button"
            onClick={closeCart}
            className="pailo-cart-close"
          >
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <p className="pailo-cart-empty">Votre panier est vide.</p>
        ) : (
          <>
            <ul className="pailo-cart-list">
              {items.map((item) => (
                <li key={item.id} className="pailo-cart-item">
                  <span className="pailo-cart-item-emoji" aria-hidden>
                    {item.emoji}
                  </span>
                  <div className="pailo-cart-item-body">
                    <p className="pailo-cart-item-name">{item.name}</p>
                    <p className="pailo-cart-item-price">
                      {(item.price * item.quantity).toFixed(2)} TND
                    </p>
                  </div>
                  <div className="pailo-cart-item-controls">
                    <button
                      type="button"
                      className="pailo-cart-qty"
                      onClick={() => setQuantity(item.id, Math.max(1, (Number(item.quantity) || 1) - 1))}
                      disabled={(Number(item.quantity) || 1) <= 1}
                    >
                      -
                    </button>
                    <span className="pailo-cart-qty-value">{Number(item.quantity) || 1}</span>
                    <button
                      type="button"
                      className="pailo-cart-qty"
                      onClick={() => setQuantity(item.id, Math.min((Number(item.quantity) || 1) + 1, Number(item.availableStock) || 1))}
                      disabled={(Number(item.quantity) || 1) >= (Number(item.availableStock) || 1)}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="pailo-cart-remove"
                      onClick={() => removeItem(item.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <form className="pailo-cart-form" onSubmit={handleSubmit}>
              <h3 className="pailo-cart-form-title">Checkout</h3>

              {error && <p className="pailo-cart-error">{error}</p>}
              {success && (
                <p className="pailo-cart-success">{success}</p>
              )}

              <label className="pailo-cart-label">
                <span>Nom</span>
                <input
                  required
                  value={form.customerName}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      customerName: e.target.value,
                    }))
                  }
                  placeholder="Votre nom"
                />
              </label>

              <label className="pailo-cart-label">
                <span>Téléphone</span>
                <input
                  required
                  value={form.customerPhone}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      customerPhone: e.target.value,
                    }))
                  }
                  placeholder="+216 ..."
                />
              </label>

              <label className="pailo-cart-label">
                <span>Adresse</span>
                <input
                  required
                  value={form.customerAddress}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      customerAddress: e.target.value,
                    }))
                  }
                  placeholder="Votre adresse"
                />
              </label>

              <div className="pailo-cart-total">
                Total : <strong>{totalPrice.toFixed(2)} TND</strong>
              </div>

              <button
                type="submit"
                className="pailo-cart-submit"
                disabled={loading}
              >
                {loading ? 'Traitement...' : 'Commander (COD)'}
              </button>
              <p className="pailo-cart-hint">
                Paiement à la livraison.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
