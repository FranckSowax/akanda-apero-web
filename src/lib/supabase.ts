import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Vérification des variables d'environnement
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Supabase configuration missing. Using placeholder values. Please configure your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const supabaseClient = createClientComponentClient<Database>()

// Types pour la base de données Akanda Apéro
export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string
          color: string
          slug: string
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon: string
          color: string
          slug: string
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string
          color?: string
          slug?: string
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          category_id: string | null
          name: string
          description: string | null
          short_description: string | null
          image_url: string | null
          emoji: string | null
          base_price: number
          sale_price: number | null
          product_type: 'simple' | 'bundle' | 'cocktail_kit'
          sku: string | null
          stock_quantity: number
          min_stock_level: number
          is_active: boolean
          is_featured: boolean
          rating: number
          rating_count: number
          weight_grams: number | null
          alcohol_percentage: number | null
          volume_ml: number | null
          origin_country: string | null
          brand: string | null
          tags: string[] | null
          meta_title: string | null
          meta_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id?: string | null
          name: string
          description?: string | null
          short_description?: string | null
          image_url?: string | null
          emoji?: string | null
          base_price: number
          sale_price?: number | null
          product_type?: 'simple' | 'bundle' | 'cocktail_kit'
          sku?: string | null
          stock_quantity?: number
          min_stock_level?: number
          is_active?: boolean
          is_featured?: boolean
          rating?: number
          rating_count?: number
          weight_grams?: number | null
          alcohol_percentage?: number | null
          volume_ml?: number | null
          origin_country?: string | null
          brand?: string | null
          tags?: string[] | null
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string | null
          name?: string
          description?: string | null
          short_description?: string | null
          image_url?: string | null
          emoji?: string | null
          base_price?: number
          sale_price?: number | null
          product_type?: 'simple' | 'bundle' | 'cocktail_kit'
          sku?: string | null
          stock_quantity?: number
          min_stock_level?: number
          is_active?: boolean
          is_featured?: boolean
          rating?: number
          rating_count?: number
          weight_grams?: number | null
          alcohol_percentage?: number | null
          volume_ml?: number | null
          origin_country?: string | null
          brand?: string | null
          tags?: string[] | null
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      product_options: {
        Row: {
          id: string
          product_id: string
          name: string
          description: string | null
          price_modifier: number
          stock_quantity: number
          is_default: boolean
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          name: string
          description?: string | null
          price_modifier?: number
          stock_quantity?: number
          is_default?: boolean
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          name?: string
          description?: string | null
          price_modifier?: number
          stock_quantity?: number
          is_default?: boolean
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          customer_id: string | null
          order_number: string
          status: 'Nouvelle' | 'Confirmée' | 'En préparation' | 'Prête' | 'En livraison' | 'Livrée' | 'Annulée'
          order_date: string
          confirmed_at: string | null
          delivered_at: string | null
          subtotal: number
          delivery_fee: number
          discount_amount: number
          tax_amount: number
          total_amount: number
          delivery_zone_id: string | null
          delivery_address: string
          delivery_phone: string | null
          delivery_notes: string | null
          estimated_delivery_at: string | null
          payment_method: string | null
          payment_status: 'En attente' | 'Payé' | 'Échoué' | 'Remboursé' | null
          payment_reference: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id?: string | null
          order_number: string
          status?: 'Nouvelle' | 'Confirmée' | 'En préparation' | 'Prête' | 'En livraison' | 'Livrée' | 'Annulée'
          order_date?: string
          confirmed_at?: string | null
          delivered_at?: string | null
          subtotal: number
          delivery_fee?: number
          discount_amount?: number
          tax_amount?: number
          total_amount: number
          delivery_zone_id?: string | null
          delivery_address: string
          delivery_phone?: string | null
          delivery_notes?: string | null
          estimated_delivery_at?: string | null
          payment_method?: string | null
          payment_status?: 'En attente' | 'Payé' | 'Échoué' | 'Remboursé' | null
          payment_reference?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string | null
          order_number?: string
          status?: 'Nouvelle' | 'Confirmée' | 'En préparation' | 'Prête' | 'En livraison' | 'Livrée' | 'Annulée'
          order_date?: string
          confirmed_at?: string | null
          delivered_at?: string | null
          subtotal?: number
          delivery_fee?: number
          discount_amount?: number
          tax_amount?: number
          total_amount?: number
          delivery_zone_id?: string | null
          delivery_address?: string
          delivery_phone?: string | null
          delivery_notes?: string | null
          estimated_delivery_at?: string | null
          payment_method?: string | null
          payment_status?: 'En attente' | 'Payé' | 'Échoué' | 'Remboursé' | null
          payment_reference?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      problemes: {
        Row: {
          id: string
          order_id: string
          order_number: string
          customer_name: string
          customer_email: string | null
          customer_phone: string | null
          total_amount: number
          problem_type: 'livraison' | 'produit' | 'service' | 'paiement' | 'autre'
          problem_description: string
          urgency_level: 'faible' | 'normale' | 'haute' | 'critique'
          status: 'nouveau' | 'en_cours' | 'resolu' | 'ferme'
          reported_by_customer: boolean
          admin_notes: string | null
          resolution_notes: string | null
          assigned_to: string | null
          created_at: string
          updated_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          order_id: string
          order_number: string
          customer_name: string
          customer_email?: string | null
          customer_phone?: string | null
          total_amount: number
          problem_type: 'livraison' | 'produit' | 'service' | 'paiement' | 'autre'
          problem_description: string
          urgency_level?: 'faible' | 'normale' | 'haute' | 'critique'
          status?: 'nouveau' | 'en_cours' | 'resolu' | 'ferme'
          reported_by_customer?: boolean
          admin_notes?: string | null
          resolution_notes?: string | null
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          order_number?: string
          customer_name?: string
          customer_email?: string | null
          customer_phone?: string | null
          total_amount?: number
          problem_type?: 'livraison' | 'produit' | 'service' | 'paiement' | 'autre'
          problem_description?: string
          urgency_level?: 'faible' | 'normale' | 'haute' | 'critique'
          status?: 'nouveau' | 'en_cours' | 'resolu' | 'ferme'
          reported_by_customer?: boolean
          admin_notes?: string | null
          resolution_notes?: string | null
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
      }
    }
  }
}
