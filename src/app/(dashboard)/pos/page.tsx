import { Suspense } from 'react'
import { ProductGrid } from '@/components/pos/ProductGrid'
import { CartSection } from '@/components/pos/CartSection'
import { MobileCartBar } from '@/components/pos/MobileCartBar'

/**
 * POS Page Layout
 * 
 * Implements two-column layout (products | cart) for desktop
 * Single-column stacked layout for mobile
 * 
 * Mixed Server/Client Component:
 * - Page shell is Server Component for SEO and initial load performance
 * - Interactive components (ProductCard, CartSection, MobileCartBar) are Client Components
 * 
 * Requirements: 6.1, 13.1, 13.4
 * Task: 9.1 - Create POS page layout
 */
export default async function POSPage() {
  return (
    <div className="flex-1 pt-[calc(3rem+1.5rem)] pb-24 md:pb-8 px-4 md:px-10 w-full max-w-7xl mx-auto">
      {/* Mobile Search Bar - Visible only on mobile */}
      <div className="md:hidden relative w-full mb-4">
        <span className="material-symbols-outlined absolute left-4 top-1/2 transform -translate-y-1/2 text-on-surface-variant">
          search
        </span>
        <input
          type="text"
          placeholder="Cari produk..."
          className="w-full h-12 pl-12 pr-4 rounded-2xl border border-outline-variant bg-surface-container-lowest dark:bg-inverse-surface dark:border-none text-on-surface dark:text-surface focus:ring-2 focus:ring-primary focus:border-primary shadow-sm outline-none transition-all"
        />
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
            className="h-10 w-24 bg-surface-container-low dark:bg-inverse-surface rounded-full animate-pulse"
          />
        ))}
      </div>

      {/* Product grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-surface-container-lowest dark:bg-surface-container-low rounded-2xl shadow-sm border border-outline-variant dark:border-none overflow-hidden"
          >
            <div className="h-32 w-full bg-surface-variant animate-pulse" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-surface-variant rounded animate-pulse" />
              <div className="h-6 bg-surface-variant rounded animate-pulse w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
