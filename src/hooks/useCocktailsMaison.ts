import { useState, useEffect } from 'react';
import { CocktailMaison, Mocktail, CocktailOption } from '../types/supabase';
import { CocktailsMaisonService } from '../services/cocktailsMaisonService';

// =====================================================
// HOOK COCKTAILS MAISON
// =====================================================

export const useCocktailsMaison = () => {
  const [cocktails, setCocktails] = useState<CocktailMaison[]>([]);
  const [mocktails, setMocktails] = useState<Mocktail[]>([]);
  const [options, setOptions] = useState<CocktailOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // =====================================================
  // CHARGEMENT DES DONNÉES
  // =====================================================

  const loadCocktails = async () => {
    try {
      const data = await CocktailsMaisonService.getCocktails();
      
      if (data.length === 0) {
        // Utiliser les données de fallback si la base est vide
        console.log('🍹 Utilisation des données de fallback pour les cocktails');
        setCocktails(CocktailsMaisonService.getFallbackCocktails());
      } else {
        console.log(`🍹 ${data.length} cocktails chargés depuis Supabase`);
        setCocktails(data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des cocktails:', err);
      setCocktails(CocktailsMaisonService.getFallbackCocktails());
    }
  };

  const loadMocktails = async () => {
    try {
      const data = await CocktailsMaisonService.getMocktails();
      
      if (data.length === 0) {
        console.log('🥤 Utilisation des données de fallback pour les mocktails');
        setMocktails(CocktailsMaisonService.getFallbackMocktails());
      } else {
        console.log(`🥤 ${data.length} mocktails chargés depuis Supabase`);
        setMocktails(data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des mocktails:', err);
      setMocktails(CocktailsMaisonService.getFallbackMocktails());
    }
  };

  const loadOptions = async () => {
    try {
      const data = await CocktailsMaisonService.getCocktailOptions();
      
      if (data.length === 0) {
        console.log('⚙️ Utilisation des données de fallback pour les options');
        setOptions(CocktailsMaisonService.getFallbackOptions());
      } else {
        console.log(`⚙️ ${data.length} options chargées depuis Supabase`);
        setOptions(data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des options:', err);
      setOptions(CocktailsMaisonService.getFallbackOptions());
    }
  };

  // =====================================================
  // EFFET DE CHARGEMENT INITIAL
  // =====================================================

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      setError(null);

      try {
        await Promise.all([
          loadCocktails(),
          loadMocktails(),
          loadOptions()
        ]);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  // =====================================================
  // FONCTIONS UTILITAIRES
  // =====================================================

  const getCocktailById = (id: string): CocktailMaison | undefined => {
    return cocktails.find(cocktail => cocktail.id === id);
  };

  const getMocktailById = (id: string): Mocktail | undefined => {
    return mocktails.find(mocktail => mocktail.id === id);
  };

  const getOptionById = (id: string): CocktailOption | undefined => {
    return options.find(option => option.id === id);
  };

  const getFeaturedCocktails = (): CocktailMaison[] => {
    return cocktails.filter(cocktail => cocktail.is_featured);
  };

  const getCocktailsByCategory = (category: string): CocktailMaison[] => {
    return cocktails.filter(cocktail => cocktail.category === category);
  };

  // =====================================================
  // CALCULS MÉTIER
  // =====================================================

  const calculateCocktailQuantity = (nbPersonnes: number, dureeHeures: number): number => {
    return CocktailsMaisonService.calculateCocktailQuantity(nbPersonnes, dureeHeures);
  };

  const calculateTotalPrice = (
    selectedCocktails: Array<{ id: string; quantity: number }>,
    selectedMocktails: Array<{ id: string; quantity: number }>,
    selectedOptions: Array<{ id: string; selected: boolean }>
  ): number => {
    const cocktailsWithPrice = selectedCocktails.map(sc => {
      const cocktail = getCocktailById(sc.id);
      return {
        id: sc.id,
        quantity: sc.quantity,
        price: cocktail?.base_price || 0
      };
    });

    const mocktailsWithPrice = selectedMocktails.map(sm => {
      const mocktail = getMocktailById(sm.id);
      return {
        id: sm.id,
        quantity: sm.quantity,
        price: mocktail?.base_price || 0
      };
    });

    const optionsWithPrice = selectedOptions.map(so => {
      const option = getOptionById(so.id);
      return {
        id: so.id,
        selected: so.selected,
        price: option?.price || 0
      };
    });

    return CocktailsMaisonService.calculateTotalPrice(
      cocktailsWithPrice,
      mocktailsWithPrice,
      optionsWithPrice
    );
  };

  const calculateDeliveryFee = (zone: 'centre' | 'peripherie' | 'etendue'): number => {
    return CocktailsMaisonService.calculateDeliveryFee(zone);
  };

  const getDeliveryTime = (zone: 'centre' | 'peripherie' | 'etendue'): string => {
    return CocktailsMaisonService.getDeliveryTime(zone);
  };

  // =====================================================
  // FONCTIONS DE RECHARGEMENT
  // =====================================================

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([
      loadCocktails(),
      loadMocktails(),
      loadOptions()
    ]);
    setLoading(false);
  };

  const refreshCocktails = async () => {
    await loadCocktails();
  };

  const refreshMocktails = async () => {
    await loadMocktails();
  };

  const refreshOptions = async () => {
    await loadOptions();
  };

  // =====================================================
  // RETOUR DU HOOK
  // =====================================================

  return {
    // Données
    cocktails,
    mocktails,
    options,
    loading,
    error,

    // Fonctions de recherche
    getCocktailById,
    getMocktailById,
    getOptionById,
    getFeaturedCocktails,
    getCocktailsByCategory,

    // Calculs métier
    calculateCocktailQuantity,
    calculateTotalPrice,
    calculateDeliveryFee,
    getDeliveryTime,

    // Fonctions de rechargement
    refreshData,
    refreshCocktails,
    refreshMocktails,
    refreshOptions
  };
};
