'use client';

import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Phone, 
  Package, 
  User, 
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Truck
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { NavigationLinks, InlineNavigationLinks } from '../../../components/ui/navigation-links';
import { useOrders } from '../../../hooks/supabase/useOrders';
import { OrderWithNavigation } from '../../../types/supabase';
import { formatPrice } from '../../../lib/utils/formatters';

// Types pour les filtres
type DeliveryStatus = 'all' | 'pending' | 'confirmed' | 'preparing' | 'ready_for_delivery' | 'out_for_delivery' | 'delivered';

const DeliveriesPage = () => {
  const [orders, setOrders] = useState<OrderWithNavigation[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderWithNavigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderWithNavigation | null>(null);
  
  const { getAllOrders, updateOrderStatus } = useOrders();

  // Charger les commandes
  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await getAllOrders();
      if (data && !error) {
        // Filtrer seulement les commandes avec coordonnées GPS
        const ordersWithLocation = data.filter(order => 
          order.delivery_latitude && order.delivery_longitude
        ) as OrderWithNavigation[];
        
        setOrders(ordersWithLocation);
        setFilteredOrders(ordersWithLocation);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Filtrer les commandes
  useEffect(() => {
    let filtered = orders;

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.delivery_address && order.delivery_address.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.delivery_phone && order.delivery_phone.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredOrders(filtered);
  }, [orders, statusFilter, searchTerm]);

  // Mettre à jour le statut d'une commande
  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const { success } = await updateOrderStatus(orderId, newStatus);
      if (success) {
        await loadOrders(); // Recharger les données
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  // Obtenir la couleur du badge selon le statut
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'En attente' },
      confirmed: { color: 'bg-blue-100 text-blue-800', label: 'Confirmée' },
      preparing: { color: 'bg-orange-100 text-orange-800', label: 'Préparation' },
      ready_for_delivery: { color: 'bg-purple-100 text-purple-800', label: 'Prête' },
      out_for_delivery: { color: 'bg-indigo-100 text-indigo-800', label: 'En livraison' },
      delivered: { color: 'bg-green-100 text-green-800', label: 'Livrée' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Annulée' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge className={`${config.color} border-0`}>
        {config.label}
      </Badge>
    );
  };

  // Statistiques des livraisons
  const stats = {
    total: orders.length,
    pending: orders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status)).length,
    inProgress: orders.filter(o => ['ready_for_delivery', 'out_for_delivery'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'delivered').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Chargement des livraisons...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Livraisons</h1>
          <p className="text-gray-600 mt-1">Suivi et navigation GPS pour toutes les livraisons</p>
        </div>
        <Button onClick={loadOrders} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Truck className="w-8 h-8 text-indigo-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">En cours</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Livrées</p>
                <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher par numéro, adresse ou téléphone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as DeliveryStatus)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmées</option>
                <option value="preparing">Préparation</option>
                <option value="ready_for_delivery">Prêtes</option>
                <option value="out_for_delivery">En livraison</option>
                <option value="delivered">Livrées</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des commandes */}
      <div className="grid gap-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune livraison trouvée</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Aucune livraison ne correspond à vos critères de recherche.'
                  : 'Aucune commande avec coordonnées GPS disponible.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Informations de base */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        #{order.order_number}
                      </h3>
                      {getStatusBadge(order.status)}
                      <span className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span className="font-medium">Adresse:</span>
                        </div>
                        <p className="text-gray-900 ml-6">{order.delivery_address || 'Adresse non renseignée'}</p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          <span className="font-medium">Téléphone:</span>
                        </div>
                        <p className="text-gray-900 ml-6">{order.delivery_phone || 'Téléphone non renseigné'}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(order.total_amount)} XAF
                      </span>
                      
                      {/* Actions de statut */}
                      <div className="flex gap-2">
                        {order.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Confirmer
                          </Button>
                        )}
                        {order.status === 'confirmed' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(order.id, 'preparing')}
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            Préparer
                          </Button>
                        )}
                        {order.status === 'preparing' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(order.id, 'ready_for_delivery')}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            Prête
                          </Button>
                        )}
                        {order.status === 'ready_for_delivery' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(order.id, 'out_for_delivery')}
                            className="bg-indigo-600 hover:bg-indigo-700"
                          >
                            En livraison
                          </Button>
                        )}
                        {order.status === 'out_for_delivery' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(order.id, 'delivered')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Livrée
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Navigation GPS */}
                  <div className="lg:w-80">
                    {order.delivery_latitude && order.delivery_longitude ? (
                      <NavigationLinks
                        latitude={order.delivery_latitude!}
                        longitude={order.delivery_longitude!}
                        address={order.delivery_location_address || order.delivery_address || undefined}
                        className="bg-gray-50 p-4 rounded-lg"
                        showCoordinates={false}
                      />
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                        <MapPin className="w-6 h-6 mx-auto mb-2" />
                        <p className="text-sm">Coordonnées GPS non disponibles</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes de livraison */}
                {order.delivery_notes && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Notes de livraison:</p>
                        <p className="text-sm text-yellow-700 mt-1">{order.delivery_notes}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default DeliveriesPage;
