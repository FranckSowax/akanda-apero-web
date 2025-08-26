import { api } from '../lib/api-utils';
import { Order, ApiResponse } from '../lib/types';

// Service pour la gestion des commandes
const OrderService = {
  // Récupérer toutes les commandes avec pagination et filtres optionnels
  getOrders: (page = 1, limit = 20, filters = {}) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    return api.get<Order[]>(`/orders?${queryParams.toString()}`);
  },

  // Récupérer une commande par son ID
  getOrderById: (id: string) => {
    return api.get<Order>(`/orders/${id}`);
  },

  // Créer une nouvelle commande
  createOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    return api.post<Order>('/orders', order);
  },

  // Mettre à jour une commande existante
  updateOrder: (id: string, order: Partial<Order>) => {
    return api.put<Order>(`/orders/${id}`, order);
  },

  // Mettre à jour le statut d'une commande
  updateOrderStatus: (id: string, status: Order['status']) => {
    return api.patch<Order>(`/orders/${id}/status`, { status });
  },

  // Mettre à jour le statut de paiement d'une commande
  updatePaymentStatus: (id: string, paymentStatus: Order['paymentStatus']) => {
    return api.patch<Order>(`/orders/${id}/payment-status`, { paymentStatus });
  },

  // Annuler une commande
  cancelOrder: (id: string, reason?: string) => {
    return api.patch<Order>(`/orders/${id}/cancel`, { reason });
  },

  // Récupérer les commandes d'un client
  getOrdersByCustomer: (customerId: number) => {
    return api.get<Order[]>(`/orders/customer/${customerId}`);
  },

  // Récupérer les statistiques des commandes
  getOrderStats: (period: 'day' | 'week' | 'month' | 'year' = 'day') => {
    return api.get<{
      totalOrders: number;
      totalRevenue: number;
      avgOrderValue: number;
      ordersByStatus: Record<Order['status'], number>;
    }>(`/orders/stats?period=${period}`);
  },

  // Générer la facture d'une commande (PDF)
  generateInvoice: (id: string) => {
    return api.get<{ url: string }>(`/orders/${id}/invoice`);
  }
};

export default OrderService;
