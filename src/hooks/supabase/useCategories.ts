import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMcpPolyfill } from '../../lib/mcp-polyfill';
import { Category } from '../../types/supabase';

export function useCategories() {
  const queryClient = useQueryClient();
  const mcp = useMcpPolyfill('supabase');

  // Récupérer toutes les catégories
  const getCategories = () => {
    return useQuery({
      queryKey: ['categories'],
      queryFn: async () => {
        try {
          const categories = await mcp.read('categories');
          return categories;
        } catch (error) {
          console.error('Erreur lors de la récupération des catégories:', error);
          // En cas d'erreur, retourner un tableau vide
          return [];
        }
      }
    });
  };

  // Récupérer une catégorie par son ID
  const getCategoryById = (id: string) => {
    return useQuery({
      queryKey: ['categories', id],
      queryFn: async () => {
        const { data, error } = await mcp.getById('categories', id);
        if (error) throw error;
        return data;
      },
      enabled: !!id
    });
  };

  // Créer une nouvelle catégorie
  const createCategory = useMutation({
    mutationFn: async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
      return mcp.create('categories').mutateAsync(category);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });

  // Mettre à jour une catégorie
  const updateCategory = useMutation({
    mutationFn: async ({ id, category }: { id: string; category: Partial<Category> }) => {
      return mcp.update('categories').mutateAsync({ id, ...category });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });

  // Supprimer une catégorie
  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      await mcp.delete('categories').mutateAsync(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });

  return {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
  };
}
