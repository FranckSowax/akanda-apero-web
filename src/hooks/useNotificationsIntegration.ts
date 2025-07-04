'use client';

import { useEffect } from 'react';
import { useAuth } from './supabase/useAuth';
import { useNotifications } from '../context/NotificationsContext';
import { NotificationService, NotificationEvents } from '../services/notification-service';

/**
 * Hook qui intègre les notifications avec les différentes parties de l'application
 * Il écoute divers événements de l'application et génère les notifications appropriées
 */
export function useNotificationsIntegration() {
  const { session } = useAuth();
  const { refreshNotifications, addNotification } = useNotifications();
  
  // Rafraîchir les notifications quand l'utilisateur est authentifié
  useEffect(() => {
    if (session?.user) {
      refreshNotifications();
    }
  }, [session?.user, refreshNotifications]);
  
  // Intégration avec le système d'inventaire
  useEffect(() => {
    // Vérifier que nous sommes côté client
    if (typeof window === 'undefined' || !session?.user) return;
    
    // Référence pour nettoyer les écouteurs
    const cleanupFunctions: Array<() => void> = [];
    
    // Écouteur pour les produits dont le stock est faible
    const stockSubscription = NotificationService.subscribeToStockChanges(notification => {
      // Cette fonction est appelée automatiquement quand un produit a un stock faible
      console.log('Stock faible détecté:', notification);
    });
    cleanupFunctions.push(() => stockSubscription.unsubscribe());
    
    // Écouteur pour les nouvelles commandes
    const orderSubscription = NotificationService.subscribeToNewOrders(notification => {
      console.log('Nouvelle commande détectée:', notification);
    });
    cleanupFunctions.push(() => orderSubscription.unsubscribe());
    
    // Écouteur pour les paiements
    const paymentSubscription = NotificationService.subscribeToPayments(notification => {
      console.log('Changement de statut de paiement détecté:', notification);
    });
    cleanupFunctions.push(() => paymentSubscription.unsubscribe());
    
    // Nettoyage des abonnements
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [session?.user]);
  
  // Fonction utilitaire pour créer une notification système
  const createSystemNotification = async (title: string, message: string, priority: 'low' | 'medium' | 'high' = 'medium') => {
    if (!session?.user) return null;
    
    return await addNotification(
      NotificationEvents.system(title, message, priority)
    );
  };
  
  return {
    createSystemNotification
  };
}

export default useNotificationsIntegration;
