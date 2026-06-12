'use client'

import { useCartStore } from '@/lib/stores/cartStore'

/**
 * CartSection Component (Client Component)
 * 
 * Displays cart contents, total, and checkout button
 * Desktop: Sticky sidebar
 * Mobile: Floating bottom bar (handled in page.tsx)
 * 
 * Requirements: 6.4, 6.5, 7.1, 7.3 - Display cart contents with real-time total
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

  const handleCheckout = () => {
    // TODO: Implement checkout flow in next task
    console.log('Checkout clicked')
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="bg-surface-container-lowest dark:bg-surface-container-low rounded-2xl shadow-sm border border-outline-variant dark:border-none p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-on-surface dark:text-surface">
          Keranjang
        </h2>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-sm font-semibold text-[color:hsl(var(--error))] hover:underline"
          >
            Hapus Semua
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 max-h-[400px] overflow-y-auto space-y-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-3">
              shopping_cart
            </span>
            <p className="text-sm text-on-surface-variant">
              Keranjang masih kosong
            </p>
            <p className="text-xs text-on-surface-variant mt-1">
              Tambahkan produk untuk memulai transaksi
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 p-3 bg-surface-container-high dark:bg-inverse-surface rounded-xl"
            >
              {/* Product Image Placeholder */}
              <div className="w-16 h-16 bg-surface-variant rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-outline-variant text-2xl">
                  fastfood
                </span>
              </div>

              {/* Product Info */}
              <div className="flex-1 flex flex-col justify-between">
                <h3 className="font-semibold text-sm text-on-surface dark:text-surface line-clamp-1">
                  {item.name}
                </h3>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm font-bold text-primary dark:text-primary-fixed">
                    {formatCurrency(item.price)}
                  </p>
                  
                  {/* Quantity Control */}
                  <div className="flex items-center gap-2 bg-surface-container-lowest dark:bg-surface-dark rounded-lg p-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 flex items-center justify-center text-on-surface-variant active:scale-90 transition-transform"
                    >
                      <span className="material-symbols-outlined text-xs">remove</span>
                    </button>
                    <span className="font-semibold text-xs text-on-surface w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center text-primary active:scale-90 transition-transform"
                    >
                      <span className="material-symbols-outlined text-xs">add</span>
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
        <div className="border-t border-outline-variant dark:border-zinc-700" />
      )}

      {/* Cart Summary */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-on-surface-variant">
            Total Item
          </span>
          <span className="text-sm font-semibold text-on-surface dark:text-surface">
            {itemCount} item
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-base font-semibold text-on-surface dark:text-surface">
            Total
          </span>
          <span className="text-xl font-bold text-primary dark:text-primary-fixed">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={handleCheckout}
        disabled={items.length === 0}
        className="w-full bg-primary hover:bg-primary/90 disabled:bg-surface-container-high disabled:text-on-surface-variant text-on-primary font-semibold py-3 rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-sm h-12 disabled:cursor-not-allowed"
      >
        Bayar
        <span className="material-symbols-outlined text-sm">arrow_forward</span>
      </button>
    </div>
  )
}
