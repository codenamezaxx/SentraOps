# State Management SentraOps

## Arsitektur

SentraOps menggunakan **Zustand** untuk semua client-side state. Tidak ada Redux.

```
Zustand Stores
├── cartStore        # State keranjang POS
├── uiStore          # State UI (sidebar, mobile)
├── notificationStore # State notifikasi
└── syncStore        # State sinkronisasi
```

## cartStore (`src/lib/stores/cartStore.ts`)

Mengelola keranjang belanja POS.

### State
```typescript
interface CartStore {
  items: CartItem[]              // Item di keranjang
  total: number                  // Total harga (computed)
  itemCount: number              // Jumlah item (computed)
  
  // Actions
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
}
```

### CartItem
```typescript
interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  subtotal: number
  stock: number
}
```

### Fitur
- **Stock validation:** Menolak menambahkan item jika quantity melebihi stok
- **Duplicate handling:** Jika produk sudah ada di keranjang, increment quantity
- **Clear cart:** Reset keranjang setelah checkout sukses
- **Computed values:** `total` dan `itemCount` dihitung otomatis dari `items`

## uiStore (`src/lib/stores/uiStore.ts`)

Mengelola state UI global.

### State
```typescript
interface UiStore {
  sidebarOpen: boolean            // Sidebar desktop
  isMobile: boolean               // Deteksi mobile
  searchQuery: string             // Query pencarian POS
  activeCategory: string | null   // Kategori aktif POS
  
  // Actions
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setIsMobile: (mobile: boolean) => void
  setSearchQuery: (query: string) => void
  setActiveCategory: (category: string | null) => void
  resetPosFilters: () => void
}
```

### Fitur
- **Responsive sidebar:** Sidebar otomatis tertutup di mobile, bisa toggle di desktop
- **POS filters:** Search query dan category filter untuk halaman POS
- **Reset filters:** Satu panggilan untuk reset semua filter POS

## notificationStore (`src/lib/stores/notificationStore.ts`)

Mengelola notifikasi real-time.

### State
```typescript
interface NotificationStore {
  notifications: Notification[]
  unreadCount: number
  
  // Actions
  addNotification: (notification: Notification) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
}
```

## syncStore (`src/lib/stores/syncStore.ts`)

State sinkronisasi offline — sederhana.

### State
```typescript
interface SyncStore {
  version: number
  
  // Actions
  bumpVersion: () => void
}
```

`version` di-increment setiap kali ada perubahan yang membutuhkan refresh data. Digunakan untuk memicu ulang query setelah operasi offline.

## Pola Penggunaan

### Dalam Client Component
```typescript
import { useCartStore } from '@/lib/stores/cartStore'

function CartButton() {
  const itemCount = useCartStore(state => state.itemCount)
  const addItem = useCartStore(state => state.addItem)
  
  return <button onClick={() => addItem(product)}>
    Cart ({itemCount})
  </button>
}
```

### Selector Pattern
Gunakan selector untuk menghindari re-render tidak perlu:
```typescript
// ❌ Akan re-render pada setiap perubahan state
const store = useCartStore()

// ✅ Hanya re-render saat itemCount berubah
const itemCount = useCartStore(state => state.itemCount)
```

## Testing Stores

Store diuji dengan Vitest. Contoh (`src/lib/stores/cartStore.test.ts`):

```typescript
import { useCartStore } from './cartStore'

beforeEach(() => {
  useCartStore.setState({ items: [] })
})

it('adds item to cart', () => {
  useCartStore.getState().addItem(mockProduct)
  expect(useCartStore.getState().items).toHaveLength(1)
})
```
