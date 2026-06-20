# Changelog

All notable changes to SentraOps are documented here.

Format: [SemVer 2.0](https://semver.org/) — `MAJOR.MINOR.PATCH`
Before 1.0: breaking changes bump **minor**, features bump **minor**, fixes bump **patch**.

---

## [0.3.0] — 2026-06-19

### Added
- Store settings management (profile, payment methods, stock threshold)
- Settings API route with admin client (bypass RLS for store updates)
- Staff management CRUD (API + UI)
- Invoice management with pagination, tabs, and filter
- Invoices search by customer name or due date
- PWA support with offline service worker
- Xendit payment gateway integration (QRIS, WhatsApp Invoice)
- Signup flow with RLS policy fixes
- About dialog with version info and feedback links
- Desktop search component for POS

### Changed
- Settings page redesign with responsive mobile layout
- Mobile bottom nav — cashier gets 5 items
- Dashboard quick actions: "Tinjau Tagihan", "Lihat Riwayat"
- Tab styling: removed sunken look, fixed height

### Fixed
- Store RLS: members can SELECT stores (admin client + SELECT policy)
- Transaction cashier names resolving via admin client
- Dashboard stuck loading for non-owner accounts
- PWA theme color mismatch (teal vs orange)
- Invoice creation silent failure
- Service worker refresh loop
- Redirect loops in middleware

---

## [0.2.0] — 2026-06-17

### Added
- Point of Sale (POS) with product grid, barcode search, cart
- Product management (inventory CRUD)
- Financial dashboard with revenue chart
- Transaction history with search and pagination
- Revenue chart (7-day trend)

### Changed
- Dashboard responsive layout
- UI component polish (cards, buttons, inputs)
- Cart components with improved icons

### Fixed
- Stock validation during checkout
- Offline queue syncing

---

## [0.1.0] — 2026-06-15

### Added
- Initial project setup (Next.js 16 App Router)
- Supabase auth with SSR sessions
- Login/signup pages
- Dashboard layout with sidebar navigation
- Mobile bottom navigation
- Dark mode support (next-themes)
- Zustand stores (cart, UI)
- Basic stat cards on dashboard
- Tailwind CSS v4 with design tokens
- Theme toggle
