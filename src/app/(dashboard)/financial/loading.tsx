import { Skeleton } from '@/components/ui/skeleton'

export default function FinancialLoading() {
  return (
    <div className="flex-1 pb-24 md:pb-8 px-4 md:px-10 flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div>
        <Skeleton className="h-9 w-64 rounded-lg mb-2" />
        <Skeleton className="h-4 w-48 rounded" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card p-5 rounded-2xl border border-border shadow-sm flex flex-col gap-3 h-32">
            <div className="flex justify-between items-start">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <Skeleton className="h-8 w-24 rounded mt-auto" />
          </div>
        ))}
      </div>

      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm h-[400px]">
        <Skeleton className="h-6 w-40 rounded mb-6" />
        <Skeleton className="w-full h-full rounded-xl" />
      </div>
    </div>
  )
}
