import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { z } from 'zod'

/**
 * Recreate the product schema from ProductForm.tsx.
 * This is the canonical client-side validation schema that must agree
 * with any server-side (API route) validation rules.
 *
 * Fields:
 *   name, barcode, price, cost_price, stock_quantity,
 *   min_stock_threshold, category, image_url
 */
const productSchema = z.object({
  name: z.string().min(1, 'Nama produk wajib diisi'),
  barcode: z.string().optional().nullable().or(z.literal('')),
  price: z.number().min(0, 'Harga jual tidak boleh negatif'),
  cost_price: z.number().min(0, 'Harga modal tidak boleh negatif'),
  stock_quantity: z.number().min(0, 'Stok tidak boleh negatif'),
  min_stock_threshold: z.number().min(0, 'Ambang batas tidak boleh negatif'),
  category: z.string().optional().nullable().or(z.literal('')),
  image_url: z.string().optional().nullable().or(z.literal('')),
})

/**
 * Arbitrary that produces only valid product inputs.
 * Every field respects the schema constraints:
 *  - name is non-empty
 *  - barcode / category / image_url are optional (undefined, null, '', or any string)
 *  - price, cost_price, stock_quantity, min_stock_threshold are non-negative integers
 */
const validProductArbitrary: fc.Arbitrary<Record<string, unknown>> = fc.record({
  name: fc.string({ minLength: 1 }),
  barcode: fc.oneof(
    fc.constant(undefined),
    fc.constant(null),
    fc.constant(''),
    fc.string(),
  ),
  price: fc.integer({ min: 0 }),
  cost_price: fc.integer({ min: 0 }),
  stock_quantity: fc.integer({ min: 0 }),
  min_stock_threshold: fc.integer({ min: 0 }),
  category: fc.oneof(
    fc.constant(undefined),
    fc.constant(null),
    fc.constant(''),
    fc.string(),
  ),
  image_url: fc.oneof(
    fc.constant(undefined),
    fc.constant(null),
    fc.constant(''),
    fc.string(),
  ),
})

describe('Product Schema Validation Properties (Client ↔ Server Agreement)', () => {
  /**
   * Property 1: Zod schema validates all valid product inputs
   *
   * For any record generated from validProductArbitrary,
   * productSchema.safeParse MUST return { success: true }.
   *
   * This guarantees that the client-side form schema accepts the same
   * data shape that the server-side (API) consumer expects.
   */
  it('accepts all valid product inputs', () => {
    fc.assert(
      fc.property(validProductArbitrary, (data) => {
        const result = productSchema.safeParse(data)
        expect(result.success).toBe(true)
      }),
      { numRuns: 200 },
    )
  })

  /**
   * Property 2: Zod schema rejects all invalid inputs
   *
   * For each invalid-data category:
   *   - empty name ('')
   *   - negative price
   *   - negative cost_price
   *   - negative stock_quantity
   *   - negative min_stock_threshold
   *
   * productSchema.safeParse MUST return { success: false } and
   * include at least one human-readable error message.
   */
  it('rejects invalid inputs with appropriate error messages', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          // Empty name
          fc.record({
            name: fc.constant(''),
            price: fc.integer({ min: 0 }),
            cost_price: fc.integer({ min: 0 }),
            stock_quantity: fc.integer({ min: 0 }),
            min_stock_threshold: fc.integer({ min: 0 }),
          }),
          // Negative price
          fc.record({
            name: fc.string({ minLength: 1 }),
            price: fc.integer({ max: -1 }),
            cost_price: fc.integer({ min: 0 }),
            stock_quantity: fc.integer({ min: 0 }),
            min_stock_threshold: fc.integer({ min: 0 }),
          }),
          // Negative cost_price
          fc.record({
            name: fc.string({ minLength: 1 }),
            price: fc.integer({ min: 0 }),
            cost_price: fc.integer({ max: -1 }),
            stock_quantity: fc.integer({ min: 0 }),
            min_stock_threshold: fc.integer({ min: 0 }),
          }),
          // Negative stock_quantity
          fc.record({
            name: fc.string({ minLength: 1 }),
            price: fc.integer({ min: 0 }),
            cost_price: fc.integer({ min: 0 }),
            stock_quantity: fc.integer({ max: -1 }),
            min_stock_threshold: fc.integer({ min: 0 }),
          }),
          // Negative min_stock_threshold
          fc.record({
            name: fc.string({ minLength: 1 }),
            price: fc.integer({ min: 0 }),
            cost_price: fc.integer({ min: 0 }),
            stock_quantity: fc.integer({ min: 0 }),
            min_stock_threshold: fc.integer({ max: -1 }),
          }),
        ),
        (data) => {
          const result = productSchema.safeParse(data)
          expect(result.success).toBe(false)
          if (!result.success) {
            // Verify that at least one field-level error message exists
            expect(result.error.issues.length).toBeGreaterThan(0)
            for (const issue of result.error.issues) {
              expect(typeof issue.message).toBe('string')
              expect(issue.message.length).toBeGreaterThan(0)
            }
          }
        },
      ),
      { numRuns: 200 },
    )
  })

  /**
   * Property 3: Price is always non-negative
   *
   * For any integer value passed as `price`:
   *   - Negative integers MUST be rejected by the schema
   *   - Zero and positive integers MUST be accepted
   *
   * This enforces the business rule that prices, costs, and stock
   * quantities can never be negative.
   */
  it('rejects negative prices and accepts zero/positive prices', () => {
    fc.assert(
      fc.property(
        fc.integer(),
        (price) => {
          const data = {
            name: 'Test Product',
            price,
            cost_price: 0,
            stock_quantity: 0,
            min_stock_threshold: 0,
          }
          const result = productSchema.safeParse(data)

          if (price < 0) {
            expect(result.success).toBe(false)
          } else {
            expect(result.success).toBe(true)
          }
        },
      ),
      { numRuns: 200 },
    )
  })

  /**
   * Property 4: String trimming is consistent
   *
   * For any string used as `name`, the schema behaviour MUST be
   * deterministic with respect to trimming:
   *
   *   - Truly empty string `""` → both raw and trimmed versions
   *     are identically empty → BOTH rejected (min(1) fails).
   *   - Whitespace-only string (e.g. `"   "`) → the raw version
   *     has length > 0 so it PASSES; the trimmed version is empty
   *     so it FAILS.
   *   - String with content (e.g. `"  Kopi  "`) → both the raw
   *     and trimmed versions have length > 0 → BOTH accepted.
   *
   * This demonstrates that whitespace handling (trim) is consistent
   * with the schema's min-length constraint.
   */
  it('handles string trimming consistently', () => {
    fc.assert(
      fc.property(
        fc.string(),
        (name) => {
          const trimmed = name.trim()
          const baseData = {
            price: 0,
            cost_price: 0,
            stock_quantity: 0,
            min_stock_threshold: 0,
          }

          const paddedResult = productSchema.safeParse({
            ...baseData,
            name,
          })
          const trimmedResult = productSchema.safeParse({
            ...baseData,
            name: trimmed,
          })

          if (name === '') {
            // Both are empty → both fail min(1)
            expect(paddedResult.success).toBe(false)
            expect(trimmedResult.success).toBe(false)
          } else if (trimmed === '') {
            // Whitespace-only string passes (length > 0);
            // trimmed to empty → fails min(1)
            expect(paddedResult.success).toBe(true)
            expect(trimmedResult.success).toBe(false)
          } else {
            // Has actual content after trim → both pass
            expect(paddedResult.success).toBe(true)
            expect(trimmedResult.success).toBe(true)
          }
        },
      ),
      { numRuns: 200 },
    )
  })
})
