import { getUserContext } from '../../lib/supabase/queries'
import { redirect } from 'next/navigation'
import { ThemeToggle } from '../../components/ui/ThemeToggle'
import Link from 'next/link'

export default async function DashboardPage() {
  const context = await getUserContext()

  if (!context) {
    redirect('/login')
  }

  const { store } = context

  return (
    <div className="flex-1 pt-[calc(3rem+1.5rem)] pb-24 md:pb-8 px-4 md:px-10 flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Header Section */}
      <section className="flex flex-col gap-1">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-on-background">
              Selamat {new Date().getHours() < 12 ? 'pagi' : 'siang'}, {store?.name || 'Toko'}
            </h2>
            <p className="text-base text-on-surface-variant mt-1">
              Berikut adalah ringkasan operasional hari ini.
            </p>
          </div>
          <ThemeToggle />
        </div>
      </section>

      {/* Snapshot Cards (Bento Grid) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Penjualan Hari Ini */}
        <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col gap-2 group hover:shadow-md transition-shadow">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-tertiary"></div>
          <div className="flex justify-between items-start pl-2">
            <p className="text-sm font-semibold text-on-surface-variant">Penjualan Hari Ini</p>
            <span className="material-symbols-outlined text-[color:hsl(var(--tertiary))]">trending_up</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold pl-2 text-on-surface">Rp 0</h3>
          <p className="text-xs text-[color:hsl(var(--tertiary))] pl-2 flex items-center gap-1 mt-auto">
            <span className="material-symbols-outlined text-sm">arrow_upward</span> +0% dari kemarin
          </p>
        </div>

        {/* Stok Kritis */}
        <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col gap-2 group hover:shadow-md transition-shadow">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[color:hsl(var(--error))]"></div>
          <div className="flex justify-between items-start pl-2">
            <p className="text-sm font-semibold text-on-surface-variant">Stok Kritis</p>
            <span className="material-symbols-outlined icon-fill text-[color:hsl(var(--error))]">warning</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold pl-2 text-on-surface">
            0 <span className="text-base text-on-surface-variant font-normal">Item</span>
          </h3>
          <p className="text-xs text-[color:hsl(var(--error))] pl-2 flex items-center gap-1 mt-auto">
            Semua stok aman
          </p>
        </div>

        {/* Tagihan Jatuh Tempo */}
        <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col gap-2 group hover:shadow-md transition-shadow">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[color:hsl(var(--secondary))]"></div>
          <div className="flex justify-between items-start pl-2">
            <p className="text-sm font-semibold text-on-surface-variant">Tagihan Jatuh Tempo</p>
            <span className="material-symbols-outlined text-[color:hsl(var(--secondary))]">receipt_long</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold pl-2 text-on-surface">
            0 <span className="text-base text-on-surface-variant font-normal">Faktur</span>
          </h3>
          <p className="text-xs text-on-surface-variant pl-2 flex items-center gap-1 mt-auto">
            Tidak ada tagihan
          </p>
        </div>
      </section>

      {/* Quick Action Hub */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/pos"
          className="h-16 md:h-12 bg-primary text-on-primary rounded-2xl md:rounded-xl font-semibold text-sm flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 shadow-sm hover:opacity-90 active:scale-95 transition-all w-full"
        >
          <span className="material-symbols-outlined">point_of_sale</span>
          Buka Kasir POS
        </Link>

        <Link
          href="/inventory"
          className="h-16 md:h-12 bg-surface-container-high text-on-surface rounded-2xl md:rounded-xl font-semibold text-sm flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 hover:bg-surface-container-highest active:scale-95 transition-all border border-outline-variant/50 w-full"
        >
          <span className="material-symbols-outlined">add_box</span>
          Tambah Produk Baru
        </Link>

        <button className="h-16 md:h-12 bg-surface-container-high text-on-surface rounded-2xl md:rounded-xl font-semibold text-sm flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 hover:bg-surface-container-highest active:scale-95 transition-all border border-outline-variant/50 w-full">
          <span className="material-symbols-outlined">receipt</span>
          Catat Pengeluaran
        </button>
      </section>

      {/* Alerts & Activity Panel */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2">
        {/* Left: Restock Needs */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-on-surface">Perlu Restock</h3>
            <button className="text-sm font-semibold text-primary hover:underline">Lihat Semua</button>
          </div>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-2">inventory_2</span>
            <p className="text-sm text-on-surface-variant">Tidak ada item yang perlu direstock</p>
          </div>
        </div>

        {/* Right: Recent Activity */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-on-surface">Aktivitas Terakhir</h3>
          </div>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-2">history</span>
            <p className="text-sm text-on-surface-variant">Belum ada aktivitas hari ini</p>
          </div>
        </div>
      </section>
    </div>
  )
}
