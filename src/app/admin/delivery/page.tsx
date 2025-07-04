'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase/client';
import { 
  Truck, MapPin, Clock, Package, User, Phone, 
  Search, Filter, Plus, Edit, Trash2, X, Save,
  CheckCircle, AlertCircle, RefreshCw, Eye
} from 'lucide-react';

// Types
interface Delivery {
  id: string;
  order_id: string;
  delivery_person_id: string | null;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  delivery_zone: string;
  delivery_fee: number;
  status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'failed';
  scheduled_at: string | null;
  delivered_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface DeliveryPerson {
  id: string;
  name: string;
  phone: string;
  vehicle_type: string;
  is_active: boolean;
  current_location: string | null;
  created_at: string;
}

// Composants UI
const Button = ({ children, variant = 'default', className = '', onClick, disabled = false, type = 'button' }: any) => {
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50',
    ghost: 'hover:bg-gray-100'
  };
  
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors h-10 py-2 px-4 ${variants[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Input = ({ className = '', ...props }: any) => (
  <input
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 ${className}`}
    {...props}
  />
);

const Select = ({ children, value, onValueChange, ...props }: any) => (
  <select
    value={value}
    onChange={(e) => onValueChange?.(e.target.value)}
    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
    {...props}
  >
    {children}
  </select>
);

export default function DeliveryPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Charger les données
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [deliveriesRes, personsRes] = await Promise.all([
        supabase.from('deliveries').select('*').order('created_at', { ascending: false }),
        supabase.from('delivery_persons').select('*').eq('is_active', true)
      ]);

      if (deliveriesRes.error) throw deliveriesRes.error;
      if (personsRes.error) throw personsRes.error;

      setDeliveries(deliveriesRes.data || []);
      setDeliveryPersons(personsRes.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les livraisons
  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = delivery.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         delivery.delivery_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         delivery.order_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Statistiques
  const stats = {
    total: deliveries.length,
    pending: deliveries.filter(d => d.status === 'pending').length,
    assigned: deliveries.filter(d => d.status === 'assigned').length,
    in_transit: deliveries.filter(d => d.status === 'in_transit').length,
    delivered: deliveries.filter(d => d.status === 'delivered').length,
    failed: deliveries.filter(d => d.status === 'failed').length
  };

  // Mettre à jour le statut
  const updateDeliveryStatus = async (deliveryId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('deliveries')
        .update({ 
          status: newStatus,
          delivered_at: newStatus === 'delivered' ? new Date().toISOString() : null
        })
        .eq('id', deliveryId);

      if (error) throw error;
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Assigner un livreur
  const assignDeliveryPerson = async (deliveryId: string, personId: string) => {
    try {
      const { error } = await supabase
        .from('deliveries')
        .update({ 
          delivery_person_id: personId,
          status: 'assigned'
        })
        .eq('id', deliveryId);

      if (error) throw error;
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_transit': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'assigned': return 'Assigné';
      case 'in_transit': return 'En cours';
      case 'delivered': return 'Livré';
      case 'failed': return 'Échec';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Livraisons</h1>
        <p className="text-gray-600">Gérez et suivez toutes les livraisons</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">En attente</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <User className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Assigné</p>
              <p className="text-2xl font-bold text-gray-900">{stats.assigned}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Truck className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">En cours</p>
              <p className="text-2xl font-bold text-gray-900">{stats.in_transit}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Livré</p>
              <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Échec</p>
              <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-6 rounded-lg shadow border mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher par client, commande ou adresse..."
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="assigned">Assigné</option>
              <option value="in_transit">En cours</option>
              <option value="delivered">Livré</option>
              <option value="failed">Échec</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Liste des livraisons */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commande
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adresse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Livreur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Frais
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune livraison</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'Aucune livraison ne correspond à vos critères de recherche.'
                        : 'Aucune livraison pour le moment.'
                      }
                    </p>
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map((delivery) => {
                  const assignedPerson = deliveryPersons.find(p => p.id === delivery.delivery_person_id);
                  
                  return (
                    <tr key={delivery.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {delivery.order_id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {delivery.customer_name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {delivery.customer_phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 flex items-start">
                          <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                          <div>
                            <div>{delivery.delivery_address}</div>
                            <div className="text-gray-500">{delivery.delivery_zone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {assignedPerson ? (
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{assignedPerson.name}</div>
                            <div className="text-gray-500">{assignedPerson.vehicle_type}</div>
                          </div>
                        ) : (
                          <Select
                            value=""
                            onValueChange={(personId: string) => assignDeliveryPerson(delivery.id, personId)}
                          >
                            <option value="">Assigner un livreur</option>
                            {deliveryPersons.map(person => (
                              <option key={person.id} value={person.id}>
                                {person.name} ({person.vehicle_type})
                              </option>
                            ))}
                          </Select>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Select
                          value={delivery.status}
                          onValueChange={(status: string) => updateDeliveryStatus(delivery.id, status)}
                        >
                          <option value="pending">En attente</option>
                          <option value="assigned">Assigné</option>
                          <option value="in_transit">En cours</option>
                          <option value="delivered">Livré</option>
                          <option value="failed">Échec</option>
                        </Select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {delivery.delivery_fee.toLocaleString()} XAF
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
