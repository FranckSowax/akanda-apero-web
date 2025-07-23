/**
 * 🚨 Système d'alertes automatiques - Akanda Apéro
 * 
 * Gestion des alertes pour erreurs critiques et métriques importantes
 */

interface AlertRule {
  id: string;
  name: string;
  type: 'error' | 'performance' | 'business';
  condition: {
    metric: string;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    threshold: number;
    timeWindow: string; // '5m', '15m', '1h', '24h'
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: ('email' | 'slack' | 'webhook')[];
  enabled: boolean;
}

interface Alert {
  id: string;
  ruleId: string;
  message: string;
  severity: string;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
  metadata: Record<string, any>;
}

class AlertingService {
  private rules: AlertRule[] = [];
  private activeAlerts: Map<string, Alert> = new Map();

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * 🔧 Initialiser les règles d'alerte par défaut
   */
  private initializeDefaultRules() {
    this.rules = [
      // Erreurs critiques
      {
        id: 'critical-errors',
        name: 'Erreurs critiques détectées',
        type: 'error',
        condition: {
          metric: 'error_count',
          operator: 'gte',
          threshold: 1,
          timeWindow: '5m'
        },
        severity: 'critical',
        channels: ['email', 'slack'],
        enabled: true
      },

      // Performance dégradée
      {
        id: 'slow-page-load',
        name: 'Temps de chargement élevé',
        type: 'performance',
        condition: {
          metric: 'web_vital_LCP',
          operator: 'gt',
          threshold: 4000, // 4 secondes
          timeWindow: '15m'
        },
        severity: 'high',
        channels: ['slack'],
        enabled: true
      },

      // Taux d'erreur élevé
      {
        id: 'high-error-rate',
        name: 'Taux d\'erreur élevé',
        type: 'error',
        condition: {
          metric: 'error_rate',
          operator: 'gt',
          threshold: 5, // 5%
          timeWindow: '15m'
        },
        severity: 'high',
        channels: ['email', 'slack'],
        enabled: true
      },

      // Chute des conversions
      {
        id: 'conversion-drop',
        name: 'Chute du taux de conversion',
        type: 'business',
        condition: {
          metric: 'conversion_rate',
          operator: 'lt',
          threshold: 1, // Moins de 1%
          timeWindow: '1h'
        },
        severity: 'medium',
        channels: ['slack'],
        enabled: true
      },

      // Pic de trafic
      {
        id: 'traffic-spike',
        name: 'Pic de trafic inhabituel',
        type: 'performance',
        condition: {
          metric: 'page_views',
          operator: 'gt',
          threshold: 1000, // Plus de 1000 vues/heure
          timeWindow: '1h'
        },
        severity: 'medium',
        channels: ['slack'],
        enabled: true
      }
    ];
  }

  /**
   * 📊 Évaluer les règles d'alerte
   */
  async evaluateRules() {
    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      try {
        const shouldAlert = await this.checkRuleCondition(rule);
        
        if (shouldAlert) {
          await this.triggerAlert(rule);
        } else {
          // Vérifier si une alerte active peut être résolue
          await this.checkAlertResolution(rule);
        }
      } catch (error) {
        console.error(`Erreur évaluation règle ${rule.id}:`, error);
      }
    }
  }

  /**
   * 🔍 Vérifier la condition d'une règle
   */
  private async checkRuleCondition(rule: AlertRule): Promise<boolean> {
    const timeWindow = this.parseTimeWindow(rule.condition.timeWindow);
    const startTime = new Date(Date.now() - timeWindow);

    let metricValue: number;

    switch (rule.type) {
      case 'error':
        metricValue = await this.getErrorMetric(rule.condition.metric, startTime);
        break;
      case 'performance':
        metricValue = await this.getPerformanceMetric(rule.condition.metric, startTime);
        break;
      case 'business':
        metricValue = await this.getBusinessMetric(rule.condition.metric, startTime);
        break;
      default:
        return false;
    }

    return this.evaluateCondition(metricValue, rule.condition);
  }

  /**
   * 📈 Récupérer les métriques d'erreur
   */
  private async getErrorMetric(metric: string, startTime: Date): Promise<number> {
    try {
      const response = await fetch(`/api/errors?period=custom&start=${startTime.toISOString()}`);
      const data = await response.json();

      switch (metric) {
        case 'error_count':
          return data.stats?.totalErrors || 0;
        case 'error_rate':
          // Calculer le taux d'erreur (erreurs / total événements * 100)
          const totalEvents = await this.getTotalEvents(startTime);
          return totalEvents > 0 ? (data.stats?.totalErrors / totalEvents) * 100 : 0;
        default:
          return 0;
      }
    } catch (error) {
      console.error('Erreur récupération métrique erreur:', error);
      return 0;
    }
  }

  /**
   * ⚡ Récupérer les métriques de performance
   */
  private async getPerformanceMetric(metric: string, startTime: Date): Promise<number> {
    try {
      const response = await fetch(`/api/analytics?type=performance&start=${startTime.toISOString()}`);
      const data = await response.json();

      if (metric.startsWith('web_vital_')) {
        const vitalName = metric.replace('web_vital_', '');
        return data.metrics?.[vitalName]?.average || 0;
      }

      if (metric === 'page_views') {
        return data.totalPageViews || 0;
      }

      return 0;
    } catch (error) {
      console.error('Erreur récupération métrique performance:', error);
      return 0;
    }
  }

  /**
   * 💼 Récupérer les métriques business
   */
  private async getBusinessMetric(metric: string, startTime: Date): Promise<number> {
    try {
      const response = await fetch(`/api/analytics?type=business&start=${startTime.toISOString()}`);
      const data = await response.json();

      switch (metric) {
        case 'conversion_rate':
          return this.calculateConversionRate(data);
        case 'revenue':
          return data.categoryStats?.sales?.metrics?.revenue || 0;
        case 'order_count':
          return data.categoryStats?.sales?.count || 0;
        default:
          return 0;
      }
    } catch (error) {
      console.error('Erreur récupération métrique business:', error);
      return 0;
    }
  }

  /**
   * 🧮 Calculer le taux de conversion
   */
  private calculateConversionRate(data: any): number {
    const views = data.events?.product_views || 0;
    const purchases = data.events?.purchases || 0;
    return views > 0 ? (purchases / views) * 100 : 0;
  }

  /**
   * 📊 Récupérer le total des événements
   */
  private async getTotalEvents(startTime: Date): Promise<number> {
    try {
      const response = await fetch(`/api/analytics?type=events&start=${startTime.toISOString()}`);
      const data = await response.json();
      return data.totalEvents || 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * ⚖️ Évaluer une condition
   */
  private evaluateCondition(value: number, condition: AlertRule['condition']): boolean {
    switch (condition.operator) {
      case 'gt': return value > condition.threshold;
      case 'gte': return value >= condition.threshold;
      case 'lt': return value < condition.threshold;
      case 'lte': return value <= condition.threshold;
      case 'eq': return value === condition.threshold;
      default: return false;
    }
  }

  /**
   * 🚨 Déclencher une alerte
   */
  private async triggerAlert(rule: AlertRule) {
    const alertId = `${rule.id}-${Date.now()}`;
    
    // Vérifier si une alerte similaire est déjà active
    const existingAlert = Array.from(this.activeAlerts.values())
      .find(alert => alert.ruleId === rule.id && !alert.resolved);

    if (existingAlert) {
      console.log(`Alerte déjà active pour la règle ${rule.id}`);
      return;
    }

    const alert: Alert = {
      id: alertId,
      ruleId: rule.id,
      message: `🚨 ${rule.name}`,
      severity: rule.severity,
      timestamp: new Date().toISOString(),
      resolved: false,
      metadata: {
        rule: rule.name,
        condition: rule.condition
      }
    };

    this.activeAlerts.set(alertId, alert);

    // Envoyer l'alerte via les canaux configurés
    await this.sendAlert(alert, rule.channels);

    // Enregistrer l'alerte en base de données
    await this.saveAlert(alert);

    console.log(`🚨 Alerte déclenchée: ${rule.name}`);
  }

  /**
   * 📤 Envoyer une alerte
   */
  private async sendAlert(alert: Alert, channels: AlertRule['channels']) {
    const promises = channels.map(channel => {
      switch (channel) {
        case 'email':
          return this.sendEmailAlert(alert);
        case 'slack':
          return this.sendSlackAlert(alert);
        case 'webhook':
          return this.sendWebhookAlert(alert);
        default:
          return Promise.resolve();
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * 📧 Envoyer alerte par email
   */
  private async sendEmailAlert(alert: Alert) {
    // Ici vous pouvez intégrer avec votre service d'email
    // (SendGrid, Mailgun, etc.)
    console.log(`📧 Email alert: ${alert.message}`);
    
    // Exemple d'implémentation avec fetch vers votre API email
    try {
      await fetch('/api/alerts/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: `[Akanda Apéro] ${alert.message}`,
          message: `Une alerte ${alert.severity} a été déclenchée:\n\n${alert.message}\n\nTimestamp: ${alert.timestamp}`,
          severity: alert.severity
        })
      });
    } catch (error) {
      console.error('Erreur envoi email:', error);
    }
  }

  /**
   * 💬 Envoyer alerte Slack
   */
  private async sendSlackAlert(alert: Alert) {
    // Intégration Slack webhook
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    
    if (!slackWebhookUrl) {
      console.warn('SLACK_WEBHOOK_URL non configuré');
      return;
    }

    const color = {
      low: '#36a64f',
      medium: '#ff9500',
      high: '#ff4500',
      critical: '#ff0000'
    }[alert.severity] || '#cccccc';

    try {
      await fetch(slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attachments: [{
            color,
            title: `🚨 Alerte ${alert.severity.toUpperCase()}`,
            text: alert.message,
            fields: [
              {
                title: 'Timestamp',
                value: new Date(alert.timestamp).toLocaleString(),
                short: true
              },
              {
                title: 'Sévérité',
                value: alert.severity,
                short: true
              }
            ]
          }]
        })
      });
    } catch (error) {
      console.error('Erreur envoi Slack:', error);
    }
  }

  /**
   * 🔗 Envoyer alerte webhook
   */
  private async sendWebhookAlert(alert: Alert) {
    const webhookUrl = process.env.ALERT_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.warn('ALERT_WEBHOOK_URL non configuré');
      return;
    }

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert)
      });
    } catch (error) {
      console.error('Erreur envoi webhook:', error);
    }
  }

  /**
   * 💾 Sauvegarder l'alerte en base
   */
  private async saveAlert(alert: Alert) {
    try {
      const { supabase } = await import('./supabase/client');
      
      await supabase
        .from('monitoring_alerts')
        .insert({
          alert_id: alert.id,
          rule_id: alert.ruleId,
          message: alert.message,
          severity: alert.severity,
          timestamp: alert.timestamp,
          resolved: alert.resolved,
          metadata: alert.metadata
        });
    } catch (error) {
      console.error('Erreur sauvegarde alerte:', error);
    }
  }

  /**
   * ✅ Vérifier la résolution d'alertes
   */
  private async checkAlertResolution(rule: AlertRule) {
    const activeAlert = Array.from(this.activeAlerts.values())
      .find(alert => alert.ruleId === rule.id && !alert.resolved);

    if (!activeAlert) return;

    // Vérifier si la condition n'est plus remplie
    const shouldAlert = await this.checkRuleCondition(rule);
    
    if (!shouldAlert) {
      await this.resolveAlert(activeAlert.id);
    }
  }

  /**
   * ✅ Résoudre une alerte
   */
  async resolveAlert(alertId: string) {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) return;

    alert.resolved = true;
    alert.resolvedAt = new Date().toISOString();

    // Mettre à jour en base
    try {
      const { supabase } = await import('./supabase/client');
      
      await supabase
        .from('monitoring_alerts')
        .update({
          resolved: true,
          resolved_at: alert.resolvedAt
        })
        .eq('alert_id', alertId);
    } catch (error) {
      console.error('Erreur résolution alerte:', error);
    }

    console.log(`✅ Alerte résolue: ${alert.message}`);
  }

  /**
   * 🕐 Parser la fenêtre temporelle
   */
  private parseTimeWindow(timeWindow: string): number {
    const match = timeWindow.match(/^(\d+)([mhd])$/);
    if (!match) return 300000; // 5 minutes par défaut

    const [, value, unit] = match;
    const num = parseInt(value, 10);

    switch (unit) {
      case 'm': return num * 60 * 1000; // minutes
      case 'h': return num * 60 * 60 * 1000; // heures
      case 'd': return num * 24 * 60 * 60 * 1000; // jours
      default: return 300000;
    }
  }

  /**
   * 📋 Obtenir les alertes actives
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values())
      .filter(alert => !alert.resolved);
  }

  /**
   * ⚙️ Ajouter une règle personnalisée
   */
  addRule(rule: AlertRule) {
    this.rules.push(rule);
  }

  /**
   * 🔧 Mettre à jour une règle
   */
  updateRule(ruleId: string, updates: Partial<AlertRule>) {
    const ruleIndex = this.rules.findIndex(r => r.id === ruleId);
    if (ruleIndex >= 0) {
      this.rules[ruleIndex] = { ...this.rules[ruleIndex], ...updates };
    }
  }

  /**
   * 🗑️ Supprimer une règle
   */
  removeRule(ruleId: string) {
    this.rules = this.rules.filter(r => r.id !== ruleId);
  }
}

// Instance singleton
export const alerting = new AlertingService();

// Démarrer l'évaluation périodique des règles (toutes les 5 minutes)
if (typeof window === 'undefined') { // Côté serveur seulement
  setInterval(() => {
    alerting.evaluateRules().catch(console.error);
  }, 5 * 60 * 1000); // 5 minutes
}

export default alerting;
