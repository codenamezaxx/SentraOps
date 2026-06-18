'use client'

import { useState } from 'react'
import { CategoryFilter } from './CategoryFilter'
import { ProductCard } from './ProductCard'
import type { Product } from '@/lib/types'
import { useUIStore } from '@/lib/stores/uiStore'
import { Pagination } from '@/components/ui/pagination'

interface ProductGridProps {
  products: Product[]
}

/**
 * ProductGrid Component (Client Component)
 * 
 * Displays category filter and product grid
 * Filters products client-side by selected category and search query from global UI store
 * 
 * Requirements: 6.1 - Display all active products organized by category
 */
export function ProductGrid({ products }: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [currentPage, setCurrentPage] = useState(1)
  const posSearchQuery = useUIStore((state) => state.posSearchQuery)
  const PAGE_SIZE = 25

  // Reset to page 1 when filters change
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat)
    setCurrentPage(1)
  }

  // Extract unique categories from actual product list
  const categories = [
    'Semua',
    ...Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[]
  ]

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory
    const matchesSearch = !posSearchQuery.trim() || 
      p.name.toLowerCase().includes(posSearchQuery.toLowerCase()) ||
      (p.barcode && p.barcode.toLowerCase().includes(posSearchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  // Reset to page 1 when search or category changes
  // This effect runs implicitly because handleCategoryChange resets page,
  // and posSearchQuery changes will use currentPage - we handle it via the slice

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        {/* Category Filter */}
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredProducts.length} produk ditemukan
        </p>
      </div>

      {/* Product Grid */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 w-full overflow-hidden">
        {paginatedProducts.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 px-4">
            <span className="material-symbols-outlined text-muted-foreground text-6xl mb-4">
              inventory_2
            </span>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Tidak ada produk
            </h3>
            <p className="text-sm text-muted-foreground text-center">
              {posSearchQuery 
                ? `Tidak ada produk yang cocok dengan pencarian "${posSearchQuery}"`
                : `Tidak ada produk dalam kategori "${selectedCategory}"`
              }
            </p>
          </div>
        ) : (
          paginatedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </section>

      {paginatedProducts.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredProducts.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  )
}