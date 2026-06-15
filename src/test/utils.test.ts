import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('formats Indonesian Rupiah correctly', () => {
      // Use replace(/\u00a0/g, ' ') to handle non-breaking spaces from Intl.NumberFormat
      expect(formatCurrency(25000).replace(/\u00a0/g, ' ')).toBe('Rp 25.000')
      expect(formatCurrency(1500000).replace(/\u00a0/g, ' ')).toBe('Rp 1.500.000')
    })

    it('handles zero', () => {
      expect(formatCurrency(0).replace(/\u00a0/g, ' ')).toBe('Rp 0')
    })

    it('handles negative values', () => {
      expect(formatCurrency(-5000).replace(/\u00a0/g, ' ')).toBe('-Rp 5.000')
    })
  })

  describe('formatDate', () => {
    it('formats dates into Indonesian format', () => {
      const dateStr = '2026-06-15T00:00:00.000Z'
      const formatted = formatDate(dateStr).replace(/\u00a0/g, ' ')
      expect(formatted).toContain('Juni')
      expect(formatted).toContain('2026')
    })
  })

  describe('formatDateTime', () => {
    it('formats date and time into Indonesian format', () => {
      const dateStr = '2026-06-15T10:30:00.000Z'
      const formatted = formatDateTime(dateStr).replace(/\u00a0/g, ' ')
      expect(formatted).toContain('Juni')
      expect(formatted).toContain('2026')
      expect(formatted).toContain('17.30') // WIB (+7 hours)
    })
  })
})
