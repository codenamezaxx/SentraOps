'use client'

import { useState } from 'react'
import { useCartStore } from '@/lib/stores/cartStore'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { CreditCard, QrCode, MessageSquare, ChevronRight, CheckCircle2, Loader2 } from 'lucide-react'
import type { PaymentMethod } from '@/lib/types'

/**
 * PaymentDrawer Component (Client Component)
 *
 * Mobile bottom-sheet drawer for payment method selection and checkout
 * Displays cart breakdown: subtotal, total
 * Supports Cash, QRIS, and WhatsApp Invoice payment methods
 * Handles checkout API call with success/error feedback
 *
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 18.1, 18.3
 * Task: 10.1, 10.9
 */
export function PaymentDrawer() {
  const { items, total, clearCart } = useCartStore()
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [completed, setCompleted] = useState(false)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

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
      icon: CreditCard,
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

  const handlePaymentSelect = async (method: PaymentMethod) => {
    setSelectedMethod(method)
    setErrorMessage(null)
  }

  const handleConfirmPayment = async () => {
    if (!selectedMethod || isProcessing) return

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

      // Success: clear cart and show success state
      clearCart()
      setTransactionId(result.transaction_id)
      setCompleted(true)
      toast.success('Transaksi Berhasil!', {
        description: `ID Transaksi: ${result.transaction_id?.slice(0, 8)}...`,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan. Silakan coba lagi.'
      setErrorMessage(message)
      toast.error('Transaksi Gagal', {
        description: message,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    if (!isProcessing) {
      setIsOpen(false)
      // Reset state after drawer closes
      setTimeout(() => {
        setSelectedMethod(null)
        setCompleted(false)
        setTransactionId(null)
        setErrorMessage(null)
      }, 300)
    }
  }

  const handleRetry = () => {
    setErrorMessage(null)
    setSelectedMethod(null)
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetTrigger asChild>
        <button
          disabled={items.length === 0}
          className="w-full bg-primary hover:opacity-90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground font-semibold py-3 rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-sm h-12 disabled:cursor-not-allowed"
        >
          Bayar
          <ChevronRight className="w-4 h-4" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl max-h-[90vh] overflow-y-auto pb-8 px-4 pt-2 bg-surface-container-low border-outline-variant"
      >
        {completed && transactionId ? (
          /* Success State */
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-on-surface">
              Transaksi Berhasil!
            </h3>
            <p className="text-sm text-on-surface-variant text-center max-w-xs">
              Pembayaran telah diproses. ID transaksi:{' '}
              <span className="font-mono text-xs bg-surface-container px-2 py-1 rounded-lg">
                {transactionId.slice(0, 12)}...
              </span>
            </p>
            <Button
              onClick={handleClose}
              className="mt-4 bg-primary hover:opacity-90 text-primary-foreground rounded-xl h-12 px-8"
            >
              Selesai
            </Button>
          </div>
        ) : (
          <>
            <SheetHeader className="mb-4">
              <div className="w-10 h-1 bg-on-surface-variant/30 rounded-full mx-auto mb-3" />
              <SheetTitle className="text-lg font-bold text-on-surface text-center">
                Pembayaran
              </SheetTitle>
            </SheetHeader>

            {/* Cart Breakdown */}
            <div className="bg-surface-container rounded-xl p-4 mb-4 space-y-2">
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>Total Item</span>
                <span className="font-semibold text-on-surface">
                  {itemCount} item
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-outline-variant">
                <span className="font-semibold text-on-surface">
                  Total Pembayaran
                </span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-2 mb-4">
              <p className="text-sm font-semibold text-on-surface mb-2">
                Pilih Metode Pembayaran
              </p>
              {paymentOptions.map((option) => {
                const Icon = option.icon
                const isSelected = selectedMethod === option.method
                return (
                  <button
                    key={option.method}
                    onClick={() => handlePaymentSelect(option.method)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all h-12 ${
                      isSelected
                        ? 'border-primary bg-primary-container/20'
                        : 'border-outline-variant bg-surface-container-lowest hover:bg-surface-container'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isSelected
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-on-surface">
                        {option.label}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {option.description}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-muted text-accent border border-accent/20 rounded-xl p-3 mb-4">
                <p className="text-sm">
                  {errorMessage}
                </p>
                <button
                  onClick={handleRetry}
                  className="text-xs font-semibold text-primary mt-1 underline"
                >
                  Coba metode lain
                </button>
              </div>
            )}

            {/* Confirm Button */}
            <Button
              onClick={handleConfirmPayment}
              disabled={!selectedMethod || isProcessing}
              className="w-full bg-primary hover:opacity-90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground font-semibold py-3 rounded-xl h-12 disabled:cursor-not-allowed transition-all"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses...
                </span>
              ) : selectedMethod ? (
                `Konfirmasi Pembayaran ${paymentOptions.find((o) => o.method === selectedMethod)?.label}`
              ) : (
                'Pilih Metode Pembayaran'
              )}
            </Button>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}