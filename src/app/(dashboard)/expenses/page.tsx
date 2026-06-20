import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/supabase/queries'
import { ExpensesView } from '@/components/expenses/ExpensesView'
import { TrendingDown, Building2, Wallet, Package, MoreHorizontal } from 'lucide-react'
import type { Expense } from '@/lib/types'
import { formatCompactCurrency } from '@/lib/utils'

export default async function ExpensesPage() {
  const supabase = await createClient()
  const profile = await getUserProfile()

  if (!profile?.store_id) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: expenses } = await (supabase as any)
    .from('expenses')
    .select('*')
    .eq('store_id', profile.store_id)
    .order('expense_date', { ascending: false })
    .order('created_at', { ascending: false })

  const expenseList = (expenses || []) as Expense[]

  // Calculate totals per category
  const totalExpenses = expenseList.reduce((sum, e) => sum + e.amount, 0)
  const categoryTotals: Record<string, number> = {}
  expenseList.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount
  })

  const categories = [
    { key: 'operasional', label: 'Operasional', icon: Building2, color: 'text-on-surface-variant' },
    { key: 'gaji', label: 'Gaji', icon: Wallet, color: 'text-on-surface-variant' },
    { key: 'logistik', label: 'Logistik', icon: Package, color: 'text-on-surface-variant' },
    { key: 'lain-lain', label: 'Lain-lain', icon: MoreHorizontal, color: 'text-on-surface-variant' },
  ] as const

  return (
    <div className="flex-1 pb-24 md:pb-8 px-4 md:px-10 flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <TrendingDown className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manajemen Pengeluaran</h1>
          <p className="text-sm text-muted-foreground">
            Catat dan pantau pengeluaran operasional toko
          </p>
        </div>
      </div>

      {/* Summary Cards — Total in its own row */}
      <div className="bg-card p-5 rounded-2xl border border-outline-variant flex items-center gap-4 shadow-sm">
        <div className="w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
          <TrendingDown className="w-7 h-7 text-on-surface-variant" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-on-surface-variant font-medium">Total Pengeluaran</p>
          <p className="text-3xl font-bold text-on-surface truncate">
            {formatCompactCurrency(totalExpenses)}
          </p>
        </div>
      </div>

      {/* Category Cards — 4 columns */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon
          return (
            <div key={cat.key} className="bg-card p-4 rounded-2xl border border-outline-variant flex flex-col gap-2 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-on-surface-variant" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-on-surface-variant font-medium">{cat.label}</p>
                <p className="text-xl font-bold text-on-surface truncate">
                  {formatCompactCurrency(categoryTotals[cat.key] || 0)}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Expenses Table */}
      <ExpensesView expenses={expenseList} />
    </div>
  )
}
