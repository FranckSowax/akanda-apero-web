'use client';

import { supabase } from '../lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

// Types pour les réponses de Supabase
type OrderItem = {
  product_id: string;
  quantity: number;
  products?: {
    name: string;
  };
};

type OrderProfile = {
  first_name?: string;
  last_name?: string;
};

type OrderData = {
  id: string;
  total: number;
  created_at: string;
  status?: string;
  user_id?: string;
  order_items?: OrderItem[];
  profiles?: OrderProfile;
};

export interface DashboardStats {
  ordersToday: number;
  revenueToday: number;
  newCustomersToday: number;
  activeDeliveries: number;
  dailySalesData: { day: string; orders: number; revenue: number }[];
  recentOrders: RecentOrder[];
}

export interface RecentOrder {
  id: string;
  status: string;
  items: string;
  client: string;
  time: string;
  amount: number;
  productIds: string[];
}

/**
 * Service pour récupérer et gérer les statistiques du tableau de bord
 */
export const DashboardService = {
  /**
   * Récupère toutes les statistiques pour le tableau de bord
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISOString = today.toISOString();
      
      // Récupérer les commandes d'aujourd'hui
      const { data: todayOrders, error: ordersError } = await supabase
        .from('orders')
        .select('id, total, created_at, status')
        .gte('created_at', todayISOString);
      
      if (ordersError) {
        // Log plus discret pour éviter d'afficher des erreurs quand c'est normal qu'il n'y ait pas de données
        console.log('Aucune commande pour aujourd\'hui');
      }
      
      // Calculer le revenu total d'aujourd'hui
      const revenueToday = todayOrders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
      
      // Récupérer les nouveaux clients d'aujourd'hui
      const { data: newUsers, error: usersError } = await supabase
        .from('profiles')
        .select('id')
        .gte('created_at', todayISOString);
      
      if (usersError) {
        console.error('Erreur lors de la récupération des nouveaux utilisateurs:', usersError);
      }
      
      // Récupérer les livraisons en cours
      const { data: activeDeliveries, error: deliveriesError } = await supabase
        .from('orders')
        .select('id')
        .eq('status', 'En cours');
      
      if (deliveriesError) {
        console.error('Erreur lors de la récupération des livraisons actives:', deliveriesError);
      }
      
      // Récupérer les commandes récentes
      const { data: recentOrdersData, error: recentOrdersError } = await supabase
        .from('orders')
        .select(`
          id, 
          total, 
          created_at, 
          status, 
          user_id,
          order_items:order_items(
            product_id,
            quantity,
            products:products(
              name
            )
          ),
          profiles:profiles(
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(4) as { data: OrderData[] | null, error: any };
      
      if (recentOrdersError) {
        // Log plus discret pour éviter d'afficher des erreurs quand c'est normal qu'il n'y ait pas de données
        console.log('Aucune commande récente disponible');
      }
      
      // Formater les commandes récentes
      const recentOrders = recentOrdersData?.map(order => {
        // Obtenir le nom du premier produit de la commande
        const firstProductName = order.order_items && order.order_items[0] && 
          order.order_items[0].products ? order.order_items[0].products.name : 'Produit inconnu';
        
        // Générer une liste des produits pour la commande
        const productIds = order.order_items ? 
          order.order_items.map(item => item.product_id as string) : [];
        
        // Construire le nom complet du client
        const firstName = order.profiles ? order.profiles.first_name : 'Client';
        const lastName = order.profiles ? order.profiles.last_name : 'Inconnu';
        const clientName = `${firstName} ${lastName}`;
        
        // Formater la distance de temps (il y a X minutes, heures, etc.)
        const timeDistance = formatDistanceToNow(new Date(order.created_at), {
          addSuffix: true,
          locale: fr
        });
        
        return {
          id: order.id.substring(0, 5), // Prendre juste les 5 premiers caractères
          status: order.status || 'En attente',
          items: firstProductName,
          client: clientName,
          time: timeDistance,
          amount: order.total || 0,
          productIds
        };
      }) || [];
      
      // Récupérer les données des 7 derniers jours pour le graphique
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      
      const { data: weekOrders, error: weekOrdersError } = await supabase
        .from('orders')
        .select('id, total, created_at')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true });
      
      if (weekOrdersError) {
        // Log plus discret pour éviter d'afficher des erreurs quand c'est normal qu'il n'y ait pas de données
        console.log('Aucune commande pour la semaine');
      }
      
      // Organiser les données par jour
      type DailySalesItem = { day: string; date: Date; orders: number; revenue: number };
      const dailySalesData: DailySalesItem[] = [];
      const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
      
      // Initialiser un tableau pour les 7 derniers jours
      for (let i = 0; i < 7; i++) {
        const day = new Date();
        day.setDate(day.getDate() - (6 - i));
        const dayOfWeek = dayNames[day.getDay() === 0 ? 6 : day.getDay() - 1]; // Convertir de 0-6 (Dim-Sam) à 1-7 (Lun-Dim)
        
        dailySalesData.push({
          day: dayOfWeek,
          date: new Date(day),
          orders: 0,
          revenue: 0
        });
      }
      
      // Remplir les données pour chaque jour
      weekOrders?.forEach(order => {
        const orderDate = new Date(order.created_at);
        orderDate.setHours(0, 0, 0, 0);
        
        const dayIndex = dailySalesData.findIndex(d => 
          d.date.getDate() === orderDate.getDate() && 
          d.date.getMonth() === orderDate.getMonth() && 
          d.date.getFullYear() === orderDate.getFullYear()
        );
        
        if (dayIndex !== -1) {
          dailySalesData[dayIndex].orders += 1;
          dailySalesData[dayIndex].revenue += order.total || 0;
        }
      });
      
      // Simplifier les données pour l'affichage
      const simplifiedDailySalesData = dailySalesData.map(d => ({
        day: d.day,
        orders: d.orders,
        revenue: d.revenue
      }));
      
      return {
        ordersToday: todayOrders?.length || 0,
        revenueToday,
        newCustomersToday: newUsers?.length || 0,
        activeDeliveries: activeDeliveries?.length || 0,
        dailySalesData: simplifiedDailySalesData,
        recentOrders
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques du tableau de bord:', error);
      // Renvoyer des données par défaut en cas d'erreur
      return {
        ordersToday: 0,
        revenueToday: 0,
        newCustomersToday: 0,
        activeDeliveries: 0,
        dailySalesData: [],
        recentOrders: []
      };
    }
  },
  
  /**
   * S'abonne aux mises à jour des commandes pour actualiser le tableau de bord
   */
  subscribeToOrderUpdates(callback: () => void) {
    const subscription = supabase
      .channel('order-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        callback
      )
      .subscribe();
    
    return subscription;
  }
};

export default DashboardService;
