import { createClient } from '@supabase/supabase-js';
import { Product, Category, Order } from '../../types/supabase';

export type Database = {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Order, 'id' | 'created_at' | 'updated_at'>>;
      };
      // Autres tables disponibles dans la base de données
    };
  };
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ufnfvfpdbacylxsmwbdv.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmbmZ2ZnBkYmFjeWx4c213YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTEzODQwMDksImV4cCI6MjAyNjk2MDAwOX0.E2PoFsQVLXl3A9HtKZgUGvnjL7s6gYLXSGqQsyeULQA';



export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'akanda-supabase-auth',
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  global: {
    headers: {
      'X-Client-Info': 'Akanda Apero App'
    },
  },
});