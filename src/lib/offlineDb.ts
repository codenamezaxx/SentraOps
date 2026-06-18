import Dexie, { type EntityTable } from 'dexie'
import type { Product } from '@/lib/types'

export interface OfflineTransaction {
  id: number
  items: Array<{ product_id: string; quantity: number }>
  payment_method: string
  total_amount: number
  cash_amount?: number
  cash_change?: number
  customer_name?: string
  customer_phone?: string
  created_at: string
  state: 'PENDING_SYNC' | 'SYNCED' | 'FAILED'
}

const db = new Dexie('SentraOpsOffline') as Dexie & {
  cached_products: EntityTable<Product, 'id'>
  offline_transactions_queue: EntityTable<OfflineTransaction, 'id'>
}

db.version(1).stores({
  cached_products: 'id, name, category, barcode',
  offline_transactions_queue: '++id, created_at, state',
})

export { db }
