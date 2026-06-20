'use client'

import Link from 'next/link'
import { ShoppingBag, Receipt, ScrollText } from 'lucide-react'
import { useCartStore } from '@/lib/stores/cartStore'

export function DashboardQuickActions() {
  const { clearCart } = useCartStore()

  return (
    <section className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
      {/* POS: Full width on mobile, 1 col on desktop */}
      <Link
        href="/pos"
        onClick={() => clearCart()}
        className="col-span-2 md:col-span-1 h-16 bg-primary text-primary-foreground rounded-2xl font-bold text-base md:text-sm flex items-center justify-center gap-3 shadow-md hover:opacity-90 active:scale-[0.98] transition-all w-full"
      >
        <ShoppingBag className="w-6 h-6" />
        Buka Kasir POS
      </Link>

      {/* Review Invoices */}
      <Link
        href="/invoices"
        className="h-16 bg-card text-foreground rounded-2xl font-bold text-sm flex items-center justify-center gap-3 border border-border hover:bg-muted active:scale-[0.98] transition-all w-full"
      >
        <Receipt className="w-5 h-5 text-primary" />
        Tinjau Tagihan
      </Link>

      {/* View History */}
      <Link
        href="/transactions"
        className="h-16 bg-card text-foreground rounded-2xl font-bold text-sm flex items-center justify-center gap-3 border border-border hover:bg-muted active:scale-[0.98] transition-all w-full"
      >
        <ScrollText className="w-5 h-5 text-primary" />
        Lihat Riwayat
      </Link>
    </section>
  )
}
