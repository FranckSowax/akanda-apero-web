import { useQuery } from '@tanstack/react-query';
import { useMcpPolyfill } from '../../lib/mcp-polyfill';
import { Product } from '../../types/supabase';

export function useSpecialProducts() {
  const mcp = useMcpPolyfill('supabase');

  // Récupérer les produits de type cocktail
  const getCocktails = () => {
    return useQuery({
      queryKey: ['cocktails'],
      queryFn: async () => {
        const { data: allProducts, error } = await mcp.read('products');
        if (error) throw error;
        
        // Filtrer pour ne retourner que les produits de la catégorie "cocktails"
        // Note: Nous supposons qu'il existe une catégorie avec le slug "cocktails"
        return allProducts ? 
          allProducts.filter((product: Product) => 
            product.product_categories && 
            product.product_categories.some(pc => 
              pc.category && (pc.category.slug === 'cocktails' || pc.category.name.toLowerCase().includes('cocktail'))
            )
          ) : 
          [];
      }
    });
  };

  // Récupérer les produits de type kit football
  const getFootballKits = () => {
    return useQuery({
      queryKey: ['football-kits'],
      queryFn: async () => {
        const { data: allProducts, error } = await mcp.read('products');
        if (error) throw error;
        
        // Filtrer pour ne retourner que les produits de la catégorie "kits football"
        // Note: Nous supposons qu'il existe une catégorie avec le slug "football" ou contenant "football" dans le nom
        return allProducts ? 
          allProducts.filter((product: Product) => 
            product.product_categories && 
            product.product_categories.some(pc => 
              pc.category && (
                pc.category.slug === 'football-kits' || 
                pc.category.name.toLowerCase().includes('football') ||
                pc.category.name.toLowerCase().includes('match')
              )
            )
          ) : 
          [];
      }
    });
  };

  // Récupérer des produits par tags ou attributs spécifiques
  const getProductsByTag = (tag: string) => {
    return useQuery({
      queryKey: ['products-by-tag', tag],
      queryFn: async () => {
        const { data: allProducts, error } = await mcp.read('products');
        if (error) throw error;
        
        // Filtrer selon le tag demandé (cette logique pourrait être adaptée selon la structure réelle des données)
        // Pour l'instant nous filtrons simplement sur le nom ou la description contenant le tag
        return allProducts ? 
          allProducts.filter((product: Product) => 
            product.name.toLowerCase().includes(tag.toLowerCase()) || 
            (product.description && product.description.toLowerCase().includes(tag.toLowerCase()))
          ) : 
          [];
      },
      enabled: !!tag
    });
  };

  return {
    getCocktails,
    getFootballKits,
    getProductsByTag
  };
}
