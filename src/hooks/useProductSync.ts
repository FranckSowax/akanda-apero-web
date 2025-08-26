'use client';

import { useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase/client';

// Types pour les événements de synchronisation
export interface ProductSyncEvent {
  type: 'product_added' | 'product_updated' | 'product_deleted' | 'category_changed';
  productId?: string;
  categoryId?: string;
  timestamp: number;
}

// Hook pour la synchronisation des produits
export const useProductSync = (onSync?: (event: ProductSyncEvent) => void) => {
  // Fonction pour déclencher une synchronisation
  const triggerSync = useCallback((event: Omit<ProductSyncEvent, 'timestamp'>) => {
    const syncEvent: ProductSyncEvent = {
      ...event,
      timestamp: Date.now()
    };

    // Broadcast l'événement à toutes les pages ouvertes
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('product-sync', { detail: syncEvent }));
      
      // Utiliser aussi localStorage pour la synchronisation entre onglets
      localStorage.setItem('product-sync-event', JSON.stringify(syncEvent));
      localStorage.removeItem('product-sync-event'); // Trigger storage event
    }

    // Callback local si fourni
    if (onSync) {
      onSync(syncEvent);
    }
  }, [onSync]);

  // Écouter les événements de synchronisation
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleSyncEvent = (event: CustomEvent<ProductSyncEvent>) => {
      if (onSync) {
        onSync(event.detail);
      }
    };

    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === 'product-sync-event' && event.newValue) {
        try {
          const syncEvent: ProductSyncEvent = JSON.parse(event.newValue);
          if (onSync) {
            onSync(syncEvent);
          }
        } catch (error) {
          console.error('Erreur lors du parsing de l\'événement de sync:', error);
        }
      }
    };

    // Écouter les événements personnalisés et storage
    window.addEventListener('product-sync', handleSyncEvent as EventListener);
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      window.removeEventListener('product-sync', handleSyncEvent as EventListener);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [onSync]);

  // Écouter les changements en temps réel via Supabase
  useEffect(() => {
    const channel = supabase
      .channel('product-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          let eventType: ProductSyncEvent['type'] = 'product_updated';
          
          switch (payload.eventType) {
            case 'INSERT':
              eventType = 'product_added';
              break;
            case 'UPDATE':
              eventType = 'product_updated';
              break;
            case 'DELETE':
              eventType = 'product_deleted';
              break;
          }

          const syncEvent: ProductSyncEvent = {
            type: eventType,
            productId: (payload.new as any)?.id || (payload.old as any)?.id,
            categoryId: (payload.new as any)?.category_id || (payload.old as any)?.category_id,
            timestamp: Date.now()
          };

          if (onSync) {
            onSync(syncEvent);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onSync]);

  return { triggerSync };
};

// Hook spécialisé pour les pages de produits
export const useProductPageSync = (
  reloadProducts: () => Promise<void>,
  reloadCategories?: () => Promise<void>
) => {
  const handleSync = useCallback(async (event: ProductSyncEvent) => {
    console.log('🔄 Synchronisation produits:', event);
    
    try {
      // Recharger les produits pour tous les événements
      await reloadProducts();
      
      // Recharger les catégories si une catégorie a changé
      if (event.type === 'category_changed' && reloadCategories) {
        await reloadCategories();
      }
      
      console.log('✅ Synchronisation terminée');
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation:', error);
    }
  }, [reloadProducts, reloadCategories]);

  const { triggerSync } = useProductSync(handleSync);

  return { triggerSync };
};

// Hook spécialisé pour la page d'accueil
export const useHomePageSync = (
  reloadCategories: () => Promise<void>,
  reloadFeaturedProducts?: () => Promise<void>
) => {
  const handleSync = useCallback(async (event: ProductSyncEvent) => {
    console.log('🏠 Synchronisation page d\'accueil:', event);
    
    // Recharger les catégories pour mettre à jour les compteurs
    try {
      await reloadCategories();
      console.log('✅ Catégories rechargées sur la page d\'accueil');
    } catch (error) {
      console.error('❌ Erreur lors du rechargement des catégories:', error);
    }

    // Recharger les produits vedettes si la fonction est fournie
    if (reloadFeaturedProducts) {
      try {
        await reloadFeaturedProducts();
        console.log('✅ Produits vedettes rechargés sur la page d\'accueil');
      } catch (error) {
        console.error('❌ Erreur lors du rechargement des produits vedettes:', error);
      }
    }
  }, [reloadCategories, reloadFeaturedProducts]);

  const { triggerSync } = useProductSync(handleSync);

  return { triggerSync };
};
