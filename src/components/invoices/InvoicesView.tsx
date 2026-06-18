"use client"

import { useState, useMemo } from 'react'
import { Receipt } from 'lucide-react'
import type { Invoice } from '@/lib/types'
import { InvoiceRow } from '@/components/invoices/InvoiceRow'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Pagination } from '@/components/ui/pagination'

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
  const [currentPage, setCurrentPage] = useState(1)
  const [updatedMap, setUpdatedMap] = useState<Record<string, Invoice>>({})
  const PAGE_SIZE = 10

  const merged = useMemo(() =>
    invoices.map(inv => updatedMap[inv.id] ?? inv),
    [invoices, updatedMap]
  )

  const handleInvoiceUpdated = (updated: Invoice) => {
    setUpdatedMap(prev => ({ ...prev, [updated.id]: updated }))
  }

  const filtered = useMemo(() => {
    const now = new Date()
    switch (activeTab) {
      case 'unpaid':
        return merged.filter((inv) => inv.status === 'UNPAID')
      case 'overdue':
        return merged.filter(
          (inv) => inv.status === 'UNPAID' && new Date(inv.due_date) < now
        )
      case 'paid':
        return merged.filter((inv) => inv.status === 'PAID')
      default:
        return merged
    }
  }, [merged, activeTab])

  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setCurrentPage(1)
  }

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
      <Tabs value={activeTab} onValueChange={handleTabChange}>
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
        <>
          <div className="flex flex-col gap-3">
            {paginated.map((inv) => (
              <InvoiceRow key={inv.id} invoice={inv} storeName={storeName} onUpdated={handleInvoiceUpdated} />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </>
  )
}
