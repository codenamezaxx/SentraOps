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
  const tempContainerRef = useRef<HTMLDivElement | null>(null)
  const [isPdfLoading, setIsPdfLoading] = useState(false)

  const handleThermalPrint = useCallback(() => {
    window.print()
  }, [])

  const handlePdfDownload = useCallback(async () => {
    if (!receiptRef.current || isPdfLoading) return

    setIsPdfLoading(true)
    try {
      const [html2canvasModule, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])
      const html2canvas = html2canvasModule.default

      // Clone receipt content into a temp offscreen container.
      // Must remove "hidden" class from clone so html2canvas can render it
      // (original receipt uses hidden/print:block for thermal print only).
      const clone = receiptRef.current.cloneNode(true) as HTMLElement
      clone.classList.remove('hidden')
      clone.style.display = 'block'
      clone.setAttribute('data-receipt-clone', 'true')
      const tempContainer = document.createElement('div')
      tempContainer.style.cssText = 'position:fixed;left:-9999px;top:0;width:80mm;z-index:-1;background:#ffffff;color:#000000;'
      tempContainer.appendChild(clone)
      document.body.appendChild(tempContainer)
      tempContainerRef.current = tempContainer

      const canvas = await html2canvas(clone, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        onclone: (doc) => {
          // html2canvas v1.4.1 can't parse oklch()/lab() used by Tailwind v4
          // Override all CSS custom properties to hex in the cloned document
          const receiptClone = doc.querySelector('[data-receipt-clone]') as HTMLElement | null
          if (receiptClone) receiptClone.style.display = 'block'
          const style = doc.createElement('style')
          style.textContent = `
            :root {
              --background: #ffffff !important;
              --foreground: #000000 !important;
              --border: #e5e7eb !important;
              --primary: #ea580c !important;
              --muted: #f4f4f5 !important;
              --card: #ffffff !important;
              --accent: #fff7ed !important;
              --accent-blue: #3b82f6 !important;
              --ring: #ea580c !important;
              --surface: #fafafa !important;
              --surface-container: #f4f4f5 !important;
              --on-surface: #000000 !important;
              --on-surface-variant: #52525b !important;
              --muted-foreground: #71717a !important;
              --secondary: #52525b !important;
              --destructive: #ef4444 !important;
              --input: #e4e4e7 !important;
              --chart-1: #ea580c !important;
              --chart-2: #0891b2 !important;
              --chart-3: #7c3aed !important;
              --chart-4: #f59e0b !important;
              --chart-5: #10b981 !important;
              --sidebar: #f8fafc !important;
              --sidebar-foreground: #000000 !important;
              --sidebar-primary: #ea580c !important;
              --sidebar-accent: #f1f5f9 !important;
              --sidebar-border: #e2e8f0 !important;
              --sidebar-ring: #ea580c !important;
              --error: #ef4444 !important;
              --tertiary: #d97706 !important;
              --outline-variant: #e5e7eb !important;
              --primary-container: #fff7ed !important;
              --on-background: #000000 !important;
              --on-primary: #ffffff !important;
              --on-primary-container: #431407 !important;
              --accent-blue-foreground: #ffffff !important;
              --popover: #ffffff !important;
              --popover-foreground: #000000 !important;
              --primary-foreground: #ffffff !important;
              --secondary-foreground: #ffffff !important;
              --card-foreground: #000000 !important;
            }
          `
          doc.head.appendChild(style)
        },
      })
      const imgData = canvas.toDataURL('image/png')
      const imgWidth = 210 // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      const pdf = new jsPDF('p', 'mm', 'a4')
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      pdf.save(`SentraOps-Receipt-${transactionId.slice(0, 8)}.pdf`)
    } catch (err) {
      console.error('PDF generation failed:', err)
      toast.error('Gagal membuat PDF', {
        description: 'Terjadi kesalahan saat membuat PDF. Silakan coba lagi.',
      })
    } finally {
      // Clean up temp container
      if (tempContainerRef.current) {
        tempContainerRef.current.remove()
        tempContainerRef.current = null
      }
      setIsPdfLoading(false)
    }
  }, [transactionId, isPdfLoading])

  const formattedDate = new Date(createdAt).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

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
              {items.map((item) => (
                <tr key={item.name}>
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
