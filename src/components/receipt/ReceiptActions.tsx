'use client'

import { useRef, useCallback } from 'react'
import { Printer, FileDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

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
}: ReceiptActionsProps) {
  const receiptRef = useRef<HTMLDivElement>(null)

  const handleThermalPrint = useCallback(() => {
    window.print()
  }, [])

  const handlePdfDownload = useCallback(async () => {
    if (!receiptRef.current) return

    const [html2canvasModule, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ])
    const html2canvas = html2canvasModule.default

    const canvas = await html2canvas(receiptRef.current, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
    })
    const imgData = canvas.toDataURL('image/png')
    const imgWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    const pdf = new jsPDF('p', 'mm', 'a4')
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
    pdf.save(`SentraOps-Receipt-${transactionId.slice(0, 8)}.pdf`)
  }, [transactionId])

  const formattedDate = new Date(createdAt).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  // Build receipt items lines
  const itemLines = items.map(
    (item) =>
      `${String(item.quantity).padStart(3)}  ${item.name.padEnd(18).slice(0, 18)} ${formatCurrency(item.price).padStart(10)}`
  )

  // Receipt width for printing
  const receiptWidth = '80mm'

  return (
    <>
      {/* ── Action Buttons ── */}
      <div className="flex gap-3 w-full pt-4 border-t border-border">
        <button
          onClick={handleThermalPrint}
          className="flex-1 h-12 rounded-xl bg-orange-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-orange-700 transition-colors active:scale-[0.98] cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          Cetak Thermal
        </button>
        <button
          onClick={handlePdfDownload}
          className="flex-1 h-12 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-sm flex items-center justify-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors active:scale-[0.98] cursor-pointer"
        >
          <FileDown className="w-4 h-4" />
          Unduh PDF
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
        {/* Force white background for html2canvas capture */}
        <div style={{ background: '#ffffff', color: '#000000', padding: '8px 4px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '6px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{storeName}</div>
            <div style={{ fontSize: '11px', fontWeight: 'bold' }}>STRUK BELANJA</div>
            <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />
          </div>

          {/* Items */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '4px' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', fontSize: '9px', borderBottom: '1px solid #000', paddingBottom: '2px' }}>Qty</th>
                <th style={{ textAlign: 'left', fontSize: '9px', borderBottom: '1px solid #000', paddingBottom: '2px' }}>Item</th>
                <th style={{ textAlign: 'right', fontSize: '9px', borderBottom: '1px solid #000', paddingBottom: '2px' }}>Harga</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i}>
                  <td style={{ textAlign: 'left', paddingRight: '4px', whiteSpace: 'nowrap' }}>{item.quantity}x</td>
                  <td style={{ textAlign: 'left', paddingRight: '4px', wordBreak: 'break-word' }}>{item.name}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{formatCurrency(item.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ borderTop: '1px dashed #000', margin: '2px 0 4px' }} />

          {/* Summary */}
          <div style={{ marginBottom: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total</span>
              <span style={{ fontWeight: 'bold' }}>{formatCurrency(total)}</span>
            </div>
            {cashAmount !== undefined && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Bayar</span>
                <span>{formatCurrency(cashAmount)}</span>
              </div>
            )}
            {changeAmount !== undefined && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2563eb' }}>
                <span>Kembali</span>
                <span>{formatCurrency(changeAmount)}</span>
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px dashed #000', margin: '2px 0 4px' }} />

          {/* Meta */}
          <div style={{ marginBottom: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Metode</span>
              <span>{paymentMethodLabel}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>ID</span>
              <span style={{ fontSize: '8px' }}>{transactionId.slice(0, 12)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Waktu</span>
              <span>{formattedDate}</span>
            </div>
          </div>

          <div style={{ borderTop: '1px dashed #000', margin: '2px 0 4px' }} />

          {/* Footer from store settings */}
          {receiptFooter && (
            <div style={{ textAlign: 'center', fontSize: '9px', marginBottom: '4px', whiteSpace: 'pre-line' }}>
              {receiptFooter}
            </div>
          )}

          {/* Thank you */}
          <div style={{ textAlign: 'center', fontSize: '10px', fontWeight: 'bold' }}>
            Terima Kasih!
          </div>
        </div>
      </div>
    </>
  )
}
