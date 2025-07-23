'use client';

import React, { createContext, useContext, useEffect, useCallback } from 'react';

/**
 * 📊 MonitoringProvider - Akanda Apéro
 * 
 * Provider React simple pour initialiser le monitoring
 */

interface MonitoringContextType {
  trackEvent: (event: string, properties?: Record<string, any>) => void;
  trackError: (error: Error, severity?: 'low' | 'medium' | 'high' | 'critical') => void;
  trackPerformance: (name: string, value: number) => void;
  trackEcommerce: (event: string, data: any) => void;
  trackPageView: (url?: string) => void;
  trackConversion: (type: string, value?: number) => void;
}

const MonitoringContext = createContext<MonitoringContextType | undefined>(undefined);

export function MonitoringProvider({ children }: { children: React.ReactNode }) {
  // Fonction simple pour tracker les vues de page
  const trackPageView = useCallback((url?: string) => {
    if (typeof window !== 'undefined') {
      console.log('📊 Page viewed:', url || window.location.pathname);
    }
  }, []);

  // Tracker la page initiale
  useEffect(() => {
    trackPageView();
  }, [trackPageView]);

  // Fonctions utilitaires pour le contexte
  const contextValue: MonitoringContextType = {
    trackEvent: (event: string, properties = {}) => {
      console.log('📊 Event:', event, properties);
    },

    trackError: (error: Error, severity = 'medium') => {
      console.error('🚨 Error:', error.message, { severity });
    },

    trackPerformance: (name: string, value: number) => {
      console.log('⚡ Performance:', name, value);
    },

    trackEcommerce: (event: string, data: any) => {
      console.log('🛒 Ecommerce:', event, data);
    },

    trackPageView,

    trackConversion: (type: string, value = 1) => {
      console.log('🎯 Conversion:', type, value);
    }
  };

  return (
    <MonitoringContext.Provider value={contextValue}>
      {children}
    </MonitoringContext.Provider>
  );
}

// Hook pour utiliser le monitoring
export function useMonitoring() {
  const context = useContext(MonitoringContext);
  if (context === undefined) {
    throw new Error('useMonitoring must be used within a MonitoringProvider');
  }
  return context;
}

// Hook pour le monitoring de performance des composants
export function useComponentPerformance(componentName: string) {
  const { trackPerformance } = useMonitoring();
  
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      trackPerformance(`${componentName}_render_time`, duration);
    };
  }, [componentName, trackPerformance]);
}

// Hook pour le tracking e-commerce
export function useEcommerceTracking() {
  const { trackEcommerce, trackEvent } = useMonitoring();
  
  return {
    trackPurchase: (orderId: string, value: number, items: any[]) => {
      trackEcommerce('purchase', { orderId, value, items });
    },
    trackAddToCart: (productId: string, productName: string, price: number) => {
      trackEcommerce('add_to_cart', { productId, productName, price });
    },
    trackRemoveFromCart: (productId: string) => {
      trackEcommerce('remove_from_cart', { productId });
    },
    trackViewProduct: (productId: string, productName: string) => {
      trackEvent('view_product', { productId, productName });
    },
    trackBeginCheckout: (cartValue: number, itemCount: number) => {
      trackEcommerce('begin_checkout', { cartValue, itemCount });
    }
  };
}

export default MonitoringProvider;
