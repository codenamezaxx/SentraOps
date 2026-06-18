<p align="center">
  <img src="./public/banner.png" alt="SentraOps Banner" width="100%" />
</p>

<p align="center">
  <strong>All-in-One Operations Dashboard untuk UMKM</strong>
  <br />
  Mobile-first · Offline-ready · Multi-tenant
  <br />
  <br />
  <img src="https://img.shields.io/badge/Next.js-16-black" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-blue" alt="TypeScript Strict" />
  <img src="https://img.shields.io/badge/Supabase-Realtime-green" alt="Supabase Realtime" />
  <img src="https://img.shields.io/badge/PWA-Enabled-teal" alt="PWA Enabled" />
  <img src="https://img.shields.io/badge/Status-Active_Development-yellow" alt="Active Development" />
</p>

---

## ✨ Features

- 🔐 **Multi-method authentication** (email/password + magic links)
- 🛒 **Mobile POS system** — tap-and-go cashier with barcode scanner support
- 📦 **Inventory management** with low-stock alerts and stock adjustments
- 💰 **Financial reports** — auto-generated P&L with payment method breakdown
- 📄 **Invoice management** — create, edit, mark paid, WhatsApp reminders
- 📱 **PWA support** — installable on mobile home screen, offline-capable
- 📡 **Offline mode** — Dexie.js IndexedDB cache + offline transaction queue
- 🔄 **Real-time sync** — Supabase Realtime silently syncs product changes
- 🎨 **Dual theme** — light/dark mode with consistent design tokens
- 🔒 **Multi-tenant** — RLS isolation per store_id

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript (Strict mode) |
| **Styling** | Tailwind CSS v4 |
| **UI Library** | shadcn/ui + Radix UI |
| **State** | Zustand (client state) |
| **Backend** | Supabase (PostgreSQL + Auth + Realtime) |
| **Offline DB** | Dexie.js (IndexedDB wrapper) |
| **Icons** | Lucide React + Material Symbols |
| **Theme** | next-themes (class strategy) |
| **Forms** | react-hook-form + zod |
| **Toasts** | sonner |

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm / yarn / pnpm
- Supabase project (credentials in `.env.local`)

### Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (localhost:3000) |
| `npm run build` | Production build + TypeScript check |
| `npm run lint` | ESLint |
| `npm run test` | Vitest watch mode |
| `npm run test:run` | Vitest single run |
| `npm run db:types` | Regenerate Supabase TypeScript types |
| `npm run db:push` | Push migrations to remote |
| `npm run db:pull` | Pull schema from remote |
| `npm run db:migration` | Create new migration file |

## 🏗️ Project Structure

```
src/
├── app/
│   ├── (auth)/login/          # Login page
│   ├── (dashboard)/           # Authenticated routes
│   │   ├── pos/               # Point of Sale
│   │   ├── inventory/         # Product management (owner)
│   │   ├── financial/         # Financial reports (owner)
│   │   ├── transactions/      # Transaction history
│   │   ├── invoices/          # Invoice management
│   │   └── settings/          # Store settings
│   ├── api/                   # API routes (checkout, webhooks, etc.)
│   └── layout.tsx             # Root layout with PWA + offline init
├── components/
│   ├── ui/                    # shadcn/ui primitives
│   ├── pos/                   # POS components (ProductGrid, PaymentDrawer, etc.)
│   ├── inventory/             # ProductTable, StockUpdateForm, etc.
│   ├── financial/             # PaymentMethodBreakdown, TopProfitContributors
│   ├── transactions/          # TransactionTable
│   └── invoices/              # InvoicesView, InvoiceRow, EditInvoiceDialog
├── lib/
│   ├── stores/                # Zustand stores (cartStore, uiStore, syncStore)
│   ├── supabase/              # client.ts, server.ts, queries.ts
│   ├── types/                 # Shared types + generated database.ts
│   ├── offlineDb.ts           # Dexie.js IndexedDB schema
│   └── utils.ts               # cn(), formatCurrency(), etc.
public/
├── favicon.svg                # Website favicon
├── banner.png                 # README banner
├── manifest.json              # PWA manifest
├── sw.js                      # Service worker
└── icons/                     # PWA app icons (SVG)
```

## 🔄 Sync Architecture

```
┌──────────────────────────────────────────────────┐
│                  Online Mode                      │
│  ┌──────────┐    ┌──────────────┐                 │
│  │ Supabase │◄──►│  Realtime    │  (silent sync)  │
│  │  Server  │    │  Provider    │                  │
│  └────┬─────┘    └──────┬───────┘                 │
│       │                 │                         │
│  ┌────▼─────┐    ┌──────▼───────┐                 │
│  │  Dexie   │◄───│ Product Grid │                 │
│  │ IndexedDB│    │  + Cart      │                 │
│  └──────────┘    └──────────────┘                 │
│                                                   │
│  ┌──────────────────┐                             │
│  │ Offline Queue    │──── online event ──────────►│
│  │ (PENDING_SYNC)   │    POST /api/checkout       │
│  └──────────────────┘                             │
└──────────────────────────────────────────────────┘

         ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
         │    Offline Mode        │
         │  ┌──────────────────┐  │
         │  │  Read from Dexie  │  │
         │  │  Queue to Dexie   │  │
         │  └──────────────────┘  │
         └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

## 📊 Development Status

### ✅ Completed
- [x] Project setup & Supabase integration
- [x] Authentication & role-based routing
- [x] Database schema, migrations, RLS policies
- [x] TypeScript types & strict mode
- [x] Theme system (light/dark)
- [x] Mobile-first responsive layout
- [x] Sidebar + bottom navigation
- [x] POS system (product grid, cart, barcode scanner)
- [x] Checkout flow (cash, QRIS, WA invoice, invoice/piutang)
- [x] Inventory management (CRUD, stock updates)
- [x] Transaction history with bulk delete
- [x] Invoice management (mark paid, edit, WA reminder)
- [x] Financial page (P&L, payment breakdown, top products)
- [x] Pagination (POS 25, inventory 30, invoices 10, transactions 15)
- [x] Navigation progress bar + prefetching
- [x] PWA support (manifest, service worker, iOS meta tags)
- [x] **Offline mode** (Dexie.js cache, offline transaction queue)
- [x] **Real-time sync** (Supabase Realtime for products)
- [x] **Offline queue auto-sync** (on `online` event)

### 🚧 In Progress
- [ ] Enhanced real-time sync for transactions & invoices
- [ ] Sales analytics dashboard
- [ ] Receipt printing

### 📋 Planned
- [ ] WhatsApp Business API integration
- [ ] Barcode label printing
- [ ] Multi-store management
- [ ] Export reports (CSV/Excel)
- [ ] Supplier management

## 📖 Documentation

- [AGENTS.md](./AGENTS.md) — Development conventions & commands
- [Supabase README](./supabase/README.md) — Database schema & policies
- [Supabase SETUP GUIDE](./supabase/SETUP_GUIDE.md) — Initial setup

## 🤝 Contributing

1. Read `AGENTS.md` for conventions
2. Maintain database schema with migrations
3. Run `npm run db:types` after schema changes
4. Test both light & dark mode
5. Run `npm run build` before committing

---

<p align="center">
  Built with ❤️ for UMKM Indonesia
  <br />
  <strong>SentraOps</strong> — MIT License · All Rights Reserved
</p>
