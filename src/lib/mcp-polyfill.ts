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
    // Fonction pour lire les produits
    async read(resourceName: string) {
      if (resourceName === 'products') {
        try {
          const { data, error } = await supabase
            .from('products')
            .select(`
              *, 
              product_images(*), 
              product_categories!inner(category_id, categories:category_id(id, name))
            `);
          
          if (error) {
            console.error("Erreur lors de la récupération des produits:", error);
            return [];
          }
          
          // Transformer les données pour s'assurer que l'interface est cohérente
          return data.map(product => {
            // Extraire les catégories
            const categories = product.product_categories
              ? product.product_categories.map((pc: any) => pc.categories).filter(Boolean)
              : [];
            
            return {
              ...product,
              categories
            };
          });
        } catch (error) {
          console.error("Exception lors de la récupération des produits:", error);
          return [];
        }
      }
      
      if (resourceName === 'categories') {
        try {
          const { data, error } = await supabase
            .from('categories')
            .select('*');
          
          if (error) {
            console.error("Erreur lors de la récupération des catégories:", error);
            return [];
          }
          
          return data;
        } catch (error) {
          console.error("Exception lors de la récupération des catégories:", error);
          return [];
        }
      }
      
      if (resourceName === 'orders') {
        try {
          const { data, error } = await supabase
            .from('orders')
            .select('*');
          
          if (error) {
            console.error("Erreur lors de la récupération des commandes:", error);
            return [];
          }
          
          return data;
        } catch (error) {
          console.error("Exception lors de la récupération des commandes:", error);
          return [];
        }
      }
      
      if (resourceName === 'cocktail-kits') {
        try {
          console.log('Début de la récupération des kits de cocktail');
          
          // 1. D'abord, récupérer les kits de cocktail sans les ingrédients
          const { data: kitsData, error: kitsError } = await supabase
            .from('cocktail_kits')
            .select('*');
          
          if (kitsError) {
            console.error('Erreur lors de la récupération des kits:', kitsError);
            // Pour éviter de bloquer l'application, retournons un tableau vide
            return [];
          }
          
          if (!kitsData || kitsData.length === 0) {
            console.log('Aucun kit de cocktail trouvé');
            return [];
          }
          
          // 2. Récupérer les ingrédients séparément pour chaque kit
          const processedData = await Promise.all(kitsData.map(async (kit) => {
            try {
              // Vérifier si la table d'ingrédients existe
              const { data: ingredientsData, error: ingredientsError } = await supabase
                .from('cocktail_kit_ingredients')
                .select('*')
                .eq('cocktail_kit_id', kit.id);
              
              if (ingredientsError) {
                console.error(`Erreur lors de la récupération des ingrédients pour le kit ${kit.id}:`, ingredientsError);
                // Continuer avec un tableau vide d'ingrédients
                return {
                  ...kit,
                  ingredients: []
                };
              }
              
              // S'assurer que les ingrédients sont bien formatés
              return {
                ...kit,
                ingredients: Array.isArray(ingredientsData) ? ingredientsData : []
              };
            } catch (err) {
              console.error(`Exception lors de la récupération des ingrédients pour le kit ${kit.id}:`, err);
              // Continuer avec les données du kit, même en cas d'erreur sur les ingrédients
              return {
                ...kit,
                ingredients: []
              };
            }
          }));
          
          return processedData;
        } catch (error) {
          console.error('Erreur lors de la récupération des kits de cocktail:', error);
          // Pour éviter de bloquer l'application, retournons un tableau vide
          return [];
        }
      }
      
      console.warn(`Resource "${resourceName}" not implemented in MCP polyfill`);
      return [];
    },
    
    // Fonction pour obtenir une ressource par son ID
    getById: (resourceName: string, id: string) => ({
      queryKey: [resourceName, id],
      queryFn: async () => {
        if (resourceName === 'products') {
          try {
            const { data, error } = await supabase
              .from('products')
              .select(`
                *, 
                product_images(*), 
                product_categories!inner(category_id, categories:category_id(id, name))
              `)
              .eq('id', id)
              .single();
            
            if (error) throw new Error(error.message);
            
            // Transformer les données pour s'assurer que l'interface est cohérente
            const categories = data.product_categories
              ? data.product_categories.map((pc: any) => pc.categories).filter(Boolean)
              : [];
            
            return {
              ...data,
              categories
            };
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
            
            const { data: ingredients, error: ingredientsError } = await supabase
              .from('cocktail_kit_ingredients')
              .select('*')
              .eq('cocktail_kit_id', id);
            
            if (ingredientsError) throw new Error(ingredientsError.message);
            
            return {
              ...kit,
              ingredients: ingredients || []
            };
          } catch (error) {
            console.error(`Erreur lors de la récupération du kit ${id}:`, error);
            return null;
          }
        }
        
        throw new Error(`Resource "${resourceName}" not implemented in MCP polyfill`);
      }
    }),
    
    // Fonction pour créer une ressource
    create: (resourceName: string) => ({
      mutateAsync: async (body: any) => {
        if (resourceName === 'products') {
          // Si le body contient des champs spécifiques pour les images et catégories
          if (body.product && (body.images || body.categories)) {
            // Début de la transaction
            try {
              const { product, images, categories } = body as CreateProductData;
              
              // 1. Insérer d'abord le produit
              const { data: newProduct, error: productError } = await supabase
                .from('products')
                .insert(product)
                .select()
                .single();
              
              if (productError) throw new Error(productError.message);
              
              // 2. Si nous avons des images, les associer au produit
              if (images && images.length > 0) {
                const productImages = images.map((img, index) => ({
                  product_id: newProduct.id,
                  image_url: img.image_url,
                  alt_text: img.alt_text || `Image ${index + 1} for ${product.name}`,
                  position: index
                }));
                
                const { error: imagesError } = await supabase
                  .from('product_images')
                  .insert(productImages);
                
                if (imagesError) throw new Error(imagesError.message);
              }
              
              // 3. Si nous avons des catégories, créer les associations
              if (categories && categories.length > 0) {
                const productCategories = categories.map(categoryId => ({
                  product_id: newProduct.id,
                  category_id: categoryId
                }));
                
                const { error: categoriesError } = await supabase
                  .from('product_categories')
                  .insert(productCategories);
                
                if (categoriesError) throw new Error(categoriesError.message);
              }
              
              // Tout s'est bien passé, retourner le produit créé
              return newProduct;
            } catch (error) {
              console.error('Erreur lors de la création du produit:', error);
              throw error;
            }
          } else {
            // Cas simple : juste insérer le produit sans relations
            const { data, error } = await supabase
              .from('products')
              .insert(body)
              .select();
            
            if (error) throw new Error(error.message);
            return data;
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
          if (body.kit && body.ingredients) {
            try {
              const { kit, ingredients } = body as CreateCocktailKitData;
              
              // 1. Insérer le kit de cocktail
              const { data: newKit, error: kitError } = await supabase
                .from('cocktail_kits')
                .insert(kit)
                .select()
                .single();
              
              if (kitError) throw new Error(kitError.message);
              
              // 2. Si nous avons des ingrédients, les associer au kit
              if (ingredients && ingredients.length > 0) {
                const kitIngredients = ingredients.map(ingredient => ({
                  ...ingredient,
                  cocktail_kit_id: newKit.id
                }));
                
                const { error: ingredientsError } = await supabase
                  .from('cocktail_kit_ingredients')
                  .insert(kitIngredients);
                
                if (ingredientsError) throw new Error(ingredientsError.message);
              }
              
              // Tout s'est bien passé, retourner le kit créé
              return {
                ...newKit,
                ingredients: ingredients || []
              };
            } catch (error) {
              console.error('Erreur lors de la création du kit:', error);
              throw error;
            }
          } else {
            // Cas simple : juste insérer le kit sans ingrédients
            const { data, error } = await supabase
              .from('cocktail_kits')
              .insert(body)
              .select();
            
            if (error) throw new Error(error.message);
            return data;
          }
        }
        
        throw new Error(`Resource "${resourceName}" not implemented in MCP polyfill`);
      }
    }),
    
    // Fonction pour mettre à jour une ressource
    update: (resourceName: string, id: string) => ({
      mutateAsync: async (body: any) => {
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
          try {
            const { data, error } = await supabase
              .from('categories')
              .update(body)
              .eq('id', id)
              .select();
            
            if (error) throw new Error(error.message);
            return data;
          } catch (error) {
            console.error(`Erreur lors de la mise à jour de la catégorie ${id}:`, error);
            throw error;
          }
        }
        
        if (resourceName === 'cocktail-kits') {
          try {
            // Si body contient à la fois des données de kit et d'ingrédients
            if (body.kit && body.ingredients) {
              // 1. Mettre à jour le kit
              const { data: updatedKit, error: kitError } = await supabase
                .from('cocktail_kits')
                .update(body.kit)
                .eq('id', id)
                .select();
              
              if (kitError) throw new Error(kitError.message);
              
              // 2. Supprimer les ingrédients existants
              const { error: deleteError } = await supabase
                .from('cocktail_kit_ingredients')
                .delete()
                .eq('cocktail_kit_id', id);
              
              if (deleteError) throw new Error(deleteError.message);
              
              // 3. Ajouter les nouveaux ingrédients
              if (body.ingredients && body.ingredients.length > 0) {
                const kitIngredients = body.ingredients.map((ingredient: any) => ({
                  ...ingredient,
                  cocktail_kit_id: id
                }));
                
                const { error: ingredientsError } = await supabase
                  .from('cocktail_kit_ingredients')
                  .insert(kitIngredients);
                
                if (ingredientsError) throw new Error(ingredientsError.message);
              }
              
              return {
                ...updatedKit[0],
                ingredients: body.ingredients
              };
            } else {
              // Cas simple : juste mettre à jour le kit sans toucher aux ingrédients
              const { data, error } = await supabase
                .from('cocktail_kits')
                .update(body)
                .eq('id', id)
                .select();
              
              if (error) throw new Error(error.message);
              return data;
            }
          } catch (error) {
            console.error(`Erreur lors de la mise à jour du kit ${id}:`, error);
            throw error;
          }
        }
        
        throw new Error(`Resource "${resourceName}" not implemented in MCP polyfill`);
      }
    }),
    
    // Fonction pour supprimer une ressource
    delete: (resourceName: string, id: string) => ({
      mutateAsync: async () => {
        if (resourceName === 'products') {
          try {
            // Supprimer d'abord les relations (images et catégories)
            await supabase
              .from('product_images')
              .delete()
              .eq('product_id', id);
            
            await supabase
              .from('product_categories')
              .delete()
              .eq('product_id', id);
            
            // Puis supprimer le produit
            const { data, error } = await supabase
              .from('products')
              .delete()
              .eq('id', id)
              .select();
            
            if (error) throw new Error(error.message);
            return data;
          } catch (error) {
            console.error(`Erreur lors de la suppression du produit ${id}:`, error);
            throw error;
          }
        }
        
        if (resourceName === 'categories') {
          try {
            // Vérifier si la catégorie est utilisée par des produits
            const { data: usedCategories, error: checkError } = await supabase
              .from('product_categories')
              .select('*')
              .eq('category_id', id);
            
            if (checkError) throw new Error(checkError.message);
            
            if (usedCategories && usedCategories.length > 0) {
              throw new Error(`Cette catégorie est utilisée par ${usedCategories.length} produit(s) et ne peut pas être supprimée.`);
            }
            
            const { data, error } = await supabase
              .from('categories')
              .delete()
              .eq('id', id)
              .select();
            
            if (error) throw new Error(error.message);
            return data;
          } catch (error) {
            console.error(`Erreur lors de la suppression de la catégorie ${id}:`, error);
            throw error;
          }
        }
        
        if (resourceName === 'cocktail-kits') {
          try {
            // Supprimer d'abord les ingrédients
            await supabase
              .from('cocktail_kit_ingredients')
              .delete()
              .eq('cocktail_kit_id', id);
            
            // Puis supprimer le kit
            const { data, error } = await supabase
              .from('cocktail_kits')
              .delete()
              .eq('id', id)
              .select();
            
            if (error) throw new Error(error.message);
            return data;
          } catch (error) {
            console.error(`Erreur lors de la suppression du kit ${id}:`, error);
            throw error;
          }
        }
        
        throw new Error(`Resource "${resourceName}" not implemented in MCP polyfill`);
      }
    })
  };
}
