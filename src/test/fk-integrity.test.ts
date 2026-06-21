import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

// ─── Model types for FK integrity testing ────────────────────────────────

interface TestProduct {
  id: string
  store_id: string
}

interface TestTransaction {
  id: string
  store_id: string
}

interface TestTransactionItem {
  id: string
  transaction_id: string
  product_id: string
}

interface TestStore {
  id: string
}

// ─── FK validation functions ─────────────────────────────────────────────

/**
 * Checks whether a transaction item references a valid product.
 * Returns `true` if the item's `product_id` exists in the set of valid product IDs.
 */
function isValidTransactionItem(
  item: TestTransactionItem,
  validProductIds: Set<string>,
): boolean {
  return validProductIds.has(item.product_id)
}

/**
 * Checks whether a transaction references a valid store.
 * Returns `true` if the transaction's `store_id` exists in the set of valid store IDs.
 */
function isValidTransaction(
  txn: TestTransaction,
  validStoreIds: Set<string>,
): boolean {
  return validStoreIds.has(txn.store_id)
}

/**
 * Simulates cascade delete: given a list of transaction items and a set of deleted
 * product IDs, returns only the items whose `product_id` is NOT in the deleted set.
 */
function cascadeDeleteItems(
  items: TestTransactionItem[],
  deletedProductIds: Set<string>,
): TestTransactionItem[] {
  return items.filter(i => !deletedProductIds.has(i.product_id))
}

/**
 * Removes all dangling FK references from items and transactions.
 * Returns the cleaned-up data as a tuple [validItems, validTransactions].
 */
function removeOrphans(
  items: TestTransactionItem[],
  transactions: TestTransaction[],
  products: TestProduct[],
  stores: TestStore[],
): [TestTransactionItem[], TestTransaction[]] {
  const validStoreIds = new Set(stores.map(s => s.id))
  const validProductIds = new Set(products.map(p => p.id))
  const validTransactionIds = new Set(transactions.map(t => t.id))

  const validTransactions = transactions.filter(t =>
    validStoreIds.has(t.store_id),
  )
  const validTxnIds = new Set(validTransactions.map(t => t.id))

  const validItems = items.filter(
    i =>
      validProductIds.has(i.product_id) &&
      validTxnIds.has(i.transaction_id),
  )

  return [validItems, validTransactions]
}

// ─── Arbitraries ─────────────────────────────────────────────────────────

const uuidArb = fc.uuid({ version: 4 })

const storeArb: fc.Arbitrary<TestStore> = uuidArb.map(id => ({ id }))

const productArb: fc.Arbitrary<TestProduct> = fc
  .record({ id: uuidArb, store_id: uuidArb })

const transactionArb: fc.Arbitrary<TestTransaction> = fc
  .record({ id: uuidArb, store_id: uuidArb })

const transactionItemArb: fc.Arbitrary<TestTransactionItem> = fc
  .record({ id: uuidArb, transaction_id: uuidArb, product_id: uuidArb })

// ─── Tests ───────────────────────────────────────────────────────────────

describe('Foreign Key Integrity Properties', () => {
  // ─────────────────────────────────────────────────────────────────────
  // Property 1: Transaction items require valid product IDs
  // ─────────────────────────────────────────────────────────────────────
  describe('Property 1: Transaction items require valid product IDs', () => {
    it('returns true when the item product_id exists in the valid set', () => {
      fc.assert(
        fc.property(
          uuidArb,
          fc.array(uuidArb),
          uuidArb,
          uuidArb,
          (productId, otherIds, itemId, txnId) => {
            const validIds = new Set([productId, ...otherIds])
            const item: TestTransactionItem = {
              id: itemId,
              transaction_id: txnId,
              product_id: productId,
            }
            expect(isValidTransactionItem(item, validIds)).toBe(true)
          },
        ),
        { numRuns: 100 },
      )
    })

    it('returns false when the item product_id is missing from the valid set', () => {
      fc.assert(
        fc.property(
          uuidArb,
          fc.array(uuidArb),
          uuidArb,
          uuidArb,
          (productId, otherIds, itemId, txnId) => {
            const validIds = new Set(otherIds)
            // Ensure productId is NOT in the valid set
            fc.pre(!validIds.has(productId))
            const item: TestTransactionItem = {
              id: itemId,
              transaction_id: txnId,
              product_id: productId,
            }
            expect(isValidTransactionItem(item, validIds)).toBe(false)
          },
        ),
        { numRuns: 100 },
      )
    })

    it('correctly classifies every item in arbitrary batches', () => {
      fc.assert(
        fc.property(
          fc.array(productArb, { minLength: 1, maxLength: 15 }),
          fc.array(transactionItemArb, { maxLength: 30 }),
          (products, items) => {
            const validIds = new Set(products.map(p => p.id))
            for (const item of items) {
              expect(isValidTransactionItem(item, validIds)).toBe(
                validIds.has(item.product_id),
              )
            }
          },
        ),
        { numRuns: 100 },
      )
    })
  })

  // ─────────────────────────────────────────────────────────────────────
  // Property 2: Transactions require valid store IDs
  // ─────────────────────────────────────────────────────────────────────
  describe('Property 2: Transactions require valid store IDs', () => {
    it('returns true when the transaction store_id exists in the valid set', () => {
      fc.assert(
        fc.property(
          uuidArb,
          fc.array(uuidArb),
          uuidArb,
          (storeId, otherIds, txnId) => {
            const validIds = new Set([storeId, ...otherIds])
            const txn: TestTransaction = { id: txnId, store_id: storeId }
            expect(isValidTransaction(txn, validIds)).toBe(true)
          },
        ),
        { numRuns: 100 },
      )
    })

    it('returns false when the transaction store_id is missing from the valid set', () => {
      fc.assert(
        fc.property(
          uuidArb,
          fc.array(uuidArb),
          uuidArb,
          (storeId, otherIds, txnId) => {
            const validIds = new Set(otherIds)
            fc.pre(!validIds.has(storeId))
            const txn: TestTransaction = { id: txnId, store_id: storeId }
            expect(isValidTransaction(txn, validIds)).toBe(false)
          },
        ),
        { numRuns: 100 },
      )
    })

    it('correctly classifies every transaction in arbitrary batches', () => {
      fc.assert(
        fc.property(
          fc.array(storeArb, { minLength: 1, maxLength: 10 }),
          fc.array(transactionArb, { maxLength: 20 }),
          (stores, transactions) => {
            const validIds = new Set(stores.map(s => s.id))
            for (const txn of transactions) {
              expect(isValidTransaction(txn, validIds)).toBe(
                validIds.has(txn.store_id),
              )
            }
          },
        ),
        { numRuns: 100 },
      )
    })
  })

  // ─────────────────────────────────────────────────────────────────────
  // Property 3: Cascade delete behavior is correct
  // ─────────────────────────────────────────────────────────────────────
  describe('Property 3: Cascade delete behavior is correct', () => {
    it('removes all items referencing deleted products and preserves others', () => {
      fc.assert(
        fc.property(
          fc.array(productArb, { minLength: 1, maxLength: 15 }),
          fc.array(transactionItemArb, { maxLength: 30 }),
          fc.array(uuidArb).map(ids => new Set(ids)),
          (products, items, deletedProductIds) => {
            const remaining = cascadeDeleteItems(items, deletedProductIds)
            const remainingProductIds = new Set(
              remaining.map(i => i.product_id),
            )

            // No remaining item references a deleted product
            for (const deletedId of deletedProductIds) {
              expect(remainingProductIds.has(deletedId)).toBe(false)
            }

            // Items referencing non-deleted products are preserved
            const productIds = new Set(products.map(p => p.id))
            const nonDeletedIds = new Set(
              [...productIds].filter(id => !deletedProductIds.has(id)),
            )
            const shouldBePreserved = items.filter(i =>
              nonDeletedIds.has(i.product_id),
            )
            for (const item of shouldBePreserved) {
              expect(remaining.some(i => i.id === item.id)).toBe(true)
            }
          },
        ),
        { numRuns: 100 },
      )
    })

    it('is equivalent to set-subtraction filter', () => {
      fc.assert(
        fc.property(
          fc.array(transactionItemArb, { maxLength: 30 }),
          fc.array(uuidArb).map(ids => new Set(ids)),
          (items, deletedProductIds) => {
            const remaining = cascadeDeleteItems(items, deletedProductIds)

            // Equivalent: filter out items whose product_id is in the deleted set
            const expected = items.filter(
              i => !deletedProductIds.has(i.product_id),
            )
            expect(remaining).toEqual(expected)
          },
        ),
        { numRuns: 100 },
      )
    })

    it('is idempotent — applying cascade delete twice yields same result', () => {
      fc.assert(
        fc.property(
          fc.array(transactionItemArb, { maxLength: 30 }),
          fc.array(uuidArb).map(ids => new Set(ids)),
          (items, deletedProductIds) => {
            const once = cascadeDeleteItems(items, deletedProductIds)
            const twice = cascadeDeleteItems(once, deletedProductIds)
            expect(twice).toEqual(once)
          },
        ),
        { numRuns: 100 },
      )
    })
  })

  // ─────────────────────────────────────────────────────────────────────
  // Property 4: No dangling references after cleanup
  // ─────────────────────────────────────────────────────────────────────
  describe('Property 4: No dangling references after cleanup', () => {
    it('ensures every remaining FK reference resolves after orphan removal', () => {
      fc.assert(
        fc.property(
          fc.array(storeArb, { minLength: 1, maxLength: 8 }),
          fc.array(productArb, { minLength: 1, maxLength: 12 }),
          fc.array(transactionArb, { minLength: 1, maxLength: 12 }),
          fc.array(transactionItemArb, { maxLength: 25 }),
          (stores, products, transactions, items) => {
            const [validItems, validTransactions] = removeOrphans(
              items,
              transactions,
              products,
              stores,
            )

            const remainingProductIds = new Set(products.map(p => p.id))
            const remainingTxnIds = new Set(
              validTransactions.map(t => t.id),
            )
            const remainingStoreIds = new Set(stores.map(s => s.id))

            // Every valid item references an existing product
            expect(
              validItems.every(i =>
                remainingProductIds.has(i.product_id),
              ),
            ).toBe(true)

            // Every valid item references an existing (still-valid) transaction
            expect(
              validItems.every(i =>
                remainingTxnIds.has(i.transaction_id),
              ),
            ).toBe(true)

            // Every valid transaction references an existing store
            expect(
              validTransactions.every(t =>
                remainingStoreIds.has(t.store_id),
              ),
            ).toBe(true)

            // Cleanup never creates new items or transactions
            expect(validItems.length).toBeLessThanOrEqual(items.length)
            expect(validTransactions.length).toBeLessThanOrEqual(
              transactions.length,
            )
          },
        ),
        { numRuns: 100 },
      )
    })

    it('verifies idempotent cleanup — second pass does not remove more', () => {
      fc.assert(
        fc.property(
          fc.array(storeArb, { minLength: 1, maxLength: 8 }),
          fc.array(productArb, { minLength: 1, maxLength: 12 }),
          fc.array(transactionArb, { minLength: 1, maxLength: 12 }),
          fc.array(transactionItemArb, { maxLength: 25 }),
          (stores, products, transactions, items) => {
            const [onceItems, onceTxns] = removeOrphans(
              items,
              transactions,
              products,
              stores,
            )
            const [twiceItems, twiceTxns] = removeOrphans(
              onceItems,
              onceTxns,
              products,
              stores,
            )

            // Idempotent: second pass should not change the result
            expect(twiceItems).toEqual(onceItems)
            expect(twiceTxns).toEqual(onceTxns)

            // After cleanup, all items reference only surviving transactions
            const onceTxnIds = new Set(onceTxns.map(t => t.id))
            expect(
              onceItems.every(i => onceTxnIds.has(i.transaction_id)),
            ).toBe(true)
          },
        ),
        { numRuns: 100 },
      )
    })

    it('is monotonic — cleanup only removes references, never adds them', () => {
      fc.assert(
        fc.property(
          fc.array(storeArb, { minLength: 1, maxLength: 8 }),
          fc.array(productArb, { minLength: 1, maxLength: 12 }),
          fc.array(transactionArb, { minLength: 1, maxLength: 12 }),
          fc.array(transactionItemArb, { maxLength: 25 }),
          (stores, products, transactions, items) => {
            const [validItems, validTransactions] = removeOrphans(
              items,
              transactions,
              products,
              stores,
            )

            // Every cleaned-up item was in the original set
            const originalItemIds = new Set(items.map(i => i.id))
            expect(
              validItems.every(i => originalItemIds.has(i.id)),
            ).toBe(true)

            // Every cleaned-up transaction was in the original set
            const originalTxnIds = new Set(transactions.map(t => t.id))
            expect(
              validTransactions.every(t => originalTxnIds.has(t.id)),
            ).toBe(true)
          },
        ),
        { numRuns: 100 },
      )
    })
  })
})
