import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'rich-inter.cart.v1'

function readStoredCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readStoredCart())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = (product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((line) => line.product_id === product.id)
      if (existing) {
        const nextQty = Math.min(existing.quantity + qty, product.stock_quantity)
        return prev.map((line) =>
          line.product_id === product.id ? { ...line, quantity: nextQty } : line
        )
      }
      const starting = Math.min(qty, product.stock_quantity)
      if (starting < 1) return prev
      return [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          price: Number(product.price),
          image_url: product.image_url ?? null,
          stock_quantity: product.stock_quantity,
          quantity: starting
        }
      ]
    })
  }

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((line) => line.product_id !== productId))
  }

  const updateQuantity = (productId, quantity) => {
    setItems((prev) =>
      prev
        .map((line) => {
          if (line.product_id !== productId) return line
          const capped = Math.max(1, Math.min(quantity, line.stock_quantity))
          return { ...line, quantity: capped }
        })
        .filter((line) => line.quantity > 0)
    )
  }

  const clear = () => setItems([])

  const { count, total } = useMemo(() => {
    let count = 0
    let total = 0
    for (const line of items) {
      count += line.quantity
      total += line.quantity * line.price
    }
    return { count, total }
  }, [items])

  const value = {
    items,
    count,
    total,
    addItem,
    removeItem,
    updateQuantity,
    clear
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
