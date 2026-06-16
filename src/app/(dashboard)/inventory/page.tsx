import { Package, PackageSearch, AlertTriangle, XCircle } from 'lucide-react'
import { getUserProfile } from '@/lib/supabase/queries'
import { RequireOwner } from '@/components/auth/RequireOwner'
import { createClient } from '@/lib/supabase/server'
import { ProductTable } from '@/components/inventory/ProductTable'
import { Product } from '@/lib/types'

export default async function InventoryPage() {
  const profile = await getUserProfile()
  
  if (!profile) return null

  const supabase = await createClient()
  
  const { data: productsData } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', profile.store_id)
    .order('name')

  const products = (productsData || []) as Product[]

  // Calculate stats
  const totalSKUs = products?.length || 0
  const lowStockCount = products?.filter(p => p.stock_quantity > 0 && p.stock_quantity <= p.min_stock_threshold).length || 0
  const outOfStockCount = products?.filter(p => p.stock_quantity <= 0).length || 0

  return (
    <RequireOwner profile={profile}>
      <div className="px-4 md:px-8 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-on-surface">
                Manajemen Inventori
              </h1>
              <p className="text-sm text-on-surface-variant">
                Kelola stok produk dan ambang batas peringatan
              </p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card p-4 rounded-2xl border border-outline-variant flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center">
                <PackageSearch className="w-6 h-6 text-on-surface-variant" />
              </div>
              <div>
                <p className="text-sm text-on-surface-variant font-medium">Total SKU</p>
                <p className="text-2xl font-bold text-on-surface">{totalSKUs}</p>
              </div>
            </div>
            <div className="bg-card p-4 rounded-2xl border border-outline-variant flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-tertiary" />
              </div>
              <div>
                <p className="text-sm text-on-surface-variant font-medium">Stok Menipis</p>
                <p className="text-2xl font-bold text-tertiary">{lowStockCount}</p>
              </div>
            </div>
            <div className="bg-card p-4 rounded-2xl border border-outline-variant flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-error" />
              </div>
              <div>
                <p className="text-sm text-on-surface-variant font-medium">Stok Habis</p>
                <p className="text-2xl font-bold text-error">{outOfStockCount}</p>
              </div>
            </div>
          </div>

          <ProductTable products={products || []} />
        </div>
      </div>
    </RequireOwner>
  )
}
