"use client"

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { Invoice } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

interface EditInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: Invoice
  onSaved: (updated: Invoice) => void
}

export function EditInvoiceDialog({ open, onOpenChange, invoice, onSaved }: EditInvoiceDialogProps) {
  const [name, setName] = useState(invoice.customer_name)
  const [phone, setPhone] = useState(invoice.customer_phone || '')
  const [amount, setAmount] = useState(String(invoice.amount))
  const [dueDate, setDueDate] = useState(invoice.due_date.slice(0, 10))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Nama pelanggan wajib diisi')
      return
    }
    const numAmount = Number(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Jumlah harus angka positif')
      return
    }
    setError('')
    setSaving(true)
    try {
      const res = await fetch('/api/invoices/edit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invoice.id,
          customer_name: name.trim(),
          customer_phone: phone.trim() || null,
          amount: numAmount,
          due_date: new Date(dueDate).toISOString(),
        }),
      })
      if (!res.ok) throw new Error('Failed')
      onSaved({
        ...invoice,
        customer_name: name.trim(),
        customer_phone: phone.trim() || null,
        amount: numAmount,
        due_date: new Date(dueDate).toISOString(),
      })
      onOpenChange(false)
    } catch (err) {
      console.error('[edit-dialog]', err)
      setError('Gagal menyimpan. Coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Tagihan</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Nama Pelanggan</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama pelanggan" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">No. WhatsApp (opsional)</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08123456789" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Jumlah (Rp)</label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} min="0" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Jatuh Tempo</label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
