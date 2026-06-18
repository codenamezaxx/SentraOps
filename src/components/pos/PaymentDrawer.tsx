'use client'

import { useState, useEffect } from 'react'
import { useCartStore } from '@/lib/stores/cartStore'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { CreditCard, QrCode, MessageSquare, ChevronRight, CheckCircle2, Loader2, Banknote } from 'lucide-react'
import type { PaymentMethod } from '@/lib/types'
import { formatCurrency, cn } from '@/lib/utils'

/**
 * PaymentDrawer Component (Client Component)
 *
 * Responsive payment interface: 
 * - Mobile: bottom-sheet drawer (Requirement 13.5)
 * - Desktop: center dialog modal (Requirement 13.5)
 * 
 * Features:
 * - Payment method selection (Requirement 8.1, 8.2)
 * - Cash amount input & change calculation
 * - Checkout API integration (Requirement 8.3, 8.4, 8.5)
 */
interface PaymentDrawerProps {
  onOpenChange?: (open: boolean) => void
}

export function PaymentDrawer({ onOpenChange: onOpenChangeProp }: PaymentDrawerProps) {
  const { items, total, clearCart } = useCartStore()
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [cashAmount, setCashAmount] = useState<number>(0)
  const [completed, setCompleted] = useState(false)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [paidTotal, setPaidTotal] = useState(0)
  const [paidCash, setPaidCash] = useState(0)
  const [paidChange, setPaidChange] = useState(0)
  const [paidMethod, setPaidMethod] = useState<PaymentMethod | null>(null)

  // Responsive check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const changeAmount = selectedMethod === 'cash' ? Math.max(0, cashAmount - total) : 0
  const isCashInsufficient = selectedMethod === 'cash' && cashAmount < total

  const paymentOptions: {
    method: PaymentMethod
    label: string
    description: string
    icon: typeof CreditCard
  }[] = [
    {
      method: 'cash',
      label: 'Tunai',
      description: 'Bayar langsung dengan uang tunai',
      icon: Banknote,
    },
    {
      method: 'qris',
      label: 'QRIS',
      description: 'Scan kode QR untuk pembayaran',
      icon: QrCode,
    },
    {
      method: 'whatsapp_invoice',
      label: 'WhatsApp Invoice',
      description: 'Kirim tagihan via WhatsApp',
      icon: MessageSquare,
    },
  ]

  const handlePaymentSelect = (method: PaymentMethod) => {
    setSelectedMethod(method)
    setErrorMessage(null)
    if (method !== 'cash') setCashAmount(0)
  }

  const handleConfirmPayment = async () => {
    if (!selectedMethod || isProcessing || isCashInsufficient) return

    // Snapshot values before clearCart zeros them
    const snapshotTotal = total
    const snapshotCash = selectedMethod === 'cash' ? cashAmount : 0
    const snapshotChange = selectedMethod === 'cash' ? Math.max(0, cashAmount - total) : 0
    const snapshotMethod = selectedMethod

    setIsProcessing(true)
    setErrorMessage(null)

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
      clearCart()
      setTransactionId(result.transaction_id)
      setCompleted(true)
      toast.success('Transaksi Berhasil!')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan.'
      setErrorMessage(message)
      toast.error('Transaksi Gagal', { description: message })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (isProcessing) return
    setIsOpen(open)
    onOpenChangeProp?.(open)
    if (!open) {
      setTimeout(() => {
        setSelectedMethod(null)
        setCashAmount(0)
        setCompleted(false)
        setTransactionId(null)
        setErrorMessage(null)
        setPaidTotal(0)
        setPaidCash(0)
        setPaidChange(0)
        setPaidMethod(null)
      }, 300)
    }
  }

  const Content = (
    <div className="flex flex-col gap-4">
      {completed && transactionId ? (
        <div className="flex flex-col items-center justify-center py-8 gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-foreground text-center">
            Transaksi Berhasil!
          </h3>
          <div className="bg-muted rounded-xl p-4 w-full space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ID Transaksi</span>
              <span className="font-mono font-medium">{transactionId.slice(0, 8)}</span>
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
          </div>
          <Button
            onClick={() => handleOpenChange(false)}
            className="mt-2 bg-primary w-full h-12 rounded-xl"
          >
            Selesai
          </Button>
        </div>
      ) : (
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

          {errorMessage && (
            <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
              {errorMessage}
            </p>
          )}

          <Button
            onClick={handleConfirmPayment}
            disabled={!selectedMethod || isProcessing || isCashInsufficient}
            className="w-full h-12 rounded-xl mt-2 font-bold shadow-md active:scale-[0.98] transition-all"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isCashInsufficient ? (
              'Tunai Tidak Cukup'
            ) : (
              'Konfirmasi Pembayaran'
            )}
          </Button>
        </>
      )}
    </div>
  )

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>
          <Button 
            disabled={items.length === 0}
            className="w-full h-12 rounded-xl font-bold gap-2 active:scale-95 shadow-md"
          >
            Bayar <ChevronRight className="w-4 h-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-10 pt-2 border-t-0 shadow-2xl">
          <SheetHeader className="mb-4">
            <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-4" />
            <SheetTitle className="text-center font-bold text-xl">Checkout</SheetTitle>
          </SheetHeader>
          {Content}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          disabled={items.length === 0}
          className="w-full h-12 rounded-xl font-bold gap-2 active:scale-95 shadow-md"
        >
          Bayar <ChevronRight className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-105 rounded-2xl p-6 border-none shadow-2xl overflow-hidden">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-2xl font-bold">Pembayaran</DialogTitle>
        </DialogHeader>
        {Content}
      </DialogContent>
    </Dialog>
  )
}