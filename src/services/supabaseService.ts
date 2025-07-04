import { supabase } from '../lib/supabase'

// Service pour récupérer les données depuis Supabase
export const supabaseService = {
  // Récupérer les produits en vedette
  async getFeaturedProducts() {
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
        // .eq('is_featured', true) // Temporairement désactivé pour afficher tous les produits
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .limit(5)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erreur lors du chargement des produits vedette:', error)
      return []
    }
  },

  // Récupérer les top catégories
  async getTopCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .limit(5)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
      return []
    }
  },

  // Récupérer toutes les catégories actives
  async getAllCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erreur lors du chargement de toutes les catégories:', error)
      return []
    }
  },

  // Récupérer tous les produits
  async getAllProducts() {
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
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
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
  }
}
