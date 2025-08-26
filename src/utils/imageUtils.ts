/**
 * Utilitaires pour la gestion des images des produits
 */

export interface SupabaseProduct {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  product_images?: Array<{
    image_url: string;
    alt_text?: string;
  }>;
}

/**
 * Récupère l'URL de l'image d'un produit Supabase
 * Priorité : imageUrl directe > image_url directe > product_images[0].image_url > placeholder
 */
export function getProductImageUrl(product: SupabaseProduct | any): string {
  // Priorité 1: imageUrl directe (produits déjà convertis)
  if (product?.imageUrl && product.imageUrl !== '' && !product.imageUrl.includes('placeholder')) {
    return product.imageUrl;
  }

  // Priorité 2: image_url directe (structure Supabase products)
  if (product?.image_url && product.image_url !== '' && !product.image_url.includes('placeholder')) {
    return product.image_url;
  }

  // Priorité 3: product_images array (structure Supabase avec relation)
  if (product?.product_images && Array.isArray(product.product_images) && product.product_images.length > 0) {
    const firstImage = product.product_images[0];
    if (firstImage?.image_url && firstImage.image_url !== '') {
      return firstImage.image_url;
    }
  }

  // Fallback: placeholder local uniquement
  return '/images/placeholder-product.svg';
}

/**
 * Convertit un produit Supabase au format UI avec imageUrl correcte
 */
export function convertSupabaseProductToUI(product: SupabaseProduct): SupabaseProduct {
  return {
    ...product,
    imageUrl: getProductImageUrl(product)
  };
}
