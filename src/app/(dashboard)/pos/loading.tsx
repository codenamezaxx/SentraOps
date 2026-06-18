import { Skeleton } from '@/components/ui/skeleton'

export default function POSLoading() {
  return (
    <div className="flex-1 pb-24 md:pb-8 px-4 md:px-10 flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Mobile Barcode Search Skeleton */}
      <Skeleton className="md:hidden w-full h-12 rounded-xl mb-4" />

      {/* Two-Column Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Product Selection Area */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="space-y-4">
            {/* Category skeleton */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-24 rounded-full flex-shrink-0" />
              ))}
            </div>

            {/* Product grid skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <div key={i} className="bg-card rounded-2xl shadow-sm border border-outline-variant overflow-hidden">
                  <Skeleton className="h-32 w-full rounded-none" />
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-4 rounded w-full" />
                    <Skeleton className="h-6 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Cart Section (Desktop Only) */}
        <div className="hidden lg:block lg:w-95 xl:w-105">
          <div className="sticky top-5 space-y-6">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-[600px] w-full rounded-3xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
