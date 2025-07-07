import { supabase } from '../lib/supabase/client';
import { CocktailMaison, CocktailIngredient, CocktailInstruction, Mocktail, MocktailIngredient, CocktailOption } from '../types/supabase';

// =====================================================
// SERVICE COCKTAILS MAISON
// =====================================================

export class CocktailsMaisonService {
  
  // =====================================================
  // COCKTAILS
  // =====================================================
  
  static async getCocktails(): Promise<CocktailMaison[]> {
    try {
      const { data, error } = await supabase
        .from('cocktails_maison')
        .select(`
          *,
          cocktail_ingredients(*),
          cocktail_instructions(*)
        `)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.warn('Tables cocktails_maison non trouvées, utilisation des données de fallback:', error);
        return this.getFallbackCocktails();
      }

      return data || [];
    } catch (error) {
      console.error('Erreur service cocktails:', error);
      return [];
    }
  }

  static async getCocktailById(id: string): Promise<CocktailMaison | null> {
    try {
      const { data, error } = await supabase
        .from('cocktails_maison')
        .select(`
          *,
          cocktail_ingredients(*),
          cocktail_instructions(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération du cocktail:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erreur service cocktail:', error);
      return null;
    }
  }

  // =====================================================
  // MOCKTAILS
  // =====================================================
  
  static async getMocktails(): Promise<Mocktail[]> {
    try {
      const { data, error } = await supabase
        .from('mocktails')
        .select(`
          *,
          mocktail_ingredients(*)
        `)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Erreur lors de la récupération des mocktails:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erreur service mocktails:', error);
      return [];
    }
  }

  static async getMocktailById(id: string): Promise<Mocktail | null> {
    try {
      const { data, error } = await supabase
        .from('mocktails')
        .select(`
          *,
          mocktail_ingredients(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération du mocktail:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erreur service mocktail:', error);
      return null;
    }
  }

  // =====================================================
  // OPTIONS
  // =====================================================
  
  static async getCocktailOptions(): Promise<CocktailOption[]> {
    try {
      const { data, error } = await supabase
        .from('cocktail_options')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) {
        console.error('Erreur lors de la récupération des options:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erreur service options:', error);
      return [];
    }
  }

  // =====================================================
  // CALCULS MÉTIER
  // =====================================================
  
  static calculateCocktailQuantity(nbPersonnes: number, dureeHeures: number): number {
    // Algorithme basé sur le guide Akanda
    let cocktailsParPersonne = 2; // Base
    
    if (dureeHeures >= 4) cocktailsParPersonne = 3;
    if (dureeHeures >= 6) cocktailsParPersonne = 4;
    
    return Math.ceil(nbPersonnes * cocktailsParPersonne);
  }

  static calculateTotalPrice(
    cocktails: Array<{ id: string; quantity: number; price: number }>,
    mocktails: Array<{ id: string; quantity: number; price: number }>,
    options: Array<{ id: string; selected: boolean; price: number }>
  ): number {
    let total = 0;

    // Prix des cocktails
    cocktails.forEach(cocktail => {
      total += cocktail.quantity * cocktail.price;
    });

    // Prix des mocktails
    mocktails.forEach(mocktail => {
      total += mocktail.quantity * mocktail.price;
    });

    // Prix des options
    options.forEach(option => {
      if (option.selected) {
        total += option.price;
      }
    });

    return total;
  }

  static calculateDeliveryFee(zone: 'centre' | 'peripherie' | 'etendue'): number {
    const fees = {
      centre: 0,
      peripherie: 1000,
      etendue: 2000
    };
    
    return fees[zone] || 0;
  }

  static getDeliveryTime(zone: 'centre' | 'peripherie' | 'etendue'): string {
    const times = {
      centre: '45 min',
      peripherie: '1h15',
      etendue: '1h30'
    };
    
    return times[zone] || '45 min';
  }

  // =====================================================
  // DONNÉES STATIQUES DE FALLBACK
  // =====================================================
  
  static getFallbackCocktails(): CocktailMaison[] {
    return [
      {
        id: 'fallback-1',
        name: 'Planteur d\'Akanda',
        description: 'Notre cocktail signature aux saveurs tropicales',
        emoji: '🍹',
        difficulty_level: 2,
        preparation_time_minutes: 5,
        base_price: 3125,
        category: 'signature',
        alcohol_percentage: 12,
        is_active: true,
        is_featured: true,
        image_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        cocktail_ingredients: [],
        cocktail_instructions: [
          {
            id: 'inst-1',
            cocktail_id: 'fallback-1',
            step_number: 1,
            instruction: 'Verser le rhum dans un verre à cocktail',
            created_at: new Date().toISOString()
          },
          {
            id: 'inst-2',
            cocktail_id: 'fallback-1',
            step_number: 2,
            instruction: 'Ajouter les jus de fruits et mélanger',
            created_at: new Date().toISOString()
          }
        ]
      }
    ];
  }

  static getFallbackMocktails(): Mocktail[] {
    return [
      {
        id: 'mocktail-1',
        name: 'Virgin Planteur',
        description: 'Version sans alcool de notre signature',
        emoji: '🍹',
        base_price: 1500,
        preparation_time_minutes: 3,
        is_active: true,
        image_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        mocktail_ingredients: [
          {
            id: 'ming-1',
            mocktail_id: 'mocktail-1',
            name: 'Jus d\'ananas',
            quantity: '10',
            unit: 'cl',
            sort_order: 1,
            created_at: new Date().toISOString()
          }
        ]
      }
    ];
  }

  static getFallbackOptions(): CocktailOption[] {
    return [
      {
        id: 'option-1',
        name: 'Kit Barman',
        description: 'Shaker, doseur, cuillère',
        emoji: '🍸',
        price: 3000,
        is_active: true,
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'option-2',
        name: 'Verres Cocktail',
        description: 'Lot de 8 verres élégants',
        emoji: '🥃',
        price: 5000,
        is_active: true,
        sort_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }
}
