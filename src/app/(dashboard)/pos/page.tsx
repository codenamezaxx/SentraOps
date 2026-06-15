import { Suspense } from 'react'
import { ProductGrid } from '@/components/pos/ProductGrid'
import { CartSection } from '@/components/pos/CartSection'
import { MobileCartBar } from '@/components/pos/MobileCartBar'
import { BarcodeSearch } from '@/components/pos/BarcodeSearch'

/**
 * POS Page Layout
 * 
 * Implements two-column layout (products | cart) for desktop
 * Single-column stacked layout for mobile
 * 
 * Mixed Server/Client Component:
 * - Page shell is Server Component for SEO and initial load performance
 * - Interactive components (ProductCard, CartSection, MobileCartBar, BarcodeSearch) are Client Components
 * 
 * Requirements: 6.1, 13.1, 13.4, 15.1, 15.2, 15.3, 15.4
 * Tasks: 9.1, 9.6 - POS page layout and barcode search
 */
export default async function POSPage() {
  return (
    <div className="flex-1 pt-[calc(3rem+1.5rem)] pb-24 md:pb-8 px-4 md:px-10 flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Mobile Barcode Search - Visible only on mobile */}
      <div className="md:hidden w-full mb-4">
        <BarcodeSearch />
      </div>

      {/* Two-Column Layout: Products (left) | Cart (right - desktop only) */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Product Selection Area */}
        <div className="flex-1 flex flex-col gap-4">
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid />
          </Suspense>
        </div>

        {/* Right Column: Cart Section (Desktop Only - Hidden on mobile) */}
        <div className="hidden lg:block lg:w-[380px] xl:w-[420px]">
          <div className="sticky top-20">
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
