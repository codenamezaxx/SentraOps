import { Skeleton } from '@/components/ui/skeleton'

export default function InvoicesLoading() {
  return (
    <div className="flex-1 pb-24 md:pb-8 px-4 md:px-10 flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-56 rounded-lg" />
            <Skeleton className="h-4 w-40 rounded" />
          </div>
        </div>
        <Skeleton className="h-12 w-44 rounded-xl" />
      </div>

      {/* Filter Tabs */}
      <div className="w-full flex gap-2 bg-muted/30 rounded-xl p-1.5 h-12">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-full flex-1 rounded-lg" />
        ))}
      </div>

      {/* Invoice List */}
      <div className="flex flex-col gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col gap-2 p-4 rounded-xl bg-card border border-outline-variant">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-1.5 min-w-0">
                <Skeleton className="h-4 w-36 rounded" />
                <Skeleton className="h-3 w-24 rounded" />
              </div>
              <Skeleton className="h-5 w-14 rounded-full shrink-0" />
            </div>
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-5 w-28 rounded" />
              <Skeleton className="h-10 w-36 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
