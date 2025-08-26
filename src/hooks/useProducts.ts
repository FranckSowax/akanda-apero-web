import { useState, useEffect } from 'react'
import { supabaseClient } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type Product = Database['public']['Tables']['products']['Row']
type ProductInsert = Database['public']['Tables']['products']['Insert']
type ProductUpdate = Database['public']['Tables']['products']['Update']

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Récupérer tous les produits
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabaseClient
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
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des produits')
    } finally {
      setLoading(false)
    }
  }

  // Créer un nouveau produit
  const createProduct = async (productData: ProductInsert) => {
    try {
      const { data, error } = await supabaseClient
        .from('products')
        .insert(productData)
        .select()
        .single()

      if (error) throw error
      
      // Rafraîchir la liste
      await fetchProducts()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du produit')
      throw err
    }
  }

  // Mettre à jour un produit
  const updateProduct = async (id: string, productData: ProductUpdate) => {
    try {
      const { data, error } = await supabaseClient
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      // Rafraîchir la liste
      await fetchProducts()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du produit')
      throw err
    }
  }

  // Supprimer un produit
  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabaseClient
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      // Rafraîchir la liste
      await fetchProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du produit')
      throw err
    }
  }

  // Récupérer les produits par catégorie
  const getProductsByCategory = async (categoryId: string) => {
    try {
      const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data || []
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des produits par catégorie')
      return []
    }
  }

  // Récupérer les produits en vedette
  const getFeaturedProducts = async () => {
    try {
      const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .limit(5)

      if (error) throw error
      return data || []
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des produits en vedette')
      return []
    }
  }

  // Rechercher des produits
  const searchProducts = async (query: string) => {
    try {
      const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data || []
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la recherche de produits')
      return []
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
    getFeaturedProducts,
    searchProducts
  }
}
