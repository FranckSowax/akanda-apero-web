'use client';

import { createClient } from '@supabase/supabase-js';
import { NotificationItem, NotificationType, NotificationPriority } from '../context/NotificationsContext';

// Création du client Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export interface NotificationData {
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  link?: string;
  metadata?: Record<string, any>;
  userId?: string; // ID de l'utilisateur concerné (ou null pour les admins)
}

/**
 * Service de gestion des notifications
 */
export const NotificationService = {
  /**
   * Crée une nouvelle notification dans la base de données
   */
  async createNotification(data: NotificationData): Promise<NotificationItem | null> {
    try {
      const { data: notificationData, error } = await supabase
        .from('notifications')
        .insert({
          title: data.title,
          message: data.message,
          type: data.type,
          priority: data.priority,
          link: data.link,
          metadata: data.metadata,
          user_id: data.userId,
          is_read: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création de la notification:', error);
        return null;
      }

      return {
        id: notificationData.id,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type as NotificationType,
        priority: notificationData.priority as NotificationPriority,
        read: notificationData.is_read,
        createdAt: new Date(notificationData.created_at),
        link: notificationData.link,
        metadata: notificationData.metadata
      };
    } catch (error) {
      console.error('Exception lors de la création de la notification:', error);
      return null;
    }
  },

  /**
   * Récupère les notifications pour un utilisateur spécifique ou pour les admins
   */
  async getNotifications(userId?: string, limit: number = 50): Promise<NotificationItem[]> {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      // Si un userId est fourni, filtre par cet ID ou par les notifications admin (userId = null)
      if (userId) {
        query = query.or(`user_id.eq.${userId},user_id.is.null`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erreur lors de la récupération des notifications:', error);
        return [];
      }

      return data.map(item => ({
        id: item.id,
        title: item.title,
        message: item.message,
        type: item.type as NotificationType,
        priority: item.priority as NotificationPriority,
        read: item.is_read,
        createdAt: new Date(item.created_at),
        link: item.link,
        metadata: item.metadata
      }));
    } catch (error) {
      console.error('Exception lors de la récupération des notifications:', error);
      return [];
    }
  },

  /**
   * Marque une notification comme lue
   */
  async markAsRead(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) {
        console.error('Erreur lors du marquage de la notification comme lue:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception lors du marquage de la notification comme lue:', error);
      return false;
    }
  },

  /**
   * Marque toutes les notifications d'un utilisateur comme lues
   */
  async markAllAsRead(userId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false);

      if (userId) {
        query = query.or(`user_id.eq.${userId},user_id.is.null`);
      }

      const { error } = await query;

      if (error) {
        console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception lors du marquage de toutes les notifications comme lues:', error);
      return false;
    }
  },

  /**
   * Supprime une notification
   */
  async deleteNotification(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la suppression de la notification:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception lors de la suppression de la notification:', error);
      return false;
    }
  },

  /**
   * Crée des écouteurs d'événements pour les changements de stocks
   */
  subscribeToStockChanges(callback: (notification: NotificationItem) => void) {
    return supabase
      .channel('stock-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'products', filter: 'stock=lt.10' },
        (payload) => {
          const product = payload.new;
          const notification: NotificationItem = {
            id: Date.now().toString(),
            title: 'Stock faible',
            message: `Le produit "${product.name}" a un stock faible (${product.stock} restants)`,
            type: 'stock',
            priority: product.stock <= 3 ? 'high' : 'medium',
            read: false,
            createdAt: new Date(),
            link: `/admin/products`,
            metadata: { productId: product.id }
          };
          callback(notification);
        }
      )
      .subscribe();
  },

  /**
   * Crée des écouteurs d'événements pour les nouvelles commandes
   */
  subscribeToNewOrders(callback: (notification: NotificationItem) => void) {
    return supabase
      .channel('new-orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const order = payload.new;
          const notification: NotificationItem = {
            id: Date.now().toString(),
            title: 'Nouvelle commande',
            message: `Une nouvelle commande #${order.id.substring(0, 8)} a été placée`,
            type: 'order',
            priority: 'high',
            read: false,
            createdAt: new Date(),
            link: `/admin/orders`,
            metadata: { orderId: order.id }
          };
          callback(notification);
        }
      )
      .subscribe();
  },

  /**
   * Crée des écouteurs d'événements pour les paiements
   */
  subscribeToPayments(callback: (notification: NotificationItem) => void) {
    return supabase
      .channel('payments')
      // Abonnement existant (anglais)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: 'payment_status=in.(succeeded,failed)' },
        (payload) => {
          const order = payload.new;
          const isSuccess = order.payment_status === 'succeeded';
          const notification: NotificationItem = {
            id: Date.now().toString(),
            title: isSuccess ? 'Paiement réussi' : 'Paiement échoué',
            message: isSuccess 
              ? `Le paiement pour la commande #${order.id.substring(0, 8)} a été confirmé` 
              : `Le paiement pour la commande #${order.id.substring(0, 8)} a échoué`,
            type: 'payment',
            priority: isSuccess ? 'medium' : 'high',
            read: false,
            createdAt: new Date(),
            link: `/admin/orders`,
            metadata: { orderId: order.id }
          };
          callback(notification);
        }
      )
      // Abonnement additionnel (français), sans filtre serveur pour garder la compatibilité
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          const order = payload.new;
          const status = order?.payment_status as string | undefined;
          if (status !== 'Payé' && status !== 'Échoué') return; // ne réagit qu'aux statuts FR visés

          const isSuccess = status === 'Payé';
          const notification: NotificationItem = {
            id: Date.now().toString(),
            title: isSuccess ? 'Paiement réussi' : 'Paiement échoué',
            message: isSuccess
              ? `Le paiement pour la commande #${order.id.substring(0, 8)} a été confirmé`
              : `Le paiement pour la commande #${order.id.substring(0, 8)} a échoué`,
            type: 'payment',
            priority: isSuccess ? 'medium' : 'high',
            read: false,
            createdAt: new Date(),
            link: `/admin/orders`,
            metadata: { orderId: order.id }
          };
          callback(notification);
        }
      )
      .subscribe();
  }
};

/**
 * Fonctions d'aide pour générer des notifications pour des événements spécifiques
 */
export const NotificationEvents = {
  // Notification de stock faible
  stockLow(productId: string, productName: string, stockLevel: number): NotificationData {
    return {
      title: 'Stock faible',
      message: `Le produit "${productName}" a un stock faible (${stockLevel} restants)`,
      type: 'stock',
      priority: stockLevel <= 3 ? 'high' : 'medium',
      link: `/admin/products`,
      metadata: { productId }
    };
  },

  // Notification de rupture de stock
  stockOut(productId: string, productName: string): NotificationData {
    return {
      title: 'Rupture de stock',
      message: `Le produit "${productName}" est en rupture de stock`,
      type: 'stock',
      priority: 'high',
      link: `/admin/products`,
      metadata: { productId }
    };
  },

  // Notification de nouvelle commande
  newOrder(orderId: string, total: number): NotificationData {
    return {
      title: 'Nouvelle commande',
      message: `Une nouvelle commande #${orderId.substring(0, 8)} a été placée (${total.toLocaleString()} FCFA)`,
      type: 'order',
      priority: 'high',
      link: `/admin/orders`,
      metadata: { orderId }
    };
  },

  // Notification de changement de statut de commande
  orderStatusChange(orderId: string, status: string): NotificationData {
    return {
      title: 'Statut de commande mis à jour',
      message: `La commande #${orderId.substring(0, 8)} est maintenant "${status}"`,
      type: 'order',
      priority: 'medium',
      link: `/admin/orders`,
      metadata: { orderId }
    };
  },

  // Notification de paiement
  payment(orderId: string, success: boolean): NotificationData {
    return {
      title: success ? 'Paiement confirmé' : 'Paiement refusé',
      message: success 
        ? `Le paiement pour la commande #${orderId.substring(0, 8)} a été confirmé` 
        : `Le paiement pour la commande #${orderId.substring(0, 8)} a été refusé`,
      type: 'payment',
      priority: success ? 'medium' : 'high',
      link: `/admin/orders`,
      metadata: { orderId }
    };
  },

  // Notification de livraison
  delivery(orderId: string, status: string): NotificationData {
    return {
      title: 'Mise à jour de livraison',
      message: `La livraison de la commande #${orderId.substring(0, 8)} est "${status}"`,
      type: 'delivery',
      priority: 'medium',
      link: `/admin/orders`,
      metadata: { orderId }
    };
  },

  // Notification système
  system(title: string, message: string, priority: NotificationPriority = 'medium'): NotificationData {
    return {
      title,
      message,
      type: 'system',
      priority,
      link: '/admin/settings'
    };
  }
};
