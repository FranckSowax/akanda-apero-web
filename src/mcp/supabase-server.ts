// Import désactivé pour le build de production
// import { createMcpServer } from '@genkit-ai/next';

// Fonction de remplacement simplifiée pour le build
const createMcpServer = (config: any) => config;
import { supabase } from '../lib/supabase/client';

export const supabaseServer = createMcpServer({
  name: 'supabase',
  version: '1.0.0',
  resources: [
    // Ressources pour les produits
    {
      name: 'products',
      read: async () => {
        const { data, error } = await supabase
          .from('products')
          .select('*, product_images(*), product_categories(category_id)');
        
        if (error) throw new Error(error.message);
        return data;
      },
      create: async ({ body }) => {
        const { data, error } = await supabase
          .from('products')
          .insert(body)
          .select();
        
        if (error) throw new Error(error.message);
        return data[0];
      },
      update: async ({ params, body }) => {
        const { data, error } = await supabase
          .from('products')
          .update(body)
          .match({ id: params.id })
          .select();
        
        if (error) throw new Error(error.message);
        return data[0];
      },
      delete: async ({ params }) => {
        const { error } = await supabase
          .from('products')
          .delete()
          .match({ id: params.id });
        
        if (error) throw new Error(error.message);
        return { success: true };
      }
    },
    
    // Ressources pour les catégories
    {
      name: 'categories',
      read: async () => {
        const { data, error } = await supabase
          .from('categories')
          .select('*');
        
        if (error) throw new Error(error.message);
        return data;
      },
      create: async ({ body }) => {
        const { data, error } = await supabase
          .from('categories')
          .insert(body)
          .select();
        
        if (error) throw new Error(error.message);
        return data[0];
      },
      update: async ({ params, body }) => {
        const { data, error } = await supabase
          .from('categories')
          .update(body)
          .match({ id: params.id })
          .select();
        
        if (error) throw new Error(error.message);
        return data[0];
      },
      delete: async ({ params }) => {
        const { error } = await supabase
          .from('categories')
          .delete()
          .match({ id: params.id });
        
        if (error) throw new Error(error.message);
        return { success: true };
      }
    },
    
    // Ressources pour les commandes
    {
      name: 'orders',
      read: async () => {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*), customers(*)');
        
        if (error) throw new Error(error.message);
        return data;
      },
      create: async ({ body }) => {
        const { data, error } = await supabase
          .from('orders')
          .insert(body)
          .select();
        
        if (error) throw new Error(error.message);
        return data[0];
      },
      update: async ({ params, body }) => {
        const { data, error } = await supabase
          .from('orders')
          .update(body)
          .match({ id: params.id })
          .select();
        
        if (error) throw new Error(error.message);
        return data[0];
      }
    },
    
    // Ressources pour les problèmes
    {
      name: 'problemes',
      read: async () => {
        const { data, error } = await supabase
          .from('problemes')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw new Error(error.message);
        return data;
      },
      create: async ({ body }) => {
        const { data, error } = await supabase
          .from('problemes')
          .insert(body)
          .select();
        
        if (error) throw new Error(error.message);
        return data[0];
      },
      update: async ({ params, body }) => {
        const { data, error } = await supabase
          .from('problemes')
          .update(body)
          .match({ id: params.id })
          .select();
        
        if (error) throw new Error(error.message);
        return data[0];
      },
      delete: async ({ params }) => {
        const { error } = await supabase
          .from('problemes')
          .delete()
          .match({ id: params.id });
        
        if (error) throw new Error(error.message);
        return { success: true };
      }
    },
    
    // Ressource pour exécuter du SQL brut (pour les migrations)
    {
      name: 'sql',
      execute: async ({ body }) => {
        const { data, error } = await supabase.rpc('execute_sql', { sql_query: body.query });
        
        if (error) throw new Error(error.message);
        return data;
      }
    }
  ]
});
