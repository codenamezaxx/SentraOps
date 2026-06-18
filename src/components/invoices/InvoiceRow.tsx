"use client"

import { useState } from 'react'
import { ExternalLink, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Invoice } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

function daysOverdue(dueDate: string): number {
  const due = new Date(dueDate)
  const now = new Date()
  return Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
}

interface InvoiceRowProps {
  invoice: Invoice
  storeName: string
}

export function InvoiceRow({ invoice, storeName }: InvoiceRowProps) {
  const [sending, setSending] = useState(false)
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

  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl bg-card border border-outline-variant min-h-12">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col min-w-0">
          <span className="font-medium text-foreground text-sm truncate">
            {invoice.customer_name}
          </span>
          <span className="text-xs text-muted-foreground">
            Jatuh tempo {new Date(invoice.due_date).toLocaleDateString('id-ID')}
          </span>
        </div>
        {invoice.status === 'UNPAID' && overdue > 0 ? (
          <Badge variant="destructive" className="shrink-0">
            {overdue} hari
          </Badge>
        ) : (
          <Badge variant={invoice.status === 'PAID' ? 'default' : 'outline'} className="shrink-0">
            {invoice.status === 'PAID' ? 'Lunas' : 'Belum'}
          </Badge>
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold text-primary text-sm">
          {formatCurrency(invoice.amount)}
        </span>
        {invoice.status === 'UNPAID' && (
          <Button
            size="sm"
            variant="destructive"
            onClick={handleSendReminder}
            disabled={sending}
            className="h-10 text-xs gap-1.5"
          >
            {sending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ExternalLink className="w-3.5 h-3.5" />
            )}
            Tagih via WhatsApp
          </Button>
        )}
      </div>
    </div>
  )
}
