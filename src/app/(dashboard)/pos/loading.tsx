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
            {/* Category filter — select dropdown, not pills */}
            <div className="w-full md:w-64 h-12 rounded-xl bg-surface-container-low border border-outline-variant flex items-center px-4 text-sm text-muted-foreground">
              Semua Kategori
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <div key={i} className="bg-card rounded-2xl shadow-sm border border-outline-variant overflow-hidden">
                  <div className="h-32 w-full bg-surface-container" />
                  <div className="p-3 space-y-2">
                    <p className="text-sm text-foreground font-medium truncate">Nama Produk</p>
                    <p className="text-lg font-bold text-primary/50">Rp 0</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Cart (Desktop) */}
          <div className="hidden lg:block lg:w-95 xl:w-105">
            <div className="sticky top-5 space-y-6">
              {/* BarcodeSearch */}
              <div className="bg-card rounded-xl border border-border h-12 flex items-center px-4 text-muted-foreground text-sm gap-3">
                <div className="w-5 h-5 rounded bg-muted-foreground/20" />
                Cari produk...
              </div>

              {/* CartSection */}
              <div className="bg-card rounded-2xl shadow-sm border border-outline-variant p-5 flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-center gap-3 pb-4 border-b border-outline-variant">
                  <div className="w-5 h-5 rounded bg-muted-foreground/20" />
                  <span className="text-base font-bold text-foreground">Pesanan</span>
                </div>

                {/* Cart items */}
                <div className="flex flex-col gap-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex items-start gap-3">
                      {/* Product image */}
                      <div className="w-16 h-16 rounded-lg bg-surface-container shrink-0" />
                      <div className="flex-1 min-w-0 space-y-1">
                        <span className="text-sm font-medium text-foreground block truncate">
                          Produk Loading
                        </span>
                        <span className="text-xs text-muted-foreground block">Rp 0 x 0</span>
                        {/* Quantity controls skeleton */}
                        <div className="flex items-center gap-2 bg-background rounded-lg p-1 w-fit mt-1">
                          <div className="w-7 h-7 rounded-md bg-muted" />
                          <span className="text-sm font-semibold text-foreground w-5 text-center">0</span>
                          <div className="w-7 h-7 rounded-md bg-muted" />
                        </div>
                      </div>
                      <span className="font-bold text-foreground text-sm shrink-0">Rp 0</span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-4 border-t border-outline-variant">
                  <span className="text-base font-bold text-foreground">Total</span>
                  <span className="text-lg font-bold text-foreground">Rp 0</span>
                </div>

                {/* Bayar button */}
                <div className="h-12 rounded-xl bg-accent-blue/50" />
              </div>
            </div>
          </div>
        </div>

        {/* MobileCartBar skeleton */}
        <div className="lg:hidden fixed bottom-20 left-0 w-full px-3 z-40">
          <div className="bg-card rounded-2xl shadow-lg border border-outline-variant overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-muted-foreground/20" />
                <span className="text-sm font-semibold text-foreground">Isi Keranjang</span>
              </div>
              <div className="w-5 h-5 rounded bg-muted-foreground/20" />
            </div>
            <div className="px-4 pb-3 space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-container" />
                    <div>
                      <span className="text-sm font-medium text-foreground">Produk Loading</span>
                      <span className="text-xs text-muted-foreground block">Rp 0 x 0</span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-foreground">Rp 0</span>
                </div>
              ))}
            </div>
            <div className="px-4 pb-4">
              <div className="h-12 rounded-xl bg-accent-blue/50" />
            </div>
          </div>
        </div>
      </div>
    </PhantomSkeleton>
  )
}
