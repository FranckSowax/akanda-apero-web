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
      cocktails_maison: {
        Row: {
          id: string;
          name: string;
          description: string;
          base_price: number;
          difficulty_level: number;
          preparation_time_minutes: number;
          category: string;
          recipe?: string;
          image_url?: string;
          video_url?: string;
          video_type?: string;
          alcohol_percentage?: number;
          is_active: boolean;
          is_featured: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          name: string;
          description: string;
          base_price: number;
          difficulty_level: number;
          preparation_time_minutes: number;
          category: string;
          recipe?: string;
          image_url?: string;
          video_url?: string;
          video_type?: string;
          alcohol_percentage?: number;
          is_active?: boolean;
          is_featured?: boolean;
        };
        Update: Partial<{
          name: string;
          description: string;
          base_price: number;
          difficulty_level: number;
          preparation_time_minutes: number;
          category: string;
          recipe?: string;
          image_url?: string;
          video_url?: string;
          video_type?: string;
          alcohol_percentage?: number;
          is_active: boolean;
          is_featured: boolean;
        }>;
      };
      mocktails: {
        Row: {
          id: string;
          name: string;
          description: string;
          base_price: number;
          difficulty_level: number;
          preparation_time_minutes: number;
          category: string;
          recipe?: string;
          image_url?: string;
          video_url?: string;
          video_type?: string;
          is_active: boolean;
          is_featured: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          name: string;
          description: string;
          base_price: number;
          difficulty_level: number;
          preparation_time_minutes: number;
          category: string;
          recipe?: string;
          image_url?: string;
          video_url?: string;
          video_type?: string;
          is_active?: boolean;
          is_featured?: boolean;
        };
        Update: Partial<{
          name: string;
          description: string;
          base_price: number;
          difficulty_level: number;
          preparation_time_minutes: number;
          category: string;
          recipe?: string;
          image_url?: string;
          video_url?: string;
          video_type?: string;
          is_active: boolean;
          is_featured: boolean;
        }>;
      };
    };
  };
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mcdpzoisorbnhkjhljaj.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jZHB6b2lzb3JibmhramhsamFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MjM3ODQsImV4cCI6MjA2MjE5OTc4NH0.S4omBGzpY3_8TEYJD2YBQwoyZg67nBOEJIUrZ4pZkcA';

// Configuration améliorée pour éviter les erreurs 400 refresh_token
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'akanda-supabase-auth',
    detectSessionInUrl: true,
    flowType: 'pkce',
    // Nouvelles options pour corriger les erreurs de refresh
    storage: {
      getItem: (key: string) => {
        try {
          return localStorage.getItem(key);
        } catch (error) {
          console.warn('Erreur lors de la lecture du localStorage:', error);
          return null;
        }
      },
      setItem: (key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.warn('Erreur lors de l\'écriture dans le localStorage:', error);
        }
      },
      removeItem: (key: string) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn('Erreur lors de la suppression du localStorage:', error);
        }
      },
    },
    // Gestion des erreurs de refresh token
    onAuthStateChange: (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email || 'No user');
      
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        // Nettoyer le localStorage en cas de déconnexion
        try {
          localStorage.removeItem('akanda-supabase-auth');
        } catch (error) {
          console.warn('Erreur lors du nettoyage:', error);
        }
      }
    },
  },
  global: {
    headers: {
      'X-Client-Info': 'Akanda Apero App',
      'apikey': supabaseAnonKey
    },
  },
  // Options pour gérer les timeouts et retry
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Fonction utilitaire pour gérer les erreurs d'authentification
export const handleAuthError = async (error: any) => {
  console.error('Erreur d\'authentification:', error);
  
  if (error?.message?.includes('refresh_token') || error?.status === 400) {
    console.log('Erreur de refresh token détectée, nettoyage en cours...');
    
    try {
      // Nettoyer les tokens corrompus
      localStorage.removeItem('akanda-supabase-auth');
      sessionStorage.clear();
      
      // Forcer une déconnexion propre
      await supabase.auth.signOut();
      
      console.log('Nettoyage terminé. Veuillez vous reconnecter.');
      
      // Optionnel : rediriger vers la page de connexion
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    } catch (cleanupError) {
      console.error('Erreur lors du nettoyage:', cleanupError);
    }
  }
};

// Wrapper pour les requêtes avec gestion d'erreur automatique
export const safeSupabaseQuery = async <T>(
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: any }> => {
  try {
    const result = await queryFn();
    
    if (result.error) {
      await handleAuthError(result.error);
    }
    
    return result;
  } catch (error) {
    await handleAuthError(error);
    return { data: null, error };
  }
};

export default supabase;
