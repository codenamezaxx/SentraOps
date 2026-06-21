import { PhantomSkeleton } from '@/components/ui/PhantomSkeleton'
import { BarChart3 } from 'lucide-react'

export default function FinancialLoading() {
  return (
    <PhantomSkeleton animation="shimmer" stagger={0.03}>
      <div className="flex-1 pb-24 md:pb-8 px-4 md:px-10 flex flex-col gap-6 w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Ringkasan Keuangan</h1>
            <p className="text-sm text-muted-foreground">Periode: 1 - 30 Juni 2026</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-9 w-24 rounded-xl bg-muted/50" />
              ))}
            </div>
          </div>
        </div>

        {/* Stat Cards — top row: 2 columns (Pendapatan + Pengeluaran) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-card p-5 rounded-2xl border border-outline-variant shadow-md flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <p className="text-sm font-semibold text-muted-foreground">Metrik Keuangan</p>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">Rp 0</h3>
            </div>
          ))}
        </div>

        {/* Stat Cards — second row: 3 columns (HPP, Laba Bersih, Margin) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card p-5 rounded-2xl border border-outline-variant shadow-md flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <p className="text-sm font-semibold text-muted-foreground">Metrik Keuangan</p>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">Rp 0</h3>
            </div>
          ))}
        </div>

        {/* Revenue Chart */}
        <div className="bg-card p-6 rounded-2xl border border-outline-variant shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Tren Pendapatan</h3>
          </div>
          <div className="h-64 w-full bg-muted rounded-xl flex items-center justify-center">
            <span className="text-muted-foreground">Chart loading</span>
          </div>
        </div>

        {/* Payment Method + Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-card p-6 rounded-2xl border border-outline-variant shadow-sm">
              <h3 className="text-base font-bold text-foreground mb-4">Section Loading</h3>
              <div className="flex flex-col gap-4">
                {[1, 2].map((j) => (
                  <div key={j} className="flex items-center gap-3 min-h-[48px]">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm font-medium text-foreground">Item</span>
                        <span className="text-sm font-bold text-foreground">Rp 0</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Detail loading</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PhantomSkeleton>
  )
}
