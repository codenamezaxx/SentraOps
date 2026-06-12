'use client'

import type { Product } from '@/lib/types'
import { useCartStore } from '@/lib/stores/cartStore'

interface ProductCardProps {
  product: Product
}

/**
 * ProductCard Component (Client Component)
 * 
 * Individual product card with image, name, price, and add button
 * Integrates with Zustand cart store for state management
 * 
 * Requirements: 6.2, 6.3 - Add products to cart with quantity management
 */
export function ProductCard({ product }: ProductCardProps) {
  const { items, addItem, updateQuantity } = useCartStore()
  
  // Check if product is already in cart
  const cartItem = items.find((item) => item.id === product.id)
  const quantity = cartItem?.quantity || 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleAdd = () => {
    addItem(product)
  }

  const handleIncrement = () => {
    updateQuantity(product.id, quantity + 1)
  }

  const handleDecrement = () => {
    if (quantity > 1) {
      updateQuantity(product.id, quantity - 1)
    } else {
      updateQuantity(product.id, 0) // This will remove the item
    }
  }

  return (
    <article className="bg-surface-container-lowest dark:bg-surface-container-low rounded-2xl shadow-sm border border-outline-variant dark:border-none overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {/* Product Image Placeholder */}
      <div className="h-32 w-full bg-surface-variant relative flex items-center justify-center">
        <span className="material-symbols-outlined text-outline-variant text-4xl">
          fastfood
        </span>
      </div>

      {/* Product Info */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-sm text-on-surface dark:text-surface line-clamp-2 mb-1">
            {product.name}
          </h3>
          <p className="text-base font-bold text-primary dark:text-primary-fixed">
            {formatCurrency(product.price)}
          </p>
        </div>

        {/* Add Button or Quantity Control */}
        <div className="flex justify-end mt-3">
          {quantity === 0 ? (
            // Add Button (when not in cart)
            <button
              onClick={handleAdd}
              className="bg-primary hover:bg-primary/90 text-on-primary rounded-xl h-10 w-10 flex items-center justify-center active:scale-90 transition-transform shadow-sm"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          ) : (
            // Quantity Control (when in cart)
            <div className="flex items-center gap-3 bg-surface-container-high dark:bg-inverse-surface rounded-xl p-1 shadow-sm">
              <button
                onClick={handleDecrement}
                className="w-8 h-8 flex items-center justify-center text-on-surface-variant active:scale-90 transition-transform"
              >
                <span className="material-symbols-outlined text-sm">remove</span>
              </button>
              <span className="font-semibold text-sm text-on-surface w-4 text-center">
                {quantity}
              </span>
              <button
                onClick={handleIncrement}
                className="w-8 h-8 flex items-center justify-center text-primary active:scale-90 transition-transform bg-surface-container-lowest dark:bg-surface-dark rounded-lg shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">add</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
