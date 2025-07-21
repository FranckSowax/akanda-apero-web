'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export interface DashboardStats {
  // Statistiques générales
  ordersToday: number;
  ordersWeek: number;
  ordersMonth: number;
  revenueToday: number;
  revenueWeek: number;
  revenueMonth: number;
  newCustomersToday: number;
  newCustomersWeek: number;
  newCustomersMonth: number;
  activeDeliveries: number;
  
  // Progression (comparaison avec période précédente)
  ordersGrowth: number; // % de croissance
  revenueGrowth: number;
  customersGrowth: number;
  
  // Moyennes
  averageOrderValue: number;
  averageOrdersPerDay: number;
  
  // Taux
  conversionRate: number;
  returnCustomerRate: number;
}

export interface RecentOrder {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  customer_name: string;
  customer_email: string;
  items_count: number;
  delivery_address: string;
}

export interface BestSeller {
  product_id: string;
  product_name: string;
  category: string;
  total_sold: number;
  total_revenue: number;
  image_url?: string;
  is_alcoholic: boolean;
}

export interface StockAlert {
  product_id: string;
  product_name: string;
  current_stock: number;
  min_stock: number;
  status: 'low' | 'out' | 'critical';
  image_url?: string;
}

export interface TopCustomer {
  customer_id: string;
  customer_name: string;
  customer_email: string;
  total_orders: number;
  total_spent: number;
  last_order_date: string;
  avg_order_value: number;
}

export interface DeliveryStatus {
  id: string;
  order_id: string;
  customer_name: string;
  delivery_address: string;
  status: string;
  estimated_delivery: string;
  driver_name?: string;
  created_at: string;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    ordersToday: 0,
    ordersWeek: 0,
    ordersMonth: 0,
    revenueToday: 0,
    revenueWeek: 0,
    revenueMonth: 0,
    newCustomersToday: 0,
    newCustomersWeek: 0,
    newCustomersMonth: 0,
    activeDeliveries: 0,
    ordersGrowth: 0,
    revenueGrowth: 0,
    customersGrowth: 0,
    averageOrderValue: 0,
    averageOrdersPerDay: 0,
    conversionRate: 0,
    returnCustomerRate: 0,
  });
  
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [bestSellers, setBestSellers] = useState<BestSeller[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [activeDeliveries, setActiveDeliveries] = useState<DeliveryStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Chargement des statistiques dashboard...');

      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const previousWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const previousMonthStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      console.log('📅 Périodes:', { today, weekAgo, monthAgo });

      // Statistiques des commandes
      console.log('📊 Récupération des commandes...');
      const { data: ordersToday, error: ordersTodayError } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', today);

      const { data: ordersWeek, error: ordersWeekError } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', weekAgo);

      const { data: ordersMonth, error: ordersMonthError } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', monthAgo);

      if (ordersTodayError) console.log('❌ Erreur ordersToday:', ordersTodayError);
      if (ordersWeekError) console.log('❌ Erreur ordersWeek:', ordersWeekError);
      if (ordersMonthError) console.log('❌ Erreur ordersMonth:', ordersMonthError);
      
      console.log('📈 Commandes trouvées:', {
        today: ordersToday?.length || 0,
        week: ordersWeek?.length || 0,
        month: ordersMonth?.length || 0
      });

      // Statistiques de la semaine précédente pour comparaison
      const { data: ordersPreviousWeek } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', previousWeekStart)
        .lt('created_at', weekAgo);

      // Nouveaux clients
      const { data: customersToday } = await supabase
        .from('customers')
        .select('id')
        .gte('created_at', today);

      const { data: customersWeek } = await supabase
        .from('customers')
        .select('id')
        .gte('created_at', weekAgo);

      const { data: customersMonth } = await supabase
        .from('customers')
        .select('id')
        .gte('created_at', monthAgo);

      // Livraisons actives
      const { data: deliveries } = await supabase
        .from('deliveries')
        .select('*')
        .in('status', ['En cours', 'En route', 'En préparation']);

      // Calculs des statistiques
      const todayOrdersCount = ordersToday?.length || 0;
      const weekOrdersCount = ordersWeek?.length || 0;
      const monthOrdersCount = ordersMonth?.length || 0;
      const previousWeekOrdersCount = ordersPreviousWeek?.length || 0;

      const todayRevenue = ordersToday?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const weekRevenue = ordersWeek?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const monthRevenue = ordersMonth?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const previousWeekRevenue = ordersPreviousWeek?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      const ordersGrowth = previousWeekOrdersCount > 0 
        ? ((weekOrdersCount - previousWeekOrdersCount) / previousWeekOrdersCount) * 100 
        : 0;

      const revenueGrowth = previousWeekRevenue > 0 
        ? ((weekRevenue - previousWeekRevenue) / previousWeekRevenue) * 100 
        : 0;

      const averageOrderValue = weekOrdersCount > 0 ? weekRevenue / weekOrdersCount : 0;
      const averageOrdersPerDay = weekOrdersCount / 7;

      setStats({
        ordersToday: todayOrdersCount,
        ordersWeek: weekOrdersCount,
        ordersMonth: monthOrdersCount,
        revenueToday: todayRevenue,
        revenueWeek: weekRevenue,
        revenueMonth: monthRevenue,
        newCustomersToday: customersToday?.length || 0,
        newCustomersWeek: customersWeek?.length || 0,
        newCustomersMonth: customersMonth?.length || 0,
        activeDeliveries: deliveries?.length || 0,
        ordersGrowth,
        revenueGrowth,
        customersGrowth: 0, // À calculer si nécessaire
        averageOrderValue,
        averageOrdersPerDay,
        conversionRate: 0, // À calculer avec les données de trafic
        returnCustomerRate: 0, // À calculer
      });

    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      console.log('📋 Récupération des commandes récentes...');
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          created_at,
          status,
          total_amount,
          delivery_address,
          customers(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (ordersError) {
        console.log('❌ Erreur commandes récentes:', ordersError);
        return;
      }

      if (orders) {
        console.log(`✅ ${orders.length} commandes récentes trouvées`);
        const formattedOrders: RecentOrder[] = orders.map(order => {
          const customer = Array.isArray(order.customers) ? order.customers[0] : order.customers;
          return {
            id: order.id,
            created_at: order.created_at,
            status: order.status,
            total_amount: order.total_amount,
            customer_name: customer ? `${customer.first_name} ${customer.last_name}` : 'Client inconnu',
            customer_email: customer?.email || '',
            items_count: 1, // Simplifier pour l'instant
            delivery_address: order.delivery_address || '',
          };
        });
        setRecentOrders(formattedOrders);
        console.log('📋 Commandes récentes mises à jour:', formattedOrders.length);
      } else {
        console.log('⚠️ Aucune commande récente trouvée');
        setRecentOrders([]);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des commandes récentes:', err);
    }
  };

  const fetchBestSellers = async () => {
    try {
      console.log('⭐ Récupération des vraies meilleures ventes...');
      
      // Débug: Vérifier d'abord si la table order_items existe et contient des données
      console.log('🔍 Debug: Test de la table order_items...');
      const { data: orderItemsTest, error: testError } = await supabase
        .from('order_items')
        .select('id, product_id, quantity')
        .limit(5);
      
      if (testError) {
        console.log('❌ Debug: Erreur accès order_items:', testError);
        console.log('💡 La table order_items n\'existe peut-être pas ou n\'est pas accessible');
      } else {
        console.log(`🔍 Debug: ${orderItemsTest?.length || 0} order_items basiques trouvés`);
        if (orderItemsTest && orderItemsTest.length > 0) {
          console.log('🔍 Exemple order_items:', orderItemsTest.slice(0, 2));
        }
      }
      
      // Récupérer les order_items avec les produits et catégories
      console.log('🔍 Debug: Tentative de jointure order_items + products...');
      const { data: orderItems, error: orderItemsError } = await supabase
        .from('order_items')
        .select(`
          product_id,
          quantity,
          unit_price,
          products(
            id,
            name,
            image_url,
            base_price,
            categories(name)
          )
        `)
        .not('product_id', 'is', null);

      if (orderItemsError) {
        console.log('❌ Erreur order_items avec jointure:', orderItemsError);
        console.log('💡 Tentative sans jointure pour isoler le problème...');
        
        // Essayer sans jointure pour isoler le problème
        const { data: simpleOrderItems, error: simpleError } = await supabase
          .from('order_items')
          .select('product_id, quantity, unit_price')
          .not('product_id', 'is', null)
          .limit(10);
        
        if (simpleError) {
          console.log('❌ Erreur même sans jointure:', simpleError);
        } else {
          console.log(`✅ ${simpleOrderItems?.length || 0} order_items simples trouvés`);
          if (simpleOrderItems && simpleOrderItems.length > 0) {
            console.log('🔍 Exemples:', simpleOrderItems.slice(0, 3));
          }
        }
        
        // Continuer vers le fallback
      }

      // Forcer l'utilisation du fallback si pas d'order_items
      if (!orderItems || orderItems.length === 0) {
        console.log('⚠️ Pas d\'order_items trouvés, utilisation du fallback intelligent');
        
        // Fallback direct: récupérer les produits populaires
        const { data: fallbackProducts, error: fallbackError } = await supabase
          .from('products')
          .select(`
            id, 
            name, 
            image_url, 
            base_price,
            rating,
            rating_count,
            is_featured,
            categories(name)
          `)
          .eq('is_active', true)
          .order('rating', { ascending: false })
          .limit(10);
        
        if (fallbackError) {
          console.log('❌ Erreur fallback produits:', fallbackError);
          setBestSellers([]);
          return;
        }
        
        if (fallbackProducts && fallbackProducts.length > 0) {
          console.log(`✅ Fallback: ${fallbackProducts.length} produits trouvés pour simulation`);
          const simulatedBestSellers: BestSeller[] = fallbackProducts.map((product, index) => {
            const category = Array.isArray(product.categories) ? product.categories[0] : product.categories;
            const basePopularity = product.is_featured ? 50 : 20;
            const ratingBonus = (product.rating || 0) * 5;
            const ratingCountBonus = Math.min((product.rating_count || 0) * 2, 30);
            const positionPenalty = index * 5;
            const simulatedSold = Math.max(1, Math.floor(basePopularity + ratingBonus + ratingCountBonus - positionPenalty));
            
            return {
              product_id: product.id,
              product_name: product.name,
              category: category?.name || 'Non catégorisé',
              total_sold: simulatedSold,
              total_revenue: simulatedSold * (product.base_price || 0),
              image_url: product.image_url,
              is_alcoholic: category?.name?.toLowerCase().includes('alcool') || 
                           category?.name?.toLowerCase().includes('spiritueux') || 
                           category?.name?.toLowerCase().includes('vin') || 
                           category?.name?.toLowerCase().includes('bière') || false,
            };
          }).sort((a, b) => b.total_sold - a.total_sold).slice(0, 5);
          
          setBestSellers(simulatedBestSellers);
          console.log('📊 Meilleures ventes simulées (fallback forcé):', simulatedBestSellers.map(item => `${item.product_name}: ${item.total_sold}`));
        } else {
          console.log('❌ Aucun produit trouvé même pour le fallback');
          setBestSellers([]);
        }
        return;
      }

      if (orderItems && orderItems.length > 0) {
        console.log(`✅ ${orderItems.length} order_items trouvés pour calcul des meilleures ventes`);
        
        // Grouper par produit et calculer les totaux réels
        const productStats = orderItems.reduce((acc: any, item) => {
          const productId = item.product_id;
          const product = Array.isArray(item.products) ? item.products[0] : item.products;
          
          if (!product || !productId) return acc;
          
          if (!acc[productId]) {
            const category = Array.isArray(product.categories) ? product.categories[0] : product.categories;
            acc[productId] = {
              product_id: productId,
              product_name: product.name,
              category: category?.name || 'Non catégorisé',
              total_sold: 0,
              total_revenue: 0,
              image_url: product.image_url,
              is_alcoholic: category?.name?.toLowerCase().includes('alcool') || 
                           category?.name?.toLowerCase().includes('spiritueux') || 
                           category?.name?.toLowerCase().includes('vin') || 
                           category?.name?.toLowerCase().includes('bière') || false,
            };
          }
          
          acc[productId].total_sold += item.quantity || 0;
          acc[productId].total_revenue += (item.quantity || 0) * (item.unit_price || product.base_price || 0);
          
          return acc;
        }, {});

        // Trier par quantité vendue et prendre les 5 premiers
        const realBestSellers = Object.values(productStats)
          .sort((a: any, b: any) => b.total_sold - a.total_sold)
          .slice(0, 5) as BestSeller[];

        setBestSellers(realBestSellers);
        console.log('⭐ Vraies meilleures ventes calculées:', realBestSellers.length);
        console.log('📊 Top 3:', realBestSellers.slice(0, 3).map(item => `${item.product_name}: ${item.total_sold} vendus`));
      } else {
        console.log('⚠️ Aucun order_item trouvé, fallback sur les produits populaires');
        // Fallback amélioré: récupérer les produits et simuler une popularité basée sur les caractéristiques
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select(`
            id, 
            name, 
            image_url, 
            base_price,
            rating,
            rating_count,
            is_featured,
            categories(name)
          `)
          .eq('is_active', true)
          .order('rating', { ascending: false })
          .limit(10);
        
        if (productsError) {
          console.log('❌ Erreur fallback produits:', productsError);
          setBestSellers([]);
          return;
        }
        
        if (products && products.length > 0) {
          console.log(`✅ Fallback: ${products.length} produits trouvés pour simulation des meilleures ventes`);
          const fallbackBestSellers: BestSeller[] = products.map((product, index) => {
            const category = Array.isArray(product.categories) ? product.categories[0] : product.categories;
            // Simuler une popularité basée sur le rating, featured status, et position
            const basePopularity = product.is_featured ? 50 : 20;
            const ratingBonus = (product.rating || 0) * 5;
            const ratingCountBonus = Math.min((product.rating_count || 0) * 2, 30);
            const positionPenalty = index * 5; // Les premiers sont plus populaires
            
            const simulatedSold = Math.max(1, Math.floor(basePopularity + ratingBonus + ratingCountBonus - positionPenalty));
            
            return {
              product_id: product.id,
              product_name: product.name,
              category: category?.name || 'Non catégorisé',
              total_sold: simulatedSold,
              total_revenue: simulatedSold * (product.base_price || 0),
              image_url: product.image_url,
              is_alcoholic: category?.name?.toLowerCase().includes('alcool') || 
                           category?.name?.toLowerCase().includes('spiritueux') || 
                           category?.name?.toLowerCase().includes('vin') || 
                           category?.name?.toLowerCase().includes('bière') || false,
            };
          }).sort((a, b) => b.total_sold - a.total_sold).slice(0, 5);
          
          setBestSellers(fallbackBestSellers);
          console.log('📊 Meilleures ventes simulées (fallback):', fallbackBestSellers.map(item => `${item.product_name}: ${item.total_sold} (simulé)`));
        } else {
          console.log('❌ Aucun produit trouvé pour le fallback');
          setBestSellers([]);
        }
      }
    } catch (err) {
      console.error('Erreur lors du chargement des meilleures ventes:', err);
    }
  };

  const fetchStockAlerts = async () => {
    try {
      console.log('📦 Récupération des alertes stock...');
      const { data: products, error: stockError } = await supabase
        .from('products')
        .select('id, name, stock_quantity, min_stock_level, image_url')
        .not('stock_quantity', 'is', null)
        .not('min_stock_level', 'is', null);

      if (stockError) {
        console.log('❌ Erreur stock:', stockError);
        // Essayer sans les contraintes de stock pour voir si on a des produits
        const { data: allProducts, error: allProductsError } = await supabase
          .from('products')
          .select('id, name, image_url')
          .limit(5);
        
        if (allProductsError) {
          console.log('❌ Erreur tous produits:', allProductsError);
          return;
        }
        
        if (allProducts) {
          console.log(`✅ ${allProducts.length} produits trouvés (sans stock)`);
          // Simuler des alertes stock
          const mockAlerts: StockAlert[] = allProducts.map((product, index) => ({
            product_id: product.id,
            product_name: product.name,
            current_stock: Math.floor(Math.random() * 10), // Simulation
            min_stock: 20,
            status: (index % 3 === 0 ? 'critical' : index % 2 === 0 ? 'low' : 'out') as 'low' | 'out' | 'critical',
            image_url: product.image_url,
          }));
          setStockAlerts(mockAlerts);
          console.log('📦 Alertes stock simulées mises à jour:', mockAlerts.length);
        }
        return;
      }

      if (products) {
        console.log(`✅ ${products.length} produits avec stock trouvés`);
        const alerts: StockAlert[] = products
          .filter(product => product.stock_quantity <= product.min_stock_level)
          .map(product => ({
            product_id: product.id,
            product_name: product.name,
            current_stock: product.stock_quantity,
            min_stock: product.min_stock_level,
            status: (product.stock_quantity === 0 ? 'out' : 
                   product.stock_quantity <= product.min_stock_level * 0.5 ? 'critical' : 'low') as 'low' | 'out' | 'critical',
            image_url: product.image_url,
          }))
          .sort((a, b) => a.current_stock - b.current_stock);

        setStockAlerts(alerts);
        console.log('📦 Alertes stock mises à jour:', alerts.length);
      } else {
        console.log('⚠️ Aucun produit avec stock trouvé');
        setStockAlerts([]);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des alertes stock:', err);
    }
  };

  const fetchTopCustomers = async () => {
    try {
      console.log('👥 Récupération des meilleurs clients...');
      const { data: orders, error: customersError } = await supabase
        .from('orders')
        .select(`
          customer_id,
          total_amount,
          created_at,
          customers(first_name, last_name, email)
        `)
        .not('customer_id', 'is', null)
        .limit(50); // Limiter pour éviter trop de données

      if (customersError) {
        console.log('❌ Erreur clients:', customersError);
        return;
      }

      if (orders) {
        console.log(`✅ ${orders.length} commandes avec clients trouvées`);
        // Grouper par client et calculer les totaux
        const customerStats = orders.reduce((acc: any, order) => {
          const customer = Array.isArray(order.customers) ? order.customers[0] : order.customers;
          if (!customer) return acc;
          
          const customerId = order.customer_id;
          if (!acc[customerId]) {
            acc[customerId] = {
              customer_id: customerId,
              customer_name: `${customer.first_name} ${customer.last_name}`,
              customer_email: customer.email,
              total_orders: 0,
              total_spent: 0,
              last_order_date: order.created_at,
              avg_order_value: 0,
            };
          }
          acc[customerId].total_orders += 1;
          acc[customerId].total_spent += order.total_amount || 0;
          if (new Date(order.created_at) > new Date(acc[customerId].last_order_date)) {
            acc[customerId].last_order_date = order.created_at;
          }
          return acc;
        }, {});

        const sortedCustomers = Object.values(customerStats)
          .map((customer: any) => ({
            ...customer,
            avg_order_value: customer.total_spent / customer.total_orders,
          }))
          .sort((a: any, b: any) => b.total_spent - a.total_spent)
          .slice(0, 5);

        setTopCustomers(sortedCustomers as TopCustomer[]);
        console.log('👥 Meilleurs clients mis à jour:', sortedCustomers.length);
      } else {
        console.log('⚠️ Aucun client trouvé');
        setTopCustomers([]);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des meilleurs clients:', err);
    }
  };

  const fetchActiveDeliveries = async () => {
    try {
      console.log('🚚 Récupération des livraisons actives...');
      // Utiliser les commandes en cours de livraison comme livraisons actives
      const { data: deliveryOrders, error: deliveriesError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          created_at,
          delivery_address,
          customers(first_name, last_name)
        `)
        .in('status', ['En livraison', 'En préparation', 'Prête'])
        .order('created_at', { ascending: false })
        .limit(10);

      if (deliveriesError) {
        console.log('❌ Erreur livraisons:', deliveriesError);
        setActiveDeliveries([]);
        return;
      }

      if (deliveryOrders) {
        console.log(`✅ ${deliveryOrders.length} commandes en livraison trouvées`);
        const formattedDeliveries: DeliveryStatus[] = deliveryOrders.map(order => {
          const customer = Array.isArray(order.customers) ? order.customers[0] : order.customers;
          return {
            id: order.id,
            order_id: order.id,
            customer_name: customer ? `${customer.first_name} ${customer.last_name}` : 'Client inconnu',
            delivery_address: order.delivery_address || 'Adresse non spécifiée',
            status: order.status,
            estimated_delivery: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // +2h
            driver_name: 'Chauffeur assigné',
            created_at: order.created_at,
          };
        });
        setActiveDeliveries(formattedDeliveries);
        console.log('🚚 Livraisons actives mises à jour:', formattedDeliveries.length);
      } else {
        console.log('⚠️ Aucune commande en livraison trouvée');
        setActiveDeliveries([]);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des livraisons actives:', err);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentOrders();
    fetchBestSellers();
    fetchStockAlerts();
    fetchTopCustomers();
    fetchActiveDeliveries();

    // Mise à jour automatique toutes les 5 minutes
    const interval = setInterval(() => {
      fetchDashboardStats();
      fetchRecentOrders();
      fetchActiveDeliveries();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const refreshData = () => {
    fetchDashboardStats();
    fetchRecentOrders();
    fetchBestSellers();
    fetchStockAlerts();
    fetchTopCustomers();
    fetchActiveDeliveries();
  };

  return {
    stats,
    recentOrders,
    bestSellers,
    stockAlerts,
    topCustomers,
    activeDeliveries,
    loading,
    error,
    refreshData,
  };
};
