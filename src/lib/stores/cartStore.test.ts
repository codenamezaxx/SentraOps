import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from './cartStore';
import type { Product } from '@/lib/types';

// Test helper to create mock products
function createTestProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: `product-${Math.random()}`,
    store_id: 'store-1',
    name: 'Test Product',
    barcode: null,
    price: 10000,
    cost_price: 5000,
    stock_quantity: 100,
    min_stock_threshold: 10,
    category: 'Test',
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

describe('CartStore', () => {
  beforeEach(() => {
    // Reset cart before each test
    useCartStore.getState().clearCart();
  });

  describe('addItem', () => {
    it('should add a new product to empty cart with quantity 1', () => {
      // Validates Requirement 6.1
      const product = createTestProduct({ id: 'p1', price: 25000 });
      
      useCartStore.getState().addItem(product);
      
      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].id).toBe('p1');
      expect(state.items[0].quantity).toBe(1);
    });

    it('should increment quantity when adding existing product', () => {
      // Validates Requirement 6.2, 6.3, Property 3
      const product = createTestProduct({ id: 'p1', price: 25000 });
      
      useCartStore.getState().addItem(product);
      useCartStore.getState().addItem(product);
      
      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].quantity).toBe(2);
    });

    it('should not create duplicate entries for same product', () => {
      // Validates Property 3: Cart Item Addition Idempotence
      const product = createTestProduct({ id: 'p1', price: 25000 });
      
      useCartStore.getState().addItem(product);
      useCartStore.getState().addItem(product);
      useCartStore.getState().addItem(product);
      
      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].quantity).toBe(3);
    });

    it('should update total when adding items', () => {
      // Validates Requirement 6.5, Property 2
      const product1 = createTestProduct({ id: 'p1', price: 10000 });
      const product2 = createTestProduct({ id: 'p2', price: 15000 });
      
      useCartStore.getState().addItem(product1);
      useCartStore.getState().addItem(product2);
      
      const state = useCartStore.getState();
      expect(state.total).toBe(25000);
    });
  });

  describe('removeItem', () => {
    it('should remove item completely from cart', () => {
      const product = createTestProduct({ id: 'p1', price: 25000 });
      
      useCartStore.getState().addItem(product);
      useCartStore.getState().removeItem('p1');
      
      const state = useCartStore.getState();
      expect(state.items).toHaveLength(0);
    });

    it('should update total after removing item', () => {
      // Validates Requirement 7.3
      const product1 = createTestProduct({ id: 'p1', price: 10000 });
      const product2 = createTestProduct({ id: 'p2', price: 15000 });
      
      useCartStore.getState().addItem(product1);
      useCartStore.getState().addItem(product2);
      useCartStore.getState().removeItem('p1');
      
      const state = useCartStore.getState();
      expect(state.total).toBe(15000);
    });

    it('should not affect other items when removing one', () => {
      const product1 = createTestProduct({ id: 'p1', price: 10000 });
      const product2 = createTestProduct({ id: 'p2', price: 15000 });
      
      useCartStore.getState().addItem(product1);
      useCartStore.getState().addItem(product2);
      useCartStore.getState().removeItem('p1');
      
      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].id).toBe('p2');
    });
  });

  describe('updateQuantity', () => {
    it('should update quantity of existing item', () => {
      // Validates Requirement 7.1
      const product = createTestProduct({ id: 'p1', price: 10000 });
      
      useCartStore.getState().addItem(product);
      useCartStore.getState().updateQuantity('p1', 5);
      
      const state = useCartStore.getState();
      expect(state.items[0].quantity).toBe(5);
      expect(state.total).toBe(50000);
    });

    it('should remove item when quantity is set to zero', () => {
      // Validates Requirement 7.2, Property 4
      const product = createTestProduct({ id: 'p1', price: 10000 });
      
      useCartStore.getState().addItem(product);
      useCartStore.getState().updateQuantity('p1', 0);
      
      const state = useCartStore.getState();
      expect(state.items).toHaveLength(0);
      expect(state.total).toBe(0);
    });

    it('should remove item when quantity is negative', () => {
      // Validates Property 4: Cart Quantity Zero Removal
      const product = createTestProduct({ id: 'p1', price: 10000 });
      
      useCartStore.getState().addItem(product);
      useCartStore.getState().updateQuantity('p1', -1);
      
      const state = useCartStore.getState();
      expect(state.items).toHaveLength(0);
    });

    it('should recalculate total immediately after quantity update', () => {
      // Validates Requirement 7.1, Property 2
      const product = createTestProduct({ id: 'p1', price: 10000 });
      
      useCartStore.getState().addItem(product);
      useCartStore.getState().updateQuantity('p1', 3);
      
      const state = useCartStore.getState();
      expect(state.total).toBe(30000);
    });
  });

  describe('clearCart', () => {
    it('should remove all items from cart', () => {
      // Validates Requirement 7.5, 8.5, Property 5
      const product1 = createTestProduct({ id: 'p1', price: 10000 });
      const product2 = createTestProduct({ id: 'p2', price: 15000 });
      
      useCartStore.getState().addItem(product1);
      useCartStore.getState().addItem(product2);
      useCartStore.getState().clearCart();
      
      const state = useCartStore.getState();
      expect(state.items).toHaveLength(0);
    });

    it('should reset total to zero', () => {
      // Validates Property 5: Cart Clear Reset
      const product1 = createTestProduct({ id: 'p1', price: 10000 });
      const product2 = createTestProduct({ id: 'p2', price: 15000 });
      
      useCartStore.getState().addItem(product1);
      useCartStore.getState().addItem(product2);
      useCartStore.getState().clearCart();
      
      const state = useCartStore.getState();
      expect(state.total).toBe(0);
    });

    it('should work on already empty cart', () => {
      // Edge case: clearing an empty cart
      useCartStore.getState().clearCart();
      
      const state = useCartStore.getState();
      expect(state.items).toHaveLength(0);
      expect(state.total).toBe(0);
    });
  });

  describe('total calculation', () => {
    it('should always equal sum of item subtotals', () => {
      // Validates Property 2: Cart Total Invariant
      const product1 = createTestProduct({ id: 'p1', price: 10000 });
      const product2 = createTestProduct({ id: 'p2', price: 15000 });
      const product3 = createTestProduct({ id: 'p3', price: 20000 });
      
      useCartStore.getState().addItem(product1);
      useCartStore.getState().addItem(product1);
      useCartStore.getState().addItem(product2);
      useCartStore.getState().addItem(product3);
      useCartStore.getState().updateQuantity('p3', 3);
      
      const state = useCartStore.getState();
      const expectedTotal = (10000 * 2) + (15000 * 1) + (20000 * 3);
      expect(state.total).toBe(expectedTotal);
      expect(state.total).toBe(95000);
    });

    it('should be zero for empty cart', () => {
      const state = useCartStore.getState();
      expect(state.total).toBe(0);
    });

    it('should handle decimal prices correctly', () => {
      const product = createTestProduct({ id: 'p1', price: 12500.50 });
      
      useCartStore.getState().addItem(product);
      useCartStore.getState().updateQuantity('p1', 2);
      
      const state = useCartStore.getState();
      expect(state.total).toBe(25001);
    });
  });

  describe('cart state management', () => {
    it('should maintain cart state across multiple operations', () => {
      // Validates Requirement 7.4
      const product1 = createTestProduct({ id: 'p1', price: 10000 });
      const product2 = createTestProduct({ id: 'p2', price: 15000 });
      
      useCartStore.getState().addItem(product1);
      useCartStore.getState().addItem(product2);
      useCartStore.getState().updateQuantity('p1', 3);
      useCartStore.getState().removeItem('p2');
      useCartStore.getState().addItem(product2);
      
      const state = useCartStore.getState();
      expect(state.items).toHaveLength(2);
      expect(state.items.find(i => i.id === 'p1')?.quantity).toBe(3);
      expect(state.items.find(i => i.id === 'p2')?.quantity).toBe(1);
      expect(state.total).toBe(45000);
    });

    it('should provide optimistic UI updates', () => {
      // Validates Requirement 19.5
      // Zustand provides synchronous state updates, which enables optimistic UI
      const product = createTestProduct({ id: 'p1', price: 10000 });
      
      useCartStore.getState().addItem(product);
      
      // State should be immediately available (synchronous update)
      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.total).toBe(10000);
    });
  });

  describe('edge cases', () => {
    it('should handle adding many items', () => {
      const products = Array.from({ length: 50 }, (_, i) =>
        createTestProduct({ id: `p${i}`, price: 1000 })
      );
      
      products.forEach(product => {
        useCartStore.getState().addItem(product);
      });
      
      const state = useCartStore.getState();
      expect(state.items).toHaveLength(50);
      expect(state.total).toBe(50000);
    });

    it('should handle large quantities', () => {
      const product = createTestProduct({ id: 'p1', price: 1000 });
      
      useCartStore.getState().addItem(product);
      useCartStore.getState().updateQuantity('p1', 1000);
      
      const state = useCartStore.getState();
      expect(state.items[0].quantity).toBe(1000);
      expect(state.total).toBe(1000000);
    });

    it('should handle zero-priced items', () => {
      const product = createTestProduct({ id: 'p1', price: 0 });
      
      useCartStore.getState().addItem(product);
      
      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.total).toBe(0);
    });

    it('should not mutate original product when adding to cart', () => {
      const originalProduct = createTestProduct({ id: 'p1', price: 10000 });
      const originalPrice = originalProduct.price;
      
      useCartStore.getState().addItem(originalProduct);
      useCartStore.getState().updateQuantity('p1', 5);
      
      expect(originalProduct.price).toBe(originalPrice);
    });
  });
});
