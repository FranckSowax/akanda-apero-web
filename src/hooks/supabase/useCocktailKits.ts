import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMcpPolyfill } from '../../lib/mcp-polyfill';
import { CocktailKit, CocktailKitIngredient } from '../../types/supabase';
import { slugify } from '../../lib/utils/formatters';

// Type pour la création et la modification de kit cocktail avec ingrédients
type CocktailKitFormData = {
  kit: Partial<CocktailKit>;
  ingredients?: Partial<CocktailKitIngredient>[];
};

export function useCocktailKits() {
  const queryClient = useQueryClient();
  const mcp = useMcpPolyfill('supabase');
  
  // Récupérer tous les kits cocktails
  const getCocktailKits = () => {
    return useQuery({
      queryKey: ['cocktail-kits'],
      queryFn: async () => {
        const data = await mcp.read('cocktail-kits');
        return data;
      }
    });
  };
  
  // Hook React Query pour récupérer un kit cocktail par ID
  const useGetCocktailKitById = (id: string) => {
    return useQuery({
      queryKey: ['cocktail-kits', id],
      queryFn: async () => {
        const kits = await mcp.read('cocktail-kits');
        return kits.find(kit => kit.id === id);
      },
      enabled: !!id
    });
  };
  
  // Fonction pour récupérer directement un kit par son ID (sans hook)
  const getCocktailKitById = async (id: string) => {
    try {
      const kits = await mcp.read('cocktail-kits');
      return { data: kits.find(kit => kit.id === id), error: null };
    } catch (error) {
      console.error(`Erreur lors de la récupération du kit ${id}:`, error);
      return { data: null, error };
    }
  };

  // Créer un nouveau kit cocktail
  const createCocktailKit = useMutation({
    mutationFn: async (kitData: CocktailKitFormData) => {
      return mcp.create('cocktail-kits').mutateAsync(kitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cocktail-kits'] });
    }
  });
  
  // Mettre à jour un kit cocktail
  const updateCocktailKit = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: CocktailKitFormData }) => {
      return mcp.update('cocktail-kits').mutateAsync({ id, ...formData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cocktail-kits'] });
    }
  });

  // Supprimer un kit cocktail
  const deleteCocktailKit = useMutation({
    mutationFn: async (id: string) => {
      await mcp.delete('cocktail-kits').mutateAsync(id);
      // Retourner simplement l'ID pour maintenir la compatibilité avec les types attendus
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cocktail-kits'] });
    }
  });

  return {
    getCocktailKits,
    useGetCocktailKitById,
    getCocktailKitById,
    createCocktailKit,
    updateCocktailKit,
    deleteCocktailKit,
  };
}
