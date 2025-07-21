import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { CocktailMaison } from '../types/supabase';

// Fonction pour calculer le numéro de semaine depuis une date de référence
function getWeekNumber(date: Date): number {
  // Date de référence : 1er janvier 2024 (lundi)
  const referenceDate = new Date('2024-01-01');
  const timeDiff = date.getTime() - referenceDate.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
  return Math.floor(daysDiff / 7);
}

export function useWeeklyCocktail() {
  const [cocktail, setCocktail] = useState<CocktailMaison | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWeeklyCocktail() {
      try {
        setLoading(true);
        setError(null);
        
        // Récupérer tous les cocktails disponibles
        const { data: allCocktails, error: fetchError } = await supabase
          .from('cocktails_maison')
          .select('*')
          .order('created_at', { ascending: true }); // Ordre cohérent
        
        if (fetchError) throw fetchError;
        
        if (allCocktails && allCocktails.length > 0) {
          // Calculer l'index basé sur la semaine actuelle
          const currentWeek = getWeekNumber(new Date());
          const cocktailIndex = currentWeek % allCocktails.length;
          
          // Sélectionner le cocktail de la semaine
          setCocktail(allCocktails[cocktailIndex]);
          
          console.log(`🗓️ Semaine ${currentWeek} - Cocktail sélectionné:`, allCocktails[cocktailIndex].name);
        } else {
          // Fallback avec données par défaut si aucun cocktail en base
          setCocktail({
            id: 'fallback',
            name: 'Cosmopolitan',
            description: 'Un cocktail élégant et rafraîchissant',
            emoji: '🍸',
            difficulty_level: 3,
            preparation_time_minutes: 5,
            base_price: 3200,
            category: 'Cocktails Classiques',
            alcohol_percentage: 15,
            is_active: true,
            is_featured: false,
            image_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            recipe: 'Mélanger tous les ingrédients avec des glaçons',
            video_url: undefined,
            video_type: undefined
          });
          
          console.log('🗓️ Utilisation du cocktail fallback');
        }
      } catch (err) {
        console.error('Erreur lors de la récupération du cocktail de la semaine:', err);
        setError('Impossible de charger le cocktail de la semaine');
        
        // Fallback en cas d'erreur
        setCocktail({
          id: 'error-fallback',
          name: 'Mojito',
          description: 'Le cocktail cubain par excellence',
          emoji: '🍹',
          difficulty_level: 2,
          preparation_time_minutes: 3,
          base_price: 2800,
          category: 'Cocktails Rafraîchissants',
          alcohol_percentage: 12,
          is_active: true,
          is_featured: false,
          image_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          recipe: 'Piler la menthe avec le sucre et le citron vert',
          video_url: undefined,
          video_type: undefined
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyCocktail();
  }, []);

  return { cocktail, loading, error };
};
