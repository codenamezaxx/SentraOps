import { PhantomSkeleton } from '@/components/ui/PhantomSkeleton'

export default function ExpensesLoading() {
  return (
    <PhantomSkeleton animation="shimmer" stagger={0.03}>
      <div className="flex-1 pb-24 md:pb-8 px-4 md:px-10 flex flex-col gap-6 w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
            ICON
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manajemen Pengeluaran</h1>
            <p className="text-sm text-muted-foreground">Catat dan pantau pengeluaran operasional toko</p>
          </div>
        </div>

        {/* Total Card — full width row */}
        <div className="bg-card p-5 rounded-2xl border border-outline-variant flex items-center gap-4 shadow-sm">
          <div className="w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
            ICON
          </div>
          <div className="min-w-0">
            <p className="text-sm text-on-surface-variant font-medium">Total Pengeluaran</p>
            <p className="text-3xl font-bold text-on-surface">Rp 0</p>
          </div>
        </div>

        {/* Category Cards — 4 columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card p-4 rounded-2xl border border-outline-variant flex flex-col gap-2 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
                ICON
              </div>
              <div className="min-w-0">
                <p className="text-xs text-on-surface-variant font-medium">Kategori</p>
                <p className="text-xl font-bold text-on-surface">Rp 0</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table Section */}
        <div className="space-y-4">
          {/* Header with title and button */}
          <div className="flex items-center justify-between">
            <div className="h-6 w-40 rounded bg-muted" />
            <div className="h-12 w-48 rounded-xl bg-muted/50 text-muted-foreground flex items-center justify-center font-semibold text-sm">
              + Catat Pengeluaran
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-card rounded-2xl border border-outline-variant overflow-hidden shadow-sm">
            <div className="h-12 border-b border-outline-variant flex items-center px-5 gap-4 bg-surface-container/50">
              {[1, 2, 3, 4].map((j) => (
                <p key={j} className="text-sm font-semibold text-on-surface flex-1">Kolom</p>
              ))}
            </div>
            <div className="divide-y divide-outline-variant">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 flex items-center px-5 gap-4">
                  {[1, 2, 3, 4].map((j) => (
                    <p key={j} className="text-sm text-on-surface flex-1">Isi</p>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card p-4 rounded-2xl border border-outline-variant shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">Judul</p>
                    <p className="text-xs text-muted-foreground mt-1">Kategori</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <p className="text-sm font-bold text-foreground">Rp 0</p>
                    <p className="text-[10px] text-on-surface-variant">Tanggal</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PhantomSkeleton>
  )
}
