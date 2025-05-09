// Ce fichier fournit une implémentation simplifiée du client MCP pour éviter les erreurs avec les modules Node.js

import { supabase } from './supabase/client';

import { Product, ProductImage, Category } from '../types/supabase';

// Type pour les données de création de produit avec images et catégories
type CreateProductData = {
  product: Omit<Product, 'id' | 'created_at' | 'updated_at'>;
  images?: { image_url: string; alt_text?: string }[];
  categories?: string[];
};

// Client MCP simplifié qui utilise directement Supabase au lieu de passer par @genkit-ai/next
export function useMcpPolyfill(serverName: string) {
  // On ignore le nom du serveur car nous allons directement implémenter les fonctions dont nous avons besoin
  
  return {
    // Fonction pour lire les produits
    async read(resourceName: string) {
      if (resourceName === 'products') {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *, 
            product_images(*), 
            product_categories!inner(category_id, categories:category_id(id, name))
          `);
        
        if (error) throw new Error(error.message);
        
        // Transformer les données pour s'assurer que l'interface est cohérente
        const processedData = data.map(product => {
          // S'assurer que product_images est toujours un tableau
          const images = product.product_images || [];
          
          // Extraire les catégories associées au produit
          const categories = (product.product_categories || []).map((pc: {categories: any}) => pc.categories);
          
          return {
            ...product,
            product_images: images,
            categories: categories,
            main_image: images.length > 0 ? images[0].image_url : null
          };
        });
        
        return processedData;
      }
      
      if (resourceName === 'categories') {
        // Récupérer les catégories avec le nombre de produits dans chaque catégorie
        const { data: categories, error } = await supabase
          .from('categories')
          .select('id, name, slug, description, image_url, color, icon, parent_id, created_at, updated_at');
        
        if (error) throw new Error(error.message);
        
        // Récupérer les relations produit-catégorie pour calculer le nombre de produits
        const { data: productCategoriesData, error: pcError } = await supabase
          .from('product_categories')
          .select('category_id');
        
        if (pcError) throw new Error(pcError.message);
        
        // Calculer le nombre de produits par catégorie
        const categoryCounts: Record<string, number> = {};
        productCategoriesData.forEach((pc: { category_id: string }) => {
          categoryCounts[pc.category_id] = (categoryCounts[pc.category_id] || 0) + 1;
        });
        
        // Ajouter le nombre de produits et les propriétés manquantes à chaque catégorie
        return categories.map(category => ({
          ...category,
          color: category.color || '#868e96', // Couleur grise par défaut si non définie
          icon: category.icon || 'Package',   // Icône par défaut si non définie
          product_count: categoryCounts[category.id] || 0
        }));
      }
      
      if (resourceName === 'orders') {
        const { data, error } = await supabase
          .from('orders')
          .select('*');
        
        if (error) throw new Error(error.message);
        return data;
      }
      
      throw new Error(`Resource "${resourceName}" not implemented in MCP polyfill`);
    },
    
    // Fonction pour créer une ressource
    create: (resourceName: string) => ({
      mutateAsync: async (body: any) => {
        if (resourceName === 'products') {
          // Si le body contient des champs spécifiques pour les images et catégories
          if (body.product && (body.images || body.categories)) {
            // Début de la transaction
            // 1. Créer le produit
            const { data: product, error: productError } = await supabase
              .from('products')
              .insert(body.product)
              .select();
            
            if (productError) throw new Error(`Erreur lors de la création du produit: ${productError.message}`);
            const productId = product[0].id;
            
            // 2. Ajouter les images si présentes
            if (body.images && body.images.length > 0) {
              const productImages = body.images.map((img: any, index: number) => ({
                product_id: productId,
                image_url: img.image_url,
                alt_text: img.alt_text || null,
                position: index + 1
              }));
              
              const { error: imagesError } = await supabase
                .from('product_images')
                .insert(productImages);
                
              if (imagesError) throw new Error(`Erreur lors de l'ajout des images: ${imagesError.message}`);
            }
            
            // 3. Ajouter les catégories si présentes
            if (body.categories && body.categories.length > 0) {
              const productCategories = body.categories.map((categoryId: string) => ({
                product_id: productId,
                category_id: categoryId
              }));
              
              const { error: categoriesError } = await supabase
                .from('product_categories')
                .insert(productCategories);
                
              if (categoriesError) throw new Error(`Erreur lors de l'ajout des catégories: ${categoriesError.message}`);
            }
            
            // Récupérer le produit complet avec ses relations
            const { data: fullProduct, error: fetchError } = await supabase
              .from('products')
              .select('*, product_images(*), product_categories(category_id)')
              .eq('id', productId)
              .single();
              
            if (fetchError) throw new Error(`Erreur lors de la récupération du produit complet: ${fetchError.message}`);
            return fullProduct;
          } else {
            // Comportement standard si pas de structure spécifique
            const { data, error } = await supabase
              .from('products')
              .insert(body)
              .select();
            
            if (error) throw new Error(error.message);
            return data[0];
          }
        }
        
        // Création de catégorie
        if (resourceName === 'categories') {
          // Filtrer les propriétés qui n'existent pas dans la table
          const { color, icon, ...validCategoryData } = body;
          
          const { data, error } = await supabase
            .from('categories')
            .insert(validCategoryData)
            .select('id, name, slug, description, image_url, parent_id, created_at, updated_at');
          
          if (error) throw new Error(error.message);
          
          // Ajouter les propriétés manquantes au résultat
          return {
            ...data[0],
            color: color || '#868e96', // Utiliser la couleur fournie ou une valeur par défaut
            icon: icon || 'tag' // Utiliser l'icône fournie ou une valeur par défaut
          };
        }
        
        throw new Error(`Create for resource "${resourceName}" not implemented in MCP polyfill`);
      }
    }),
    
    // Récupérer un produit par ID
    getById: (resourceName: string, id: string) => {
      if (resourceName === 'products') {
        return supabase
          .from('products')
          .select('*, product_images(*), product_categories(category_id)')
          .eq('id', id)
          .single()
          .then(({ data, error }) => {
            if (error) throw new Error(error.message);
            return data;
          });
      }
      
      throw new Error(`getById for resource "${resourceName}" not implemented in MCP polyfill`);
    },
    
    // Fonction pour mettre à jour une ressource
    update: (resourceName: string) => ({
      mutateAsync: async ({ id, ...body }: any) => {
        if (resourceName === 'products') {
          // Si le body contient des données structurées avec images et catégories
          if (body.product || body.images || body.categories) {
            // 1. Mettre à jour le produit si nécessaire
            if (body.product) {
              const { error: updateError } = await supabase
                .from('products')
                .update(body.product)
                .eq('id', id);
                
              if (updateError) throw new Error(`Erreur lors de la mise à jour du produit: ${updateError.message}`);
            }
            
            // 2. Gérer les images si spécifiées
            if (body.images) {
              // Supprimer toutes les images existantes
              const { error: deleteImagesError } = await supabase
                .from('product_images')
                .delete()
                .eq('product_id', id);
                
              if (deleteImagesError) throw new Error(`Erreur lors de la suppression des images: ${deleteImagesError.message}`);
              
              // Ajouter les nouvelles images si présentes
              if (body.images.length > 0) {
                const productImages = body.images.map((img: any, index: number) => ({
                  product_id: id,
                  image_url: img.image_url,
                  alt_text: img.alt_text || null,
                  position: index + 1
                }));
                
                const { error: imagesError } = await supabase
                  .from('product_images')
                  .insert(productImages);
                  
                if (imagesError) throw new Error(`Erreur lors de l'ajout des nouvelles images: ${imagesError.message}`);
              }
            }
            
            // 3. Gérer les catégories si spécifiées
            if (body.categories) {
              // Supprimer toutes les catégories existantes
              const { error: deleteCategoriesError } = await supabase
                .from('product_categories')
                .delete()
                .eq('product_id', id);
                
              if (deleteCategoriesError) throw new Error(`Erreur lors de la suppression des catégories: ${deleteCategoriesError.message}`);
              
              // Ajouter les nouvelles catégories si présentes
              if (body.categories.length > 0) {
                const productCategories = body.categories.map((categoryId: string) => ({
                  product_id: id,
                  category_id: categoryId
                }));
                
                const { error: categoriesError } = await supabase
                  .from('product_categories')
                  .insert(productCategories);
                  
                if (categoriesError) throw new Error(`Erreur lors de l'ajout des nouvelles catégories: ${categoriesError.message}`);
              }
            }
            
            // Récupérer le produit complet avec ses relations
            const { data: fullProduct, error: fetchError } = await supabase
              .from('products')
              .select('*, product_images(*), product_categories(category_id)')
              .eq('id', id)
              .single();
              
            if (fetchError) throw new Error(`Erreur lors de la récupération du produit complet: ${fetchError.message}`);
            return fullProduct;
          } else {
            // Comportement standard pour la mise à jour simple
            const { data, error } = await supabase
              .from('products')
              .update(body)
              .eq('id', id)
              .select();
            
            if (error) throw new Error(error.message);
            return data[0];
          }
        }
        
        // Mise à jour de catégorie
        if (resourceName === 'categories') {
          // Filtrer les propriétés qui n'existent pas dans la table
          const { color, icon, ...validCategoryData } = body;
          
          const { data, error } = await supabase
            .from('categories')
            .update(validCategoryData)
            .eq('id', id)
            .select('id, name, slug, description, image_url, parent_id, created_at, updated_at');
          
          if (error) throw new Error(error.message);
          
          // Ajouter les propriétés manquantes au résultat
          return {
            ...data[0],
            color: color || '#868e96', // Utiliser la couleur fournie ou une valeur par défaut
            icon: icon || 'tag' // Utiliser l'icône fournie ou une valeur par défaut
          };
        }
        
        throw new Error(`Update for resource "${resourceName}" not implemented in MCP polyfill`);
      }
    }),
    
    // Fonction pour supprimer une ressource
    delete: (resourceName: string) => ({
      mutateAsync: async (id: string) => {
        if (resourceName === 'products') {
          const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);
          
          if (error) throw new Error(error.message);
          // Retourner l'ID comme chaîne de caractères pour correspondre à ce qu'attend le hook
          return id;
        }
        
        if (resourceName === 'categories') {
          // Vérifier si des produits sont associés à cette catégorie
          const { data: relatedProducts, error: checkError } = await supabase
            .from('product_categories')
            .select('*')
            .eq('category_id', id);
            
          if (checkError) throw new Error(checkError.message);
          
          // Si des produits sont associés, ne pas autoriser la suppression
          if (relatedProducts && relatedProducts.length > 0) {
            throw new Error(`Impossible de supprimer la catégorie car ${relatedProducts.length} produit(s) y sont associés.`);
          }
          
          // Sinon, supprimer la catégorie
          const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);
          
          if (error) throw new Error(error.message);
          return id;
        }
        
        throw new Error(`Delete for resource "${resourceName}" not implemented in MCP polyfill`);
      }
    })
  };
}
