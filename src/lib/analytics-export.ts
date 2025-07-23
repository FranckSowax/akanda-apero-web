/**
 * 📈 Export Google Analytics - Akanda Apéro
 * 
 * Service pour exporter les données de monitoring vers Google Analytics 4
 * et autres plateformes d'analytics externes
 */

// Types pour l'export GA4
interface GA4Event {
  event_name: string;
  event_parameters: Record<string, any>;
  user_id?: string;
  session_id?: string;
  timestamp_micros?: number;
}

interface GA4EcommerceItem {
  item_id: string;
  item_name: string;
  item_category: string;
  price: number;
  quantity: number;
}

interface ExportConfig {
  ga4: {
    enabled: boolean;
    measurementId: string;
    apiSecret: string;
  };
  mixpanel: {
    enabled: boolean;
    projectToken: string;
  };
  amplitude: {
    enabled: boolean;
    apiKey: string;
  };
}

class AnalyticsExportService {
  private config: ExportConfig;

  constructor() {
    this.config = {
      ga4: {
        enabled: process.env.NEXT_PUBLIC_GA4_ENABLED === 'true',
        measurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || '',
        apiSecret: process.env.GA4_API_SECRET || ''
      },
      mixpanel: {
        enabled: process.env.NEXT_PUBLIC_MIXPANEL_ENABLED === 'true',
        projectToken: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || ''
      },
      amplitude: {
        enabled: process.env.NEXT_PUBLIC_AMPLITUDE_ENABLED === 'true',
        apiKey: process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY || ''
      }
    };
  }

  /**
   * 📊 Exporter les événements vers toutes les plateformes configurées
   */
  async exportEvent(eventData: any) {
    const promises = [];

    if (this.config.ga4.enabled) {
      promises.push(this.exportToGA4(eventData));
    }

    if (this.config.mixpanel.enabled) {
      promises.push(this.exportToMixpanel(eventData));
    }

    if (this.config.amplitude.enabled) {
      promises.push(this.exportToAmplitude(eventData));
    }

    await Promise.allSettled(promises);
  }

  /**
   * 🔍 Exporter vers Google Analytics 4
   */
  private async exportToGA4(eventData: any) {
    if (!this.config.ga4.measurementId || !this.config.ga4.apiSecret) {
      console.warn('Configuration GA4 manquante');
      return;
    }

    try {
      const ga4Event = this.convertToGA4Format(eventData);
      
      const response = await fetch(
        `https://www.google-analytics.com/mp/collect?measurement_id=${this.config.ga4.measurementId}&api_secret=${this.config.ga4.apiSecret}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            client_id: eventData.sessionId || 'anonymous',
            user_id: eventData.userId,
            events: [ga4Event]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`GA4 export failed: ${response.status}`);
      }

      console.log('✅ Événement exporté vers GA4');
    } catch (error) {
      console.error('❌ Erreur export GA4:', error);
    }
  }

  /**
   * 🎯 Convertir au format GA4
   */
  private convertToGA4Format(eventData: any): GA4Event {
    const baseEvent: GA4Event = {
      event_name: this.mapEventNameToGA4(eventData.event),
      event_parameters: {
        ...eventData.properties,
        custom_timestamp: eventData.timestamp
      },
      user_id: eventData.userId,
      session_id: eventData.sessionId
    };

    // Événements e-commerce spéciaux
    if (eventData.event.startsWith('ecommerce_')) {
      return this.convertEcommerceEventToGA4(eventData, baseEvent);
    }

    return baseEvent;
  }

  /**
   * 🛒 Convertir les événements e-commerce pour GA4
   */
  private convertEcommerceEventToGA4(eventData: any, baseEvent: GA4Event): GA4Event {
    switch (eventData.event) {
      case 'ecommerce_product_view':
        return {
          ...baseEvent,
          event_name: 'view_item',
          event_parameters: {
            ...baseEvent.event_parameters,
            currency: 'XAF',
            value: eventData.properties.price,
            items: [{
              item_id: eventData.properties.productId || eventData.properties.id,
              item_name: eventData.properties.productName || eventData.properties.name,
              item_category: eventData.properties.category,
              price: eventData.properties.price,
              quantity: 1
            }]
          }
        };

      case 'ecommerce_add_to_cart':
        return {
          ...baseEvent,
          event_name: 'add_to_cart',
          event_parameters: {
            ...baseEvent.event_parameters,
            currency: 'XAF',
            value: eventData.properties.total || (eventData.properties.price * eventData.properties.quantity),
            items: [{
              item_id: eventData.properties.productId || eventData.properties.id,
              item_name: eventData.properties.productName || eventData.properties.name,
              price: eventData.properties.price,
              quantity: eventData.properties.quantity || 1
            }]
          }
        };

      case 'ecommerce_begin_checkout':
        return {
          ...baseEvent,
          event_name: 'begin_checkout',
          event_parameters: {
            ...baseEvent.event_parameters,
            currency: 'XAF',
            value: eventData.properties.cartValue,
            items: eventData.properties.items || []
          }
        };

      case 'ecommerce_purchase':
        return {
          ...baseEvent,
          event_name: 'purchase',
          event_parameters: {
            ...baseEvent.event_parameters,
            currency: 'XAF',
            value: eventData.properties.total,
            transaction_id: eventData.properties.orderId,
            items: eventData.properties.items?.map((item: any) => ({
              item_id: item.id,
              item_name: item.name,
              price: item.price,
              quantity: item.quantity
            })) || []
          }
        };

      default:
        return baseEvent;
    }
  }

  /**
   * 🏷️ Mapper les noms d'événements vers GA4
   */
  private mapEventNameToGA4(eventName: string): string {
    const mapping: Record<string, string> = {
      'page_view': 'page_view',
      'click': 'select_content',
      'search': 'search',
      'share': 'share',
      'user_session_start': 'session_start',
      'component_mount': 'custom_component_mount',
      'conversion': 'conversion'
    };

    return mapping[eventName] || eventName;
  }

  /**
   * 🎨 Exporter vers Mixpanel
   */
  private async exportToMixpanel(eventData: any) {
    if (!this.config.mixpanel.projectToken) {
      console.warn('Token Mixpanel manquant');
      return;
    }

    try {
      const mixpanelEvent = {
        event: eventData.event,
        properties: {
          ...eventData.properties,
          token: this.config.mixpanel.projectToken,
          distinct_id: eventData.userId || eventData.sessionId,
          time: Math.floor(eventData.timestamp / 1000), // Mixpanel utilise les secondes
          $insert_id: `${eventData.sessionId}-${eventData.timestamp}` // Déduplication
        }
      };

      const response = await fetch('https://api.mixpanel.com/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([mixpanelEvent])
      });

      if (!response.ok) {
        throw new Error(`Mixpanel export failed: ${response.status}`);
      }

      console.log('✅ Événement exporté vers Mixpanel');
    } catch (error) {
      console.error('❌ Erreur export Mixpanel:', error);
    }
  }

  /**
   * 📈 Exporter vers Amplitude
   */
  private async exportToAmplitude(eventData: any) {
    if (!this.config.amplitude.apiKey) {
      console.warn('Clé API Amplitude manquante');
      return;
    }

    try {
      const amplitudeEvent = {
        user_id: eventData.userId,
        session_id: eventData.sessionId,
        event_type: eventData.event,
        event_properties: eventData.properties,
        time: eventData.timestamp,
        insert_id: `${eventData.sessionId}-${eventData.timestamp}`
      };

      const response = await fetch('https://api2.amplitude.com/2/httpapi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          api_key: this.config.amplitude.apiKey,
          events: [amplitudeEvent]
        })
      });

      if (!response.ok) {
        throw new Error(`Amplitude export failed: ${response.status}`);
      }

      console.log('✅ Événement exporté vers Amplitude');
    } catch (error) {
      console.error('❌ Erreur export Amplitude:', error);
    }
  }

  /**
   * 📊 Exporter les métriques de performance
   */
  async exportPerformanceMetrics(metrics: any) {
    // Convertir les métriques de performance en événements
    Object.entries(metrics).forEach(([metricName, value]) => {
      this.exportEvent({
        event: 'performance_metric',
        properties: {
          metric_name: metricName,
          metric_value: value,
          metric_type: 'web_vital'
        },
        timestamp: Date.now(),
        sessionId: this.generateSessionId()
      });
    });
  }

  /**
   * 🚨 Exporter les erreurs
   */
  async exportError(error: any) {
    await this.exportEvent({
      event: 'javascript_error',
      properties: {
        error_message: error.message,
        error_stack: error.stack?.substring(0, 500), // Limiter la taille
        error_severity: error.severity,
        page_url: error.url
      },
      userId: error.userId,
      timestamp: error.timestamp || Date.now(),
      sessionId: this.generateSessionId()
    });
  }

  /**
   * 💼 Exporter les métriques business
   */
  async exportBusinessMetrics(metrics: any) {
    await this.exportEvent({
      event: 'business_metric',
      properties: {
        metric_name: metrics.metric,
        metric_value: metrics.value,
        metric_category: metrics.category
      },
      timestamp: metrics.timestamp || Date.now(),
      sessionId: this.generateSessionId()
    });
  }

  /**
   * 🔄 Synchroniser les données existantes
   */
  async syncExistingData(startDate: Date, endDate: Date) {
    console.log(`🔄 Synchronisation des données du ${startDate.toISOString()} au ${endDate.toISOString()}`);

    try {
      // Récupérer les événements de la période
      const response = await fetch(`/api/analytics?start=${startDate.toISOString()}&end=${endDate.toISOString()}`);
      const data = await response.json();

      // Exporter les événements par batch
      const events = data.events || [];
      const batchSize = 20; // Limiter pour éviter les rate limits

      for (let i = 0; i < events.length; i += batchSize) {
        const batch = events.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map((event: any) => this.exportEvent(event))
        );

        // Attendre entre les batches
        if (i + batchSize < events.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log(`✅ Synchronisation terminée: ${events.length} événements exportés`);
    } catch (error) {
      console.error('❌ Erreur synchronisation:', error);
    }
  }

  /**
   * 🔧 Utilitaires
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * ⚙️ Mettre à jour la configuration
   */
  updateConfig(newConfig: Partial<ExportConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 📋 Obtenir la configuration actuelle
   */
  getConfig(): ExportConfig {
    return { ...this.config };
  }

  /**
   * 🧪 Tester la connectivité avec les services externes
   */
  async testConnections() {
    const results = {
      ga4: false,
      mixpanel: false,
      amplitude: false
    };

    // Test GA4
    if (this.config.ga4.enabled) {
      try {
        await this.exportToGA4({
          event: 'test_connection',
          properties: { test: true },
          timestamp: Date.now(),
          sessionId: 'test'
        });
        results.ga4 = true;
      } catch (error) {
        console.error('Test GA4 échoué:', error);
      }
    }

    // Test Mixpanel
    if (this.config.mixpanel.enabled) {
      try {
        await this.exportToMixpanel({
          event: 'test_connection',
          properties: { test: true },
          timestamp: Date.now(),
          sessionId: 'test'
        });
        results.mixpanel = true;
      } catch (error) {
        console.error('Test Mixpanel échoué:', error);
      }
    }

    // Test Amplitude
    if (this.config.amplitude.enabled) {
      try {
        await this.exportToAmplitude({
          event: 'test_connection',
          properties: { test: true },
          timestamp: Date.now(),
          sessionId: 'test'
        });
        results.amplitude = true;
      } catch (error) {
        console.error('Test Amplitude échoué:', error);
      }
    }

    return results;
  }
}

// Instance singleton
export const analyticsExport = new AnalyticsExportService();

export default analyticsExport;
