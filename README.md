# 🚀 SentraOps - Operations Dashboard untuk UMKM

**Status:** ✅ Database Ready | 🚧 Active Development

A mobile-first operations dashboard designed for MSME (Micro, Small, and Medium Enterprises / UMKM) businesses. Built with Next.js 15+, React 19, TypeScript, and Tailwind CSS with full Supabase integration.

## ✨ Features

- 🔐 **Multi-method authentication** (email/password + magic links)
- 📊 **Real-time business dashboard** dengan health check 3 detik
- 🛒 **Mobile POS system** - tap-and-go cashier
- 📦 **Inventory management** dengan low-stock alerts
- 💰 **Financial reports** - otomatis P&L generation
- 🎨 **Fresh-organic design** - minimalist dengan dual theme
- 📱 **Mobile-first responsive** - optimized untuk touchscreen
- 🔒 **Multi-tenant ready** - RLS isolation per toko

## 🛠️ Tech Stack

- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS v4
- **UI Library**: Shadcn/ui + Radix UI
- **State Management**: Zustand
- **Backend**: ✅ **Supabase** (PostgreSQL + Auth + Real-time)
- **Icons**: Lucide React
- **Theme**: next-themes (Dark/Light mode)

## 📊 Database Status

### ✅ SETUP COMPLETED!

Database sudah 100% siap digunakan dengan:
- ✅ **5 Tables Created** (stores, profiles, products, transactions, transaction_items)
- ✅ **RLS Policies Enabled** untuk multi-tenant isolation
- ✅ **TypeScript Types Generated** untuk type safety
- ✅ **Migration Applied** to Supabase remote
- ✅ **Sample Seed Data** available

**Quick Commands:**
```bash
npm run db:types    # Regenerate TypeScript types
npm run db:push     # Push new migrations
npm run db:pull     # Pull remote schema
```

**📖 Full Documentation:**
- [Database Setup Complete](./DATABASE_SETUP_COMPLETE.md) - Complete setup summary
- [Quick Reference](./QUICK_REFERENCE.md) - Command cheat sheet
- [Setup Guide](./supabase/SETUP_GUIDE.md) - Detailed setup instructions
- [Migration Status](./supabase/MIGRATION_STATUS.md) - Migration logs

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   │   └── login/
│   ├── (dashboard)/       # Dashboard routes
│   │   ├── pos/           # Point of Sale
│   │   ├── inventory/     # Inventory management
│   │   └── financial/     # Financial reports
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   ├── pos/              # POS components
│   ├── inventory/        # Inventory components
│   ├── financial/        # Financial components
│   └── ui/               # Shared UI components
└── lib/                   # Utility libraries
    ├── supabase/         # ✅ Supabase client & utilities
    │   ├── client.ts     # Client-side with types
    │   ├── server.ts     # Server-side with types
    │   └── queries.ts    # Database queries
    ├── stores/           # Zustand state stores
    ├── types/            # ✅ TypeScript types
    │   └── database.ts   # Generated from Supabase
    └── utils/            # Helper functions
```

**Additional Files:**
```
supabase/
├── migrations/           # ✅ Database migrations
│   └── 20260608_initial_schema.sql
├── seed.sql             # ✅ Sample data
├── config.toml          # ✅ Supabase config
├── README.md            # Database documentation
└── SETUP_GUIDE.md       # Setup instructions

.clinerules/             # AI Agent rules
├── SOURCE_OF_TRUTH.md   # Architecture & workflows
├── DESIGN.md            # UI/UX guidelines
└── AGENTS.md            # Agent instructions
```

## Getting Started

### Prerequisites

- Node.js 20+ 
- npm, yarn, or pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:types` - ✅ Generate TypeScript types from database
- `npm run db:push` - ✅ Push migrations to Supabase
- `npm run db:pull` - ✅ Pull schema from remote
- `npm run db:migration` - ✅ Create new migration

## Development Guidelines

### Database Operations

**Always use TypeScript types:**
```typescript
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'

const supabase = createClient()
const { data: products } = await supabase.from('products').select('*')
// products is fully typed! ✅
```

**After schema changes:**
```bash
npm run db:push      # Push migration
npm run db:types     # Regenerate types
```

### Server vs Client Components

- **Server Components (default)**: Use for data fetching, layouts, and static content
- **Client Components ("use client")**: Use for interactivity, state management, and browser APIs

### Code Quality

- TypeScript strict mode enabled
- ESLint configured with Next.js recommended rules
- Tailwind CSS v4 with PostCSS

### Performance Targets

- Dashboard loads within 3 seconds on 3G networks
- Server-side rendering for initial page loads
- Lazy loading for images and non-critical components
- Minimum 48px touch targets for mobile usability

---

## 📖 Documentation

### Core Documentation
- [SOURCE_OF_TRUTH.md](./.clinerules/SOURCE_OF_TRUTH.md) - Architecture, workflows, database schema
- [DESIGN.md](./.clinerules/DESIGN.md) - UI/UX guidelines & design system
- [AGENTS.md](./.clinerules/AGENTS.md) - AI agent development rules

### Database Documentation
- [DATABASE_SETUP_COMPLETE.md](./DATABASE_SETUP_COMPLETE.md) - ✅ Setup completion report
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Quick command reference
- [supabase/README.md](./supabase/README.md) - Database schema & policies
- [supabase/SETUP_GUIDE.md](./supabase/SETUP_GUIDE.md) - Detailed setup guide
- [supabase/MIGRATION_STATUS.md](./supabase/MIGRATION_STATUS.md) - Migration logs

---

## 🔗 Useful Links

- **Supabase Dashboard:** https://supabase.com/dashboard/project/hvpafhhbzstvtxxzsxvz
- **Next.js Docs:** https://nextjs.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Shadcn/ui:** https://ui.shadcn.com

---

## 🤝 Contributing

Proyek ini menggunakan strict guidelines untuk consistency:
1. ✅ Baca `AGENTS.md` sebelum coding
2. ✅ Follow design system di `DESIGN.md`
3. ✅ Maintain database schema dengan migrations
4. ✅ Update types setelah schema changes (`npm run db:types`)
5. ✅ Test dark/light mode compatibility

---

## 📝 Environment Setup

File `.env.local` sudah dikonfigurasi dengan Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://hvpafhhbzstvtxxzsxvz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_***
SUPABASE_SERVICE_ROLE_KEY=sb_secret_***
```

⚠️ **SECURITY:** File ini di `.gitignore` - JANGAN commit ke git!

---

## 🎯 Development Status

### ✅ Completed
- [x] Database schema & migrations
- [x] Authentication UI
- [x] Theme system (Light/Dark)
- [x] TypeScript types & type safety
- [x] Project structure & components
- [x] Supabase integration

### 🚧 In Progress
- [ ] Main Dashboard implementation
- [ ] POS System development
- [ ] Inventory Management
- [ ] Financial Reports

### 📋 Planned
- [ ] Mobile PWA support
- [ ] Offline mode
- [ ] Real-time sync
- [ ] WhatsApp integration
- [ ] Receipt printing

---

## License

Private - All Rights Reserved
