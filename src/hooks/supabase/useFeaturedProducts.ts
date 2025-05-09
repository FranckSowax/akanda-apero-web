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
        
        // Filtrer les produits par catégorie
        return allProducts ? allProducts.filter((product: any) => {
          // Vérifier si le produit a des catégories associées
          if (!product.product_categories) {
            return false;
          }
          
          // Les catégories peuvent être sous différentes structures en fonction de l'API utilisée
          return product.product_categories.some((pc: any) => {
            // Si c'est la structure simple (utilisée par l'ancien code)
            if (pc.category_id === categoryId) {
              return true;
            }
            
            // Si c'est la nouvelle structure avec les catégories imbriquées
            if (pc.categories && pc.categories.id === categoryId) {
              return true;
            }
            
            return false;
          });
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
