'use client';

import React from 'react';
import { ClientOnly } from '../../../components/ui/client-only';
import { 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  CreditCard, 
  Truck,
  Calendar,
  RefreshCw,
  BarChart3,
  Package,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { useDashboardStats } from '../../../hooks/dashboard/useDashboardStats';
import {
  StatCard,
  RecentOrdersModule,
  BestSellersModule,
  StockAlertsModule,
  ActiveDeliveriesModule,
  TopCustomersModule,
  QuickReportModule
} from '../../../components/dashboard/DashboardModules';




export default function DashboardPage() {
  const {
    stats,
    recentOrders,
    bestSellers,
    stockAlerts,
    topCustomers,
    activeDeliveries,
    loading,
    error,
    refreshData
  } = useDashboardStats();

  // Configuration des cartes de statistiques principales
  const mainStats = [
    { 
      title: 'Commandes aujourd\'hui', 
      value: stats.ordersToday, 
      icon: <ShoppingCart className="h-5 w-5 text-white" />, 
      color: 'bg-fuchsia-500',
      growth: stats.ordersGrowth,
      subtitle: `${stats.ordersWeek} cette semaine`
    },
    { 
      title: 'Chiffre d\'affaires', 
      value: `${stats.revenueToday.toLocaleString()} XAF`, 
      icon: <CreditCard className="h-5 w-5 text-white" />, 
      color: 'bg-green-500',
      growth: stats.revenueGrowth,
      subtitle: `${stats.revenueWeek.toLocaleString()} XAF cette semaine`
    },
    { 
      title: 'Nouveaux clients', 
      value: stats.newCustomersToday, 
      icon: <Users className="h-5 w-5 text-white" />, 
      color: 'bg-purple-500',
      growth: stats.customersGrowth,
      subtitle: `${stats.newCustomersWeek} cette semaine`
    },
    { 
      title: 'Livraisons actives', 
      value: stats.activeDeliveries, 
      icon: <Truck className="h-5 w-5 text-white" />, 
      color: 'bg-blue-500',
      subtitle: 'En cours de traitement'
    },
  ];
  
  if (error) {
    return (
      <ClientOnly>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="text-red-800 font-medium">Erreur de chargement</h3>
            </div>
            <p className="text-red-700 mt-2">{error}</p>
            <Button 
              onClick={refreshData} 
              className="mt-4 bg-red-600 hover:bg-red-700 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </div>
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
            <p className="text-gray-600 mt-1">Vue d'ensemble de votre activité</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={refreshData}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <Button className="bg-[#f5a623] hover:bg-[#e09000] text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Rapports détaillés
            </Button>
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array(4).fill(null).map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-300 rounded-lg p-3 w-12 h-12"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
                    <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            mainStats.map((stat, index) => (
              <StatCard 
                key={index}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
                growth={stat.growth}
                subtitle={stat.subtitle}
              />
            ))
          )}
        </div>

        {/* Modules principaux */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Commandes récentes */}
          <div className="lg:col-span-1">
            <RecentOrdersModule orders={recentOrders} loading={loading} />
          </div>
          
          {/* Meilleures ventes */}
          <div className="lg:col-span-1">
            <BestSellersModule bestSellers={bestSellers} loading={loading} />
          </div>
          
          {/* Rapport rapide */}
          <div className="lg:col-span-1">
            <QuickReportModule stats={stats} loading={loading} onRefresh={refreshData} />
          </div>
        </div>

        {/* Modules secondaires */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Alertes stock */}
          <div className="lg:col-span-1">
            <StockAlertsModule stockAlerts={stockAlerts} loading={loading} />
          </div>
          
          {/* Livraisons en cours */}
          <div className="lg:col-span-1">
            <ActiveDeliveriesModule deliveries={activeDeliveries} loading={loading} />
          </div>
          
          {/* Meilleurs clients */}
          <div className="lg:col-span-1">
            <TopCustomersModule customers={topCustomers} loading={loading} />
          </div>
        </div>

      </div>
    </ClientOnly>
  );
}
