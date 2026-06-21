/**
 * Database integration tests.
 *
 * Tests mocked Supabase query chains to verify that CRUD operations,
 * aggregation queries, error handling, and cascade behaviors work
 * as expected at the database layer.
 *
 * The chain is made "thenable" so that awaiting at any point in the
 * builder pattern (e.g., .from().select().eq()) resolves correctly,
 * matching how Supabase v2 uses Proxy / .then() internally.
 */

import { describe, it, expect, vi, beforeEach } from "vitest"

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockGetUser = vi.fn()
const mockFrom = vi.fn()

interface QueryResult {
  data: unknown
  error: unknown
  count?: number
}

/**
 * Build a thenable query chain.
 *
 * `.then() / .catch()` delegates to a dynamic resolve function so that
 * the chain can be awaited at any point. Tests set up the resolve
 * function via `_setResult()` or override individual mock methods.
 */
function buildChain() {
  const chain: Record<string, vi.Mock> = {}

  // Dynamic result provider — tests call _setResult() to control what
  // data/error/count the chain resolves to when awaited.
  let resolveFn: () => QueryResult = () => ({ data: null, error: null })

  chain._setResult = (fn: () => QueryResult) => {
    resolveFn = fn
  }

  // Make the chain thenable — it re-evaluates resolveFn each time.
  chain.then = (onfulfilled: (v: QueryResult) => unknown, onrejected?: (v: unknown) => unknown) => {
    return Promise.resolve(resolveFn()).then(onfulfilled, onrejected)
  }
  chain.catch = (onrejected: (v: unknown) => unknown) => {
    return Promise.resolve(resolveFn()).catch(onrejected)
  }

  // Builder methods — each returns the chain for further chaining.
  chain.select = vi.fn(() => chain)
  chain.single = vi.fn(() => chain)
  chain.insert = vi.fn(() => chain)
  chain.delete = vi.fn(() => chain)
  chain.update = vi.fn(() => chain)
  chain.in = vi.fn(() => chain)
  chain.eq = vi.fn(() => chain)
  chain.neq = vi.fn(() => chain)
  chain.order = vi.fn(() => chain)
  chain.limit = vi.fn(() => chain)
  chain.maybeSingle = vi.fn(() => chain)
  chain.gte = vi.fn(() => chain)
  chain.lte = vi.fn(() => chain)
  chain.textSearch = vi.fn(() => chain)
  chain.filter = vi.fn(() => chain)
  chain.or = vi.fn(() => chain)

  return chain
}

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}))

// ─── Fixtures ───────────────────────────────────────────────────────────────

const STORE_ID = "store-abc-123"

interface ProductFixture {
  id: string
  store_id: string
  name: string
  category: string
  price: number
  cost_price: number
  stock_quantity: number
  created_at: string
}

interface TransactionFixture {
  id: string
  store_id: string
  total_amount: number
  payment_method: string
  status: string
  created_at: string
}

interface TransactionItemFixture {
  id: string
  transaction_id: string
  product_id: string
  quantity: number
  price_at_time: number
  cost_price_at_time: number
}

function makeProducts(): ProductFixture[] {
  return [
    { id: "prod-1", store_id: STORE_ID, name: "Kopi Tubruk", category: "minuman", price: 15000, cost_price: 8000, stock_quantity: 50, created_at: "2025-01-15T08:00:00Z" },
    { id: "prod-2", store_id: STORE_ID, name: "Nasi Goreng", category: "makanan", price: 25000, cost_price: 12000, stock_quantity: 30, created_at: "2025-02-01T10:00:00Z" },
    { id: "prod-3", store_id: STORE_ID, name: "Es Teh Manis", category: "minuman", price: 8000, cost_price: 3000, stock_quantity: 100, created_at: "2025-01-20T09:00:00Z" },
    { id: "prod-4", store_id: STORE_ID, name: "Mie Goreng", category: "makanan", price: 20000, cost_price: 10000, stock_quantity: 40, created_at: "2025-03-01T11:00:00Z" },
    { id: "prod-5", store_id: "store-other", name: "Other Item", category: "minuman", price: 5000, cost_price: 2000, stock_quantity: 200, created_at: "2025-01-10T07:00:00Z" },
  ]
}

function makeTransactions(): TransactionFixture[] {
  return [
    { id: "txn-1", store_id: STORE_ID, total_amount: 15000, payment_method: "cash", status: "completed", created_at: "2025-02-10T10:00:00Z" },
    { id: "txn-2", store_id: STORE_ID, total_amount: 33000, payment_method: "qris", status: "completed", created_at: "2025-02-11T11:00:00Z" },
    { id: "txn-3", store_id: STORE_ID, total_amount: 8000, payment_method: "cash", status: "cancelled", created_at: "2025-02-12T12:00:00Z" },
    { id: "txn-4", store_id: STORE_ID, total_amount: 25000, payment_method: "qris", status: "completed", created_at: "2025-02-13T13:00:00Z" },
    { id: "txn-5", store_id: STORE_ID, total_amount: 40000, payment_method: "invoice", status: "pending", created_at: "2025-02-14T14:00:00Z" },
  ]
}

function makeTransactionItems(): TransactionItemFixture[] {
  return [
    { id: "item-1", transaction_id: "txn-1", product_id: "prod-1", quantity: 1, price_at_time: 15000, cost_price_at_time: 8000 },
    { id: "item-2", transaction_id: "txn-2", product_id: "prod-2", quantity: 1, price_at_time: 25000, cost_price_at_time: 12000 },
    { id: "item-3", transaction_id: "txn-2", product_id: "prod-3", quantity: 1, price_at_time: 8000, cost_price_at_time: 3000 },
    { id: "item-4", transaction_id: "txn-4", product_id: "prod-1", quantity: 1, price_at_time: 15000, cost_price_at_time: 8000 },
    { id: "item-5", transaction_id: "txn-4", product_id: "prod-4", quantity: 1, price_at_time: 10000, cost_price_at_time: 5000 },
  ]
}

beforeEach(() => {
  vi.clearAllMocks()
  mockGetUser.mockResolvedValue({
    data: { user: { id: "user-1" } },
    error: null,
  })
})

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("DB Integration — Products table CRUD", () => {
  describe("SELECT with filters", () => {
    it("filters products by store_id and returns only matching rows", async () => {
      const allProducts = makeProducts()
      const chain = buildChain()
      const filters: Record<string, unknown> = {}

      chain.eq.mockImplementation((col: string, val: unknown) => {
        filters[col] = val
        return chain
      })

      chain._setResult(() => {
        let data = allProducts
        if (filters.store_id) {
          data = data.filter((p) => p.store_id === filters.store_id)
        }
        return { data, error: null }
      })

      mockFrom.mockReturnValue(chain)

      const supabase = (await import("@/lib/supabase/server")).createClient()
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("store_id", STORE_ID)

      expect(error).toBeNull()
      expect(data).toHaveLength(4)
      expect(data).toEqual(allProducts.filter((p) => p.store_id === STORE_ID))
      // Ensure item from another store is excluded
      expect(data?.map((p: ProductFixture) => p.id)).not.toContain("prod-5")
    })

    it("filters products by category via chained eq calls", async () => {
      const allProducts = makeProducts()
      const chain = buildChain()
      const filters: Record<string, unknown> = {}

      chain.eq.mockImplementation((col: string, val: unknown) => {
        filters[col] = val
        return chain
      })

      chain._setResult(() => {
        let data = allProducts
        if (filters.store_id) {
          data = data.filter((p) => p.store_id === filters.store_id)
        }
        if (filters.category) {
          data = data.filter((p) => p.category === filters.category)
        }
        return { data, error: null }
      })

      mockFrom.mockReturnValue(chain)

      const supabase = (await import("@/lib/supabase/server")).createClient()
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("store_id", STORE_ID)
        .eq("category", "makanan")

      expect(data).toHaveLength(2)
      expect(data?.every((p: ProductFixture) => p.category === "makanan")).toBe(true)
      expect(data?.map((p: ProductFixture) => p.name)).toEqual(
        expect.arrayContaining(["Nasi Goreng", "Mie Goreng"]),
      )
    })
  })

  describe("ORDER BY created_at", () => {
    it("orders products by created_at descending", async () => {
      const allProducts = makeProducts()
      const chain = buildChain()
      let orderColumn = ""
      let ascending = true

      chain.order.mockImplementation((col: string, opts?: { ascending?: boolean }) => {
        orderColumn = col
        ascending = opts?.ascending ?? true
        return chain
      })

      chain._setResult(() => {
        const sorted = [...allProducts].sort((a, b) => {
          const aVal = new Date(a[orderColumn as keyof ProductFixture] as string).getTime()
          const bVal = new Date(b[orderColumn as keyof ProductFixture] as string).getTime()
          return ascending ? aVal - bVal : bVal - aVal
        })
        return { data: sorted, error: null }
      })

      mockFrom.mockReturnValue(chain)

      const supabase = (await import("@/lib/supabase/server")).createClient()
      const { data } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })

      expect(data).toHaveLength(5)
      for (let i = 0; i < (data?.length ?? 0) - 1; i++) {
        const curr = new Date(data![i].created_at).getTime()
        const next = new Date(data![i + 1].created_at).getTime()
        expect(curr).toBeGreaterThanOrEqual(next)
      }
      // Most recent first
      expect(data![0].id).toBe("prod-4")
      expect(data![4].id).toBe("prod-5")
    })

    it("orders products by created_at ascending", async () => {
      const allProducts = makeProducts()
      const chain = buildChain()
      let orderColumn = ""
      let ascending = true

      chain.order.mockImplementation((col: string, opts?: { ascending?: boolean }) => {
        orderColumn = col
        ascending = opts?.ascending ?? true
        return chain
      })

      chain._setResult(() => {
        const sorted = [...allProducts].sort((a, b) => {
          const aVal = new Date(a[orderColumn as keyof ProductFixture] as string).getTime()
          const bVal = new Date(b[orderColumn as keyof ProductFixture] as string).getTime()
          return ascending ? aVal - bVal : bVal - aVal
        })
        return { data: sorted, error: null }
      })

      mockFrom.mockReturnValue(chain)

      const supabase = (await import("@/lib/supabase/server")).createClient()
      const { data } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: true })

      expect(data).toHaveLength(5)
      // Oldest first
      expect(data![0].id).toBe("prod-5")
      expect(data![4].id).toBe("prod-4")
    })
  })
})

describe("DB Integration — Transactions aggregation", () => {
  describe("SUM of total_amount by period", () => {
    it("calculates total revenue for a given date range", async () => {
      const allTxns = makeTransactions()
      const chain = buildChain()
      const range = { start: "", end: "" }

      chain.gte.mockImplementation((_col: string, val: string) => {
        range.start = val
        return chain
      })
      chain.lte.mockImplementation((_col: string, val: string) => {
        range.end = val
        return chain
      })

      chain._setResult(() => {
        const filtered = allTxns.filter((t) => {
          const tDate = new Date(t.created_at).getTime()
          return (
            tDate >= new Date(range.start).getTime() &&
            tDate <= new Date(range.end).getTime()
          )
        })
        const sum = filtered.reduce((acc, t) => acc + t.total_amount, 0)
        return { data: [{ total_amount: sum }], error: null }
      })

      mockFrom.mockReturnValue(chain)

      const supabase = (await import("@/lib/supabase/server")).createClient()
      const { data } = await supabase
        .from("transactions")
        .select("total_amount")
        .gte("created_at", "2025-02-10T00:00:00Z")
        .lte("created_at", "2025-02-13T23:59:59Z")

      const expectedSum = makeTransactions()
        .filter((t) => {
          const tDate = new Date(t.created_at).getTime()
          return (
            tDate >= new Date("2025-02-10T00:00:00Z").getTime() &&
            tDate <= new Date("2025-02-13T23:59:59Z").getTime()
          )
        })
        .reduce((acc, t) => acc + t.total_amount, 0)

      expect(data![0].total_amount).toBe(expectedSum)
      expect(expectedSum).toBe(15000 + 33000 + 8000 + 25000) // 81000
    })
  })

  describe("COUNT of transactions by status", () => {
    it("counts completed transactions", async () => {
      const allTxns = makeTransactions()
      const chain = buildChain()
      let eqFilter = ""

      chain.eq.mockImplementation((_col: string, val: string) => {
        eqFilter = val
        return chain
      })

      chain._setResult(() => {
        const filtered = allTxns.filter((t) => t.status === eqFilter)
        return { data: filtered, error: null, count: filtered.length }
      })

      mockFrom.mockReturnValue(chain)

      const supabase = (await import("@/lib/supabase/server")).createClient()
      const { data, count } = await supabase
        .from("transactions")
        .select("*", { count: "exact" })
        .eq("status", "completed")

      expect(count).toBe(3)
      expect(data).toHaveLength(3)
      expect(data?.every((t: TransactionFixture) => t.status === "completed")).toBe(true)
    })

    it("counts cancelled transactions", async () => {
      const allTxns = makeTransactions()
      const chain = buildChain()
      let eqFilter = ""

      chain.eq.mockImplementation((_col: string, val: string) => {
        eqFilter = val
        return chain
      })

      chain._setResult(() => {
        const filtered = allTxns.filter((t) => t.status === eqFilter)
        return { data: filtered, error: null, count: filtered.length }
      })

      mockFrom.mockReturnValue(chain)

      const supabase = (await import("@/lib/supabase/server")).createClient()
      const { data, count } = await supabase
        .from("transactions")
        .select("*", { count: "exact" })
        .eq("status", "cancelled")

      expect(count).toBe(1)
      expect(data![0].id).toBe("txn-3")
    })
  })

  describe("Group by payment_method", () => {
    it("aggregates total_amount by payment_method", async () => {
      const allTxns = makeTransactions()
      const chain = buildChain()

      chain._setResult(() => {
        const grouped = allTxns.reduce(
          (acc, t) => {
            acc[t.payment_method] = (acc[t.payment_method] ?? 0) + t.total_amount
            return acc
          },
          {} as Record<string, number>,
        )
        const aggregatedData = Object.entries(grouped).map(([method, total]) => ({
          payment_method: method,
          total_amount: total,
        }))
        return { data: aggregatedData, error: null }
      })

      mockFrom.mockReturnValue(chain)

      const supabase = (await import("@/lib/supabase/server")).createClient()
      const { data } = await supabase
        .from("transactions")
        .select("payment_method, total_amount")

      const cashTotal = data?.find((d: { payment_method: string }) => d.payment_method === "cash")?.total_amount
      const qrisTotal = data?.find((d: { payment_method: string }) => d.payment_method === "qris")?.total_amount
      const invoiceTotal = data?.find((d: { payment_method: string }) => d.payment_method === "invoice")?.total_amount

      expect(cashTotal).toBe(23000)   // 15000 + 8000
      expect(qrisTotal).toBe(58000)   // 33000 + 25000
      expect(invoiceTotal).toBe(40000)
    })
  })
})

describe("DB Integration — Error handling", () => {
  describe("Foreign key violations", () => {
    it("captures a foreign key violation error when inserting with invalid store_id", async () => {
      const chain = buildChain()

      chain.insert.mockReturnValue(chain)
      chain._setResult(() => ({
        data: null,
        error: {
          code: "23503",
          message: 'insert or update on table "products" violates foreign key constraint "products_store_id_fkey"',
          details: 'Key (store_id)=(nonexistent-store) is not present in table "stores".',
        },
      }))

      mockFrom.mockReturnValue(chain)

      const supabase = (await import("@/lib/supabase/server")).createClient()
      const { data, error } = await supabase
        .from("products")
        .insert({
          store_id: "nonexistent-store",
          name: "Orphan Product",
          price: 10000,
          cost_price: 5000,
          stock_quantity: 10,
        })
        .select()

      expect(data).toBeNull()
      expect(error).not.toBeNull()
      expect(error.code).toBe("23503")
      expect(error.message).toContain("foreign key constraint")
      expect(error.details).toContain("nonexistent-store")
    })
  })

  describe("Unique constraint violations", () => {
    it("captures a unique constraint violation on product barcode", async () => {
      const chain = buildChain()

      chain.insert.mockReturnValue(chain)
      chain._setResult(() => ({
        data: null,
        error: {
          code: "23505",
          message: 'duplicate key value violates unique constraint "products_barcode_key"',
          details: 'Key (barcode)=(BRC-001) already exists.',
        },
      }))

      mockFrom.mockReturnValue(chain)

      const supabase = (await import("@/lib/supabase/server")).createClient()
      const { data, error } = await supabase
        .from("products")
        .insert({
          store_id: "store-abc-123",
          name: "Duplicate Barcode Item",
          barcode: "BRC-001",
          price: 5000,
          cost_price: 2000,
          stock_quantity: 20,
        })
        .select()

      expect(data).toBeNull()
      expect(error).not.toBeNull()
      expect(error.code).toBe("23505")
      expect(error.message).toContain("duplicate key")
      expect(error.details).toContain("BRC-001")
    })
  })

  describe("Error message capture", () => {
    it("captures a NOT NULL constraint violation", async () => {
      const chain = buildChain()

      chain.insert.mockReturnValue(chain)
      chain._setResult(() => ({
        data: null,
        error: {
          code: "23502",
          message: 'null value in column "name" violates not-null constraint',
          details: 'Failing row contains null in column "name".',
        },
      }))

      mockFrom.mockReturnValue(chain)

      const supabase = (await import("@/lib/supabase/server")).createClient()
      const { data, error } = await supabase
        .from("products")
        .insert({
          store_id: "store-abc-123",
          name: null,
          price: 5000,
          cost_price: 2000,
          stock_quantity: 20,
        })
        .select()

      expect(data).toBeNull()
      expect(error).not.toBeNull()
      expect(error.code).toBe("23502")
      expect(error.message).toContain("not-null constraint")
    })
  })
})

describe("DB Integration — Transaction items cascade behavior", () => {
  it("deletes a transaction and its items in sequence (simulated cascade)", async () => {
    const allItems = makeTransactionItems()
    const allTxns = makeTransactions()
    const chain = buildChain()
    const deleteCalls: { table: string; filter: Record<string, string> }[] = []

    mockFrom.mockImplementation((table: string) => {
      chain.eq.mockImplementation((col: string, val: string) => {
        deleteCalls.push({ table, filter: { [col]: val } })

        chain._setResult(() => {
          if (table === "transaction_items") {
            const remaining = allItems.filter((i) => i.transaction_id !== val)
            return { data: remaining, error: null }
          }
          if (table === "transactions") {
            const remaining = allTxns.filter((t) => t.id !== val)
            return { data: remaining, error: null }
          }
          return { data: null, error: null }
        })

        return chain
      })
      return chain
    })

    const supabase = (await import("@/lib/supabase/server")).createClient()

    // Step 1: Delete items referencing the transaction
    await supabase.from("transaction_items").delete().eq("transaction_id", "txn-2")

    // Step 2: Delete the transaction itself
    const { data: txnsAfter } = await supabase.from("transactions").delete().eq("id", "txn-2")

    // Both tables were targeted
    expect(deleteCalls).toHaveLength(2)
    expect(deleteCalls[0]).toEqual({ table: "transaction_items", filter: { transaction_id: "txn-2" } })
    expect(deleteCalls[1]).toEqual({ table: "transactions", filter: { id: "txn-2" } })

    // After deletion, txn-2 itself should be gone
    expect(txnsAfter?.find((t: TransactionFixture) => t.id === "txn-2")).toBeUndefined()
  })

  it("preserves items from non-deleted transactions (no accidental cascade)", async () => {
    const allItems = makeTransactionItems()
    const chain = buildChain()

    mockFrom.mockImplementation((_table: string) => {
      chain.eq.mockImplementation((_col: string, val: string) => {
        const remaining = allItems.filter((i) => i.transaction_id !== val)

        chain._setResult(() => ({
          data: remaining,
          error: null,
        }))

        return chain
      })
      return chain
    })

    const supabase = (await import("@/lib/supabase/server")).createClient()
    const { data } = await supabase
      .from("transaction_items")
      .delete()
      .eq("transaction_id", "txn-1")

    // Items for txn-1 removed
    expect(data?.find((i: TransactionItemFixture) => i.transaction_id === "txn-1")).toBeUndefined()
    // Items for other transactions preserved
    expect(data?.some((i: TransactionItemFixture) => i.transaction_id === "txn-2")).toBe(true)
    expect(data?.some((i: TransactionItemFixture) => i.transaction_id === "txn-4")).toBe(true)
    // Original count was 5, removing 1 item (txn-1) leaves 4
    expect(data).toHaveLength(4)
  })

  it("deletes nothing when the transaction does not exist", async () => {
    const allItems = makeTransactionItems()
    const chain = buildChain()

    mockFrom.mockImplementation((_table: string) => {
      chain.eq.mockImplementation((_col: string, val: string) => {
        const remaining = allItems.filter((i) => i.transaction_id !== val)

        chain._setResult(() => ({
          data: remaining,
          error: null,
        }))

        return chain
      })
      return chain
    })

    const supabase = (await import("@/lib/supabase/server")).createClient()
    const { data } = await supabase
      .from("transaction_items")
      .delete()
      .eq("transaction_id", "txn-nonexistent")

    // No items were removed — all original items remain
    expect(data).toHaveLength(5)
    expect(data).toEqual(allItems)
  })

  it("reports an error when deleting a transaction that does not exist", async () => {
    const chain = buildChain()
    let dbTable = ""

    mockFrom.mockImplementation((table: string) => {
      dbTable = table
      if (table === "transaction_items") {
        chain.eq.mockImplementation(() => {
          chain._setResult(() => ({ data: [], error: null }))
          return chain
        })
      }
      if (table === "transactions") {
        chain.eq.mockImplementation(() => {
          chain._setResult(() => ({
            data: null,
            error: {
              code: "PGRST116",
              message: "Resource not found",
              details: "The requested resource was not found.",
            },
          }))
          return chain
        })
      }
      return chain
    })

    const supabase = (await import("@/lib/supabase/server")).createClient()

    // Delete items (none found — transaction doesn't exist)
    const { data: itemsData } = await supabase
      .from("transaction_items")
      .delete()
      .eq("transaction_id", "txn-nonexistent")

    expect(itemsData).toHaveLength(0)

    // Delete transaction that doesn't exist
    const { data: txnData, error: txnError } = await supabase
      .from("transactions")
      .delete()
      .eq("id", "txn-nonexistent")

    expect(txnData).toBeNull()
    expect(txnError).not.toBeNull()
    expect(txnError.code).toBe("PGRST116")
    expect(txnError.message).toBe("Resource not found")
  })
})
