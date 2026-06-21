'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
// useEffect is used for fetching transaction items when dialog opens
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Transaction } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, Trash2, Search, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Pagination } from '@/components/ui/pagination'

export interface TransactionWithCashier {
  id: string
  store_id: string | null
  total_amount: number
  payment_method: string
  status: string | null
  cashier_id: string | null
  created_at: string | null
  cash_amount: number | null
  change_amount: number | null
  profiles?: {
    name: string | null
  } | null
}

import { createClient } from '@/lib/supabase/client'
import { TransactionItem } from '@/lib/types'
import { ReceiptActions } from '@/components/receipt/ReceiptActions'

interface TransactionItemWithProduct extends Omit<TransactionItem, 'transaction_id' | 'product_id'> {
  transaction_id: string | null
  product_id: string | null
  products: {
    name: string
  } | null
}

interface TransactionTableProps {
  transactions: TransactionWithCashier[]
}

const ITEMS_PER_PAGE = 15

/**
 * Requirement: 16.1, 16.2, 16.3
 * Table for viewing transaction history with pagination and delete support
 */
export function TransactionTable({ transactions }: TransactionTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null)
  const [transactionItems, setTransactionItems] = useState<TransactionItemWithProduct[]>([])
  const [isLoadingItems, setIsLoadingItems] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [storeName, setStoreName] = useState('Toko Saya')
  const [receiptFooter, setReceiptFooter] = useState('')
  const detailContentRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchItems() {
      if (!selectedTransactionId) {
        setTransactionItems([])
        return
      }

      setIsLoadingItems(true)
      try {
        const { data, error } = await supabase
          .from('transaction_items')
          .select('*, products(name)')
          .eq('transaction_id', selectedTransactionId)

        if (error) throw error
        setTransactionItems(data || [])
      } catch (error) {
        console.error('Error fetching transaction items:', error)
      } finally {
        setIsLoadingItems(false)
      }
    }

    fetchItems()
  }, [selectedTransactionId, supabase])

  useEffect(() => {
    async function fetchStore() {
      if (!selectedTransactionId) return
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase
        .from('profiles')
        .select('store_id')
        .eq('auth_id', user.id)
        .single()
      if (!profile?.store_id) return
      const { data: store } = await supabase
        .from('stores')
        .select('name, receipt_footer')
        .eq('id', profile.store_id)
        .single()
      if (store) {
        setStoreName(store.name)
        setReceiptFooter(store.receipt_footer || '')
      }
    }
    fetchStore()
  }, [selectedTransactionId])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))
  }
  
  // Filter + search
  const filteredTransactions = transactions.filter(t => 
    !deletedIds.has(t.id) && (
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.payment_method?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.profiles?.name && t.profiles.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  )

  // Pagination
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )


  const selectedTransaction = transactions.find(t => t.id === selectedTransactionId)

  const receiptItems = transactionItems.map((item) => ({
    name: item.products?.name || 'Produk',
    quantity: item.quantity,
    price: item.price_at_time,
  }))

  // Select all / deselect all on current page
  const allSelectedOnPage = paginatedTransactions.length > 0 &&
    paginatedTransactions.every(t => selectedIds.has(t.id))

  const handleSelectAll = () => {
    if (allSelectedOnPage) {
      const newSet = new Set(selectedIds)
      paginatedTransactions.forEach(t => newSet.delete(t.id))
      setSelectedIds(newSet)
    } else {
      const newSet = new Set(selectedIds)
      paginatedTransactions.forEach(t => newSet.add(t.id))
      setSelectedIds(newSet)
    }
  }

  const handleSelectOne = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedIds(newSet)
  }

  const handleDeleteTransactions = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return
    setIsDeleting(true)
    try {
      const res = await fetch('/api/transactions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal menghapus transaksi')
      }

      toast.success(`${ids.length} transaksi berhasil dihapus`)
      ids.forEach(id => setDeletedIds(prev => new Set(prev).add(id)))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus transaksi')
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setDeleteTargetId(null)
      setSelectedIds(new Set())
    }
  }, [])

  // Determine which IDs to delete
  const idsToDelete = deleteTargetId ? [deleteTargetId] : Array.from(selectedIds)

  return (
    <div className="space-y-4">
      {/* Toolbar: Search + Bulk Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari ID, metode bayar, atau kasir..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-10 h-12 rounded-xl"
          />
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} terpilih
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              className="h-10 rounded-xl"
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Hapus Terpilih
            </Button>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-card rounded-2xl border border-outline-variant overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-container/50">
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelectedOnPage}
                    onCheckedChange={handleSelectAll}
                    aria-label="Pilih semua"
                  />
                </TableHead>
                <TableHead className="font-semibold text-on-surface">ID Transaksi</TableHead>
                <TableHead className="font-semibold">Waktu</TableHead>
                <TableHead className="font-semibold">Kasir</TableHead>
                <TableHead className="font-semibold">Metode</TableHead>
                <TableHead className="font-semibold text-right">Total</TableHead>
                <TableHead className="font-semibold text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-on-surface-variant">
                    Tidak ada transaksi ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTransactions.map((t) => (
                  <TableRow key={t.id} className="hover:bg-surface-container transition-colors">
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(t.id)}
                        onCheckedChange={() => handleSelectOne(t.id)}
                        aria-label={`Pilih transaksi ${t.id}`}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs">{t.id.slice(0, 8)}...</TableCell>
                    <TableCell className="text-on-surface-variant">
                      {formatDate(t.created_at)}
                    </TableCell>
                    <TableCell className="text-on-surface">{t.profiles?.name || 'Kasir'}</TableCell>
                    <TableCell className="capitalize text-on-surface">{t.payment_method?.replace('_', ' ')}</TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      {formatCurrency(t.total_amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setSelectedTransactionId(t.id)}
                          className="h-10 w-10 rounded-lg hover:bg-muted"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            setDeleteTargetId(t.id)
                            setDeleteDialogOpen(true)
                          }}
                          className="h-10 w-10 rounded-lg hover:bg-destructive/10 text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-2">
        {paginatedTransactions.length === 0 ? (
          <div className="bg-card rounded-2xl border border-outline-variant p-8 text-center text-muted-foreground">
            Tidak ada transaksi ditemukan.
          </div>
        ) : (
          paginatedTransactions.map((t) => (
            <div
              key={t.id}
              className="bg-card rounded-2xl border border-outline-variant p-3 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedIds.has(t.id)}
                  onCheckedChange={() => handleSelectOne(t.id)}
                  aria-label={`Pilih transaksi ${t.id}`}
                />
                <button
                  onClick={() => setSelectedTransactionId(t.id)}
                  className="flex-1 min-w-0 text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">{formatCurrency(t.total_amount)}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted capitalize whitespace-nowrap">
                      {t.payment_method?.replace('_', ' ')}
                    </span>
                  </div>
                  {t.payment_method === 'cash' && (
                    <div className="text-[11px] text-muted-foreground">
                      Tunai {formatCurrency(t.cash_amount ?? t.total_amount)} · Kembali {formatCurrency(t.change_amount ?? 0)}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground truncate mt-0.5">
                    {formatDate(t.created_at)} · {t.profiles?.name || 'Kasir'} · {t.id.slice(0, 8)}
                  </div>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setDeleteTargetId(t.id)
                    setDeleteDialogOpen(true)
                  }}
                  className="h-10 w-10 rounded-lg hover:bg-destructive/10 text-destructive shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={filteredTransactions.length}
        pageSize={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />

      {/* Transaction Details Dialog */}
      <Dialog open={!!selectedTransactionId} onOpenChange={(open) => !open && setSelectedTransactionId(null)}>
        <DialogContent className="sm:max-w-md sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle>Detail Transaksi</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div ref={detailContentRef} className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm border-b pb-4">
                <div className="text-muted-foreground">ID Transaksi:</div>
                <div className="font-mono text-right">{selectedTransaction.id}</div>
                <div className="text-muted-foreground">Waktu:</div>
                <div className="text-right">{formatDate(selectedTransaction.created_at)}</div>
                <div className="text-muted-foreground">Kasir:</div>
                <div className="text-right">{selectedTransaction.profiles?.name || '-'}</div>
                <div className="text-muted-foreground">Metode Pembayaran:</div>
                <div className="text-right capitalize">{selectedTransaction.payment_method.replace('_', ' ')}</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Item Pesanan</div>
                {isLoadingItems ? (
                  <div className="text-center py-4 text-muted-foreground">Memuat item...</div>
                ) : (
                  <div className="space-y-2">
                    {transactionItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div className="flex flex-col">
                          <span className="font-medium">{item.products?.name || 'Produk'}</span>
                          <span className="text-xs text-muted-foreground">{item.quantity} x {formatCurrency(item.price_at_time)}</span>
                        </div>
                        <div className="font-medium">
                          {formatCurrency(item.quantity * item.price_at_time)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedTransaction.payment_method === 'cash' && (
                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tunai Dibayarkan</span>
                    <span className="font-medium">{formatCurrency(selectedTransaction.cash_amount || selectedTransaction.total_amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Kembalian</span>
                    <span className="font-medium text-primary">{formatCurrency(selectedTransaction.change_amount || 0)}</span>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="font-bold text-lg">Total Akhir</span>
                <span className="font-bold text-xl text-primary">
                  {formatCurrency(selectedTransaction.total_amount)}
                </span>
              </div>
              {receiptItems.length > 0 && (
                <div className="pt-2 border-t">
                  <ReceiptActions
                    transactionId={selectedTransaction.id}
                    items={receiptItems}
                    total={selectedTransaction.total_amount}
                    cashAmount={selectedTransaction.payment_method === 'cash' ? selectedTransaction.cash_amount ?? undefined : undefined}
                    changeAmount={selectedTransaction.payment_method === 'cash' ? selectedTransaction.change_amount ?? undefined : undefined}
                    paymentMethodLabel={selectedTransaction.payment_method.replace('_', ' ')}
                    createdAt={selectedTransaction.created_at || new Date().toISOString()}
                    storeName={storeName}
                    receiptFooter={receiptFooter}
                    cashierName={selectedTransaction.profiles?.name || undefined}
                    pdfCaptureRef={detailContentRef}
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:rounded-2xl max-w-sm">
          <AlertDialogHeader>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 mb-2">
              <Trash2 className="h-6 w-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-center">Hapus Transaksi</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {idsToDelete.length === 1
                ? 'Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.'
                : `Apakah Anda yakin ingin menghapus ${idsToDelete.length} transaksi? Tindakan ini tidak dapat dibatalkan.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="h-12 rounded-xl w-full sm:w-auto" disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDeleteTransactions(idsToDelete)
              }}
              disabled={isDeleting}
              className="h-12 rounded-xl w-full sm:w-auto bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isDeleting ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Menghapus...</>
              ) : (
                'Ya, Hapus'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}