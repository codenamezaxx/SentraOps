'use client'

import { useRef, useCallback, useState } from 'react'
import { Printer, FileDown, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

export interface ReceiptItem {
  name: string
  quantity: number
  price: number
}

export interface ReceiptActionsProps {
  transactionId: string
  items: ReceiptItem[]
  total: number
  cashAmount?: number
  changeAmount?: number
  paymentMethodLabel: string
  createdAt: string
  storeName: string
  receiptFooter: string
  cashierName?: string
  /** @deprecated No longer used — PDF now renders programmatically via jsPDF */
  pdfCaptureRef?: React.RefObject<HTMLDivElement | null>
}

export function ReceiptActions({
  transactionId,
  items,
  total,
  cashAmount,
  changeAmount,
  paymentMethodLabel,
  createdAt,
  storeName,
  receiptFooter,
  cashierName,
}: ReceiptActionsProps) {
  const receiptRef = useRef<HTMLDivElement>(null)
  const [isPdfLoading, setIsPdfLoading] = useState(false)

  const handleThermalPrint = useCallback(() => {
    if (!receiptRef.current) return
    // Print only the receipt content in a dedicated iframe,
    // isolated from page CSS so no extra HTML bleeds into the print.
    const iframe = document.createElement('iframe')
    iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:80mm;height:1px;border:none'
    document.body.appendChild(iframe)
    const doc = iframe.contentDocument || iframe.contentWindow?.document
    if (!doc) {
      // Fallback
      window.print()
      iframe.remove()
      return
    }
    doc.open()
    doc.write(`
      <html>
        <head>
          <style>
            @page { margin: 0; }
            body { margin:0; padding:10px 6px; background:#fff; color:#000;
                   font-family:monospace; font-size:10px; line-height:1.3;
                   width:80mm; }
            table { width:100%; border-collapse:collapse; }
            td { padding:0 6px 2px 0; vertical-align:top; }
            .hidden { display:none; }
          </style>
        </head>
        <body>${receiptRef.current.innerHTML}</body>
      </html>
    `)
    doc.close()
    // Focus the iframe so the print dialog targets it
    iframe.contentWindow?.focus()
    iframe.contentWindow?.print()
    // Remove iframe after print dialog closes
    iframe.contentWindow?.addEventListener('afterprint', () => iframe.remove())
    // Fallback cleanup
    setTimeout(() => { if (iframe.parentNode) iframe.remove() }, 10000)
  }, [])

  const handlePdfDownload = useCallback(async () => {
    if (isPdfLoading) return

    setIsPdfLoading(true)
    try {
      const { jsPDF } = await import('jspdf')

      // ── Receipt-style PDF, same layout as thermal print ──
      // 80mm wide × up to 297mm tall (A4 height)
      const doc = new jsPDF({ unit: 'mm', format: [80, 297] })
      const LM = 4     // left margin
      const RM = 4     // right margin
      const CW = 72    // content width (80 - LM - RM)
      const RX = 76    // right x (80 - RM)

      let y = 12

      const dash = () => {
        doc.setDrawColor(136, 136, 136)
        doc.setLineWidth(0.3)
        doc.setLineDashPattern([1.5, 1.5], 0)
        doc.line(LM, y, RX, y)
        doc.setLineDashPattern([], 0)
      }

      const ensureSpace = (mm: number) => {
        if (y + mm > 282) { doc.addPage(); y = 10 }
      }

      // ── Header ──
      doc.setFont('Courier', 'bold')
      doc.setFontSize(12)
      doc.text(storeName, LM + CW / 2, y, { align: 'center' })
      y += 5
      doc.setFont('Courier', 'normal')
      doc.setFontSize(10)
      doc.text('STRUK BELANJA', LM + CW / 2, y, { align: 'center' })
      y += 4
      dash(); y += 4

      // ── Items ──
      doc.setFontSize(10)
      for (const item of items) {
        const lineTotal = item.quantity * item.price
        ensureSpace(8)

        // "2x Nama Item" (left)  //  RpXX.XXX (right)
        doc.setFont('Courier', 'normal')
        doc.text(`${item.quantity}x ${item.name}`, LM, y)
        doc.setFont('Courier', 'bold')
        doc.text(formatCurrency(lineTotal), RX, y, { align: 'right' })
        y += 3.5

        // Unit price sub-text
        doc.setFont('Courier', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(102, 102, 102)
        doc.text(`@ ${formatCurrency(item.price)}`, LM + 3, y)
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(10)
        y += 4
      }

      // ── Summary ──
      ensureSpace(3)
      dash(); y += 5

      doc.setFont('Courier', 'bold')
      doc.setFontSize(11)
      doc.text('Total', LM, y)
      doc.text(formatCurrency(total), RX, y, { align: 'right' })
      y += 5

      doc.setFont('Courier', 'normal')
      doc.setFontSize(10)
      if (cashAmount !== undefined) {
        ensureSpace(4)
        doc.text('Tunai', LM, y)
        doc.text(formatCurrency(cashAmount), RX, y, { align: 'right' })
        y += 4
      }
      if (changeAmount !== undefined) {
        ensureSpace(4)
        doc.setTextColor(37, 99, 235)
        doc.text('Kembali', LM, y)
        doc.text(formatCurrency(changeAmount), RX, y, { align: 'right' })
        doc.setTextColor(0, 0, 0)
        y += 4
      }

      // ── Meta ──
      ensureSpace(3)
      dash(); y += 5

      doc.setFontSize(9)
      doc.text(`Metode  : ${paymentMethodLabel}`, LM, y); y += 3.5
      if (cashierName) {
        doc.text(`Kasir   : ${cashierName}`, LM, y); y += 3.5
      }
      doc.text(`ID      : ${transactionId.slice(0, 8)}`, LM, y); y += 3.5

      const formattedDate = new Date(createdAt).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
      doc.text(`Tanggal : ${formattedDate}`, LM, y); y += 3.5

      // ── Footer ──
      ensureSpace(3)
      dash(); y += 5

      if (receiptFooter) {
        doc.setFontSize(9)
        doc.setTextColor(85, 85, 85)
        const footerLines = doc.splitTextToSize(receiptFooter, CW)
        for (const line of footerLines) {
          ensureSpace(4)
          doc.text(line, LM + CW / 2, y, { align: 'center' })
          y += 3.5
        }
        doc.setTextColor(0, 0, 0)
        y += 2
      }

      ensureSpace(6)
      doc.setFont('Courier', 'bold')
      doc.setFontSize(11)
      doc.text('Terima Kasih!', LM + CW / 2, y, { align: 'center' })
      y += 5

      // ── Save ──
      doc.save(`SentraOps-Receipt-${transactionId.slice(0, 8)}.pdf`)
    } catch (err) {
      console.error('PDF generation failed:', err)
      toast.error('Gagal membuat PDF', {
        description: 'Terjadi kesalahan saat membuat PDF. Silakan coba lagi.',
      })
    } finally {
      setIsPdfLoading(false)
    }
  }, [transactionId, isPdfLoading, storeName, items, total, cashAmount, changeAmount, paymentMethodLabel, cashierName, receiptFooter, createdAt])

  const formattedDate = new Date(createdAt).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  // Receipt width for printing
  const receiptWidth = '80mm'

  return (
    <>
      {/* ── Action Buttons (hidden on print) ── */}
      <div className="flex gap-3 w-full pt-4 border-t border-border print:hidden">
        <button
          onClick={handleThermalPrint}
          className="flex-1 h-12 rounded-xl bg-orange-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-orange-700 transition-colors active:scale-[0.98] cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          Cetak Thermal
        </button>
        <button
          onClick={handlePdfDownload}
          disabled={isPdfLoading}
          className="flex-1 h-12 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-sm flex items-center justify-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPdfLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FileDown className="w-4 h-4" />
          )}
          {isPdfLoading ? 'Memproses...' : 'Unduh PDF'}
        </button>
      </div>

      {/* ── Hidden Receipt Layout (visible only during print) ── */}
      <div
        ref={receiptRef}
        className="hidden print:block"
        style={{
          width: receiptWidth,
          margin: '0 auto',
          background: 'white !important',
          color: 'black !important',
          fontFamily: 'monospace',
          fontSize: '10px',
          lineHeight: '1.3',
          padding: '0',
        }}
      >
        {/* Force white background for print */}
        <div style={{ background: '#ffffff', color: '#000000', padding: '10px 6px' }}>
          {/* ── Header ── */}
          <div style={{ textAlign: 'center', marginBottom: '6px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '13px', letterSpacing: '0.5px', marginBottom: '2px' }}>{storeName}</div>
            <div style={{ fontSize: '10px', letterSpacing: '2px' }}>STRUK BELANJA</div>
            <div style={{ borderTop: '1px dashed #888', margin: '8px 0 6px' }} />
          </div>

          {/* ── Items ── */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6px' }}>
            <tbody>
              {items.map((item) => {
                const lineTotal = item.quantity * item.price
                return (
                  <tr key={item.name}>
                    <td style={{ textAlign: 'left', paddingRight: '6px', verticalAlign: 'top', whiteSpace: 'nowrap', fontSize: '10px' }}>
                      {item.quantity}x
                    </td>
                    <td style={{ textAlign: 'left', paddingRight: '6px', verticalAlign: 'top', wordBreak: 'break-word', fontSize: '10px' }}>
                      <div>{item.name}</div>
                      <div style={{ fontSize: '8px', color: '#666' }}>@ {formatCurrency(item.price)}</div>
                    </td>
                    <td style={{ textAlign: 'right', verticalAlign: 'top', whiteSpace: 'nowrap', fontSize: '10px', fontWeight: 'bold' }}>
                      {formatCurrency(lineTotal)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div style={{ borderTop: '1px dashed #888', margin: '4px 0 6px' }} />

          {/* ── Summary ── */}
          <div style={{ marginBottom: '4px', fontSize: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
              <span>Total</span>
              <span style={{ fontWeight: 'bold', fontSize: '11px' }}>{formatCurrency(total)}</span>
            </div>
            {cashAmount !== undefined && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0' }}>
                <span>Tunai</span>
                <span>{formatCurrency(cashAmount)}</span>
              </div>
            )}
            {changeAmount !== undefined && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0', color: '#2563eb' }}>
                <span>Kembali</span>
                <span>{formatCurrency(changeAmount)}</span>
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px dashed #888', margin: '6px 0' }} />

          {/* ── Meta ── */}
          <div style={{ marginBottom: '4px', fontSize: '9px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0' }}>
              <span>Metode</span>
              <span>{paymentMethodLabel}</span>
            </div>
            {cashierName && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0' }}>
                <span>Kasir</span>
                <span>{cashierName}</span>
              </div>
            )}
            <div style={{ padding: '1px 0' }}>
              <span>ID: {transactionId.slice(0, 8)}</span>
            </div>
            <div style={{ padding: '1px 0', color: '#555' }}>
              <span>{formattedDate}</span>
            </div>
          </div>

          <div style={{ borderTop: '1px dashed #888', margin: '6px 0' }} />

          {/* ── Footer ── */}
          {receiptFooter && (
            <div style={{ textAlign: 'center', fontSize: '9px', marginBottom: '4px', color: '#555', whiteSpace: 'pre-line' }}>
              {receiptFooter}
            </div>
          )}

          <div style={{ textAlign: 'center', fontSize: '11px', fontWeight: 'bold', marginTop: '4px' }}>
            Terima Kasih!
          </div>
        </div>
      </div>
    </>
  )
}
