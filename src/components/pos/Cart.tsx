'use client'

import { useCartStore } from '@/lib/stores/cartStore'
import Image from 'next/image'
import { getProductImageUrl } from '@/lib/utils'
import { ShoppingCart, UtensilsCrossed, X, Minus, Plus } from 'lucide-react'

/**
 * Cart Component (Client Component)
 * 
 * Displays cart items with product names, quantities, subtotals
 * Shows real-time cart total
 * Implements quantity increment/decrement controls
 * Add remove item functionality
 * 
 * Requirements: 6.4, 6.5, 7.1, 7.2, 7.3
 * Task: 9.4 - Implement cart display component
 */
export function Cart() {
  const { items, total, updateQuantity, removeItem } = useCartStore()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate subtotal for each item (Requirement 6.4)
  const calculateSubtotal = (price: number, quantity: number) => {
    return price * quantity
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Cart Items List */}
      <div className="flex-1 space-y-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ShoppingCart className="w-12 h-12 text-muted-foreground mb-3 opacity-20" />
            <p className="text-sm text-on-surface-variant dark:text-surface-variant">
              Keranjang masih kosong
            </p>
            <p className="text-xs text-on-surface-variant dark:text-surface-variant mt-1">
              Tambahkan produk untuk memulai transaksi
            </p>
          </div>
        ) : (
          items.map((item) => {
            const subtotal = calculateSubtotal(item.price, item.quantity)
            const imageUrl = getProductImageUrl(item.image_url)
            
            return (
              <div
                key={item.id}
                className="flex gap-3 p-3 bg-surface-container-low dark:bg-surface-container rounded-xl border border-outline-variant dark:border-none"
              >
                {/* Product Image */}
                <div className="w-16 h-16 bg-surface-variant dark:bg-surface-container-high rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <UtensilsCrossed className="w-6 h-6 text-outline-variant" />
                  )}
                </div>

                {/* Product Info & Controls */}
                <div className="flex-1 flex flex-col gap-2">
                  {/* Product Name (Requirement 6.4) */}
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-semibold text-sm text-on-surface dark:text-surface line-clamp-2 flex-1">
                      {item.name}
                    </h3>
                    
                    {/* Remove Item Button (Requirement 7.3) */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-on-surface-variant dark:text-surface-variant hover:text-error hover:dark:text-error transition-colors p-1 rounded-lg hover:bg-error-container/10 active:scale-90"
                      aria-label="Hapus item"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Price and Quantity Controls */}
                  <div className="flex justify-between items-center">
                    {/* Unit Price */}
                    <div className="flex flex-col">
                      <p className="text-xs font-medium text-primary dark:text-primary-fixed">
                        {formatCurrency(item.price)}
                      </p>
                      {/* Subtotal (Requirement 6.4) */}
                      <p className="text-xs text-on-surface-variant dark:text-surface-variant">
                        Subtotal: {formatCurrency(subtotal)}
                      </p>
                    </div>

                    {/* Quantity Increment/Decrement Controls (Requirement 7.1, 7.2) */}
                    <div className="flex items-center gap-2 bg-surface-container-high dark:bg-inverse-surface rounded-xl p-1 shadow-sm">
                      {/* Decrement Button */}
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-on-surface-variant dark:text-surface-variant hover:text-on-surface hover:dark:text-surface active:scale-90 transition-transform rounded-lg hover:bg-surface-container-low"
                        aria-label="Kurangi jumlah"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      {/* Quantity Display (Requirement 6.4) */}
                      <span className="font-semibold text-sm text-on-surface dark:text-surface w-6 text-center">
                        {item.quantity}
                      </span>

                      {/* Increment Button */}
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-primary dark:text-primary-fixed active:scale-90 transition-transform bg-surface-container-lowest dark:bg-surface-dark rounded-lg shadow-sm hover:bg-primary-container"
                        aria-label="Tambah jumlah"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Cart Total (Requirement 6.5, 7.1) */}
      {items.length > 0 && (
        <div className="pt-4 border-t border-outline-variant dark:border-zinc-700">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-on-surface-variant dark:text-surface-variant">
              Total Item
            </span>
            <span className="text-sm font-semibold text-on-surface dark:text-surface">
              {items.reduce((sum, item) => sum + item.quantity, 0)} item
            </span>
          </div>

          {/* Real-time Cart Total (Requirement 6.5) */}
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-on-surface dark:text-surface">
              Total Pembayaran
            </span>
            <span className="text-xl font-bold text-primary dark:text-primary-fixed">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}