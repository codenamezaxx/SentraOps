import { Skeleton } from '@/components/ui/skeleton'

export default function TransactionsLoading() {
  return (
    <div className="flex-1 pb-24 md:pb-8 px-4 md:px-10 flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <Skeleton className="h-9 w-64 rounded-lg" />

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <Skeleton className="h-12 w-full md:w-96 rounded-xl" />
          <Skeleton className="h-12 w-full md:w-32 rounded-xl" />
        </div>
        
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <Skeleton className="h-12 w-full rounded-none border-b" />
          <div className="space-y-0">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-none border-b border-border/50" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
