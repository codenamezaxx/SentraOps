import { Transaction, TransactionItem } from './types'

export interface FinancialMetrics {
  grossRevenue: number
  cogs: number
  netProfit: number
  profitMargin: number
}

/**
 * Requirement: 12.1, 12.2, 12.3
 * Calculates financial metrics from transactions and items
 */
export function calculateFinancialMetrics(
  transactions: Transaction[],
  items: TransactionItem[]
): FinancialMetrics {
  const grossRevenue = transactions.reduce((sum, t) => sum + t.total_amount, 0)
  
  const cogs = items.reduce((sum, item) => {
    return sum + (item.cost_price_at_time * item.quantity)
  }, 0)

  const netProfit = grossRevenue - cogs
  const profitMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0

  return {
    grossRevenue,
    cogs,
    netProfit,
    profitMargin
  }
}