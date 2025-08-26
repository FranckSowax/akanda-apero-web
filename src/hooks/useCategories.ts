import { useState, useEffect } from 'react'
import { supabaseClient } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type Category = Database['public']['Tables']['categories']['Row']
type CategoryInsert = Database['public']['Tables']['categories']['Insert']
type CategoryUpdate = Database['public']['Tables']['categories']['Update']

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Récupérer toutes les catégories
  const fetchCategories = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabaseClient
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error
      setCategories(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des catégories')
    } finally {
      setLoading(false)
    }
  }

  // Créer une nouvelle catégorie
  const createCategory = async (categoryData: CategoryInsert) => {
    try {
      const { data, error } = await supabaseClient
        .from('categories')
        .insert(categoryData)
        .select()
        .single()

      if (error) throw error
      
      // Rafraîchir la liste
      await fetchCategories()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de la catégorie')
      throw err
    }
  }

  // Mettre à jour une catégorie
  const updateCategory = async (id: string, categoryData: CategoryUpdate) => {
    try {
      const { data, error } = await supabaseClient
        .from('categories')
        .update(categoryData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      // Rafraîchir la liste
      await fetchCategories()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la catégorie')
      throw err
    }
  }

  // Supprimer une catégorie
  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabaseClient
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      // Rafraîchir la liste
      await fetchCategories()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression de la catégorie')
      throw err
    }
  }

  // Récupérer les catégories actives
  const getActiveCategories = async () => {
    try {
      const { data, error } = await supabaseClient
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) throw error
      return data || []
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des catégories actives')
      return []
    }
  }

  // Récupérer le top 5 des catégories
  const getTopCategories = async (limit: number = 5) => {
    try {
      const { data, error } = await supabaseClient
        .from('categories')
        .select(`
          *,
          products!inner (
            id
          )
        `)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du top des catégories')
      return []
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getActiveCategories,
    getTopCategories
  }
}
