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
      // Property 10: cap at available stock
      if (existingItem.quantity >= product.stock_quantity) return;
      set((state) => ({
        items: state.items.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      }));
    } else {
      // Property 10: don't add if out of stock
      if (product.stock_quantity <= 0) return;
      set((state) => ({
        items: [...state.items, { ...product, quantity: 1 }],
      }));
    }

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
      get().removeItem(productId);
      return;
    }

    // Property 10: cap at stock_quantity
    const item = get().items.find((i) => i.id === productId);
    const cappedQty = item ? Math.min(quantity, item.stock_quantity) : quantity;

    set((state) => ({
      items: state.items.map((i) =>
        i.id === productId ? { ...i, quantity: cappedQty } : i
      ),
    }));

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
