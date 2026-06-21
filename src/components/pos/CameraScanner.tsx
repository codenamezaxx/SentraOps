'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Camera } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useCartStore } from '@/lib/stores/cartStore'
import { toast } from 'sonner'
import type { Product } from '@/lib/types'

interface CameraScannerProps {
  products: Product[]
}

export function CameraScanner({ products }: CameraScannerProps) {
  const [open, setOpen] = useState(false)
  interface ScannerInstance {
  stop: () => Promise<void>
  clear: () => void
}

const scannerRef = useRef<ScannerInstance | null>(null)

async function stopAndClear(scanner: ScannerInstance) {
  try {
    await scanner.stop()
  } catch {
    /* stop may fail if already stopped */
  }
  try {
    scanner.clear()
  } catch {
    /* ignore */
  }
}
  const productMapRef = useRef<Map<string, Product>>(new Map())
  const { addItem } = useCartStore()
  const scanningRef = useRef(false)

  // Build barcode → Product lookup map
  useEffect(() => {
    const map = new Map<string, Product>()
    for (const p of products) {
      if (p.barcode) map.set(p.barcode, p)
    }
    productMapRef.current = map
  }, [products])

  // Audio beep via Web Audio API
  const playBeep = useCallback(() => {
    try {
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 1200
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.12)
    } catch {
      // Web Audio API unavailable — silent fail
    }
  }, [])

  // Handle a successful scan
  const handleScan = useCallback(
    (decodedText: string) => {
      // Prevent duplicate triggers while processing
      if (scanningRef.current) return
      scanningRef.current = true

      const product = productMapRef.current.get(decodedText)
      if (product) {
        playBeep()
        addItem(product)
        setOpen(false)
        toast.success(`${product.name} berhasil ditambahkan!`)
      } else {
        toast.error('Barcode tidak dikenali')
        // Allow re-scan after a short cooldown
        setTimeout(() => {
          scanningRef.current = false
        }, 1500)
      }
    },
    [playBeep, addItem]
  )

  // Start / stop camera scanner
  useEffect(() => {
    if (!open) {
      if (scannerRef.current) {
        const s = scannerRef.current
        scannerRef.current = null
        scanningRef.current = false
        stopAndClear(s)
      } else {
        scanningRef.current = false
      }
      return
    }

    let cancelled = false

    const init = async () => {
      try {
        const [{ Html5Qrcode }, { Html5QrcodeSupportedFormats }] = await Promise.all([
          import('html5-qrcode'),
          import('html5-qrcode'),
        ])

        // formatsToSupport goes in constructor config, not start() config
        const scanner = new Html5Qrcode('camera-reader', {
          verbose: false,
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.CODE_128,
          ],
        })
        scannerRef.current = scanner

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 20, qrbox: { width: 250, height: 150 } },
          (decodedText: string) => {
            if (!cancelled) handleScan(decodedText)
          },
          () => {
            /* scan error — ignore */
          }
        )
      } catch (err: unknown) {
        if (cancelled) return
        const msg =
          err instanceof Error && err.name === 'NotAllowedError'
            ? 'Izin kamera ditolak. Izinkan akses kamera di pengaturan browser.'
            : 'Gagal mengakses kamera. Periksa izin atau coba browser lain.'
        toast.error(msg)
      }
    }

    init()

    return () => {
      cancelled = true
      if (scannerRef.current) {
        const s = scannerRef.current
        scannerRef.current = null
        scanningRef.current = false
        stopAndClear(s)
      }
    }
  }, [open, handleScan])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-12 w-12 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors shrink-0 cursor-pointer"
        title="Pindai barcode"
      >
        <Camera className="w-5 h-5 text-muted-foreground" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="sm:max-w-md rounded-2xl bg-card p-0 gap-0 border-border"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">Pindai Barcode</DialogTitle>
          {/* Custom header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-base font-bold text-foreground">Pindai Barcode</h2>
          </div>

          {/* Camera viewport */}
          <div className="p-4">
            <div
              id="camera-reader"
              className="w-full aspect-square max-w-sm mx-auto rounded-xl overflow-hidden bg-muted [&_video]:rounded-xl"
            />
            <p className="text-xs text-muted-foreground text-center mt-3">
              Arahkan kamera ke barcode produk
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
