# API Routes SentraOps

Semua API route berada di `src/app/api/`. Endpoint tidak diawali `/api` saat dipanggil dari Next.js Client.

---

## Transaksi

### `POST /api/checkout`
Proses checkout (mengubah keranjang menjadi transaksi).

**Request Body:**
```json
{
  "paymentMethod": "cash",
  "amountPaid": 50000
}
```

**Response:** `{ transaction, change, receiptUrl }`

---

### `GET /api/transactions`
Ambil daftar transaksi.

**Query Parameters:** `dateFrom`, `dateTo`

**Response:** `Transaction[]`

---

### `GET /api/transactions/status`
Ambil ringkasan transaksi.

**Response:** `{ todayCount, todayRevenue, averageTransaction }`

---

## Produk

### `POST /api/products/add`
Tambah produk baru. *Owner only.*

**Request Body:**
```json
{
  "name": "Nama Produk",
  "sku": "SKU-001",
  "price": 15000,
  "cost": 10000,
  "stock": 50,
  "category": "Makanan",
  "barcode": "8991234567890"
}
```

**Response:** `{ product }`

---

### `POST /api/products/update`
Update produk. *Owner only.*

**Request Body:** `{ id, ...fieldsToUpdate }`

---

### `POST /api/products/delete`
Hapus produk. *Owner only.*

**Request Body:** `{ id }`

---

### `POST /api/products/stock`
Update stok (tambah/kurang). *Owner only.*

**Request Body:** `{ id, quantity, type: 'add' | 'remove' | 'set' }`

---

## Staf

### `POST /api/staff/create`
Tambah staf baru. *Owner only.*

**Request Body:** `{ email, password, fullName, ... }`

---

### `POST /api/staff/update`
Update data staf. *Owner only.*

---

### `POST /api/staff/delete`
Hapus staf. *Owner only.*

---

### `GET /api/search/staff`
Cari staf. *Owner only.*

**Query Parameters:** `q` (pencarian nama)

---

## Keuangan

### `GET /api/financial/summary`
Ringkasan keuangan. *Owner only.*

**Query Parameters:** `period` (`'daily' | 'weekly' | 'monthly' | 'yearly'`)

**Response:** `{ revenue, expenses, profit, profitMargin, ... }`

---

### `GET /api/financial/revenue-breakdown`
Rincian pendapatan. *Owner only.*

**Response:** Revenue grouped by date dan payment method.

---

### `GET /api/financial/top-products`
Produk dengan profit tertinggi. *Owner only.*

---

### `POST /api/financial/export`
Export laporan keuangan ke PDF. *Owner only.*

**Request Body:** `{ period }`

---

## Pengeluaran

### `POST /api/expenses/create`
Tambah pengeluaran. *Owner only.*

**Request Body:** `{ category, description, amount }`

---

### `POST /api/expenses/delete`
Hapus pengeluaran. *Owner only.*

---

## Faktur

### `POST /api/invoices/create`
Buat faktur baru.

**Request Body:** `{ customerName, total, dueDate, notes? }`

---

### `POST /api/invoices/edit`
Edit faktur.

---

### `POST /api/invoices/delete`
Hapus faktur.

---

### `POST /api/invoices/mark-paid`
Tandai faktur sebagai lunas.

---

### `POST /api/invoices/create-reminder`
Buat pengingat faktur.

---

## Toko

### `GET /api/store/settings`
Ambil pengaturan toko.

---

### `POST /api/store/settings`
Update pengaturan toko. *Owner only.*

---

## Webhook

### `POST /api/webhooks/payment`
Webhook pembayaran eksternal.

---

## Pola Umum

### Autentikasi
Semua API route (kecuali webhook) memvalidasi session dari cookie. API route yang membutuhkan role `owner` melakukan query `profiles.role` di body handler.

### Error Response
```json
{
  "error": "Deskripsi error"
}
```
Status code: 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found), 500 (server error).

### Success Response
```json
{
  // Data sesuai endpoint
}
```
Status code: 200 (success), 201 (created).
