'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { useCartStore } from '@/lib/stores/cartStore'
const PaymentDrawer = dynamic(() => import('@/components/pos/PaymentDrawer').then(m => m.PaymentDrawer), {
  loading: () => null,
})
import { ChevronUp, Minus, Plus, ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import { getProductImageUrl } from '@/lib/utils'

/**
 * MobileCartBar Component (Client Component)
 * 
 * Floating bottom cart bar for mobile devices.
 * Tap to expand/collapse cart items list (bottom-sheet style).
 * Stays visible while payment sheet is open so result shows.
 * 
 * Requirements: 6.4, 6.5, 13.2
 */
export function MobileCartBar() {
  const { items, total, updateQuantity, clearCart } = useCartStore()
  const [expanded, setExpanded] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Keep rendering while payment sheet is open (for result view)
  if (items.length === 0 && !paymentOpen) return null

  return (
    <div className="lg:hidden fixed bottom-[80px] left-0 w-full px-3 z-40">
      <div className="bg-card rounded-2xl shadow-lg border border-outline-variant overflow-hidden transition-all duration-300">
        {/* Expanded Items List */}
        {expanded && items.length > 0 && (
          <div className="border-b border-outline-variant">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Isi Keranjang</span>
              </div>
              <button
                onClick={() => { clearCart(); setExpanded(false); }}
                className="text-xs font-semibold text-destructive hover:underline"
              >
                Hapus Semua
              </button>
            </div>

            {/* Items */}
            <div className="max-h-[280px] overflow-y-auto px-4 space-y-2 pb-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2.5 bg-muted rounded-xl"
                >
                  {/* Thumbnail */}
                  <div className="w-10 h-10 bg-surface-container rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                    {item.image_url ? (
                      <Image
                        src={getProductImageUrl(item.image_url) || item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <ShoppingCart className="w-4 h-4 text-muted-foreground/40" />
                    )}
                  </div>

                  {/* Name + Stock */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-1">{item.name}</p>
                    <p className={`text-xs ${item.quantity >= item.stock_quantity ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                      Stok: {item.stock_quantity}
                    </p>
                  </div>

                  {/* Qty Controls */}
                  <div className="flex items-center gap-1.5 bg-background rounded-lg p-0.5">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 flex items-center justify-center text-muted-foreground active:scale-90 transition-transform"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-semibold text-foreground w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock_quantity}
                      className="w-6 h-6 flex items-center justify-center text-primary active:scale-90 transition-transform disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <span className="text-sm font-bold text-primary whitespace-nowrap">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Bar (always visible when mounted) */}
        <div
          className="flex items-center gap-3 p-3 cursor-pointer select-none"
          onClick={() => items.length > 0 && setExpanded(!expanded)}
        >
          {/* Expand indicator */}
          <button
            className="w-10 h-10 flex items-center justify-center text-muted-foreground flex-shrink-0"
            aria-label={expanded ? 'Tutup keranjang' : 'Buka keranjang'}
          >
            <ChevronUp className={`w-5 h-5 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
          </button>

          <div className="h-8 w-px bg-border mx-1" />

          <div className="flex flex-col min-w-0">
            <span className="text-xs text-muted-foreground">
              Cart: {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(total)}
            </span>
          </div>

          <div className="ml-auto w-32" onClick={(e) => e.stopPropagation()}>
            <PaymentDrawer onOpenChange={setPaymentOpen} />
          </div>
        </div>
      </div>
    </div>
  )
}