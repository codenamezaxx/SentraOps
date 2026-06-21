# Database SentraOps

## Teknologi

- **Provider:** Supabase (PostgreSQL)
- **Autentikasi:** Supabase Auth bawaan
- **RLS (Row Level Security):** Diaktifkan di semua tabel, kebijakan berdasarkan `store_id`
- **Tipe Auto-generated:** `src/lib/types/database.ts` — jangan diedit manual, jalankan `npm run db:types`

## Tabel

### `profiles`

Data profil pengguna, terhubung ke Supabase Auth via `id`.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID (PK) | Referensi `auth.users.id` |
| `full_name` | TEXT | Nama lengkap |
| `store_id` | UUID (FK) | Relasi ke `stores.id` |
| `role` | TEXT | `'owner'` atau `'staff'` |
| `created_at` | TIMESTAMPTZ | Waktu dibuat |
| `updated_at` | TIMESTAMPTZ | Waktu diperbarui |

### `stores`

Data toko.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID (PK) | |
| `name` | TEXT | Nama toko |
| `address` | TEXT | Alamat toko |
| `phone` | TEXT | Nomor telepon |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

### `products`

Produk/inventaris toko.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID (PK) | |
| `store_id` | UUID (FK) | Pemilik toko |
| `name` | TEXT | Nama produk |
| `sku` | TEXT | Kode SKU unik |
| `description` | TEXT | Deskripsi produk |
| `price` | INTEGER | Harga jual (dalam rupiah) |
| `cost` | INTEGER | Harga modal |
| `stock` | INTEGER | Jumlah stok |
| `category` | TEXT | Kategori produk |
| `image_url` | TEXT | URL gambar produk |
| `barcode` | TEXT | Kode barcode |
| `is_active` | BOOLEAN | Produk aktif? |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

### `transactions`

Transaksi penjualan.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID (PK) | |
| `store_id` | UUID (FK) | |
| `user_id` | UUID (FK) | Kasir yang memproses |
| `total` | INTEGER | Total dalam rupiah |
| `payment_method` | TEXT | `'cash'`, `'debit'`, `'credit'`, `'qris'`, `'other'` |
| `status` | TEXT | `'completed'`, `'refunded'`, `'cancelled'` |
| `created_at` | TIMESTAMPTZ | |

### `transaction_items`

Item dalam setiap transaksi.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID (PK) | |
| `transaction_id` | UUID (FK) | Induk transaksi |
| `product_id` | UUID (FK) | Produk yang dijual |
| `quantity` | INTEGER | Jumlah |
| `unit_price` | INTEGER | Harga satuan saat transaksi |
| `subtotal` | INTEGER | Total per item |

### `expenses`

Pengeluaran toko.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID (PK) | |
| `store_id` | UUID (FK) | |
| `user_id` | UUID (FK) | |
| `category` | TEXT | Kategori (operational, restock, utility, dll) |
| `description` | TEXT | Deskripsi |
| `amount` | INTEGER | Jumlah dalam rupiah |
| `created_at` | TIMESTAMPTZ | |

### `invoices`

Faktur penjualan kredit / piutang.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID (PK) | |
| `store_id` | UUID (FK) | |
| `customer_name` | TEXT | Nama pelanggan |
| `total` | INTEGER | Total tagihan |
| `paid_amount` | INTEGER | Jumlah sudah dibayar |
| `due_date` | DATE | Jatuh tempo |
| `status` | TEXT | `'paid'`, `'pending'`, `'overdue'` |
| `notes` | TEXT | Catatan |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

### `notifications`

Notifikasi sistem.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID (PK) | |
| `store_id` | UUID (FK) | |
| `type` | TEXT | Tipe notifikasi |
| `title` | TEXT | Judul |
| `message` | TEXT | Pesan |
| `is_read` | BOOLEAN | Status baca |
| `created_at` | TIMESTAMPTZ | |

## Relasi Antar Tabel

```
stores ──┬── profiles (store_id)
         ├── products (store_id)
         ├── transactions (store_id)
         ├── expenses (store_id)
         ├── invoices (store_id)
         └── notifications (store_id)

transactions ──┬── transaction_items (transaction_id)
               └── profiles (user_id)

products ──── transaction_items (product_id)
```

## Row Level Security (RLS)

Semua tabel memiliki kebijakan RLS yang mengisolasi data berdasarkan `store_id`:

```sql
-- Contoh policy untuk tabel products
CREATE POLICY "Users can view their store products"
  ON products FOR SELECT
  USING (store_id = (SELECT store_id FROM profiles WHERE id = auth.uid()));
```

Kebijakan umum:
- **SELECT**: Hanya data dengan `store_id` sesuai profil user
- **INSERT/UPDATE/DELETE**: Sama, ditambah pengecekan role `owner` untuk operasi tertentu

## Migrasi

Migrasi database dikelola melalui Supabase CLI:

```bash
npm run db:push    # Push migrasi lokal ke remote
npm run db:pull    # Pull skema remote ke lokal
npm run db:migration  # Buat file migrasi baru
```

## Tipe Auto-generated

Tipe TypeScript di `src/lib/types/database.ts` digenerate dari skema Supabase:

```bash
npm run db:types
```

File ini **jangan diedit manual** — selalu regenerate setelah perubahan skema.
