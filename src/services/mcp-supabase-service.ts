/**
 * Service pour récupérer les données directement via MCP Supabase
 */

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category_id?: string;
  is_active: boolean;
  is_featured: boolean;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
  categories?: Category[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  slug: string;
  emoji?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Récupère tous les produits actifs avec leurs catégories
 */
export async function getProductsWithCategories(): Promise<Product[]> {
  try {
    // Simuler un appel API pour récupérer les données
    // En production, ceci ferait appel au serveur MCP Supabase
    const response = await fetch('/api/mcp/supabase?action=getProducts');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des produits:', error);
    return [];
  }
}

/**
 * Récupère toutes les catégories actives
 */
export async function getActiveCategories(): Promise<Category[]> {
  try {
    const response = await fetch('/api/mcp/supabase?action=getCategories');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.categories || [];
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des catégories:', error);
    return [];
  }
}

/**
 * Compte les produits dans une catégorie
 */
export function countProductsInCategory(
  products: Product[], 
  categoryId: string, 
  featuredOnly: boolean = false
): number {
  return products.filter(product => {
    const belongsToCategory = product.category_id === categoryId;
    if (featuredOnly) {
      return belongsToCategory && product.is_featured;
    }
    return belongsToCategory;
  }).length;
}

/**
 * Vérifie si un produit appartient à une catégorie
 */
export function productBelongsToCategory(product: Product, categoryId: string): boolean {
  return product.category_id === categoryId;
}
