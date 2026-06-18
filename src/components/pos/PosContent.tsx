'use client'

import { useState, useEffect, useRef } from 'react'
import { ProductGrid } from './ProductGrid'
import { BarcodeSearch } from './BarcodeSearch'
import { CartSection } from './CartSection'
import { MobileCartBar } from './MobileCartBar'
import { db } from '@/lib/offlineDb'
import { createClient } from '@/lib/supabase/client'
import { WifiOff } from 'lucide-react'
import type { Product } from '@/lib/types'

interface PosContentProps {
  serverProducts: Product[]
}

export function PosContent({ serverProducts }: PosContentProps) {
  const [products, setProducts] = useState<Product[]>(serverProducts)
  const [isOffline, setIsOffline] = useState(false)
  const syncedRef = useRef(false)

  useEffect(() => {
    if (syncedRef.current) return
    syncedRef.current = true

    const init = async () => {
      if (navigator.onLine) {
        try {
          await db.cached_products.clear()
          await db.cached_products.bulkAdd(serverProducts)
        } catch {
          // IndexedDB unavailable
        }
        setProducts(serverProducts)
        setIsOffline(false)
      } else {
        setIsOffline(true)
        try {
          const cached = (await db.cached_products.toArray()) as Product[]
          if (cached.length > 0) {
            setProducts(cached)
          }
        } catch {
          // IndexedDB unavailable, fall back to server products
        }
      }
    }

    init()
  }, [serverProducts])

  return (
    <div className="flex-1 pb-24 md:pb-8 px-4 md:px-10 flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {isOffline && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>Mode offline — data produk dari cache lokal</span>
        </div>
      )}

      <div className="md:hidden w-full mb-4">
        <BarcodeSearch />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 flex flex-col gap-4">
          <ProductGrid products={products} />
        </div>

        <div className="hidden lg:block lg:w-95 xl:w-105">
          <div className="sticky top-5 space-y-6">
            <BarcodeSearch />
            <CartSection />
          </div>
        </div>
      </div>

      <MobileCartBar />
    </div>
  )
}
