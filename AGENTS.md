# AGENTS.md — SentraOps

All-in-One Operations Dashboard for UMKM (Indonesian micro-businesses).
Next.js 16 App Router + Supabase + Tailwind CSS v4.

## Commands

- `npm run dev` — start dev server (localhost:3000)
- `npm run build` — production build (runs TypeScript checks)
- `npm run lint` — ESLint (flat config, eslint-config-next)
- `npm run test` — vitest watch mode
- `npm run test:run` — vitest single run (use for CI / verification)
- `npm run db:types` — regenerate `src/lib/types/database.ts` from Supabase
- `npm run db:push` / `npm run db:pull` — sync local migrations with remote DB
- `npm run db:migration` — create new Supabase migration file

No explicit `typecheck` script; `npm run build` covers type checking.

## Architecture

```
src/
  app/
    (auth)/login/       — login page (public)
    (dashboard)/        — all authenticated routes, layout has sidebar + topbar
      pos/              — point of sale
      inventory/        — product management (owner-only)
      financial/        — financial summary (owner-only)
      transactions/     — transaction history
    api/                — API routes
    access-denied/      — shown when non-owner hits owner-only route
  components/
    ui/                 — shadcn/ui primitives + Navigation, MobileBottomNav, ThemeToggle
    auth/ dashboard/ financial/ inventory/ pos/ transactions/ — feature components
  lib/
    stores/             — Zustand stores (cartStore, uiStore)
    supabase/           — client.ts (browser), server.ts (server components)
    types.ts            — shared TypeScript interfaces
    types/database.ts   — auto-generated Supabase DB types
    utils.ts            — cn() and helpers
```

## Key Patterns

- **Path alias:** `@/*` maps to `./src/*`
- **Auth:** Supabase SSR with cookie-based sessions. Middleware (`src/middleware.ts`) handles redirects and role checks.
- **Role-based routes:** `/inventory` and `/financial` are owner-only. Middleware queries `profiles.role` and redirects non-owners to `/access-denied`.
- **State:** Zustand for client-side state (cart, UI). No Redux.
- **Server vs Client:** Use `"use client"` only for interactivity (hooks, event handlers, Zustand). Default to Server Components.
- **Styling:** Tailwind CSS v4 with `@tailwindcss/postcss`. Dark mode via `next-themes` (class strategy). Every component must include `dark:` variants.
- **Icons:** Lucide React + Material Symbols Outlined (loaded via Google Fonts in root layout).
- **Forms:** react-hook-form + zod validation.
- **Toasts:** `sonner` (imported as `Toaster` from `@/components/ui/sonner`).
- **Images:** Remote patterns allow `**.supabase.co` for Supabase Storage URLs.

## Design Tokens

- Fonts: Plus Jakarta Sans (headings), Be Vietnam Pro (body) — loaded in root layout
- Colors: Warm Gray/Zinc palette + Fresh Teal/Mint (`teal-500`/`teal-600`)
- Corners: `rounded-2xl` (16px) or `rounded-xl` (12px) for cards/panels
- Tap targets: minimum `h-12` (48px) for interactive elements
- Mobile-first: base styles target mobile, use `md:` / `lg:` for breakpoints

## Testing

- Vitest with jsdom environment and `@testing-library/react`
- Test files: `src/test/*.test.ts` and colocated `*.test.ts` in `src/lib/stores/`
- Setup file (`src/test/setup.ts`) mocks `@supabase/ssr` and `next/headers` cookies
- Tests use `fast-check` for property-based testing in some suites

## Gotchas

- `.env.local` is required with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (not committed)
- `src/lib/types/database.ts` is auto-generated — do not edit manually; run `npm run db:types`
- Supabase RLS policies isolate data by `store_id` — always filter queries accordingly
- Dashboard layout is `"use client"` because it uses Zustand store for sidebar state
- Middleware skips API routes and static files but runs on all other paths
