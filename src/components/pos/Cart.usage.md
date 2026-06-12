# Cart Component Usage Guide

## Overview
The `Cart` component is a client-side React component that displays shopping cart items with interactive controls for managing quantities and removing items.

## Features
- ✅ Display cart items with product names, quantities, and subtotals (Requirement 6.4)
- ✅ Show real-time cart total (Requirement 6.5)
- ✅ Quantity increment/decrement controls (Requirement 7.1)
- ✅ Automatic item removal when quantity reaches zero (Requirement 7.2)
- ✅ Remove item button functionality (Requirement 7.3)
- ✅ Empty cart state with friendly messaging
- ✅ Mobile-first responsive design
- ✅ Dark mode support
- ✅ Indonesian Rupiah currency formatting

## Installation
The component is located at: `src/components/pos/Cart.tsx`

## Usage

### Basic Example
```tsx
import { Cart } from '@/components/pos/Cart'

export function MyPage() {
  return (
    <div>
      <h1>Shopping Cart</h1>
      <Cart />
    </div>
  )
}
```

### In a Layout with Other Components
```tsx
import { Cart } from '@/components/pos/Cart'
import { ProductGrid } from '@/components/pos/ProductGrid'

export default function POSPage() {
  return (
    <div className="flex gap-6">
      {/* Products on the left */}
      <div className="flex-1">
        <ProductGrid />
      </div>
      
      {/* Cart on the right */}
      <div className="w-96">
        <div className="sticky top-4">
          <Cart />
        </div>
      </div>
    </div>
  )
}
```

## State Management
The Cart component uses Zustand for state management via `useCartStore()`:

```typescript
const { items, total, updateQuantity, removeItem } = useCartStore()
```

## Component Behavior

### Empty Cart State
When the cart is empty, displays:
- Shopping cart icon
- "Keranjang masih kosong" message
- Helpful hint text

### Cart Items Display
For each item in the cart:
- Product icon/image placeholder
- Product name (truncated to 2 lines)
- Unit price
- Calculated subtotal (price × quantity)
- Quantity controls (-, quantity, +)
- Remove button (X icon)

### Cart Summary
When items exist:
- Total item count
- Total payment amount in IDR format

### Quantity Controls
- **Increment (+)**: Increases quantity by 1
- **Decrement (-)**: Decreases quantity by 1
  - When quantity reaches 0, item is automatically removed
- Updates happen immediately (real-time)

### Remove Item
- Click the X button to remove an item completely
- Bypasses quantity decrement
- Updates total immediately

## Styling
The component follows SentraOps design system:
- **Colors**: Uses Material Design 3 color tokens (primary, surface, etc.)
- **Borders**: Rounded-xl (12px) for cards
- **Spacing**: Consistent gap and padding
- **Typography**: Be Vietnam Pro font family
- **Dark Mode**: Full support via `dark:` utility classes
- **Touch Targets**: Minimum 32px (h-8 w-8) for buttons

## Accessibility
- Semantic HTML structure
- ARIA labels for interactive buttons
- Keyboard navigation support
- Screen reader friendly

## Testing
Unit tests are located in `Cart.test.tsx` covering:
- Empty cart state
- Item display with correct data
- Quantity controls functionality
- Remove item functionality
- Currency formatting
- Responsive design
- Touch target sizes

Run tests:
```bash
npm run test -- src/components/pos/Cart.test.tsx
```

## Requirements Fulfilled
- **6.4**: Display cart items with product names, quantities, subtotals
- **6.5**: Show real-time cart total
- **7.1**: Quantity increment/decrement controls update total immediately
- **7.2**: Decreasing quantity to zero removes item
- **7.3**: Remove item updates total immediately

## Technical Details
- **Type**: Client Component (`'use client'`)
- **State**: Zustand store (`useCartStore`)
- **Currency**: Indonesian Rupiah (IDR) formatting
- **Dependencies**: 
  - `@/lib/stores/cartStore`
  - `@/lib/types`

## Notes
- This component is a standalone display component
- For full POS functionality, use alongside `CartSection` or `MobileCartBar`
- The component does not handle checkout - that's managed by parent components
- All cart operations are performed through the Zustand store
