import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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
          status: 'pending' | 'confirmed' | 'preparing' | 'ready_for_delivery' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded'
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
          payment_status: string
          payment_reference: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id?: string | null
          order_number: string
          status?: 'pending' | 'confirmed' | 'preparing' | 'ready_for_delivery' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded'
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
          payment_status?: string
          payment_reference?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string | null
          order_number?: string
          status?: 'pending' | 'confirmed' | 'preparing' | 'ready_for_delivery' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded'
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
          payment_status?: string
          payment_reference?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
