'use client'

import { PhantomSkeleton } from '@/components/ui/PhantomSkeleton'

export default function TransactionsLoading() {
  return (
    <PhantomSkeleton animation="shimmer" stagger={0.03}>
      <div className="flex-1 pb-24 md:pb-8 px-4 md:px-10 flex flex-col gap-6 w-full max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Riwayat Transaksi</h1>

        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="h-12 w-full md:w-96 rounded-xl bg-card border border-border flex items-center px-4 text-muted-foreground text-sm">
            Cari transaksi...
          </div>
          <div className="h-12 w-full md:w-32 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground text-sm font-medium">
            Filter
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          {/* Header */}
          <div className="h-12 border-b border-border flex items-center px-5 gap-4">
            {[1, 2, 3, 4, 5].map((j) => (
              <p key={j} className="text-sm font-semibold text-muted-foreground flex-1">Kolom</p>
            ))}
          </div>
          {/* Rows */}
          <div className="divide-y divide-border">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-16 flex items-center px-5 gap-4">
                {[1, 2, 3, 4, 5].map((j) => (
                  <p key={j} className="text-sm text-foreground flex-1">Isi</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </PhantomSkeleton>
  )
}
