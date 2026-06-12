import { create } from 'zustand';
import type { Product, CartItem } from '@/lib/types';

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  total: 0,

  addItem: (product: Product) => {
    const items = get().items;
    const existingItem = items.find((item) => item.id === product.id);

    if (existingItem) {
      // If product already exists in cart, increment quantity (Requirement 6.2, 6.3)
      set((state) => ({
        items: state.items.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      }));
    } else {
      // Add new product to cart with quantity 1 (Requirement 6.1)
      set((state) => ({
        items: [...state.items, { ...product, quantity: 1 }],
      }));
    }

    // Recalculate total (Requirement 6.5, Property 2)
    set({ total: calculateTotal(get().items) });
  },

  removeItem: (productId: string) => {
    // Remove item from cart completely
    set((state) => ({
      items: state.items.filter((item) => item.id !== productId),
    }));

    // Recalculate total (Requirement 7.3)
    set({ total: calculateTotal(get().items) });
  },

  updateQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      // If quantity is zero or negative, remove the item (Requirement 7.2, Property 4)
      get().removeItem(productId);
      return;
    }

    // Update item quantity (Requirement 7.1, Property 3)
    set((state) => ({
      items: state.items.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      ),
    }));

    // Recalculate total (Requirement 6.5, 7.1, Property 2)
    set({ total: calculateTotal(get().items) });
  },

  clearCart: () => {
    // Clear all items and reset total to zero (Requirement 7.5, 8.5, Property 5)
    set({ items: [], total: 0 });
  },
}));

/**
 * Calculate total cart amount
 * Total = Sum of (price * quantity) for all items
 * Validates Property 2: Cart Total Invariant
 */
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
