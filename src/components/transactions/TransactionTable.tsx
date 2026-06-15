'use client'

import { useState } from 'react'
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
import { Transaction } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Eye, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface TransactionWithCashier extends Omit<Transaction, 'store_id' | 'payment_method' | 'created_at' | 'cashier_id' | 'status'> {
  store_id: string | null
  payment_method: string
  created_at: string | null
  cashier_id: string | null
  status: string | null
  profiles?: {
    name: string | null
  } | null
}

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TransactionItem } from '@/lib/types'

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

/**
 * Requirement: 16.1, 16.2, 16.3
 * Table for viewing transaction history
 */
export function TransactionTable({ transactions }: TransactionTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null)
  const [transactionItems, setTransactionItems] = useState<TransactionItemWithProduct[]>([])
  const [isLoadingItems, setIsLoadingItems] = useState(false)
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
  
  const filteredTransactions = transactions.filter(t => 
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.payment_method?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.profiles?.name && t.profiles.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const selectedTransaction = transactions.find(t => t.id === selectedTransactionId)

  return (
    <div className="space-y-4">
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cari ID, metode bayar, atau kasir..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-12 rounded-xl"
        />
      </div>

      <div className="bg-card rounded-2xl border border-outline-variant overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-container/50">
                <TableHead className="font-semibold text-on-surface">ID Transaksi</TableHead>
                <TableHead className="font-semibold">Waktu</TableHead>
                <TableHead className="font-semibold">Kasir</TableHead>
                <TableHead className="font-semibold">Metode</TableHead>
                <TableHead className="font-semibold text-right">Total</TableHead>
                <TableHead className="font-semibold text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-on-surface-variant">
                    Tidak ada transaksi ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((t) => (
                  <TableRow key={t.id} className="hover:bg-surface-container transition-colors">
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
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setSelectedTransactionId(t.id)}
                        className="h-10 w-10 rounded-lg hover:bg-muted"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Transaction Details Dialog */}
      <Dialog open={!!selectedTransactionId} onOpenChange={(open) => !open && setSelectedTransactionId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Transaksi</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
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

              <div className="flex justify-between items-center pt-4 border-t">
                <span className="font-bold text-lg">Total Akhir</span>
                <span className="font-bold text-xl text-primary">
                  {formatCurrency(selectedTransaction.total_amount)}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}