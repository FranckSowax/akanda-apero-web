'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getAudioAlert } from '../utils/audioAlert';

interface OrderDetails {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  timestamp: string;
}

export function useOrderNotificationsPolling() {
  const [newOrder, setNewOrder] = useState<OrderDetails | null>(null);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(true);

  // Récupérer les détails d'une commande
  const fetchOrderDetails = useCallback(async (orderId: string): Promise<OrderDetails | null> => {
    try {
      console.log('🔍 Récupération des détails de la commande:', orderId);
      
      // Récupérer la commande avec les informations client
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          total_amount,
          created_at,
          customers (
            first_name,
            last_name,
            full_name
          )
        `)
        .eq('id', orderId)
        .single();

      if (orderError) {
        console.error('❌ Erreur lors de la récupération de la commande:', orderError);
        return null;
      }

      if (!order) {
        console.warn('⚠️ Commande non trouvée:', orderId);
        return null;
      }

      // Récupérer les articles de la commande
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          quantity,
          unit_price,
          products (
            name
          )
        `)
        .eq('order_id', orderId);

      if (itemsError) {
        console.error('❌ Erreur lors de la récupération des articles:', itemsError);
      }

      const customerName = order.customers?.full_name || 
                          `${order.customers?.first_name || ''} ${order.customers?.last_name || ''}`.trim() ||
                          'Client Inconnu';

      const items = orderItems?.map(item => ({
        name: item.products?.name || 'Produit Inconnu',
        quantity: item.quantity || 1,
        price: Number(item.unit_price) || 0
      })) || [];

      const orderDetails: OrderDetails = {
        id: order.id,
        orderNumber: order.order_number || 'N/A',
        customerName,
        totalAmount: Number(order.total_amount) || 0,
        items,
        timestamp: new Date(order.created_at).toLocaleString('fr-FR')
      };

      console.log('✅ Détails de la commande récupérés:', orderDetails);
      return orderDetails;

    } catch (err) {
      console.error('❌ Erreur inattendue lors de la récupération des détails:', err);
      return null;
    }
  }, []);

  // Vérifier s'il y a de nouvelles commandes
  const checkForNewOrders = useCallback(async () => {
    try {
      console.log('🔍 Vérification des nouvelles commandes...');
      
      const { data: latestOrder, error } = await supabase
        .from('orders')
        .select('id, created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('❌ Erreur lors de la vérification:', error);
        return;
      }

      if (!latestOrder) {
        console.log('📝 Aucune commande trouvée');
        return;
      }

      // Si c'est la première vérification, initialiser lastOrderId
      if (!lastOrderId) {
        console.log('🎯 Initialisation avec la dernière commande:', latestOrder.id);
        setLastOrderId(latestOrder.id);
        return;
      }

      // Si c'est une nouvelle commande
      if (latestOrder.id !== lastOrderId) {
        console.log('🎉 Nouvelle commande détectée:', latestOrder.id);
        
        const orderDetails = await fetchOrderDetails(latestOrder.id);
        if (orderDetails) {
          setNewOrder(orderDetails);
          setLastOrderId(latestOrder.id);
          
          // Jouer le son zen
          try {
            const audioAlert = getAudioAlert();
            await audioAlert.requestAudioPermission();
            await audioAlert.playOrderAlert();
            console.log('🔔 Son de notification joué');
          } catch (soundError) {
            console.error('❌ Erreur lors de la lecture du son:', soundError);
          }
          
          // Vibration si supportée
          if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
            console.log('📱 Vibration déclenchée');
          }
        }
      } else {
        console.log('✅ Aucune nouvelle commande');
      }

    } catch (err) {
      console.error('❌ Erreur lors de la vérification des nouvelles commandes:', err);
    }
  }, [lastOrderId, fetchOrderDetails]);

  // Fermer la notification
  const dismissNotification = useCallback(() => {
    console.log('❌ Fermeture de la notification');
    
    // Arrêter le son
    try {
      const audioAlert = getAudioAlert();
      audioAlert.stopAlert();
      console.log('🔇 Son arrêté');
    } catch (err) {
      console.error('❌ Erreur lors de l\'arrêt du son:', err);
    }
    
    setNewOrder(null);
  }, []);

  // Démarrer/arrêter le polling
  const togglePolling = useCallback(() => {
    setIsPolling(prev => !prev);
    console.log('🔄 Polling', isPolling ? 'arrêté' : 'démarré');
  }, [isPolling]);

  // Effet pour le polling
  useEffect(() => {
    if (!isPolling) {
      console.log('⏸️ Polling désactivé');
      return;
    }

    console.log('🚀 Démarrage du polling des commandes (toutes les 5 secondes)');
    
    // Vérification initiale
    checkForNewOrders();
    
    // Polling toutes les 5 secondes
    const interval = setInterval(checkForNewOrders, 5000);

    return () => {
      console.log('🛑 Arrêt du polling');
      clearInterval(interval);
    };
  }, [isPolling, checkForNewOrders]);

  return {
    newOrder,
    dismissNotification,
    isPolling,
    togglePolling,
    lastOrderId
  };
}
