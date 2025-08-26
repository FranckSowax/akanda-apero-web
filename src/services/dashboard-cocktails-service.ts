import { supabase } from '../lib/supabase/client';
import { ReadyCocktail, CocktailContainer, AlcoholDosage } from '../types/supabase';

export class DashboardCocktailsService {
  
  // ===== COCKTAILS =====
  
  /**
   * Récupère tous les cocktails pour le dashboard
   */
  static async getAllCocktails(): Promise<ReadyCocktail[]> {
    try {
      const { data, error } = await supabase
        .from('ready_cocktails')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des cocktails:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur DashboardCocktailsService.getAllCocktails:', error);
      throw error;
    }
  }

  /**
   * Crée un nouveau cocktail
   */
  static async createCocktail(cocktail: Partial<ReadyCocktail>): Promise<ReadyCocktail> {
    try {
      const { data, error } = await supabase
        .from('ready_cocktails')
        .insert([{
          ...cocktail,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création du cocktail:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur DashboardCocktailsService.createCocktail:', error);
      throw error;
    }
  }

  /**
   * Met à jour un cocktail existant
   */
  static async updateCocktail(id: string, cocktail: Partial<ReadyCocktail>): Promise<ReadyCocktail> {
    try {
      const { data, error } = await supabase
        .from('ready_cocktails')
        .update({
          ...cocktail,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour du cocktail:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur DashboardCocktailsService.updateCocktail:', error);
      throw error;
    }
  }

  /**
   * Supprime un cocktail
   */
  static async deleteCocktail(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('ready_cocktails')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la suppression du cocktail:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur DashboardCocktailsService.deleteCocktail:', error);
      throw error;
    }
  }

  // ===== CONTENANTS =====
  
  /**
   * Récupère tous les contenants
   */
  static async getAllContainers(): Promise<CocktailContainer[]> {
    try {
      const { data, error } = await supabase
        .from('cocktail_containers')
        .select('*')
        .order('sort_order');

      if (error) {
        console.error('Erreur lors de la récupération des contenants:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur DashboardCocktailsService.getAllContainers:', error);
      throw error;
    }
  }

  /**
   * Crée un nouveau contenant
   */
  static async createContainer(container: Partial<CocktailContainer>): Promise<CocktailContainer> {
    try {
      const { data, error } = await supabase
        .from('cocktail_containers')
        .insert([{
          ...container,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création du contenant:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur DashboardCocktailsService.createContainer:', error);
      throw error;
    }
  }

  /**
   * Met à jour un contenant existant
   */
  static async updateContainer(id: string, container: Partial<CocktailContainer>): Promise<CocktailContainer> {
    try {
      const { data, error } = await supabase
        .from('cocktail_containers')
        .update({
          ...container,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour du contenant:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur DashboardCocktailsService.updateContainer:', error);
      throw error;
    }
  }

  /**
   * Supprime un contenant
   */
  static async deleteContainer(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('cocktail_containers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la suppression du contenant:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur DashboardCocktailsService.deleteContainer:', error);
      throw error;
    }
  }

  // ===== DOSAGES =====
  
  /**
   * Récupère tous les dosages
   */
  static async getAllDosages(): Promise<AlcoholDosage[]> {
    try {
      const { data, error } = await supabase
        .from('alcohol_dosages')
        .select('*')
        .order('sort_order');

      if (error) {
        console.error('Erreur lors de la récupération des dosages:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur DashboardCocktailsService.getAllDosages:', error);
      throw error;
    }
  }

  /**
   * Crée un nouveau dosage
   */
  static async createDosage(dosage: Partial<AlcoholDosage>): Promise<AlcoholDosage> {
    try {
      const { data, error } = await supabase
        .from('alcohol_dosages')
        .insert([{
          ...dosage,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création du dosage:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur DashboardCocktailsService.createDosage:', error);
      throw error;
    }
  }

  /**
   * Met à jour un dosage existant
   */
  static async updateDosage(id: string, dosage: Partial<AlcoholDosage>): Promise<AlcoholDosage> {
    try {
      const { data, error } = await supabase
        .from('alcohol_dosages')
        .update({
          ...dosage,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour du dosage:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur DashboardCocktailsService.updateDosage:', error);
      throw error;
    }
  }

  /**
   * Supprime un dosage
   */
  static async deleteDosage(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('alcohol_dosages')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la suppression du dosage:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur DashboardCocktailsService.deleteDosage:', error);
      throw error;
    }
  }
}
