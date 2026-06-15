'use client'

import { useCartStore } from '@/lib/stores/cartStore'
import { PaymentDrawer } from './PaymentDrawer'

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
 * - 8.1, 8.2: Payment flow via PaymentDrawer
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

  return (
    <div className="lg:hidden fixed bottom-[80px] left-0 w-full px-4 z-40">
      <div className="bg-card rounded-2xl p-4 flex items-center justify-between shadow-lg backdrop-blur-md bg-opacity-95">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">
            Cart: {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
          <span className="text-xl font-bold text-primary">
            {formatCurrency(total)}
          </span>
        </div>
        <PaymentDrawer />
      </div>
    </div>
  )
}
