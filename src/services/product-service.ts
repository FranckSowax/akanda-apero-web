import { api } from '../lib/api-utils';
import { Product, ApiResponse } from '../lib/types';

// Service pour la gestion des produits
const ProductService = {
  // Récupérer tous les produits avec pagination et filtres optionnels
  getProducts: (page = 1, limit = 20, filters = {}) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    return api.get<Product[]>(`/products?${queryParams.toString()}`);
  },

  // Récupérer un produit par son ID
  getProductById: (id: string) => {
    return api.get<Product>(`/products/${id}`);
  },

  // Créer un nouveau produit
  createProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    return api.post<Product>('/products', product);
  },

  // Mettre à jour un produit existant
  updateProduct: (id: string, product: Partial<Product>) => {
    return api.put<Product>(`/products/${id}`, product);
  },

  // Supprimer un produit
  deleteProduct: (id: string) => {
    return api.delete<{ success: boolean }>(`/products/${id}`);
  },

  // Mettre à jour le stock d'un produit
  updateStock: (id: string, stock: number) => {
    return api.patch<Product>(`/products/${id}/stock`, { stock });
  },

  // Récupérer les produits en rupture de stock ou à stock faible
  getLowStockProducts: () => {
    return api.get<Product[]>('/products/low-stock');
  },

  // Récupérer les produits par catégorie
  getProductsByCategory: (categoryId: string) => {
    return api.get<Product[]>(`/products/category/${categoryId}`);
  }
};

export default ProductService;
