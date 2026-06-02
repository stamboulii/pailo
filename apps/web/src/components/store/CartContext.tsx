'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

export interface CartItem {
  id: string
  name: string
  price: number
  emoji: string
  quantity: number
  availableStock: number
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
}

interface CartContextValue extends CartState {
  addItem: (item: { id: string; name: string; price: number; emoji: string; availableStock: number }) => void
  removeItem: (id: string) => void
  setQuantity: (id: string, qty: number) => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  totalItems: number
  totalPrice: number
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'pailo-cart'

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CartItem[]
    return parsed.map((item) => ({
      ...item,
      quantity: item.quantity ?? 1,
      availableStock: item.availableStock ?? 99,
    }))
  } catch {
    return []
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setItems(loadCart())
  }, [])

  useEffect(() => {
    saveCart(items)
  }, [items])

  const addItem = useCallback((item: { id: string; name: string; price: number; emoji: string; availableStock?: number }) => {
    const stock = item.availableStock ?? 99
    setItems((prev) => {
      const found = prev.find((p) => p.id === item.id)
      if (found) {
        const nextQty = Math.min(found.quantity + 1, stock)
        return prev.map((p) => (p.id === item.id ? { ...p, quantity: nextQty, availableStock: stock } : p))
      }
      return [...prev, { ...item, quantity: 1, availableStock: stock }]
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const setQuantity = useCallback((id: string, qty: number) => {
    setItems((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        const safeStock = Number.isFinite(p.availableStock) ? p.availableStock : 99
        const next = Number.isFinite(qty) ? qty : p.quantity
        const clamped = Math.max(0, Math.min(next, safeStock))
        if (clamped === 0) return null
        return { ...p, quantity: clamped }
      }).filter(Boolean) as CartItem[]
    )
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])
  const toggleCart = useCallback(
    () => setIsOpen((prev) => !prev),
    []
  )

  const totalItems = items.reduce((sum, p) => sum + p.quantity, 0)
  const totalPrice = items.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        addItem,
        removeItem,
        setQuantity,
        openCart,
        closeCart,
        toggleCart,
        totalItems,
        totalPrice,
        clear,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
