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
        const { data, error } = await mcp.getById('products', id);
        if (error) throw error;
        return data;
      },
      enabled: !!id
    });
  };

  // Récupérer des produits en rapport (de la même catégorie)
  const getRelatedProducts = (categoryId: string, currentProductId: string) => {
    return useQuery({
      queryKey: ['related-products', categoryId, currentProductId],
      queryFn: async () => {
        const { data: allProducts, error } = await mcp.read('products');
        if (error) throw error;
        
        // Filtrer pour ne retourner que les produits de la même catégorie, sauf le produit courant
        return allProducts ? 
          allProducts.filter((product: Product) => 
            product.id !== currentProductId && 
            product.product_categories && 
            product.product_categories.some(pc => pc.category_id === categoryId)
          ).slice(0, 4) : // limiter à 4 produits en rapport
          [];
      },
      enabled: !!categoryId && !!currentProductId
    });
  };

  return {
    getProductById,
    getRelatedProducts
  };
}
