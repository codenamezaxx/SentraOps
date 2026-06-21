import { PhantomSkeleton } from '@/components/ui/PhantomSkeleton'

export default function StaffLoading() {
  return (
    <PhantomSkeleton animation="shimmer" stagger={0.03}>
      <div className="flex-1 pb-24 md:pb-8 px-4 md:px-10 flex flex-col gap-6 w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manajemen Staf</h1>
            <p className="text-sm text-muted-foreground">Kelola akun staf toko Anda</p>
          </div>
          <div className="h-12 px-5 rounded-xl bg-muted/50 text-muted-foreground font-semibold text-sm flex items-center gap-2">
            + Tambah Staf
          </div>
        </div>

        {/* Table — desktop */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden hidden md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Nama Staf', 'Email', 'Peran', 'Aksi'].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5">
                    <span className="text-sm font-semibold text-muted-foreground">{h}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4].map((i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-5 py-3.5"><span className="text-sm text-foreground">Nama Staf</span></td>
                  <td className="px-5 py-3.5"><span className="text-sm text-foreground">email@example.com</span></td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex h-6 px-3 rounded-full bg-muted items-center text-xs font-medium text-foreground">
                      Peran
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1 justify-end">
                      <span className="w-8 h-8 rounded-lg bg-muted inline-block" />
                      <span className="w-8 h-8 rounded-lg bg-muted inline-block" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5 bg-card rounded-2xl border border-border">
              <div className="w-9 h-9 rounded-lg bg-muted shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Nama Staf</p>
                <p className="text-xs text-muted-foreground truncate">email@example.com</p>
                <span className="inline-flex mt-1 h-4 px-2 rounded-full bg-muted items-center text-[10px] font-medium text-foreground">
                  Peran
                </span>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <span className="w-8 h-8 rounded-lg bg-muted inline-block" />
                <span className="w-8 h-8 rounded-lg bg-muted inline-block" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </PhantomSkeleton>
  )
}
