import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ProductGrid } from '@/components/pos/ProductGrid'
import { CartSection } from '@/components/pos/CartSection'
import { MobileCartBar } from '@/components/pos/MobileCartBar'
import { BarcodeSearch } from '@/components/pos/BarcodeSearch'
import type { Product } from '@/lib/types'

/**
 * POS Page Layout
 * 
 * Implements two-column layout (products | cart) for desktop
 * Single-column stacked layout for mobile
 * 
 * Server Component fetches products, passes to client ProductGrid for category filtering
 * 
 * Requirements: 6.1, 13.1, 13.4, 15.1, 15.2, 15.3, 15.4
 */
export default async function POSPage() {
  const supabase = await createClient()

  // Select all columns; cast to Product[] since generated types may lag behind migration
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .gt('stock_quantity', 0)
    .order('category', { ascending: true })
    .order('name', { ascending: true })

  // Filter active in JS until types are regenerated
  const activeProducts = (products || []).filter((p: Record<string, unknown>) => p.active !== false) as Product[]

  return (
    <div className="flex-1 pb-24 md:pb-8 px-4 md:px-10 flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Mobile Barcode Search */}
      <div className="md:hidden w-full mb-4">
        <BarcodeSearch />
      </div>

      {/* Two-Column Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Product Selection Area */}
        <div className="flex-1 flex flex-col gap-4">
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid products={activeProducts} />
          </Suspense>
        </div>

        {/* Right Column: Cart Section (Desktop Only - Hidden on mobile) */}
        <div className="hidden lg:block lg:w-95 xl:w-105">
          <div className="sticky top-5 space-y-6">
            <BarcodeSearch />
            <CartSection />
          </div>
        </div>
      </div>

      {/* Mobile Sticky Cart Bar - Visible only on mobile */}
      <MobileCartBar />
    </div>
  )
}

/**
 * Loading skeleton for product grid
 */
function ProductGridSkeleton() {
  return (
    <div className="space-y-4">
      {/* Category skeleton */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-10 w-24 bg-muted rounded-full animate-pulse"
          />
        ))}
      </div>

      {/* Product grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-card rounded-2xl shadow-sm border border-outline-variant overflow-hidden"
          >
            <div className="h-32 w-full bg-muted animate-pulse" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-6 bg-muted rounded animate-pulse w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}