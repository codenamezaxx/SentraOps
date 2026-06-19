import { createClient } from '@/lib/supabase/server'
import { calculateFinancialMetrics } from '@/lib/financial-utils'
import { formatCurrency } from '@/lib/utils'
import { StatCard } from '@/components/dashboard/StatCard'
import { DollarSign, TrendingUp, ShoppingBag, PieChart } from 'lucide-react'
import type { Transaction, TransactionItem } from '@/lib/types'
import { RevenueChart } from '@/components/financial/RevenueChart'
import { PaymentMethodBreakdown } from '@/components/financial/PaymentMethodBreakdown'
import { TopProfitContributors } from '@/components/financial/TopProfitContributors'
import { ExportButton } from '@/components/financial/ExportButton'

export default async function FinancialPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>
}) {
  const { start, end } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('store_id')
    .eq('auth_id', user.id)
    .single()

  if (!profile?.store_id) return null

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
    .eq('status', 'completed')
    .gte('created_at', startDate)
    .lte('created_at', endDate)

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

  // --- Payment method breakdown ---
  const methodAgg = (transactions || []).reduce(
    (acc: Record<string, { method: string; count: number; total: number }>, t) => {
      const m = t.payment_method || 'unknown'
      if (!acc[m]) acc[m] = { method: m, count: 0, total: 0 }
      acc[m].count++
      acc[m].total += t.total_amount
      return acc
    },
    {},
  )
  const paymentMethodData = Object.values(methodAgg)

  // --- Top profit contributors ---
  interface ProductProfit {
    product_id: string
    name: string
    total_profit: number
    total_qty: number
  }
  let topProducts: ProductProfit[] = []

  if (transactionIds.length > 0) {
    const profitMap = new Map<string, { name: string; profit: number; qty: number }>()

    for (const item of items) {
      const profit = (item.price_at_time - item.cost_price_at_time) * item.quantity
      const existing = profitMap.get(item.product_id)
      if (existing) {
        existing.profit += profit
        existing.qty += item.quantity
      } else {
        profitMap.set(item.product_id, { name: '', profit, qty: item.quantity })
      }
    }

    // Fetch product names
    const productIds = Array.from(profitMap.keys())
    if (productIds.length > 0) {
      const { data: products } = await supabase
        .from('products')
        .select('id, name')
        .in('id', productIds)

      for (const p of products || []) {
        const entry = profitMap.get(p.id)
        if (entry) entry.name = p.name
      }
    }

    topProducts = Array.from(profitMap.entries())
      .map(([product_id, v]) => ({
        product_id,
        name: v.name || '(tanpa nama)',
        total_profit: v.profit,
        total_qty: v.qty,
      }))
      .sort((a, b) => b.total_profit - a.total_profit)
      .slice(0, 5)
  }

  const periodLabel = `${new Date(startDate).toLocaleDateString('id-ID')} - ${new Date(endDate).toLocaleDateString('id-ID')}`

  return (
    <div className="flex-1 pb-24 md:pb-8 px-4 md:px-10 flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Ringkasan Keuangan
          </h1>
          <p className="text-sm text-muted-foreground">
            Periode: {periodLabel}
          </p>
        </div>
        <ExportButton />
      </div>

      {/* Stat Cards */}
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

      {/* Revenue Chart */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
        <h3 className="text-base font-bold text-foreground mb-4">Tren Pendapatan</h3>
        {chartData.length > 0 ? (
          <RevenueChart data={chartData} />
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground bg-muted rounded-xl border border-dashed">
            Belum ada data transaksi untuk periode ini
          </div>
        )}
      </div>

      {/* Payment Method + Top Products grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PaymentMethodBreakdown data={paymentMethodData} grandTotal={metrics.grossRevenue} />
        <TopProfitContributors products={topProducts} />
      </div>
    </div>
  )
}
