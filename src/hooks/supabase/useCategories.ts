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
        try {
          // Utiliser read pour obtenir toutes les catégories puis filtrer par ID
          const categories = await mcp.read('categories');
          const category = categories.find((cat: Category) => cat.id === id);
          if (!category) {
            throw new Error(`Catégorie avec ID ${id} non trouvée`);
          }
          return category;
        } catch (error) {
          console.error(`Erreur lors de la récupération de la catégorie ${id}:`, error);
          throw error;
        }
      },
      enabled: !!id
    });
  };

  // Créer une nouvelle catégorie
  const createCategory = useMutation({
    mutationFn: async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        const result = await mcp.create('categories', category);
        return result;
      } catch (error) {
        console.error('Erreur lors de la création de la catégorie:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });

  // Mettre à jour une catégorie
  const updateCategory = useMutation({
    mutationFn: async (params: { id: string; category: Partial<Category> }) => {
      try {
        const { id, category } = params;
        const result = await mcp.update('categories', id, category);
        return result;
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la catégorie:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });

  // Supprimer une catégorie
  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      try {
        await mcp.delete('categories', id);
        return id;
      } catch (error) {
        console.error(`Erreur lors de la suppression de la catégorie ${id}:`, error);
        throw error;
      }
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
