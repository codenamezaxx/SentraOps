import { getUserContext, getOverdueInvoices } from '../../lib/supabase/queries'
import { ThemeToggle } from '../../components/ui/ThemeToggle'
import Link from 'next/link'
import { StatCard } from '@/components/dashboard/StatCard'
import { OverdueInvoicesCard } from '@/components/dashboard/OverdueInvoicesCard'
import { TrendingUp, AlertTriangle, ShoppingBag, BarChart3, LayoutDashboard } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import { DashboardQuickActions } from '@/components/dashboard/DashboardQuickActions'
import { RevenueChart } from '@/components/financial/RevenueChart'

export default async function DashboardPage() {
  const context = await getUserContext()
  if (!context || !context.store) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <p className="text-muted-foreground text-sm">Memuat data dashboard...</p>
      </div>
    )
  }

  const { store } = context
  const supabase = await createClient()

  // Requirement 4.1: Date ranges
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  
  const startOfYesterday = new Date()
  startOfYesterday.setDate(startOfYesterday.getDate() - 1)
  startOfYesterday.setHours(0, 0, 0, 0)

  const last7Days = new Date()
  last7Days.setDate(last7Days.getDate() - 7)
  last7Days.setHours(0, 0, 0, 0)

  // Parallel data fetching
  const [
    { data: todaySalesData },
    { data: yesterdaySalesData },
    { data: lowStockProducts },
    { data: recentTransactions },
    { data: chartDataRaw },
    { data: recentExpensesRaw }
  ] = await Promise.all([
    supabase
      .from('transactions')
      .select('total_amount')
      .eq('store_id', store.id)
      .eq('status', 'completed')
      .gte('created_at', startOfDay.toISOString()),
    
    supabase
      .from('transactions')
      .select('total_amount')
      .eq('store_id', store.id)
      .eq('status', 'completed')
      .gte('created_at', startOfYesterday.toISOString())
      .lt('created_at', startOfDay.toISOString()),

    supabase
      .from('products')
      .select('id, name, stock_quantity, min_stock_threshold')
      .eq('store_id', store.id),

    supabase
      .from('transactions')
      .select('id, total_amount, created_at, payment_method')
      .eq('store_id', store.id)
      .neq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5),

    supabase
      .from('transactions')
      .select('total_amount, created_at')
      .eq('store_id', store.id)
      .eq('status', 'completed')
      .gte('created_at', last7Days.toISOString())
      .order('created_at', { ascending: true }),

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('expenses')
      .select('id, title, amount, created_at, category')
      .eq('store_id', store.id)
      .order('created_at', { ascending: false })
      .limit(5)
  ])

  const overdueInvoices = await getOverdueInvoices(store.id)

  const todaySales = todaySalesData?.reduce((sum, t) => sum + t.total_amount, 0) || 0
  const yesterdaySales = yesterdaySalesData?.reduce((sum, t) => sum + t.total_amount, 0) || 0
  const actualLowStockCount = lowStockProducts?.filter(p => p.stock_quantity <= p.min_stock_threshold).length || 0
  const lowStockItems = lowStockProducts?.filter(p => p.stock_quantity <= p.min_stock_threshold) || []

  const revenueByDay: Record<string, number> = {}
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
    revenueByDay[dateStr] = 0
  }

  chartDataRaw?.forEach(t => {
    if (!t.created_at) return
    const dateStr = new Date(t.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
    if (revenueByDay[dateStr] !== undefined) {
      revenueByDay[dateStr] += t.total_amount
    }
  })

  const chartData = Object.entries(revenueByDay)
    .map(([date, revenue]) => ({ date, revenue }))
    .reverse()

  // Combine transactions and expenses into a single activity feed
  const recentExpenses = (recentExpensesRaw || []) as { id: string; title: string; amount: number; created_at: string; category: string }[]
  type ActivityItem = {
    type: 'income' | 'expense'
    id: string
    label: string
    amount: number
    timestamp: string
    meta: string
  }
  const activities: ActivityItem[] = [
    ...(recentTransactions || []).map((tx) => ({
      type: 'income' as const,
      id: tx.id,
      label: `Penjualan #${tx.id.slice(0, 4)}`,
      amount: tx.total_amount,
      timestamp: tx.created_at || '',
      meta: tx.payment_method,
    })),
    ...recentExpenses.map((ex) => ({
      type: 'expense' as const,
      id: ex.id,
      label: ex.title,
      amount: ex.amount,
      timestamp: ex.created_at,
      meta: ex.category,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5)

  return (
    <div className="flex-1 pb-24 md:pb-8 px-4 md:px-10 flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Header Section */}
      <section className="flex flex-col gap-1">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                Selamat Datang, <span className="text-primary">{store?.name || 'Toko'}</span>
              </h2>
              <p className="text-base text-muted-foreground mt-1">
                Berikut adalah ringkasan operasional hari ini.
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </section>

      {/* Snapshot Cards (Requirement 4) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Penjualan Hari Ini"
            value={formatCurrency(todaySales)}
            icon={TrendingUp}
            variant="success"
            description={yesterdaySales === 0
              ? (todaySales > 0 ? 'Baru hari ini' : 'Belum ada penjualan')
              : `${todaySales >= yesterdaySales ? '+' : ''}${Math.round(((todaySales - yesterdaySales) / yesterdaySales) * 100)}% dari kemarin`
            }
            descriptionClassName={
              yesterdaySales === 0
                ? 'text-xs mt-auto text-muted-foreground'
                : todaySales >= yesterdaySales
                  ? 'text-xs mt-auto text-emerald-600 dark:text-emerald-500'
                  : 'text-xs mt-auto text-destructive'
            }
          />
        <StatCard
          title="Stok Kritis"
          value={`${actualLowStockCount} Item`}
          icon={AlertTriangle}
          variant={actualLowStockCount > 0 ? 'destructive' : 'default'}
          description={actualLowStockCount > 0 ? 'Segera restok barang' : 'Semua stok aman'}
        />
        <OverdueInvoicesCard invoices={overdueInvoices} />
      </section>

      {/* Quick Action Hub (Requirement 4.5) */}
      <DashboardQuickActions />

      {/* Revenue Chart (Requirement 12.4) */}
      <section className="bg-card border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Tren Pendapatan</h3>
          </div>
          <span className="text-sm font-medium text-muted-foreground">7 Hari Terakhir</span>
        </div>
        <div className="w-full flex items-center justify-center">
          <RevenueChart data={chartData} />
        </div>
      </section>

      {/* Alerts & Activity Panel (Requirement 10) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2">
        {/* Left: Restock Needs */}
        <div className="bg-card border border-outline-variant rounded-2xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-foreground">Perlu Restock</h3>
            <Link href="/inventory" className="text-sm font-semibold text-muted-foreground hover:underline">
              Lihat Semua
            </Link>
          </div>
          
          {lowStockItems.length > 0 ? (
            <div className="space-y-3">
              {lowStockItems.slice(0, 3).map((product) => (
                <div key={product.id} className="flex justify-between items-center p-3 bg-muted rounded-xl border border-outline-variant">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {product.name}
                    </span>
                    <span className="text-xs text-error">Stok: {product.stock_quantity}</span>
                  </div>
                  <Link 
                    href={`/inventory?search=${product.id}`}
                    className="text-xs bg-card px-3 py-1.5 rounded-lg border border-border font-semibold text-foreground"
                  >
                    Update
                  </Link>
                </div>
              ))}
              {lowStockItems.length > 3 && (
                <p className="text-center text-xs text-muted-foreground">+{lowStockItems.length - 3} produk lainnya</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">Tidak ada item yang perlu direstock</p>
            </div>
          )}
        </div>

        {/* Right: Recent Activity */}
        <div className="bg-card border border-outline-variant rounded-2xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-foreground">Aktivitas Terakhir</h3>
            <Link href="/transactions" className="text-sm font-semibold text-muted-foreground hover:underline">
              Riwayat
            </Link>
          </div>
          
          {activities.length > 0 ? (
            <div className="space-y-3">
              {activities.map((act) => (
                <div key={`${act.type}-${act.id}`} className="flex justify-between items-center p-3 bg-muted rounded-xl border border-outline-variant">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {act.type === 'income' ? act.label : act.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(act.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      {act.type === 'income' ? <> &bull; {act.meta}</> : null}
                    </span>
                  </div>
                  <span className={`font-bold ${act.type === 'income' ? 'text-primary' : 'text-destructive'}`}>
                    {act.type === 'income' ? '' : '-'}{formatCurrency(act.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <TrendingUp className="w-12 h-12 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">Belum ada aktivitas hari ini</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
