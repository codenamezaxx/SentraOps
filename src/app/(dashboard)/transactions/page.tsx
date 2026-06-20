import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { TransactionTable, type TransactionWithCashier } from '@/components/transactions/TransactionTable'
import { History } from 'lucide-react'

export default async function TransactionsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('store_id, role')
    .eq('auth_id', user.id)
    .single()

  if (!profile?.store_id || (profile.role !== 'owner' && profile.role !== 'cashier')) return null

  // Use admin client so the profiles(name) join bypasses RLS
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Requirement 16.1: display all Transactions for the Store ordered by created_at descending
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: raw, error } = await (supabaseAdmin as any)
    .from('transactions')
    .select('*, profiles(name)')
    .eq('store_id', profile.store_id)
    .neq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching transactions:', error)
    return <div>Gagal memuat riwayat transaksi. </div>
  }

  const transactions: TransactionWithCashier[] = (raw || []).map((t: Record<string, unknown>) => ({
    ...t,
    cash_amount: (t as { cash_amount?: number }).cash_amount ?? null,
    change_amount: (t as { change_amount?: number }).change_amount ?? null,
  })) as TransactionWithCashier[]

  return (
    <div className="flex-1 pb-24 md:pb-8 px-4 md:px-10 flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <History className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Riwayat Transaksi
          </h1>
          <p className="text-sm text-muted-foreground">
            Lihat semua transaksi penjualan toko
          </p>
        </div>
      </div>

      <TransactionTable transactions={transactions} />
    </div>
  )
}