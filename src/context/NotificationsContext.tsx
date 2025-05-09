'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

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
  addNotification: (notification: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
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

// Simuler un service de notification (remplacer par une vraie API dans un environnement de production)
const STORAGE_KEY = 'akanda_apero_admin_notifications';

// Provider du contexte
export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  
  // Calculer le nombre de notifications non lues
  const unreadCount = notifications.filter(n => !n.read).length;

  // Charger les notifications depuis le stockage local au démarrage
  useEffect(() => {
    const storedNotifications = localStorage.getItem(STORAGE_KEY);
    if (storedNotifications) {
      try {
        // Convertir les chaînes de date en objets Date
        const parsedNotifications = JSON.parse(storedNotifications);
        setNotifications(
          parsedNotifications.map((n: any) => ({
            ...n,
            createdAt: new Date(n.createdAt)
          }))
        );
      } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error);
        setNotifications([]);
      }
    }
  }, []);

  // Sauvegarder les notifications dans le stockage local à chaque changement
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  // Ajouter une nouvelle notification
  const addNotification = (notification: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: NotificationItem = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Jouer un son si c'est une notification à haute priorité
    if (notification.priority === 'high' && typeof window !== 'undefined') {
      // On pourrait ajouter un son ici
      // new Audio('/sounds/notification.mp3').play().catch(e => console.log(e));
    }
  };

  // Marquer une notification comme lue
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Supprimer une notification
  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Supprimer toutes les notifications
  const clearAll = () => {
    setNotifications([]);
  };

  // Vérifier périodiquement les nouvelles notifications (simulé ici)
  useEffect(() => {
    // Dans un environnement réel, cela pourrait être une connexion WebSocket ou une requête périodique
    const checkForNewNotifications = () => {
      // Cette fonction serait remplacée par un appel à l'API réelle
    };

    // Vérifier toutes les 30 secondes
    const interval = setInterval(checkForNewNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
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
