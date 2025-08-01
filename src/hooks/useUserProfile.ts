'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface UserProfileData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  created_at: string;
  total_orders: number;
  total_spent: number;
  loyalty_points: number;
  loyalty_tier: string;
  average_order_value: number;
  last_order_date?: string;
  orders: any[];
}

export interface UserProfileStats {
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  loyaltyTier: string;
  averageOrderValue: number;
  lastOrderDate?: string;
}

// Fonction pour calculer le tier de fidélité
const calculateLoyaltyTier = (points: number): string => {
  if (points >= 1000) return 'Platinum';
  if (points >= 500) return 'Gold';
  if (points >= 200) return 'Silver';
  return 'Bronze';
};

export const useUserProfile = (userEmail?: string) => {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = useCallback(async () => {
    if (!userEmail) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Récupérer le client
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('email', userEmail)
        .single();

      if (customerError) {
        if (customerError.code === 'PGRST116') {
          // Client pas encore dans la base
          setProfile(null);
          setLoading(false);
          return;
        }
        throw customerError;
      }

      if (!customer) {
        setProfile(null);
        setLoading(false);
        return;
      }

      // Récupérer les commandes confirmées
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          created_at,
          status,
          total_amount,
          delivery_option,
          delivery_address,
          delivery_district,
          delivery_gps_lat,
          delivery_gps_lng
        `)
        .eq('customer_id', customer.id)
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false });

      if (ordersError) {
        throw ordersError;
      }

      // Calculer les statistiques
      const totalOrders = orders?.length || 0;
      const totalSpent = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
      const lastOrderDate = orders && orders.length > 0 ? orders[0].created_at : undefined;

      // Calculer les points de fidélité
      let loyaltyPoints = 0;
      
      if (orders && orders.length > 0) {
        for (const order of orders) {
          const { data: orderItems, error: itemsError } = await supabase
            .from('order_items')
            .select('product_name, quantity')
            .eq('order_id', order.id);

          if (!itemsError && orderItems) {
            orderItems.forEach((item: any) => {
              const productName = item.product_name?.toLowerCase() || '';
              const quantity = item.quantity || 0;

              // Règles de points de fidélité
              if (productName.includes('cocktail') || productName.includes('mojito') || productName.includes('margarita')) {
                loyaltyPoints += 15 * quantity; // Cocktails Maison : 15 points
              } else {
                loyaltyPoints += 10 * quantity; // Autres produits : 10 points
              }
            });
          }
        }
      }

      const loyaltyTier = calculateLoyaltyTier(loyaltyPoints);

      const profileData: UserProfileData = {
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
        phone: customer.phone,
        created_at: customer.created_at,
        total_orders: totalOrders,
        total_spent: totalSpent,
        loyalty_points: loyaltyPoints,
        loyalty_tier: loyaltyTier,
        average_order_value: averageOrderValue,
        last_order_date: lastOrderDate,
        orders: orders || []
      };

      setProfile(profileData);

    } catch (err: any) {
      console.error('Erreur lors de la récupération du profil:', err);
      setError(err.message || 'Erreur lors de la récupération du profil');
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const refreshProfile = useCallback(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  return {
    profile,
    loading,
    error,
    refreshProfile
  };
};
