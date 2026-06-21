/**
 * Shared test factories for creating mock data in tests.
 *
 * Usage:
 *   import { createMockProduct, createMockCartItem } from '@/test/factories'
 *
 *   const product = createMockProduct({ price: 25000 })
 *   const item = createMockCartItem({ quantity: 3 })
 */

import type {
  Product,
  CartItem,
  Transaction,
  TransactionItem,
  Invoice,
  Notification,
  Expense,
  Profile,
  Store,
  FinancialSummary,
} from "@/lib/types"

let counter = 0
function nextId(prefix = "mock"): string {
  counter++
  return `${prefix}-${counter}-${Date.now()}`
}

export function createMockProduct(overrides: Partial<Product> = {}): Product {
  const id = nextId("prod")
  return {
    id,
    store_id: "store-1",
    name: `Produk ${id}`,
    barcode: null,
    price: 10000,
    cost_price: 5000,
    stock_quantity: 100,
    min_stock_threshold: 10,
    category: "Umum",
    image_url: null,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

export function createMockCartItem(overrides: Partial<CartItem> = {}): CartItem {
  const product = createMockProduct(overrides)
  return {
    ...product,
    quantity: 1,
    ...overrides,
  }
}

export function createMockTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: nextId("txn"),
    store_id: "store-1",
    cashier_id: "user-1",
    total_amount: 25000,
    payment_method: "cash",
    status: "completed",
    cash_amount: 50000,
    change_amount: 25000,
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

export function createMockTransactionItem(
  overrides: Partial<TransactionItem> = {}
): TransactionItem {
  return {
    id: nextId("txn-item"),
    transaction_id: "txn-1",
    product_id: "prod-1",
    quantity: 1,
    price_at_time: 10000,
    cost_price_at_time: 5000,
    ...overrides,
  }
}

export function createMockInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: nextId("inv"),
    store_id: "store-1",
    customer_name: "Pelanggan",
    customer_phone: null,
    amount: 50000,
    due_date: new Date(Date.now() + 7 * 86400000).toISOString(),
    status: "UNPAID",
    xendit_invoice_url: null,
    transaction_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

export function createMockNotification(
  overrides: Partial<Notification> = {}
): Notification {
  return {
    id: nextId("notif"),
    store_id: "store-1",
    title: "Notifikasi",
    message: "Pesan notifikasi",
    type: "payment",
    is_read: false,
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

export function createMockExpense(overrides: Partial<Expense> = {}): Expense {
  return {
    id: nextId("exp"),
    store_id: "store-1",
    title: "Biaya Operasional",
    amount: 50000,
    category: "operasional",
    description: null,
    expense_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

export function createMockProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: nextId("profile"),
    auth_id: "auth-1",
    store_id: "store-1",
    role: "owner",
    name: "Pemilik Toko",
    avatar_url: null,
    ...overrides,
  }
}

export function createMockStore(overrides: Partial<Store> = {}): Store {
  return {
    id: "store-1",
    owner_id: "user-1",
    name: "Toko Contoh",
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

export function createMockFinancialSummary(
  overrides: Partial<FinancialSummary> = {}
): FinancialSummary {
  return {
    grossRevenue: 1000000,
    cogs: 500000,
    netProfit: 500000,
    profitMargin: 50,
    ...overrides,
  }
}
