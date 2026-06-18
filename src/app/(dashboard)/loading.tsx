import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="flex-1 pb-24 md:pb-8 px-4 md:px-10 flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Header Section */}
      <section className="flex flex-col gap-1">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-8 md:h-10 w-64 rounded-xl" />
            <Skeleton className="h-4 w-48 rounded-lg" />
          </div>
        </div>
      </section>

      {/* Snapshot Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card p-5 rounded-2xl border border-outline-variant shadow-md flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <Skeleton className="h-10 w-32 rounded-lg" />
            <Skeleton className="h-4 w-20 rounded mt-auto" />
          </div>
        ))}
      </section>

      {/* Quick Action Hub Skeleton */}
      <Skeleton className="h-32 rounded-2xl" />

      {/* Revenue Chart Skeleton */}
      <section className="bg-card border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col gap-6 h-[400px]">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <Skeleton className="h-6 w-40 rounded" />
          </div>
          <Skeleton className="h-4 w-24 rounded" />
        </div>
        <Skeleton className="flex-1 w-full rounded-xl" />
      </section>

      {/* Activity Panels Skeleton */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2">
        {[1, 2].map((i) => (
          <div key={i} className="bg-card border border-outline-variant rounded-2xl p-5 shadow-sm flex flex-col gap-4 h-64">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-32 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <Skeleton key={j} className="h-14 rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
