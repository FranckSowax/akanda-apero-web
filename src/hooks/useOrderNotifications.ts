'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSupabase } from '../lib/supabase';

interface NewOrderData {
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  items: Array<{
    name: string;
    quantity: number;
  }>;
  id: string;
  created_at: string;
}

interface UseOrderNotificationsReturn {
  newOrder: NewOrderData | null;
  dismissNotification: () => void;
}

export function useOrderNotifications(): UseOrderNotificationsReturn {
  const [newOrder, setNewOrder] = useState<NewOrderData | null>(null);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  // Utiliser le singleton Supabase
  const supabase = getSupabase();

  // Fonction pour récupérer les détails d'une commande
  const fetchOrderDetails = useCallback(async (orderId: string): Promise<NewOrderData | null> => {
    try {
      // Récupérer la commande avec les informations client
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          total_amount,
          created_at,
          customer_first_name,
          customer_last_name,
          customer_email
        `)
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        console.error('Erreur récupération commande:', orderError);
        return null;
      }

      // Récupérer les articles de la commande
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          quantity,
          product_name
        `)
        .eq('order_id', orderId);

      if (itemsError) {
        console.error('Erreur récupération articles:', itemsError);
        return null;
      }

      return {
        id: order.id,
        orderNumber: order.order_number,
        customerName: `${order.customer_first_name} ${order.customer_last_name}`,
        totalAmount: order.total_amount,
        created_at: order.created_at,
        items: orderItems?.map(item => ({
          name: item.product_name,
          quantity: item.quantity
        })) || []
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des détails:', error);
      return null;
    }
  }, [supabase]);

  // Configurer l'écoute en temps réel - Toujours actif
  useEffect(() => {
    if (!supabase) {
      console.error('❌ Supabase client non initialisé');
      return;
    }

    console.log('🔊 Activation de l\'écoute des nouvelles commandes...');
    console.log('📡 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...');

    // Récupérer la dernière commande au démarrage
    const getLastOrder = async () => {
      try {
        console.log('🔍 Récupération de la dernière commande...');
        const { data: lastOrder, error } = await supabase
          .from('orders')
          .select('id')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error('❌ Erreur lors de la récupération de la dernière commande:', error);
          return;
        }

        if (lastOrder) {
          console.log('✅ Dernière commande ID:', lastOrder.id);
          setLastOrderId(lastOrder.id);
        } else {
          console.log('📝 Aucune commande existante');
        }
      } catch (err) {
        console.error('❌ Erreur inattendue:', err);
      }
    };

    getLastOrder();

    // Écouter les nouvelles commandes en temps réel
    console.log('📡 Configuration du canal Realtime...');
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        async (payload) => {
          try {
            console.log('🔔 Nouvelle commande détectée:', payload);
            
            const newOrderId = payload.new?.id;
            if (!newOrderId) {
              console.warn('⚠️ ID de commande manquant dans le payload');
              return;
            }
            
            if (newOrderId === lastOrderId) {
              console.log('🔄 Commande déjà traitée, ignorée');
              return;
            }

            console.log('✨ Traitement de la nouvelle commande:', newOrderId);
            
            // Attendre un peu pour être sûr que les données sont complètes
            setTimeout(async () => {
              try {
                const orderDetails = await fetchOrderDetails(newOrderId);
                if (orderDetails) {
                  console.log('🎉 Affichage de la notification pour:', orderDetails.orderNumber);
                  setNewOrder(orderDetails);
                  setLastOrderId(newOrderId);
                  
                  // Vibration si supportée
                  if ('vibrate' in navigator) {
                    navigator.vibrate([200, 100, 200]);
                    console.log('📱 Vibration déclenchée');
                  }
                } else {
                  console.error('❌ Échec de récupération des détails de la commande');
                }
              } catch (err) {
                console.error('❌ Erreur lors du traitement de la nouvelle commande:', err);
              }
            }, 1000);
          } catch (err) {
            console.error('❌ Erreur dans le gestionnaire de payload:', err);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Statut de la souscription Realtime:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Canal de notifications configuré avec succès');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Erreur de canal Realtime');
        } else if (status === 'TIMED_OUT') {
          console.error('⏰ Timeout de connexion Realtime');
        } else if (status === 'CLOSED') {
          console.warn('🔒 Canal Realtime fermé');
        }
      });

    // Nettoyage
    return () => {
      console.log('🧹 Nettoyage du canal de notifications');
      supabase.removeChannel(channel);
    };
  }, [lastOrderId, fetchOrderDetails, supabase]);

  const dismissNotification = useCallback(() => {
    setNewOrder(null);
  }, []);

  return {
    newOrder,
    dismissNotification
  };
}
