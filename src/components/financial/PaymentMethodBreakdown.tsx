'use client'

import { Banknote, Smartphone } from 'lucide-react'

interface PaymentMethodData {
  method: string
  count: number
  total: number
}

interface PaymentMethodBreakdownProps {
  data: PaymentMethodData[]
  grandTotal: number
}

const colorMap = ['bg-primary', 'bg-teal-500', 'bg-amber-500', 'bg-purple-500']

export function PaymentMethodBreakdown({ data, grandTotal }: PaymentMethodBreakdownProps) {
  const others = data.filter((d) => d.method !== 'cash')
  const cashItem = data.find((d) => d.method === 'cash')

  const aggregated = [
    ...(cashItem ? [{ ...cashItem, label: 'Tunai', icon: Banknote }] : []),
    ...(others.length > 0
      ? [
          {
            method: 'non-tunai',
            count: others.reduce((s, d) => s + d.count, 0),
            total: others.reduce((s, d) => s + d.total, 0),
            label: 'QRIS / Transfer',
            icon: Smartphone,
          },
        ]
      : []),
  ]

  return (
    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-foreground">Metode Pembayaran</h3>
      </div>

      {/* Stacked progress bar */}
      <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex mb-4">
        {data.map((d, i) => {
          const pct = grandTotal > 0 ? (d.total / grandTotal) * 100 : 0
          if (pct < 1) return null
          return (
            <div
              key={d.method}
              style={{ width: `${pct}%` }}
              className={`${colorMap[i % colorMap.length]} h-full transition-all first:rounded-l-full last:rounded-r-full`}
            />
          )
        })}
      </div>

      {/* Legend rows */}
      <div className="flex flex-col gap-2.5">
        {aggregated.map((item) => {
          const pct = grandTotal > 0 ? (item.total / grandTotal) * 100 : 0
          const Icon = item.icon
          return (
            <div key={item.method} className="flex items-center gap-3 min-h-[48px]">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                  <span className="text-sm font-bold text-foreground">{pct.toFixed(0)}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted mt-1 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.method === 'cash' ? 'bg-primary' : 'bg-teal-500'} transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground mt-0.5 block">
                  {item.count} transaksi
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
