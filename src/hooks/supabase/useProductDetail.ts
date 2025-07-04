import { useQuery } from '@tanstack/react-query';
import { useMcpPolyfill } from '../../lib/mcp-polyfill';
import { Product } from '../../types/supabase';

export function useProductDetail() {
  const mcp = useMcpPolyfill('supabase');

  // Récupérer un produit par son ID
  const getProductById = (id: string) => {
    return useQuery({
      queryKey: ['product', id],
      queryFn: async () => {
        try {
          // Utiliser read puis filtrer par ID pour éviter les problèmes de typage
          const products = await mcp.read('products');
          const product = products.find((p: Product) => p.id === id);
          
          if (!product) {
            throw new Error(`Produit avec ID ${id} non trouvé`);
          }
          
          return product;
        } catch (error) {
          console.error(`Erreur lors de la récupération du produit ${id}:`, error);
          throw error;
        }
      },
      enabled: !!id
    });
  };

  // Récupérer des produits en rapport (de la même catégorie)
  const getRelatedProducts = (categoryId: string, currentProductId: string) => {
    return useQuery({
      queryKey: ['related-products', categoryId, currentProductId],
      queryFn: async () => {
        try {
          // La fonction mcp.read retourne directement un tableau de produits
          const products = await mcp.read('products') as Product[];
          
          // Filtrer pour ne retourner que les produits de la même catégorie, sauf le produit courant
          return products ? 
            products.filter((product: Product) => 
              product.id !== currentProductId && 
              product.product_categories && 
              product.product_categories.some(pc => pc.category_id === categoryId)
            ).slice(0, 4) : // limiter à 4 produits en rapport
            [];
        } catch (error) {
          console.error('Error fetching related products:', error);
          throw error;
        }
      },
      enabled: !!categoryId && !!currentProductId
    });
  };

  return {
    getProductById,
    getRelatedProducts
  };
}
