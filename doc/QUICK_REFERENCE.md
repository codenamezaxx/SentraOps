# 🚀 Quick Reference - SentraOps Database

## 📦 Instalasi & Setup (✅ SUDAH SELESAI)

Setup sudah lengkap! Referensi ini untuk maintenance dan development.

---

## 🔧 NPM Scripts

```bash
# Development
npm run dev                 # Start Next.js dev server

# Database Operations
npm run db:types           # Generate TypeScript types dari database
npm run db:push            # Push migrations ke Supabase
npm run db:pull            # Pull schema dari remote
npm run db:migration       # Buat migration baru (tambahkan nama)

# Build & Lint
npm run build              # Build production
npm run lint               # Run ESLint
```

---

## 🗄️ Database Tables Cheat Sheet

### 1. stores
```typescript
{
  id: string (UUID)
  owner_id: string (UUID, FK to auth.users)
  name: string
  created_at: timestamp
}
```

### 2. profiles
```typescript
{
  id: string (UUID)
  auth_id: string (UUID, FK to auth.users)
  store_id: string (UUID, FK to stores)
  role: 'owner' | 'cashier'
  name: string | null
  created_at: timestamp
}
```

### 3. products
```typescript
{
  id: string (UUID)
  store_id: string (UUID, FK to stores)
  name: string
  barcode: string | null
  price: number (decimal)
  cost_price: number (decimal)
  stock_quantity: number (integer)
  min_stock_threshold: number (integer, default: 5)
  category: string | null
  created_at: timestamp
}
```

### 4. transactions
```typescript
{
  id: string (UUID)
  store_id: string (UUID, FK to stores)
  cashier_id: string (UUID, FK to profiles)
  total_amount: number (decimal)
  payment_method: 'cash' | 'qris' | 'whatsapp_invoice'
  status: 'completed' | 'pending' | 'cancelled'
  created_at: timestamp
}
```

### 5. transaction_items
```typescript
{
  id: string (UUID)
  transaction_id: string (UUID, FK to transactions)
  product_id: string (UUID, FK to products)
  quantity: number (integer)
  price_at_time: number (decimal)
  cost_price_at_time: number (decimal)
}
```

---

## 🔐 RLS Policy Reference

Semua query otomatis ter-filter berdasarkan:
- `auth.uid()` - User authentication
- `store_id` - Multi-tenant isolation

**Tidak perlu manual filter!** RLS akan handle secara otomatis.

---

## 💻 Usage Examples

### Query dengan Type Safety
```typescript
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'

const supabase = createClient()

// Select products (auto type-safe!)
const { data: products } = await supabase
  .from('products')
  .select('*')
  .lt('stock_quantity', 10) // Low stock filter

// Insert new product
const { data, error } = await supabase
  .from('products')
  .insert({
    name: 'Kopi Latte',
    price: 20000,
    cost_price: 12000,
    stock_quantity: 50,
    category: 'Minuman'
  })
```

### Server-Side Query
```typescript
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: stats } = await supabase
    .from('transactions')
    .select('total_amount')
    .eq('status', 'completed')
    .gte('created_at', new Date().toISOString().split('T')[0])
}
```

### With Relations
```typescript
// Get transactions with items and products
const { data } = await supabase
  .from('transactions')
  .select(`
    *,
    transaction_items (
      *,
      products (
        name,
        category
      )
    ),
    profiles:cashier_id (
      name
    )
  `)
  .eq('status', 'completed')
```

---

## 📊 Common Queries

### Dashboard Stats
```sql
-- Total penjualan hari ini
SELECT SUM(total_amount) 
FROM transactions 
WHERE DATE(created_at) = CURRENT_DATE 
  AND status = 'completed';

-- Produk dengan stok rendah
SELECT * FROM products 
WHERE stock_quantity < min_stock_threshold;

-- Invoice yang overdue
SELECT * FROM transactions 
WHERE status = 'pending' 
  AND payment_method = 'whatsapp_invoice'
  AND created_at < NOW() - INTERVAL '3 days';
```

### Financial Reports
```sql
-- Revenue dan profit bulan ini
SELECT 
  DATE(created_at) as date,
  SUM(total_amount) as revenue,
  SUM(
    SELECT SUM((price_at_time - cost_price_at_time) * quantity)
    FROM transaction_items
    WHERE transaction_id = transactions.id
  ) as profit
FROM transactions
WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
  AND status = 'completed'
GROUP BY DATE(created_at);
```

### Inventory Analytics
```sql
-- Produk terlaris 30 hari terakhir
SELECT 
  p.name,
  p.category,
  SUM(ti.quantity) as total_sold,
  SUM(ti.quantity * ti.price_at_time) as revenue
FROM transaction_items ti
JOIN products p ON ti.product_id = p.id
JOIN transactions t ON ti.transaction_id = t.id
WHERE t.created_at >= NOW() - INTERVAL '30 days'
  AND t.status = 'completed'
GROUP BY p.id, p.name, p.category
ORDER BY total_sold DESC
LIMIT 10;
```

---

## 🔄 Migration Workflow

### Create New Migration
```bash
# 1. Create migration file
npm run db:migration add_column_to_products

# 2. Edit the file in supabase/migrations/
# Example: supabase/migrations/20260609_add_column_to_products.sql
```

### Write Migration
```sql
-- Add new column
ALTER TABLE products 
ADD COLUMN image_url TEXT;

-- Add index
CREATE INDEX idx_products_category 
ON products(category);

-- Update RLS if needed
CREATE POLICY "New policy name" ON products
  FOR SELECT USING (/* condition */);
```

### Apply Migration
```bash
# 3. Push to remote
npm run db:push

# 4. Regenerate types
npm run db:types
```

---

## 🛠️ Maintenance Commands

```bash
# Check migration status
supabase migration list

# View remote changes
supabase db remote changes

# Pull schema dari remote
npm run db:pull

# Reset local database (development only!)
supabase db reset

# Generate types
npm run db:types
```

---

## 🔗 Important Links

- **Supabase Dashboard:** https://supabase.com/dashboard/project/hvpafhhbzstvtxxzsxvz
- **SQL Editor:** https://supabase.com/dashboard/project/hvpafhhbzstvtxxzsxvz/sql
- **Table Editor:** https://supabase.com/dashboard/project/hvpafhhbzstvtxxzsxvz/editor
- **Auth Settings:** https://supabase.com/dashboard/project/hvpafhhbzstvtxxzsxvz/auth/users
- **Storage:** https://supabase.com/dashboard/project/hvpafhhbzstvtxxzsxvz/storage

---

## 📝 File Locations

```
Project Files:
- Migration: supabase/migrations/20260608_initial_schema.sql
- Seed Data: supabase/seed.sql
- Types: src/lib/types/database.ts
- Client: src/lib/supabase/client.ts
- Server: src/lib/supabase/server.ts
- Queries: src/lib/supabase/queries.ts
- Env: .env.local

Documentation:
- Setup Guide: supabase/SETUP_GUIDE.md
- Database Docs: supabase/README.md
- Completion: DATABASE_SETUP_COMPLETE.md
- Source of Truth: .clinerules/SOURCE_OF_TRUTH.md
```

---

## ⚡ Performance Tips

1. **Always use indexes** untuk kolom yang sering di-query
2. **Use select()** dengan specific columns, bukan `*`
3. **Batch operations** untuk multiple inserts
4. **Use RPC functions** untuk complex logic
5. **Enable query caching** dengan Supabase realtime

---

## 🐛 Common Issues & Fixes

### Issue: "row-level security policy violation"
**Fix:** Pastikan user sudah login dan memiliki profile dengan `store_id`

### Issue: Types not updating
**Fix:** Run `npm run db:types` setelah migration

### Issue: Cannot connect to database
**Fix:** 
1. Cek `.env.local` credentials
2. Restart dev server
3. Check Supabase project status

### Issue: Migration conflict
**Fix:**
```bash
supabase db pull
supabase db push
```

---

## 🎯 Best Practices

✅ **DO:**
- Use TypeScript types dari `database.ts`
- Filter by RLS (otomatis)
- Use transactions untuk multiple writes
- Handle errors dengan try/catch
- Validate inputs sebelum insert

❌ **DON'T:**
- Commit `.env.local` ke git
- Skip migrations (selalu buat migration untuk schema changes)
- Bypass RLS dengan service role key di client
- Use `SELECT *` dalam production queries
- Hardcode UUID values

---

**Last Updated:** 2026-06-08
**Version:** 1.1.1
