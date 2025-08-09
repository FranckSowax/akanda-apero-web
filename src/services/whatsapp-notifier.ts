/**
 * Service avancé de notifications WhatsApp
 * Gère l'envoi de messages WhatsApp avec file d'attente, retry et templates
 */

import { createClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Types
export interface OrderData {
  order_number: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  delivery_address?: string;
  delivery_date?: string;
  tracking_number?: string;
  items?: Array<{
    name: string;
    quantity: number;
  }>;
}

interface WhatsAppMessage {
  id: string;
  phone: string;
  message: string;
  orderId?: string;
  retryCount: number;
  maxRetries: number;
}

interface SendResult {
  sent: boolean;
  messageId?: string;
  error?: string;
}

interface NotificationTemplate {
  title: string;
  body: string;
  emoji?: string;
}

/**
 * Service de notification WhatsApp avec gestion avancée
 */
export class WhatsAppNotifier {
  private queue: WhatsAppMessage[] = [];
  private isProcessing = false;
  private processingInterval: NodeJS.Timeout | null = null;
  
  // Configuration
  private readonly config = {
    apiToken: process.env.WHAPI_TOKEN || process.env.NEXT_PUBLIC_WHAPI_TOKEN || '',
    apiUrl: process.env.WHAPI_BASE_URL || 'https://gate.whapi.cloud',
    timeout: parseInt(process.env.WHAPI_TIMEOUT || '30000'),
    retryAttempts: parseInt(process.env.WHAPI_RETRY_ATTEMPTS || '3'),
    retryDelay: parseInt(process.env.WHAPI_RETRY_DELAY || '1000'),
    queueDelay: parseInt(process.env.WHAPI_MESSAGE_QUEUE_DELAY || '2000'),
    enableLogging: process.env.WHAPI_ENABLE_LOGGING !== 'false',
    logLevel: process.env.WHAPI_LOG_LEVEL || 'info',
    enableNotifications: process.env.WHAPI_ENABLE_NOTIFICATIONS !== 'false'
  };

  // Templates de messages par statut
  private readonly templates: Record<string, NotificationTemplate> = {
    pending: {
      title: '⏳ Commande en attente',
      body: 'Bonjour {customer_name},\n\nVotre commande #{order_number} est en attente de confirmation.\nMontant total: {total_amount} CHF\n\nNous vous confirmerons rapidement la prise en charge de votre commande.',
      emoji: '⏳'
    },
    confirmed: {
      title: '✅ Commande confirmée',
      body: 'Bonjour {customer_name},\n\nBonne nouvelle ! Votre commande #{order_number} a été confirmée.\nMontant: {total_amount} CHF\n\nNous commençons la préparation de votre commande.',
      emoji: '✅'
    },
    preparing: {
      title: '👨‍🍳 En préparation',
      body: 'Bonjour {customer_name},\n\nVotre commande #{order_number} est en cours de préparation par notre équipe.\n\nVous recevrez une notification dès qu\'elle sera prête.',
      emoji: '👨‍🍳'
    },
    ready: {
      title: '🎉 Commande prête',
      body: 'Bonjour {customer_name},\n\nVotre commande #{order_number} est prête !\n{delivery_info}\n\nMerci pour votre patience.',
      emoji: '🎉'
    },
    ready_for_delivery: {
      title: '📦 Prête pour livraison',
      body: 'Bonjour {customer_name},\n\nVotre commande #{order_number} est prête et en attente de livraison.\nAdresse: {delivery_address}\n\nLe livreur va bientôt la prendre en charge.',
      emoji: '📦'
    },
    out_for_delivery: {
      title: '🚚 En cours de livraison',
      body: 'Bonjour {customer_name},\n\nVotre commande #{order_number} est en route !\n{tracking_info}\n\nLivraison prévue dans les prochaines minutes.',
      emoji: '🚚'
    },
    delivered: {
      title: '✨ Livrée avec succès',
      body: 'Bonjour {customer_name},\n\nVotre commande #{order_number} a été livrée avec succès !\n\nNous espérons que vous apprécierez vos produits.\nÀ bientôt chez Akanda Apéro ! 🥂',
      emoji: '✨'
    },
    cancelled: {
      title: '❌ Commande annulée',
      body: 'Bonjour {customer_name},\n\nVotre commande #{order_number} a été annulée.\nMontant: {total_amount} CHF\n\nSi vous avez des questions, n\'hésitez pas à nous contacter.',
      emoji: '❌'
    },
    delayed: {
      title: '⚠️ Retard de livraison',
      body: 'Bonjour {customer_name},\n\nNous sommes désolés, votre commande #{order_number} a pris du retard.\n\nNous faisons notre maximum pour vous la livrer dans les meilleurs délais.\nMerci de votre compréhension.',
      emoji: '⚠️'
    }
  };

  constructor() {
    this.startQueueProcessor();
    this.log('info', 'WhatsApp Notifier initialized');
  }

  /**
   * Démarre le processeur de file d'attente
   */
  private startQueueProcessor() {
    if (this.processingInterval) return;
    
    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, this.config.queueDelay);
  }

  /**
   * Arrête le processeur de file d'attente
   */
  public stopQueueProcessor() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }

  /**
   * Traite la file d'attente des messages
   */
  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    
    this.isProcessing = true;
    const message = this.queue.shift();
    
    if (message) {
      try {
        const result = await this.sendDirectMessage(message.phone, message.message);
        
        if (!result.sent && message.retryCount < message.maxRetries) {
          // Retry avec backoff exponentiel
          message.retryCount++;
          const delay = this.config.retryDelay * Math.pow(2, message.retryCount - 1);
          
          this.log('warn', `Retry ${message.retryCount}/${message.maxRetries} for ${message.phone} in ${delay}ms`);
          
          setTimeout(() => {
            this.queue.push(message);
          }, delay);
        } else if (!result.sent) {
          // Échec définitif
          this.log('error', `Failed to send message to ${message.phone} after ${message.maxRetries} attempts`);
          
          if (message.orderId) {
            await this.saveNotificationStatus(
              message.orderId,
              message.phone,
              message.message,
              'failed',
              result.error
            );
          }
          
          // Notifier l'admin
          await this.notifyAdmin(`Échec d'envoi WhatsApp après ${message.maxRetries} tentatives pour ${message.phone}`);
        } else {
          // Succès
          this.log('info', `Message sent successfully to ${message.phone}`);
          
          if (message.orderId) {
            await this.saveNotificationStatus(
              message.orderId,
              message.phone,
              message.message,
              'sent',
              undefined,
              result.messageId
            );
          }
        }
      } catch (error) {
        this.log('error', `Error processing message: ${error}`);
      }
    }
    
    this.isProcessing = false;
  }

  /**
   * Ajoute un message à la file d'attente
   */
  private queueMessage(phone: string, message: string, orderId?: string) {
    const queueItem: WhatsAppMessage = {
      id: this.generateId(),
      phone,
      message,
      orderId,
      retryCount: 0,
      maxRetries: this.config.retryAttempts
    };
    
    this.queue.push(queueItem);
    this.log('info', `Message queued for ${phone}`);
  }

  /**
   * Envoie un message WhatsApp directement
   */
  private async sendDirectMessage(phone: string, message: string): Promise<SendResult> {
    try {
      const formattedPhone = this.formatPhoneNumber(phone);
      
      if (!this.validatePhoneNumber(formattedPhone)) {
        throw new Error(`Invalid phone number: ${phone}`);
      }

      const response = await fetch(`${this.config.apiUrl}/messages/text`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: formattedPhone,
          body: message
        }),
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      
      return {
        sent: true,
        messageId: data.sent ? data.id : undefined
      };
    } catch (error: any) {
      this.log('error', `Failed to send message: ${error.message}`);
      return {
        sent: false,
        error: error.message
      };
    }
  }

  /**
   * Formate un numéro de téléphone au format international
   */
  private formatPhoneNumber(phone: string): string {
    // Supprimer tous les caractères non numériques sauf le +
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // Supprimer le + s'il existe (Whapi.Cloud n'accepte pas le +)
    cleaned = cleaned.replace(/^\+/, '');
    
    // Si le numéro commence par 0, supposer qu'il s'agit d'un numéro suisse
    if (cleaned.startsWith('0')) {
      cleaned = '41' + cleaned.substring(1);
    }
    
    // Si le numéro ne commence pas par un code pays, ajouter le code suisse
    if (cleaned.length <= 10 && !cleaned.startsWith('41')) {
      cleaned = '41' + cleaned;
    }
    
    return cleaned;
  }

  /**
   * Valide un numéro de téléphone
   */
  private validatePhoneNumber(phone: string): boolean {
    // Format: [code pays][numéro] sans le +
    // Minimum 10 chiffres, maximum 15
    const phoneRegex = /^[1-9]\d{9,14}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Remplace les variables dans un template
   */
  private replaceTemplateVariables(template: string, data: OrderData): string {
    let message = template;
    
    // Remplacements de base
    message = message.replace(/{customer_name}/g, data.customer_name);
    message = message.replace(/{order_number}/g, data.order_number);
    message = message.replace(/{total_amount}/g, data.total_amount.toFixed(2));
    
    // Informations de livraison
    if (data.delivery_address) {
      message = message.replace(/{delivery_address}/g, data.delivery_address);
      message = message.replace(/{delivery_info}/g, `Adresse de livraison: ${data.delivery_address}`);
    } else {
      message = message.replace(/{delivery_address}/g, 'Non spécifiée');
      message = message.replace(/{delivery_info}/g, 'À retirer sur place');
    }
    
    // Méthodes utilitaires pour les templates
    const formatCurrency = (n: number) => `CHF ${n.toFixed(2)}`;
    const formatDate = (n: string | Date) => new Date(n).toLocaleDateString('fr-CH');
    const formatTime = (n: string | Date) => new Date(n).toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' });
    
    // Date de livraison
    if (data.delivery_date) {
      const date = formatDate(data.delivery_date);
      message = message.replace(/{delivery_date}/g, date);
    }
    
    // Numéro de suivi
    if (data.tracking_number) {
      message = message.replace(/{tracking_number}/g, data.tracking_number);
      message = message.replace(/{tracking_info}/g, `Numéro de suivi: ${data.tracking_number}`);
    } else {
      message = message.replace(/{tracking_info}/g, '');
    }
    
    // Liste des articles
    if (data.items && data.items.length > 0) {
      const itemsList = data.items.map(item => `• ${item.name} x${item.quantity}`).join('\n');
      message = message.replace(/{items_list}/g, itemsList);
    }
    
    return message.trim();
  }

  /**
   * Envoie une notification de changement de statut
   */
  public async sendStatusChangeNotification(
    orderId: string,
    orderData: OrderData,
    newStatus: string,
    oldStatus?: string
  ): Promise<SendResult> {
    if (!this.config.enableNotifications) {
      this.log('info', 'Notifications disabled');
      return { sent: false, error: 'Notifications disabled' };
    }

    try {
      const template = this.templates[newStatus];
      
      if (!template) {
        this.log('warn', `No template found for status: ${newStatus}`);
        return { sent: false, error: `No template for status: ${newStatus}` };
      }
      
      const message = `${template.emoji || ''} ${template.title}\n\n${this.replaceTemplateVariables(template.body, orderData)}`;
      
      // Ajouter à la file d'attente
      this.queueMessage(orderData.customer_phone, message, orderId);
      
      // Log du changement
      this.log('info', `Status change notification queued: ${oldStatus} -> ${newStatus} for order ${orderData.order_number}`);
      
      return { sent: true };
    } catch (error: any) {
      this.log('error', `Error sending status notification: ${error.message}`);
      return { sent: false, error: error.message };
    }
  }

  /**
   * Envoie un message de test
   */
  public async sendTestMessage(phone: string, message?: string): Promise<SendResult> {
    const testMessage = message || `🧪 Test WhatsApp depuis Akanda Apéro\n\nCeci est un message de test.\nHeure: ${new Date().toLocaleString('fr-FR')}\n\n✅ La configuration fonctionne correctement !`;
    
    try {
      const result = await this.sendDirectMessage(phone, testMessage);
      
      if (result.sent) {
        await this.saveNotificationStatus(
          'test-' + Date.now(),
          phone,
          testMessage,
          'sent',
          undefined,
          result.messageId
        );
      }
      
      return result;
    } catch (error: any) {
      return { sent: false, error: error.message };
    }
  }

  /**
   * Enregistre le statut d'une notification dans la base de données
   */
  private async saveNotificationStatus(
    orderId: string,
    phone: string,
    message: string,
    status: 'sent' | 'failed' | 'pending',
    error?: string,
    messageId?: string
  ) {
    try {
      await supabase.from('whatsapp_notifications').insert({
        order_id: orderId,
        customer_phone: phone,
        message_content: message,
        message_status: status,
        whapi_message_id: messageId,
        error_message: error,
        sent_at: status === 'sent' ? new Date().toISOString() : null
      });
    } catch (err) {
      this.log('error', `Failed to save notification status: ${err}`);
    }
  }

  /**
   * Notifie l'administrateur
   */
  private async notifyAdmin(message: string) {
    const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER;
    
    if (adminPhone) {
      try {
        await this.sendDirectMessage(adminPhone, `⚠️ Admin Alert\n\n${message}`);
      } catch (error) {
        this.log('error', `Failed to notify admin: ${error}`);
      }
    }
  }

  /**
   * Récupère les statistiques
   */
  public async getStats() {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('whatsapp_notifications')
        .select('message_status')
        .gte('created_at', twentyFourHoursAgo);
      
      if (error) throw error;
      
      const total = data?.length || 0;
      const sent = data?.filter(n => n.message_status === 'sent').length || 0;
      const failed = data?.filter(n => n.message_status === 'failed').length || 0;
      const pending = data?.filter(n => n.message_status === 'pending').length || 0;
      
      return {
        total,
        sent,
        failed,
        pending,
        successRate: total > 0 ? Math.round((sent / total) * 100) : 0,
        queueSize: this.queue.length
      };
    } catch (error) {
      this.log('error', `Failed to get stats: ${error}`);
      return null;
    }
  }

  /**
   * Teste la connexion à l'API
   */
  public async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.apiUrl}/health`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiToken}`
        },
        signal: AbortSignal.timeout(5000)
      });
      
      return response.ok;
    } catch (error) {
      this.log('error', `Connection test failed: ${error}`);
      return false;
    }
  }

  /**
   * Génère un ID unique
   */
  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log un message
   */
  private log(level: 'info' | 'warn' | 'error', message: string) {
    if (!this.config.enableLogging) return;
    
    const levels = { error: 0, warn: 1, info: 2 };
    const configLevel = levels[this.config.logLevel as keyof typeof levels] || 2;
    const messageLevel = levels[level];
    
    if (messageLevel <= configLevel) {
      const timestamp = new Date().toISOString();
      const prefix = `[WhatsApp ${level.toUpperCase()}] ${timestamp}:`;
      
      switch (level) {
        case 'error':
          console.error(prefix, message);
          break;
        case 'warn':
          console.warn(prefix, message);
          break;
        default:
          console.log(prefix, message);
      }
    }
  }
}

// Instance singleton
export const whatsAppNotifier = new WhatsAppNotifier();
