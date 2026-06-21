# Autentikasi & Otorisasi SentraOps

## Arsitektur

SentraOps menggunakan **Supabase SSR** untuk autentikasi dengan cookie-based sessions. Tidak ada JWT yang dikelola manual — semua ditangani oleh `@supabase/ssr`.

```
Browser ──► Next.js ──► Supabase Auth
             │
             ├── proxy.ts (cookie refresh + role check)
             ├── server.ts (Server Components / API Routes)
             └── client.ts (Client Components)
```

## Alur Login

1. User mengisi kredensial di `LoginForm`
2. `supabase.auth.signInWithPassword()` dipanggil dari client
3. Supabase mengembalikan session (access + refresh token)
4. Middleware mendeteksi session cookie di request berikutnya
5. User diarahkan ke halaman dashboard (`/`)

## Proxy (`src/proxy.ts`)

Middleware berjalan di setiap request (kecuali API routes dan static files) dan melakukan:

### 1. Cookie Session Refresh
```typescript
const { data: { user } } = await supabase.auth.getUser()
```
Memperbarui session cookies setiap request agar tidak kedaluwarsa.

### 2. Role-based Route Protection
```typescript
const ownerOnlyRoutes = ['/financial', '/staff', '/inventory', '/expenses', '/settings']
```
- Jika user bukan `owner` dan mengakses route owner-only → redirect ke `/access-denied`
- Query profil dilakukan via Supabase Server Client

### 3. Auth Route Redirect
- User sudah login mengakses `/login` atau `/signup` → redirect ke `/`
- User belum login mengakses halaman dashboard → redirect ke `/login`

### 4. Route Skip
Middleware tidak berjalan di:
- `/_next/static/*`
- `/_next/image/*`
- `/favicon.ico`
- `/api/*`

## Supabase Clients

### Client-side (`src/lib/supabase/client.ts`)
```typescript
import { createBrowserClient } from '@supabase/ssr'
```
Untuk interaksi auth dari browser: login, logout, signup, reset password.

### Server-side (`src/lib/supabase/server.ts`)
```typescript
import { createServerClient } from '@supabase/ssr'
```
Untuk Server Components dan API Routes. Mengelola cookie secara manual.

## Role System

Dua role: **owner** dan **staff**.

| Fitur | Owner | Staff |
|-------|-------|-------|
| POS (point of sale) | ✅ | ✅ |
| Dashboard utama | ✅ | ✅ |
| Manajemen produk | ✅ | ❌ |
| Laporan keuangan | ✅ | ❌ |
| Manajemen staf | ✅ | ❌ |
| Pengeluaran | ✅ | ❌ |
| Pengaturan toko | ✅ | ❌ |
| Manajemen faktur | ✅ | ✅ |

Role disimpan di tabel `profiles.role` dan diverifikasi di:
- **Middleware** (redirect level)
- **API Routes** (server-side check)
- **Client** (UI conditional rendering via `RequireOwner` component)

## Komponen Auth

| Komponen | Fungsi |
|----------|--------|
| `LoginForm` | Form login email + password |
| `SignupForm` | Form registrasi akun baru |
| `ForgotPasswordForm` | Form lupa password |
| `ResetPasswordForm` | Form reset password |
| `RequireOwner` | Wrapper yang menyembunyikan konten untuk non-owner |
| `PasswordToggle` | Tombol show/hide password |

## Auth Routes

| Route | Metode | Deskripsi |
|-------|--------|-----------|
| `/login` | GET | Halaman login |
| `/signup` | GET | Halaman registrasi |
| `/forgot-password` | GET | Halaman lupa password |
| `/reset-password` | GET | Halaman reset password (dari email) |
| `/auth/callback` | GET | Handler callback Supabase Auth |

## Keamanan

- Semua session menggunakan **httpOnly cookies**
- Refresh token rotation otomatis oleh Supabase
- Role dicek di **server-side** (proxy + API routes), tidak hanya UI
- `auth.getUser()` (bukan `getSession`) digunakan untuk verifikasi token di server
