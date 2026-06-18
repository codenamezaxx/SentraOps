import { createClient } from '@/lib/supabase/server'
import { TransactionTable, type TransactionWithCashier } from '@/components/transactions/TransactionTable'
import { redirect } from 'next/navigation'

export default async function TransactionsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('store_id, role')
    .eq('auth_id', user.id)
    .single()

  if (!profile?.store_id || (profile.role !== 'owner' && profile.role !== 'cashier')) {
    redirect('/unauthorized') // or some error page
  }

  // Requirement 16.1: display all Transactions for the Store ordered by created_at descending
  const { data: raw, error } = await supabase
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
      <h1 className="text-2xl md:text-3xl font-bold text-foreground">
        Riwayat Transaksi
      </h1>

      <TransactionTable transactions={transactions} />
    </div>
  )
}