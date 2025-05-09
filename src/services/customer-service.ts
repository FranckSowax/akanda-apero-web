import { api } from '../lib/api-utils';
import { Customer, ApiResponse } from '../lib/types';

// Service pour la gestion des clients
const CustomerService = {
  // Récupérer tous les clients avec pagination et filtres optionnels
  getCustomers: (page = 1, limit = 20, filters = {}) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    return api.get<Customer[]>(`/customers?${queryParams.toString()}`);
  },

  // Récupérer un client par son ID
  getCustomerById: (id: number) => {
    return api.get<Customer>(`/customers/${id}`);
  },

  // Créer un nouveau client
  createCustomer: (customer: Omit<Customer, 'id' | 'totalOrders' | 'totalSpent' | 'loyaltyPoints' | 'createdAt' | 'updatedAt'>) => {
    return api.post<Customer>('/customers', customer);
  },

  // Mettre à jour un client existant
  updateCustomer: (id: number, customer: Partial<Customer>) => {
    return api.put<Customer>(`/customers/${id}`, customer);
  },

  // Supprimer un client
  deleteCustomer: (id: number) => {
    return api.delete<{ success: boolean }>(`/customers/${id}`);
  },
  
  // Mettre à jour le statut d'un client
  updateCustomerStatus: (id: number, status: Customer['status']) => {
    return api.patch<Customer>(`/customers/${id}/status`, { status });
  },

  // Ajouter des points de fidélité à un client
  addLoyaltyPoints: (id: number, points: number) => {
    return api.patch<Customer>(`/customers/${id}/loyalty-points/add`, { points });
  },

  // Échanger des points de fidélité
  redeemLoyaltyPoints: (id: number, points: number, reward: string) => {
    return api.patch<Customer>(`/customers/${id}/loyalty-points/redeem`, { points, reward });
  },

  // Récupérer les clients VIP
  getVIPCustomers: () => {
    return api.get<Customer[]>('/customers/vip');
  },

  // Récupérer les segments de clients
  getCustomerSegments: () => {
    return api.get<{ 
      id: string; 
      name: string; 
      description: string;
      count: number;
      criteria: any;
    }[]>('/customers/segments');
  },

  // Rechercher des clients
  searchCustomers: (query: string) => {
    return api.get<Customer[]>(`/customers/search?q=${encodeURIComponent(query)}`);
  }
};

export default CustomerService;
