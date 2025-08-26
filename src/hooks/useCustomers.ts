import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';

export interface CustomerWithStats {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
  // Statistiques calculées
  total_orders: number;
  total_spent: number;
  loyalty_points: number;
  last_order_date: string | null;
  average_order_value: number;
  // Statut de fidélité
  loyalty_tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  orders?: any[];
}

export interface CustomerFilters {
  search: string;
  loyaltyTier: string;
  sortBy: 'name' | 'orders' | 'spent' | 'points' | 'lastOrder';
  sortOrder: 'asc' | 'desc';
}

export const useCustomers = () => {
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CustomerFilters>({
    search: '',
    loyaltyTier: 'all',
    sortBy: 'lastOrder',
    sortOrder: 'desc'
  });



  // Fonction pour calculer le tier de fidélité basé sur les points
  const calculateLoyaltyTier = (points: number): 'Bronze' | 'Silver' | 'Gold' | 'Platinum' => {
    if (points >= 1000) return 'Platinum';
    if (points >= 500) return 'Gold';
    if (points >= 200) return 'Silver';
    return 'Bronze';
  };

  // Fonction pour calculer les points de fidélité selon les règles
  const calculateLoyaltyPointsFromOrders = (orders: any[]): number => {
    let totalPoints = 0;
    
    orders.forEach(order => {
      if (order.order_items) {
        order.order_items.forEach((item: any) => {
          const productName = item.product_name?.toLowerCase() || '';
          
          // Règles de points selon la catégorie (même logique que checkout)
          if (productName.includes('cocktail') || productName.includes('mojito') || productName.includes('margarita')) {
            // Cocktails Maison : 15 points par produit
            totalPoints += 15 * item.quantity;
          } else {
            // Apéros et autres : 10 points par produit
            totalPoints += 10 * item.quantity;
          }
        });
      }
    });
    
    return totalPoints;
  };

  // Fonction pour charger les clients avec leurs statistiques
  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer tous les clients
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (customersError) {
        throw customersError;
      }

      if (!customersData) {
        setCustomers([]);
        return;
      }

      // Pour chaque client, récupérer ses commandes et calculer les statistiques
      const customersWithStats = await Promise.all(
        customersData.map(async (customer) => {
          // Récupérer les commandes du client
          const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select(`
              *,
              order_items (
                id,
                product_name,
                quantity,
                unit_price,
                subtotal
              )
            `)
            .eq('customer_id', customer.id)
            .order('created_at', { ascending: false });

          if (ordersError) {
            console.error('Erreur lors du chargement des commandes:', ordersError);
          }

          const customerOrders = orders || [];
          
          // Calculer les statistiques
          const totalOrders = customerOrders.length;
          const totalSpent = customerOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
          const loyaltyPoints = calculateLoyaltyPointsFromOrders(customerOrders);
          const lastOrderDate = customerOrders.length > 0 ? customerOrders[0].created_at : null;
          const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
          const loyaltyTier = calculateLoyaltyTier(loyaltyPoints);

          return {
            ...customer,
            total_orders: totalOrders,
            total_spent: totalSpent,
            loyalty_points: loyaltyPoints,
            last_order_date: lastOrderDate,
            average_order_value: averageOrderValue,
            loyalty_tier: loyaltyTier,
            orders: customerOrders
          } as CustomerWithStats;
        })
      );

      setCustomers(customersWithStats);
    } catch (err) {
      console.error('Erreur lors du chargement des clients:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour filtrer et trier les clients
  const getFilteredCustomers = () => {
    let filtered = [...customers];

    // Filtrer par recherche
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(customer => 
        customer.first_name?.toLowerCase().includes(searchLower) ||
        customer.last_name?.toLowerCase().includes(searchLower) ||
        customer.email?.toLowerCase().includes(searchLower) ||
        customer.phone?.includes(filters.search)
      );
    }

    // Filtrer par tier de fidélité
    if (filters.loyaltyTier !== 'all') {
      filtered = filtered.filter(customer => customer.loyalty_tier === filters.loyaltyTier);
    }

    // Trier
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (filters.sortBy) {
        case 'name':
          aValue = `${a.first_name} ${a.last_name}`.toLowerCase();
          bValue = `${b.first_name} ${b.last_name}`.toLowerCase();
          break;
        case 'orders':
          aValue = a.total_orders;
          bValue = b.total_orders;
          break;
        case 'spent':
          aValue = a.total_spent;
          bValue = b.total_spent;
          break;
        case 'points':
          aValue = a.loyalty_points;
          bValue = b.loyalty_points;
          break;
        case 'lastOrder':
          aValue = a.last_order_date ? new Date(a.last_order_date).getTime() : 0;
          bValue = b.last_order_date ? new Date(b.last_order_date).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  // Fonction pour mettre à jour les filtres
  const updateFilters = (newFilters: Partial<CustomerFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Fonction pour obtenir les statistiques globales
  const getGlobalStats = () => {
    const totalCustomers = customers.length;
    const totalRevenue = customers.reduce((sum, customer) => sum + customer.total_spent, 0);
    const totalOrders = customers.reduce((sum, customer) => sum + customer.total_orders, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const tierCounts = customers.reduce((acc, customer) => {
      acc[customer.loyalty_tier] = (acc[customer.loyalty_tier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCustomers,
      totalRevenue,
      totalOrders,
      averageOrderValue,
      tierCounts
    };
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  return {
    customers: getFilteredCustomers(),
    allCustomers: customers,
    loading,
    error,
    filters,
    updateFilters,
    refreshCustomers: loadCustomers,
    globalStats: getGlobalStats()
  };
};
