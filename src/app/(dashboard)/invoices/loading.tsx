'use client'

import { PhantomSkeleton } from '@/components/ui/PhantomSkeleton'

export default function InvoicesLoading() {
  return (
    <PhantomSkeleton animation="shimmer" stagger={0.03}>
      <div className="flex-1 pb-24 md:pb-8 px-4 md:px-10 flex flex-col gap-6 w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manajemen Tagihan</h1>
            <p className="text-sm text-muted-foreground">Kelola faktur dan tagihan pelanggan</p>
          </div>
          <div className="h-12 bg-muted/50 text-muted-foreground rounded-xl font-semibold text-sm px-5 flex items-center gap-2">
            + Tambah Tagihan
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="w-full flex gap-2 bg-muted/30 rounded-xl p-1.5 h-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-full flex-1 rounded-lg bg-card border border-border flex items-center justify-center text-sm text-muted-foreground">
              Tab
            </div>
          ))}
        </div>

        {/* Invoice List */}
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col gap-2 p-4 rounded-xl bg-card border border-border">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1.5 min-w-0">
                  <p className="text-sm font-medium text-foreground">Nama Pelanggan</p>
                  <p className="text-xs text-muted-foreground">Tanggal jatuh tempo</p>
                </div>
                <div className="h-5 w-14 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-semibold">Status</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-base font-bold text-foreground">Rp 0</p>
                <div className="h-10 rounded-lg bg-muted flex items-center px-4 text-xs font-medium text-muted-foreground">
                  Tandai Lunas
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PhantomSkeleton>
  )
}
