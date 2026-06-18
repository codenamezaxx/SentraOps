'use client'

import { Printer } from 'lucide-react'

export function ExportButton() {
  return (
    <button
      onClick={() => window.print()}
      className="h-10 px-4 rounded-xl border border-border bg-card text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors inline-flex items-center gap-2 shrink-0 cursor-pointer"
    >
      <Printer className="w-4 h-4" />
      Ekspor Laporan
    </button>
  )
}
