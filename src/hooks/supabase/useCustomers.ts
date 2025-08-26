import { useState } from 'react';
import { supabase } from '../../lib/supabase/client';
import { Customer } from '../../types/supabase';

export interface CustomerWithStats extends Customer {
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  lastOrderDate: string | null;
  city?: string | null;
  address?: string | null;
}

export function useCustomers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Récupérer tous les clients
  const getCustomers = async (): Promise<{ data: CustomerWithStats[] | null; error: Error | null }> => {
    try {
      setLoading(true);
      setError(null);
      
      // Récupérer les clients de base
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (customersError) throw customersError;
      
      if (!customers) return { data: null, error: null };

      // Récupérer les statistiques pour chaque client
      const customersWithStats = await Promise.all(
        customers.map(async (customer) => {
          // Récupérer les commandes du client
          const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .eq('customer_id', customer.id);
          
          if (ordersError) throw ordersError;

          // Calculer les statistiques
          const totalOrders = orders ? orders.length : 0;
          const totalSpent = orders ? orders.reduce((sum, order) => sum + (order.total_amount || 0), 0) : 0;
          
          // Dernier achat
          const lastOrder = orders && orders.length > 0 
            ? orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] 
            : null;
            
          const lastOrderDate = lastOrder ? new Date(lastOrder.created_at).toLocaleDateString('fr-FR') : null;
          
          // Points de fidélité (à implémenter selon votre logique d'affaires)
          // Dans cet exemple, 1 point pour chaque 1000 XAF dépensé
          const loyaltyPoints = Math.floor(totalSpent / 1000);

          return {
            ...customer,
            totalOrders,
            totalSpent,
            loyaltyPoints,
            lastOrderDate
          };
        })
      );

      return { data: customersWithStats, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des clients:', error);
      setError(error as Error);
      return { data: null, error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  // Créer un nouveau client
  const createCustomer = async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Customer | null; error: Error | null }> => {
    try {
      setLoading(true);
      setError(null);
      
      // Vérifier si le client existe déjà avec cet email
      const { data: existingCustomers, error: checkError } = await supabase
        .from('customers')
        .select('*')
        .eq('email', customerData.email)
        .limit(1);
      
      if (checkError) throw checkError;
      
      if (existingCustomers && existingCustomers.length > 0) {
        // Client déjà existant, retourner celui-ci
        return { data: existingCustomers[0] as Customer, error: null };
      }
      
      // Créer le nouveau client
      const { data, error } = await supabase
        .from('customers')
        .insert([{
          email: customerData.email,
          first_name: customerData.first_name,
          last_name: customerData.last_name,
          phone: customerData.phone
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      return { data: data as Customer, error: null };
    } catch (error) {
      console.error('Erreur lors de la création du client:', error);
      setError(error as Error);
      return { data: null, error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour un client
  const updateCustomer = async (id: string, customerData: Partial<Customer>): Promise<{ data: Customer | null; error: Error | null }> => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('customers')
        .update({
          email: customerData.email,
          first_name: customerData.first_name,
          last_name: customerData.last_name,
          phone: customerData.phone
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return { data: data as Customer, error: null };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du client:', error);
      setError(error as Error);
      return { data: null, error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un client
  const deleteCustomer = async (id: string): Promise<{ success: boolean; error: Error | null }> => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur lors de la suppression du client:', error);
      setError(error as Error);
      return { success: false, error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  // Récupérer un client spécifique
  const getCustomerById = async (id: string): Promise<{ data: CustomerWithStats | null; error: Error | null }> => {
    try {
      setLoading(true);
      setError(null);
      
      // Récupérer les informations du client
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (!data) return { data: null, error: null };

      // Récupérer les commandes du client
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', id);
      
      if (ordersError) throw ordersError;

      // Calculer les statistiques
      const totalOrders = orders ? orders.length : 0;
      const totalSpent = orders ? orders.reduce((sum, order) => sum + (order.total_amount || 0), 0) : 0;
      
      // Dernier achat
      const lastOrder = orders && orders.length > 0 
        ? orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] 
        : null;
        
      const lastOrderDate = lastOrder ? new Date(lastOrder.created_at).toLocaleDateString('fr-FR') : null;
      
      // Points de fidélité
      const loyaltyPoints = Math.floor(totalSpent / 1000);

      const customerWithStats: CustomerWithStats = {
        ...data,
        totalOrders,
        totalSpent,
        loyaltyPoints,
        lastOrderDate
      };

      return { data: customerWithStats, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération du client:', error);
      setError(error as Error);
      return { data: null, error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerById
  };
}
