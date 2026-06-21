# AGENTS.md — SentraOps v1.0.0

All-in-One Operations Dashboard for UMKM (Indonesian micro-businesses).
Next.js 16 App Router + Supabase + Tailwind CSS v4.
**Open source** — MIT License. Bebas di-fork, di-clone, dan dimodifikasi.

## Commands

- `npm run dev` — start dev server (localhost:3000)
- `npm run build` — production build (runs TypeScript checks)
- `npm run start` — start production server
- `npm run lint` — ESLint (flat config, eslint-config-next)
- `npm run test` — vitest watch mode
- `npm run test:run` — vitest single run (use for CI / verification)
- `npm run test:e2e` — Playwright E2E headless
- `npm run test:e2e:ui` — Playwright E2E with UI mode
- `npm run db:types` — regenerate `src/lib/types/database.ts` from Supabase
- `npm run db:push` / `npm run db:pull` — sync local migrations with remote DB
- `npm run db:migration` — create new Supabase migration file

No explicit `typecheck` script; `npm run build` covers type checking.

## Architecture

```
src/
  app/
    (auth)/login/               — login page (public)
    (auth)/signup/              — signup page (public)
    (auth)/forgot-password/     — forgot password (public)
    (auth)/reset-password/      — reset password (public)
    (dashboard)/                — all authenticated routes, layout has sidebar + topbar
      pos/                      — point of sale
      inventory/                — product management (owner-only)
      financial/                — financial summary (owner-only)
      transactions/             — transaction history
      expenses/                 — expense tracking (owner-only)
      invoices/                 — invoice management
      staff/                    — staff management (owner-only)
      settings/                 — store settings (owner-only)
    api/                        — API routes
    auth/callback/              — Supabase auth callback
    access-denied/              — shown when non-owner hits owner-only route
  components/
    ui/                         — shadcn/ui primitives + Navigation, MobileBottomNav, ThemeToggle
    auth/                       — LoginForm, SignupForm, RequireOwner, PasswordToggle
    dashboard/                  — StatCard, GlobalSearch, NotificationBell, QuickActions
    financial/                  — RevenueChart, PaymentMethodBreakdown, TopProfitContributors
    inventory/                  — ProductForm, ProductTable, StockBadge, StockUpdateForm
    invoices/                   — InvoicesView, EditInvoiceDialog, InvoiceRow
    pos/                        — ProductGrid, Cart, PaymentDrawer, BarcodeSearch, CameraScanner
    receipt/                    — ReceiptActions
    staff/                      — StaffTable, AddStaffDialog, EditStaffDialog
    transactions/               — TransactionTable
    expenses/                   — ExpensesView
  lib/
    stores/                     — Zustand stores (cartStore, uiStore, notificationStore, syncStore)
    supabase/                   — client.ts (browser), server.ts (server components)
    types/                      — shared TypeScript interfaces + auto-generated DB types
    utils.ts                    — cn(), formatCurrency(), helpers
    sanitize.ts                 — input sanitization (6 functions)
    csrf.ts                     — CSRF protection
    rateLimit.ts                — rate limiting
    fetchWithRetry.ts           — network retry with exponential backoff
    inventory.ts                — inventory utilities
    financial-utils.ts          — financial calculations
    notifications.ts            — notification utilities
    offlineDb.ts                — Dexie.js IndexedDB schema
  test/                         — 109 tests across 16 files
    factories.ts                — test data factories (9 factories)
    validation.test.ts          — property-based validation tests
    error-messages.test.ts      — property-based error message tests
    fk-integrity.test.ts        — property-based FK integrity tests
    api-integration.test.ts     — API route integration tests
    db-integration.test.ts      — database integration tests
    (per-feature unit tests)
e2e/
  login.spec.ts                 — E2E login flow
  performance.spec.ts           — performance budget tests
doc/                            — comprehensive documentation (10 files)
```

## Key Patterns

- **Path alias:** `@/*` maps to `./src/*`
- **Auth:** Supabase SSR with cookie-based sessions. Middleware (`src/middleware.ts`) handles redirects and role checks.
- **Role-based routes:** `/inventory`, `/financial`, `/staff`, `/expenses`, `/settings` are owner-only. Middleware queries `profiles.role` and redirects non-owners to `/access-denied`.
- **State:** Zustand for client-side state (cart, UI, notifications, sync). No Redux.
- **Server vs Client:** Use `"use client"` only for interactivity (hooks, event handlers, Zustand). Default to Server Components.
- **Styling:** Tailwind CSS v4 with `@tailwindcss/postcss`. Dark mode via `next-themes` (class strategy). Every component must include `dark:` variants.
- **Icons:** Lucide React + Material Symbols Outlined (loaded via Google Fonts in root layout).
- **Forms:** react-hook-form + zod validation.
- **Toasts:** `sonner` (imported as `Toaster` from `@/components/ui/sonner`).
- **Images:** Remote patterns allow `**.supabase.co` for Supabase Storage URLs.

## Design Tokens

- Fonts: Plus Jakarta Sans (headings), Be Vietnam Pro (body) — loaded in root layout
- Colors: Warm Gray/Zinc palette + Fresh Teal/Mint (`teal-500`/`teal-600`)
- Corners: `rounded-2xl` (16px) or `rounded-xl` (12px) for cards/panels
- Tap targets: minimum `h-12` (48px) for interactive elements
- Mobile-first: base styles target mobile, use `md:` / `lg:` for breakpoints

## Testing

- **Vitest** with jsdom environment and `@testing-library/react`
- Test files: `src/test/*.test.ts` and co-located `*.test.ts` in `src/lib/stores/`
- Setup file (`src/test/setup.ts`) mocks `@supabase/ssr` and `next/headers` cookies
- **fast-check** for property-based testing (validation, error messages, FK integrity)
- **Playwright** for E2E tests (`e2e/` directory)
- Coverage: 109 tests (16 files), 1583 assertions, all passing

## Documentation

Dokumentasi lengkap di [`doc/`](./doc/):
- `01-ARSITEKTUR.md` — arsitektur dan folder structure
- `02-DATABASE.md` — skema database dan RLS
- `03-AUTH.md` — autentikasi dan otorisasi
- `04-API.md` — endpoint API
- `05-KOMPONEN.md` — komponen dan design system
- `06-STATE.md` — state management (Zustand)
- `07-SECURITY.md` — keamanan
- `08-TESTING.md` — testing guide
- `09-PERFORMANCE.md` — performa
- `10-DEPLOYMENT.md` — deployment guide

## Gotchas

- `.env.local` is required with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (not committed)
- `src/lib/types/database.ts` is auto-generated — do not edit manually; run `npm run db:types`
- Supabase RLS policies isolate data by `store_id` — always filter queries accordingly
- Dashboard layout is `"use client"` because it uses Zustand store for sidebar state
- Middleware skips API routes and static files but runs on all other paths
- Vitest config excludes `e2e/` directory — E2E tests run via Playwright, not Vitest
