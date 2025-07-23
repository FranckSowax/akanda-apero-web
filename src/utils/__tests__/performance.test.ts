import { renderHook, act } from '@testing-library/react'
import {
  useDebounce,
  useThrottle,
  usePerformanceMonitor,
  useLocalCache,
  formatCurrency,
  formatCurrencyWithDiscount,
  BatchProcessor
} from '../performance'

// Mock console.log for performance monitor tests
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {})

describe('Performance Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Set NODE_ENV to development for performance monitor tests
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      configurable: true
    })
  })

  afterEach(() => {
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'test',
      configurable: true
    })
  })

  describe('useDebounce', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should debounce value changes', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 500 } }
      )

      expect(result.current).toBe('initial')

      // Change value
      rerender({ value: 'updated', delay: 500 })
      expect(result.current).toBe('initial') // Should still be initial

      // Fast forward time
      act(() => {
        jest.advanceTimersByTime(500)
      })

      expect(result.current).toBe('updated')
    })

    it('should reset timer on rapid value changes', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 500 } }
      )

      rerender({ value: 'first', delay: 500 })
      act(() => {
        jest.advanceTimersByTime(250)
      })

      rerender({ value: 'second', delay: 500 })
      act(() => {
        jest.advanceTimersByTime(250)
      })

      expect(result.current).toBe('initial')

      act(() => {
        jest.advanceTimersByTime(250)
      })

      expect(result.current).toBe('second')
    })
  })

  describe('useThrottle', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should throttle function calls', () => {
      const mockFn = jest.fn()
      const { result } = renderHook(() => useThrottle(mockFn, 1000))

      // First call should execute immediately
      act(() => {
        result.current('arg1')
      })
      expect(mockFn).toHaveBeenCalledTimes(1)

      // Second call within delay should be ignored
      act(() => {
        result.current('arg2')
      })
      expect(mockFn).toHaveBeenCalledTimes(1)

      // After delay, next call should execute
      act(() => {
        jest.advanceTimersByTime(1001)
        result.current('arg3')
      })
      expect(mockFn).toHaveBeenCalledTimes(2)
    })
  })

  describe('usePerformanceMonitor', () => {
    it('should track render count and provide logging function', () => {
      const { result, rerender } = renderHook(() => 
        usePerformanceMonitor('TestComponent')
      )

      expect(result.current.renderCount).toBe(0)
      expect(typeof result.current.logPerformance).toBe('function')

      // Trigger rerender
      rerender()
      expect(mockConsoleLog).toHaveBeenCalled()

      // Test logging function
      act(() => {
        result.current.logPerformance('test action', { data: 'test' })
      })
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '⚡ TestComponent - test action:',
        { data: 'test' }
      )
    })

    it('should not log in production environment', () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        configurable: true
      })
      
      const { result } = renderHook(() => 
        usePerformanceMonitor('TestComponent')
      )

      act(() => {
        result.current.logPerformance('test action')
      })

      expect(mockConsoleLog).not.toHaveBeenCalled()
    })
  })

  describe('useLocalCache', () => {
    beforeEach(() => {
      localStorage.clear()
      jest.clearAllMocks()
    })

    it('should store and retrieve data from localStorage', () => {
      const { result } = renderHook(() => useLocalCache<string>('test-key', 5))

      // Initially should return null
      expect(result.current.get()).toBeNull()

      // Set data
      act(() => {
        result.current.set('test-data')
      })

      // Should retrieve data
      expect(result.current.get()).toBe('test-data')
      expect(localStorage.setItem).toHaveBeenCalled()
    })

    it('should expire data after TTL', () => {
      const { result } = renderHook(() => useLocalCache<string>('test-key', 5))

      // Mock Date.now to simulate time passage
      const originalNow = Date.now
      const mockNow = jest.fn()
      Date.now = mockNow

      mockNow.mockReturnValue(1000)
      act(() => {
        result.current.set('test-data')
      })

      // Simulate time passage beyond TTL (5 minutes = 300000ms)
      mockNow.mockReturnValue(1000 + 300001)
      expect(result.current.get()).toBeNull()

      // Restore Date.now
      Date.now = originalNow
    })

    it('should remove data', () => {
      const { result } = renderHook(() => useLocalCache<string>('test-key', 5))

      act(() => {
        result.current.set('test-data')
        result.current.remove()
      })

      expect(localStorage.removeItem).toHaveBeenCalledWith('test-key')
    })
  })

  describe('formatCurrency', () => {
    it('should format currency in XAF', () => {
      const result1 = formatCurrency(1000)
      const result2 = formatCurrency(2500)
      const result3 = formatCurrency(0)
      
      expect(result1).toContain('1')
      expect(result1).toContain('000')
      expect(result1).toContain('FCFA')
      
      expect(result2).toContain('2')
      expect(result2).toContain('500')
      expect(result2).toContain('FCFA')
      
      expect(result3).toContain('0')
      expect(result3).toContain('FCFA')
    })

    it('should handle decimal values by rounding', () => {
      const result1 = formatCurrency(1000.99)
      const result2 = formatCurrency(2500.49)
      
      expect(result1).toContain('FCFA')
      expect(result2).toContain('FCFA')
    })
  })

  describe('formatCurrencyWithDiscount', () => {
    it('should return only original price when no discount', () => {
      const result = formatCurrencyWithDiscount(1000)
      expect(result).toHaveProperty('original')
      expect(result.original).toContain('FCFA')
      expect(result).not.toHaveProperty('discounted')
    })

    it('should return only original price when discount is higher or equal', () => {
      const result = formatCurrencyWithDiscount(1000, 1000)
      expect(result).toHaveProperty('original')
      expect(result.original).toContain('FCFA')
      expect(result).not.toHaveProperty('discounted')

      const result2 = formatCurrencyWithDiscount(1000, 1100)
      expect(result2).toHaveProperty('original')
      expect(result2.original).toContain('FCFA')
      expect(result2).not.toHaveProperty('discounted')
    })

    it('should calculate discount and savings correctly', () => {
      const result = formatCurrencyWithDiscount(1000, 800)
      expect(result).toHaveProperty('original')
      expect(result).toHaveProperty('discounted')
      expect(result).toHaveProperty('savings')
      expect(result.original).toContain('FCFA')
      expect(result.discounted).toContain('FCFA')
      expect(result.savings).toContain('FCFA')
    })
  })

  describe('BatchProcessor', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should process items in batches', async () => {
      const mockProcessor = jest.fn().mockResolvedValue(undefined)
      const batchProcessor = new BatchProcessor(mockProcessor, 2, 100)

      // Add items
      batchProcessor.add('item1')
      batchProcessor.add('item2')
      batchProcessor.add('item3')

      // Fast forward time to trigger processing
      act(() => {
        jest.advanceTimersByTime(150)
      })

      // Wait for processing to complete
      await new Promise(resolve => setTimeout(resolve, 50))

      expect(mockProcessor).toHaveBeenCalledTimes(1)
      expect(mockProcessor).toHaveBeenCalledWith(['item1', 'item2'])
    }, 10000)

    it('should handle processing errors gracefully', async () => {
      const mockProcessor = jest.fn().mockRejectedValue(new Error('Processing error'))
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      const batchProcessor = new BatchProcessor(mockProcessor, 2, 100)

      batchProcessor.add('item1')

      act(() => {
        jest.advanceTimersByTime(150)
      })

      await new Promise(resolve => setTimeout(resolve, 50))

      expect(consoleSpy).toHaveBeenCalledWith('Batch processing error:', expect.any(Error))
      
      consoleSpy.mockRestore()
    }, 10000)

    it('should flush all pending items', async () => {
      const mockProcessor = jest.fn().mockResolvedValue(undefined)
      const batchProcessor = new BatchProcessor(mockProcessor, 5, 100)

      batchProcessor.add('item1')
      batchProcessor.add('item2')

      const flushPromise = batchProcessor.flush()

      act(() => {
        jest.advanceTimersByTime(150)
      })

      await flushPromise

      expect(mockProcessor).toHaveBeenCalledWith(['item1', 'item2'])
    }, 10000)
  })
})
