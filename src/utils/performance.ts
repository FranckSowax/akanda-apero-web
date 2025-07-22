'use client';

import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import React from 'react';

/**
 * Utilitaires d'optimisation des performances React
 */

/**
 * Hook de debounce pour optimiser les recherches et inputs
 */
export const useDebounce = <T>(value: T, delay: number): T => {
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
};

/**
 * Hook de throttle pour limiter les appels de fonction
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastCall = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        return callback(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          lastCall.current = Date.now();
          callback(...args);
        }, delay - (now - lastCall.current));
      }
    }) as T,
    [callback, delay]
  );
};

/**
 * Hook d'intersection observer pour le lazy loading
 */
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [hasIntersected, options]);

  return { elementRef, isIntersecting, hasIntersected };
};

/**
 * Hook de memoization avancée pour les calculs coûteux
 */
export const useAdvancedMemo = <T>(
  factory: () => T,
  deps: React.DependencyList,
  isEqual?: (a: T, b: T) => boolean
): T => {
  const ref = useRef<{ deps: React.DependencyList; value: T } | null>(null);

  const hasChanged = useMemo(() => {
    if (!ref.current) return true;
    
    if (ref.current.deps.length !== deps.length) return true;
    
    return deps.some((dep, index) => {
      const prevDep = ref.current!.deps[index];
      return isEqual ? !isEqual(dep, prevDep) : dep !== prevDep;
    });
  }, deps);

  if (hasChanged) {
    const value = factory();
    ref.current = { deps: [...deps], value };
    return value;
  }

  return ref.current!.value;
};

/**
 * Composant de lazy loading pour les images
 */
export const LazyImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
}> = ({ src, alt, className, placeholder, onLoad }) => {
  const { elementRef, hasIntersected } = useIntersectionObserver();
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  return (
    <div ref={elementRef as React.RefObject<HTMLDivElement>} className={className}>
      {hasIntersected && !hasError ? (
        <img
          src={src}
          alt={alt}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : (
        <div 
          className={`bg-gray-200 animate-pulse ${className || ''}`}
          style={{ 
            backgroundImage: placeholder ? `url(${placeholder})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      )}
    </div>
  );
};

/**
 * HOC pour optimiser les re-renders
 */
export const withMemoization = <P extends object>(
  Component: React.ComponentType<P>,
  propsAreEqual?: (prevProps: P, nextProps: P) => boolean
) => {
  const MemoizedComponent = React.memo(Component, propsAreEqual);
  MemoizedComponent.displayName = `withMemoization(${Component.displayName || Component.name})`;
  return MemoizedComponent;
};

/**
 * Utilitaire pour mesurer les performances des composants
 */
export const withPerformanceMonitoring = <P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) => {
  const WrappedComponent = (props: P) => {
    const renderStart = performance.now();
    
    useEffect(() => {
      const renderEnd = performance.now();
      const renderTime = renderEnd - renderStart;
      
      if (renderTime > 16) { // Plus de 16ms = potentiel problème de performance
        console.warn(
          `⚠️ Performance: ${componentName || Component.displayName || Component.name} a pris ${renderTime.toFixed(2)}ms à rendre`
        );
      }
    });

    return React.createElement(Component, props);
  };
  
  WrappedComponent.displayName = `withPerformanceMonitoring(${componentName || Component.displayName || Component.name})`;
  return WrappedComponent;
};


