'use client'

import { useCartStore } from '@/lib/stores/cartStore'
import { PaymentDrawer } from './PaymentDrawer'
import Image from 'next/image'
import { getProductImageUrl } from '@/lib/utils'
import { UtensilsCrossed, ShoppingCart, Minus, Plus } from 'lucide-react'

/**
 * CartSection Component (Client Component)
 * 
 * Displays cart contents, total, and checkout button
 * Desktop: Sticky sidebar
 * Mobile: Floating bottom bar (handled in page.tsx)
 * 
 * Requirements: 6.4, 6.5, 7.1, 7.3 - Display cart contents with real-time total
 * Requirements: 8.1, 8.2, 8.3, 8.5, 8.6 - Payment flow via PaymentDrawer
 * Tasks: 9.4, 10.1, 10.9
 */
export function CartSection() {
  const { items, total, updateQuantity, clearCart } = useCartStore()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-outline-variant p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-on-surface">
          Keranjang
        </h2>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-sm font-semibold text-error hover:underline"
          >
            Hapus Semua
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 max-h-[400px] overflow-y-auto space-y-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ShoppingCart className="w-12 h-12 text-muted-foreground mb-3 opacity-20" />
            <p className="text-sm text-muted-foreground">
              Keranjang masih kosong
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Tambahkan produk untuk memulai transaksi
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 p-3 bg-muted rounded-xl"
            >
              {/* Product Image */}
              <div className="w-16 h-16 bg-surface-container rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                {item.image_url ? (
                  <Image
                    src={getProductImageUrl(item.image_url) || item.image_url}
                    alt={item.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <UtensilsCrossed className="w-6 h-6 text-muted-foreground/40" />
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 flex flex-col justify-between">
                <h3 className="font-semibold text-sm text-foreground line-clamp-1">
                  {item.name}
                </h3>
                <div className="flex justify-between items-end mt-1">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-bold text-primary">
                      {formatCurrency(item.price)}
                    </p>
                    <p className={`text-xs ${item.quantity >= item.stock_quantity ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                      Stok: {item.stock_quantity}
                    </p>
                  </div>
                  
                  {/* Quantity Control */}
                  <div className="flex items-center gap-2 bg-background rounded-lg p-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 flex items-center justify-center text-muted-foreground active:scale-90 transition-transform"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-semibold text-xs text-foreground w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock_quantity}
                      className="w-6 h-6 flex items-center justify-center text-primary active:scale-90 transition-transform disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Divider */}
      {items.length > 0 && (
        <div className="border-t border-outline-variant" />
      )}

      {/* Cart Summary */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            Total Item
          </span>
          <span className="text-sm font-semibold text-foreground">
            {itemCount} item
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-base font-semibold text-foreground">
            Total
          </span>
          <span className="text-xl font-bold text-primary">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      {/* Checkout Button with Payment Drawer */}
      <PaymentDrawer />
    </div>
  )
}
