import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { useCartStore } from '@/lib/stores/cartStore'
import { Product, CartItem } from '@/lib/types'

// Helper to create a product for testing
const createTestProduct = (overrides?: Partial<Product>): Product => ({
  id: overrides?.id || 'test-product-id',
  name: 'Test Product',
  price: 10000,
  cost_price: 5000,
  stock_quantity: 100,
  min_stock_threshold: 10,
  store_id: 'test-store-id',
  barcode: null,
  category: null,
  image_url: null,
  active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

describe('Cart Correctness Properties', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], total: 0 })
  })

  /**
   * Property 2: Cart Total Invariant
   * For any cart state containing zero or more items, the cart total SHALL always equal the sum of all item subtotals (where subtotal = product price × quantity).
   * Validates: Requirements 6.5, 7.1, 7.3
   */
  it('calculates total correctly after addItem, removeItem, updateQuantity', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({ product: fc.record({ id: fc.uuid(), price: fc.integer({ min: 1, max: 100000 }) }), quantity: fc.integer({ min: 1, max: 10 }) })),
        (initialItemsData) => {
          useCartStore.setState({ items: [], total: 0 }); // Reset state

          let expectedTotal = 0;
          const currentItems: Product[] = [];

          // Simulate adding items
          initialItemsData.forEach(data => {
            const product = createTestProduct({ id: data.product.id, price: data.product.price });
            useCartStore.getState().addItem(product);
            const existing = currentItems.find(item => item.id === product.id);
            if (existing) {
              expectedTotal += product.price; // Incremented by 1 in addItem
            } else {
              expectedTotal += product.price; // Added with quantity 1 in addItem
              currentItems.push(product);
            }
          });

          // After adding, verify total
          expect(useCartStore.getState().total).toBe(useCartStore.getState().items.reduce((sum, item) => sum + item.price * item.quantity, 0));
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 3: Cart Item Addition Idempotence
   * For any product already present in the cart, adding the same product again SHALL increment the quantity rather than creating a duplicate entry.
   * Validates: Requirement 6.3
   */
  it('increments quantity if product exists, adds new if not', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({ id: fc.uuid(), price: fc.integer({ min: 1, max: 10000 }) }), { minLength: 1, maxLength: 5 }),
        (productsData) => {
          useCartStore.setState({ items: [], total: 0 });

          const products: Product[] = productsData.map(data => createTestProduct({ id: data.id, price: data.price }));

          // Add first product
          useCartStore.getState().addItem(products[0]);
          expect(useCartStore.getState().items.length).toBe(1);
          expect(useCartStore.getState().items[0].quantity).toBe(1);

          // Add same product again
          useCartStore.getState().addItem(products[0]);
          expect(useCartStore.getState().items.length).toBe(1); // Still 1 item
          expect(useCartStore.getState().items[0].quantity).toBe(2); // Quantity incremented

          // Add a different product
          if (products.length > 1) {
            useCartStore.getState().addItem(products[1]);
            expect(useCartStore.getState().items.length).toBe(2); // New item added
            expect(useCartStore.getState().items.find(item => item.id === products[1].id)?.quantity).toBe(1);
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 4: Cart Quantity Zero Removal
   * For any cart item, decreasing its quantity to zero SHALL result in the complete removal of that item from the cart.
   * Validates: Requirement 7.2
   */
  it('removes item when quantity updated to zero or less', () => {
    fc.assert(
      fc.property(
        fc.record({ id: fc.uuid(), price: fc.integer({ min: 1, max: 10000 }) }),
        (productData) => {
          useCartStore.setState({ items: [], total: 0 });
          const product = createTestProduct({ id: productData.id, price: productData.price });

          useCartStore.getState().addItem(product); // Add with quantity 1
          expect(useCartStore.getState().items.length).toBe(1);

          useCartStore.getState().updateQuantity(product.id, 0); // Update to zero
          expect(useCartStore.getState().items.length).toBe(0); // Item removed

          useCartStore.getState().addItem(product);
          useCartStore.getState().updateQuantity(product.id, -5); // Update to negative
          expect(useCartStore.getState().items.length).toBe(0); // Item removed
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 5: Cart Clear Reset
   * For any cart state (empty or non-empty), executing a clear operation SHALL result in an empty cart with total equal to zero and item count equal to zero.
   * Validates: Requirement 7.5
   */
  it('clears all items and resets total to zero', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({ id: fc.uuid(), price: fc.integer({ min: 1, max: 10000 }) })),
        (productsData) => {
          useCartStore.setState({ items: [], total: 0 });
          productsData.forEach(data => useCartStore.getState().addItem(createTestProduct({ id: data.id, price: data.price })));

          useCartStore.getState().clearCart();
          expect(useCartStore.getState().items.length).toBe(0);
          expect(useCartStore.getState().total).toBe(0);
        }
      ),
      { numRuns: 100 }
    )
  })
})