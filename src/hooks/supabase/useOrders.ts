import { useState } from 'react';
import { supabase } from '../../lib/supabase/client';
import { Order, OrderItem, Customer } from '../../types/supabase';
import { useCustomers } from './useCustomers';

// Type pour les données de commande
export interface OrderData {
  customerInfo: {
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
  };
  deliveryInfo: {
    address: string;
    city: string;
    additionalInfo?: string;
    location: {
      lat: number;
      lng: number;
      hasLocation: boolean;
    };
    deliveryOption: string;
  };
  paymentInfo: {
    method: string;
    cardNumber?: string;
    cardName?: string;
    expiryDate?: string;
    cvv?: string;
    mobileNumber?: string;
  };
  items: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
  }>;
  totalAmount: number;
  subtotal: number;
  deliveryCost: number;
  discount: number;
}

export function useOrders() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { createCustomer } = useCustomers();

  // Créer une nouvelle commande
  const createOrder = async (orderData: OrderData): Promise<{ success: boolean; orderNumber: string; error: Error | null }> => {
    try {
      setLoading(true);
      setError(null);

      // 1. D'abord créer ou récupérer le client
      const { data: customer, error: customerError } = await createCustomer({
        email: orderData.customerInfo.email,
        first_name: orderData.customerInfo.first_name,
        last_name: orderData.customerInfo.last_name,
        phone: orderData.customerInfo.phone
      });

      if (customerError) throw customerError;
      if (!customer) throw new Error('Erreur lors de la création du client');

      // 2. Générer un numéro de commande unique
      const orderNumber = `AK${Math.floor(100000 + Math.random() * 900000)}`;

      // 3. Créer l'entrée dans la table orders
      const { data: orderData_, error: orderError } = await supabase
        .from('orders')
        .insert([{
          order_number: orderNumber,
          customer_id: customer.id,
          status: 'pending',
          total_amount: orderData.totalAmount,
          shipping_address: orderData.deliveryInfo.address,
          shipping_city: orderData.deliveryInfo.city,
          shipping_additional_info: orderData.deliveryInfo.additionalInfo,
          shipping_lat: orderData.deliveryInfo.location.lat,
          shipping_lng: orderData.deliveryInfo.location.lng,
          shipping_method: orderData.deliveryInfo.deliveryOption,
          shipping_cost: orderData.deliveryCost,
          payment_method: orderData.paymentInfo.method,
          payment_status: 'pending',
          items_subtotal: orderData.subtotal,
          discount_amount: orderData.discount
        }])
        .select()
        .single();
      
      if (orderError) throw orderError;
      if (!orderData_) throw new Error('Erreur lors de la création de la commande');

      // 4. Ajouter les éléments de la commande
      const orderItems = orderData.items.map(item => ({
        order_id: orderData_.id,
        product_id: item.id.toString(),
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) throw itemsError;

      return { success: true, orderNumber, error: null };

    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      setError(error as Error);
      return { success: false, orderNumber: '', error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les commandes d'un client
  const getCustomerOrders = async (customerId: string): Promise<{ data: Order[] | null; error: Error | null }> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data: data as Order[], error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      setError(error as Error);
      return { data: null, error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  // Récupérer toutes les commandes avec les informations des clients et des produits
  const getAllOrders = async (): Promise<{ data: Order[] | null; error: Error | null }> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*),
          customers (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Formatage des données pour l'affichage
      const formattedOrders = data?.map(order => {
        // Calculer le total des articles si nécessaire
        const orderTotal = order.total_amount || 
          order.order_items?.reduce((sum: number, item: OrderItem) => sum + (item.total_price || 0), 0) || 0;
        
        return {
          ...order,
          formatted_date: new Date(order.created_at).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          total_formatted: orderTotal.toLocaleString() + ' XAF',
          status_fr: translateOrderStatus(order.status)
        };
      });

      return { data: formattedOrders as Order[], error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      setError(error as Error);
      return { data: null, error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  // Mise à jour du statut d'une commande
  const updateOrderStatus = async (orderId: string, status: string): Promise<{ success: boolean; error: Error | null }> => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de la commande:', error);
      setError(error as Error);
      return { success: false, error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  // Mise à jour du statut de paiement d'une commande
  const updatePaymentStatus = async (orderId: string, paymentStatus: string): Promise<{ success: boolean; error: Error | null }> => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('orders')
        .update({ payment_status: paymentStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de paiement:', error);
      setError(error as Error);
      return { success: false, error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  // Récupérer une commande par son ID avec les détails complets
  const getOrderById = async (orderId: string): Promise<{ data: Order | null; error: Error | null }> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*),
          customers (*)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;

      return { data: data as Order, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération de la commande:', error);
      setError(error as Error);
      return { data: null, error: error as Error };
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction utilitaire pour traduire les statuts en français
  const translateOrderStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'pending': 'Nouvelle',
      'processing': 'En préparation',
      'ready': 'Prête',
      'shipped': 'En livraison',
      'delivered': 'Livrée',
      'delayed': 'Retardée',
      'cancelled': 'Annulée'
    };
    
    return statusMap[status] || 'Nouvelle';
  };

  return {
    loading,
    error,
    createOrder,
    getCustomerOrders,
    getAllOrders,
    updateOrderStatus,
    updatePaymentStatus,
    getOrderById,
    translateOrderStatus
  };
}
