import Link from 'next/link'
import { Plus, Receipt } from 'lucide-react'
import { getStore, getInvoices } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/server'
import { InvoicesView } from '@/components/invoices/InvoicesView'

export default async function InvoicesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('store_id')
    .eq('auth_id', user.id)
    .single()

  const storeId = profile?.store_id
  if (!storeId) return null

  const store = await getStore(storeId)
  const storeName = store?.name || 'Toko'
  const invoices = await getInvoices(storeId)

  return (
    <div className="flex-1 pb-24 md:pb-8 px-4 md:px-10 flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-foreground">Manajemen Tagihan</h1>
            <p className="text-sm text-muted-foreground">
              Kelola faktur dan tagihan pelanggan
            </p>
          </div>
        </div>
        <Link
          href="/pos"
          className="h-12 bg-foreground text-background rounded-xl font-semibold text-sm px-5 flex items-center gap-2 hover:opacity-90 transition-colors active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Tambah Tagihan
        </Link>
      </div>

      <InvoicesView invoices={invoices} storeName={storeName} />
    </div>
  )
}
