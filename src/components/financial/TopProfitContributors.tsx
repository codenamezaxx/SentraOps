'use client'

import { formatCurrency } from '@/lib/utils'
import { TrendingUp, Award, Medal } from 'lucide-react'

interface TopProduct {
  product_id: string
  name: string
  total_profit: number
  total_qty: number
}

interface TopProfitContributorsProps {
  products: TopProduct[]
}

const rankIcons = [Award, Medal, TrendingUp]

export function TopProfitContributors({ products }: TopProfitContributorsProps) {
  if (products.length === 0) {
    return (
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
        <h3 className="text-base font-bold text-foreground mb-4">Produk Penyumbang Laba Tertinggi</h3>
        <div className="h-24 flex items-center justify-center text-sm text-muted-foreground bg-muted rounded-xl border border-dashed">
          Belum ada data transaksi
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-foreground">Produk Penyumbang Laba Tertinggi</h3>
      </div>

      <div className="flex flex-col">
        {products.map((product, index) => {
          const RankIcon = rankIcons[index] || TrendingUp
          return (
            <div
              key={product.product_id}
              className="flex items-center gap-3 py-3 min-h-[48px] hover:bg-muted/50 -mx-2 px-2 rounded-xl transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <RankIcon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.total_qty} terjual</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-foreground">{formatCurrency(product.total_profit)}</p>
                <p className="text-xs text-muted-foreground">laba</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
