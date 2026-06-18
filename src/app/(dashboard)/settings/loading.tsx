import { Skeleton } from '@/components/ui/skeleton'

export default function SettingsLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-9 w-48 rounded-lg" />
        <Skeleton className="h-4 w-64 rounded" />
      </div>

      <div className="w-full">
        {/* Tabs Skeleton */}
        <div className="w-full flex flex-row bg-muted/30 rounded-xl p-1.5 gap-2 h-[60px] mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-11 flex-1 rounded-xl" />
          ))}
        </div>

        {/* Content Card Skeleton */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
          <Skeleton className="h-7 w-32 rounded" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            ))}
            <Skeleton className="h-12 w-40 rounded-xl mt-4" />
          </div>
        </div>
      </div>
    </div>
  )
}
