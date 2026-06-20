"use client"

import { useState, useMemo } from 'react'
import { Receipt, Search, X } from 'lucide-react'
import type { Invoice } from '@/lib/types'
import { InvoiceRow } from '@/components/invoices/InvoiceRow'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Pagination } from '@/components/ui/pagination'
import { Input } from '@/components/ui/input'

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
  const [searchQuery, setSearchQuery] = useState('')
  const [updatedMap, setUpdatedMap] = useState<Record<string, Invoice>>({})
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())
  const PAGE_SIZE = 10

  const formatDueDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })

  const merged = useMemo(() =>
    invoices.filter(inv => !deletedIds.has(inv.id)).map(inv => updatedMap[inv.id] ?? inv),
    [invoices, updatedMap, deletedIds]
  )

  const searched = useMemo(() => {
    if (!searchQuery.trim()) return merged
    const query = searchQuery.toLowerCase()
    return merged.filter((inv) => {
      const nameMatch = inv.customer_name?.toLowerCase().includes(query)
      const dateMatch = formatDueDate(inv.due_date).toLowerCase().includes(query)
      return nameMatch || dateMatch
    })
  }, [merged, searchQuery])

  const handleInvoiceUpdated = (updated: Invoice) => {
    setUpdatedMap(prev => ({ ...prev, [updated.id]: updated }))
  }

  const handleInvoiceDeleted = (invoiceId: string) => {
    setDeletedIds(prev => new Set(prev).add(invoiceId))
  }

  const filtered = useMemo(() => {
    const now = new Date()
    const source = searchQuery.trim() ? searched : merged
    switch (activeTab) {
      case 'unpaid':
        return source.filter((inv) => inv.status === 'UNPAID')
      case 'overdue':
        return source.filter(
          (inv) => inv.status === 'UNPAID' && new Date(inv.due_date) < now
        )
      case 'paid':
        return source.filter((inv) => inv.status === 'PAID')
      default:
        return source
    }
  }, [merged, searched, activeTab, searchQuery])

  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setCurrentPage(1)
  }

  const emptyMessage = (() => {
    if (searchQuery.trim()) return 'Tidak ada tagihan yang sesuai dengan pencarian'
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
        <TabsList className="w-full md:w-auto overflow-x-auto overflow-y-hidden justify-start scroll-pl-4">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="h-10 px-4 whitespace-nowrap shrink-0">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setCurrentPage(1)
          }}
          placeholder="Cari nama pelanggan atau tanggal jatuh tempo..."
          className="h-12 rounded-xl bg-card border-border pl-10 pr-10"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('')
              setCurrentPage(1)
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Receipt className="w-16 h-16 text-muted-foreground/20 mb-4" />
          <p className="text-base font-medium text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {paginated.map((inv) => (
              <InvoiceRow key={inv.id} invoice={inv} storeName={storeName} onUpdated={handleInvoiceUpdated} onDeleted={handleInvoiceDeleted} />
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
