import { PhantomSkeleton } from '@/components/ui/PhantomSkeleton'

export default function DashboardLoading() {
  return (
    <PhantomSkeleton animation="shimmer" stagger={0.03}>
      <div className="flex-1 pb-24 md:pb-8 px-4 md:px-10 flex flex-col gap-6 w-full max-w-7xl mx-auto">
        {/* Header Section */}
        <section className="flex flex-col gap-1">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3 min-w-0">
              <div className="min-w-0">
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                  Selamat Datang, Toko Saya
                </h2>
                <p className="text-base text-muted-foreground mt-1">
                  Berikut adalah ringkasan operasional hari ini.
                </p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-muted/50 shrink-0" />
          </div>
        </section>

        {/* Snapshot Cards — StatCard + StatCard + OverdueInvoicesCard */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Penjualan Hari Ini (success) */}
          <div className="bg-card p-5 rounded-2xl border border-outline-variant shadow-md flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <p className="text-sm font-semibold text-muted-foreground">Penjualan Hari Ini</p>
              <div className="w-10 h-10 rounded-xl bg-primary/10" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-foreground">Rp 0</h3>
            <p className="text-xs mt-auto text-muted-foreground">Memuat perbandingan...</p>
          </div>

          {/* Stok Kritis */}
          <div className="bg-card p-5 rounded-2xl border border-outline-variant shadow-md flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <p className="text-sm font-semibold text-muted-foreground">Stok Kritis</p>
              <div className="w-10 h-10 rounded-xl bg-destructive/10" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-foreground">- Item</h3>
            <p className="text-xs mt-auto text-muted-foreground">Memeriksa stok...</p>
          </div>

          {/* OverdueInvoicesCard */}
          <div className="bg-card p-5 rounded-2xl border border-outline-variant shadow-md flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <p className="text-sm font-semibold text-muted-foreground">Tagihan Jatuh Tempo</p>
              <div className="w-10 h-10 rounded-xl bg-warning/10" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-foreground">Rp 0</h3>
            <p className="text-xs mt-auto text-warning">Memuat tagihan...</p>
          </div>
        </section>

        {/* Quick Action Hub — matches DashboardQuickActions */}
        <section className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          <div className="col-span-2 md:col-span-1 h-16 rounded-2xl bg-primary flex items-center justify-center gap-3 shadow-md w-full">
            <div className="w-6 h-6 rounded bg-primary-foreground/20" />
            <span className="text-base md:text-sm font-bold text-primary-foreground">Buka Kasir POS</span>
          </div>
          <div className="h-16 bg-card rounded-2xl border border-border flex items-center justify-center gap-3 w-full">
            <div className="w-5 h-5 rounded bg-primary/20" />
            <span className="text-sm font-bold text-foreground">Tambah Produk</span>
          </div>
          <div className="h-16 bg-card rounded-2xl border border-border flex items-center justify-center gap-3 w-full">
            <div className="w-5 h-5 rounded bg-primary/20" />
            <span className="text-sm font-bold text-foreground">Lihat Laporan</span>
          </div>
        </section>

        {/* Revenue Chart */}
        <section className="bg-card border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <div className="w-5 h-5 rounded bg-primary/30" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Tren Pendapatan</h3>
            </div>
            <span className="text-sm font-medium text-muted-foreground">7 Hari Terakhir</span>
          </div>
          <div className="w-full h-64 bg-muted rounded-xl" />
        </section>

        {/* Alerts & Activity Panel */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2">
          {/* Left: Perlu Restock */}
          <div className="bg-card border border-outline-variant rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-warning/10">
                  <div className="w-5 h-5 rounded bg-warning/30" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Perlu Restock</h3>
              </div>
              <span className="text-sm font-semibold text-muted-foreground">Lihat Semua</span>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex justify-between items-center p-3 bg-muted rounded-xl border border-outline-variant">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1.5 rounded-lg bg-warning/10 shrink-0">
                      <div className="w-4 h-4 rounded bg-warning/30" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-medium text-foreground block truncate">Produk Loading</span>
                      <span className="text-xs text-destructive">Stok: -</span>
                    </div>
                  </div>
                  <div className="text-xs px-3 py-1.5 rounded-lg bg-foreground/10 text-transparent">Update</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Aktivitas Terakhir */}
          <div className="bg-card border border-outline-variant rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <div className="w-5 h-5 rounded bg-primary/30" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Aktivitas Terakhir</h3>
              </div>
              <span className="text-sm font-semibold text-muted-foreground">Riwayat</span>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex justify-between items-center p-3 bg-muted rounded-xl border border-outline-variant">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-1.5 rounded-lg shrink-0 ${j % 2 === 0 ? 'bg-primary/10' : 'bg-destructive/10'}`}>
                      <div className={`w-4 h-4 rounded ${j % 2 === 0 ? 'bg-primary/30' : 'bg-destructive/30'}`} />
                    </div>
                    <div className="min-w-0">
                      <span className="font-medium text-foreground block truncate">Aktivitas Loading</span>
                      <span className="text-xs text-muted-foreground">--:--</span>
                    </div>
                  </div>
                  <span className="font-bold text-transparent bg-muted-foreground/20 rounded">Rp 0</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PhantomSkeleton>
  )
}
