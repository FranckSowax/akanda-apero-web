'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ParallaxSection } from '../../components/ui/parallax-section';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { useAppContext } from '../../context/AppContext';
import { Button } from '../../components/ui/button';
import { Star, ArrowRight, ShoppingCart, X } from 'lucide-react';
import { useFeaturedProducts } from '../../hooks/supabase/useFeaturedProducts';
import { useCategories } from '../../hooks/supabase/useCategories';
import { Product, Category } from '../../types/supabase';
import { formatPrice } from '../../lib/utils/formatters';



export default function ProduitsPage() {
  const { addToCart } = useAppContext();
  const [activeCategory, setActiveCategory] = useState('bestseller');
  const [isAnimating, setIsAnimating] = useState(false);
  const { getFeaturedProducts, getProductsByCategory } = useFeaturedProducts();
  const { getCategories } = useCategories();
  
  // Récupérer les catégories
  const { data: categoriesData, isLoading: categoriesLoading } = getCategories();
  
  // Récupérer les produits en fonction de la catégorie active
  const { data: productsData, isLoading: productsLoading } = 
    activeCategory === 'bestseller' 
      ? getFeaturedProducts() 
      : getProductsByCategory(activeCategory);

  // Fonction pour changer de catégorie avec animation
  const handleCategoryChange = (categoryId: string) => {
    if (categoryId === activeCategory || isAnimating) return;
    
    setIsAnimating(true);
    
    // Délai pour permettre l'animation de sortie
    setTimeout(() => {
      setActiveCategory(categoryId);
      
      // Délai pour permettre l'animation d'entrée
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }, 300);
  };
  
  // Fonction pour ajouter un produit au panier
  const handleAddToCart = (product: Product) => {
    const imageUrl = product.product_images && product.product_images.length > 0 
      ? product.product_images[0].image_url 
      : 'https://picsum.photos/seed/default/600/600';
    
    addToCart(
      {
        id: parseInt(product.id) || 0, // Convertir l'ID en nombre
        name: product.name,
        price: product.price,
        imageUrl: imageUrl,
        description: product.description || '',
        currency: 'EUR',
        categorySlug: product.product_categories && product.product_categories.length > 0 ? 'categorie' : 'general',
        stock: product.stock_quantity || 10
      },
      1 // quantité par défaut
    );
  };
  
  // Catégories de produits
  const categories = categoriesLoading || !categoriesData 
    ? [{
        id: 'bestseller', 
        name: 'Meilleures Ventes',
        color: '#FFF5E8', // Beige très clair
        image_url: '🔥' // Feu/Flamme
      }]
    : [{
        id: 'bestseller', 
        name: 'Meilleures Ventes',
        color: '#FFF5E8', // Beige très clair
        image_url: '🔥' // Feu/Flamme
      }, 
      ...(categoriesData || [])
        // Filtrer pour exclure les catégories indésirables et les doublons de Meilleures Ventes
        .filter((cat: Category) => (
          cat.name !== 'Meilleures Ventes' &&
          !cat.name.toLowerCase().includes('bestseller') && 
          !cat.name.toLowerCase().includes('best-seller') && 
          !cat.name.toLowerCase().includes('best seller') &&
          !cat.name.toLowerCase().includes('package') && 
          !cat.name.toLowerCase().includes('pack test') &&
          !cat.name.toLowerCase().includes('test')
        ))
        .map((cat: Category) => ({
          id: cat.id,
          name: cat.name,
          color: cat.color || '#FFEED8',
          image_url: cat.image_url || '📦'
        }))];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <ParallaxSection
          imageUrl="https://i.imgur.com/1nH4E4V.jpg"
          imageAlt="Nos produits"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Nos Produits</h1>
          <p className="text-xl md:text-2xl mb-8">Découvrez notre sélection d'apéritifs de qualité</p>
        </ParallaxSection>
        
        {/* Navigation par catégories */}
        <section className="py-10 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">Nos Catégories</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-8 sm:mb-10">
              {categoriesLoading ? (
                // Afficher des skeletons pendant le chargement
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="rounded-xl overflow-hidden shadow-md">
                    <div className="h-24 sm:h-28 bg-gray-200 animate-pulse"></div>
                  </div>
                ))
              ) : (
                categories.map(category => (
                  <button
                    key={category.id}
                    className={`relative overflow-hidden rounded-xl transition-all duration-300 ${activeCategory === category.id ? 'ring-2 ring-offset-2 ring-black scale-105' : 'hover:scale-105'} shadow-md`}
                    onClick={() => handleCategoryChange(category.id)}
                  >
                    <div 
                      className="absolute inset-0 opacity-90"
                      style={{
                        backgroundColor: category.color
                      }}
                    ></div>
                    <div className="relative p-3 sm:p-4 flex flex-col items-center justify-center h-24 sm:h-28 text-gray-800">
                      <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{category.image_url || '📦'}</div>
                      <div className="font-medium text-center text-sm sm:text-base leading-tight">{category.name}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Affichage des produits */}
        <section className="py-10 bg-gray-100">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
              {categories.find(cat => cat.id === activeCategory)?.name || 'Nos Produits'}
            </h2>
            
            {productsLoading ? (
              // Skeletons pendant le chargement
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-lg shadow-md overflow-hidden">
                    <div className="bg-gray-200 h-48 animate-pulse"></div>
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                      <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2 mt-2"></div>
                      <div className="h-8 bg-gray-200 rounded animate-pulse mt-2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : productsData && productsData.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {productsData.map((product: Product) => (
                  <div 
                    key={product.id} 
                    className="group overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full"
                  >
                    {/* Partie supérieure avec fond blanc */}
                    <div className="bg-white">
                      <Link href={`/product/${product.id}`} className="block">
                        <div className="relative overflow-hidden p-4 sm:p-6 flex justify-center items-center h-40 sm:h-52">
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black bg-opacity-10 transition-opacity duration-300"></div>
                          <div className="transform transition-transform duration-500 group-hover:scale-110">
                            <Image 
                              src={product.product_images && product.product_images.length > 0 ? product.product_images[0].image_url : 'https://picsum.photos/seed/default/600/600'} 
                              alt={product.product_images && product.product_images.length > 0 ? (product.product_images[0].alt_text || product.name) : product.name} 
                              width={180}
                              height={180}
                              className="object-contain"
                            />
                          </div>
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {product.compare_at_price && (
                              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                -{Math.round((1 - product.price / product.compare_at_price) * 100)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    </div>
                    
                    {/* Partie inférieure avec couleur de catégorie */}
                    <div className={`bg-gradient-to-b from-amber-50 to-amber-100 p-4 sm:p-5 flex-grow`}>
                      <Link href={`/product/${product.id}`} className="block">
                        <h3 className="font-bold text-base sm:text-lg mb-1 group-hover:text-gray-800 transition-colors duration-200 line-clamp-1">{product.name}</h3>
                        <p className="text-gray-700 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">{product.description}</p>
                        <div className="flex justify-between items-center mb-3 sm:mb-4">
                          <div>
                            <div className="font-bold text-lg text-gray-800">{`${formatPrice(product.price)} XAF`}</div>
                            {product.compare_at_price && (
                              <div className="text-gray-600 text-xs line-through">{`${formatPrice(product.compare_at_price)} XAF`}</div>
                            )}
                          </div>
                        </div>
                      </Link>
                      <Button 
                        className="w-full bg-white hover:bg-gray-50 text-black hover:bg-gray-100 transform transition-transform hover:scale-105 shadow-md font-semibold"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Ajouter au panier
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-lg text-gray-500">Aucun produit trouvé dans cette catégorie.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
