'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/supabase/useAuth';
import { NotificationService, NotificationData } from '../services/notification-service';
import { toast } from '../components/ui/use-toast';

// Types pour les notifications
export type NotificationPriority = 'low' | 'medium' | 'high';
export type NotificationType = 'order' | 'stock' | 'payment' | 'delivery' | 'system' | 'other';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  read: boolean;
  createdAt: Date;
  link?: string; // Lien optionnel pour diriger vers une page spécifique
  metadata?: Record<string, any>; // Données supplémentaires
}

interface NotificationsContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  addNotification: (notification: NotificationData) => Promise<NotificationItem | null>;
  markAsRead: (id: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  deleteNotification: (id: string) => Promise<boolean>;
  clearAll: () => void;
  refreshNotifications: () => Promise<void>;
}

// Création du contexte avec une valeur par défaut
const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte
export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications doit être utilisé à l'intérieur d'un NotificationsProvider");
  }
  return context;
};

// Configuration du son de notification
const NOTIFICATION_SOUND_URL = '/sounds/notification.mp3';
let notificationSound: HTMLAudioElement | null = null;

if (typeof window !== 'undefined') {
  notificationSound = new Audio(NOTIFICATION_SOUND_URL);
  // Préchargement silencieux
  notificationSound.load();
  notificationSound.volume = 0.5;
}

// Provider du contexte
export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Calculer le nombre de notifications non lues
  const unreadCount = notifications.filter(n => !n.read).length;

  // Rafraîchir les notifications depuis Supabase
  const refreshNotifications = async () => {
    setLoading(true);
    try {
      const userId = session?.user?.id;
      const notificationsData = await NotificationService.getNotifications(userId);
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les notifications au démarrage
  useEffect(() => {
    refreshNotifications();
  }, [session?.user?.id]);

  // Ajouter une nouvelle notification
  const addNotification = async (notification: NotificationData): Promise<NotificationItem | null> => {
    try {
      const userId = session?.user?.id;
      const newNotification = await NotificationService.createNotification({
        ...notification,
        userId
      });
      
      if (newNotification) {
        setNotifications(prev => [newNotification, ...prev]);
        
        // Jouer un son pour les notifications de haute priorité
        if (notification.priority === 'high' && notificationSound) {
          notificationSound.play().catch(e => console.warn('Impossible de jouer le son de notification:', e));
        }
        
        // Afficher un toast pour les notifications de haute priorité
        if (notification.priority === 'high') {
          toast({
            title: notification.title,
            description: notification.message,
            variant: 'destructive',
          });
        }
        
        return newNotification;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la notification:', error);
      return null;
    }
  };

  // Marquer une notification comme lue
  const markAsRead = async (id: string): Promise<boolean> => {
    try {
      const success = await NotificationService.markAsRead(id);
      if (success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id 
              ? { ...notification, read: true } 
              : notification
          )
        );
      }
      return success;
    } catch (error) {
      console.error('Erreur lors du marquage de la notification comme lue:', error);
      return false;
    }
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = async (): Promise<boolean> => {
    try {
      const userId = session?.user?.id;
      const success = await NotificationService.markAllAsRead(userId);
      if (success) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        );
      }
      return success;
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
      return false;
    }
  };

  // Supprimer une notification
  const deleteNotification = async (id: string): Promise<boolean> => {
    try {
      const success = await NotificationService.deleteNotification(id);
      if (success) {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
      }
      return success;
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
      return false;
    }
  };

  // Supprimer toutes les notifications (localement uniquement)
  const clearAll = () => {
    setNotifications([]);
  };

  // S'abonner aux événements en temps réel
  useEffect(() => {
    if (!session?.user) return;
    
    // Gérer l'ajout d'une nouvelle notification en temps réel
    const handleNewNotification = (notification: NotificationItem) => {
      setNotifications(prev => [notification, ...prev]);
      
      // Jouer un son pour les notifications de haute priorité
      if (notification.priority === 'high' && notificationSound) {
        notificationSound.play().catch(e => console.warn('Impossible de jouer le son de notification:', e));
      }
      
      // Afficher un toast pour les notifications de haute priorité
      if (notification.priority === 'high') {
        toast({
          title: notification.title,
          description: notification.message,
          variant: 'destructive',
        });
      }
    };
    
    // S'abonner aux changements de stock
    const stockSubscription = NotificationService.subscribeToStockChanges(handleNewNotification);
    
    // S'abonner aux nouvelles commandes
    const orderSubscription = NotificationService.subscribeToNewOrders(handleNewNotification);
    
    // S'abonner aux paiements
    const paymentSubscription = NotificationService.subscribeToPayments(handleNewNotification);
    
    // Nettoyage des abonnements
    return () => {
      stockSubscription.unsubscribe();
      orderSubscription.unsubscribe();
      paymentSubscription.unsubscribe();
    };
  }, [session?.user]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        refreshNotifications
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

// Hook pour simuler des événements qui généreraient des notifications
// Dans une application réelle, ce serait remplacé par des écouteurs d'événements API
export const useNotificationSimulator = () => {
  const { addNotification } = useNotifications();

  // Simuler une nouvelle commande
  const simulateNewOrder = (orderNumber: string, amount: string) => {
    addNotification({
      title: 'Nouvelle commande',
      message: `Une nouvelle commande #${orderNumber} de ${amount} XAF a été reçue.`,
      type: 'order',
      priority: 'high',
      link: `/admin/orders/${orderNumber}`,
      metadata: { orderNumber, amount }
    });
  };

  // Simuler un stock bas
  const simulateLowStock = (productName: string, quantity: number) => {
    addNotification({
      title: 'Stock bas',
      message: `Le produit "${productName}" a atteint un niveau de stock critique (${quantity} restants).`,
      type: 'stock',
      priority: 'medium',
      link: '/admin/products',
      metadata: { productName, quantity }
    });
  };

  // Simuler un paiement reçu
  const simulatePaymentReceived = (orderNumber: string, amount: string) => {
    addNotification({
      title: 'Paiement reçu',
      message: `Le paiement pour la commande #${orderNumber} (${amount} XAF) a été confirmé.`,
      type: 'payment',
      priority: 'medium',
      link: `/admin/orders/${orderNumber}`,
      metadata: { orderNumber, amount }
    });
  };

  return {
    simulateNewOrder,
    simulateLowStock,
    simulatePaymentReceived,
  };
};
