import { useQuery } from '@tanstack/react-query';
import { useMcpPolyfill } from '../../lib/mcp-polyfill';
import { Product } from '../../types/supabase';

export function useFeaturedProducts() {
  const mcp = useMcpPolyfill('supabase');
  
  // Récupérer tous les produits mis en vedette
  const getFeaturedProducts = () => {
    return useQuery({
      queryKey: ['featured-products'],
      queryFn: async () => {
        try {
          const products = await mcp.read('products');
          
          // Filtrer pour ne retourner que les produits mis en vedette
          return products ? products.filter((product: any) => product.is_featured) : [];
        } catch (error) {
          console.error('Erreur lors de la récupération des produits en vedette:', error);
          return [];
        }
      }
    });
  };
  
  // Récupérer les produits par catégorie
  const getProductsByCategory = (categoryId: string | null) => {
    return useQuery({
      queryKey: ['products-by-category', categoryId],
      queryFn: async () => {
        try {
          const allProducts = await mcp.read('products');
          
          if (!categoryId || categoryId === 'bestseller') {
            // Retourner les produits mis en vedette si la catégorie est "bestseller" ou non spécifiée
            return allProducts ? allProducts.filter((product: any) => product.is_featured) : [];
          }
        
        // Filtrer les produits par catégorie - Version corrigée pour utiliser product_categories
        return allProducts ? allProducts.filter((product: any) => {
          // Vérifier si le produit a des catégories associées
          if (product.product_categories && Array.isArray(product.product_categories)) {
            // Chercher si l'une des catégories correspond à l'ID fourni
            return product.product_categories.some((categoryRelation: any) => {
              return categoryRelation.category_id === categoryId;
            });
          }
          return false;
        }) : [];
      } catch (error) {
        console.error('Erreur lors de la récupération des produits par catégorie:', error);
        return [];
      }
      },
      enabled: !!categoryId
    });
  };
  
  return {
    getFeaturedProducts,
    getProductsByCategory
  };
}
