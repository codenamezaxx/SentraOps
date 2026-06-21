'use client'

import { Printer } from 'lucide-react'
import { buildReportDefinition } from '@/lib/reports/generateFinancialPdf'
import type { PdfExportData } from '@/lib/reports/generateFinancialPdf'

interface ExportButtonProps {
  data: PdfExportData
}

export function ExportButton({ data }: ExportButtonProps) {
  const handleExport = async () => {
    const pdfMakeModule = await import('pdfmake/build/pdfmake')
    const pdfFontsModule = await import('pdfmake/build/vfs_fonts')
    const pdfMake = (pdfMakeModule as any).default ?? pdfMakeModule
    const vfsData = (pdfFontsModule as any).default ?? pdfFontsModule
    pdfMake.vfs = vfsData

    const dd = buildReportDefinition(data)
    const periodSlug = data.periodLabel.replace(/[^a-zA-Z0-9]/g, '-')
    pdfMake.createPdf(dd).download(`Laporan-Keuangan-${periodSlug}.pdf`)
  }

  return (
    <button
      onClick={handleExport}
      className="h-10 px-4 rounded-xl border border-border bg-foreground text-sm font-medium text-background hover:bg-foreground/80 transition-colors inline-flex items-center gap-2 shrink-0 cursor-pointer no-print"
    >
      <Printer className="w-4 h-4" />
      Ekspor Laporan
    </button>
  )
}
