import { api } from '../lib/api-utils';
import { Category, ApiResponse } from '../lib/types';

// Service pour la gestion des catégories
const CategoryService = {
  // Récupérer toutes les catégories
  getCategories: () => {
    return api.get<Category[]>(`/categories`);
  },

  // Récupérer une catégorie par son ID
  getCategoryById: (id: number) => {
    return api.get<Category>(`/categories/${id}`);
  },

  // Créer une nouvelle catégorie
  createCategory: (category: Omit<Category, 'id' | 'productCount' | 'createdAt' | 'updatedAt'>) => {
    return api.post<Category>('/categories', category);
  },

  // Mettre à jour une catégorie existante
  updateCategory: (id: number, category: Partial<Category>) => {
    return api.put<Category>(`/categories/${id}`, category);
  },

  // Supprimer une catégorie
  deleteCategory: (id: number) => {
    return api.delete<{ success: boolean }>(`/categories/${id}`);
  },

  // Récupérer les statistiques des catégories (nombre de produits par catégorie)
  getCategoryStats: () => {
    return api.get<{ id: number; name: string; count: number }[]>('/categories/stats');
  },
};

export default CategoryService;
