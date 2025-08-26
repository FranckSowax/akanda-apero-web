'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { Banner } from '../types/supabase';

export const useBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger toutes les bannières
  const loadBanners = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('type')
        .order('sort_order');

      if (fetchError) throw fetchError;
      setBanners(data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des bannières:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  // Charger les bannières par type
  const getBannersByType = (type: Banner['type']) => {
    return banners.filter(banner => banner.type === type);
  };

  // Charger les slides hero
  const getHeroSlides = () => {
    return getBannersByType('hero_slide');
  };

  // Charger l'image de fond du module cocktail kits
  const getCocktailKitBackground = () => {
    const backgrounds = getBannersByType('cocktail_kit_bg');
    return backgrounds.length > 0 ? backgrounds[0] : null;
  };

  // Charger l'image parallax
  const getParallaxImage = () => {
    const parallaxImages = getBannersByType('parallax_section');
    return parallaxImages.length > 0 ? parallaxImages[0] : null;
  };

  useEffect(() => {
    loadBanners();
  }, []);

  return {
    banners,
    loading,
    error,
    loadBanners,
    getBannersByType,
    getHeroSlides,
    getCocktailKitBackground,
    getParallaxImage
  };
};

// Hook spécialisé pour la page d'accueil
export const useHomeBanners = () => {
  const { banners, loading, error, loadBanners } = useBanners();

  // Formater les slides hero pour la page d'accueil
  const heroSlides = banners
    .filter(banner => banner.type === 'hero_slide')
    .map(banner => ({
      id: parseInt(banner.id),
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      price: banner.price || '',
      rating: banner.rating || '4.8',
      year: banner.year || '2020',
      gradient: banner.gradient || 'from-orange-400/50 to-orange-500/50',
      bgImage: banner.image_url || ''
    }));

  // Image de fond du module cocktail kits
  const cocktailKitBg = banners
    .find(banner => banner.type === 'cocktail_kit_bg')?.image_url || 'https://i.imgur.com/lmz5VYR.jpg';

  // Image parallax
  const parallaxImage = banners
    .find(banner => banner.type === 'parallax_section')?.image_url || 'https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-4.0.3';

  return {
    heroSlides,
    cocktailKitBg,
    parallaxImage,
    loading,
    error,
    refreshBanners: loadBanners
  };
};
