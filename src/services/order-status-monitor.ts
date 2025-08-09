/**
 * Service de monitoring des changements de statut des commandes
 * Alternative au webhook avec polling régulier
 */

import { supabase } from '@/lib/supabase';
import { whatsAppNotifier, OrderData } from './whatsapp-notifier';

interface OrderStatusChange {
  order_id: string;
  from_status: string;
  to_status: string;
  notification_sent: boolean;
  changed_at: string;
}

/**
 * Service pour monitorer les changements de statut des commandes
 */
export class OrderStatusMonitor {
  private pollingInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  private pollIntervalMs = 30000; // 30 secondes par défaut
  private lastCheckTime: Date;

  constructor(pollIntervalMs = 30000) {
    this.pollIntervalMs = pollIntervalMs;
    this.lastCheckTime = new Date();
  }

  /**
   * Démarre le monitoring
   */
  public start() {
    if (this.isRunning) {
      console.log('Order status monitor is already running');
      return;
    }

    // Vérifier que les variables d'environnement sont disponibles
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase configuration missing. Order status monitor cannot start.');
      return;
    }

    this.isRunning = true;
    console.log('Starting order status monitor...');

    // Vérifier immédiatement
    this.checkForStatusChanges();

    // Puis vérifier régulièrement
    this.pollingInterval = setInterval(() => {
      this.checkForStatusChanges();
    }, this.pollIntervalMs);
  }

  /**
   * Arrête le monitoring
   */
  public stop() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isRunning = false;
    console.log('Order status monitor stopped');
  }

  /**
   * Vérifie les changements de statut non notifiés
   */
  private async checkForStatusChanges() {
    try {
      // Récupérer les changements de statut non notifiés
      const { data: changes, error } = await supabase
        .from('order_status_changes')
        .select(`
          *,
          orders!inner (
            id,
            order_number,
            total_amount,
            delivery_address,
            delivery_date,
            tracking_number,
            customers (
              id,
              name,
              phone,
              email
            )
          )
        `)
        .eq('notification_sent', false)
        .gte('changed_at', this.lastCheckTime.toISOString())
        .order('changed_at', { ascending: true });

      if (error) {
        console.error('Error fetching status changes:', error);
        return;
      }

      if (!changes || changes.length === 0) {
        return;
      }

      console.log(`Found ${changes.length} unnotified status changes`);

      // Traiter chaque changement
      for (const change of changes) {
        await this.processStatusChange(change);
      }

      // Mettre à jour le timestamp de dernière vérification
      this.lastCheckTime = new Date();

    } catch (error) {
      console.error('Error in checkForStatusChanges:', error);
    }
  }

  /**
   * Traite un changement de statut individuel
   */
  private async processStatusChange(change: any) {
    try {
      const order = change.orders;
      
      if (!order || !order.customers?.phone) {
        console.warn(`No phone number for order ${order?.order_number}`);
        await this.markAsNotified(change.id, false);
        return;
      }

      // Récupérer les articles de la commande
      const { data: orderItems } = await supabase
        .from('order_items')
        .select(`
          quantity,
          products (
            name
          )
        `)
        .eq('order_id', order.id);

      // Préparer les données pour la notification
      const orderData: OrderData = {
        order_number: order.order_number,
        customer_name: order.customers.name || 'Client',
        customer_phone: order.customers.phone,
        total_amount: order.total_amount,
        delivery_address: order.delivery_address,
        delivery_date: order.delivery_date,
        tracking_number: order.tracking_number,
        items: orderItems?.map((item: any) => ({
          name: item.products?.name || 'Produit',
          quantity: item.quantity
        })) || []
      };

      // Envoyer la notification WhatsApp
      const result = await whatsAppNotifier.sendStatusChangeNotification(
        order.id,
        orderData,
        change.to_status,
        change.from_status
      );

      // Marquer comme notifié
      await this.markAsNotified(change.id, result.sent);

      if (result.sent) {
        console.log(`✅ WhatsApp sent for order ${order.order_number}: ${change.from_status} -> ${change.to_status}`);
      } else {
        console.error(`❌ Failed to send WhatsApp for order ${order.order_number}:`, result.error);
      }

    } catch (error) {
      console.error('Error processing status change:', error);
      await this.markAsNotified(change.id, false);
    }
  }

  /**
   * Marque un changement de statut comme notifié
   */
  private async markAsNotified(changeId: string, success: boolean) {
    try {
      await supabase
        .from('order_status_changes')
        .update({ 
          notification_sent: success,
          notification_attempted_at: new Date().toISOString()
        })
        .eq('id', changeId);
    } catch (error) {
      console.error('Error marking change as notified:', error);
    }
  }

  /**
   * Récupère les statistiques du monitoring
   */
  public async getStats() {
    try {
      const { data, error } = await supabase
        .from('order_status_changes')
        .select('notification_sent')
        .gte('changed_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const total = data?.length || 0;
      const sent = data?.filter(d => d.notification_sent).length || 0;
      const failed = total - sent;

      return {
        total,
        sent,
        failed,
        successRate: total > 0 ? Math.round((sent / total) * 100) : 0
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return null;
    }
  }
}

// Instance singleton
export const orderStatusMonitor = new OrderStatusMonitor();

// Auto-start en production (mais pas pendant le build)
if (
  process.env.NODE_ENV === 'production' && 
  process.env.WHAPI_ENABLE_NOTIFICATIONS !== 'false' &&
  typeof window === 'undefined' && // Côté serveur seulement
  !process.env.NETLIFY_BUILD_BASE // Pas pendant le build Netlify
) {
  // Démarrer avec un délai pour éviter les problèmes de build
  setTimeout(() => {
    try {
      orderStatusMonitor.start();
    } catch (error) {
      console.warn('Could not start order status monitor:', error);
    }
  }, 5000);
}
