'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Star,
  Truck,
  Bell,
  RefreshCw,
  Plus,
  BarChart3,
  UserPlus,
  PackagePlus
} from 'lucide-react';
import { supabase } from '../../lib/supabase/client';

// Types TypeScript pour la sécurité
interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrders: number;
  confirmedOrders: number;
  deliveredOrders: number;
  lowStockItems: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface LowStockProduct {
  id: number;
  name: string;
  stock_quantity: number;
  min_stock_level: number;
  urgency: 'critique' | 'élevé' | 'moyen';
}

// Composant moderne pour les cartes de statistiques
function ModernStatCard({ title, value, description, icon: Icon, gradient, textColor }: {
  title: string;
  value: string | number;
  description: string;
  icon: any;
  gradient: string;
  textColor: string;
}) {
  return (
    <div className={`${gradient} rounded-3xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Icon className="w-6 h-6" />
            <h3 className="text-sm font-medium opacity-90">{title}</h3>
          </div>
          <p className={`text-3xl font-bold ${textColor} mb-1`}>{value}</p>
          <p className="text-sm opacity-80">{description}</p>
        </div>
      </div>
    </div>
  );
}

// Composant moderne pour les commandes récentes
function ModernOrderCard({ order }: { order: Order }) {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending': return { 
        label: 'En attente', 
        color: 'bg-amber-100 text-amber-800 border-amber-200', 
        icon: <Clock className="w-4 h-4" /> 
      };
      case 'confirmed': return { 
        label: 'Confirmée', 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        icon: <CheckCircle className="w-4 h-4" /> 
      };
      case 'preparing': return { 
        label: 'En préparation', 
        color: 'bg-orange-100 text-orange-800 border-orange-200', 
        icon: <Package className="w-4 h-4" /> 
      };
      case 'delivered': return { 
        label: 'Livrée', 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: <Truck className="w-4 h-4" /> 
      };
      case 'cancelled': return { 
        label: 'Annulée', 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: <AlertTriangle className="w-4 h-4" /> 
      };
      default: return { 
        label: status, 
        color: 'bg-gray-100 text-gray-800 border-gray-200', 
        icon: <Clock className="w-4 h-4" /> 
      };
    }
  };

  const statusInfo = getStatusInfo(order.status);
  const orderDate = new Date(order.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold text-gray-900 text-lg">#{order.order_number}</span>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${statusInfo.color}`}>
          {statusInfo.icon}
          {statusInfo.label}
        </span>
      </div>
      <div className="space-y-2">
        <p className="text-gray-600 font-medium">{order.customer_name}</p>
        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold text-gray-900">{order.total_amount.toLocaleString('fr-FR')} XAF</p>
          <p className="text-sm text-gray-500">{orderDate}</p>
        </div>
      </div>
    </div>
  );
}

// Composant pour les produits en stock faible
function LowStockCard({ product }: { product: LowStockProduct }) {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critique': return 'bg-red-50 border-red-200 text-red-800';
      case 'élevé': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'moyen': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className={`rounded-2xl p-4 border-2 ${getUrgencyColor(product.urgency)}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold">{product.name}</h4>
        <span className="text-xs font-bold px-2 py-1 rounded-full bg-white/50">
          Niveau {product.urgency}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm">Stock: <strong>{product.stock_quantity}</strong></span>
        <span className="text-sm">Min: <strong>{product.min_stock_level}</strong></span>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    deliveredOrders: 0,
    lowStockItems: 0
  });

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);

  // Fonction pour charger les données depuis Supabase
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Requêtes parallèles pour optimiser les performances
      const [
        ordersResult,
        productsResult,
        customersResult,
        recentOrdersResult
      ] = await Promise.all([
        // Récupérer toutes les commandes avec calculs
        supabase.from('orders').select('*'),
        // Récupérer tous les produits
        supabase.from('products').select('*'),
        // Récupérer tous les clients
        supabase.from('customers').select('*'),
        // Récupérer les commandes récentes avec les noms des clients
        supabase
          .from('orders')
          .select(`
            id,
            order_number,
            total_amount,
            status,
            created_at,
            customers!inner(first_name, last_name)
          `)
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      if (ordersResult.error) throw ordersResult.error;
      if (productsResult.error) throw productsResult.error;
      if (customersResult.error) throw customersResult.error;
      if (recentOrdersResult.error) throw recentOrdersResult.error;

      const orders = ordersResult.data || [];
      const products = productsResult.data || [];
      const customers = customersResult.data || [];

      // Calculer les statistiques dynamiquement
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      const confirmedOrders = orders.filter(order => order.status === 'confirmed').length;
      const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
      
      // Identifier les produits en stock faible
      const lowStock = products
        .filter(product => product.stock_quantity <= product.min_stock_level)
        .map(product => {
          const ratio = product.stock_quantity / product.min_stock_level;
          let urgency: 'critique' | 'élevé' | 'moyen';
          
          if (ratio <= 0.2) urgency = 'critique';
          else if (ratio <= 0.5) urgency = 'élevé';
          else urgency = 'moyen';
          
          return {
            id: product.id,
            name: product.name,
            stock_quantity: product.stock_quantity,
            min_stock_level: product.min_stock_level,
            urgency
          };
        })
        .sort((a, b) => {
          const urgencyOrder = { critique: 0, élevé: 1, moyen: 2 };
          return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        });

      // Formater les commandes récentes
      const formattedRecentOrders: Order[] = recentOrdersResult.data?.map(order => ({
        id: order.id,
        order_number: order.order_number,
        customer_name: `${order.customers[0]?.first_name || ''} ${order.customers[0]?.last_name || ''}`.trim(),
        total_amount: order.total_amount,
        status: order.status,
        created_at: order.created_at
      })) || [];

      // Mettre à jour les états
      setStats({
        totalOrders: orders.length,
        totalRevenue,
        totalProducts: products.length,
        totalCustomers: customers.length,
        pendingOrders,
        confirmedOrders,
        deliveredOrders,
        lowStockItems: lowStock.length
      });

      setRecentOrders(formattedRecentOrders);
      setLowStockProducts(lowStock);

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setError('Impossible de charger les données du tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#f5a623]"></div>
          <h1 className="text-xl font-semibold mt-4 text-gray-700">Chargement du tableau de bord...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="bg-[#f5a623] text-white px-6 py-2 rounded-lg hover:bg-[#e6951f] transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Tableau de bord Akanda Apéro
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {new Date().toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <button 
              onClick={loadDashboardData}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-2xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <ModernStatCard
            title="Commandes totales"
            value={stats.totalOrders}
            description={stats.totalOrders === 0 ? "Aucune commande" : `${stats.pendingOrders} en attente`}
            icon={ShoppingCart}
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
            textColor="text-white"
          />
          <ModernStatCard
            title="Produits"
            value={stats.totalProducts}
            description={stats.totalProducts === 0 ? "Aucun produit" : `${stats.lowStockItems} stock faible`}
            icon={Package}
            gradient="bg-gradient-to-br from-green-500 to-green-600"
            textColor="text-white"
          />
          <ModernStatCard
            title="Clients"
            value={stats.totalCustomers}
            description={stats.totalCustomers === 0 ? "Aucun client" : "Clients actifs"}
            icon={Users}
            gradient="bg-gradient-to-br from-purple-500 to-purple-600"
            textColor="text-white"
          />
          <ModernStatCard
            title="Revenus"
            value={`${stats.totalRevenue.toLocaleString('fr-FR')} XAF`}
            description={stats.totalRevenue === 0 ? "Aucun revenu" : "Chiffre d'affaires total"}
            icon={TrendingUp}
            gradient="bg-gradient-to-br from-orange-500 to-orange-600"
            textColor="text-white"
          />
        </div>

        {(stats.pendingOrders > 0 || stats.lowStockItems > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {stats.pendingOrders > 0 && (
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="bg-amber-100 p-3 rounded-2xl mr-4">
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-amber-800">Commandes en attente</h3>
                    <p className="text-amber-700">{stats.pendingOrders} commandes nécessitent votre attention</p>
                  </div>
                </div>
              </div>
            )}

            {stats.lowStockItems > 0 && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="bg-red-100 p-3 rounded-2xl mr-4">
                    <Package className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-800">Stock faible</h3>
                    <p className="text-red-700">{stats.lowStockItems} produits ont un stock faible</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
                Commandes récentes
              </h2>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium bg-blue-50 px-3 py-1 rounded-full">
                Voir tout
              </button>
            </div>
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <ModernOrderCard key={order.id} order={order} />
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-100 rounded-full p-6 w-20 h-20 mx-auto mb-4">
                    <ShoppingCart className="w-8 h-8 text-gray-400 mx-auto" />
                  </div>
                  <p className="text-gray-500 font-medium">Aucune commande récente</p>
                  <p className="text-gray-400 text-sm mt-1">Les nouvelles commandes apparaîtront ici</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Package className="w-6 h-6 text-red-600" />
                Stock faible
              </h2>
              <button className="text-red-600 hover:text-red-800 text-sm font-medium bg-red-50 px-3 py-1 rounded-full">
                Voir tout
              </button>
            </div>
            <div className="space-y-4">
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map((product) => (
                  <LowStockCard key={product.id} product={product} />
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-100 rounded-full p-6 w-20 h-20 mx-auto mb-4">
                    <Package className="w-8 h-8 text-gray-400 mx-auto" />
                  </div>
                  <p className="text-gray-500 font-medium">Aucun produit en stock faible</p>
                  <p className="text-gray-400 text-sm mt-1">Tous vos produits ont un stock suffisant</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Star className="w-6 h-6 text-yellow-500" />
            Actions rapides
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-200 rounded-2xl p-6 text-center transition-all duration-300 group hover:shadow-lg">
              <div className="bg-blue-500 rounded-2xl p-3 w-fit mx-auto mb-3 group-hover:scale-110 transition-transform">
                <PackagePlus className="w-6 h-6 text-white" />
              </div>
              <p className="font-bold text-blue-900">Ajouter produit</p>
            </button>
            <button className="bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-2 border-green-200 rounded-2xl p-6 text-center transition-all duration-300 group hover:shadow-lg">
              <div className="bg-green-500 rounded-2xl p-3 w-fit mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <p className="font-bold text-green-900">Nouvelle commande</p>
            </button>
            <button className="bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-2 border-purple-200 rounded-2xl p-6 text-center transition-all duration-300 group hover:shadow-lg">
              <div className="bg-purple-500 rounded-2xl p-3 w-fit mx-auto mb-3 group-hover:scale-110 transition-transform">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <p className="font-bold text-purple-900">Ajouter client</p>
            </button>
            <button className="bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border-2 border-orange-200 rounded-2xl p-6 text-center transition-all duration-300 group hover:shadow-lg">
              <div className="bg-orange-500 rounded-2xl p-3 w-fit mx-auto mb-3 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <p className="font-bold text-orange-900">Voir analytics</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
