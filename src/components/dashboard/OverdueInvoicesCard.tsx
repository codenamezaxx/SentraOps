"use client"

import Link from 'next/link'
import { FileText, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Invoice } from '@/lib/types'

interface OverdueInvoicesCardProps {
  invoices: Invoice[]
}

export function OverdueInvoicesCard({ invoices }: OverdueInvoicesCardProps) {
  const count = invoices.length
  const hasOverdue = count > 0

  return (
    <Link
      href="/invoices?filter=overdue"
      className={cn(
        "bg-card p-5 rounded-2xl border shadow-md flex flex-col gap-2 group hover:shadow-lg transition-shadow w-full h-auto",
        hasOverdue ? "border-error" : "border-outline-variant"
      )}
    >
      <div className="flex justify-between items-start">
        <p className="text-sm font-semibold text-muted-foreground">Tagihan Jatuh Tempo</p>
        {hasOverdue ? (
          <AlertTriangle className="w-5 h-5 text-error" />
        ) : (
          <FileText className="w-5 h-5 text-on-surface-variant" />
        )}
      </div>
      <h3 className="text-2xl md:text-3xl font-bold text-foreground">
        {count} Faktur
      </h3>
      <p className={cn(
        "text-xs mt-auto",
        hasOverdue ? "text-error" : "text-on-surface-variant"
      )}>
        {hasOverdue
          ? `${count} faktur telah melewati jatuh tempo`
          : 'Tidak ada tagihan overdue'}
      </p>
    </Link>
  )
}
