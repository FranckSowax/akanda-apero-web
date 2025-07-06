import { supabase } from '../lib/supabase'

// Cache pour les données
interface CacheData {
  products: any[] | null;
  categories: any[] | null;
  lastUpdate: {
    products: number;
    categories: number;
  };
}

const cache: CacheData = {
  products: null,
  categories: null,
  lastUpdate: {
    products: 0,
    categories: 0
  }
};

// Durée de validité du cache (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Service pour récupérer les données depuis Supabase
export const supabaseService = {
  // Invalider le cache
  invalidateCache(type?: 'products' | 'categories' | 'all') {
    console.log('🗑️ Invalidation du cache:', type || 'all');
    
    if (!type || type === 'all') {
      cache.products = null;
      cache.categories = null;
      cache.lastUpdate.products = 0;
      cache.lastUpdate.categories = 0;
    } else if (type === 'products') {
      cache.products = null;
      cache.lastUpdate.products = 0;
    } else if (type === 'categories') {
      cache.categories = null;
      cache.lastUpdate.categories = 0;
    }
  },

  // Vérifier si le cache est valide
  isCacheValid(type: 'products' | 'categories'): boolean {
    const now = Date.now();
    const lastUpdate = cache.lastUpdate[type];
    return lastUpdate > 0 && (now - lastUpdate) < CACHE_DURATION;
  },

  // Récupérer les produits en vedette
  async getFeaturedProducts(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name,
            icon,
            color
          )
        `)
        .eq('is_featured', true)
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .limit(5)

      if (error) throw error
      console.log('🌟 Produits vedettes chargés:', data?.length || 0);
      return data || []
    } catch (error) {
      console.error('Erreur lors du chargement des produits vedette:', error)
      return []
    }
  },

  // Récupérer les top catégories avec comptage des produits
  async getTopCategories() {
    try {
      // Récupérer les catégories
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .limit(5)

      if (categoriesError) throw categoriesError

      // Pour chaque catégorie, compter les produits
      const categoriesWithCount = await Promise.all(
        (categories || []).map(async (category) => {
          const { count, error: countError } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)
            .eq('is_active', true)

          if (countError) {
            console.error(`Erreur comptage produits pour catégorie ${category.id}:`, countError)
            return { ...category, product_count: 0 }
          }

          return { ...category, product_count: count || 0 }
        })
      )

      return categoriesWithCount
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
      return []
    }
  },

  // Récupérer toutes les catégories actives avec cache
  async getAllCategories(forceRefresh = false) {
    try {
      // Utiliser le cache si valide et pas de refresh forcé
      if (!forceRefresh && cache.categories && this.isCacheValid('categories')) {
        console.log('📦 Utilisation du cache pour les catégories');
        return cache.categories;
      }

      console.log('🔄 Chargement des catégories depuis Supabase');
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) throw error
      
      // Mettre à jour le cache
      cache.categories = data || [];
      cache.lastUpdate.categories = Date.now();
      
      return data || []
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
      return []
    }
  },

  // Récupérer tous les produits avec cache
  async getAllProducts(forceRefresh = false) {
    try {
      // Utiliser le cache si valide et pas de refresh forcé
      if (!forceRefresh && cache.products && this.isCacheValid('products')) {
        console.log('📦 Utilisation du cache pour les produits');
        return cache.products;
      }

      console.log('🔄 Chargement des produits depuis Supabase');
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            icon,
            color
          )
        `)
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) throw error
      
      // Mettre à jour le cache
      cache.products = data || [];
      cache.lastUpdate.products = Date.now();
      
      return data || []
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error)
      return []
    }
  },

  // Rechercher des produits
  async searchProducts(query: string) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name,
            icon,
            color
          )
        `)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erreur lors de la recherche:', error)
      return []
    }
  },

  // Récupérer les produits par catégorie
  async getProductsByCategory(categoryId: string) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erreur lors du chargement des produits par catégorie:', error)
      return []
    }
  },

  // Fonctions utilitaires pour la synchronisation
  async refreshAllData() {
    console.log('🔄 Actualisation complète des données');
    this.invalidateCache('all');
    const [products, categories] = await Promise.all([
      this.getAllProducts(true),
      this.getAllCategories(true)
    ]);
    return { products, categories };
  },

  // Notification de changement de données
  notifyDataChange(type: 'products' | 'categories', action: 'added' | 'updated' | 'deleted', id?: string) {
    console.log(`📢 Notification: ${type} ${action}`, id);
    this.invalidateCache(type);
    
    // Déclencher un événement personnalisé pour les composants qui écoutent
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('supabase-data-change', {
        detail: { type, action, id, timestamp: Date.now() }
      }));
    }
  }
}
