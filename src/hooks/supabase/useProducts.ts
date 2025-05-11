import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMcpPolyfill } from '../../lib/mcp-polyfill';
import { Product, Category, ProductImage } from '../../types/supabase';

type ProductFormData = {
  product: Partial<Product>;
  images?: { image_url: string; alt_text?: string }[];
  categories?: string[];
};

export function useProducts() {
  const queryClient = useQueryClient();
  const mcp = useMcpPolyfill('supabase');
  const getProducts = () => {
    return useQuery({
      queryKey: ['products'],
      queryFn: async () => {
        const data = await mcp.read('products');
        return data;
      }
    });
  };
  

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
  

  const getCategories = () => {
    return useQuery({
      queryKey: ['categories'],
      queryFn: async () => {
        return mcp.read('categories');
      }
    });
  };
  

  const createProduct = useMutation({
    mutationFn: async (productData: ProductFormData) => {
      return mcp.create('products').mutateAsync(productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
  

  const updateProduct = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: ProductFormData }) => {
      try {
        // Fournir l'id en tant que second argument pour la fonction update
        const result = await mcp.update('products', id).mutateAsync(formData);
        return result;
      } catch (error) {
        console.error(`Erreur lors de la mise à jour du produit ${id}:`, error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
  

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      try {
        // Fournir l'id en tant que second argument pour la fonction delete
        await mcp.delete('products', id).mutateAsync();
        return id;
      } catch (error) {
        console.error(`Erreur lors de la suppression du produit ${id}:`, error);
        throw error;
      }
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
