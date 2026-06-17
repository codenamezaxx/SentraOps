'use client'

import { useState } from 'react'
import { CategoryFilter } from './CategoryFilter'
import { ProductCard } from './ProductCard'
import type { Product } from '@/lib/types'

interface ProductGridProps {
  products: Product[]
}

/**
 * ProductGrid Component (Client Component)
 * 
 * Displays category filter and product grid
 * Filters products client-side by selected category
 * 
 * Requirements: 6.1 - Display all active products organized by category
 */
export function ProductGrid({ products }: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState('Semua')

  const filteredProducts = selectedCategory === 'Semua'
    ? products
    : products.filter((p) => p.category === selectedCategory)

  return (
    <>
      {/* Category Filter */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Product Grid */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 pb-8 w-full overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 px-4">
            <span className="material-symbols-outlined text-muted-foreground text-6xl mb-4">
              inventory_2
            </span>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Tidak ada produk
            </h3>
            <p className="text-sm text-muted-foreground text-center">
              Tidak ada produk dalam kategori &quot;{selectedCategory}&quot;
            </p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </section>
    </>
  )
}
