'use client';

import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Package, 
  ShoppingBag,
  RefreshCw,
  MoreHorizontal,
  Eye,
  FileText
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

import { useOrders } from '../../../hooks/supabase/useOrders';
import OrderDetailsModal from '../../../components/admin/OrderDetailsModal';
import InvoiceModal from '../../../components/admin/InvoiceModal';
import { Order } from '../../../types/supabase';
import { whapiService } from '../../../services/whapi';

// Statut des commandes avec leur couleur et icône respectifs
const orderStatuses: Record<string, { color: string; icon: React.ReactNode }> = {
  'Nouvelle': { color: 'bg-blue-100 text-blue-800', icon: <AlertCircle className="h-4 w-4" /> },
  'En préparation': { color: 'bg-yellow-100 text-yellow-800', icon: <Package className="h-4 w-4" /> },
  'Prête': { color: 'bg-purple-100 text-purple-800', icon: <ShoppingBag className="h-4 w-4" /> },
  'En livraison': { color: 'bg-indigo-100 text-indigo-800', icon: <Truck className="h-4 w-4" /> },
  'Livrée': { color: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="h-4 w-4" /> },
  'Retardée': { color: 'bg-red-100 text-red-800', icon: <Clock className="h-4 w-4" /> },
  'Annulée': { color: 'bg-gray-100 text-gray-800', icon: <AlertCircle className="h-4 w-4" /> },
};

// Composant pour le statut de commande
const OrderStatusBadge = ({ status }: { status: string }) => {
  const statusInfo = orderStatuses[status] || orderStatuses['Nouvelle'];
  
  return (
    <Badge className={`${statusInfo.color} flex items-center gap-1 px-2.5 py-1 rounded-full font-medium`}>
      {statusInfo.icon}
      <span>{status}</span>
    </Badge>
  );
};

// Tableau des commandes
const OrderTable = ({ orders, onStatusChange, onViewOrder, onViewInvoice }: { 
  orders: any[],
  onStatusChange: (orderId: string, status: string) => void,
  onViewOrder: (orderId: string) => void,
  onViewInvoice: (orderId: string) => void
}) => {
  if (orders.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
        <p className="text-gray-500">Aucune commande trouvée</p>
      </div>
    );
  }
  
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
                  #{order.order_number || order.id.slice(0, 6)}
                </Link>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {order.formatted_date || new Date(order.created_at).toLocaleDateString('fr-FR')}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700">
                    {order.customers ? 
                      `${order.customers.first_name?.[0] || ''}${order.customers.last_name?.[0] || ''}` 
                      : '??'}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {order.customers ? 
                        `${order.customers.first_name || ''} ${order.customers.last_name || ''}` 
                        : 'Client inconnu'}
                    </p>
                    <p className="text-xs text-gray-500">{order.customers?.phone || ''}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                {order.total_formatted || `${order.total_amount || 0} XAF`}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <OrderStatusBadge status={order.status || 'Nouvelle'} />
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <Badge className={order.payment_status === 'Payé' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                  {order.payment_status || 'En attente'}
                </Badge>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white border shadow-lg">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onViewOrder(order.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      <span>Voir les détails</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onStatusChange(order.id, 'En préparation')}>
                      <Package className="mr-2 h-4 w-4" />
                      <span>Marquer en préparation</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStatusChange(order.id, 'Prête')}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      <span>Marquer comme prête</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStatusChange(order.id, 'En livraison')}>
                      <Truck className="mr-2 h-4 w-4" />
                      <span>Marquer en livraison</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStatusChange(order.id, 'Livrée')}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      <span>Marquer comme livrée</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onViewInvoice(order.id)}>
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
const OrderStats = ({ orders }: { orders: any[] }) => {
  // Calculer les statistiques à partir des commandes réelles
  const newOrders = orders.filter(order => order.status === 'Nouvelle').length;
  const processingOrders = orders.filter(order => order.status === 'En préparation').length;
  const shippingOrders = orders.filter(order => order.status === 'En livraison').length;
  
  // Calculer les commandes livrées aujourd'hui
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deliveredToday = orders.filter(order => {
    return order.status === 'Livrée' && new Date(order.created_at) >= today;
  }).length;
  
  const delayedOrders = orders.filter(order => order.status === 'Annulée').length;
  
  const stats = [
    { label: 'Nouvelles', value: newOrders, color: 'text-blue-600' },
    { label: 'En préparation', value: processingOrders, color: 'text-yellow-600' },
    { label: 'En livraison', value: shippingOrders, color: 'text-indigo-600' },
    { label: 'Livrées (aujourd\'hui)', value: deliveredToday, color: 'text-green-600' },
    { label: 'Annulées', value: delayedOrders, color: 'text-red-600' },
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
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdateOrderId, setStatusUpdateOrderId] = useState<string | null>(null);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<any | null>(null);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<any | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false);

  const { getAllOrders, updateOrderStatus, loading: ordersLoading } = useOrders();

  // Charger les commandes depuis Supabase
  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await getAllOrders();
        if (error) {
          setError(error.message);
        } else if (data) {
          setOrders(data);
        }
      } catch (err: any) {
        console.error('Erreur lors du chargement des commandes:', err);
        setError('Erreur lors du chargement des commandes');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, []);

  // Gestion de la mise à jour du statut d'une commande
  const handleStatusChange = async (orderId: string, status: string) => {
    setStatusUpdateOrderId(orderId);
    try {
      const { success, error } = await updateOrderStatus(orderId, status);
      if (success) {
        // Trouver la commande pour récupérer les infos client
        const order = orders.find(o => o.id === orderId);
        
        // Mettre à jour l'état local pour refléter le changement
        setOrders(prevOrders => prevOrders.map(order => {
          if (order.id === orderId) {
            return {
              ...order,
              status // Le statut est déjà en français
            };
          }
          return order;
        }));

        // Envoyer notification WhatsApp si les infos client sont disponibles
        if (order && order.customers?.phone && whapiService.isConfigured()) {
          const customerName = `${order.customers.first_name || ''} ${order.customers.last_name || ''}`.trim() || 'Client';
          const orderNumber = order.order_number || order.id.slice(0, 8).toUpperCase();
          
          // Envoyer la notification en arrière-plan (ne pas bloquer l'UI)
          whapiService.sendStatusNotification(
            order.customers.phone,
            orderNumber,
            status, // Le statut est déjà en français
            customerName
          ).then(result => {
            if (result.sent) {
              console.log(`✅ Notification WhatsApp envoyée pour la commande ${orderNumber}`);
            } else {
              console.warn(`⚠️ Échec envoi WhatsApp pour ${orderNumber}:`, result.error);
            }
          }).catch(err => {
            console.error('Erreur notification WhatsApp:', err);
          });
        } else if (!whapiService.isConfigured()) {
          console.info('ℹ️ Service WhatsApp non configuré - notification non envoyée');
        }
        
      } else if (error) {
        setError(`Erreur lors de la mise à jour du statut: ${error.message}`);
      }
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du statut:', err);
      setError('Erreur lors de la mise à jour du statut');
    } finally {
      setStatusUpdateOrderId(null);
    }
  };

  // Gérer la vue d'une commande (ouvrir le modal de détails)
  const handleViewOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrderForDetails(order);
      setIsDetailsModalOpen(true);
    }
  };

  // Gérer l'ouverture du modal de facture
  const handleViewInvoice = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrderForInvoice(order);
      setIsInvoiceModalOpen(true);
    }
  };

  // Fermer les modals
  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedOrderForDetails(null);
  };

  const handleCloseInvoiceModal = () => {
    setIsInvoiceModalOpen(false);
    setSelectedOrderForInvoice(null);
  };

  // Filtrer les commandes par statut et recherche
  const filteredOrders = orders.filter(order => {
    // Filtrer par statut
    if (filterStatus !== 'all' && order.status_fr !== filterStatus) {
      return false;
    }

    // Filtrer par terme de recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        (order.order_number?.toLowerCase().includes(searchLower)) ||
        (order.customers?.first_name?.toLowerCase().includes(searchLower)) ||
        (order.customers?.last_name?.toLowerCase().includes(searchLower)) ||
        (order.customers?.email?.toLowerCase().includes(searchLower)) ||
        (order.customers?.phone?.toLowerCase().includes(searchLower))
      );
    }

    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Gestion des Commandes</h1>
        <Button className="bg-white text-gray-600 hover:bg-gray-50 border-gray-200 border flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exporter
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Chargement des commandes...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
          <p className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" /> {error}
          </p>
        </div>
      ) : (
        <>
          <OrderStats orders={orders} />
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher une commande..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-40">
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
                  <SelectItem value="Annulée">Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <OrderTable 
            orders={filteredOrders} 
            onStatusChange={handleStatusChange} 
            onViewOrder={handleViewOrder}
            onViewInvoice={handleViewInvoice}
          />
          
          {filteredOrders.length > 0 && (
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Affichage de 1 à {filteredOrders.length} sur {orders.length} commandes
              </p>
            </div>
          )}
        </>
      )}
      
      {/* Modals */}
      <OrderDetailsModal 
        order={selectedOrderForDetails}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
      />
      
      <InvoiceModal 
        order={selectedOrderForInvoice}
        isOpen={isInvoiceModalOpen}
        onClose={handleCloseInvoiceModal}
      />
    </div>
  );
}
