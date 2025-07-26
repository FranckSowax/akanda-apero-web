// Hook React pour la gestion des promotions
import { useState, useEffect, useCallback } from 'react';
import { 
  Promotion, 
  CreatePromotionRequest, 
  UpdatePromotionRequest,
  PromotionFilters,
  UsePromotionsResult,
  PromotionStats 
} from '../types/promotions';
import PromotionsService from '../services/promotionsService';
import { logError, logInfo } from '../utils/error-handler';

export const usePromotions = (filters?: PromotionFilters): UsePromotionsResult => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPromotions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await PromotionsService.getPromotions(filters);
      setPromotions(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des promotions';
      setError(errorMessage);
      logError(err, 'Erreur dans usePromotions');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createPromotion = useCallback(async (data: CreatePromotionRequest): Promise<Promotion> => {
    try {
      const newPromotion = await PromotionsService.createPromotion(data);
      setPromotions(prev => [newPromotion, ...prev]);
      return newPromotion;
    } catch (err) {
      logError(err, 'Erreur lors de la création de la promotion');
      throw err;
    }
  }, []);

  const updatePromotion = useCallback(async (data: UpdatePromotionRequest): Promise<Promotion> => {
    try {
      const updatedPromotion = await PromotionsService.updatePromotion(data);
      setPromotions(prev => 
        prev.map(promo => promo.id === data.id ? updatedPromotion : promo)
      );
      return updatedPromotion;
    } catch (err) {
      logError(err, 'Erreur lors de la mise à jour de la promotion');
      throw err;
    }
  }, []);

  const deletePromotion = useCallback(async (id: string): Promise<void> => {
    try {
      await PromotionsService.deletePromotion(id);
      setPromotions(prev => prev.filter(promo => promo.id !== id));
    } catch (err) {
      logError(err, 'Erreur lors de la suppression de la promotion');
      throw err;
    }
  }, []);

  const toggleActive = useCallback(async (id: string): Promise<void> => {
    try {
      const updatedPromotion = await PromotionsService.togglePromotionActive(id);
      setPromotions(prev => 
        prev.map(promo => promo.id === id ? updatedPromotion : promo)
      );
    } catch (err) {
      logError(err, 'Erreur lors du basculement du statut');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  return {
    promotions,
    loading,
    error,
    refetch: fetchPromotions,
    createPromotion,
    updatePromotion,
    deletePromotion,
    toggleActive
  };
};

// Hook pour les promotions actives (affichage public)
export const useActivePromotions = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivePromotions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await PromotionsService.getActivePromotions();
      setPromotions(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des promotions';
      setError(errorMessage);
      logError(err, 'Erreur dans useActivePromotions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivePromotions();
  }, [fetchActivePromotions]);

  return {
    promotions,
    loading,
    error,
    refetch: fetchActivePromotions
  };
};

// Hook pour les promotions mises en avant
export const useFeaturedPromotions = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedPromotions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await PromotionsService.getFeaturedPromotions();
      setPromotions(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des promotions mises en avant';
      setError(errorMessage);
      logError(err, 'Erreur dans useFeaturedPromotions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeaturedPromotions();
  }, [fetchFeaturedPromotions]);

  return {
    promotions,
    loading,
    error,
    refetch: fetchFeaturedPromotions
  };
};

// Hook pour le compte à rebours d'une promotion
export const usePromotionCountdown = (endDate: string) => {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const difference = end - now;

      if (difference <= 0) {
        setCountdown({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setCountdown({
        days,
        hours,
        minutes,
        seconds,
        isExpired: false
      });
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);

    return () => clearInterval(interval);
  }, [endDate]);

  const timeLeft = countdown.isExpired 
    ? 'Expiré' 
    : `${countdown.days}j ${countdown.hours}h ${countdown.minutes}m ${countdown.seconds}s`;

  return {
    countdown,
    isExpired: countdown.isExpired,
    timeLeft
  };
};

// Hook pour les statistiques des promotions
export const usePromotionStats = () => {
  const [stats, setStats] = useState<PromotionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await PromotionsService.getPromotionStats();
      setStats(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques';
      setError(errorMessage);
      logError(err, 'Erreur dans usePromotionStats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
};

// Hook pour la validation des codes promo
export const usePromoCode = () => {
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateCode = useCallback(async (code: string, orderAmount?: number): Promise<Promotion | null> => {
    try {
      setValidating(true);
      setError(null);
      
      const promotion = await PromotionsService.validatePromoCode(code, orderAmount);
      
      if (!promotion) {
        setError('Code promo invalide ou expiré');
        return null;
      }

      return promotion;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la validation du code';
      setError(errorMessage);
      logError(err, 'Erreur dans usePromoCode');
      return null;
    } finally {
      setValidating(false);
    }
  }, []);

  const useCode = useCallback(async (promotionId: string): Promise<void> => {
    try {
      await PromotionsService.usePromoCode(promotionId);
    } catch (err) {
      logError('Erreur lors de l\'utilisation du code promo', err);
      throw err;
    }
  }, []);

  return {
    validateCode,
    useCode,
    validating,
    error
  };
};
