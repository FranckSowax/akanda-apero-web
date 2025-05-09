'use client';

import React, { useState } from 'react';
import { 
  Download, 
  Search, 
  Filter, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Package, 
  ShoppingBag,
  CalendarIcon,
  ChevronDown,
  Printer,
  FileText,
  RefreshCw,
  MoreHorizontal,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '../../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";

// Statut des commandes avec leur couleur et icône respectifs
const orderStatuses = {
  'Nouvelle': { color: 'bg-blue-100 text-blue-800', icon: <AlertCircle className="h-4 w-4" /> },
  'En préparation': { color: 'bg-yellow-100 text-yellow-800', icon: <Package className="h-4 w-4" /> },
  'Prête': { color: 'bg-purple-100 text-purple-800', icon: <ShoppingBag className="h-4 w-4" /> },
  'En livraison': { color: 'bg-indigo-100 text-indigo-800', icon: <Truck className="h-4 w-4" /> },
  'Livrée': { color: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="h-4 w-4" /> },
  'Retardée': { color: 'bg-red-100 text-red-800', icon: <Clock className="h-4 w-4" /> },
};

// Composant pour le statut de commande
const OrderStatusBadge = ({ status }: { status: string }) => {
  const statusInfo = orderStatuses[status as keyof typeof orderStatuses] || orderStatuses['Nouvelle'];
  
  return (
    <Badge className={`${statusInfo.color} flex items-center gap-1 px-2.5 py-1 rounded-full font-medium`}>
      {statusInfo.icon}
      <span>{status}</span>
    </Badge>
  );
};

// Tableau des commandes
const OrderTable = ({ orders }: { orders: any[] }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Commande
            </th>
            <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Client
            </th>
            <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Paiement
            </th>
            <th scope="col" className="px-4 py-3.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="px-4 py-4 whitespace-nowrap">
                <Link href={`/admin/orders/${order.id}`} className="text-[#f5a623] hover:underline font-medium">
                  #{order.id}
                </Link>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {order.date}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700">
                    {order.client.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{order.client}</p>
                    <p className="text-xs text-gray-500">{order.phone}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                {order.total} XAF
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <OrderStatusBadge status={order.status} />
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <Badge className={order.payment === 'Payée' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                  {order.payment}
                </Badge>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      <span>Voir les détails</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Package className="mr-2 h-4 w-4" />
                      <span>Mettre à jour le statut</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FileText className="mr-2 h-4 w-4" />
                      <span>Facture</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      <span>Signaler un problème</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Statistiques des commandes
const OrderStats = () => {
  const stats = [
    { label: 'Nouvelles', value: 12, color: 'text-blue-600' },
    { label: 'En préparation', value: 8, color: 'text-yellow-600' },
    { label: 'En livraison', value: 5, color: 'text-indigo-600' },
    { label: 'Livrées (aujourd\'hui)', value: 24, color: 'text-green-600' },
    { label: 'Retardées', value: 2, color: 'text-red-600' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-gray-500 text-sm">{stat.label}</p>
          <p className={`${stat.color} text-2xl font-bold`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
};

export default function OrdersPage() {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Données fictives pour les commandes
  const orders = [
    { 
      id: 'A1085', 
      date: '06 Mai 2025, 14:30', 
      client: 'Jean Mouloungui', 
      phone: '+241 77 11 22 33',
      total: '45,000', 
      status: 'Livrée', 
      payment: 'Payée',
      items: [
        { name: 'Pack Football', quantity: 1, price: '45,000 XAF' },
      ]
    },
    { 
      id: 'A1084', 
      date: '06 Mai 2025, 13:45', 
      client: 'Marie Koumba', 
      phone: '+241 66 22 33 44',
      total: '38,500', 
      status: 'En livraison', 
      payment: 'Payée',
      items: [
        { name: 'Cocktail DIY', quantity: 1, price: '38,500 XAF' },
      ]
    },
    { 
      id: 'A1083', 
      date: '06 Mai 2025, 13:30', 
      client: 'Sarah Ndong', 
      phone: '+241 77 33 44 55',
      total: '32,000', 
      status: 'En préparation', 
      payment: 'Payée',
      items: [
        { name: 'Formule Apéro', quantity: 1, price: '32,000 XAF' },
      ]
    },
    { 
      id: 'A1082', 
      date: '06 Mai 2025, 12:15', 
      client: 'Fabrice Ondo', 
      phone: '+241 66 44 55 66',
      total: '45,000', 
      status: 'Livrée', 
      payment: 'Payée',
      items: [
        { name: 'Pack Football', quantity: 1, price: '45,000 XAF' },
      ]
    },
    { 
      id: 'A1081', 
      date: '06 Mai 2025, 11:45', 
      client: 'Pascal Ntoutoume', 
      phone: '+241 77 55 66 77',
      total: '25,000', 
      status: 'Retardée', 
      payment: 'En attente',
      items: [
        { name: 'Assortiment de spiritueux', quantity: 1, price: '25,000 XAF' },
      ]
    },
    { 
      id: 'A1080', 
      date: '06 Mai 2025, 10:30', 
      client: 'Estelle Mayombo', 
      phone: '+241 66 77 88 99',
      total: '18,500', 
      status: 'Nouvelle', 
      payment: 'En attente',
      items: [
        { name: 'Vin & Fromages', quantity: 1, price: '18,500 XAF' },
      ]
    },
  ];

  // Filtrer les commandes en fonction du statut et du terme de recherche
  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.client.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Gestion des Commandes</h1>
        <div className="flex gap-2">
          <Button className="bg-[#f5a623] hover:bg-[#e09000] text-white flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Imprimer
          </Button>
          <Button className="bg-white text-gray-600 hover:bg-gray-50 border-gray-200 border flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <OrderStats />

      {/* Filtres et Recherche */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              placeholder="Rechercher par ID ou client..." 
              className="pl-10" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-40">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="Nouvelle">Nouvelle</SelectItem>
                <SelectItem value="En préparation">En préparation</SelectItem>
                <SelectItem value="Prête">Prête</SelectItem>
                <SelectItem value="En livraison">En livraison</SelectItem>
                <SelectItem value="Livrée">Livrée</SelectItem>
                <SelectItem value="Retardée">Retardée</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Plus de filtres
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-10 w-10">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <div className="w-48">
            <Select defaultValue="today">
              <SelectTrigger>
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="yesterday">Hier</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="custom">Personnalisé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tableau des commandes */}
      <OrderTable orders={filteredOrders} />

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">Affichage de 1 à {filteredOrders.length} sur {orders.length} commandes</p>
        <div className="flex items-center space-x-2">
          <Button disabled variant="outline" size="sm">Précédent</Button>
          <Button variant="outline" size="sm" className="bg-[#f5a623] text-white border-[#f5a623]">1</Button>
          <Button variant="outline" size="sm">2</Button>
          <Button variant="outline" size="sm">3</Button>
          <Button variant="outline" size="sm">Suivant</Button>
        </div>
      </div>
    </div>
  );
}
