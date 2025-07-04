'use client';

import React, { useState, useEffect } from 'react';
import { ClientOnly } from '../../../components/ui/client-only';
import { 
  ShoppingCart, 
  PackageOpen, 
  Users, 
  CreditCard, 
  Truck,
  Calendar,
  Clock,
  Loader2
} from 'lucide-react';
import DashboardService, { DashboardStats, RecentOrder } from '../../../services/dashboard-service';
import Link from 'next/link';
import { Button } from '../../../components/ui/button';

// Composant pour les cartes de statistiques
const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) => (
  <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 flex items-center">
    <div className={`${color} rounded-full p-2 sm:p-3 mr-3 sm:mr-4 flex-shrink-0`}>
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <h3 className="text-gray-500 text-xs sm:text-sm font-medium truncate">{title}</h3>
      <p className="text-lg sm:text-2xl font-bold truncate">{value}</p>
    </div>
  </div>
);

// Composant pour les commandes récentes
const RecentOrderCard = ({ order }: { order: any }) => (
  <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-center mb-2 sm:mb-3">
      <h4 className="font-bold text-gray-800 text-sm sm:text-base">#{order.id}</h4>
      <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold ${
        order.status === 'Livré' ? 'bg-green-100 text-green-800' :
        order.status === 'En cours' ? 'bg-blue-100 text-blue-800' :
        order.status === 'En préparation' ? 'bg-yellow-100 text-yellow-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {order.status}
      </span>
    </div>
    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
        {order.items === 'Pack Football' && <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-[#f5a623]" />}
        {order.items === 'Cocktail DIY' && <PackageOpen className="w-5 h-5 sm:w-6 sm:h-6 text-[#f5a623]" />}
        {order.items === 'Formule Apéro' && <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-[#f5a623]" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm sm:text-base truncate">{order.items}</p>
        <p className="text-xs sm:text-sm text-gray-500 truncate">{order.client}</p>
      </div>
    </div>
    <div className="flex justify-between items-center text-xs sm:text-sm">
      <div className="flex items-center text-gray-500 truncate max-w-[50%]">
        <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
        <span className="truncate">{order.time}</span>
      </div>
      <p className="font-semibold">{order.amount} XAF</p>
    </div>
  </div>
);

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardStats>({
    ordersToday: 0,
    revenueToday: 0,
    newCustomersToday: 0,
    activeDeliveries: 0,
    dailySalesData: [],
    recentOrders: []
  });
  
  // Chargement initial des données
  useEffect(() => {
    loadDashboardData();
  }, []);
  
  // Abonnement aux mises à jour en temps réel
  useEffect(() => {
    // S'abonner aux mises à jour des commandes
    const subscription = DashboardService.subscribeToOrderUpdates(() => {
      // Recharger les données quand une commande est créée/modifiée/supprimée
      loadDashboardData();
    });
    
    // Nettoyage
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Fonction pour charger les données du tableau de bord
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const data = await DashboardService.getDashboardStats();
      setDashboardData(data);
    } catch (error) {
      console.error('Erreur lors du chargement des données du tableau de bord:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Configuration des cartes de statistiques
  const stats = [
    { 
      title: 'Commandes aujourd\'hui', 
      value: dashboardData.ordersToday, 
      icon: <ShoppingCart className="h-5 w-5 text-white" />, 
      color: 'bg-blue-500' 
    },
    { 
      title: 'Revenu aujourd\'hui', 
      value: `${dashboardData.revenueToday.toLocaleString()} XAF`, 
      icon: <CreditCard className="h-5 w-5 text-white" />, 
      color: 'bg-green-500' 
    },
    { 
      title: 'Nouveaux clients', 
      value: dashboardData.newCustomersToday, 
      icon: <Users className="h-5 w-5 text-white" />, 
      color: 'bg-purple-500' 
    },
    { 
      title: 'Livraisons en cours', 
      value: dashboardData.activeDeliveries, 
      icon: <Truck className="h-5 w-5 text-white" />, 
      color: 'bg-yellow-500' 
    },
  ];
  
  // Extraire les données pour le graphique
  const dailyOrders = dashboardData.dailySalesData.map(day => day.orders);
  const days = dashboardData.dailySalesData.map(day => day.day);
  
  return (
    <ClientOnly>
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button className="bg-white text-gray-600 shadow-sm hover:bg-gray-50 border-gray-200 border flex items-center gap-2 text-xs sm:text-sm flex-1 sm:flex-initial justify-center">
              <Calendar className="h-4 w-4" />
              <span className="hidden xs:inline">Aujourd'hui</span>
            </Button>
            <Button className="bg-[#f5a623] hover:bg-[#e09000] text-white text-xs sm:text-sm flex-1 sm:flex-initial justify-center">Rapports</Button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {isLoading ? (
            Array(4).fill(null).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 flex items-center animate-pulse">
                <div className="bg-gray-300 rounded-full p-3 mr-4 w-12 h-12"></div>
                <div className="w-full">
                  <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                </div>
              </div>
            ))
          ) : (
            stats.map((stat, index) => (
              <StatCard 
                key={index}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
              />
            ))
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Graphique des ventes */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-3 sm:p-6">
            <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 xs:gap-0 mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-bold">Aperçu des ventes</h2>
              <div className="flex space-x-2 text-xs sm:text-sm w-full xs:w-auto">
                <button className="px-2 sm:px-3 py-1 sm:py-1.5 bg-[#f5a623] text-white rounded-md flex-1 xs:flex-none text-center">Commandes</button>
                <button className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-100 text-gray-600 rounded-md flex-1 xs:flex-none text-center">Revenus</button>
              </div>
            </div>
            
            <div className="relative h-44 sm:h-64">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-[#f5a623] animate-spin" />
                </div>
              ) : dailyOrders.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  <p>Aucune donnée disponible pour cette période</p>
                </div>
              ) : (
                /* Simple représentation d'un graphique */
                <div className="absolute inset-0 flex items-end justify-around">
                  {dailyOrders.map((value, index) => {
                    const maxValue = Math.max(...dailyOrders, 10); // Au moins 10 pour éviter une division par zéro
                    return (
                      <div key={index} className="relative group">
                        <div 
                          className="w-4 sm:w-8 bg-[#f5a623] rounded-t-sm" 
                          style={{ height: value === 0 ? '4px' : `${(value / maxValue) * 100}%` }}
                        ></div>
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full mt-1 text-xs text-gray-500">
                          {days[index]}
                        </div>
                        <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2">
                          {value} commandes
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Commandes récentes */}
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-bold">Commandes récentes</h2>
              <Link href="/admin/orders" className="text-sm text-[#f5a623] hover:underline">
                Voir tout
              </Link>
            </div>
            <div className="space-y-3">
              {isLoading ? (
                // Placeholder de chargement
                Array(4).fill(null).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                    <div className="flex justify-between items-center mb-3">
                      <div className="h-5 bg-gray-300 rounded w-16"></div>
                      <div className="h-5 bg-gray-300 rounded w-20"></div>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
                      <div className="w-full">
                        <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/3"></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/5"></div>
                    </div>
                  </div>
                ))
              ) : dashboardData.recentOrders.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <p>Aucune commande récente à afficher</p>
                </div>
              ) : (
                dashboardData.recentOrders.map((order, index) => (
                  <RecentOrderCard key={index} order={order} />
                ))
              )}
            </div>
          </div>
        </div>
        

      </div>
    </ClientOnly>
  );
}
