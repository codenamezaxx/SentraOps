'use client'

import type { Product } from '@/lib/types'
import { useCartStore } from '@/lib/stores/cartStore'
import Image from 'next/image'
import { Plus, Minus, UtensilsCrossed } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

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
    <article className="bg-card rounded-2xl shadow-sm border border-outline-variant overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {/* Product Image */}
      <div className="h-32 w-full bg-muted relative flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <Image 
            src={product.image_url} 
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <UtensilsCrossed className="w-8 h-8 text-muted-foreground" />
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-sm text-foreground line-clamp-2 mb-1">
            {product.name}
          </h3>
          <p className="text-base font-bold text-primary">
            {formatCurrency(product.price)}
          </p>
        </div>

        {/* Add Button or Quantity Control */}
        <div className="flex justify-end mt-3">
          {quantity === 0 ? (
            // Add Button (when not in cart)
            <button
              onClick={handleAdd}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-10 w-10 flex items-center justify-center active:scale-90 transition-transform shadow-sm"
            >
              <Plus className="w-5 h-5" />
            </button>
          ) : (
            // Quantity Control (when in cart)
            <div className="flex items-center gap-3 bg-muted rounded-xl p-1 shadow-sm">
              <button
                onClick={handleDecrement}
                className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-90 transition-transform"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-semibold text-sm text-foreground w-4 text-center">
                {quantity}
              </span>
              <button
                onClick={handleIncrement}
                className="w-8 h-8 flex items-center justify-center text-primary active:scale-90 transition-transform bg-card rounded-xl shadow-sm"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
