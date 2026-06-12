import { DollarSign } from 'lucide-react'
import { getUserProfile } from '@/lib/supabase/queries'
import { RequireOwner } from '@/components/auth/RequireOwner'

export default async function FinancialPage() {
  const profile = await getUserProfile()

  return (
    <RequireOwner profile={profile}>
      <div className="pt-14 px-4 md:px-8 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-on-surface">
                Laporan Keuangan
              </h1>
              <p className="text-sm text-on-surface-variant">
                Ringkasan keuangan bisnis Anda
              </p>
            </div>
          </div>

          <div className="bg-surface rounded-2xl shadow-sm p-6">
            <p className="text-on-surface-variant">
              Halaman ini hanya bisa diakses oleh pemilik toko.
            </p>
          </div>
        </div>
      </div>
    </RequireOwner>
  )
}
