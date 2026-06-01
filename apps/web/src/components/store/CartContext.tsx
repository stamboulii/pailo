'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

export interface CartItem {
  id: string
  name: string
  price: number
  emoji: string
  quantity: number
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
}

interface CartContextValue extends CartState {
  addItem: (item: Omit<CartItem, 'quantity'>) => void
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
    return JSON.parse(raw) as CartItem[]
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

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setItems((prev) => {
      const found = prev.find((p) => p.id === item.id)
      if (found) {
        return prev.map((p) =>
          p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const setQuantity = useCallback((id: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((p) => p.id !== id))
      return
    }
    setItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, quantity: qty } : p))
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
