import supabaseClient from '../lib/supabase/client';
import { 
  ReadyCocktail, 
  CocktailContainer, 
  AlcoholDosage, 
  ReadyCocktailVariant,
  ReadyCocktailWithOptions 
} from '../types/supabase';

export class ReadyCocktailsService {
  
  /**
   * Récupère tous les cocktails prêts à boire actifs
   */
  static async getReadyCocktails(options?: {
    category?: string;
    featured?: boolean;
    limit?: number;
  }): Promise<ReadyCocktail[]> {
    try {
      let query = supabaseClient
        .from('ready_cocktails')
        .select('*, categories')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('name', { ascending: true });

      if (options?.category) {
        // Support pour catégories multiples : recherche dans le tableau categories ou dans category (compatibilité)
        query = query.or(`category.eq.${options.category},categories.cs.{${options.category}}`);
      }

      if (options?.featured !== undefined) {
        query = query.eq('is_featured', options.featured);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erreur lors de la récupération des cocktails:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur ReadyCocktailsService.getReadyCocktails:', error);
      throw error;
    }
  }

  /**
   * Récupère un cocktail par son slug avec toutes ses options
   */
  static async getReadyCocktailBySlug(slug: string): Promise<ReadyCocktailWithOptions | null> {
    try {
      // Récupérer le cocktail
      const { data: cocktail, error: cocktailError } = await supabaseClient
        .from('ready_cocktails')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (cocktailError || !cocktail) {
        console.error('Cocktail non trouvé:', cocktailError);
        return null;
      }

      // Récupérer les contenants actifs
      const { data: containers, error: containersError } = await supabaseClient
        .from('cocktail_containers')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (containersError) {
        console.error('Erreur contenants:', containersError);
        throw containersError;
      }

      // Récupérer les dosages actifs
      const { data: dosages, error: dosagesError } = await supabaseClient
        .from('alcohol_dosages')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (dosagesError) {
        console.error('Erreur dosages:', dosagesError);
        throw dosagesError;
      }

      // Récupérer les variantes pour ce cocktail
      const { data: variants, error: variantsError } = await supabaseClient
        .from('ready_cocktail_variants')
        .select(`
          *,
          cocktail:ready_cocktails(*),
          container:cocktail_containers(*),
          dosage:alcohol_dosages(*)
        `)
        .eq('cocktail_id', cocktail.id)
        .eq('is_available', true);

      if (variantsError) {
        console.error('Erreur variantes:', variantsError);
        throw variantsError;
      }

      return {
        ...cocktail,
        containers: containers || [],
        dosages: dosages || [],
        variants: variants || []
      };
    } catch (error) {
      console.error('Erreur ReadyCocktailsService.getReadyCocktailBySlug:', error);
      throw error;
    }
  }

  /**
   * Récupère toutes les catégories de cocktails disponibles
   */
  static async getCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabaseClient
        .from('ready_cocktails')
        .select('category')
        .eq('is_active', true)
        .not('category', 'is', null);

      if (error) {
        console.error('Erreur lors de la récupération des catégories:', error);
        throw error;
      }

      // Extraire les catégories uniques
      const categories = [...new Set(data?.map((item: any) => item.category).filter(Boolean))] as string[];
      return categories.sort();
    } catch (error) {
      console.error('Erreur ReadyCocktailsService.getCategories:', error);
      throw error;
    }
  }

  /**
   * Récupère tous les contenants disponibles
   */
  static async getContainers(): Promise<CocktailContainer[]> {
    try {
      const { data, error } = await supabaseClient
        .from('cocktail_containers')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) {
        console.error('Erreur lors de la récupération des contenants:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur ReadyCocktailsService.getContainers:', error);
      throw error;
    }
  }

  /**
   * Récupère tous les dosages disponibles
   */
  static async getDosages(): Promise<AlcoholDosage[]> {
    try {
      const { data, error } = await supabaseClient
        .from('alcohol_dosages')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) {
        console.error('Erreur lors de la récupération des dosages:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur ReadyCocktailsService.getDosages:', error);
      throw error;
    }
  }

  /**
   * Récupère une variante spécifique par IDs
   */
  static async getVariant(
    cocktailId: string, 
    containerId: string, 
    dosageId: string
  ): Promise<ReadyCocktailVariant | null> {
    try {
      const { data, error } = await supabaseClient
        .from('ready_cocktail_variants')
        .select(`
          *,
          cocktail:ready_cocktails(*),
          container:cocktail_containers(*),
          dosage:alcohol_dosages(*)
        `)
        .eq('cocktail_id', cocktailId)
        .eq('container_id', containerId)
        .eq('dosage_id', dosageId)
        .eq('is_available', true)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération de la variante:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erreur ReadyCocktailsService.getVariant:', error);
      throw error;
    }
  }

  /**
   * Recherche de cocktails par nom ou ingrédients
   */
  static async searchCocktails(query: string): Promise<ReadyCocktail[]> {
    try {
      const { data, error } = await supabaseClient
        .from('ready_cocktails')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${query}%, description.ilike.%${query}%, flavor_profile.ilike.%${query}%`)
        .order('is_featured', { ascending: false })
        .order('name', { ascending: true });

      if (error) {
        console.error('Erreur lors de la recherche:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur ReadyCocktailsService.searchCocktails:', error);
      throw error;
    }
  }
}
