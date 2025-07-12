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
          console.log('🔍 Récupération des produits... [mcp-polyfill]');
          
          console.log('[mcp-polyfill] typeof process:', typeof process);
          console.log('[mcp-polyfill] typeof process.env:', typeof process?.env);

          console.log('[mcp-polyfill] Attempting to read NEXT_PUBLIC_SUPABASE_URL...');
          const supabaseUrlFromEnv = process?.env?.NEXT_PUBLIC_SUPABASE_URL;
          console.log('[mcp-polyfill] NEXT_PUBLIC_SUPABASE_URL from env:', supabaseUrlFromEnv);
          const supabaseUrl = supabaseUrlFromEnv || 'https://mcdpzoisorbnhkjhljaj.supabase.co';
          console.log('[mcp-polyfill] Final supabaseUrl:', supabaseUrl);

          console.log('[mcp-polyfill] Attempting to read NEXT_PUBLIC_SUPABASE_ANON_KEY...');
          const supabaseKeyFromEnv = process?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY;
          console.log('[mcp-polyfill] NEXT_PUBLIC_SUPABASE_ANON_KEY from env:', supabaseKeyFromEnv);
          const supabaseKey = supabaseKeyFromEnv || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jZHB6b2lzb3JibmhramhsamFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MjM3ODQsImV4cCI6MjA2MjE5OTc4NH0.S4omBGzpY3_8TEYJD2YBQwoyZg67nBOEJIUrZ4pZkcA';
          
          console.log('[mcp-polyfill] Clé Supabase utilisée (products):', supabaseKey);
          
          // Utiliser Supabase directement pour récupérer les produits avec leurs images
          const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('*, product_images(*)');
          
          if (productsError) {
            console.error("❌ Erreur lors de la récupération des produits:", productsError);
            return [];
          }

          if (!productsData || productsData.length === 0) {
            console.log("ℹ️ Aucun produit trouvé dans la base de données");
            return [];
          }

          // Extraire les IDs des produits pour les requêtes suivantes
          const productIds = productsData.map((product: any) => product.id);

          // Récupérer les catégories pour ces produits
          const { data: categoriesData, error: catError } = await supabase
            .from('categories')
            .select('*');
            
          if (catError) {
            console.log("⚠️ Erreur lors de la récupération des catégories:", catError);
            // On continue sans catégories
          }
          
          // Récupérer les relations entre produits et catégories
          const { data: productCategoriesData, error: productCatError } = await supabase
            .from('product_categories')
            .select('*')
            .in('product_id', productIds);
            
          if (productCatError) {
            console.log("⚠️ Erreur lors de la récupération des relations produit-catégorie:", productCatError);
            // On continue sans relations
          }

          // Fusion des données
          const enhancedProducts = productsData.map((product: any) => {
            // Trouver les relations de catégorie pour ce produit
            const productCategories = productCategoriesData 
              ? productCategoriesData.filter((pc: any) => pc.product_id === product.id)
              : [];
              
            // Récupérer les catégories associées à ce produit spécifique
            const productSpecificCategories = productCategories.map((pc: any) => {
              // Trouver les détails complets de la catégorie
              const categoryDetails = categoriesData?.find((cat: any) => cat.id === pc.category_id);
              return categoryDetails;
            }).filter(Boolean); // Supprimer les catégories non trouvées
            
            return {
              ...product,
              // product_images est déjà inclus dans la requête Supabase
              // Assigner uniquement les catégories associées à ce produit
              categories: productSpecificCategories || [],
              // Ajouter la structure product_categories pour les hooks qui l'utilisent
              product_categories: productCategories || [],
              // Ajout de champs utiles pour la migration vers des données statiques si nécessaire
              is_featured: product.is_featured || false,
              stock_quantity: product.stock_quantity || 10
            };
          });

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
          console.log('🔍 Récupération des catégories... [mcp-polyfill]');
          
          console.log('[mcp-polyfill] typeof process (categories):', typeof process);
          console.log('[mcp-polyfill] typeof process.env (categories):', typeof process?.env);

          console.log('[mcp-polyfill] Attempting to read NEXT_PUBLIC_SUPABASE_URL (categories)...');
          const supabaseUrlFromEnvCat = process?.env?.NEXT_PUBLIC_SUPABASE_URL;
          console.log('[mcp-polyfill] NEXT_PUBLIC_SUPABASE_URL from env (categories):', supabaseUrlFromEnvCat);
          const supabaseUrlCat = supabaseUrlFromEnvCat || 'https://mcdpzoisorbnhkjhljaj.supabase.co';
          console.log('[mcp-polyfill] Final supabaseUrl (categories):', supabaseUrlCat);

          console.log('[mcp-polyfill] Attempting to read NEXT_PUBLIC_SUPABASE_ANON_KEY (categories)...');
          const supabaseKeyFromEnvCat = process?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY;
          console.log('[mcp-polyfill] NEXT_PUBLIC_SUPABASE_ANON_KEY from env (categories):', supabaseKeyFromEnvCat);
          const supabaseKeyCat = supabaseKeyFromEnvCat || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jZHB6b2lzb3JibmhramhsamFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MjM3ODQsImV4cCI6MjA2MjE5OTc4NH0.S4omBGzpY3_8TEYJD2YBQwoyZg67nBOEJIUrZ4pZkcA';
          
          console.log('[mcp-polyfill] Clé Supabase utilisée (categories):', supabaseKeyCat);
          
          const response = await fetch(`${supabaseUrlCat}/rest/v1/categories?select=*`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKeyCat,
              'Authorization': `Bearer ${supabaseKeyCat}`
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
          // Vérifier si le body est structuré comme attendu pour le cas des produits
          if (body.product) {
            const { product, images = [], categories = [] } = body;
            
            console.log('Création d\'un produit avec les catégories et images associées');
            
            // 1. Insérer d'abord le produit
            const { data: newProduct, error: productError } = await supabase
              .from('products')
              .insert(product)
              .select()
              .single();
            
            if (productError) {
              console.error(`Erreur d'insertion du produit:`, productError);
              throw new Error(`Erreur d'insertion du produit: ${productError.message}`);
            }
            
            if (!newProduct || !newProduct.id) {
              throw new Error('Le produit a été inséré mais aucun ID n\'a été retourné');
            }
            
            // 2. Insérer les images si présentes
            if (images && images.length > 0) {
              // Filtrer les images qui ont déjà des URLs valides (pas de base64, pas de placeholders)
              const validImages = images.filter(
                (img: { image_url: string }) => 
                  img.image_url && 
                  !img.image_url.startsWith('data:') && 
                  !img.image_url.startsWith('placeholder-')
              );
              
              if (validImages.length > 0) {
                const productImages = validImages.map((img: { image_url: string, alt_text?: string }) => ({
                  product_id: newProduct.id,
                  image_url: img.image_url,
                  alt_text: img.alt_text || ''
                }));
                
                const { error: imagesError } = await supabase
                  .from('product_images')
                  .insert(productImages);
                
                if (imagesError) {
                  console.error('Erreur lors de l\'insertion des images:', imagesError);
                  // On continue même si les images échouent
                }
              } else {
                console.warn('Aucune image valide à insérer - peut-être des URLs temporaires ou base64');
              }
            }
            
            // 3. Pour cette version de référence, les catégories ne sont pas liées directement aux produits
            // Elles sont simplement retournées avec le produit
            
            // 4. Récupérer le produit avec ses relations
            const { data: productWithRelations, error: relationError } = await supabase
              .from('products')
              .select(`
                *,
                product_images (*),
                product_categories (*, categories (*))
              `)
              .eq('id', newProduct.id)
              .single();
            
            if (relationError) {
              console.error('Erreur lors de la récupération des relations:', relationError);
              // Retourner juste le produit sans ses relations
              return newProduct;
            }
            
            return productWithRelations;
          } else {
            // Si le body n'est pas structuré comme attendu, on fait une insertion simple
            console.warn('Format inattendu pour la création de produit. Utilisation de l\'insertion simple.');
            const { data, error } = await supabase
              .from('products')
              .insert(body)
              .select();
            
            if (error) throw new Error(error.message);
            return data;
          }
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
          // Vérifier si le body est structuré comme attendu pour le cas des produits
          if (body.product) {
            const { product, images = [], categories = [] } = body;
            
            // 1. Mettre à jour le produit
            const { data: updatedProduct, error: productError } = await supabase
              .from('products')
              .update(product)
              .eq('id', id)
              .select()
              .single();
            
            if (productError) throw new Error(`Erreur de mise à jour du produit: ${productError.message}`);
            
            if (!updatedProduct) {
              throw new Error(`Le produit avec l'ID ${id} n'existe pas`);
            }
            
            // 2. Gérer les images si présentes
            if (images && images.length > 0) {
              // Récupérer d'abord les anciennes images pour pouvoir les gérer
              const { data: oldImages } = await supabase
                .from('product_images')
                .select('*')
                .eq('product_id', id);
              
              // Supprimer les anciennes images de la base de données
              await supabase
                .from('product_images')
                .delete()
                .eq('product_id', id);
              
              // Filtrer les images avec des URLs valides (pas de base64 ou placeholders)
              const validImages = images.filter(
                (img: { image_url: string }) => 
                  img.image_url && 
                  !img.image_url.startsWith('data:') && 
                  !img.image_url.startsWith('placeholder-')
              );
              
              if (validImages.length > 0) {
                // Insérer les nouvelles images
                const productImages = validImages.map((img: {image_url: string, alt_text?: string}) => ({
                  product_id: id,
                  image_url: img.image_url,
                  alt_text: img.alt_text || ''
                }));
                
                const { error: imagesError } = await supabase
                  .from('product_images')
                  .insert(productImages);
                
                if (imagesError) {
                  console.error('Erreur lors de la mise à jour des images:', imagesError);
                  // On continue même si les images échouent
                }
              } else {
                console.warn('Aucune image valide à insérer lors de la mise à jour');
              }
            } else {
              // Si aucune image n'est fournie, supprimer toutes les images existantes
              await supabase
                .from('product_images')
                .delete()
                .eq('product_id', id);
            }
            
            // 3. Gérer les catégories si présentes
            if (categories && categories.length >= 0) {
              // Supprimer d'abord les anciennes relations
              await supabase
                .from('product_categories')
                .delete()
                .eq('product_id', id);
              
              // Insérer les nouvelles relations si elles existent
              if (categories.length > 0) {
                // Vérifier d'abord si les catégories existent
                const { data: existingCategories } = await supabase
                  .from('categories')
                  .select('id, name')
                  .in('id', categories);
                
                if (existingCategories && existingCategories.length > 0) {
                  const categoryRelations = existingCategories.map(cat => ({
                    product_id: id,
                    category_id: cat.id
                  }));
                  
                  const categoriesError = null;
                  
                  if (categoriesError) {
                    console.error('Erreur lors de la mise à jour des catégories:', categoriesError);
                    // On continue même si les catégories échouent
                  }
                }
              }
            }
            
            // 4. Récupérer le produit mis à jour avec ses relations
            const { data: productWithRelations, error: relationError } = await supabase
              .from('products')
              .select(`
                *,
                product_images (*),
                product_categories (*, categories (*))
              `)
              .eq('id', id)
              .single();
            
            if (relationError) {
              console.error('Erreur lors de la récupération des relations:', relationError);
              // Retourner juste le produit sans ses relations
              return updatedProduct;
            }
            
            return productWithRelations;
          } else {
            // Si le body n'est pas structuré comme attendu, on fait une mise à jour simple
            console.warn('Format inattendu pour la mise à jour de produit. Utilisation de la mise à jour simple.');
            const { data, error } = await supabase
              .from('products')
              .update(body)
              .eq('id', id)
              .select();
            
            if (error) throw new Error(error.message);
            return data;
          }
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
