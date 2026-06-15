import { createClient } from '@/lib/supabase/server'
import { CategoryFilter } from './CategoryFilter'
import { ProductCard } from './ProductCard'
import type { Product } from '@/lib/types'

/**
 * ProductGrid Component (Server Component)
 * 
 * Displays category filter and product grid
 * Fetches products from database with RLS enforcement
 * 
 * Requirements: 6.1 - Display all active products organized by category
 * Task: 9.2 - Implement product grid component
 */
export async function ProductGrid() {
  const supabase = await createClient()

  // Fetch all active products (stock_quantity > 0) from the database
  // RLS automatically filters by store_id based on authenticated user
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .gt('stock_quantity', 0)
    .order('category', { ascending: true })
    .order('name', { ascending: true })

  // Handle error state
  if (error) {
    console.error('Error fetching products:', error)
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <span className="material-symbols-outlined text-destructive text-5xl mb-4">error</span>
        <p className="text-muted-foreground text-center">
          Gagal memuat produk. Silakan refresh halaman.
        </p>
      </div>
    )
  }

  // Handle empty state
  if (!products || products.length === 0) {
    return (
      <>
        <CategoryFilter />
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <span className="material-symbols-outlined text-muted-foreground text-6xl mb-4">
            inventory_2
          </span>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Belum ada produk
          </h3>
          <p className="text-sm text-muted-foreground text-center">
            Tambahkan produk pertama Anda di halaman Inventory
          </p>
        </div>
      </>
    )
  }

  // Type assertion to match our Product type
  const typedProducts = products as Product[]

  return (
    <>
      {/* Category Filter */}
      <CategoryFilter />

      {/* Product Grid - Responsive layout with 2 columns mobile, 3 desktop */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
        {typedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>
    </>
  )
}
