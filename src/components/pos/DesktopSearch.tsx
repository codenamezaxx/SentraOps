'use client'

import { Search, X } from 'lucide-react'
import { useUIStore } from '@/lib/stores/uiStore'

/**
 * DesktopSearch Component (Client Component)
 * 
 * Styled search bar for POS desktop view
 * Synchronizes with global UI store for unified filtering
 */
export function DesktopSearch() {
  const { posSearchQuery, setPosSearchQuery } = useUIStore()

  return (
    <div className="relative w-full h-12 mb-6">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
        <Search className="w-5 h-5" />
      </div>
      <input
        type="text"
        placeholder="Cari nama produk atau barcode..."
        value={posSearchQuery}
        onChange={(e) => setPosSearchQuery(e.target.value)}
        className="w-full h-full pl-11 pr-11 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 font-medium outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
      />
      {posSearchQuery && (
        <button
          onClick={() => setPosSearchQuery('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}