import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { Transaction } from '@/lib/types'
import { TransactionTable } from '@/components/transactions/TransactionTable'
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
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*, profiles(name)') // Join with profiles to get cashier name
    .eq('store_id', profile.store_id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching transactions:', error)
    // Handle error gracefully, maybe show a message to the user
    return <div>Gagal memuat riwayat transaksi. </div>
  }

  return (
    <div className="flex-1 pt-[calc(3rem+1.5rem)] pb-24 md:pb-8 px-4 md:px-10 flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-foreground">
        Riwayat Transaksi
      </h1>

      <TransactionTable transactions={transactions || []} />
    </div>
  )
}