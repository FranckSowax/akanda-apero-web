// Test rapide pour vérifier que notre validation UUID fonctionne
const { validateProduct, isValidUUID } = require('./src/utils/productValidation.ts');

// Test du produit qui causait l'erreur
const testProduct = {
  "id": "5e2685b1-e2b3-4b24-8db3-0dac8dfdd772",
  "name": "Desperados Original",
  "price": 9000,
  "imageUrl": "https://mcdpzoisorbnhkjhljaj.supabase.co/storage/v1/object/public/images/products/1751739321552-blvldeh41r.png",
  "description": "Pack de 4 bouteilles de Desperados de 33 cl – 5.9°.",
  "currency": "XAF",
  "categorySlug": "featured",
  "stock": 100,
  "image_url": "https://mcdpzoisorbnhkjhljaj.supabase.co/storage/v1/object/public/images/products/1751739321552-blvldeh41r.png"
};

console.log('🧪 Test de validation UUID');
console.log('UUID valide ?', isValidUUID(testProduct.id));
console.log('Produit validé ?', validateProduct(testProduct) !== null);

// Test avec un produit invalide
const invalidProduct = {
  id: 123, // ID numérique invalide
  name: "Produit Test"
};

console.log('🧪 Test avec produit invalide');
console.log('UUID valide ?', isValidUUID(String(invalidProduct.id)));
console.log('Produit validé ?', validateProduct(invalidProduct) !== null);
