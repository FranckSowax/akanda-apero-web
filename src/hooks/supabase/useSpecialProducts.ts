import { useQuery } from '@tanstack/react-query';
import { useMcpPolyfill } from '../../lib/mcp-polyfill';
import { Product } from '../../types/supabase';

// Type d'assistance pour accéder de façon sécurisée aux catégories
type ProductCategoryJoin = {
  category_id: string;
  categories?: {
    id: string;
    name: string;
    slug: string;
  };
};

export function useSpecialProducts() {
  const mcp = useMcpPolyfill('supabase');

  // Récupérer les produits de type cocktail
  const getCocktails = () => {
    return useQuery({
      queryKey: ['cocktails'],
      queryFn: async () => {
        try {
          // La fonction mcp.read retourne directement un tableau de produits
          const products = await mcp.read('products') as Product[];
          
          // Filtrer pour ne retourner que les produits de la catégorie "cocktails"
          // Note: Nous supposons qu'il existe une catégorie avec le slug "cocktails"
          return products ? 
            products.filter((product: Product) => 
              product.product_categories && 
              product.product_categories.some((pc: ProductCategoryJoin) => 
                pc.categories && (pc.categories.slug === 'cocktails' || pc.categories.name.toLowerCase().includes('cocktail'))
              )
            ) : 
            [];
        } catch (error) {
          console.error('Error fetching cocktails:', error);
          throw error;
        }
      }
    });
  };

  // Récupérer les produits de type kit football
  const getFootballKits = () => {
    return useQuery({
      queryKey: ['football-kits'],
      queryFn: async () => {
        try {
          // La fonction mcp.read retourne directement un tableau de produits
          const products = await mcp.read('products') as Product[];
          
          // Filtrer pour ne retourner que les produits de la catégorie "kits football"
          // Note: Nous supposons qu'il existe une catégorie avec le slug "football" ou contenant "football" dans le nom
          return products ? 
            products.filter((product: Product) => 
              product.product_categories && 
              product.product_categories.some((pc: ProductCategoryJoin) => 
                pc.categories && (
                  pc.categories.slug === 'football-kits' || 
                  pc.categories.name.toLowerCase().includes('football') ||
                  pc.categories.name.toLowerCase().includes('match')
                )
              )
            ) : 
            [];
        } catch (error) {
          console.error('Error fetching football kits:', error);
          throw error;
        }
      }
    });
  };

  // Récupérer des produits par tags ou attributs spécifiques
  const getProductsByTag = (tag: string) => {
    return useQuery({
      queryKey: ['products-by-tag', tag],
      queryFn: async () => {
        try {
          // La fonction mcp.read retourne directement un tableau de produits
          const products = await mcp.read('products') as Product[];
          
          // Filtrer selon le tag demandé (cette logique pourrait être adaptée selon la structure réelle des données)
          // Pour l'instant nous filtrons simplement sur le nom ou la description contenant le tag
          return products ? 
            products.filter((product: Product) => 
              product.name.toLowerCase().includes(tag.toLowerCase()) || 
              (product.description && product.description.toLowerCase().includes(tag.toLowerCase()))
            ) : 
            [];
        } catch (error) {
          console.error(`Error fetching products with tag ${tag}:`, error);
          throw error;
        }
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
