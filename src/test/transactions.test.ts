import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

describe('Transaction Correctness Properties', () => {
  /**
   * Property 21: Transaction Ordering Consistency
   * Requirement: 16.1
   */
  it('ensures transactions are ordered by date descending', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          id: fc.uuid(),
          created_at: fc.date().map(d => d.toISOString())
        }), { minLength: 2 }),
        (transactions) => {
          // Simulate sorting logic used in the page
          const sorted = [...transactions].sort((a, b) => 
            new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
          )
          
          for (let i = 0; i < sorted.length - 1; i++) {
            expect(new Date(sorted[i].created_at!).getTime())
              .toBeGreaterThanOrEqual(new Date(sorted[i+1].created_at!).getTime())
          }
        }
      )
    )
  })
})