# Zustand Stores

This directory contains Zustand stores for client-side state management in SentraOps.

## Available Stores

### `cartStore.ts`
Manages shopping cart state for the Point of Sale (POS) interface.

**State:**
- `items`: Array of cart items with products and quantities
- `total`: Calculated total amount

**Actions:**
- `addItem(product)`: Add product to cart or increment quantity
- `removeItem(productId)`: Remove item from cart
- `updateQuantity(productId, quantity)`: Update item quantity
- `clearCart()`: Clear all items from cart

**Usage:**
```typescript
import { useCartStore } from '@/lib/stores/cartStore';

function POSComponent() {
  const { items, total, addItem, removeItem } = useCartStore();
  
  return (
    <div>
      <p>Total: Rp {total.toLocaleString('id-ID')}</p>
      {items.map(item => (
        <div key={item.id}>
          {item.name} x {item.quantity}
          <button onClick={() => removeItem(item.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
}
```

### `uiStore.ts`
Manages UI preferences and sidebar state.

**State:**
- `sidebarOpen`: Boolean for sidebar open/closed state
- `isMobile`: Boolean tracking mobile viewport state

**Actions:**
- `toggleSidebar()`: Toggle sidebar between open and closed
- `setSidebarOpen(open)`: Explicitly set sidebar state
- `setIsMobile(mobile)`: Update mobile viewport state

**Persistence:**
The sidebar preference is persisted to localStorage under the key `sentraops-ui-storage`.

**Usage:**
```typescript
import { useUIStore } from '@/lib/stores/uiStore';

function NavigationSidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  
  return (
    <aside className={sidebarOpen ? 'w-64' : 'w-16'}>
      <button onClick={toggleSidebar}>
        {sidebarOpen ? 'Collapse' : 'Expand'}
      </button>
      {/* Navigation items */}
    </aside>
  );
}

function ResponsiveLayout() {
  const { isMobile, setIsMobile } = useUIStore();
  
  // Update mobile state based on viewport
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsMobile]);
  
  return isMobile ? <MobileLayout /> : <DesktopLayout />;
}
```

## Design Principles

### State Management Strategy (from Design Document)

**Three-Tier State Architecture:**

1. **Server State** (Supabase + React Server Components):
   - Products catalog
   - Transaction history
   - Financial summaries
   - User profile data
   
2. **Global Client State** (Zustand - these stores):
   - Shopping cart (products, quantities, totals)
   - UI preferences (sidebar open/closed)
   - Temporary draft data
   
3. **Local Component State** (React useState):
   - Form inputs
   - Modal visibility
   - Loading states

### Testing

All stores have comprehensive test coverage using Vitest and React Testing Library.

Run tests:
```bash
npm test -- src/lib/stores/
```

## Requirements Validation

- **cartStore**: Validates Requirements 6.1-6.5, 7.1-7.5, 8.4-8.6
- **uiStore**: Validates Requirement 13.4 (Desktop sidebar navigation)

## Adding New Stores

When creating a new Zustand store:

1. Create the store file: `src/lib/stores/yourStore.ts`
2. Define TypeScript interface for state
3. Use `create` from `zustand`
4. Add `persist` middleware if state should survive page reloads
5. Include requirement validation comments
6. Create corresponding test file: `src/lib/stores/yourStore.test.ts`
7. Run tests to verify correctness
8. Update this README
