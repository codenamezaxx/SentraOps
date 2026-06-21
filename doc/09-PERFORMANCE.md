# Performance SentraOps

## Ringkasan Optimasi

| Area | Teknik | Status |
|------|--------|--------|
| Rendering | Server Components by default | ✅ |
| Loading | Loading skeletons + Suspense boundaries | ✅ |
| Navigation | Navigation progress bar | ✅ |
| Images | next/image dengan AVIF/WebP | ✅ |
| Bundle | next/dynamic + dynamic imports | ✅ |
| Cache | Cache TTL headers | ✅ |
| Fonts | next/font (Google Fonts) | ✅ |
| SSR | Streaming + progressive rendering | ✅ |

---

## 1. Server Components

Semua komponen default ke Server Component. `"use client"` hanya untuk komponen yang membutuhkan:
- Interaktivitas (event handlers, hooks)
- State management (Zustand)
- Context providers (ThemeProvider, Toaster)

**Manfaat:** HTML dirender di server, mengurangi JavaScript dikirim ke client.

---

## 2. Loading States

Setiap halaman dashboard memiliki file `loading.tsx` dengan skeleton:

```
src/app/(dashboard)/
├── loading.tsx           # Skeleton global dashboard
├── pos/loading.tsx       # Skeleton POS (produk + cart)
├── inventory/loading.tsx # Skeleton tabel produk
├── financial/loading.tsx # Skeleton chart keuangan
├── staff/loading.tsx     # Skeleton tabel staf
├── expenses/loading.tsx  # Skeleton daftar pengeluaran
├── transactions/loading.tsx
├── invoices/loading.tsx
└── settings/loading.tsx
```

**PhantomSkeleton** (`src/components/ui/PhantomSkeleton.tsx`) — komponen skeleton modular dengan animasi pulse yang bisa dikustomisasi dimensinya.

**NavigationProgress** (`src/components/ui/NavigationProgress.tsx`) — progress bar di atas halaman saat navigasi antar route.

---

## 3. Lazy Loading / Code Splitting

Komponen berat di-load on-demand:

```typescript
import dynamic from 'next/dynamic'

const RevenueChart = dynamic(() => import('./RevenueChart'), {
  loading: () => <ChartSkeleton />
})
```

**Komponen yang di-lazy load:**
- `RevenueChart` — Chart.js (library heavy)
- `PaymentDrawer` — Hanya muncul saat checkout
- `CameraScanner` — Hanya muncul saat scan barcode
- `ProductForm` — Modal/tidak selalu terlihat

---

## 4. Image Optimization (`next.config.ts`)

```typescript
images: {
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200],
  remotePatterns: [{ protocol: 'https', hostname: '**.supabase.co' }],
}
```

- AVIF dan WebP untuk ukuran file lebih kecil
- Remote images dari Supabase Storage dioptimasi otomatis
- Device-aware image sizing
- Cache TTL 60 detik untuk gambar dinamis

---

## 5. Bundle Optimization

- **Dynamic imports** untuk komponen berat (Chart.js, kamera)
- **Tree shaking** via ES modules
- **next/dynamic** dengan `ssr: false` untuk komponen client-only
- Bundle analyzer tersedia untuk audit

---

## 6. Font Optimization

```typescript
import { Plus_Jakarta_Sans, Be_Vietnam_Pro } from 'next/font/google'

const headingFont = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-heading' })
const bodyFont = Be_Vietnam_Pro({ subsets: ['latin'], weight: 'variable', variable: '--font-body' })
```

- Zero layout shift (swap strategy)
- Variable fonts untuk weight range (400-800)
- CSS variables untuk konsistensi

---

## 7. SSR Optimization

- **Streaming** via Suspense boundaries
- **Progressive rendering:** Skeleton ditampilkan segera, konten mengalir
- **Data fetching paralel** di layout
- **Edge-ready** (Next.js 16 edge runtime support)

---

## 8. Cache Strategy

| Tipe | Cache | Durasi |
|------|-------|--------|
| Pages (static) | CDN / ISR | On-demand |
| API responses | No cache (dynamic) | — |
| Images (next/image) | Browser + CDN | 60s |
| Supabase queries | None (real-time) | — |

---

## 9. Nilai Target

| Metrik | Target | Alat Ukur |
|--------|--------|-----------|
| Lighthouse Performance | ≥ 90 | Playwright + Lighthouse |
| First Contentful Paint | < 1.5s | Playwright |
| Time to Interactive | < 3s | Playwright |
| Bundle size (JS) | < 200KB (initial) | Bundle analyzer |
| Image weight | < 100KB per image | next/image |
