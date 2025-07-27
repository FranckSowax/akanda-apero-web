/**
 * Utilitaires pour valider et nettoyer les produits avant ajout au panier
 */

export interface ValidatedProduct {
  id: string;
  name: string;
  base_price: number;
  sale_price?: number;
  image_url?: string;
  emoji?: string;
  [key: string]: any;
}

/**
 * Valide si un UUID est au format correct
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Valide et nettoie un produit avant ajout au panier
 */
export const validateProduct = (product: any): ValidatedProduct | null => {
  // Vérifications de base
  if (!product) {
    console.warn('🚫 Produit null ou undefined détecté');
    return null;
  }

  if (!product.id) {
    console.warn('🚫 Produit sans ID détecté:', product);
    return null;
  }

  const productId = String(product.id);

  // Vérifier si l'ID est un UUID valide
  if (!isValidUUID(productId)) {
    console.warn('🚫 Produit avec ID invalide détecté:', {
      id: productId,
      name: product.name,
      type: typeof product.id
    });
    return null;
  }

  // Vérifier les champs obligatoires
  if (!product.name || typeof product.name !== 'string') {
    console.warn('🚫 Produit sans nom valide détecté:', product);
    return null;
  }

  if (!product.base_price || typeof product.base_price !== 'number') {
    console.warn('🚫 Produit sans prix valide détecté:', product);
    return null;
  }

  // Retourner le produit validé et nettoyé
  const validatedProduct: ValidatedProduct = {
    id: productId,
    name: product.name,
    base_price: product.base_price,
    sale_price: product.sale_price || null,
    image_url: product.image_url || product.imageUrl || null,
    emoji: product.emoji || null,
    // Conserver les autres propriétés
    ...product
  };

  console.log('✅ Produit validé avec succès:', {
    id: validatedProduct.id,
    name: validatedProduct.name,
    price: validatedProduct.base_price
  });

  return validatedProduct;
};

/**
 * Valide une liste de produits et filtre les invalides
 */
export const validateProducts = (products: any[]): ValidatedProduct[] => {
  if (!Array.isArray(products)) {
    console.warn('🚫 Liste de produits invalide (pas un tableau)');
    return [];
  }

  const validProducts: ValidatedProduct[] = [];
  let invalidCount = 0;

  products.forEach((product, index) => {
    const validatedProduct = validateProduct(product);
    if (validatedProduct) {
      validProducts.push(validatedProduct);
    } else {
      invalidCount++;
      console.warn(`🚫 Produit invalide à l'index ${index}:`, product);
    }
  });

  if (invalidCount > 0) {
    console.warn(`⚠️ ${invalidCount} produit(s) invalide(s) filtré(s) sur ${products.length}`);
  }

  console.log(`✅ ${validProducts.length} produit(s) validé(s) avec succès`);
  return validProducts;
};

/**
 * Génère un UUID v4 valide (fallback si nécessaire)
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
