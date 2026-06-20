import { Transaction, TransactionItem } from './types'

export interface FinancialMetrics {
  grossRevenue: number
  cogs: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
}

/**
 * Requirement: 12.1, 12.2, 12.3
 * Calculates financial metrics from transactions and items.
 * Optionally includes expenses deducted from net profit.
 */
export function calculateFinancialMetrics(
  transactions: Transaction[],
  items: TransactionItem[],
  totalExpenses = 0
): FinancialMetrics {
  const grossRevenue = transactions.reduce((sum, t) => sum + t.total_amount, 0)

  const cogs = items.reduce((sum, item) => {
    return sum + (item.cost_price_at_time * item.quantity)
  }, 0)

  const netProfit = grossRevenue - cogs - totalExpenses
  const profitMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0

  return {
    grossRevenue,
    cogs,
    totalExpenses,
    netProfit,
    profitMargin
  }
}
