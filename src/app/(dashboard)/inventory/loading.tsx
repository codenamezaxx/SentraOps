import { Skeleton } from '@/components/ui/skeleton'

export default function InventoryLoading() {
  return (
    <div className="px-4 md:px-8 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 rounded-lg" />
            <Skeleton className="h-4 w-80 rounded" />
          </div>
        </div>

        {/* Stats Overview Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card p-4 rounded-2xl border border-outline-variant flex items-center gap-4 shadow-sm">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-7 w-20 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <Skeleton className="h-12 w-full md:w-96 rounded-xl" />
            <Skeleton className="h-12 w-full md:w-40 rounded-xl" />
          </div>
          
          <div className="bg-card rounded-2xl border border-outline-variant overflow-hidden shadow-sm">
            <Skeleton className="h-12 w-full rounded-none border-b" />
            <div className="space-y-0">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-none border-b border-outline-variant/50" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
