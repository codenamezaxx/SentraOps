# Security SentraOps

## Ringkasan

Lapisan keamanan diterapkan di beberapa level: input, network, API, database, dan session.

---

## 1. Input Sanitization (`src/lib/sanitize.ts`)

Enam fungsi sanitasi untuk membersihkan input user:

| Fungsi | Kegunaan | Contoh |
|--------|----------|--------|
| `sanitizeString(s)` | Hapus karakter tidak aman | `sanitizeString('<script>')` → `'script'` |
| `sanitizeEmail(s)` | Validasi dan sanitasi email | Hanya karakter valid email |
| `sanitizePhone(s)` | Hanya angka dan `+`, `-`, `()` | |
| `sanitizeNumeric(s)` | Hanya angka | |
| `sanitizeSearch(s)` | Sanitasi untuk pencarian | Hapus karakter khusus query |
| `sanitizeHtml(s)` | Hapus tag HTML | Mirip strip tags |

**Penggunaan:** Panggil sebelum menyimpan atau memproses input user.
```typescript
import { sanitizeString, sanitizeNumeric } from '@/lib/sanitize'
const clean = sanitizeString(userInput)
```

---

## 2. CSRF Protection (`src/lib/csrf.ts`)

Protection terhadap Cross-Site Request Forgery pada mutasi state.

**Cara kerja:**
- Token CSRF dibuat per session menggunakan `crypto.randomUUID()`
- Token disimpan di sessionStorage browser
- Setiap request mutasi menyertakan token di header `x-csrf-token`
- Server memvalidasi token sebelum memproses request

```typescript
import { getCsrfToken, validateCsrfToken } from '@/lib/csrf'

// Client
fetch('/api/checkout', {
  method: 'POST',
  headers: { 'x-csrf-token': getCsrfToken() },
  body: JSON.stringify(data)
})
```

---

## 3. Rate Limiting (`src/lib/rateLimit.ts`)

Pembatasan request untuk mencegah abuse dan brute force.

**Implementasi:** In-memory sliding window.

```typescript
import { checkRateLimit } from '@/lib/rateLimit'

// Di API route
const { allowed, retryAfter } = checkRateLimit('endpoint_name', userId)
if (!allowed) {
  return Response.json(
    { error: `Too many requests. Try again in ${retryAfter}s.` },
    { status: 429 }
  )
}
```

**Fitur:**
- Per-user dan per-endpoint
- Konfigurasi limit per endpoint
- Retry-After header
- Cleanup periodik entries kedaluwarsa

---

## 4. Network Retry (`src/lib/fetchWithRetry.ts`)

Retry mechanism untuk network request dengan exponential backoff.

```typescript
import { fetchWithRetry } from '@/lib/fetchWithRetry'

const data = await fetchWithRetry('/api/data', {
  maxRetries: 3,
  initialDelayMs: 1000,
})
```

**Fitur:**
- Exponential backoff: delay = `initialDelay * 2^attempt`
- Jitter acak untuk menghindari thundering herd
- Configurable max retries
- Hanya retry untuk error network (5xx, timeout), bukan 4xx

---

## 5. Authentication & Session

Lihat [03-AUTH.md](./03-AUTH.md) untuk detail lengkap.

Poin kunci:
- Session cookies httpOnly
- Refresh token rotation otomatis
- `getUser()` (verify token) bukan `getSession()` di server
- Role dicek di server-side, tidak hanya UI

---

## 6. Row Level Security (RLS)

Lihat [02-DATABASE.md](./02-DATABASE.md) untuk detail kebijakan RLS.

Poin kunci:
- Semua tabel memiliki RLS aktif
- Isolasi data berdasarkan `store_id`
- Policy SELECT/INSERT/UPDATE/DELETE untuk setiap tabel

---

## 7. API Route Protection

Setiap API route memvalidasi:
1. **Session**: Validasi token dari cookie
2. **Role**: Query `profiles.role` untuk endpoint owner-only
3. **Input**: Sanitasi sebelum diproses
4. **Rate limit**: Pengecekan batas request
5. **CSRF**: Validasi token untuk mutasi state

---

## Checklist Keamanan

| Aspek | Status |
|-------|--------|
| Input sanitasi | ✅ 6 fungsi |
| CSRF protection | ✅ Token-based |
| Rate limiting | ✅ In-memory sliding window |
| Network retry | ✅ Exponential backoff |
| SQL injection | ✅ Via Supabase parameterized queries |
| XSS protection | ✅ Sanitasi + Next.js auto-escaping |
| RLS policies | ✅ Semua tabel |
| Role-based access | ✅ Middleware + API + UI |
| Session management | ✅ Supabase SSR cookies |
| Secure headers | ✅ Next.js default |
