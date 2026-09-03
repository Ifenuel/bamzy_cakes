import { createContext, useContext, useMemo } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { apiTrackEvent } from '../utils/api.js'

const CartContext = createContext(null)

const CART_STORAGE_KEY = 'bamzy_cart'

// UUID format check — real database IDs are UUIDs, old mock IDs are like "prod_001"
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function cleanStaleItems(items) {
  return items.filter((item) => UUID_REGEX.test(item.productId))
}

// Cart item shape: { productId, name, price, image, quantity }

export function CartProvider({ children }) {
  const [rawItems, setRawItems] = useLocalStorage(CART_STORAGE_KEY, [])

  // Auto-clean stale (non-UUID) cart items on load
  const items = useMemo(() => {
    const cleaned = cleanStaleItems(rawItems)
    // If items were removed, update localStorage
    if (cleaned.length !== rawItems.length) {
      setRawItems(cleaned)
    }
    return cleaned
  }, [rawItems, setRawItems])

  function addItem(product, quantity = 1) {
    apiTrackEvent('add_to_cart', { product_id: product.id, product_name: product.name, category: product.category, quantity })
    setRawItems((prev) => {
      const cleaned = cleanStaleItems(prev)
      const existing = cleaned.find((item) => item.productId === product.id)
      if (existing) {
        return cleaned.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [
        ...cleaned,
        {
          productId: product.id,
          name: product.name,
          price: Number(product.price) || 0,
          image: product.image || product.imageUrl || '',
          quantity,
        },
      ]
    })
  }

  function removeItem(productId) {
    apiTrackEvent('remove_from_cart', { product_id: productId })
    setRawItems((prev) => prev.filter((item) => item.productId !== productId))
  }

  function increaseQuantity(productId) {
    setRawItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    )
  }

  function decreaseQuantity(productId) {
    setRawItems((prev) =>
      prev
        .map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  function clearCart() {
    setRawItems([])
  }

  function getCartTotal() {
    return items.reduce((total, item) => total + Number(item.price || 0) * item.quantity, 0)
  }

  function getItemCount() {
    return items.reduce((count, item) => count + item.quantity, 0)
  }

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      increaseQuantity,
      decreaseQuantity,
      clearCart,
      getCartTotal,
      getItemCount,
    }),
    [items]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
