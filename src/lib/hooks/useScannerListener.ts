'use client'

import { useEffect, useRef } from 'react'
import { useCartStore } from '@/lib/stores/cartStore'
import { toast } from 'sonner'
import type { Product } from '@/lib/types'

const SCAN_TIMEOUT_MS = 50  // max ms between keys to qualify as scanner input
const MIN_BARCODE_LENGTH = 4

/**
 * Global keystroke-buffer listener for hardware USB/Bluetooth barcode scanners.
 *
 * Scanners emulate rapid keyboard typing (delta < 50ms) followed by Enter.
 * Characters are accumulated in a buffer; on Enter the buffer is resolved
 * against the product list and added to the cart.
 *
 * Deliberately ignores key events when focus is inside a text input/textarea
 * so manual typing (BarcodeSearch, discount notes, etc.) is never polluted.
 */
export function useScannerListener(products: Product[]) {
  const addItem = useCartStore((s) => s.addItem)
  const bufferRef = useRef('')
  const lastTimeRef = useRef(0)
  const productMapRef = useRef<Map<string, Product>>(new Map())

  // Keep product lookup map in sync
  useEffect(() => {
    const map = new Map<string, Product>()
    for (const p of products) {
      if (p.barcode) map.set(p.barcode, p)
    }
    productMapRef.current = map
  }, [products])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is actively typing in a text field
      const target = e.target as HTMLElement
      const tag = target.tagName.toLowerCase()
      if (
        tag === 'input' ||
        tag === 'textarea' ||
        target.isContentEditable
      ) {
        // Clear buffer so stray scanner noise doesn't leak through inputs
        bufferRef.current = ''
        return
      }

      const now = Date.now()
      const delta = now - lastTimeRef.current
      lastTimeRef.current = now

      // Gap > threshold + < 5s = human typing, reset buffer
      if (delta > SCAN_TIMEOUT_MS && delta < 5000) {
        bufferRef.current = ''
      }

      // Enter = scan complete
      if (e.key === 'Enter') {
        if (bufferRef.current.length >= MIN_BARCODE_LENGTH) {
          e.preventDefault()
          e.stopPropagation()
          const barcode = bufferRef.current
          bufferRef.current = ''

          const product = productMapRef.current.get(barcode)
          if (product) {
            addItem(product)
            toast.success(`${product.name} ditambahkan!`, { duration: 2000 })
          } else {
            toast.error('Barcode tidak dikenali', { duration: 2000 })
          }
        }
        return
      }

      // Accumulate printable characters
      if (e.key.length === 1) {
        bufferRef.current += e.key
      }
    }

    window.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true })
  }, [addItem])
}
