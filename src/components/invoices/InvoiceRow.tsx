"use client"

import { useState } from 'react'
import {
  ExternalLink,
  Loader2,
  Pencil,
  CheckCircle2,
  Copy,
  Check,
  Receipt,
  Eye,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Invoice } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { EditInvoiceDialog } from './EditInvoiceDialog'

function daysOverdue(dueDate: string): number {
  const due = new Date(dueDate)
  const now = new Date()
  return Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
}

interface InvoiceRowProps {
  invoice: Invoice
  storeName: string
  onUpdated?: (invoice: Invoice) => void
}

export function InvoiceRow({ invoice, storeName, onUpdated }: InvoiceRowProps) {
  const [sending, setSending] = useState(false)
  const [paying, setPaying] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showPayConfirm, setShowPayConfirm] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const overdue = invoice.status === 'UNPAID' ? daysOverdue(invoice.due_date) : 0

  const handleSendReminder = async () => {
    setSending(true)
    try {
      const res = await fetch('/api/invoices/create-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invoice.id,
          customerName: invoice.customer_name,
          amount: invoice.amount,
          dueDate: invoice.due_date,
          storeName,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      const { waText } = await res.json()

      const phone = invoice.customer_phone?.replace(/[^0-9]/g, '') || ''
      const waUrl = phone
        ? `https://wa.me/${phone.startsWith('62') ? phone : '62' + phone.slice(1)}?text=${encodeURIComponent(waText)}`
        : `https://wa.me/?text=${encodeURIComponent(waText)}`
      window.open(waUrl, '_blank')
    } catch (err) {
      console.error('[reminder]', err)
    } finally {
      setSending(false)
    }
  }

  const handleMarkPaid = async () => {
    setPaying(true)
    try {
      const res = await fetch('/api/invoices/mark-paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoice.id }),
      })
      if (!res.ok) throw new Error('Failed')
      setShowPayConfirm(false)
      onUpdated?.({ ...invoice, status: 'PAID', updated_at: new Date().toISOString() })
    } catch (err) {
      console.error('[mark-paid]', err)
    } finally {
      setPaying(false)
    }
  }

  const handleCopyLink = async () => {
    if (invoice.xendit_invoice_url) {
      await navigator.clipboard.writeText(invoice.xendit_invoice_url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const isLunas = invoice.status === 'PAID'

  return (
    <>
      <div className="flex flex-col gap-3 p-4 rounded-xl bg-card border border-outline-variant min-h-12">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-foreground text-sm truncate">
              {invoice.customer_name}
            </span>
            <span className="text-xs text-muted-foreground">
              {isLunas
                ? `Lunas ${invoice.updated_at ? new Date(invoice.updated_at).toLocaleDateString('id-ID') : ''}`
                : `Jatuh tempo ${new Date(invoice.due_date).toLocaleDateString('id-ID')}`}
            </span>
          </div>
          {!isLunas && overdue > 0 ? (
            <Badge variant="destructive" className="shrink-0">
              {overdue} hari
            </Badge>
          ) : (
            <Badge variant={isLunas ? 'default' : 'outline'} className="shrink-0">
              {isLunas ? 'Lunas' : 'Belum'}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-primary text-sm">
            {formatCurrency(invoice.amount)}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {!isLunas && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSendReminder}
                disabled={sending}
                className="h-9 text-xs gap-1.5"
              >
                {sending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ExternalLink className="w-3.5 h-3.5" />
                )}
                Tagih WA
              </Button>

              {invoice.xendit_invoice_url && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyLink}
                    className="h-9 text-xs gap-1.5"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-green-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    {copied ? 'Tersalin' : 'Salin Link'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(invoice.xendit_invoice_url!, '_blank')}
                    className="h-9 text-xs gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Lihat
                  </Button>
                </>
              )}

              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowEdit(true)}
                className="h-9 text-xs gap-1.5"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </Button>

              <Button
                size="sm"
                variant="default"
                onClick={() => setShowPayConfirm(true)}
                className="h-9 text-xs gap-1.5 ml-auto"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Lunasi
              </Button>
            </>
          )}

          {isLunas && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Receipt className="w-3.5 h-3.5" />
              Tagihan lunas
            </div>
          )}
        </div>
      </div>

      {/* Mark as Paid confirmation dialog */}
      <Dialog open={showPayConfirm} onOpenChange={setShowPayConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lunasi Tagihan</DialogTitle>
            <DialogDescription>
              Tandai tagihan atas nama <strong>{invoice.customer_name}</strong> sebesar{' '}
              <strong>{formatCurrency(invoice.amount)}</strong> sebagai lunas?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayConfirm(false)} disabled={paying}>
              Batal
            </Button>
            <Button onClick={handleMarkPaid} disabled={paying}>
              {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Ya, Lunasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <EditInvoiceDialog
        open={showEdit}
        onOpenChange={setShowEdit}
        invoice={invoice}
        onSaved={(updated) => { onUpdated?.(updated); setShowEdit(false) }}
      />
    </>
  )
}
