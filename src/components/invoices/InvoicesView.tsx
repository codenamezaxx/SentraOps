"use client"

import { useState, useMemo } from 'react'
import { Receipt } from 'lucide-react'
import type { Invoice } from '@/lib/types'
import { InvoiceRow } from '@/components/invoices/InvoiceRow'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const tabs = [
  { value: '', label: 'Semua' },
  { value: 'unpaid', label: 'Belum Bayar' },
  { value: 'overdue', label: 'Jatuh Tempo' },
  { value: 'paid', label: 'Lunas' },
]

interface InvoicesViewProps {
  invoices: Invoice[]
  storeName: string
}

export function InvoicesView({ invoices, storeName }: InvoicesViewProps) {
  const [activeTab, setActiveTab] = useState('')

  const filtered = useMemo(() => {
    const now = new Date()
    switch (activeTab) {
      case 'unpaid':
        return invoices.filter((inv) => inv.status === 'UNPAID')
      case 'overdue':
        return invoices.filter(
          (inv) => inv.status === 'UNPAID' && new Date(inv.due_date) < now
        )
      case 'paid':
        return invoices.filter((inv) => inv.status === 'PAID')
      default:
        return invoices
    }
  }, [invoices, activeTab])

  const emptyMessage = (() => {
    switch (activeTab) {
      case 'overdue':
        return 'Tidak ada tagihan yang jatuh tempo'
      case 'paid':
        return 'Belum ada tagihan yang lunas'
      case 'unpaid':
        return 'Semua tagihan sudah dibayar'
      default:
        return 'Belum ada tagihan'
    }
  })()

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full md:w-auto overflow-x-auto">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="h-10 px-4 whitespace-nowrap">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Receipt className="w-16 h-16 text-muted-foreground/20 mb-4" />
          <p className="text-base font-medium text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((inv) => (
            <InvoiceRow key={inv.id} invoice={inv} storeName={storeName} />
          ))}
        </div>
      )}
    </>
  )
}
