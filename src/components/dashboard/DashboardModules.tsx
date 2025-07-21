'use client';

import React from 'react';
import { 
  ShoppingCart, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package, 
  Truck, 
  AlertTriangle,
  Clock,
  Euro,
  BarChart3,
  Eye,
  Star,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';
import { 
  DashboardStats, 
  RecentOrder, 
  BestSeller, 
  StockAlert, 
  TopCustomer, 
  DeliveryStatus 
} from '../../hooks/dashboard/useDashboardStats';

// Composant pour les cartes de statistiques principales
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  growth?: number;
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  color, 
  growth, 
  subtitle 
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className={`${color} rounded-lg p-3`}>
          {icon}
        </div>
        <div>
          <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
      </div>
      {growth !== undefined && (
        <div className={`flex items-center space-x-1 ${
          growth >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {growth >= 0 ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          <span className="text-sm font-semibold">
            {Math.abs(growth).toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  </div>
);

// Module des commandes récentes
interface RecentOrdersModuleProps {
  orders: RecentOrder[];
  loading: boolean;
}

export const RecentOrdersModule: React.FC<RecentOrdersModuleProps> = ({ 
  orders, 
  loading 
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-bold text-gray-900">Commandes récentes</h2>
      <Link href="/admin/orders">
        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
          <Eye className="h-4 w-4 mr-2" />
          Voir tout
        </Button>
      </Link>
    </div>
    
    <div className="space-y-4">
      {loading ? (
        Array(5).fill(null).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        ))
      ) : orders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Aucune commande récente</p>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-semibold text-gray-900">#{order.id.slice(-6)}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  order.status === 'Livrée' ? 'bg-green-100 text-green-800' :
                  order.status === 'En livraison' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'En préparation' ? 'bg-orange-100 text-orange-800' :
                  order.status === 'Prête' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'Nouvelle' ? 'bg-fuchsia-100 text-fuchsia-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 truncate">{order.customer_name}</p>
              <p className="text-xs text-gray-400">
                {new Date(order.created_at).toLocaleDateString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">
                {order.total_amount.toLocaleString()} XAF
              </p>
              <p className="text-xs text-gray-500">{order.items_count} article(s)</p>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

// Module des meilleures ventes
interface BestSellersModuleProps {
  bestSellers: BestSeller[];
  loading: boolean;
}

export const BestSellersModule: React.FC<BestSellersModuleProps> = ({ 
  bestSellers, 
  loading 
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-bold text-gray-900">Meilleures ventes</h2>
      <div className="flex items-center space-x-2">
        <span className="text-xs text-gray-500">Produits alcoolisés</span>
        <div className="h-2 w-2 bg-amber-400 rounded-full"></div>
      </div>
    </div>
    
    <div className="space-y-4">
      {loading ? (
        Array(5).fill(null).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="text-right">
                <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          </div>
        ))
      ) : bestSellers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Aucune donnée de vente</p>
        </div>
      ) : (
        bestSellers.slice(0, 5).map((product, index) => (
          <div key={product.product_id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="relative">
              <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.product_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Package className="h-6 w-6 text-gray-400" />
                )}
              </div>
              <div className="absolute -top-1 -left-1 h-5 w-5 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">{index + 1}</span>
              </div>
              {product.is_alcoholic && (
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-amber-400 rounded-full"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {product.product_name}
              </p>
              <p className="text-xs text-gray-500">{product.category}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">{product.total_sold}</p>
              <p className="text-xs text-gray-500">vendus</p>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

// Module des alertes stock
interface StockAlertsModuleProps {
  stockAlerts: StockAlert[];
  loading: boolean;
}

export const StockAlertsModule: React.FC<StockAlertsModuleProps> = ({ 
  stockAlerts, 
  loading 
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-bold text-gray-900">Alertes stock</h2>
      <Link href="/admin/products">
        <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">
          <Package className="h-4 w-4 mr-2" />
          Gérer
        </Button>
      </Link>
    </div>
    
    <div className="space-y-4">
      {loading ? (
        Array(3).fill(null).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        ))
      ) : stockAlerts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Stock sous contrôle</p>
          <p className="text-xs mt-1">Aucune alerte</p>
        </div>
      ) : (
        stockAlerts.slice(0, 5).map((alert) => (
          <div key={alert.product_id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="relative">
              <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {alert.image_url ? (
                  <img 
                    src={alert.image_url} 
                    alt={alert.product_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Package className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <div className={`absolute -top-1 -right-1 h-4 w-4 rounded-full ${
                alert.status === 'out' ? 'bg-red-500' :
                alert.status === 'critical' ? 'bg-orange-500' :
                'bg-yellow-500'
              }`}>
                <AlertTriangle className="h-3 w-3 text-white m-0.5" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {alert.product_name}
              </p>
              <p className="text-xs text-gray-500">
                Stock: {alert.current_stock} / {alert.min_stock} min
              </p>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              alert.status === 'out' ? 'bg-red-100 text-red-800' :
              alert.status === 'critical' ? 'bg-orange-100 text-orange-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {alert.status === 'out' ? 'Rupture' :
               alert.status === 'critical' ? 'Critique' :
               'Faible'}
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

// Module des livraisons en cours
interface ActiveDeliveriesModuleProps {
  deliveries: DeliveryStatus[];
  loading: boolean;
}

export const ActiveDeliveriesModule: React.FC<ActiveDeliveriesModuleProps> = ({ 
  deliveries, 
  loading 
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-bold text-gray-900">Livraisons en cours</h2>
      <Link href="/admin/deliveries">
        <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
          <Truck className="h-4 w-4 mr-2" />
          Suivre
        </Button>
      </Link>
    </div>
    
    <div className="space-y-4">
      {loading ? (
        Array(3).fill(null).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))
      ) : deliveries.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Truck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Aucune livraison en cours</p>
        </div>
      ) : (
        deliveries.slice(0, 5).map((delivery) => (
          <div key={delivery.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Truck className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {delivery.customer_name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {delivery.delivery_address}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <Clock className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-400">
                  {delivery.estimated_delivery ? 
                    new Date(delivery.estimated_delivery).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 
                    'Non estimé'
                  }
                </span>
              </div>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              delivery.status === 'En route' ? 'bg-blue-100 text-blue-800' :
              delivery.status === 'En préparation' ? 'bg-orange-100 text-orange-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {delivery.status}
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

// Module des meilleurs clients
interface TopCustomersModuleProps {
  customers: TopCustomer[];
  loading: boolean;
}

export const TopCustomersModule: React.FC<TopCustomersModuleProps> = ({ 
  customers, 
  loading 
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-bold text-gray-900">Meilleurs clients</h2>
      <Link href="/admin/customers">
        <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
          <Users className="h-4 w-4 mr-2" />
          Voir tout
        </Button>
      </Link>
    </div>
    
    <div className="space-y-4">
      {loading ? (
        Array(5).fill(null).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="text-right">
                <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          </div>
        ))
      ) : customers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Aucun client enregistré</p>
        </div>
      ) : (
        customers.slice(0, 5).map((customer, index) => (
          <div key={customer.customer_id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="relative">
              <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              {index < 3 && (
                <div className={`absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center ${
                  index === 0 ? 'bg-yellow-400' :
                  index === 1 ? 'bg-gray-400' :
                  'bg-amber-600'
                }`}>
                  <Star className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {customer.customer_name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {customer.total_orders} commande(s)
              </p>
              <p className="text-xs text-gray-400">
                Dernière: {new Date(customer.last_order_date).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">
                {customer.total_spent.toLocaleString()} XAF
              </p>
              <p className="text-xs text-gray-500">
                {customer.avg_order_value.toLocaleString()} XAF/cmd
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

// Module de rapport rapide
interface QuickReportModuleProps {
  stats: DashboardStats;
  loading: boolean;
  onRefresh: () => void;
}

export const QuickReportModule: React.FC<QuickReportModuleProps> = ({ 
  stats, 
  loading, 
  onRefresh 
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-bold text-gray-900">Rapport rapide</h2>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onRefresh}
        disabled={loading}
        className="text-gray-600 hover:text-gray-700"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
        Actualiser
      </Button>
    </div>
    
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center p-4 bg-blue-50 rounded-lg">
        <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
        <p className="text-2xl font-bold text-blue-900">
          {stats.averageOrderValue.toLocaleString()}
        </p>
        <p className="text-sm text-blue-600">Panier moyen (XAF)</p>
      </div>
      
      <div className="text-center p-4 bg-green-50 rounded-lg">
        <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
        <p className="text-2xl font-bold text-green-900">
          {stats.averageOrdersPerDay.toFixed(1)}
        </p>
        <p className="text-sm text-green-600">Commandes/jour</p>
      </div>
      
      <div className="text-center p-4 bg-purple-50 rounded-lg">
        <Euro className="h-8 w-8 text-purple-600 mx-auto mb-2" />
        <p className="text-2xl font-bold text-purple-900">
          {stats.revenueWeek.toLocaleString()}
        </p>
        <p className="text-sm text-purple-600">CA semaine (XAF)</p>
      </div>
      
      <div className="text-center p-4 bg-orange-50 rounded-lg">
        <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
        <p className="text-2xl font-bold text-orange-900">
          {stats.ordersGrowth >= 0 ? '+' : ''}{stats.ordersGrowth.toFixed(1)}%
        </p>
        <p className="text-sm text-orange-600">Croissance</p>
      </div>
    </div>
  </div>
);
