import { createClient } from '@/lib/supabase/server'
import { PosContent } from '@/components/pos/PosContent'
import type { Product } from '@/lib/types'

export default async function POSPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .gt('stock_quantity', 0)
    .order('category', { ascending: true })
    .order('name', { ascending: true })

  const activeProducts = (products || []).filter((p: Record<string, unknown>) => p.active !== false) as Product[]

  return <PosContent serverProducts={activeProducts} />
}
