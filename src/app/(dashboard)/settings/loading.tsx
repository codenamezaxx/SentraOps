'use client'

import { PhantomSkeleton } from '@/components/ui/PhantomSkeleton'

export default function SettingsLoading() {
  return (
    <PhantomSkeleton animation="shimmer" stagger={0.03}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Pengaturan Toko</h1>
          <p className="text-sm text-muted-foreground">Kelola profil toko dan preferensi</p>
        </div>

        {/* Tabs */}
        <div className="w-full">
          <div className="w-full flex flex-row bg-muted/30 rounded-xl p-1.5 gap-2 h-[60px] mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-11 flex-1 rounded-xl bg-card border border-border flex items-center justify-center text-sm font-medium text-muted-foreground">
                Tab Loading
              </div>
            ))}
          </div>

          {/* Content Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-foreground">Section Loading</h2>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Label Field</label>
                  <div className="h-12 w-full rounded-xl bg-white dark:bg-gray-950 border border-border flex items-center px-4 text-sm text-foreground">
                    Nilai input
                  </div>
                </div>
              ))}
              <div className="h-12 w-40 rounded-xl bg-muted/50 text-muted-foreground font-semibold text-sm flex items-center justify-center mt-4">
                Simpan
              </div>
            </div>
          </div>
        </div>
      </div>
    </PhantomSkeleton>
  )
}
