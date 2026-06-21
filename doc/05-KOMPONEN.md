# Komponen & Design System SentraOps

## Design Tokens

### Fonts
- **Heading:** Plus Jakarta Sans (variable weight)
- **Body:** Be Vietnam Pro (variable weight)
- Dimuat di root layout via Google Fonts dengan `display=swap`

### Color Palette
- **Primary:** Teal (`teal-500`, `teal-600`)
- **Neutral:** Warm gray / Zinc (Tailwind default)
- **Background:** White / `zinc-950` (dark mode)
- **Card:** White / `zinc-900` (dark mode)

### Spacing & Corners
- **Card/panel rounding:** `rounded-2xl` (16px) atau `rounded-xl` (12px)
- **Tap targets minimum:** `h-12` (48px) untuk elemen interaktif
- **Grid gap:** Konsisten menggunakan `gap-4` atau `gap-6`

### Dark Mode
Semua komponen harus menyertakan varian `dark:`. Implementasi via `next-themes` (class strategy).

## UI Primitives (shadcn/ui)

Komponen di `src/components/ui/` menggunakan Radix UI primitives yang di-wrapped dengan styling Tailwind:

| Komponen | Berbasis | Penggunaan |
|----------|----------|------------|
| `button` | `radix-ui` | Semua tombol |
| `card` | `div` | Kartu konten |
| `input` | `input` | Form input |
| `dialog` | `Dialog` | Modal/dialog |
| `sheet` | `Sheet` | Panel samping |
| `dropdown-menu` | `DropdownMenu` | Menu dropdown |
| `tabs` | `Tabs` | Tab navigasi |
| `table` | `table` | Tabel data |
| `badge` | `span` | Label/badge status |
| `skeleton` | `div` | Loading placeholder |
| `form` | `Form` | Form dengan validasi |
| `sonner` | `sonner` | Toast notifications |
| `switch` | `Switch` | Toggle switch |
| `checkbox` | `Checkbox` | Checkbox |
| `separator` | `Separator` | Garis pemisah |
| `command` | `Command` | Command palette |
| `pagination` | — | Navigasi halaman |
| `alert-dialog` | `AlertDialog` | Konfirmasi destruktif |
| `label` | `Label` | Label form |
| `textarea` | `textarea` | Textarea |
| `input-group` | — | Input dengan icon/label |

## Layout Components

### `Navigation` (`src/components/ui/Navigation.tsx`)
Sidebar navigasi utama untuk desktop. Berisi:
- Menu utama (Dashboard, POS, Inventory, Financial, Transactions, Expenses, Invoices, Staff)
- Menu settings
- Store branding
- User avatar dropdown

### `MobileBottomNav` (`src/components/ui/MobileBottomNav.tsx`)
Bottom navigation bar untuk mobile dengan 5 menu utama.

### `ThemeToggle` (`src/components/ui/ThemeToggle.tsx`)
Tombol toggle light/dark mode.

## Dashboard Components

| Komponen | Fungsi |
|----------|--------|
| `StatCard` | Kartu statistik (revenue, orders, profit) |
| `GlobalSearch` | Pencarian global (produk, transaksi) |
| `NotificationBell` | Bell notifikasi dengan unread count |
| `DashboardQuickActions` | Tombol aksi cepat |
| `OverdueInvoicesCard` | Kartu faktur jatuh tempo |
| `UserProfileDropdown` | Dropdown profil user |

## POS Components

| Komponen | Fungsi |
|----------|--------|
| `PosContent` | Layout utama POS |
| `ProductGrid` | Grid produk |
| `ProductCard` | Kartu produk individual |
| `CartSection` | Panel keranjang |
| `Cart` | Daftar item keranjang |
| `MobileCartBar` | Cart summary bar untuk mobile |
| `PaymentDrawer` | Drawer pembayaran |
| `BarcodeSearch` | Pencarian barcode |
| `CameraScanner` | Scanner barcode via kamera |
| `CategoryFilter` | Filter kategori produk |
| `DesktopSearch` | Pencarian produk desktop |

## Financial Components

| Komponen | Fungsi |
|----------|--------|
| `RevenueChart` | Grafik pendapatan (Chart.js) |
| `PaymentMethodBreakdown` | Breakdown metode pembayaran |
| `TopProfitContributors` | Produk dengan profit tertinggi |
| `PeriodSelector` | Selector periode (daily/monthly/yearly) |
| `ExportButton` | Export laporan ke PDF |

## Inventory Components

| Komponen | Fungsi |
|----------|--------|
| `ProductForm` | Form tambah/edit produk |
| `ProductTable` | Tabel daftar produk |
| `StockBadge` | Badge status stok (low, out, normal) |
| `StockUpdateForm` | Form update stok |

## Auth Components

| Komponen | Fungsi |
|----------|--------|
| `LoginForm` | Form login |
| `SignupForm` | Form registrasi |
| `ForgotPasswordForm` | Form lupa password |
| `ResetPasswordForm` | Form reset password |
| `RequireOwner` | Conditional rendering untuk owner |
| `PasswordToggle` | Show/hide password |

## Loading States

Loading skeletons untuk setiap halaman dashboard di `src/app/(dashboard)/*/loading.tsx`:
- `PhantomSkeleton` — skeleton dengan animasi pulse
- `NavigationProgress` — progress bar untuk navigasi antar halaman

## Pola Styling

```tsx
// Setiap komponen: dark mode, rounded, spacing konsisten
<div className="rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-900">
```

```tsx
// Tombol
<Button className="h-12 rounded-xl">Aksi</Button>
```
