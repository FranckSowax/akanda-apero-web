'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Clock, MapPin, Star, Wine, Beer, Zap, Plus, ChefHat, Truck, ChevronLeft, ChevronRight, PackageOpen } from 'lucide-react';
import { supabaseService } from '../services/supabaseService';
import { useHomePageSync } from '../hooks/useProductSync';
import { useHomeBanners } from '../hooks/useBanners';
import { Header } from '../components/layout/Header';
import AddToCartButton from '../components/AddToCartButton';
import WeeklyCocktail from '../components/WeeklyCocktail';
import CustomerReviews from '../components/CustomerReviews';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

const topPicks: Product[] = [
  {
    id: '1',
    name: 'Mojito Classique',
    description: 'Cocktail rafraîchissant à la menthe',
    price: 2500,
    image: '🍃'
  },
  {
    id: '2', 
    name: 'Whisky Sour',
    description: 'Cocktail équilibré citron-whisky',
    price: 3500,
    image: '🥃'
  },
  {
    id: '3',
    name: 'Piña Colada',
    description: 'Cocktail tropical coco-ananas',
    price: 3000,
    image: '🥥'
  },
  {
    id: '4',
    name: 'Margarita',
    description: 'Cocktail tequila-citron vert',
    price: 3200,
    image: '🍋'
  },
  {
    id: '5',
    name: 'Cosmopolitan',
    description: 'Cocktail élégant vodka-cranberry',
    price: 3800,
    image: '🍸'
  }
];

interface Category {
  id: string;
  name: string;
  description: string;
  count: number;
  icon: string;
  color: string;
}

const topCategories: Category[] = [
  {
    id: '1',
    name: 'Formules',
    description: 'Offres spéciales et packs avantageux',
    count: 12,
    icon: '🎁',
    color: 'from-red-100 to-red-200'
  },
  {
    id: '2',
    name: 'Vins',
    description: 'Sélection de vins fins',
    count: 45,
    icon: '🍷',
    color: 'from-purple-100 to-purple-200'
  },
  {
    id: '3',
    name: 'Liqueurs',
    description: 'Spiritueux et liqueurs premium',
    count: 28,
    icon: '🍸',
    color: 'from-pink-100 to-pink-200'
  },
  {
    id: '4',
    name: 'Bières',
    description: 'Bières locales et importées',
    count: 32,
    icon: '🍺',
    color: 'from-yellow-100 to-yellow-200'
  },
  {
    id: '5',
    name: 'Champagnes',
    description: 'Bulles festives et champagnes',
    count: 18,
    icon: '🥂',
    color: 'from-amber-100 to-amber-200'
  }
];

// Toutes les catégories disponibles
const allCategories: Category[] = [
  ...topCategories,
  {
    id: '6',
    name: 'Apéritifs & sucreries',
    description: 'Accompagnements sucrés',
    count: 24,
    icon: '🍫',
    color: 'from-orange-100 to-orange-200'
  },
  {
    id: '7',
    name: 'Sodas & jus',
    description: 'Boissons sans alcool',
    count: 35,
    icon: '🥤',
    color: 'from-blue-100 to-blue-200'
  },
  {
    id: '8',
    name: 'Dépannage',
    description: 'Produits de première nécessité',
    count: 15,
    icon: '🛒',
    color: 'from-gray-100 to-gray-200'
  },
  {
    id: '9',
    name: 'Glaçons',
    description: 'Glaçons et accessoires',
    count: 8,
    icon: '🧊',
    color: 'from-cyan-100 to-cyan-200'
  }
];

// Les slides hero sont maintenant chargés dynamiquement depuis Supabase

export default function Home() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  // États pour les données Supabase
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [topCategories, setTopCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Hook pour les bannières dynamiques
  const { heroSlides, cocktailKitBg, parallaxImage, loading: bannersLoading } = useHomeBanners();

  // Fonctions de chargement des données
  const loadFeaturedProducts = async () => {
    try {
      const featured = await supabaseService.getFeaturedProducts();
      setFeaturedProducts(featured);
    } catch (error) {
      console.error('Erreur lors du chargement des produits vedettes:', error);
    }
  };

  const loadTopCategories = async () => {
    try {
      const categories = await supabaseService.getTopCategories();
      setTopCategories(categories);
      console.log('📊 Catégories chargées avec compteurs:', categories);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  };

  // Hook de synchronisation pour la page d'accueil
  useHomePageSync(loadTopCategories, loadFeaturedProducts);

  // Charger les données Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          loadFeaturedProducts(),
          loadTopCategories()
        ]);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    if (heroSlides.length === 0) return; // Ne pas démarrer si pas de slides
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [heroSlides.length]); // Redémarrer quand les slides sont chargés

  // Countdown timer for daily promotion
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const difference = tomorrow.getTime() - now.getTime();
      
      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    if (heroSlides.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }
  };

  const prevSlide = () => {
    if (heroSlides.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    }
  };

  const goToSlide = (index: number) => {
    if (index >= 0 && index < heroSlides.length) {
      setCurrentSlide(index);
    }
  };

  // Navigation vers la page produits avec filtre de catégorie
  const navigateToProductsWithCategory = (categoryId: string, categoryName: string) => {
    // Encoder le nom de la catégorie pour l'URL
    const encodedCategoryName = encodeURIComponent(categoryName);
    router.push(`/products?category=${categoryId}&categoryName=${encodedCategoryName}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Hero Slider - Large Card */}
          <div className="lg:col-span-2 relative rounded-3xl overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentSlide}
                className="rounded-3xl p-4 sm:p-6 md:p-8 text-white relative overflow-hidden h-full"
                style={{
                  backgroundImage: `url(${heroSlides[currentSlide] ? (heroSlides[currentSlide] as any).image_url || (heroSlides[currentSlide] as any).bgImage : 'https://i.imgur.com/hr8w6tp.png'})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                {/* Color Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${heroSlides[currentSlide]?.gradient || 'from-orange-400/50 to-orange-500/50'} rounded-3xl`}></div>
                <div className="relative z-10 h-full flex flex-col justify-end pb-8">
                  {/* Slide Indicators */}
                  <div className="absolute top-0 left-0 flex items-center space-x-2 mb-4">
                    <div className="flex space-x-1">
                      {heroSlides.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToSlide(index)}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            index === currentSlide ? 'w-6 bg-white' : 'w-2 bg-white opacity-60 hover:opacity-80'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-3 sm:mb-4 leading-tight">
                      {(heroSlides[currentSlide]?.title || 'COCKTAIL\nTIME!').split('\n').map((line, index) => (
                        <span key={index}>
                          {line}<br />
                        </span>
                      ))}
                    </h1>
                    
                    <p className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6 opacity-90 leading-relaxed">
                      {(heroSlides[currentSlide]?.subtitle || 'Cocktails artisanaux préparés\nspécialement pour vous').split('\n').map((line, index) => (
                        <span key={index}>
                          {line}<br />
                        </span>
                      ))}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                      <div className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-full font-bold text-sm sm:text-base md:text-lg">
                        À PARTIR DE {heroSlides[currentSlide]?.price || '2500 XAF'}
                      </div>
                      <div className="flex items-center space-x-1 text-xs sm:text-sm">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                        <span>{heroSlides[currentSlide]?.rating || '4.8'} depuis {heroSlides[currentSlide]?.year || '2020'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* Navigation Arrows */}
            <button 
              onClick={prevSlide}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center text-white transition-all duration-200 backdrop-blur-sm"
            >
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            </button>
            
            <button 
              onClick={nextSlide}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center text-white transition-all duration-200 backdrop-blur-sm"
            >
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            </button>
          </div>
          
          {/* Cocktail Kits Card */}
          <motion.div 
            className="rounded-3xl p-6 text-white relative overflow-hidden h-full"
            style={{
              backgroundImage: `url(${cocktailKitBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/40 to-purple-600/40 rounded-3xl"></div>
            
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Wine className="w-5 h-5" />
                </div>
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">NOUVEAU</span>
              </div>
              
              <h2 className="text-2xl font-black mb-2">KITS COCKTAILS</h2>
              <p className="text-sm mb-4 opacity-90 leading-relaxed">
                Tous les ingrédients pour créer vos cocktails préférés à la maison
              </p>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-current text-yellow-400" />
                  <span className="text-sm font-semibold">4.9</span>
                </div>
                <div className="text-xs opacity-75">+50 recettes incluses</div>
              </div>
              
              <div className="mt-auto">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-2xl font-black">À partir de 4500 XAF</span>
                    <div className="text-xs opacity-75">Livraison gratuite</div>
                  </div>
                </div>
                
                <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full font-bold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  COMMANDER UN KIT
                </button>
              </div>
            </div>
          </motion.div>
          
          {/* Promotions Section */}
          <motion.div 
            className="bg-gradient-to-br from-red-400 to-orange-400 rounded-3xl p-6 text-white relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-2">
                <h2 className="text-2xl font-black">PROMOTIONS</h2>
                <span className="bg-yellow-400 text-red-600 px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                  HOT
                </span>
              </div>
              <p className="text-sm mb-4 opacity-90">
                Offres spéciales de la semaine
              </p>
              
              {/* Daily Promotion Countdown */}
              <div className="bg-white/20 rounded-2xl p-4 mb-4 backdrop-blur-sm">
                <div className="text-xs font-semibold mb-2 opacity-90">PROMO DU JOUR - Se termine dans :</div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-white/30 rounded-lg p-2 sm:p-3 text-center aspect-square flex flex-col justify-center">
                    <div className="text-lg sm:text-xl font-black">{String(timeLeft.hours).padStart(2, '0')}</div>
                    <div className="text-xs opacity-75 font-semibold">HEURES</div>
                  </div>
                  <div className="bg-white/30 rounded-lg p-2 sm:p-3 text-center aspect-square flex flex-col justify-center">
                    <div className="text-lg sm:text-xl font-black">{String(timeLeft.minutes).padStart(2, '0')}</div>
                    <div className="text-xs opacity-75 font-semibold">MINUTES</div>
                  </div>
                  <div className="bg-white/30 rounded-lg p-2 sm:p-3 text-center aspect-square flex flex-col justify-center">
                    <div className="text-lg sm:text-xl font-black">{String(timeLeft.seconds).padStart(2, '0')}</div>
                    <div className="text-xs opacity-75 font-semibold">SECONDES</div>
                  </div>
                </div>
                <div className="text-sm font-bold">-30% sur tous les cocktails</div>
              </div>
              
              {/* Daily Promotion Image */}
              <div className="mb-4">
                <img 
                  src="https://i.imgur.com/ITqFZGC.jpg" 
                  alt="Promo du jour" 
                  className="w-full h-32 object-cover rounded-xl opacity-90 hover:opacity-100 transition-opacity duration-300"
                />
              </div>
              
              {/* Weekly Promotions */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="opacity-90">🍾 Champagnes</span>
                  <span className="bg-green-500 px-2 py-1 rounded-full text-xs font-bold">-25%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="opacity-90">🥃 Whiskys Premium</span>
                  <span className="bg-green-500 px-2 py-1 rounded-full text-xs font-bold">-20%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="opacity-90">🍺 Pack Bières</span>
                  <span className="bg-green-500 px-2 py-1 rounded-full text-xs font-bold">-15%</span>
                </div>
              </div>
              
              <button className="w-full bg-yellow-400 text-red-600 px-4 py-3 rounded-full font-black hover:bg-yellow-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                VOIR TOUTES LES PROMOS
              </button>
            </div>
          </motion.div>
          
          {/* Top Picks Section */}
          <motion.div 
            className="bg-white rounded-3xl p-6 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-2xl font-black text-gray-900 mb-6">⭐ TOP-5 FAVORIS</h2>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : featuredProducts.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <PackageOpen className="w-12 h-12 mx-auto mb-3" />
                </div>
                <p className="text-gray-500 text-sm">Aucun produit vedette pour le moment</p>
                <p className="text-gray-400 text-xs mt-1">Les produits apparaîtront ici une fois ajoutés à la base de données</p>
              </div>
            ) : (
              <div className="space-y-4">
                {featuredProducts.slice(0, 5).map((product: any, index: number) => (
                  <motion.div 
                    key={product.id}
                    className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer relative"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Image du produit */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden flex-shrink-0">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback vers emoji si l'image ne charge pas
                            e.currentTarget.style.display = 'none';
                            const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                            if (nextElement) {
                              nextElement.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div 
                        className={`w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-xl ${
                          product.image_url ? 'hidden' : 'flex'
                        }`}
                      >
                        {product.emoji || product.categories?.icon || '🍹'}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">{product.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">
                        {product.description && product.description.length > 60 
                          ? `${product.description.substring(0, 60)}...` 
                          : product.description
                        }
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between gap-2 sm:gap-3">
                      <div className="text-right flex-1 min-w-0">
                        <div className="font-bold text-gray-900 text-sm sm:text-base">
                          {(product.sale_price || product.base_price || 0).toLocaleString()} XAF
                        </div>
                        <div className="text-xs text-gray-500">chacun</div>
                      </div>
                      
                      {/* Petit bouton Add to Cart à côté du prix */}
                      <div className="flex-shrink-0">
                        <AddToCartButton
                          product={{
                            id: parseInt(product.id) || 0,
                            name: product.name,
                            price: product.sale_price || product.base_price || 0,
                            imageUrl: product.image_url || '',
                            description: product.description || '',
                            currency: 'XAF',
                            categorySlug: 'featured',
                            stock: 100,
                            image_url: product.image_url
                          } as any}
                          inline={true}
                        />
                      </div>
                    </div>
                  </motion.div>
              ))}
            </div>
            )}
             
            {/* Voir tous les produits button */}
            <Link href="/products" className="w-full mt-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-3 rounded-full font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2">
              <span>VOIR TOUS LES PRODUITS</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
          
          {/* Top Categories Section */}
          <motion.div 
            className="bg-white rounded-3xl p-6 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-2xl font-black text-gray-900 mb-6">🏷️ TOP-5 CATÉGORIES</h2>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : topCategories.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <Wine className="w-12 h-12 mx-auto mb-3" />
                </div>
                <p className="text-gray-500 text-sm">Aucune catégorie pour le moment</p>
                <p className="text-gray-400 text-xs mt-1">Les catégories apparaîtront ici une fois ajoutées à la base de données</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topCategories.slice(0, 5).map((category: any, index: number) => (
                  <motion.div 
                    key={category.id}
                    onClick={() => navigateToProductsWithCategory(category.id, category.name)}
                    className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${category.color || 'from-blue-100 to-blue-200'} rounded-xl flex items-center justify-center text-xl flex-shrink-0`}>
                      {category.icon || '🍹'}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">{category.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">{category.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-gray-900 text-sm sm:text-base">{category.product_count || 0} produits</div>
                        <div className="text-xs text-gray-500">disponibles</div>
                      </div>
                      
                      <button 
                        onClick={() => navigateToProductsWithCategory(category.id, category.name)}
                        className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors flex-shrink-0"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            
            {/* Voir toutes les catégories button */}
            <button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-full font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2">
              <span>VOIR TOUTES LES CATÉGORIES</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
          
        </div>
        
        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
          <motion.div 
            className="bg-white rounded-2xl p-6 shadow-lg text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Livraison Rapide</h3>
            <p className="text-sm text-gray-600">30-45 minutes partout à Libreville</p>
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-2xl p-6 shadow-lg text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Qualité Premium</h3>
            <p className="text-sm text-gray-600">Ingrédients frais et cocktails artisanaux</p>
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-2xl p-6 shadow-lg text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Zone de Livraison</h3>
            <p className="text-sm text-gray-600">Toute la commune d'Akanda couverte</p>
          </motion.div>
        </div>
        
        {/* Parallax Section */}
        <motion.div 
          className="relative h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 rounded-2xl sm:rounded-3xl overflow-hidden my-8 sm:my-10 md:my-12"
          style={{
            backgroundImage: `url(${parallaxImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 rounded-2xl sm:rounded-3xl" />
          
          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-center text-white text-center px-4 sm:px-6 md:px-8">
            <div className="max-w-4xl mx-auto">
              <motion.h2 
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 md:mb-4 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                L'Art du Cocktail
              </motion.h2>
              <motion.p 
                className="text-sm sm:text-base md:text-lg lg:text-xl opacity-90 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Découvrez notre sélection exclusive de cocktails artisanaux
              </motion.p>
            </div>
          </div>
        </motion.div>
        
        {/* Weekly Cocktail Section */}
        <WeeklyCocktail />
        
      </main>
      
      {/* Customer Reviews Section */}
      <CustomerReviews />

    </div>
  );
}
