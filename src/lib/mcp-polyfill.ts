// Ce fichier fournit une implémentation simplifiée du client MCP pour éviter les erreurs avec les modules Node.js

import { supabase } from './supabase/client';
import { Product, ProductImage, Category, CocktailKit, CocktailKitIngredient } from '../types/supabase';

// Fonction utilitaire pour créer des slugs
function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
    .replace(/[^\w-]+/g, '') // Supprimer les caractères non alphanumériques
    .replace(/--+/g, '-'); // Supprimer les tirets multiples
}

// Type pour les données de création de produit avec images et catégories
type CreateProductData = {
  product: Omit<Product, 'id' | 'created_at' | 'updated_at'>;
  images?: { image_url: string; alt_text?: string }[];
  categories?: string[];
};

// Type pour les données de création de kit de cocktail avec ingrédients
type CreateCocktailKitData = {
  kit: Omit<CocktailKit, 'id' | 'created_at' | 'updated_at'>;
  ingredients?: Omit<CocktailKitIngredient, 'id' | 'cocktail_kit_id' | 'created_at' | 'updated_at'>[];
};

// Client MCP simplifié qui utilise directement Supabase au lieu de passer par @genkit-ai/next
export function useMcpPolyfill(serverName: string) {
  // On ignore le nom du serveur car nous allons directement implémenter les fonctions dont nous avons besoin
  
  return {
    // Fonction pour lire les produits - version simplifiée et robuste pour mobile
    async read(resourceName: string) {
      // Gestion des produits
      if (resourceName === 'products') {
        try {
          console.log('🔍 Récupération des produits...');
          
          // Utilisation de fetch directement avec l'apikey
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mcdpzoisorbnhkjhljaj.supabase.co';
          const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jZHB6b2lzb3JibmhramhsamFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MjM3ODQsImV4cCI6MjA2MjE5OTc4NH0.S4omBGzpY3_8TEYJD2YBQwoyZg67nBOEJIUrZ4pZkcA';
          
          const response = await fetch(`${supabaseUrl}/rest/v1/products?select=*`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`
            }
          });
          
          if (!response.ok) {
            console.error("❌ Erreur lors de la récupération des produits:", response.status, response.statusText);
            return [];
          }
          
          const productsData = await response.json();

          if (!productsData || productsData.length === 0) {
            console.log("ℹ️ Aucun produit trouvé dans la base de données");
            return [];
          }

          // Récupérer les images pour tous les produits
          const productIds = productsData.map((p: any) => p.id);
          const { data: imagesData } = await supabase
            .from('product_images')
            .select('*')
            .in('product_id', productIds);

          // Récupérer les catégories si elles existent
          let categoriesData: any[] = [];
          try {
            const { data: categories } = await supabase
              .from('product_categories')
              .select('*')
              .in('product_id', productIds);
            
            if (categories) categoriesData = categories;
          } catch (err) {
            console.log("⚠️ Erreur lors de la récupération des catégories");
            // On continue sans catégories
          }

          // Fusion des données
          const enhancedProducts = productsData.map((product: any) => ({
            ...product,
            product_images: imagesData ? imagesData.filter((img: any) => img.product_id === product.id) : [],
            product_categories: categoriesData.filter((cat: any) => cat.product_id === product.id),
            // Ajout de champs utiles pour la migration vers des données statiques si nécessaire
            is_featured: product.is_featured || false,
            stock_quantity: product.stock_quantity || 10
          }));

          console.log(`✅ ${enhancedProducts.length} produits récupérés`);
          return enhancedProducts;
        } catch (error) {
          console.error("💥 Erreur lors de la récupération des produits:", error);
          // Si on ne peut pas récupérer depuis Supabase, retourner des produits statiques de secours
          return [];
        }
      }
      
      // Gestion des catégories
      else if (resourceName === 'categories') {
        try {
          console.log('🔍 Récupération des catégories...');
          
          // Utilisation de fetch directement avec l'apikey
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mcdpzoisorbnhkjhljaj.supabase.co';
          const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jZHB6b2lzb3JibmhramhsamFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MjM3ODQsImV4cCI6MjA2MjE5OTc4NH0.S4omBGzpY3_8TEYJD2YBQwoyZg67nBOEJIUrZ4pZkcA';
          
          const response = await fetch(`${supabaseUrl}/rest/v1/categories?select=*`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`
            }
          });
          
          if (!response.ok) {
            console.error("❌ Erreur lors de la récupération des catégories:", response.status, response.statusText);
            return [];
          }
          
          const categoriesData = await response.json();
          
          console.log(`✅ ${categoriesData?.length || 0} catégories récupérées`);
          return categoriesData || [];
        } catch (error) {
          console.error("💥 Erreur lors de la récupération des catégories:", error);
          return [];
        }
      }
      
      // Gestion des commandes
      if (resourceName === 'orders') {
        try {
          console.log('🔍 Récupération des commandes...');
          const { data, error } = await supabase
            .from('orders')
            .select('*');
          
          if (error) {
            console.error("❌ Erreur lors de la récupération des commandes:", error);
            return [];
          }
          
          console.log(`✅ ${data?.length || 0} commandes récupérées`);
          return data || [];
        } catch (error) {
          console.error("💥 Erreur lors de la récupération des commandes:", error);
          return [];
        }
      }
      
      // Gestion des kits cocktail
      if (resourceName === 'cocktail-kits') {
        try {
          console.log('🔍 Récupération des kits cocktail...');
          
          // Récupérer les kits
          const { data: kitsData, error: kitsError } = await supabase
            .from('cocktail_kits')
            .select('*');
          
          if (kitsError) {
            console.error('❌ Erreur lors de la récupération des kits:', kitsError);
            return [];
          }
          
          if (!kitsData || kitsData.length === 0) {
            console.log('ℹ️ Aucun kit de cocktail trouvé');
            return [];
          }
          
          // Récupérer les ingrédients séparément pour chaque kit
          const processedData = await Promise.all(kitsData.map(async (kit: any) => {
            try {
              const { data: ingredientsData } = await supabase
                .from('cocktail_kit_ingredients')
                .select('*')
                .eq('cocktail_kit_id', kit.id);
              
              return {
                ...kit,
                ingredients: Array.isArray(ingredientsData) ? ingredientsData : []
              };
            } catch (err) {
              // Continuer avec les données du kit, même en cas d'erreur
              return {
                ...kit,
                ingredients: []
              };
            }
          }));
          
          console.log(`✅ ${processedData.length} kits cocktail récupérés`);
          return processedData;
        } catch (error) {
          console.error('💥 Erreur lors de la récupération des kits de cocktail:', error);
          return [];
        }
      }
      
      console.warn(`Resource "${resourceName}" not implemented in MCP polyfill`);
      return [];
    },
    
    // Fonction pour obtenir une ressource par son ID
    getById: async (resourceName: string, id: string) => {
      if (resourceName === 'products') {
        try {
          const { data, error } = await supabase
            .from('products')
            .select('*, product_images(*)')
            .eq('id', id)
            .single();
          
          if (error) throw new Error(error.message);
          return data;
        } catch (error) {
          console.error(`Erreur lors de la récupération du produit ${id}:`, error);
          return null;
        }
      }
      
      if (resourceName === 'cocktail-kits') {
        try {
          const { data: kit, error: kitError } = await supabase
            .from('cocktail_kits')
            .select('*')
            .eq('id', id)
            .single();
          
          if (kitError) throw new Error(kitError.message);
          
          const { data: ingredients } = await supabase
            .from('cocktail_kit_ingredients')
            .select('*')
            .eq('cocktail_kit_id', id);
          
          return {
            ...kit,
            ingredients: ingredients || []
          };
        } catch (error) {
          console.error(`Erreur lors de la récupération du kit ${id}:`, error);
          return null;
        }
      }
      
      return null;
    },
    
    // Fonction pour créer une ressource
    create: async (resourceName: string, body: any) => {
      if (resourceName === 'products') {
        try {
          const { data, error } = await supabase
            .from('products')
            .insert(body)
            .select();
          
          if (error) throw new Error(error.message);
          return data;
        } catch (error) {
          console.error('Erreur lors de la création du produit:', error);
          throw error;
        }
      }
      
      if (resourceName === 'categories') {
        const { data, error } = await supabase
          .from('categories')
          .insert(body)
          .select();
        
        if (error) throw new Error(error.message);
        return data;
      }
      
      if (resourceName === 'cocktail-kits') {
        try {
          const { data, error } = await supabase
            .from('cocktail_kits')
            .insert(body.kit || body)
            .select();
          
          if (error) throw new Error(error.message);
          return data;
        } catch (error) {
          console.error('Erreur lors de la création du kit cocktail:', error);
          throw error;
        }
      }
      
      throw new Error(`Resource "${resourceName}" not implemented in MCP polyfill`);
    },
    
    // Fonction pour mettre à jour une ressource
    update: async (resourceName: string, id: string, body: any) => {
      if (resourceName === 'products') {
        try {
          const { data, error } = await supabase
            .from('products')
            .update(body)
            .eq('id', id)
            .select();
          
          if (error) throw new Error(error.message);
          return data;
        } catch (error) {
          console.error(`Erreur lors de la mise à jour du produit ${id}:`, error);
          throw error;
        }
      }
      
      if (resourceName === 'categories') {
        const { data, error } = await supabase
          .from('categories')
          .update(body)
          .eq('id', id)
          .select();
        
        if (error) throw new Error(error.message);
        return data;
      }
      
      if (resourceName === 'cocktail-kits') {
        try {
          const { data, error } = await supabase
            .from('cocktail_kits')
            .update(body.kit || body)
            .eq('id', id)
            .select();
          
          if (error) throw new Error(error.message);
          return data;
        } catch (error) {
          console.error(`Erreur lors de la mise à jour du kit cocktail ${id}:`, error);
          throw error;
        }
      }
      
      throw new Error(`Resource "${resourceName}" not implemented in MCP polyfill`);
    },
    
    // Fonction pour supprimer une ressource
    delete: async (resourceName: string, id: string) => {
      if (resourceName === 'products') {
        try {
          const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);
          
          if (error) throw new Error(error.message);
          return { success: true };
        } catch (error) {
          console.error(`Erreur lors de la suppression du produit ${id}:`, error);
          throw error;
        }
      }
      
      if (resourceName === 'categories') {
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', id);
        
        if (error) throw new Error(error.message);
        return { success: true };
      }
      
      if (resourceName === 'cocktail-kits') {
        try {
          const { error } = await supabase
            .from('cocktail_kits')
            .delete()
            .eq('id', id);
          
          if (error) throw new Error(error.message);
          return { success: true };
        } catch (error) {
          console.error(`Erreur lors de la suppression du kit cocktail ${id}:`, error);
          throw error;
        }
      }
      
      throw new Error(`Resource "${resourceName}" not implemented in MCP polyfill`);
    }
  };
}
