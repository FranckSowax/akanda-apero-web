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
  FileText,
  ChefHat,
  MapPin
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
import OrderPreparationModal from '../../../components/admin/OrderPreparationModal';
import InvoiceModal from '../../../components/admin/InvoiceModal';
import ReportProblemModal from '../../../components/ReportProblemModal';
import { Order } from '../../../types/supabase';
// Import WhatsApp supprimé - géré automatiquement par l'API

// Statut des commandes avec leur couleur et icône respectifs
const orderStatuses: Record<string, { color: string; icon: React.ReactNode }> = {
  'Nouvelle': { color: 'bg-fuchsia-100 text-fuchsia-800', icon: <AlertCircle className="h-4 w-4" /> },
  'En préparation': { color: 'bg-orange-100 text-orange-800', icon: <Package className="h-4 w-4" /> },
  'Prête': { color: 'bg-yellow-100 text-yellow-800', icon: <ShoppingBag className="h-4 w-4" /> },
  'En livraison': { color: 'bg-blue-100 text-blue-800', icon: <Truck className="h-4 w-4" /> },
  'Livrée': { color: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="h-4 w-4" /> },
  'Retardée': { color: 'bg-red-100 text-red-800', icon: <Clock className="h-4 w-4" /> },
  'Annulée': { color: 'bg-gray-100 text-gray-800', icon: <AlertCircle className="h-4 w-4" /> },
};

// Fonction utilitaire pour déterminer automatiquement le statut de paiement
const getPaymentStatus = (paymentMethod: string, orderStatus: string): string => {
  // Si le mode de paiement est mobile money ou carte bancaire, le paiement est immédiatement "Payé"
  if (paymentMethod === 'mobile_money' || paymentMethod === 'card') {
    return 'Payé';
  }
  
  // Si le mode de paiement est "paiement à la livraison"
  if (paymentMethod === 'cash') {
    // Si la commande est livrée, alors le paiement est "Payé"
    if (orderStatus === 'Livrée') {
      return 'Payé';
    }
    // Sinon, le paiement reste "En attente"
    return 'En attente';
  }
  
  // Par défaut, en attente
  return 'En attente';
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

// Composant pour le statut de paiement
const PaymentStatusBadge = ({ paymentMethod, orderStatus, paymentStatus }: { 
  paymentMethod: string, 
  orderStatus: string,
  paymentStatus?: string 
}) => {
  // Calculer automatiquement le statut de paiement selon les règles métier
  const calculatedStatus = getPaymentStatus(paymentMethod, orderStatus);
  
  // Utiliser le statut calculé ou celui fourni en fallback
  const finalStatus = calculatedStatus;
  
  const isPayé = finalStatus === 'Payé';
  
  return (
    <Badge className={isPayé ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
      {finalStatus}
    </Badge>
  );
};

// Fonction pour obtenir le nom de l'option de livraison
const getDeliveryOptionName = (option: string) => {
  switch (option) {
    case 'pickup':
      return 'Retrait au Shop';
    case 'standard':
      return 'Livraison Standard';
    case 'express':
      return 'Livraison Express';
    case 'night':
      return 'Livraison Nuit';
    default:
      return 'Livraison';
  }
};

// Fonction pour obtenir les couleurs de l'option de livraison
const getDeliveryOptionColor = (option: string) => {
  switch (option) {
    case 'pickup':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'standard':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'express':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'night':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Fonction pour obtenir l'icône de l'option de livraison
const getDeliveryOptionIcon = (option: string) => {
  switch (option) {
    case 'pickup':
      return '🏪';
    case 'standard':
      return '🚚';
    case 'express':
      return '⚡';
    case 'night':
      return '🌙';
    default:
      return '📦';
  }
};

// Tableau des commandes
const OrderTable = ({ orders, onStatusChange, onViewOrder, onViewInvoice, onViewPreparation, onReportProblem }: { 
  orders: any[],
  onStatusChange: (orderId: string, status: string) => void,
  onViewOrder: (orderId: string) => void,
  onViewInvoice: (orderId: string) => void,
  onViewPreparation: (orderId: string) => void,
  onReportProblem: (orderId: string) => void
}) => {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const toggleDropdown = (orderId: string) => {
    setOpenDropdownId(openDropdownId === orderId ? null : orderId);
  };

  const closeDropdown = () => {
    setOpenDropdownId(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId) {
        const target = event.target as Element;
        if (!target.closest('.custom-dropdown')) {
          closeDropdown();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId]);
  if (orders.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
        <p className="text-gray-500">Aucune commande trouvée</p>
      </div>
    );
  }
  
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full table-fixed divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="w-32 px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Commande
            </th>
            <th scope="col" className="w-28 px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="w-48 px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Client
            </th>
            <th scope="col" className="w-24 px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th scope="col" className="w-36 px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th scope="col" className="w-28 px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Paiement
            </th>
            <th scope="col" className="w-64 px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Livraison
            </th>
            <th scope="col" className="w-32 px-4 py-3.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="w-32 px-4 py-4 whitespace-nowrap overflow-hidden">
                <Link href={`/admin/orders/${order.id}`} className="text-[#f5a623] hover:underline font-medium text-sm">
                  #{order.order_number || order.id.slice(0, 6)}
                </Link>
              </td>
              <td className="w-28 px-4 py-4 whitespace-nowrap text-xs text-gray-500 overflow-hidden">
                {order.formatted_date || new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
              </td>
              <td className="w-48 px-4 py-4 overflow-hidden">
                <div className="flex items-center">
                  <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-700 flex-shrink-0">
                    {order.customers ? 
                      `${order.customers.first_name?.[0] || ''}${order.customers.last_name?.[0] || ''}` 
                      : '??'}
                  </div>
                  <div className="ml-2 min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {order.customers ? 
                        `${order.customers.first_name || ''} ${order.customers.last_name || ''}` 
                        : 'Client inconnu'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{order.customers?.phone || ''}</p>
                  </div>
                </div>
              </td>
              <td className="w-24 px-4 py-4 whitespace-nowrap text-sm font-medium overflow-hidden">
                <div className="truncate">
                  {order.total_formatted || `${order.total_amount || 0} XAF`}
                </div>
              </td>
              <td className="w-36 px-4 py-4 whitespace-nowrap overflow-hidden">
                <OrderStatusBadge status={order.status || 'Nouvelle'} />
              </td>
              <td className="w-28 px-4 py-4 whitespace-nowrap overflow-hidden">
                <PaymentStatusBadge 
                  paymentMethod={order.payment_method || 'cash'}
                  orderStatus={order.status || 'Nouvelle'}
                  paymentStatus={order.payment_status}
                />
              </td>
              <td className="w-64 px-4 py-4 overflow-hidden">
                <div className="flex flex-wrap items-center gap-1">
                  {/* Type de livraison */}
                  <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getDeliveryOptionColor(order.delivery_option || 'standard')}`}>
                    <span className="mr-1">{getDeliveryOptionIcon(order.delivery_option || 'standard')}</span>
                    <span className="truncate">{getDeliveryOptionName(order.delivery_option || 'standard')}</span>
                  </div>
                  
                  {/* Quartier */}
                  {order.delivery_district && (
                    <span className="text-xs text-gray-600 truncate">
                      {order.delivery_district}
                    </span>
                  )}
                  
                  {/* Lien Waze uniquement */}
                  {(order.gps_latitude && order.gps_longitude) && (
                    <a 
                      href={`https://waze.com/ul?ll=${order.gps_latitude},${order.gps_longitude}&navigate=yes`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <MapPin className="mr-1 h-3 w-3" />
                      <span className="truncate">Waze</span>
                    </a>
                  )}
                  
                  {/* Message si pas de GPS pour la livraison */}
                  {(order.delivery_option !== 'pickup' && (!order.gps_latitude || !order.gps_longitude)) && (
                    <span className="text-xs text-gray-400">GPS non renseigné</span>
                  )}
                </div>
              </td>
              <td className="w-32 px-4 py-4 whitespace-nowrap text-right text-sm">
                <div className="custom-dropdown relative">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => toggleDropdown(order.id)}
                    aria-haspopup="menu"
                    aria-expanded={openDropdownId === order.id}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                  
                  {openDropdownId === order.id && (
                    <div className="absolute right-0 top-8 z-50 min-w-[12rem] overflow-hidden rounded-md border bg-white p-1 shadow-lg">
                      <div className="px-2 py-1.5 text-sm font-semibold text-gray-900">Actions</div>
                      
                      <button
                        className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-gray-100 focus:bg-gray-100"
                        onClick={() => {
                          onViewOrder(order.id);
                          closeDropdown();
                        }}
                        role="menuitem"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        <span>Voir les détails</span>
                      </button>
                      
                      <button
                        className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm text-[#f5a623] font-medium hover:bg-gray-100 focus:bg-gray-100"
                        onClick={() => {
                          onViewPreparation(order.id);
                          closeDropdown();
                        }}
                        role="menuitem"
                      >
                        <ChefHat className="mr-2 h-4 w-4" />
                        <span>Guide de préparation</span>
                      </button>
                      
                      <div className="my-1 h-px bg-gray-200"></div>
                      
                      <button
                        className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-gray-100 focus:bg-gray-100"
                        onClick={() => {
                          onStatusChange(order.id, 'En préparation');
                          closeDropdown();
                        }}
                        role="menuitem"
                      >
                        <Package className="mr-2 h-4 w-4" />
                        <span>Marquer en préparation</span>
                      </button>
                      
                      <button
                        className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-gray-100 focus:bg-gray-100"
                        onClick={() => {
                          onStatusChange(order.id, 'Prête');
                          closeDropdown();
                        }}
                        role="menuitem"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        <span>Marquer comme prête</span>
                      </button>
                      
                      <button
                        className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-gray-100 focus:bg-gray-100"
                        onClick={() => {
                          onStatusChange(order.id, 'En livraison');
                          closeDropdown();
                        }}
                        role="menuitem"
                      >
                        <Truck className="mr-2 h-4 w-4" />
                        <span>Marquer en livraison</span>
                      </button>
                      
                      <button
                        className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-gray-100 focus:bg-gray-100"
                        onClick={() => {
                          onStatusChange(order.id, 'Livrée');
                          closeDropdown();
                        }}
                        role="menuitem"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        <span>Marquer comme livrée</span>
                      </button>
                      
                      <button
                        className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-gray-100 focus:bg-gray-100"
                        onClick={() => {
                          onViewInvoice(order.id);
                          closeDropdown();
                        }}
                        role="menuitem"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Facture</span>
                      </button>
                      
                      <div className="my-1 h-px bg-gray-200"></div>
                      
                      <button
                        className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm text-red-600 hover:bg-gray-100 focus:bg-gray-100"
                        onClick={() => {
                          onReportProblem(order.id);
                          closeDropdown();
                        }}
                        role="menuitem"
                      >
                        <AlertCircle className="mr-2 h-4 w-4" />
                        <span>Signaler un problème</span>
                      </button>
                    </div>
                  )}
                </div>
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
    { label: 'Nouvelles', value: newOrders, color: 'text-fuchsia-600' },
    { label: 'En préparation', value: processingOrders, color: 'text-orange-600' },
    { label: 'En livraison', value: shippingOrders, color: 'text-blue-600' },
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
  const [selectedOrderForPreparation, setSelectedOrderForPreparation] = useState<any | null>(null);
  const [selectedOrderForProblem, setSelectedOrderForProblem] = useState<any | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false);
  const [isPreparationModalOpen, setIsPreparationModalOpen] = useState<boolean>(false);
  const [isReportProblemModalOpen, setIsReportProblemModalOpen] = useState<boolean>(false);

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

        // Les notifications WhatsApp sont envoyées automatiquement par l'API /api/orders
        // lors de la mise à jour du statut (voir PATCH /api/orders)
        console.log(`✅ Statut mis à jour pour la commande ${order?.order_number || order?.id.slice(0, 8).toUpperCase()}`);
        console.log(`📱 Si le client a un numéro WhatsApp, il recevra automatiquement une notification`);
        
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

  // Gérer l'ouverture du modal de préparation
  const handleViewPreparation = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrderForPreparation(order);
      setIsPreparationModalOpen(true);
    }
  };

  // Gérer l'ouverture du modal de signalement de problème
  const handleReportProblem = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrderForProblem(order);
      setIsReportProblemModalOpen(true);
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

  const handleClosePreparationModal = () => {
    setIsPreparationModalOpen(false);
    setSelectedOrderForPreparation(null);
  };

  const handleCloseReportProblemModal = () => {
    setIsReportProblemModalOpen(false);
    setSelectedOrderForProblem(null);
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
    <div className="w-full max-w-none space-y-6">
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
            onViewPreparation={handleViewPreparation}
            onReportProblem={handleReportProblem}
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
      
      <OrderPreparationModal
        order={selectedOrderForPreparation}
        isOpen={isPreparationModalOpen}
        onClose={handleClosePreparationModal}
      />
      
      {selectedOrderForProblem && (
        <ReportProblemModal
          isOpen={isReportProblemModalOpen}
          onClose={handleCloseReportProblemModal}
          order={{
            id: selectedOrderForProblem.id,
            order_number: selectedOrderForProblem.order_number,
            customer_name: `${selectedOrderForProblem.customers?.first_name || ''} ${selectedOrderForProblem.customers?.last_name || ''}`.trim(),
            customer_email: selectedOrderForProblem.customers?.email,
            customer_phone: selectedOrderForProblem.customers?.phone,
            total_amount: selectedOrderForProblem.total_amount
          }}
          onSuccess={() => {
            // Optionally refresh orders or show success message
            console.log('Problème signalé avec succès');
          }}
        />
      )}
    </div>
  );
}
