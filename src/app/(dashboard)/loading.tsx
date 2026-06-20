'use client'

import { PhantomSkeleton } from '@/components/ui/PhantomSkeleton'

export default function DashboardLoading() {
  return (
    <PhantomSkeleton animation="shimmer" stagger={0.03}>
      <div className="flex-1 pb-24 md:pb-8 px-4 md:px-10 flex flex-col gap-6 w-full max-w-7xl mx-auto">
        {/* Header Section */}
        <section className="flex flex-col gap-1">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                Selamat Datang, Toko Saya
              </h2>
              <p className="text-base text-muted-foreground mt-1">
                Berikut adalah ringkasan operasional hari ini.
              </p>
            </div>
          </div>
        </section>

        {/* Snapshot Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card p-5 rounded-2xl border border-border shadow-md flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <p className="text-sm font-semibold text-muted-foreground">Memuat...</p>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">Rp 0</h3>
              <p className="text-xs mt-auto text-muted-foreground">Status loading</p>
            </div>
          ))}
        </section>

        {/* Quick Action Hub */}
        <section className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          <div className="col-span-2 md:col-span-1 h-16 bg-muted/50 text-muted-foreground rounded-2xl font-bold flex items-center justify-center gap-3 shadow-md w-full">
            Buka Kasir POS
          </div>
          <div className="h-16 bg-card border border-border rounded-2xl font-bold flex items-center justify-center gap-3 w-full">
            Tambah Produk
          </div>
          <div className="h-16 bg-card border border-border rounded-2xl font-bold flex items-center justify-center gap-3 w-full">
            Lihat Laporan
          </div>
        </section>

        {/* Revenue Chart */}
        <section className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">ICON</div>
              <h3 className="text-xl font-bold text-foreground">Tren Pendapatan</h3>
            </div>
            <span className="text-sm font-medium text-muted-foreground">7 Hari Terakhir</span>
          </div>
          <div className="w-full h-64 bg-muted rounded-xl" />
        </section>

        {/* Activity Panels */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2">
          {[1, 2].map((i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-foreground">Panel Loading</h3>
                <span className="text-sm font-semibold text-muted-foreground">Lihat Semua</span>
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex justify-between items-center p-3 bg-muted rounded-xl border border-border">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">Item Loading</span>
                      <span className="text-xs text-muted-foreground">Detail loading</span>
                    </div>
                    <span className="text-xs bg-card px-3 py-1.5 rounded-lg border border-border font-semibold text-foreground">Action</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    </PhantomSkeleton>
  )
}
