# Testing SentraOps

## Stack Testing

| Alat | Kegunaan |
|------|----------|
| **Vitest** | Unit tests, integration tests, property-based tests |
| **Playwright** | End-to-end (E2E) tests |
| **Testing Library** | React component testing |
| **fast-check** | Property-based testing |

## Menjalankan Tes

```bash
npm run test          # Vitest watch mode
npm run test:run      # Vitest single run (untuk CI/verifikasi)
npm run test:e2e      # Playwright headless
npm run test:e2e:ui   # Playwright dengan UI mode
```

## Struktur Tes

```
src/
├── test/                   # Unit & integration tests
│   ├── setup.ts            # Setup vitest (mock Supabase, cookies)
│   ├── factories.ts        # Test data factories
│   ├── cart.test.ts        # Tes cart logic
│   ├── checkout-logic.test.ts
│   ├── pos-correctness.test.ts
│   ├── validation.test.ts   # Property tests validasi
│   ├── error-messages.test.ts
│   ├── fk-integrity.test.ts
│   ├── api-integration.test.ts
│   ├── db-integration.test.ts
│   ├── financial.test.ts
│   ├── inventory.test.ts
│   ├── transactions.test.ts
│   └── utils.test.ts
├── lib/
│   └── stores/
│       ├── cartStore.test.ts  # Tes Zustand store
│       └── uiStore.test.ts
e2e/
├── login.spec.ts           # E2E login flow
└── performance.spec.ts     # Performance budget tests
```

## Test Categories

### 1. Unit Tests

Menguji fungsi dan logic secara terisolasi.

**Contoh: `utils.test.ts`** — formatCurrency, generateSKU, dll.
**Contoh: `cartStore.test.ts`** — addItem, removeItem, updateQuantity.
**Contoh: `checkout-logic.test.ts`** — perhitungan kembalian, subtotal.

### 2. Property-Based Tests (fast-check)

Menguji properti invariant dengan input acak. Garansi lebih kuat dari example-based tests.

**Contoh: `validation.test.ts`** (4 property tests):
- Input yang sudah divalidasi tidak akan error saat divalidasi ulang
- Harga tidak boleh negatif
- Nama tidak boleh kosong setelah trim
- SKU harus unique

**Contoh: `error-messages.test.ts`** (9 property tests):
- Error message harus mengandung kata kunci yang relevan
- Error message tidak boleh generic/ambigu
- Error message harus user-friendly (bukan technical)

**Contoh: `fk-integrity.test.ts`** (12 property tests):
- Transaksi harus memiliki store_id yang valid
- Transaction items harus merujuk ke transaction_id yang valid
- Setiap profile harus memiliki store_id yang valid
- Produk tidak bisa dihapus jika memiliki transaksi terkait

### 3. Integration Tests

Menguji interaksi antar komponen/system.

**Contoh: `api-integration.test.ts`** (5 tests):
- Flow login → dapat session
- Flow checkout → transaksi tersimpan
- Flow invalid payment → error
- Flow empty cart → error
- Flow role check

**Contoh: `db-integration.test.ts`** (15 tests):
- CRUD products
- Relasi transaction → transaction_items
- Cascade, constraint, RLS policy enforcement

### 4. E2E Tests (Playwright)

Menguji dari perspektif user di browser nyata.

**Contoh: `e2e/login.spec.ts`:**
- Login dengan kredensial valid → redirect ke dashboard
- Login dengan kredensial invalid → lihat error
- Akses halaman tanpa login → redirect ke login

**Contoh: `e2e/performance.spec.ts`:**
- Lighthouse performance budget
- Time-to-interactive threshold
- Bundle size limits

## Test Factories (`src/test/factories.ts`)

Factory functions untuk membuat test data konsisten:

```typescript
import { buildProduct, buildTransaction, buildCartItem } from '@/test/factories'

const product = buildProduct({ category: 'Makanan' })
const cart = [buildCartItem({ productId: product.id })]
```

Tersedia factory untuk: `Product`, `Transaction`, `CartItem`, `Invoice`, `Expense`, `Profile`, `Store`, `TransactionItem`.

## Setup File (`src/test/setup.ts`)

Mock global:
- `@supabase/ssr` (createBrowserClient, createServerClient)
- `next/headers` (cookies)
- Environment variables (NEXT_PUBLIC_SUPABASE_URL, ANON_KEY)

## CI Pipeline

Tes dijalankan sebagai bagian dari pipeline:
1. `npm run build` (type checking)
2. `npm run lint` (linting)
3. `npm run test:run` (vitest single run)
4. `npm run test:e2e` (Playwright, jika CI memiliki browser)
