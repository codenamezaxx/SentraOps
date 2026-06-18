'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useCartStore } from '@/lib/stores/cartStore'
import { useUIStore } from '@/lib/stores/uiStore'
import { createClient } from '@/lib/supabase/client'
import { Barcode, X, Search, Package } from 'lucide-react'
import type { Product } from '@/lib/types'

/**
 * BarcodeSearch Component (Client Component)
 *
 * Barcode input field for scanning or manual entry
 * Searches products by barcode via Supabase
 * Adds matching product to cart automatically
 * Displays "product not found" error when no match
 *
 * Requirements: 15.1, 15.2, 15.3, 15.4
 * Task: 9.6
 */
export function BarcodeSearch() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { addItem } = useCartStore()
  const { setPosSearchQuery } = useUIStore()

  const handleSearch = useCallback(async (barcode: string) => {
    if (!barcode.trim() || barcode.trim().length < 3) return

    setIsSearching(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data, error: searchError } = await supabase
        .from('products')
        .select('*')
        .eq('barcode', barcode.trim())
        .maybeSingle()

      if (searchError) {
        console.error('Barcode search error:', searchError)
        setError('Gagal mencari produk. Silakan coba lagi.')
        return
      }

      if (!data) {
        setError(`Produk dengan barcode "${barcode}" tidak ditemukan.`)
        return
      }

      // Product found - add to cart
      const product = data as Product
      addItem(product)
      setInputValue('')
      setError(null)

      // Collapse on success
      setIsExpanded(false)
    } catch (err) {
      console.error('Barcode search error:', err)
      setError('Terjadi kesalahan. Periksa koneksi Anda.')
    } finally {
      setIsSearching(false)
    }
  }, [addItem])

  // Auto-submit after a short delay for scanner input
  useEffect(() => {
    // Sync with global store for product grid filtering
    setPosSearchQuery(inputValue)

    if (inputValue.length < 3) return

    const timer = setTimeout(() => {
      handleSearch(inputValue)
    }, 800)

    return () => clearTimeout(timer)
  }, [inputValue, handleSearch, setPosSearchQuery])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      handleSearch(inputValue.trim())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (inputValue.trim()) {
        handleSearch(inputValue.trim())
      }
    }
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
    setError(null)
    if (!isExpanded) {
      // Focus input after expansion
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  return (
    <div className="relative">
      {isExpanded ? (
        <div className="bg-card rounded-xl border border-border shadow-sm">
          <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Barcode className="w-4 h-4 text-primary" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Scan atau ketik barcode..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none h-10"
              autoFocus
              disabled={isSearching}
            />
            {isSearching ? (
              <div className="w-8 h-8 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <button
                type="button"
                onClick={toggleExpand}
                className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Error Message */}
          {error && (
            <div className="px-4 pb-2">
              <p className="text-xs text-accent flex items-center gap-1">
                <Package className="w-3 h-3" />
                {error}
              </p>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={toggleExpand}
          className="w-full flex items-center gap-2 p-3 bg-card rounded-xl border border-border hover:bg-muted transition-colors text-sm text-muted-foreground h-12"
        >
          <Search className="w-4 h-4 text-muted-foreground" />
          <span>Cari produk via barcode...</span>
        </button>
      )}
    </div>
  )
}