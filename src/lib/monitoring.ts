/**
 * 📊 Monitoring & Analytics - Akanda Apéro
 * 
 * Service centralisé pour le monitoring des performances,
 * le tracking des erreurs et l'analytics utilisateur
 */

import React from 'react';

// Types pour le monitoring
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url?: string;
  userId?: string;
}

interface ErrorEvent {
  message: string;
  stack?: string;
  url: string;
  userId?: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface UserEvent {
  event: string;
  properties: Record<string, any>;
  userId?: string;
  sessionId: string;
  timestamp: number;
}

interface BusinessMetric {
  metric: string;
  value: number;
  category: 'sales' | 'user' | 'product' | 'order';
  timestamp: number;
}

class MonitoringService {
  private isInitialized = false;
  private sessionId: string;
  private userId?: string;
  private performanceObserver?: PerformanceObserver;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.init();
  }

  /**
   * 🚀 Initialisation du service de monitoring
   */
  private init() {
    if (typeof window === 'undefined' || this.isInitialized) return;

    try {
      // Initialiser le monitoring des performances
      this.initPerformanceMonitoring();
      
      // Initialiser le tracking des erreurs
      this.initErrorTracking();
      
      // Initialiser les métriques Web Vitals
      this.initWebVitals();
      
      // Initialiser le tracking des événements utilisateur
      this.initUserEventTracking();

      this.isInitialized = true;
      // Monitoring service initialized
      
    } catch (error) {
      console.error('❌ Failed to initialize monitoring:', error);
    }
  }

  /**
   * ⚡ Monitoring des performances
   */
  private initPerformanceMonitoring() {
    if (!('PerformanceObserver' in window)) return;

    // Observer pour les métriques de navigation
    this.performanceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        this.trackPerformanceMetric({
          name: entry.name,
          value: entry.duration || entry.startTime,
          timestamp: Date.now(),
          url: window.location.href,
          userId: this.userId
        });
      });
    });

    // Observer différents types de métriques
    try {
      this.performanceObserver.observe({ entryTypes: ['navigation', 'resource', 'measure'] });
    } catch (error) {
      console.warn('Performance observer not fully supported:', error);
    }
  }

  /**
   * 🚨 Tracking des erreurs
   */
  private initErrorTracking() {
    // Erreurs JavaScript globales
    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename || window.location.href,
        userId: this.userId,
        timestamp: Date.now(),
        severity: 'high'
      });
    });

    // Promesses rejetées non gérées
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href,
        userId: this.userId,
        timestamp: Date.now(),
        severity: 'medium'
      });
    });
  }

  /**
   * 📈 Web Vitals (Core Web Vitals) - Temporairement désactivé
   */
  private initWebVitals() {
    // Temporairement désactivé pour éviter les erreurs de build
    // Web Vitals monitoring disabled
    // TODO: Réactiver après correction de la compatibilité web-vitals
  }

  /**
   * 👤 Tracking des événements utilisateur
   */
  private initUserEventTracking() {
    // Tracking automatique des clics
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.dataset.track) {
        this.trackUserEvent({
          event: 'click',
          properties: {
            element: target.tagName,
            text: target.textContent?.slice(0, 50),
            trackId: target.dataset.track,
            url: window.location.href
          },
          userId: this.userId,
          sessionId: this.sessionId,
          timestamp: Date.now()
        });
      }
    });

    // Tracking du temps passé sur la page
    let startTime = Date.now();
    window.addEventListener('beforeunload', () => {
      const timeSpent = Date.now() - startTime;
      this.trackUserEvent({
        event: 'page_time',
        properties: {
          duration: timeSpent,
          url: window.location.href
        },
        userId: this.userId,
        sessionId: this.sessionId,
        timestamp: Date.now()
      });
    });
  }

  /**
   * 📊 Callback pour Web Vitals
   */
  private onWebVital(metric: any) {
    this.trackPerformanceMetric({
      name: `web_vital_${metric.name}`,
      value: metric.value,
      timestamp: Date.now(),
      url: window.location.href,
      userId: this.userId
    });
  }

  /**
   * 🎯 API Publiques
   */

  /**
   * Définir l'utilisateur actuel
   */
  setUser(userId: string) {
    this.userId = userId;
  }

  /**
   * Tracker une métrique de performance personnalisée
   */
  trackPerformanceMetric(metric: PerformanceMetric) {
    if (process.env.NODE_ENV === 'development') {
      // Performance metric tracked
    }

    // Envoyer à votre service d'analytics
    this.sendToAnalytics('performance', metric);
  }

  /**
   * Tracker une erreur
   */
  trackError(error: ErrorEvent) {
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Error Tracked:', error);
    }

    // Envoyer à votre service d'error tracking (ex: Sentry)
    this.sendToErrorTracking(error);
  }

  /**
   * Tracker un événement utilisateur
   */
  trackUserEvent(event: UserEvent) {
    if (process.env.NODE_ENV === 'development') {
      // User event tracked
    }

    // Envoyer à votre service d'analytics
    this.sendToAnalytics('user_event', event);
  }

  /**
   * Tracker une métrique business
   */
  trackBusinessMetric(metric: BusinessMetric) {
    if (process.env.NODE_ENV === 'development') {
      // Business metric tracked
    }

    // Envoyer à votre service d'analytics business
    this.sendToAnalytics('business', metric);
  }

  /**
   * Tracker des événements e-commerce spécifiques
   */
  trackEcommerceEvent(event: string, data: any) {
    this.trackUserEvent({
      event: `ecommerce_${event}`,
      properties: data,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: Date.now()
    });

    // Tracker aussi comme métrique business si applicable
    if (event === 'purchase') {
      this.trackBusinessMetric({
        metric: 'revenue',
        value: data.total || 0,
        category: 'sales',
        timestamp: Date.now()
      });
    }
  }

  /**
   * 🚀 Méthodes d'envoi des données
   */

  private sendToAnalytics(type: string, data: any) {
    // Ici vous pouvez intégrer avec:
    // - Google Analytics 4
    // - Mixpanel
    // - Amplitude
    // - Plausible
    // - Votre propre service

    // Exemple avec fetch vers votre API
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics', JSON.stringify({ type, data }));
    } else {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data }),
        keepalive: true
      }).catch(() => {
        // Ignore les erreurs d'envoi pour ne pas impacter l'UX
      });
    }
  }

  private sendToErrorTracking(error: ErrorEvent) {
    // Intégration avec Sentry, LogRocket, etc.
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(error),
      keepalive: true
    }).catch(() => {
      // Ignore les erreurs d'envoi
    });
  }

  /**
   * 🔧 Utilitaires
   */

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtenir des métriques de performance actuelles
   */
  getCurrentPerformanceMetrics() {
    if (typeof window === 'undefined') return {};

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      // Temps de chargement
      loadTime: navigation?.loadEventEnd - navigation?.loadEventStart,
      domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
      
      // Métriques réseau
      dnsLookup: navigation?.domainLookupEnd - navigation?.domainLookupStart,
      tcpConnect: navigation?.connectEnd - navigation?.connectStart,
      
      // Métriques de rendu
      firstPaint: this.getFirstPaint(),
      firstContentfulPaint: this.getFirstContentfulPaint(),
      
      // Mémoire (si disponible)
      memoryUsage: (performance as any).memory ? {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize,
        limit: (performance as any).memory.jsHeapSizeLimit
      } : null
    };
  }

  private getFirstPaint(): number | null {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : null;
  }

  private getFirstContentfulPaint(): number | null {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : null;
  }

  /**
   * Nettoyer les observers
   */
  cleanup() {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }
}

// Instance singleton
export const monitoring = new MonitoringService();

// Hooks React pour faciliter l'utilisation
export const useMonitoring = () => {
  return {
    trackEvent: monitoring.trackUserEvent.bind(monitoring),
    trackError: monitoring.trackError.bind(monitoring),
    trackPerformance: monitoring.trackPerformanceMetric.bind(monitoring),
    trackEcommerce: monitoring.trackEcommerceEvent.bind(monitoring),
    setUser: monitoring.setUser.bind(monitoring)
  };
};

// Utilitaires pour les composants
export const withMonitoring = <T extends object>(
  Component: React.ComponentType<T>,
  componentName: string
) => {
  return (props: T) => {
    React.useEffect(() => {
      const startTime = Date.now();
      
      monitoring.trackUserEvent({
        event: 'component_mount',
        properties: { component: componentName },
        userId: monitoring['userId'],
        sessionId: monitoring['sessionId'],
        timestamp: startTime
      });

      return () => {
        const duration = Date.now() - startTime;
        monitoring.trackPerformanceMetric({
          name: `component_${componentName}_duration`,
          value: duration,
          timestamp: Date.now()
        });
      };
    }, []);

    return React.createElement(Component, props);
  };
};

export default monitoring;
