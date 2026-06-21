'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useCartStore } from '@/lib/stores/cartStore'
import { createClient } from '@/lib/supabase/client'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import {
  CreditCard, QrCode, MessageSquare, CalendarDays,
  ChevronRight, CheckCircle2, Loader2, Banknote,
  Copy, Check, ExternalLink, Clock, XCircle,
} from 'lucide-react'
import type { PaymentMethod } from '@/lib/types'
import { formatCurrency, cn } from '@/lib/utils'
import { db } from '@/lib/offlineDb'
import { ReceiptActions } from '@/components/receipt/ReceiptActions'

interface PaymentOption {
  method: PaymentMethod
  label: string
  description: string
  icon: typeof CreditCard
  settingKey: string
}

interface PaymentDrawerProps {
  onOpenChange?: (open: boolean) => void
}

export function PaymentDrawer({ onOpenChange: onOpenChangeProp }: PaymentDrawerProps) {
  const { items, total, clearCart } = useCartStore()
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [cashAmount, setCashAmount] = useState<number>(0)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [completed, setCompleted] = useState(false)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [paidTotal, setPaidTotal] = useState(0)
  const [paidMethod, setPaidMethod] = useState<PaymentMethod | null>(null)

  // Snapshots for success view
  const [paidCash, setPaidCash] = useState(0)
  const [paidChange, setPaidChange] = useState(0)

  // Store info for receipt
  const [storeName, setStoreName] = useState('Toko Saya')
  const [receiptFooter, setReceiptFooter] = useState('')
  const [receiptSnapshot, setReceiptSnapshot] = useState<{ name: string; quantity: number; price: number }[]>([])

  // Cashier name for receipt
  const [cashierName, setCashierName] = useState('')
  const successViewRef = useRef<HTMLDivElement>(null)

  // Store payment methods (fetched from settings)
  const [enabledMethods, setEnabledMethods] = useState<Record<string, boolean> | null>(null)
  const [loadingMethods, setLoadingMethods] = useState(true)

  // Payment view state (QRIS / WA Invoice)
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)
  const [pollingStatus, setPollingStatus] = useState<'pending' | 'completed' | 'expired'>('pending')
  const [copied, setCopied] = useState(false)
  const pollingRef = useRef<ReturnType<typeof setInterval>>(undefined)

  // Responsive check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [])

  // Fetch store's enabled payment methods
  useEffect(() => {
    async function fetchPaymentMethods() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase
          .from('profiles')
          .select('store_id, name')
          .eq('auth_id', user.id)
          .single()

        if (!profile?.store_id) return
        if (profile?.name) setCashierName(profile.name)

        const { data: store } = await supabase
          .from('stores')
          .select('name, payment_methods, receipt_footer')
          .eq('id', profile.store_id)
          .single()

        if (store) {
          setStoreName(store.name)
          setReceiptFooter(store.receipt_footer || '')
        }

        if (store?.payment_methods) {
          setEnabledMethods(store.payment_methods as Record<string, boolean>)
        }
      } catch {
        // If fetch fails, show all methods as fallback
      } finally {
        setLoadingMethods(false)
      }
    }
    fetchPaymentMethods()
  }, [])

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const changeAmount = selectedMethod === 'cash' ? Math.max(0, cashAmount - total) : 0
  const isCashInsufficient = selectedMethod === 'cash' && cashAmount < total

  const paymentMethodConfig: PaymentOption[] = [
    {
      method: 'cash',
      label: 'Tunai',
      description: 'Bayar langsung dengan uang tunai',
      icon: Banknote,
      settingKey: 'cash',
    },
    {
      method: 'qris',
      label: 'QRIS',
      description: 'Scan kode QR untuk pembayaran',
      icon: QrCode,
      settingKey: 'qris',
    },
    {
      method: 'whatsapp_invoice',
      label: 'WhatsApp Invoice',
      description: 'Kirim tagihan via WhatsApp',
      icon: MessageSquare,
      settingKey: 'whatsapp',
    },
    {
      method: 'invoice',
      label: 'Buat Tagihan',
      description: 'Catat sebagai piutang pelanggan',
      icon: CalendarDays,
      settingKey: 'piutang',
    },
  ]

  const paymentOptions = useMemo(
    () => {
      // If settings haven't loaded yet, show all methods
      if (loadingMethods || !enabledMethods) return paymentMethodConfig
      return paymentMethodConfig.filter((opt) => enabledMethods[opt.settingKey] !== false)
    },
    [enabledMethods, loadingMethods]
  )

  const handlePaymentSelect = (method: PaymentMethod) => {
    setSelectedMethod(method)
    setErrorMessage(null)
    if (method !== 'cash') setCashAmount(0)
  }

  const isInvoiceInvalid = selectedMethod === 'invoice' && !customerName.trim()

  const startPolling = useCallback((txId: string) => {
    let attempts = 0
    const maxAttempts = 120 // 6 minutes at 3s interval
    pollingRef.current = setInterval(async () => {
      attempts++
      if (attempts >= maxAttempts) {
        if (pollingRef.current) clearInterval(pollingRef.current)
        setPollingStatus('expired')
        return
      }
      try {
        const res = await fetch(`/api/transactions/status?id=${txId}`)
        if (!res.ok) return
        const data = await res.json()
        if (data.status === 'completed') {
          if (pollingRef.current) clearInterval(pollingRef.current)
          setPollingStatus('completed')
          setTimeout(() => {
            setPaymentConfirmed(true)
            toast.success('Pembayaran Diterima!')
          }, 600)
        }
      } catch {
        // ignore polling errors
      }
    }, 3000)
  }, [])

  const handleConfirmPayment = async () => {
    if (!selectedMethod || isProcessing || isCashInsufficient || isInvoiceInvalid) return

    // Defense: check if method is enabled in store settings
    if (enabledMethods && enabledMethods[paymentMethodConfig.find((o) => o.method === selectedMethod)?.settingKey || ''] === false) {
      setErrorMessage('Metode pembayaran ini dinonaktifkan oleh pengaturan toko.')
      return
    }

    const snapshotTotal = total
    const snapshotCash = selectedMethod === 'cash' ? cashAmount : 0
    const snapshotChange = selectedMethod === 'cash' ? Math.max(0, cashAmount - total) : 0
    const snapshotMethod = selectedMethod

    setIsProcessing(true)
    setErrorMessage(null)

    // Offline queue: save locally instead of hitting API
    if (!navigator.onLine) {
      try {
        await db.offline_transactions_queue.add({
          items: items.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
          })),
          payment_method: selectedMethod,
          total_amount: snapshotTotal,
          ...(selectedMethod === 'cash' && {
            cash_amount: snapshotCash,
            cash_change: snapshotChange,
          }),
          ...(selectedMethod === 'invoice' && {
            customer_name: customerName.trim(),
            customer_phone: customerPhone.trim() || undefined,
          }),
          created_at: new Date().toISOString(),
          state: 'PENDING_SYNC',
        })

        setPaidTotal(snapshotTotal)
        setPaidCash(snapshotCash)
        setPaidChange(snapshotChange)
        setPaidMethod(snapshotMethod)
        setReceiptSnapshot(items.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })))
        clearCart()
        setCompleted(true)
        setPaymentConfirmed(true)
        toast.success('Koneksi terputus. Transaksi disimpan lokal & akan disinkronkan otomatis saat online.')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal menyimpan transaksi offline.'
        setErrorMessage(message)
        toast.error('Transaksi Gagal', { description: message })
      } finally {
        setIsProcessing(false)
      }
      return
    }

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
          })),
          payment_method: selectedMethod,
          ...(selectedMethod === 'invoice' && {
            customer_name: customerName.trim(),
            customer_phone: customerPhone.trim() || undefined,
          }),
          ...(selectedMethod === 'cash' && {
            cash_amount: snapshotCash,
            cash_change: snapshotChange,
          }),
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Transaksi gagal')
      }

      setPaidTotal(snapshotTotal)
      setPaidCash(snapshotCash)
      setPaidChange(snapshotChange)
      setPaidMethod(snapshotMethod)
      setTransactionId(result.transaction_id)
      setPaymentUrl(result.payment_url || null)

      if (selectedMethod === 'qris' || selectedMethod === 'whatsapp_invoice') {
        setReceiptSnapshot(items.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })))
        clearCart()
        setCompleted(true)
        if (result.transaction_id) startPolling(result.transaction_id)
      } else {
        setReceiptSnapshot(items.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })))
        clearCart()
        setCompleted(true)
        setPaymentConfirmed(true)
        toast.success('Transaksi Berhasil!')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan.'
      setErrorMessage(message)
      toast.error('Transaksi Gagal', { description: message })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleWAInvoice = () => {
    if (!transactionId) return
    const waUrl = `https://wa.me/?text=${encodeURIComponent(
      `Halo, saya ingin membayar tagihan SentraOps.\n\nTotal: ${formatCurrency(paidTotal)}\nLink pembayaran: ${paymentUrl || 'https://checkout.xendit.co/id/invoice/' + transactionId}\n\nSilakan klik link di atas untuk melanjutkan pembayaran.`
    )}`
    window.open(waUrl, '_blank')
  }

  const handleCopyLink = async () => {
    const link = paymentUrl || `https://checkout.xendit.co/id/invoice/${transactionId}`
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleOpenChange = (open: boolean) => {
    if (isProcessing) return
    setIsOpen(open)
    onOpenChangeProp?.(open)
    if (!open) {
      if (pollingRef.current) clearInterval(pollingRef.current)
      setTimeout(() => {
        setSelectedMethod(null)
        setCashAmount(0)
        setCustomerName('')
        setCustomerPhone('')
        setCompleted(false)
        setTransactionId(null)
        setPaymentUrl(null)
        setErrorMessage(null)
        setPaidTotal(0)
        setPaidMethod(null)
        setPaymentConfirmed(false)
        setPollingStatus('pending')
        setCopied(false)
      }, 300)
    }
  }

  const qrCodeUrl = paymentUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(paymentUrl)}`
    : null

  // --- Render helpers ---

  const renderPaymentView = () => {
    if (paidMethod === 'qris') {
      return (
        <div className="flex flex-col items-center py-4 gap-5">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <QrCode className="w-7 h-7 text-primary" />
          </div>
          <p className="text-base font-bold text-foreground text-center">Scan QRIS untuk Membayar</p>

          {qrCodeUrl && (
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCodeUrl} alt="QRIS Payment" className="w-60 h-60" />
            </div>
          )}

          <div className="bg-muted rounded-xl p-3 w-full space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold">{formatCurrency(paidTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ID Transaksi</span>
              <span className="font-mono font-medium">{transactionId?.slice(0, 8)}</span>
            </div>
          </div>

          {pollingStatus === 'pending' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Menunggu pembayaran...
            </div>
          )}
          {pollingStatus === 'expired' && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <Clock className="w-4 h-4" />
              Waktu pembayaran habis
            </div>
          )}
        </div>
      )
    }

    if (paidMethod === 'whatsapp_invoice') {
      return (
        <div className="flex flex-col items-center py-4 gap-5">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageSquare className="w-7 h-7 text-primary" />
          </div>
          <p className="text-base font-bold text-foreground text-center">Kirim Tagihan via WhatsApp</p>

          <div className="bg-muted rounded-xl p-4 w-full space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold">{formatCurrency(paidTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ID Transaksi</span>
              <span className="font-mono font-medium">{transactionId?.slice(0, 8)}</span>
            </div>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 pt-2 border-t border-border text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-left"
            >
              <code className="flex-1 truncate bg-background rounded-md px-2 py-1 border border-border">
                {paymentUrl ? paymentUrl.slice(0, 45) + '...' : '...'}
              </code>
              {copied ? <Check className="w-4 h-4 shrink-0 text-green-600" /> : <Copy className="w-4 h-4 shrink-0" />}
            </button>
          </div>

          <Button
            onClick={handleWAInvoice}
            className="w-full h-12 rounded-xl gap-2 font-bold"
          >
            <MessageSquare className="w-5 h-5" />
            Kirim ke WhatsApp
          </Button>

          {pollingStatus === 'pending' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Menunggu pembayaran...
            </div>
          )}
          {pollingStatus === 'expired' && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <Clock className="w-4 h-4" />
              Waktu pembayaran habis
            </div>
          )}
        </div>
      )
    }

    return null
  }

  const renderPaidSuccess = () => (
    <div ref={successViewRef} className="flex flex-col items-center py-8 gap-4">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-in zoom-in-95 duration-300">
        <CheckCircle2 className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-bold text-foreground text-center">
        Transaksi Berhasil!
      </h3>
      <div className="bg-muted rounded-xl p-4 w-full space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">ID Transaksi</span>
          <span className="font-mono font-medium">{transactionId?.slice(0, 8)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Belanja</span>
          <span className="font-bold text-foreground">{formatCurrency(paidTotal)}</span>
        </div>
        {paidMethod === 'cash' && (
          <>
            <div className="flex justify-between text-sm pt-2 border-t border-border">
              <span className="text-muted-foreground">Bayar Tunai</span>
              <span className="font-medium">{formatCurrency(paidCash)}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-primary/20">
              <span className="text-primary font-bold">Kembalian</span>
              <span className="font-bold text-primary">{formatCurrency(paidChange)}</span>
            </div>
          </>
        )}
        {paidMethod === 'qris' && (
          <div className="flex justify-between text-sm pt-2 border-t border-border">
            <span className="text-muted-foreground">Metode</span>
            <span className="font-medium">QRIS</span>
          </div>
        )}
        {paidMethod === 'whatsapp_invoice' && (
          <div className="flex justify-between text-sm pt-2 border-t border-border">
            <span className="text-muted-foreground">Metode</span>
            <span className="font-medium">WhatsApp Invoice</span>
          </div>
        )}
        {paidMethod === 'invoice' && (
          <div className="flex justify-between text-sm pt-2 border-t border-border">
            <span className="text-muted-foreground">Metode</span>
            <span className="font-medium">Tagihan (Piutang)</span>
          </div>
        )}
      </div>
      <ReceiptActions
        transactionId={transactionId || ''}
        items={receiptSnapshot}
        total={paidTotal}
        cashAmount={paidMethod === 'cash' ? paidCash : undefined}
        changeAmount={paidMethod === 'cash' ? paidChange : undefined}
        paymentMethodLabel={
          paidMethod === 'cash' ? 'Tunai' :
          paidMethod === 'qris' ? 'QRIS' :
          paidMethod === 'whatsapp_invoice' ? 'WhatsApp' :
          paidMethod === 'invoice' ? 'Tagihan' : ''
        }
        createdAt={new Date().toISOString()}
        storeName={storeName}
        receiptFooter={receiptFooter}
        cashierName={cashierName}
        pdfCaptureRef={successViewRef}
      />
      <Button
        onClick={() => handleOpenChange(false)}
        className="mt-2 bg-primary w-full h-12 rounded-xl"
      >
        Selesai
      </Button>
    </div>
  )

  const renderContent = () => {
    // Paid success (show after payment confirmed for QRIS/WA, or immediately for cash/invoice)
    if (completed && paymentConfirmed) {
      return renderPaidSuccess()
    }

    // Payment view (QR code / WA invoice link + polling)
    if (completed && !paymentConfirmed && (paidMethod === 'qris' || paidMethod === 'whatsapp_invoice')) {
      return renderPaymentView()
    }

    // Initial checkout form
    return (
      <>
        <div className="bg-muted rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Total Item</span>
            <span className="font-semibold text-foreground">{itemCount} item</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="font-semibold text-foreground">Total Pembayaran</span>
            <span className="text-xl font-bold text-primary">{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">Metode Pembayaran</p>
          <div className="grid grid-cols-1 gap-2">
            {paymentOptions.map((option) => {
              const Icon = option.icon
              const isSelected = selectedMethod === option.method
              return (
                <button
                  key={option.method}
                  onClick={() => handlePaymentSelect(option.method)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl border transition-all h-14 text-left",
                    isSelected ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-accent/30"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">{option.label}</p>
                    <p className="text-[10px] text-muted-foreground">{option.description}</p>
                  </div>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-primary" />}
                </button>
              )
            })}
          </div>
        </div>

        {selectedMethod === 'cash' && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Nominal Tunai</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">Rp</span>
                <Input
                  type="number"
                  value={cashAmount || ''}
                  onChange={(e) => setCashAmount(Number(e.target.value))}
                  className="h-12 pl-10 rounded-xl text-lg font-bold"
                  placeholder="0"
                  autoFocus
                />
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 flex justify-between items-center h-12">
              <span className="text-sm font-medium text-muted-foreground">Kembalian</span>
              <span className={cn("text-lg font-bold", changeAmount > 0 ? "text-primary" : "text-muted-foreground")}>
                {formatCurrency(changeAmount)}
              </span>
            </div>
          </div>
        )}

        {selectedMethod === 'invoice' && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Nama Pelanggan <span className="text-destructive">*</span></label>
              <Input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="h-12 rounded-xl"
                placeholder="Masukkan nama pelanggan"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Nomor WhatsApp (opsional)</label>
              <Input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="h-12 rounded-xl"
                placeholder="08xxxxxxx"
              />
            </div>
            <div className="bg-muted rounded-xl p-3 flex items-center gap-2 h-12">
              <CalendarDays className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground">
                Jatuh tempo dalam 7 hari sejak hari ini
              </span>
            </div>
          </div>
        )}

        {errorMessage && (
          <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
            {errorMessage}
          </p>
        )}

        <Button
          onClick={handleConfirmPayment}
          disabled={!selectedMethod || isProcessing || isCashInsufficient || isInvoiceInvalid}
          className="w-full h-12 rounded-xl mt-2 font-bold shadow-md active:scale-[0.98] transition-all bg-accent-blue text-accent-blue-foreground hover:bg-accent-blue/90"
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isCashInsufficient ? (
            'Tunai Tidak Cukup'
          ) : isInvoiceInvalid ? (
            'Nama Pelanggan Harus Diisi'
          ) : selectedMethod === 'invoice' ? (
            'Buat Tagihan'
          ) : (
            'Konfirmasi Pembayaran'
          )}
        </Button>
      </>
    )
  }

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>
          <Button
            disabled={items.length === 0}
            className="w-full h-12 rounded-xl font-bold gap-2 active:scale-95 shadow-md bg-accent-blue text-accent-blue-foreground hover:bg-accent-blue/90"
          >
            Bayar <ChevronRight className="w-4 h-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-2xl px-0 pt-2 border-t-0 shadow-2xl max-h-[90vh] flex flex-col">
          <div className="px-4 pb-2">
            <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-4" />
            <SheetTitle className="text-center font-bold text-xl">
              {completed ? 'Status Pembayaran' : 'Checkout'}
            </SheetTitle>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-10">
            {renderContent()}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          disabled={items.length === 0}
          className="w-full h-12 rounded-xl font-bold gap-2 active:scale-95 shadow-md bg-accent-blue text-accent-blue-foreground hover:bg-accent-blue/90"
        >
          Bayar <ChevronRight className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-105 rounded-2xl p-0 border-none shadow-2xl flex flex-col max-h-[90vh]">
        <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
          <DialogTitle className="text-2xl font-bold">
            {completed ? 'Status Pembayaran' : 'Pembayaran'}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  )
}
