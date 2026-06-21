# Deployment SentraOps

## Prasyarat

- Node.js >= 20
- npm >= 10
- Akun Supabase (gratis tier cukup)
- Akun Vercel atau hosting Node.js lainnya

## Environment Variables

Buat file `.env.local` (tidak di-commit):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Catatan:** Anon key aman digunakan di client karena dilindungi RLS.

## Build

```bash
npm run build
```

Build akan menjalankan TypeScript type checking dan mengoptimasi output.

**Output:** `.next/` folder siap di-deploy.

## Deployment ke Vercel (Recommended)

### Automatic:
1. Push repository ke GitHub
2. Import di Vercel
3. Set environment variables di dashboard Vercel
4. Deploy

### Manual via CLI:
```bash
npm i -g vercel
vercel --prod
```

Set environment variables:
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## Deployment Alternatif

### Node.js Server
```bash
npm run build
node .next/standalone/server.js
```

Pastikan `output: 'standalone'` di `next.config.ts` sudah diatur.

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci && npm run build
EXPOSE 3000
CMD ["node", ".next/standalone/server.js"]
```

## Database Setup

1. Buat project di [Supabase](https://supabase.com)
2. Jalankan migrasi:
```bash
npm run db:push
```

3. Generate tipe TypeScript (opsional):
```bash
npm run db:types
```

4. Atur RLS policies (otomatis dari migrasi)

## Checklist Pre-deploy

- [ ] Semua environment variables ter-set
- [ ] Build sukses (`npm run build`)
- [ ] Semua tes lulus (`npm run test:run`)
- [ ] RLS policies aktif di Supabase
- [ ] Supabase project bukan mode "paused"
- [ ] URL Supabase production (bukan localhost)
- [ ] Domain dikonfigurasi (jika kustom)

## Post-deploy

- [ ] Verifikasi login flow
- [ ] Verifikasi role-based access
- [ ] Test POS workflow
- [ ] Test checkout → transaksi
- [ ] Verifikasi dark mode
- [ ] Cek mobile responsive
- [ ] Monitor error tracking (jika ada)

## Troubleshooting

### Build Error: "Module not found"
```bash
npm ci  # Clean install
npm run build  # Coba lagi
```

### Supabase Connection Error
- Verifikasi `NEXT_PUBLIC_SUPABASE_URL` dan `ANON_KEY`
- Pastikan Supabase project aktif
- Cek IP restrictions di Supabase dashboard

### Auth Not Working
- Verifikasi callback URL di Supabase Auth settings
- Pastikan cookie handling benar (middleware.ts)
- Cek bahwa `@supabase/ssr` versi kompatibel

### RLS Blocking Queries
- Cek policy di Supabase SQL editor
- Pastikan `store_id` konsisten
- Query dengan filter `store_id` eksplisit di kode

## Scripts Berguna

```bash
npm run dev            # Development server
npm run build          # Production build
npm run lint           # ESLint check
npm run test:run       # Test all
npm run db:types       # Sync DB types
npm run db:push        # Push migrations
```
