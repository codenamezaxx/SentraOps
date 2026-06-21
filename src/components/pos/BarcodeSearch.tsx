'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useCartStore } from '@/lib/stores/cartStore'
import { useUIStore } from '@/lib/stores/uiStore'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { Barcode, X, Search, Package } from 'lucide-react'
import { formatCurrency, getProductImageUrl } from '@/lib/utils'
import { db } from '@/lib/offlineDb'
import { CameraScanner } from './CameraScanner'
import type { Product } from '@/lib/types'

export function BarcodeSearch({ products }: { products: Product[] }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<Product[]>([])
  const [showResults, setShowResults] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const { addItem } = useCartStore()
  const { setPosSearchQuery } = useUIStore()

  const addProduct = useCallback((product: Product) => {
    addItem(product)
    setInputValue('')
    setError(null)
    setResults([])
    setShowResults(false)
    setIsExpanded(false)
  }, [addItem])

  const searchOnline = useCallback(async (trimmed: string): Promise<boolean> => {
    try {
      const supabase = createClient()

      const { data: barcodeMatch, error: barcodeError } = await supabase
        .from('products')
        .select('*')
        .eq('barcode', trimmed)
        .maybeSingle()

      if (barcodeError) throw barcodeError

      if (barcodeMatch) {
        addProduct(barcodeMatch as Product)
        return true
      }

      const { data: nameMatches, error: nameError } = await supabase
        .from('products')
        .select('*')
        .ilike('name', `%${trimmed}%`)
        .order('name')

      if (nameError) throw nameError

      if (!nameMatches || nameMatches.length === 0) return false

      if (nameMatches.length === 1) {
        addProduct(nameMatches[0] as Product)
        return true
      }

      setResults(nameMatches as Product[])
      setShowResults(true)
      return true
    } catch {
      return false
    }
  }, [addProduct])

  const searchOffline = useCallback(async (trimmed: string): Promise<boolean> => {
    try {
      const allProducts = (await db.cached_products.toArray()) as Product[]

      const barcodeMatch = allProducts.find((p) => p.barcode === trimmed)
      if (barcodeMatch) {
        addProduct(barcodeMatch)
        return true
      }

      const lower = trimmed.toLowerCase()
      const nameMatches = allProducts.filter((p) =>
        p.name.toLowerCase().includes(lower)
      )

      if (nameMatches.length === 0) return false

      if (nameMatches.length === 1) {
        addProduct(nameMatches[0])
        return true
      }

      setResults(nameMatches)
      setShowResults(true)
      return true
    } catch {
      return false
    }
  }, [addProduct])

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim() || query.trim().length < 3) return

    setIsSearching(true)
    setError(null)
    setResults([])
    setShowResults(false)

    try {
      const trimmed = query.trim()
      const found = navigator.onLine
        ? await searchOnline(trimmed)
        : await searchOffline(trimmed)

      if (!found) {
        setError(`Produk "${trimmed}" tidak ditemukan.`)
      }
    } catch (err) {
      console.error('Search error:', err)
      setError('Terjadi kesalahan.')
    } finally {
      setIsSearching(false)
    }
  }, [searchOnline, searchOffline])

  useEffect(() => {
    setPosSearchQuery(inputValue)
    if (inputValue.length < 3) return
    const timer = setTimeout(() => handleSearch(inputValue), 800)
    return () => clearTimeout(timer)
  }, [inputValue, handleSearch, setPosSearchQuery])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) handleSearch(inputValue.trim())
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (inputValue.trim()) handleSearch(inputValue.trim())
    }
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
    setError(null)
    setResults([])
    setShowResults(false)
    if (!isExpanded) {
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
              placeholder="Cari barcode atau nama produk..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none h-10"
              autoFocus
              disabled={isSearching}
            />
            {isSearching ? (
              <div className="w-8 h-8 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <CameraScanner products={products} />
                <button
                  type="button"
                  onClick={toggleExpand}
                  className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </form>

          {error && (
            <div className="px-4 pb-2">
              <p className="text-xs text-accent flex items-center gap-1">
                <Package className="w-3 h-3" />
                {error}
              </p>
            </div>
          )}

          {showResults && results.length > 0 && (
            <div ref={resultsRef} className="border-t border-border max-h-48 overflow-y-auto">
              {results.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => { addProduct(product); setShowResults(false) }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                    {product.image_url ? (
                      <Image
                        src={getProductImageUrl(product.image_url) ?? ''}
                        alt={product.name}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-lg object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    ) : (
                      <Package className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {product.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(product.price)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={toggleExpand}
            className="flex-1 flex items-center gap-2 p-3 bg-card rounded-xl border border-border hover:bg-muted transition-colors text-sm text-muted-foreground h-12"
          >
            <Search className="w-4 h-4 text-muted-foreground" />
            <span>Cari produk via barcode atau nama...</span>
          </button>
          <CameraScanner products={products} />
        </div>
      )}
    </div>
  )
}
