'use client'

import { Printer } from 'lucide-react'

export function ExportButton() {
  const handlePrint = () => {
    // Set document title for PDF export
    const originalTitle = document.title
    const period = document.querySelector('[data-period]')?.getAttribute('data-period') || ''
    document.title = `Laporan Keuangan - ${period}`

    // Fill print date
    const dateEl = document.getElementById('print-date')
    if (dateEl) {
      dateEl.textContent = `Dicetak: ${new Date().toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })}`
    }

    window.print()
    document.title = originalTitle
  }

  return (
    <button
      onClick={handlePrint}
      className="h-10 px-4 rounded-xl border border-border bg-card text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors inline-flex items-center gap-2 shrink-0 cursor-pointer no-print"
    >
      <Printer className="w-4 h-4" />
      Ekspor Laporan
    </button>
  )
}
