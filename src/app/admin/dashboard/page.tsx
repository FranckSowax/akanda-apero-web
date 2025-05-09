'use client';

import React from 'react';
import { ClientOnly } from '../../../components/ui/client-only';
import { 
  ShoppingCart, 
  PackageOpen, 
  Users, 
  CreditCard, 
  Truck,
  Calendar,
  Clock,
  Tag
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '../../../components/ui/button';
import { CategoryInitializer } from '../../../components/admin/CategoryInitializer';

// Composant pour les cartes de statistiques
const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) => (
  <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
    <div className={`${color} rounded-full p-3 mr-4`}>
      {icon}
    </div>
    <div>
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

// Composant pour les commandes récentes
const RecentOrderCard = ({ order }: { order: any }) => (
  <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-center mb-3">
      <h4 className="font-bold text-gray-800">#{order.id}</h4>
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
        order.status === 'Livré' ? 'bg-green-100 text-green-800' :
        order.status === 'En cours' ? 'bg-blue-100 text-blue-800' :
        order.status === 'En préparation' ? 'bg-yellow-100 text-yellow-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {order.status}
      </span>
    </div>
    <div className="flex items-center gap-3 mb-3">
      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
        {order.items === 'Pack Football' && <ShoppingCart className="w-6 h-6 text-[#f5a623]" />}
        {order.items === 'Cocktail DIY' && <PackageOpen className="w-6 h-6 text-[#f5a623]" />}
        {order.items === 'Formule Apéro' && <CreditCard className="w-6 h-6 text-[#f5a623]" />}
      </div>
      <div>
        <p className="font-medium">{order.items}</p>
        <p className="text-sm text-gray-500">{order.client}</p>
      </div>
    </div>
    <div className="flex justify-between items-center text-sm">
      <div className="flex items-center text-gray-500">
        <Clock className="w-4 h-4 mr-1" />
        <span>{order.time}</span>
      </div>
      <p className="font-semibold">{order.amount} XAF</p>
    </div>
  </div>
);

export default function DashboardPage() {
  // Données de démonstration
  const stats = [
    { title: 'Commandes aujourd\'hui', value: 24, icon: <ShoppingCart className="h-5 w-5 text-white" />, color: 'bg-blue-500' },
    { title: 'Revenu aujourd\'hui', value: '258,500 XAF', icon: <CreditCard className="h-5 w-5 text-white" />, color: 'bg-green-500' },
    { title: 'Nouveaux clients', value: 18, icon: <Users className="h-5 w-5 text-white" />, color: 'bg-purple-500' },
    { title: 'Livraisons en cours', value: 7, icon: <Truck className="h-5 w-5 text-white" />, color: 'bg-yellow-500' },
  ];

  const recentOrders = [
    { id: 'A1085', status: 'Livré', items: 'Pack Football', client: 'Jean Mouloungui', time: 'Il y a 35 min', amount: '45,000' },
    { id: 'A1084', status: 'En cours', items: 'Cocktail DIY', client: 'Marie Koumba', time: 'Il y a 1h', amount: '38,500' },
    { id: 'A1083', status: 'En préparation', items: 'Formule Apéro', client: 'Sarah Ndong', time: 'Il y a 1h 15min', amount: '32,000' },
    { id: 'A1082', status: 'Livré', items: 'Pack Football', client: 'Fabrice Ondo', time: 'Il y a 2h', amount: '45,000' },
  ];

  // Données pour le graphique (factice pour le moment)
  const dailyOrders = [18, 24, 16, 20, 28, 26, 22];
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  
  return (
    <ClientOnly>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
          <div className="flex items-center gap-2">
            <Button className="bg-white text-gray-600 shadow-sm hover:bg-gray-50 border-gray-200 border flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Aujourd'hui</span>
            </Button>
            <Button className="bg-[#f5a623] hover:bg-[#e09000] text-white">Rapports</Button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <StatCard 
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Graphique des ventes */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Aperçu des ventes</h2>
              <div className="flex space-x-2 text-sm">
                <button className="px-3 py-1.5 bg-[#f5a623] text-white rounded-md">Commandes</button>
                <button className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-md">Revenus</button>
              </div>
            </div>
            
            <div className="relative h-64">
              {/* Simple représentation d'un graphique */}
              <div className="absolute inset-0 flex items-end justify-around">
                {dailyOrders.map((value, index) => (
                  <div key={index} className="relative group">
                    <div 
                      className="w-8 bg-[#f5a623] rounded-t-sm" 
                      style={{ height: `${(value / 30) * 100}%` }}
                    ></div>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full mt-1 text-xs text-gray-500">
                      {days[index]}
                    </div>
                    <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2">
                      {value} commandes
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Commandes récentes */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Commandes récentes</h2>
              <Link href="/admin/orders" className="text-sm text-[#f5a623] hover:underline">
                Voir tout
              </Link>
            </div>
            <div className="space-y-3">
              {recentOrders.map((order, index) => (
                <RecentOrderCard key={index} order={order} />
              ))}
            </div>
          </div>
        </div>
        
        {/* Section Gestion des Catégories */}
        <div className="mt-6">
          <div className="flex items-center mb-4">
            <Tag className="h-5 w-5 text-[#f5a623] mr-2" />
            <h2 className="text-lg font-bold">Gestion des Catégories</h2>
          </div>
          <CategoryInitializer />
        </div>
      </div>
    </ClientOnly>
  );
}
