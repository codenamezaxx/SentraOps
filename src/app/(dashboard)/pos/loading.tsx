'use client'

import { PhantomSkeleton } from '@/components/ui/PhantomSkeleton'

export default function POSLoading() {
  return (
    <PhantomSkeleton animation="shimmer" stagger={0.03}>
      <div className="flex-1 pb-24 md:pb-8 px-4 md:px-10 flex flex-col gap-6 w-full max-w-7xl mx-auto">
        {/* Mobile Barcode Search */}
        <div className="md:hidden w-full h-12 rounded-xl bg-card border border-border flex items-center px-4 text-muted-foreground text-sm">
          Cari produk...
        </div>

        {/* Two-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Product Selection */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Category pills */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 w-24 rounded-full bg-card border border-border flex items-center justify-center shrink-0 text-sm text-muted-foreground">
                  Kategori
                </div>
              ))}
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <div key={i} className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                  <div className="h-32 w-full bg-muted" />
                  <div className="p-3 space-y-2">
                    <p className="text-sm text-foreground font-medium">Nama Produk</p>
                    <p className="text-lg font-bold text-primary">Rp 0</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Cart (Desktop) */}
          <div className="hidden lg:block lg:w-95 xl:w-105">
            <div className="sticky top-5 space-y-6">
              <div className="h-12 w-full rounded-xl bg-card border border-border flex items-center px-4 text-muted-foreground text-sm">
                Cari produk...
              </div>
              <div className="h-[600px] w-full rounded-3xl bg-card border border-border p-5 flex flex-col gap-4">
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                  <div className="h-5 w-5 rounded bg-muted" />
                  <span className="text-base font-bold text-foreground">Pesanan</span>
                </div>
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-center justify-between py-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-foreground">Produk Loading</span>
                      <span className="text-xs text-muted-foreground">Rp 0 x 0</span>
                    </div>
                    <span className="font-bold text-foreground">Rp 0</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PhantomSkeleton>
  )
}
