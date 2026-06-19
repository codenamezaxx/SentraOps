import { Skeleton } from '@/components/ui/skeleton'

export default function StaffLoading() {
  return (
    <div className="flex-1 pb-24 md:pb-8 px-4 md:px-10 flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-xl" />
          <Skeleton className="h-4 w-56 rounded-lg" />
        </div>
        <Skeleton className="h-12 w-40 rounded-xl" />
      </div>

      {/* Table skeleton — desktop */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden hidden md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {['Nama Staf', 'Email', 'Peran', 'Aksi'].map((h) => (
                <th key={h} className="text-left px-5 py-3.5">
                  <Skeleton className="h-4 w-20 rounded" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4].map((i) => (
              <tr key={i} className="border-b border-border last:border-0">
                <td className="px-5 py-3.5"><Skeleton className="h-5 w-32 rounded-lg" /></td>
                <td className="px-5 py-3.5"><Skeleton className="h-5 w-48 rounded-lg" /></td>
                <td className="px-5 py-3.5"><Skeleton className="h-6 w-16 rounded-full" /></td>
                <td className="px-5 py-3.5"><Skeleton className="h-5 w-12 rounded-lg ml-auto" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile skeleton */}
      <div className="md:hidden flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3.5 bg-card rounded-2xl border border-border">
            <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-3 w-44 rounded" />
              <Skeleton className="h-4 w-14 rounded-full" />
            </div>
            <div className="flex flex-col gap-1 shrink-0">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
