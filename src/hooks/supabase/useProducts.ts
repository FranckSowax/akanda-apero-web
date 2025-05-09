import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// Importer notre polyfill au lieu de useMcp
import { useMcpPolyfill } from '../../lib/mcp-polyfill';
import { Product, Category, ProductImage } from '../../types/supabase';

// Type pour la création et la modification de produit avec images et catégories
type ProductFormData = {
  product: Partial<Product>;
  images?: { image_url: string; alt_text?: string }[];
  categories?: string[];
};

export function useProducts() {
  const queryClient = useQueryClient();
  // Utiliser notre polyfill au lieu du client MCP original
  const mcp = useMcpPolyfill('supabase');
  
  // Récupérer tous les produits
  const getProducts = () => {
    return useQuery({
      queryKey: ['products'],
      queryFn: async () => {
        const data = await mcp.read('products');
        return data;
      }
    });
  };
  
  // Récupérer un produit par ID
  const getProductById = (id: string) => {
    return useQuery({
      queryKey: ['products', id],
      queryFn: async () => {
        const products = await mcp.read('products');
        return products.find(product => product.id === id);
      },
      enabled: !!id
    });
  };
  
  // Récupérer toutes les catégories
  const getCategories = () => {
    return useQuery({
      queryKey: ['categories'],
      queryFn: async () => {
        return mcp.read('categories');
      }
    });
  };
  
  // Créer un nouveau produit
  const createProduct = useMutation({
    mutationFn: async (productData: ProductFormData) => {
      return mcp.create('products').mutateAsync(productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
  
  // Mettre à jour un produit
  const updateProduct = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: ProductFormData }) => {
      return mcp.update('products').mutateAsync({ id, ...formData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
  
  // Supprimer un produit
  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      await mcp.delete('products').mutateAsync(id);
      // Retourner simplement l'ID pour maintenir la compatibilité avec les types attendus
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
  
  return {
    getProducts,
    getProductById,
    getCategories,
    createProduct,
    updateProduct,
    deleteProduct
  };
}
