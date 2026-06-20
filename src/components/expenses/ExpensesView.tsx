'use client'

import * as React from 'react'
import { Plus, Trash2, Receipt, Loader2, TrendingDown } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pagination } from '@/components/ui/pagination'
import { toast } from 'sonner'
import type { Expense, ExpenseCategory } from '@/lib/types'

interface Props {
  expenses: Expense[]
}

const categoryLabels: Record<ExpenseCategory, string> = {
  operasional: 'Operasional',
  gaji: 'Gaji',
  logistik: 'Logistik',
  'lain-lain': 'Lain-lain',
}

const categoryColors: Record<ExpenseCategory, string> = {
  operasional: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/40',
  gaji: 'text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-950/40',
  logistik: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/40',
  'lain-lain': 'text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-950/40',
}

export function ExpensesView({ expenses: initialExpenses }: Props) {
  const [expenses, setExpenses] = React.useState(initialExpenses)
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [currentPage, setCurrentPage] = React.useState(1)
  const PAGE_SIZE = 15

  const paginatedExpenses = expenses.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  // Form state
  const [title, setTitle] = React.useState('')
  const [amount, setAmount] = React.useState('')
  const [category, setCategory] = React.useState<string>('operasional')
  const [description, setDescription] = React.useState('')
  const [expenseDate, setExpenseDate] = React.useState(new Date().toISOString().split('T')[0])

  const resetForm = () => {
    setTitle('')
    setAmount('')
    setCategory('operasional')
    setDescription('')
    setExpenseDate(new Date().toISOString().split('T')[0])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !amount || !expenseDate) {
      toast.error('Lengkapi semua field yang wajib diisi')
      return
    }
    const numAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10)
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Jumlah pengeluaran harus lebih dari 0')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/expenses/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          amount: numAmount,
          category,
          description: description.trim() || null,
          expense_date: expenseDate,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Gagal menyimpan pengeluaran')
        return
      }
      setExpenses((prev) => [data.expense, ...prev])
      toast.success('Pengeluaran berhasil dicatat')
      setOpen(false)
      resetForm()
    } catch {
      toast.error('Terjadi kesalahan, silakan coba lagi')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus pengeluaran ini? Tindakan ini tidak dapat dibatalkan.')) return
    setDeletingId(id)
    try {
      const res = await fetch('/api/expenses/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expenseId: id }),
      })
      if (!res.ok) {
        toast.error('Gagal menghapus pengeluaran')
        return
      }
      setExpenses((prev) => prev.filter((e) => e.id !== id))
      // Go back a page if current page becomes empty
      const remaining = expenses.length - 1
      const maxPage = Math.max(1, Math.ceil(remaining / PAGE_SIZE))
      if (currentPage > maxPage) setCurrentPage(maxPage)
      toast.success('Pengeluaran berhasil dihapus')
    } catch {
      toast.error('Terjadi kesalahan, silakan coba lagi')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-foreground">Riwayat Pengeluaran</h2>
        <Dialog open={open} onOpenChange={(v: boolean) => { setOpen(v); if (!v) resetForm() }}>
          <DialogTrigger asChild>
            <Button className="h-12 px-5 bg-accent-blue hover:bg-accent-blue/90 rounded-xl gap-2 font-semibold">
              <Plus className="w-5 h-5" />
              Catat Pengeluaran
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Catat Pengeluaran Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Judul Pengeluaran</Label>
                <Input
                  id="title"
                  placeholder="Misal: Listrik, BBM, dll"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-12 rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Jumlah (Rp)</Label>
                <Input
                  id="amount"
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '')
                    setAmount(val ? new Intl.NumberFormat('id-ID').format(parseInt(val, 10)) : '')
                  }}
                  className="h-12 rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex h-12 w-full rounded-xl border border-outline-variant bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                >
                  {(Object.entries(categoryLabels) as [ExpenseCategory, string][]).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi (opsional)</Label>
                <Input
                  id="description"
                  placeholder="Catatan tambahan"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expenseDate">Tanggal Pengeluaran</Label>
                <Input
                  id="expenseDate"
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="h-12 rounded-xl"
                  required
                />
              </div>
              <Button type="submit" className="w-full h-12 bg-accent-blue text-on-accent-blue-foreground hover:bg-accent-blue/90 rounded-xl gap-2 font-semibold" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Receipt className="w-5 h-5" />}
                {loading ? 'Menyimpan...' : 'Simpan Pengeluaran'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Desktop Table */}
      {expenses.length > 0 ? (
        <>
          <div className="hidden md:block bg-card rounded-2xl border border-outline-variant overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-surface-container/50">
                  <TableHead className="font-semibold">Tanggal</TableHead>
                  <TableHead className="font-semibold">Judul</TableHead>
                  <TableHead className="font-semibold">Kategori</TableHead>
                  <TableHead className="font-semibold text-right">Jumlah</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedExpenses.map((expense) => (
                  <TableRow key={expense.id} className="hover:bg-surface-container transition-colors">
                    <TableCell className="text-sm text-on-surface-variant">
                      {new Date(expense.expense_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-on-surface">{expense.title}</p>
                        {expense.description && (
                          <p className="text-xs text-on-surface-variant mt-0.5">{expense.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${categoryColors[expense.category as ExpenseCategory]}`}>
                        {categoryLabels[expense.category as ExpenseCategory]}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm font-bold text-on-surface">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(expense.amount)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={() => handleDelete(expense.id)}
                        disabled={deletingId === expense.id}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        {deletingId === expense.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col gap-3">
            {paginatedExpenses.map((expense) => (
              <div key={expense.id} className="bg-card p-4 rounded-2xl border border-outline-variant shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{expense.title}</p>
                    {expense.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{expense.description}</p>
                    )}
                    <span className={`inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${categoryColors[expense.category as ExpenseCategory]}`}>
                      {categoryLabels[expense.category as ExpenseCategory]}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-sm font-bold text-foreground">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(expense.amount)}
                    </span>
                    <span className="text-[10px] text-on-surface-variant">
                      {new Date(expense.expense_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                </div>
                <div className="flex justify-end mt-2 pt-2 border-t border-outline-variant">
                  <button
                    onClick={() => handleDelete(expense.id)}
                    disabled={deletingId === expense.id}
                    className="h-10 px-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
                  >
                    {deletingId === expense.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalItems={expenses.length}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <div className="bg-card border border-dashed border-outline-variant rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <TrendingDownIcon />
          <p className="text-sm font-medium text-foreground mt-4">Belum ada pengeluaran</p>
          <p className="text-xs text-muted-foreground mt-1">Klik &quot;Catat Pengeluaran&quot; untuk mencatat pengeluaran pertama</p>
        </div>
      )}
    </div>
  )
}

function TrendingDownIcon() {
  return (
    <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
      <TrendingDown className="w-7 h-7 text-red-500 dark:text-red-400" />
    </div>
  )
}
