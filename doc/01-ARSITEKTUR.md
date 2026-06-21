# Arsitektur SentraOps

## Tech Stack

| Lapisan | Teknologi | Versi |
|---------|-----------|-------|
| Framework | Next.js (App Router) | 16.2.7 |
| Bahasa | TypeScript | ~5.8 |
| UI Library | React | 19.2.4 |
| CSS Framework | Tailwind CSS v4 | ~4.1 |
| Database | Supabase (PostgreSQL) | — |
| Auth | Supabase SSR (cookie-based) | 0.12.0 |
| State Management | Zustand | ~5.6 |
| Forms | react-hook-form + zod | — |
| Icons | Lucide React + Material Symbols Outlined | — |
| Testing | Vitest + Playwright | — |
| Component Library | shadcn/ui (Radix primitives) | — |

## Struktur Folder

```
src/
├── app/
│   ├── (auth)/                 # Halaman publik (login, signup, reset password)
│   │   ├── login/
│   │   ├── signup/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── (dashboard)/            # Halaman terotentikasi (layout = sidebar + topbar)
│   │   ├── page.tsx            # Dashboard utama
│   │   ├── pos/                # Point of Sale
│   │   ├── inventory/          # Manajemen produk (owner-only)
│   │   ├── financial/          # Laporan keuangan (owner-only)
│   │   ├── transactions/       # Riwayat transaksi
│   │   ├── expenses/           # Pengeluaran (owner-only)
│   │   ├── invoices/           # Faktur/piutang
│   │   ├── staff/              # Manajemen staf (owner-only)
│   │   └── settings/           # Pengaturan toko (owner-only)
│   ├── api/                    # API Routes
│   ├── access-denied/          # Halaman akses ditolak
│   └── auth/callback/          # Supabase auth callback
├── components/
│   ├── ui/                     # Primitif shadcn/ui (button, card, input, dll)
│   ├── auth/                   # Komponen autentikasi
│   ├── dashboard/              # Komponen dashboard
│   ├── financial/              # Komponen keuangan
│   ├── inventory/              # Komponen inventaris
│   ├── invoices/               # Komponen faktur
│   ├── pos/                    # Komponen POS
│   ├── receipt/                # Komponen struk
│   ├── staff/                  # Komponen staf
│   ├── transactions/           # Komponen transaksi
│   └── expenses/               # Komponen pengeluaran
├── lib/
│   ├── stores/                 # Zustand stores
│   ├── supabase/               # Klien Supabase (client, server, queries)
│   ├── types/                  # Tipe database auto-generated
│   └── (utilities)             # utils, sanitize, csrf, rateLimit, dll
└── test/                       # Unit & integration tests
```

## Routing

### Route Groups

- **`(auth)`** — Grup publik tanpa layout dashboard. Berisi halaman login, signup, reset password.
- **`(dashboard)`** — Grup terotentikasi dengan layout bersama (sidebar + topbar + mobile bottom nav).

### Pola Routing

| Route | Tipe | Akses |
|-------|------|-------|
| `/login` | Publik | Semua |
| `/signup` | Publik | Semua |
| `/pos` | Private | Semua role |
| `/inventory` | Private | Owner only |
| `/financial` | Private | Owner only |
| `/staff` | Private | Owner only |
| `/expenses` | Private | Owner only |
| `/settings` | Private | Owner only |
| `/api/*` | API | Bervariasi |

## Server vs Client Component

Gunakan `"use client"` hanya jika dibutuhkan:
- Event handlers (onClick, onChange)
- Hooks (useState, useEffect, useRouter)
- Zustand store consumption
- Context providers

Semua komponen lain default ke **Server Component** untuk performa lebih baik.

## Middleware

File `src/middleware.ts` menangani:
1. **Autentikasi** — Redirect ke `/login` jika session tidak valid
2. **Role-based access** — Owner-only routes (`/inventory`, `/financial`, `/staff`, `/expenses`, `/settings`) dicek via `profiles.role`
3. **Auth route loop** — User sudah login diarahkan ke `/` jika mengakses halaman auth
4. **Cookie refresh** — Memperpanjang session cookies setiap request

## Pola Data Flow

```
Browser ──► Next.js (Server Component/RSC) ──► Supabase (query)
            │
            ├── Server Actions (mutasi)
            ├── API Routes (webhook, checkout)
            └── Client Components (Zustand untuk state UI)
```

### State Management

| State | Lokasi | Penjelasan |
|-------|--------|------------|
| Sidebar state | `uiStore` (Zustand) | Buka/tutup sidebar |
| Cart | `cartStore` (Zustand) | Item di keranjang POS |
| Notifikasi | `notificationStore` | Notifikasi real-time |
| Sync status | `syncStore` | Status sinkronisasi offline |
