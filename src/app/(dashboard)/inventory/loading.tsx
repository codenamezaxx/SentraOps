'use client'

import { PhantomSkeleton } from '@/components/ui/PhantomSkeleton'

export default function InventoryLoading() {
  return (
    <PhantomSkeleton animation="shimmer" stagger={0.03}>
      <div className="px-4 md:px-8 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              ICON
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Manajemen Inventori</h1>
              <p className="text-sm text-muted-foreground">Kelola stok produk dan ambang batas peringatan</p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card p-4 rounded-2xl border border-border flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  ICON
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Statistik</p>
                  <p className="text-2xl font-bold text-foreground">0</p>
                </div>
              </div>
            ))}
          </div>

          {/* Search + Add Button */}
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="h-12 w-full md:w-96 rounded-xl bg-card border border-border flex items-center px-4 text-muted-foreground text-sm">
              Cari produk...
            </div>
            <div className="h-12 w-full md:w-40 rounded-xl bg-muted/50 text-muted-foreground flex items-center justify-center font-semibold text-sm">
              + Tambah Produk
            </div>
          </div>

          {/* Table */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            {/* Header row */}
            <div className="h-12 border-b border-border flex items-center px-5 gap-4">
              {[1, 2, 3, 4, 5].map((j) => (
                <p key={j} className="text-sm font-semibold text-muted-foreground flex-1">Kolom</p>
              ))}
            </div>
            {/* Body rows */}
            <div className="divide-y divide-border">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-16 flex items-center px-5 gap-4">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <p key={j} className="text-sm text-foreground flex-1">Isi</p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PhantomSkeleton>
  )
}
