'use client'

import Link from 'next/link'
import { ShoppingBag, PlusCircle, Download } from 'lucide-react'
import { useCartStore } from '@/lib/stores/cartStore'

export function DashboardQuickActions() {
  const { clearCart } = useCartStore()

  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Link
        href="/pos"
        onClick={() => clearCart()}
        className="h-16 md:h-14 bg-primary text-primary-foreground rounded-xl font-bold text-sm flex items-center justify-center gap-3 shadow-md hover:opacity-90 active:scale-95 transition-all w-full"
      >
        <ShoppingBag className="w-5 h-5" />
        Buka Kasir POS
      </Link>

      <Link
        href="/inventory"
        className="h-16 md:h-14 bg-card text-foreground hover:text-on-primary rounded-xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-accent active:scale-95 transition-all border border-border w-full"
      >
        <PlusCircle className="w-5 h-5" />
        Tambah Produk
      </Link>

      <Link
        href="/financial"
        className="h-16 md:h-14 bg-card text-foreground hover:text-on-primary rounded-xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-accent active:scale-95 transition-all border border-border w-full"
      >
        <Download className="w-5 h-5" />
        Unduh Laporan
      </Link>
    </section>
  )
}