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
    id: string; // Support UUID
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

  // Créer une nouvelle commande via l'API
  const createOrder = async (orderData: OrderData): Promise<{ success: boolean; orderNumber: string; error: Error | null }> => {
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 Création commande via API:', orderData);

      // Appeler l'API POST /api/orders
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      console.log('📋 Réponse API complète:', { status: response.status, result });

      if (!response.ok) {
        console.error('❌ Erreur HTTP:', { status: response.status, error: result.error, details: result.details });
        throw new Error(result.error || `Erreur HTTP: ${response.status}`);
      }

      if (!result.success) {
        console.error('❌ Erreur API:', { error: result.error, details: result.details });
        throw new Error(result.error || 'Erreur lors de la création de la commande');
      }

      console.log('✅ Commande créée avec succès:', result.order);

      return {
        success: true,
        orderNumber: result.order.order_number,
        error: null
      };

    } catch (error) {
      console.error('❌ Erreur lors de la création de la commande:', error);
      
      // Créer un message d'erreur explicite
      let errorMessage = 'Une erreur est survenue lors de la création de la commande';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      }
      
      const detailedError = new Error(errorMessage);
      console.error('📋 Détails de l\'erreur:', {
        originalError: error,
        processedMessage: errorMessage,
        errorType: typeof error
      });
      
      setError(detailedError);
      return { success: false, orderNumber: '', error: detailedError };
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
      const formattedOrders = data?.map((order: any) => {
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

  // Mise à jour du statut d'une commande via l'API
  const updateOrderStatus = async (orderId: string, status: string): Promise<{ success: boolean; error: Error | null }> => {
    try {
      console.log('🔄 updateOrderStatus appelé avec:', { orderId, status });
      setLoading(true);
      setError(null);

      const url = `/api/orders?id=${orderId}`;
      console.log('📡 Requête vers:', url);
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: status
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Erreur HTTP: ${response.status}`);
      }

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la mise à jour du statut');
      }

      console.log('✅ Statut commande mis à jour:', result.order);
      
      return { success: true, error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du statut de la commande:', error);
      setError(error as Error);
      return { success: false, error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  // Mise à jour du statut de paiement d'une commande via l'API
  const updatePaymentStatus = async (orderId: string, paymentStatus: string): Promise<{ success: boolean; error: Error | null }> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: orderId,
          payment_status: paymentStatus
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Erreur HTTP: ${response.status}`);
      }

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la mise à jour du statut de paiement');
      }

      console.log('✅ Statut paiement mis à jour:', result.order);
      
      return { success: true, error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du statut de paiement:', error);
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
  
  // Récupérer toutes les commandes via l'API
  const fetchOrders = async (filters?: {
    page?: number;
    limit?: number;
    status?: string;
    customerId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      // Construire les paramètres de requête
      const params = new URLSearchParams();
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.status) params.append('status', filters.status);
      if (filters?.customerId) params.append('customerId', filters.customerId);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`/api/orders?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Erreur HTTP: ${response.status}`);
      }

      console.log(`✅ ${result.orders?.length || 0} commandes récupérées via API`);
      
      return {
        orders: result.orders || [],
        pagination: result.pagination
      };

    } catch (error) {
      console.error('❌ Erreur fetchOrders:', error);
      setError(error as Error);
      return {
        orders: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
      };
    } finally {
      setLoading(false);
    }
  };

  // Fonction utilitaire pour traduire les statuts en français
  const translateOrderStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      // EN -> FR (compatibilité historique)
      'pending': 'En attente',
      'confirmed': 'Confirmée',
      'preparing': 'En préparation',
      'ready': 'Prête',
      'ready_for_delivery': 'Prête',
      'out_for_delivery': 'En livraison',
      'delivered': 'Livrée',
      'delayed': 'Retardée',
      'cancelled': 'Annulée',
      'new': 'Nouvelle',
      // Valeurs FR (passe-plat)
      'Nouvelle': 'Nouvelle',
      'Confirmée': 'Confirmée',
      'En préparation': 'En préparation',
      'Prête': 'Prête',
      'En livraison': 'En livraison',
      'Livrée': 'Livrée',
      'Annulée': 'Annulée'
    };
    return statusMap[status] || status || 'Nouvelle';
  };

  return {
    loading,
    error,
    createOrder,
    fetchOrders,
    getCustomerOrders,
    getAllOrders,
    updateOrderStatus,
    updatePaymentStatus,
    getOrderById,
    translateOrderStatus
  };
}
