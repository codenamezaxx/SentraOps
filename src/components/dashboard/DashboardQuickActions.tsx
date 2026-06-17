'use client'

import Link from 'next/link'
import { ShoppingBag, PlusCircle, FileText } from 'lucide-react'
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

      {/* Add Product */}
      <Link
        href="/inventory"
        className="h-16 bg-card text-foreground rounded-2xl font-bold text-sm flex items-center justify-center gap-3 border border-border hover:bg-muted active:scale-[0.98] transition-all w-full"
      >
        <PlusCircle className="w-5 h-5 text-primary" />
        Tambah Produk
      </Link>

      {/* Reports */}
      <Link
        href="/financial"
        className="h-16 bg-card text-foreground rounded-2xl font-bold text-sm flex items-center justify-center gap-3 border border-border hover:bg-muted active:scale-[0.98] transition-all w-full"
      >
        <FileText className="w-5 h-5 text-primary" />
        Lihat Laporan
      </Link>
    </section>
  )
}