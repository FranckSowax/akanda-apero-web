import { useCallback, useEffect, useRef, useState, useMemo } from 'react';

/**
 * Hook de debounce pour optimiser les performances
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook de throttle pour limiter la fréquence d'exécution
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
}

/**
 * Hook d'intersection observer pour le lazy loading
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [elementRef, setElementRef] = useState<HTMLElement | null>(null);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    if (!elementRef) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setHasIntersected(true);
        observer.unobserve(elementRef);
      }
    }, options);

    observer.observe(elementRef);

    return () => {
      observer.disconnect();
    };
  }, [elementRef, options]);

  return { elementRef: setElementRef, hasIntersected };
}

/**
 * Hook pour surveiller les performances des composants
 */
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    const renderTime = Date.now() - startTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 Performance Monitor - ${componentName}:`, {
        renderCount: renderCount.current,
        renderTime: `${renderTime}ms`,
        timestamp: new Date().toISOString()
      });
    }
    
    startTime.current = Date.now();
  });

  return {
    renderCount: renderCount.current,
    logPerformance: (action: string, data?: any) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚡ ${componentName} - ${action}:`, data);
      }
    }
  };
}

/**
 * Utilitaire de formatage de devise optimisé pour XAF
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-CF', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Utilitaire de formatage de devise avec gestion des remises
 */
export const formatCurrencyWithDiscount = (
  originalPrice: number,
  discountedPrice?: number
): { original: string; discounted?: string; savings?: string } => {
  const original = formatCurrency(originalPrice);
  
  if (!discountedPrice || discountedPrice >= originalPrice) {
    return { original };
  }
  
  const discounted = formatCurrency(discountedPrice);
  const savings = formatCurrency(originalPrice - discountedPrice);
  
  return { original, discounted, savings };
};

/**
 * Hook pour gérer le cache local avec TTL
 */
export function useLocalCache<T>(key: string, ttlMinutes: number = 5) {
  const get = useCallback((): T | null => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      const { data, timestamp } = JSON.parse(item);
      const now = Date.now();
      const ttlMs = ttlMinutes * 60 * 1000;
      
      if (now - timestamp > ttlMs) {
        localStorage.removeItem(key);
        return null;
      }
      
      return data;
    } catch {
      return null;
    }
  }, [key, ttlMinutes]);

  const set = useCallback((data: T) => {
    try {
      const item = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }, [key]);

  const remove = useCallback(() => {
    localStorage.removeItem(key);
  }, [key]);

  return { get, set, remove };
}

/**
 * Utilitaire pour batching des opérations
 */
export class BatchProcessor<T> {
  private queue: T[] = [];
  private processing = false;
  private batchSize: number;
  private delay: number;

  constructor(
    private processor: (items: T[]) => Promise<void>,
    batchSize: number = 10,
    delay: number = 100
  ) {
    this.batchSize = batchSize;
    this.delay = delay;
  }

  add(item: T): void {
    this.queue.push(item);
    this.scheduleProcessing();
  }

  private scheduleProcessing(): void {
    if (this.processing) return;

    this.processing = true;
    setTimeout(() => {
      this.processBatch();
    }, this.delay);
  }

  private async processBatch(): Promise<void> {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    const batch = this.queue.splice(0, this.batchSize);
    
    try {
      await this.processor(batch);
    } catch (error) {
      console.error('Batch processing error:', error);
    }

    this.processing = false;
    
    // Continue processing if there are more items
    if (this.queue.length > 0) {
      this.scheduleProcessing();
    }
  }

  flush(): Promise<void> {
    return new Promise((resolve) => {
      const checkQueue = () => {
        if (this.queue.length === 0 && !this.processing) {
          resolve();
        } else {
          setTimeout(checkQueue, 10);
        }
      };
      checkQueue();
    });
  }
}
