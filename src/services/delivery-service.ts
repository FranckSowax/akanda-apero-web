import { api } from '../lib/api-utils';
import { Delivery, DeliveryPerson, ApiResponse } from '../lib/types';

// Service pour la gestion des livraisons
const DeliveryService = {
  // Récupérer toutes les livraisons avec filtres optionnels
  getDeliveries: (filters = {}) => {
    const queryParams = new URLSearchParams(filters as Record<string, string>);
    return api.get<Delivery[]>(`/delivery?${queryParams.toString()}`);
  },

  // Récupérer une livraison par son ID
  getDeliveryById: (id: number) => {
    return api.get<Delivery>(`/delivery/${id}`);
  },

  // Mettre à jour le statut d'une livraison
  updateDeliveryStatus: (id: number, status: Delivery['status']) => {
    return api.patch<Delivery>(`/delivery/${id}/status`, { status });
  },

  // Assigner une livraison à un livreur
  assignDelivery: (id: number, deliveryPersonId: number) => {
    return api.patch<Delivery>(`/delivery/${id}/assign`, { deliveryPersonId });
  },

  // Marquer une livraison comme livrée
  completeDelivery: (id: number, actualDelivery: string) => {
    return api.patch<Delivery>(`/delivery/${id}/complete`, { actualDelivery });
  },

  // Signaler un problème de livraison
  reportDeliveryIssue: (id: number, issue: string) => {
    return api.patch<Delivery>(`/delivery/${id}/issue`, { issue });
  },

  // Récupérer tous les livreurs
  getDeliveryPersons: () => {
    return api.get<DeliveryPerson[]>('/delivery/persons');
  },

  // Récupérer un livreur par son ID
  getDeliveryPersonById: (id: number) => {
    return api.get<DeliveryPerson>(`/delivery/persons/${id}`);
  },

  // Créer un nouveau livreur
  createDeliveryPerson: (person: Omit<DeliveryPerson, 'id' | 'activeDeliveries' | 'totalDeliveries' | 'createdAt' | 'updatedAt'>) => {
    return api.post<DeliveryPerson>('/delivery/persons', person);
  },

  // Mettre à jour un livreur existant
  updateDeliveryPerson: (id: number, person: Partial<DeliveryPerson>) => {
    return api.put<DeliveryPerson>(`/delivery/persons/${id}`, person);
  },

  // Mettre à jour le statut d'un livreur
  updateDeliveryPersonStatus: (id: number, status: DeliveryPerson['status']) => {
    return api.patch<DeliveryPerson>(`/delivery/persons/${id}/status`, { status });
  },

  // Récupérer les livraisons actives d'un livreur
  getDeliveryPersonActiveDeliveries: (id: number) => {
    return api.get<Delivery[]>(`/delivery/persons/${id}/active-deliveries`);
  },

  // Récupérer les statistiques des livraisons
  getDeliveryStats: (period: 'day' | 'week' | 'month' = 'day') => {
    return api.get<{
      totalDeliveries: number;
      completedDeliveries: number;
      averageDeliveryTime: number;
      deliveriesByStatus: Record<Delivery['status'], number>;
    }>(`/delivery/stats?period=${period}`);
  }
};

export default DeliveryService;
