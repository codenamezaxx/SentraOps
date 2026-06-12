'use client'

import { useCartStore } from '@/lib/stores/cartStore'

/**
 * MobileCartBar Component (Client Component)
 * 
 * Floating bottom cart bar for mobile devices
 * Displays cart summary and checkout button
 * Hidden on desktop (lg breakpoint and above)
 * 
 * Requirements: 
 * - 6.4: Display cart contents with product names, quantities, and subtotal prices
 * - 6.5: Calculate and display cart total in real-time
 * - 13.2: Fixed bottom navigation bar on mobile devices
 */
export function MobileCartBar() {
  const { items, total } = useCartStore()

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleCheckout = () => {
    // TODO: Implement mobile cart drawer or navigate to checkout page
    console.log('Mobile checkout clicked')
  }

  return (
    <div className="lg:hidden fixed bottom-[80px] left-0 w-full px-4 z-40">
      <div className="bg-inverse-surface dark:bg-surface-container-highest rounded-2xl p-4 flex items-center justify-between shadow-lg backdrop-blur-md bg-opacity-95">
        <div className="flex flex-col">
          <span className="text-xs text-surface-variant dark:text-on-surface-variant">
            Cart: {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
          <span className="text-xl font-bold text-surface dark:text-on-surface">
            {formatCurrency(total)}
          </span>
        </div>
        <button 
          onClick={handleCheckout}
          disabled={items.length === 0}
          className="bg-primary hover:bg-primary/90 disabled:bg-surface-container-high disabled:text-on-surface-variant text-on-primary font-semibold py-3 px-8 rounded-xl active:scale-95 transition-transform flex items-center gap-2 shadow-sm h-12 disabled:cursor-not-allowed"
        >
          Bayar
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    </div>
  )
}
