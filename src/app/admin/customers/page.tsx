'use client';

import React, { useState } from 'react';
import { 
  Search, 
  UserPlus, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Star, 
  ShoppingBag,
  User,
  ArrowUpDown,
  Download,
  Filter,
  Loader2,
  Calendar,
  Trophy,
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  RefreshCw
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { useCustomers, CustomerWithStats } from '../../../hooks/useCustomers';

// Fonction pour obtenir la couleur du tier de fidélité
const getLoyaltyTierColor = (tier: string) => {
  switch (tier) {
    case 'Platinum':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Gold':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Silver':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'Bronze':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Fonction pour obtenir l'icône du tier
const getLoyaltyTierIcon = (tier: string) => {
  switch (tier) {
    case 'Platinum':
      return '💎';
    case 'Gold':
      return '🥇';
    case 'Silver':
      return '🥈';
    case 'Bronze':
      return '🥉';
    default:
      return '👤';
  }
};

// Composant pour afficher les détails d'un client
const CustomerDetailsModal = ({ customer, isOpen, onClose }: {
  customer: CustomerWithStats | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!customer || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative max-w-4xl max-h-[80vh] overflow-y-auto bg-white border shadow-xl rounded-lg m-4 p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
            <User className="h-5 w-5" />
            {customer.first_name} {customer.last_name}
          </h2>
          <p className="text-gray-600">
            Client depuis le {new Date(customer.created_at).toLocaleDateString('fr-FR')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informations personnelles */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{customer.email}</span>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{customer.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-gray-500" />
                <Badge className={`text-xs ${getLoyaltyTierColor(customer.loyalty_tier)}`}>
                  {getLoyaltyTierIcon(customer.loyalty_tier)} {customer.loyalty_tier}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Statistiques */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Commandes totales</span>
                <span className="font-medium">{customer.total_orders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Montant total</span>
                <span className="font-medium">{customer.total_spent.toLocaleString()} XAF</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Points de fidélité</span>
                <span className="font-medium text-purple-600">{customer.loyalty_points} pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Panier moyen</span>
                <span className="font-medium">{customer.average_order_value.toLocaleString()} XAF</span>
              </div>
              {customer.last_order_date && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Dernière commande</span>
                  <span className="font-medium">{new Date(customer.last_order_date).toLocaleDateString('fr-FR')}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Historique des commandes */}
        {customer.orders && customer.orders.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Historique des commandes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {customer.orders.slice(0, 10).map((order: any) => (
                  <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">#{order.order_number || order.id.slice(0, 8)}</p>
                      <p className="text-xs text-gray-600">{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{order.total_amount?.toLocaleString()} XAF</p>
                      <Badge className="text-xs" variant="outline">{order.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Bouton de fermeture */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

const CustomersPage = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithStats | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const { 
    customers, 
    loading, 
    error, 
    filters, 
    updateFilters, 
    refreshCustomers, 
    globalStats 
  } = useCustomers();

  const handleViewCustomer = (customer: CustomerWithStats) => {
    setSelectedCustomer(customer);
    setIsDetailsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailsModalOpen(false);
    // Petit délai pour s'assurer que le modal se ferme complètement
    setTimeout(() => setSelectedCustomer(null), 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement des clients...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Erreur: {error}</p>
        <Button onClick={refreshCustomers}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos clients et leur programme de fidélité
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button onClick={refreshCustomers} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.totalCustomers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.totalRevenue.toLocaleString()} XAF</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes totales</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Panier moyen</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.averageOrderValue.toLocaleString()} XAF</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher par nom, email ou téléphone..."
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="w-full"
              />
            </div>
            <Select value={filters.loyaltyTier} onValueChange={(value) => updateFilters({ loyaltyTier: value })}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Tier de fidélité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les tiers</SelectItem>
                <SelectItem value="Platinum">💎 Platinum</SelectItem>
                <SelectItem value="Gold">🥇 Gold</SelectItem>
                <SelectItem value="Silver">🥈 Silver</SelectItem>
                <SelectItem value="Bronze">🥉 Bronze</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.sortBy} onValueChange={(value: any) => updateFilters({ sortBy: value })}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nom</SelectItem>
                <SelectItem value="orders">Nb commandes</SelectItem>
                <SelectItem value="spent">Montant dépensé</SelectItem>
                <SelectItem value="points">Points fidélité</SelectItem>
                <SelectItem value="lastOrder">Dernière commande</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des clients */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des clients ({customers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tier fidélité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commandes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total dépensé
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dernière commande
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.first_name} {customer.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{customer.email}</div>
                          {customer.phone && (
                            <div className="text-xs text-gray-400">{customer.phone}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={`text-xs ${getLoyaltyTierColor(customer.loyalty_tier)}`}>
                        {getLoyaltyTierIcon(customer.loyalty_tier)} {customer.loyalty_tier}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.total_orders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.total_spent.toLocaleString()} XAF
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                      {customer.loyalty_points} pts
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.last_order_date ? 
                        new Date(customer.last_order_date).toLocaleDateString('fr-FR') : 
                        'Aucune'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border shadow-lg z-50">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewCustomer(customer)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Voir détails
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            Envoyer email
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de détails client */}
      <CustomerDetailsModal
        customer={selectedCustomer}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default CustomersPage;
