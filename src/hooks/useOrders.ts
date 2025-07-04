import { useState, useEffect } from 'react'
import { supabaseClient } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type Order = Database['public']['Tables']['orders']['Row']
type OrderInsert = Database['public']['Tables']['orders']['Insert']
type OrderUpdate = Database['public']['Tables']['orders']['Update']

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Récupérer toutes les commandes
  const fetchOrders = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabaseClient
        .from('orders')
        .select(`
          *,
          customers (
            id,
            first_name,
            last_name,
            email,
            phone
          ),
          order_items (
            id,
            product_name,
            quantity,
            unit_price,
            total_price
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des commandes')
    } finally {
      setLoading(false)
    }
  }

  // Créer une nouvelle commande
  const createOrder = async (orderData: OrderInsert) => {
    try {
      const { data, error } = await supabaseClient
        .from('orders')
        .insert(orderData)
        .select()
        .single()

      if (error) throw error
      
      // Rafraîchir la liste
      await fetchOrders()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de la commande')
      throw err
    }
  }

  // Mettre à jour une commande
  const updateOrder = async (id: string, orderData: OrderUpdate) => {
    try {
      const { data, error } = await supabaseClient
        .from('orders')
        .update(orderData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      // Rafraîchir la liste
      await fetchOrders()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la commande')
      throw err
    }
  }

  // Changer le statut d'une commande
  const updateOrderStatus = async (id: string, status: Order['status']) => {
    try {
      const updateData: OrderUpdate = { status }
      
      // Ajouter les timestamps selon le statut
      if (status === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString()
      } else if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString()
      }

      const { data, error } = await supabaseClient
        .from('orders')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      // Rafraîchir la liste
      await fetchOrders()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du statut')
      throw err
    }
  }

  // Récupérer les commandes par statut
  const getOrdersByStatus = async (status: Order['status']) => {
    try {
      const { data, error } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des commandes par statut')
      return []
    }
  }

  // Récupérer les statistiques des commandes
  const getOrderStats = async () => {
    try {
      const { data, error } = await supabaseClient
        .from('orders')
        .select('status, total_amount')

      if (error) throw error

      const stats = {
        total: data?.length || 0,
        pending: data?.filter(o => o.status === 'pending').length || 0,
        confirmed: data?.filter(o => o.status === 'confirmed').length || 0,
        preparing: data?.filter(o => o.status === 'preparing').length || 0,
        delivered: data?.filter(o => o.status === 'delivered').length || 0,
        cancelled: data?.filter(o => o.status === 'cancelled').length || 0,
        totalRevenue: data?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0
      }

      return stats
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques')
      return {
        total: 0,
        pending: 0,
        confirmed: 0,
        preparing: 0,
        delivered: 0,
        cancelled: 0,
        totalRevenue: 0
      }
    }
  }

  // Récupérer les commandes récentes
  const getRecentOrders = async (limit: number = 10) => {
    try {
      const { data, error } = await supabaseClient
        .from('orders')
        .select(`
          *,
          customers (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des commandes récentes')
      return []
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  return {
    orders,
    loading,
    error,
    fetchOrders,
    createOrder,
    updateOrder,
    updateOrderStatus,
    getOrdersByStatus,
    getOrderStats,
    getRecentOrders
  }
}
