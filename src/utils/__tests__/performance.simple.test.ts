import { formatCurrency, formatCurrencyWithDiscount } from '../performance'

describe('Performance Utils - Core Functions', () => {
  describe('formatCurrency', () => {
    it('should format currency and contain FCFA', () => {
      const result = formatCurrency(1000)
      expect(result).toContain('FCFA')
      expect(typeof result).toBe('string')
    })

    it('should handle zero values', () => {
      const result = formatCurrency(0)
      expect(result).toContain('FCFA')
      expect(result).toContain('0')
    })

    it('should handle large numbers', () => {
      const result = formatCurrency(1000000)
      expect(result).toContain('FCFA')
      expect(typeof result).toBe('string')
    })
  })

  describe('formatCurrencyWithDiscount', () => {
    it('should return original price when no discount provided', () => {
      const result = formatCurrencyWithDiscount(1000)
      
      expect(result).toHaveProperty('original')
      expect(result.original).toContain('FCFA')
      expect(result).not.toHaveProperty('discounted')
      expect(result).not.toHaveProperty('savings')
    })

    it('should return original price when discount is equal or higher', () => {
      const result1 = formatCurrencyWithDiscount(1000, 1000)
      const result2 = formatCurrencyWithDiscount(1000, 1100)
      
      expect(result1).toHaveProperty('original')
      expect(result1).not.toHaveProperty('discounted')
      
      expect(result2).toHaveProperty('original')
      expect(result2).not.toHaveProperty('discounted')
    })

    it('should calculate discount when valid discount provided', () => {
      const result = formatCurrencyWithDiscount(1000, 800)
      
      expect(result).toHaveProperty('original')
      expect(result).toHaveProperty('discounted')
      expect(result).toHaveProperty('savings')
      
      expect(result.original).toContain('FCFA')
      expect(result.discounted).toContain('FCFA')
      expect(result.savings).toContain('FCFA')
    })
  })
})
