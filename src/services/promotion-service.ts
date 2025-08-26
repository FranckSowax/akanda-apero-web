import { api } from '../lib/api-utils';
import { Promotion, ApiResponse } from '../lib/types';

// Service pour la gestion des promotions
const PromotionService = {
  // Récupérer toutes les promotions avec filtres optionnels
  getPromotions: (filters = {}) => {
    const queryParams = new URLSearchParams(filters as Record<string, string>);
    return api.get<Promotion[]>(`/promotions?${queryParams.toString()}`);
  },

  // Récupérer une promotion par son ID
  getPromotionById: (id: number) => {
    return api.get<Promotion>(`/promotions/${id}`);
  },

  // Créer une nouvelle promotion
  createPromotion: (promotion: Omit<Promotion, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>) => {
    return api.post<Promotion>('/promotions', promotion);
  },

  // Mettre à jour une promotion existante
  updatePromotion: (id: number, promotion: Partial<Promotion>) => {
    return api.put<Promotion>(`/promotions/${id}`, promotion);
  },

  // Supprimer une promotion
  deletePromotion: (id: number) => {
    return api.delete<{ success: boolean }>(`/promotions/${id}`);
  },

  // Activer une promotion
  activatePromotion: (id: number) => {
    return api.patch<Promotion>(`/promotions/${id}/activate`, {});
  },

  // Désactiver une promotion
  deactivatePromotion: (id: number) => {
    return api.patch<Promotion>(`/promotions/${id}/deactivate`, {});
  },

  // Vérifier la validité d'un code promo
  validatePromoCode: (code: string, total: number) => {
    return api.post<{
      valid: boolean;
      promotion?: Promotion;
      discount?: number;
      message?: string;
    }>('/promotions/validate', { code, total });
  },

  // Récupérer les statistiques d'utilisation des promotions
  getPromotionStats: (id?: number) => {
    const endpoint = id ? `/promotions/${id}/stats` : '/promotions/stats';
    return api.get<{
      totalUsage: number;
      revenue: number;
      avgDiscount: number;
      topPromotions?: { id: number; name: string; usage: number }[];
    }>(endpoint);
  }
};

export default PromotionService;
