/**
 * API route integration tests.
 *
 * Tests route handlers directly with mocked Supabase to verify:
 *  - Authentication checks (401/403)
 *  - Input validation (400)
 *  - Business logic
 *  - Error responses (500)
 */

import { describe, it, expect, vi, beforeEach } from "vitest"

// --- Mocks ---

const mockGetUser = vi.fn()
const mockFrom = vi.fn()
const mockInsert = vi.fn()
const mockSelect = vi.fn()
const mockSingle = vi.fn()

// Chain builder: .from('table').insert({...}).select().single()
function buildChain(handlers: Record<string, vi.Mock>) {
  const chain: Record<string, vi.Mock> = {}
  chain.select = vi.fn(() => chain)
  chain.single = vi.fn(() => Promise.resolve({ data: handlers.data?.(), error: handlers.error?.() ?? null }))
  chain.insert = vi.fn(() => chain)
  chain.delete = vi.fn(() => chain)
  chain.in = vi.fn(() => chain)
  chain.eq = vi.fn(() => chain)
  chain.order = vi.fn(() => chain)
  chain.limit = vi.fn(() => chain)
  chain.maybeSingle = vi.fn(() => chain)
  return chain
}

function setupMockSupabase(handlers: {
  user?: { user: { id: string } | null } | null
  userError?: Error | null
  insertData?: unknown
  insertError?: Error | null
}) {
  const chain = buildChain({
    data: () => handlers.insertData ?? { id: "exp-1" },
    error: () => handlers.insertError ?? null,
  })

  mockFrom.mockReturnValue(chain)

  // Route does: const { data: { user } } = await supabase.auth.getUser()
  // When user is null, destructuring data must succeed but user is null
  const userValue = handlers.user === undefined ? { user: { id: "user-1" } } : { user: handlers.user }
  mockGetUser.mockResolvedValue({
    data: userValue,
    error: handlers.userError ?? null,
  })

  return { chain }
}

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}))

vi.mock("@/lib/supabase/queries", () => ({
  getUserProfile: vi.fn(() =>
    Promise.resolve({ id: "profile-1", store_id: "store-1", role: "owner" })
  ),
}))

vi.mock("@/lib/notifications", () => ({
  createNotification: vi.fn(() => Promise.resolve()),
}))

// --- Tests ---

describe("POST /api/expenses/create", () => {
  let handler: typeof import("@/app/api/expenses/create/route").POST

  beforeEach(async () => {
    vi.clearAllMocks()
    // Dynamic import to get fresh mocks each test
    handler = (await import("@/app/api/expenses/create/route")).POST
  })

  it("returns 401 when user is not authenticated", async () => {
    setupMockSupabase({ user: null })

    const request = new Request("http://localhost/api/expenses/create", {
      method: "POST",
      body: JSON.stringify({
        title: "Test",
        amount: 50000,
        category: "operasional",
        expense_date: new Date().toISOString(),
      }),
    })

    const response = await handler(request)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.error).toBe("Unauthorized")
  })

  it("returns 400 when required fields are missing", async () => {
    setupMockSupabase({})

    const request = new Request("http://localhost/api/expenses/create", {
      method: "POST",
      body: JSON.stringify({ title: "Test" }), // missing amount, category, expense_date
    })

    const response = await handler(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toContain("required")
  })

  it("returns 400 when category is invalid", async () => {
    setupMockSupabase({})

    const request = new Request("http://localhost/api/expenses/create", {
      method: "POST",
      body: JSON.stringify({
        title: "Test",
        amount: 50000,
        category: "invalid_category",
        expense_date: new Date().toISOString(),
      }),
    })

    const response = await handler(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe("Invalid category")
  })

  it("creates expense successfully", async () => {
    setupMockSupabase({ insertData: { id: "exp-123", title: "Test", amount: 50000 } })

    const request = new Request("http://localhost/api/expenses/create", {
      method: "POST",
      body: JSON.stringify({
        title: "Biaya Listrik",
        amount: 500000,
        category: "operasional",
        description: "Pembayaran listrik bulan ini",
        expense_date: new Date().toISOString(),
      }),
    })

    const response = await handler(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.expense.id).toBe("exp-123")
  })

  it("handles database errors gracefully", async () => {
    setupMockSupabase({ insertError: new Error("DB error") })

    const request = new Request("http://localhost/api/expenses/create", {
      method: "POST",
      body: JSON.stringify({
        title: "Test",
        amount: 50000,
        category: "operasional",
        expense_date: new Date().toISOString(),
      }),
    })

    const response = await handler(request)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error).toBe("Failed to create expense")
  })
})
