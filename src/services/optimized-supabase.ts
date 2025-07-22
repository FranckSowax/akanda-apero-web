'use client';

import { supabase } from '../lib/supabase/client';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';

/**
 * Service Supabase optimisé avec cache et requêtes efficaces
 */
export class OptimizedSupabaseService {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Cache intelligent avec TTL
   */
  private static getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.timestamp + cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data as T;
  }

  private static setCache<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Requêtes optimisées pour les produits
   */
  static async getProducts(options: {
    category?: string;
    limit?: number;
    offset?: number;
    includeStock?: boolean;
  } = {}) {
    const cacheKey = `products_${JSON.stringify(options)}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    let query = supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        description,
        image_url,
        category,
        ${options.includeStock ? 'stock_quantity,' : ''}
        is_featured,
        created_at
      `)
      .eq('is_active', true);

    if (options.category) {
      query = query.eq('category', options.category);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des produits:', error);
      return { data: [], error };
    }

    this.setCache(cacheKey, { data, error: null });
    return { data, error: null };
  }

  /**
   * Requêtes optimisées pour les commandes avec pagination
   */
  static async getOrders(options: {
    status?: string;
    limit?: number;
    offset?: number;
    userId?: string;
    includeItems?: boolean;
  } = {}) {
    const cacheKey = `orders_${JSON.stringify(options)}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    let query = supabase
      .from('orders')
      .select(`
        id,
        total_amount,
        status,
        payment_method,
        delivery_address,
        customer_name,
        customer_phone,
        created_at,
        ${options.includeItems ? `
        order_items (
          id,
          quantity,
          unit_price,
          products (
            id,
            name,
            image_url
          )
        )
        ` : ''}
      `);

    if (options.status) {
      query = query.eq('status', options.status);
    }

    if (options.userId) {
      query = query.eq('user_id', options.userId);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      return { data: [], error };
    }

    // Cache plus court pour les commandes (2 minutes)
    this.setCache(cacheKey, { data, error: null }, 2 * 60 * 1000);
    return { data, error: null };
  }

  /**
   * Requêtes optimisées pour les statistiques dashboard
   */
  static async getDashboardStats() {
    const cacheKey = 'dashboard_stats';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      // Requêtes parallèles pour optimiser les performances
      const [ordersResult, productsResult, customersResult] = await Promise.all([
        // Statistiques des commandes
        supabase
          .from('orders')
          .select('id, total_amount, status, created_at')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),

        // Produits les plus vendus
        supabase
          .from('order_items')
          .select(`
            product_id,
            quantity,
            products (
              id,
              name,
              image_url,
              price
            )
          `)
          .limit(10),

        // Nombre de clients
        supabase
          .from('customers')
          .select('id', { count: 'exact', head: true })
      ]);

      const stats = {
        orders: ordersResult.data || [],
        bestSellers: productsResult.data || [],
        customersCount: customersResult.count || 0,
        error: null
      };

      // Cache pour 10 minutes
      this.setCache(cacheKey, stats, 10 * 60 * 1000);
      return stats;

    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return { orders: [], bestSellers: [], customersCount: 0, error };
    }
  }

  /**
   * Invalidation du cache pour une clé spécifique ou toutes les clés
   */
  static invalidateCache(pattern?: string) {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Batch operations pour optimiser les insertions multiples
   */
  static async batchInsert<T>(table: string, items: T[], batchSize: number = 100) {
    const results = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const { data, error } = await supabase
        .from(table)
        .insert(batch)
        .select();
      
      if (error) {
        console.error(`Erreur lors de l'insertion batch ${i}-${i + batchSize}:`, error);
        return { data: null, error };
      }
      
      results.push(...(data || []));
    }
    
    return { data: results, error: null };
  }
}

/**
 * Hook personnalisé pour utiliser le service optimisé
 */
export const useOptimizedSupabase = () => {
  return OptimizedSupabaseService;
};
