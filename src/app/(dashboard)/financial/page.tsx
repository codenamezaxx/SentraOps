import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { calculateFinancialMetrics } from '@/lib/financial-utils'
import { formatCurrency } from '@/lib/utils'
import { StatCard } from '@/components/dashboard/StatCard'
import { DollarSign, TrendingUp, ShoppingBag, PieChart } from 'lucide-react'
import { Transaction, TransactionItem } from '@/lib/types'
import { RevenueChart } from '@/components/financial/RevenueChart'

export default async function FinancialPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>
}) {
  const { start, end } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('store_id')
    .eq('auth_id', user.id)
    .single()

  if (!profile?.store_id) redirect('/unauthorized')

  // Date range handling
  const now = new Date()
  const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const defaultEnd = now.toISOString()

  const startDate = start ? new Date(start).toISOString() : defaultStart
  const endDate = end ? new Date(end).toISOString() : defaultEnd

  // Fetch transactions in range
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('store_id', profile.store_id)
    .gte('created_at', startDate)
    .lte('created_at', endDate)

  // Fetch all transaction items for these transactions to calculate COGS
  // Note: For large datasets, this should be an aggregation query or a specialized view.
  // For SentraOps MVP, we fetch and calculate.
  const transactionIds = (transactions || []).map((t) => t.id)

  let items: TransactionItem[] = []
  if (transactionIds.length > 0) {
    const { data } = await supabase
      .from('transaction_items')
      .select('*')
      .in('transaction_id', transactionIds)
    items = (data || []) as TransactionItem[]
  }

  const metrics = calculateFinancialMetrics((transactions || []) as Transaction[], items)

  // Group transactions by date for chart
  const groupedData = (transactions || []).reduce((acc: Record<string, number>, t) => {
    const date = new Date(t.created_at || '').toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
    acc[date] = (acc[date] || 0) + t.total_amount
    return acc
  }, {})

  const chartData = Object.entries(groupedData).map(([date, revenue]) => ({ date, revenue }))

  return (
    <div className="flex-1 pb-24 md:pb-8 px-4 md:px-10 flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Ringkasan Keuangan
        </h1>
        <p className="text-muted-foreground">
          Periode: {new Date(startDate).toLocaleDateString('id-ID')} - {new Date(endDate).toLocaleDateString('id-ID')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Pendapatan"
          value={formatCurrency(metrics.grossRevenue)}
          icon={DollarSign}
        />
        <StatCard
          title="Harga Pokok Penjualan"
          value={formatCurrency(metrics.cogs)}
          icon={ShoppingBag}
        />
        <StatCard
          title="Laba Bersih"
          value={formatCurrency(metrics.netProfit)}
          icon={TrendingUp}
          variant={metrics.netProfit >= 0 ? 'success' : 'destructive'}
        />
        <StatCard
          title="Margin Laba"
          value={`${metrics.profitMargin.toFixed(1)}%`}
          icon={PieChart}
        />
      </div>

      {/* Revenue Chart (14.5) */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
        <h3 className="text-lg font-bold mb-4">Tren Pendapatan</h3>
        {chartData.length > 0 ? (
          <RevenueChart data={chartData} />
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground bg-muted rounded-xl border border-dashed">
            Belum ada data transaksi untuk periode ini
          </div>
        )}
      </div>
    </div>
  )
}