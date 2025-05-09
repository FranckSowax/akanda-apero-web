'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Minus, Plus, Star, ShoppingCart, Heart } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { useAppContext } from '../../../context/AppContext';
import { useProductDetail } from '../../../hooks/supabase/useProductDetail';
import { useCategories } from '../../../hooks/supabase/useCategories';
import { Product as SupabaseProduct } from '../../../types/supabase';

// Types pour notre interface utilisateur
interface UIProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  rating?: number;
  discount?: number;
  details?: string;
  ingredients?: string;
  stock: number;
  categoryId?: string;
  categoryName?: string;
  isPromo?: boolean;
}

// Fonction utilitaire pour obtenir une URL d'image fiable
function getProductImageUrl(product: SupabaseProduct): string {
  if (product?.product_images && Array.isArray(product.product_images) && product.product_images.length > 0) {
    const imageUrl = product.product_images[0].image_url;
    
    // Vérifier si c'est un Data URL (commence par "data:")
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('data:')) {
      return imageUrl; // Les Data URLs sont directement utilisables
    }
    
    // Vérifier si c'est un placeholder temporaire
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('placeholder-')) {
      // Générer une image aléatoire basée sur l'ID du produit
      return `https://source.unsplash.com/random/800x600?sig=${product.id}`;
    }
    
    // Vérifier si l'URL est un blob local (ne fonctionnera pas pour le rendu)
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('blob:')) {
      // Renvoyer une URL d'image aléatoire pour le développement
      return `https://source.unsplash.com/random/800x600?sig=${product.id}`;
    }
    
    return imageUrl;
  }
  
  // Image par défaut si aucune image n'est disponible
  return 'https://picsum.photos/seed/default/600/600';
}

// Fonction utilitaire pour convertir un produit Supabase en UIProduct
function convertToUIProduct(product: SupabaseProduct, categoryName?: string): UIProduct {
  return {
    id: product.id,
    name: product.name,
    description: product.description || '',
    price: product.price,
    imageUrl: getProductImageUrl(product),
    rating: 4.5, // Valeur par défaut (à remplacer par une vraie donnée de notation quand disponible)
    discount: product.compare_at_price ? Math.round((1 - product.price / product.compare_at_price) * 100) : undefined,
    details: product.description || '', // Utilisez description comme détails pour l'instant
    ingredients: 'Voir détails sur l\'étiquette du produit',
    stock: product.stock_quantity,
    categoryId: product.product_categories && product.product_categories.length > 0 
      ? product.product_categories[0].category_id 
      : undefined,
    categoryName: categoryName,
    isPromo: product.compare_at_price ? product.price < product.compare_at_price : false
  };
}

// Composant principal pour la page produit
export default function ProductClient({ productId }: { productId: string }) {
  const { addToCart } = useAppContext();
  const [quantity, setQuantity] = useState(1);
  const [uiProduct, setUIProduct] = useState<UIProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<UIProduct[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Récupérer les données depuis Supabase
  const { getProductById, getRelatedProducts } = useProductDetail();
  const { getCategories } = useCategories();
  
  const { data: productData, isLoading: productLoading, error: productError } = getProductById(productId);
  const { data: categoriesData, isLoading: categoriesLoading } = getCategories();
  
  // Si le produit a des catégories, récupérer les produits liés
  const categoryId = productData?.product_categories && productData.product_categories.length > 0 
    ? productData.product_categories[0].category_id 
    : '';
    
  const { data: relatedProductsData, isLoading: relatedProductsLoading } = 
    getRelatedProducts(categoryId, productId);
  
  // Convertir les données de Supabase en format UI
  useEffect(() => {
    if (productData && !productLoading) {
      // Trouver le nom de la catégorie si disponible
      const categoryName = productData.product_categories && 
                          productData.product_categories.length > 0 && 
                          categoriesData
        ? categoriesData.find((c: { id: string; name: string }) => c.id === productData.product_categories[0].category_id)?.name
        : undefined;
      
      setUIProduct(convertToUIProduct(productData, categoryName));
    }
    
    if (relatedProductsData && !relatedProductsLoading && categoriesData) {
      const convertedProducts = relatedProductsData.map((prod: SupabaseProduct) => {
        // Trouver le nom de la catégorie pour chaque produit lié
        const catId = prod.product_categories && prod.product_categories.length > 0
          ? prod.product_categories[0].category_id
          : undefined;
        const catName = catId && categoriesData
          ? categoriesData.find((c: { id: string; name: string }) => c.id === catId)?.name
          : undefined;
        
        return convertToUIProduct(prod, catName);
      });
      
      setRelatedProducts(convertedProducts);
    }
  }, [productData, productLoading, relatedProductsData, relatedProductsLoading, categoriesData]);
  
  // Gérer le changement de quantité
  const handleQuantityChange = (delta: number) => {
    setQuantity((prev: number) => {
      const newQuantity = prev + delta;
      return newQuantity > 0 && newQuantity <= (uiProduct?.stock || 10) ? newQuantity : prev;
    });
  };

  // Gérer l'ajout au panier
  const handleAddToCart = () => {
    if (uiProduct) {
      addToCart({
        id: uiProduct.id,
        name: uiProduct.name,
        price: uiProduct.price,
        image: uiProduct.imageUrl,
        quantity: quantity
      });
    }
  };

  // Gérer le toggle des favoris
  const toggleFavorite = () => {
    setIsFavorite((prev: boolean) => !prev);
  };

  // Afficher un indicateur de chargement pendant le chargement des données
  if (productLoading || categoriesLoading) {
    return (
      <div className="container mx-auto py-20">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Afficher un message d'erreur si le produit n'existe pas
  if (productError || !uiProduct) {
    return (
      <div className="container mx-auto py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Produit introuvable</h2>
          <p className="text-muted-foreground mb-6">Le produit que vous recherchez n'existe pas ou a été supprimé.</p>
          <Button asChild>
            <Link href="/products">Voir tous les produits</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Breadcrumb */}
      <div className="container mx-auto pt-6 pb-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Link href="/">Accueil</Link>
          <span>/</span>
          <Link href="/products">Produits</Link>
          <span>/</span>
          {uiProduct.categoryName && (
            <>
              <Link href={`/category/${uiProduct.categoryId}`}>{uiProduct.categoryName}</Link>
              <span>/</span>
            </>
          )}
          <span className="text-foreground font-medium">{uiProduct.name}</span>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative h-[400px] md:h-[500px] rounded-xl overflow-hidden shadow-lg bg-muted">
              <Image
                src={uiProduct.imageUrl}
                alt={uiProduct.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              {uiProduct.discount && uiProduct.discount > 0 && (
                <Badge className="absolute top-4 left-4 text-sm font-semibold bg-red-500">
                  -{uiProduct.discount}%
                </Badge>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <Button variant="ghost" size="sm" className="mb-2" asChild>
              <Link href="/products" className="flex items-center gap-1">
                <ArrowLeft size={16} />
                Retour aux produits
              </Link>
            </Button>

            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{uiProduct.name}</h1>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.floor(uiProduct.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {uiProduct.rating} (12 avis)
                </span>
              </div>
              
              <div className="flex items-baseline gap-2 pt-2">
                <span className="text-2xl md:text-3xl font-bold">
                  {uiProduct.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </span>
                {uiProduct.discount && uiProduct.discount > 0 && (
                  <span className="text-lg text-muted-foreground line-through">
                    {(uiProduct.price * 100 / (100 - uiProduct.discount)).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                )}
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">{uiProduct.description}</p>

            <div className="pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Quantité</span>
                <div className="flex items-center gap-3 border rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <Minus size={16} />
                  </Button>
                  <span className="w-8 text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= uiProduct.stock}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </div>

              <div className="flex items-center text-sm">
                <span className={uiProduct.stock > 0 ? "text-green-600" : "text-red-600"}>
                  {uiProduct.stock > 0
                    ? `En stock (${uiProduct.stock} restants)`
                    : "Épuisé"}
                </span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Button
                className="flex-1 gap-2"
                size="lg"
                onClick={handleAddToCart}
                disabled={uiProduct.stock <= 0}
              >
                <ShoppingCart size={18} />
                Ajouter au panier
              </Button>
              <Button
                variant="outline"
                size="lg"
                className={isFavorite ? "text-red-500" : ""}
                onClick={toggleFavorite}
              >
                <Heart size={18} className={isFavorite ? "fill-red-500" : ""} />
              </Button>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <Tabs defaultValue="description" className="w-full mb-12">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="ingredients">Ingrédients</TabsTrigger>
            <TabsTrigger value="details">Détails</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="border rounded-md p-6">
            <div className="prose max-w-none">
              <p className="leading-relaxed">{uiProduct.description}</p>
            </div>
          </TabsContent>
          <TabsContent value="ingredients" className="border rounded-md p-6">
            <div className="prose max-w-none">
              <p className="leading-relaxed">{uiProduct.ingredients}</p>
            </div>
          </TabsContent>
          <TabsContent value="details" className="border rounded-md p-6">
            <div className="prose max-w-none">
              <p className="leading-relaxed">{uiProduct.details}</p>
              {uiProduct.isPromo && (
                <p className="mt-4">
                  <Badge className="bg-red-500">Promotion</Badge>
                  <span className="ml-2">
                    Économisez {uiProduct.discount}% sur ce produit pour une durée limitée!
                  </span>
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="py-8">
            <h2 className="text-2xl font-bold mb-6">Produits similaires</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <Link href={`/product/${product.id}`}>
                    <div className="relative h-48 bg-muted">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 25vw"
                      />
                      {product.discount && product.discount > 0 && (
                        <Badge className="absolute top-2 right-2 bg-red-500">
                          -{product.discount}%
                        </Badge>
                      )}
                    </div>
                  </Link>
                  <CardContent className="p-4">
                    <h3 className="font-semibold truncate">{product.name}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-bold">
                        {product.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </span>
                      <Link href={`/product/${product.id}`}>
                        <Button size="sm" variant="ghost">
                          Voir
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
