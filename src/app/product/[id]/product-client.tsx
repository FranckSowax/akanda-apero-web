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
import { Header } from '../../../components/layout/Header';
import { getProductImageUrl } from '../../../utils/imageUtils';

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



function convertToUIProduct(product: SupabaseProduct, categoryName?: string): UIProduct {
  return {
    id: product.id,
    name: product.name,
    description: product.description || '',
    price: product.base_price,
    imageUrl: getProductImageUrl(product),
    rating: 4.5,
    discount: product.sale_price ? Math.round((1 - product.base_price / product.sale_price) * 100) : undefined,
    details: product.description || '',
    ingredients: 'Voir détails sur l\'étiquette du produit',
    stock: product.stock_quantity,
    categoryId: product.category_id || undefined,
    categoryName: categoryName,
    isPromo: product.sale_price ? product.base_price < product.sale_price : false
  };
}


export default function ProductClient({ productId }: { productId: string }) {
  const { addToCart } = useAppContext();
  const [quantity, setQuantity] = useState(1);
  const [uiProduct, setUIProduct] = useState<UIProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<UIProduct[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const { getProductById, getRelatedProducts } = useProductDetail();
  const { getCategories } = useCategories();
  
  const { data: productData, isLoading: productLoading, error: productError } = getProductById(productId);
  const { data: categoriesData, isLoading: categoriesLoading } = getCategories();
  
  const categoryId = productData?.product_categories?.[0]?.category_id || '';
    
  const { data: relatedProductsData, isLoading: relatedProductsLoading } = 
    getRelatedProducts(categoryId, productId);
  
  useEffect(() => {
    if (productData && !productLoading) {
      const categoryId = productData.product_categories?.[0]?.category_id;
      const categoryName = categoryId && categoriesData
        ? categoriesData.find((c: { id: string; name: string }) => c.id === categoryId)?.name
        : undefined;
      
      setUIProduct(convertToUIProduct(productData, categoryName));
    }
    
    if (relatedProductsData && !relatedProductsLoading && categoriesData) {
      const convertedProducts = relatedProductsData.map((prod: SupabaseProduct) => {
        const catId = prod.category_id;
        const catName = catId && categoriesData
          ? categoriesData.find((c: { id: string; name: string }) => c.id === catId)?.name
          : undefined;
        
        return convertToUIProduct(prod, catName);
      });
      
      setRelatedProducts(convertedProducts);
    }
  }, [productData, productLoading, relatedProductsData, relatedProductsLoading, categoriesData]);
  
  const handleQuantityChange = (delta: number) => {
    setQuantity((prev: number) => {
      const newQuantity = prev + delta;
      return newQuantity > 0 && newQuantity <= (uiProduct?.stock || 10) ? newQuantity : prev;
    });
  };

  const handleAddToCart = () => {
    if (uiProduct) {
      const adaptedProduct = {
        id: Number(uiProduct.id),
        name: uiProduct.name,
        description: uiProduct.description || '',
        price: uiProduct.price,
        imageUrl: uiProduct.imageUrl,
        currency: 'XAF',
        categorySlug: uiProduct.categoryId || 'default',
        stock: uiProduct.stock || 0
      };
      
      addToCart(adaptedProduct, quantity);
      
      // Afficher une notification ou un feedback visuel
      const toast = document.getElementById('toast-success');
      if (toast) {
        toast.classList.remove('hidden');
        setTimeout(() => {
          toast.classList.add('hidden');
        }, 3000);
      }
    }
  };

  const toggleFavorite = () => {
    setIsFavorite((prev: boolean) => !prev);
  };


  if (productLoading || categoriesLoading) {
    return (
      <div className="container mx-auto py-20">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }


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
    <>
      <Header />
      <div className="bg-background min-h-screen relative">
      {/* Toast de succès */}
      <div id="toast-success" className="hidden fixed bottom-4 right-4 left-4 sm:left-auto sm:right-4 sm:bottom-4 z-50 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md animate-fadeIn">
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
          <p>Produit ajouté au panier</p>
        </div>
      </div>

      <div className="container mx-auto pt-3 sm:pt-6 pb-1 sm:pb-4 text-xs sm:text-sm text-muted-foreground px-3 sm:px-6">
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
          <span>/</span>
          <Link href="/produits" className="hover:text-primary transition-colors">Produits</Link>
          <span>/</span>
          {uiProduct.categoryName && (
            <>
              <Link href={`/category/${uiProduct.categoryId}`} className="hover:text-primary transition-colors">{uiProduct.categoryName}</Link>
              <span>/</span>
            </>
          )}
          <span className="text-foreground font-medium truncate max-w-[140px] xs:max-w-none">{uiProduct.name}</span>
        </div>
      </div>

      <div className="container mx-auto py-3 sm:py-8 px-3 xs:px-4">  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-8 mb-4 sm:mb-12">

          <div className="space-y-4">
            <div className="relative h-[280px] xs:h-[350px] sm:h-[400px] md:h-[500px] rounded-xl overflow-hidden shadow-lg bg-muted">
              <Image
                src={uiProduct.imageUrl}
                alt={uiProduct.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                onError={(e) => {
                  // Fallback si l'image ne charge pas
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = '/images/placeholder-product.svg';
                }}
              />
              {uiProduct.discount && uiProduct.discount > 0 && (
                <Badge className="absolute top-4 left-4 text-sm font-semibold bg-red-500">
                  -{uiProduct.discount}%
                </Badge>
              )}
            </div>
          </div>


          <div className="space-y-6">
            <Button variant="ghost" size="sm" className="mb-2" asChild>
              <Link href="/products" className="flex items-center gap-1">
                <ArrowLeft size={16} />
                Retour aux produits
              </Link>
            </Button>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">{uiProduct.name}</h1>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < Math.floor(uiProduct.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                    />
                  ))}
                </div>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {uiProduct.rating} (12 avis)
                </span>
              </div>
              
              <div className="flex flex-wrap items-baseline gap-2 pt-2">
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">
                  {uiProduct.price.toLocaleString('fr-FR')} XAF
                </span>
                {uiProduct.discount && uiProduct.discount > 0 && (
                  <span className="text-sm sm:text-lg text-muted-foreground line-through">
                    {(uiProduct.price * 100 / (100 - uiProduct.discount)).toLocaleString('fr-FR')} XAF
                  </span>
                )}
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">{uiProduct.description}</p>

            <div className="pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm xs:text-base">Quantité</span>
                <div className="flex items-center gap-2 xs:gap-3 border rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 xs:h-10 xs:w-10 touch-manipulation"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <Minus size={16} className="xs:size-[18px]" />
                  </Button>
                  <span className="w-6 xs:w-8 text-center text-sm xs:text-base">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 xs:h-10 xs:w-10 touch-manipulation"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= uiProduct.stock}
                  >
                    <Plus size={16} className="xs:size-[18px]" />
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

            <div className="pt-4 xs:pt-6 flex flex-col sm:flex-row gap-2 xs:gap-3">
              <Button
                className="flex-1 gap-2 h-10 xs:h-12 sm:h-auto text-sm xs:text-base touch-manipulation"
                size="lg"
                onClick={handleAddToCart}
                disabled={uiProduct.stock <= 0}
              >
                <ShoppingCart size={18} className="xs:size-[20px]" />
                Ajouter au panier
              </Button>
              <Button
                variant="outline"
                size="lg"
                className={`h-10 xs:h-12 sm:h-auto touch-manipulation ${isFavorite ? "text-red-500" : ""}`}
                onClick={toggleFavorite}
              >
                <Heart size={18} className={`xs:size-[20px] ${isFavorite ? "fill-red-500" : ""}`} />
              </Button>
            </div>
          </div>
        </div>


        <Tabs defaultValue="description" className="w-full mb-8 sm:mb-12">
          <TabsList className="grid grid-cols-3 mb-4 touch-manipulation">
            <TabsTrigger value="description" className="text-[11px] xs:text-xs sm:text-sm py-1.5 xs:py-2 sm:py-1.5 touch-manipulation">Description</TabsTrigger>
            <TabsTrigger value="ingredients" className="text-[11px] xs:text-xs sm:text-sm py-1.5 xs:py-2 sm:py-1.5 touch-manipulation">Ingrédients</TabsTrigger>
            <TabsTrigger value="details" className="text-[11px] xs:text-xs sm:text-sm py-1.5 xs:py-2 sm:py-1.5 touch-manipulation">Détails</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="border rounded-md p-4 sm:p-6">
            <div className="prose max-w-none">
              <p className="leading-relaxed text-sm sm:text-base">{uiProduct.description}</p>
            </div>
          </TabsContent>
          <TabsContent value="ingredients" className="border rounded-md p-4 sm:p-6">
            <div className="prose max-w-none">
              <p className="leading-relaxed text-sm sm:text-base">{uiProduct.ingredients}</p>
            </div>
          </TabsContent>
          <TabsContent value="details" className="border rounded-md p-4 sm:p-6">
            <div className="prose max-w-none">
              <p className="leading-relaxed text-sm sm:text-base">{uiProduct.details}</p>
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
          <div className="py-6 sm:py-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Produits similaires</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {relatedProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <Link href={`/product/${product.id}`}>
                    <div className="relative h-36 sm:h-48 bg-muted">
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
                  <CardContent className="p-3 sm:p-4">
                    <h3 className="font-medium text-sm sm:text-base truncate">{product.name}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-bold text-sm sm:text-base text-primary">
                        {product.price.toLocaleString('fr-FR')} XAF
                      </span>
                      <Link href={`/product/${product.id}`}>
                        <Button size="sm" variant="ghost" className="h-8 px-2 py-0">
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
    </>
  );
}
