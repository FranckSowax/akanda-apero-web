'use client';

import { useEffect } from 'react';
import { useNotifications, NotificationType, NotificationPriority } from '../context/NotificationsContext';

// Types de messages pour chaque type de notification
const NOTIFICATION_TEMPLATES: Record<NotificationType, Array<{ title: string; message: string }>> = {
  order: [
    { title: 'Nouvelle commande', message: 'Une nouvelle commande #A12345 a été placée' },
    { title: 'Commande en attente', message: 'La commande #B78901 est en attente de paiement' },
    { title: 'Commande annulée', message: 'La commande #C23456 a été annulée par le client' }
  ],
  stock: [
    { title: 'Stock faible', message: 'Le stock de "Gin Premium Botanist" est faible (2 restants)' },
    { title: 'Rupture de stock', message: 'Le produit "Verres à Cocktail" est en rupture de stock' },
    { title: 'Stock critique', message: 'Stock critique pour "Citrons Bio" (5 restants)' }
  ],
  payment: [
    { title: 'Paiement confirmé', message: 'Le paiement pour la commande #D34567 a été confirmé' },
    { title: 'Paiement refusé', message: 'Le paiement pour la commande #E45678 a été refusé' },
    { title: 'Remboursement émis', message: 'Un remboursement a été émis pour la commande #F56789' }
  ],
  delivery: [
    { title: 'Commande expédiée', message: 'La commande #G67890 a été expédiée' },
    { title: 'Livraison retardée', message: 'La livraison de la commande #H78901 est retardée' },
    { title: 'Commande livrée', message: 'La commande #I89012 a été livrée' }
  ],
  system: [
    { title: 'Mise à jour système', message: 'Une mise à jour du système est disponible' },
    { title: 'Erreur de synchronisation', message: 'Erreur de synchronisation avec le service de paiement' },
    { title: 'Alerte de sécurité', message: 'Tentatives de connexion multiples détectées' }
  ],
  other: [
    { title: 'Notification générale', message: 'Mise à jour générale du système' },
    { title: 'Message important', message: 'Message important pour l\'administrateur' },
    { title: 'Nouvelle fonctionnalité', message: 'Nouvelle fonctionnalité disponible' }
  ]
};

// Priorités possibles
const PRIORITIES: NotificationPriority[] = ['low', 'medium', 'high'];

// Fonction pour obtenir un élément aléatoire d'un tableau
const getRandomElement = <T,>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Liens possibles pour les notifications
const LINKS: (string | undefined)[] = [
  '/admin/orders',
  '/admin/products',
  '/admin/customers',
  '/admin/delivery',
  undefined // Certaines notifications n'ont pas de lien
];

/**
 * Hook pour simuler la génération de notifications à des fins de démonstration.
 * 
 * Dans une application réelle, ce hook serait remplacé par des appels API ou WebSockets
 * pour recevoir des notifications en temps réel depuis le serveur.
 */
export function useNotificationSimulator() {
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Système de notifications désactivé pour éviter le grand nombre de notifications
    // Pour réactiver, décommentez le code ci-dessous
    
    /* 
    // Vérifier qu'on est bien côté client pour éviter les erreurs de rendu serveur
    if (typeof window === 'undefined') return;
    
    // Fonction pour générer une notification aléatoire
    const generateRandomNotification = () => {
      try {
        // Choisir un type aléatoire
        const types = Object.keys(NOTIFICATION_TEMPLATES) as NotificationType[];
        const type = getRandomElement(types);
        
        // Choisir un template aléatoire pour ce type
        const template = getRandomElement(NOTIFICATION_TEMPLATES[type]);
        
        // Choisir une priorité aléatoire
        const priority = getRandomElement(PRIORITIES);
        
        // Choisir un lien aléatoire (ou undefined)
        const link = getRandomElement(LINKS);
        
        // Ajouter la notification
        addNotification({
          title: template.title,
          message: template.message,
          type,
          priority,
          link
        });
      } catch (error) {
        console.error('Erreur lors de la génération de notification:', error);
      }
    };

    // Générer des notifications aléatoires toutes les 30-90 secondes
    const minInterval = 30000; // 30 secondes
    const maxInterval = 90000; // 90 secondes

    // Retarder la première notification pour éviter les problèmes d'hydratation
    const initialTimeout = setTimeout(() => {
      generateRandomNotification();
    }, 2000); // Délai initial de 2 secondes

    // Utiliser un intervalle pour les notifications suivantes
    const interval = setInterval(() => {
      generateRandomNotification();
    }, Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval);

    // Nettoyer les timeouts lors du démontage du composant
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
    */
    
    // Ne rien faire (notifications désactivées)
    return () => {};
  }, [addNotification]); // Ne redémarrez l'effet que si addNotification change
}
