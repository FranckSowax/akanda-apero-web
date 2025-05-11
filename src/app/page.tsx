'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ParallaxSection } from '../components/ui/parallax-section';
import { Header } from '../components/layout/Header';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { useState } from 'react';
import { formatPrice } from '../lib/utils/formatters';
import styles from './landing.module.css';
import { Star, ArrowRight } from 'lucide-react';
import { HeroSlider, HeroSlideProps } from '../components/ui/hero-slider';
import { useFeaturedProducts } from '../hooks/supabase/useFeaturedProducts';
import { useCategories } from '../hooks/supabase/useCategories';
import { Product, Category } from '../types/supabase';
import { Footer } from '../components/layout/Footer';


const heroSlides: HeroSlideProps[] = [
  {
    id: 1,
    backgroundUrl: "https://imgur.com/Hzxantr.jpg",
    title: "Savourez",
    subtitle: "l'essence de l'apéro",
    description: "Akanda Apéro livre directement chez vous des boissons fraîches et des snacks savoureux.",
    buttonText: "Voir les produits",
    buttonLink: "/category",
    statValue: "78%",
    statLabel: "de nos clients commandent au moins une fois par semaine"
  },
  {
    id: 2,
    backgroundUrl: "https://imgur.com/9z6CUax.jpg",
    title: "Découvrez nos",
    subtitle: "cocktails signature",
    description: "Des recettes uniques préparées par nos mixologues expérimentés. Boissons fraîches livrées directement chez vous.",
    buttonText: "Commander maintenant",
    buttonLink: "/category",
    secondaryButtonText: "En savoir plus",
    secondaryButtonLink: "#about",
    statValue: "89%",
    statLabel: "de satisfaction client pour nos cocktails signature"
  },
  {
    id: 3,
    backgroundUrl: "https://imgur.com/N7KKA5C.jpg",
    title: "Livraison express",
    subtitle: "partout à Libreville",
    description: "Service de livraison disponible dans toute la ville de Libreville. Vos boissons préférées à la bonne température.",
    buttonText: "Commander maintenant",
    buttonLink: "/category",
    secondaryButtonText: "Nos zones de livraison",
    secondaryButtonLink: "#delivery",
    statValue: "97%",
    statLabel: "de satisfaction sur nos livraisons"
  }
];

// Avantages
const benefits = [
  {
    id: 1,
    name: "Fraîcheur garantie",
    description: "Savourez des produits ultra-frais, livrés directement à votre porte, pour un apéro qui réveille vos papilles !",
    iconUrl: "https://i.imgur.com/B9LhPlF.jpg"
  },
  {
    id: 2,
    name: "Qualité premium",
    description: "Des boissons et snacks soigneusement sélectionnés pour transformer vos soirées en moments d'exception.",
    iconUrl: "https://i.imgur.com/rVZ47lc.jpg"
  },
  {
    id: 3,
    name: "Livraison express",
    description: "Votre commande chez vous rapidement – parce que l'apéro n'attend pas !",
    iconUrl: "https://i.imgur.com/Qx4fu7a.jpg"
  },
  {
    id: 4,
    name: "Saveurs locales",
    description: "Découvrez le meilleur du Gabon avec des produits locaux authentiques, pour un apéro 100% terroir !",
    iconUrl: "https://i.imgur.com/3rsFBhW.jpg"
  }
];

// Témoignages clients
const testimonials = [
  {
    id: 1,
    name: "Marie Koumba",
    comment: "J'ai commandé un pack pour une soirée improvisée, livré en moins de 40 minutes. Le service est excellent !",
    rating: 5,
    avatar: "https://i.imgur.com/J5oMBWr.jpg"
  },
  {
    id: 2,
    name: "Jean Mouloungui",
    comment: "Produits de qualité et interface de commande très intuitive. Je recommande Akanda Apéro à tous mes amis.",
    rating: 5,
    avatar: "https://i.imgur.com/kXmAzQT.jpg"
  },
  {
    id: 3,
    name: "Sarah Ndong",
    comment: "Le meilleur service de livraison de boissons à Libreville. Rapide et efficace !",
    rating: 4,
    avatar: "https://i.imgur.com/gRrLZKw.jpg"
  }
];

export default function Home() {
  const { addToCart } = useAppContext();
  const [activeCategory, setActiveCategory] = useState('bestseller');
  const [isAnimating, setIsAnimating] = useState(false);
  const { getFeaturedProducts, getProductsByCategory } = useFeaturedProducts();
  const { getCategories } = useCategories();
  
  const { data: categoriesData, isLoading: categoriesLoading } = getCategories();
  
  const { data: productsData, isLoading: productsLoading } = 
    activeCategory === 'bestseller' 
      ? getFeaturedProducts() 
      : getProductsByCategory(activeCategory);
      
  const featuredProduct = (productsData && productsData.length > 0) ? productsData[0] : {
    id: '1',
    name: 'Pack Tout-en-Un',
    description: '1 Boîte (12 Canettes)',
    price: 18000,
    compare_at_price: 22000,
    slug: 'pack-tout-en-un',
    product_images: [{ 
      image_url: 'https://picsum.photos/seed/pack1/600/600', 
      position: 1, 
      id: '1', 
      product_id: '1', 
      alt_text: 'Pack Tout-en-Un', 
      created_at: '' 
    }],
    is_featured: true,
    is_active: true,
    stock_quantity: 10,
    low_stock_threshold: 3,
    created_at: '',
    updated_at: ''
  };
  
  const handleCategoryChange = (categoryId: string) => {
    if (categoryId === activeCategory || isAnimating) return;
    
    setIsAnimating(true);
    
    setTimeout(() => {
      setActiveCategory(categoryId);
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }, 300);
  };
  
  const getDeliveryEstimate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  };
  
  const handleAddToCart = (product: Product) => {
    const imageUrl = (product.product_images && product.product_images.length > 0) 
      ? product.product_images[0].image_url 
      : 'https://picsum.photos/seed/default/600/600';
    
    addToCart(
      {
        id: parseInt(product.id) || 0,
        name: product.name,
        price: product.price,
        imageUrl: imageUrl,
        description: product.description || '',
        currency: 'EUR',
        categorySlug: (product.product_categories && product.product_categories.length > 0) ? 'categorie' : 'general',
        stock: product.stock_quantity || 10
      },
      1
    );
  };
  
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };
  

  // Assurer que la catégorie "Meilleures Ventes" est toujours présente en première position
  const bestsellerCategory = {
    id: 'bestseller', 
    name: 'Meilleures Ventes',
    color: '#FFF5E8',
    image_url: '🔥'
  };
  
  const categories = categoriesLoading || !categoriesData 
    ? [bestsellerCategory]
    : [
        bestsellerCategory, 
        // Filtrer pour éviter les doublons de la catégorie "Meilleures Ventes"
        ...(categoriesData || []).filter(cat => cat.id !== 'bestseller')
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
  
  // Créer un slider d'images à partir des images du produit en vedette
  const productSlides: HeroSlideProps[] = 
    featuredProduct.product_images && featuredProduct.product_images.length > 0 
      ? featuredProduct.product_images.map((img: any) => ({
          imageUrl: img.image_url,
          alt: img.alt_text || featuredProduct.name,
        }))
      : [
          {
            imageUrl: 'https://picsum.photos/seed/pack1/800/800',
            alt: 'Pack Apéro',
          },
          {
            imageUrl: 'https://picsum.photos/seed/pack2/800/800',
            alt: 'Pack Apéro vue différente',
          },
          {
            imageUrl: 'https://picsum.photos/seed/pack3/800/800',
            alt: 'Pack Apéro contenu',
          }
        ];
        
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Slider Section */}
      <HeroSlider 
        slides={heroSlides}
        autoplay={true}
        autoplaySpeed={5000}
      />
      
      {/* Product Categories Section */}
      <section id="categories" className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">Nos Catégories</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-8 sm:mb-10">
              {categoriesLoading ? (
                // Afficher des skeletons pendant le chargement
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-md animate-pulse overflow-hidden">
                    <div className="h-24 bg-gray-200"></div>
                    <div className="p-3 sm:p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    </div>
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
          <div className="relative px-4 sm:px-6 md:px-8">
            <div id="products-container" className="relative min-h-[400px]">  
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {productsLoading ? (
                  // Afficher des skeletons pendant le chargement
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-md animate-pulse overflow-hidden">
                      <div className="h-52 bg-gray-200"></div>
                      <div className="p-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6 mb-4"></div>
                        <div className="h-8 bg-gray-200 rounded w-full"></div>
                      </div>
                    </div>
                  ))
                ) : productsData && productsData.length > 0 ? (
                  productsData.map((product: Product) => (
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
                            handleAddToCart(product);
                          }}
                        >
                          <span className="flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Ajouter au panier
                          </span>
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-4 text-center py-12">
                    <p className="text-gray-500">Aucun produit trouvé dans cette catégorie.</p>
                  </div>
                )}
              </div>
              
              {/* Animation de chargement pendant la transition */}
              {isAnimating && (
                <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-60">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f5a623]"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Parallax Section */}
      <ParallaxSection
        imageUrl="https://i.imgur.com/1nH4E4V.jpg"
        imageAlt="L'apéro comme vous l'aimez"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-4">L'apéro comme vous l'aimez</h2>
        <p className="text-xl md:text-2xl mb-8">Livré directement chez vous</p>
        <Button
          className="bg-[#f5a623] hover:bg-[#e09000] text-white py-3 px-8 rounded-lg font-medium text-lg shadow-lg hover:shadow-xl transform transition-transform hover:scale-105"
          onClick={() => scrollToSection('categories')}
        >
          Découvrir
        </Button>
      </ParallaxSection>

      {/* Benefits Section - Modern Design */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            Des avantages irrésistibles avec notre <br />service de <span className="text-[#f5a623] font-extrabold">livraison express</span> <span className="text-[#f5a623]">🚀</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit) => (
              <div key={benefit.id} className="group relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:translate-y-[-8px] h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
                <div className="p-8 relative z-10 flex flex-col h-full">
                  <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                    <Image 
                      src={benefit.iconUrl} 
                      alt={benefit.name}
                      width={70}
                      height={70}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-amber-600">{benefit.name}</h3>
                  <p className="text-gray-600 flex-grow">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cocktails Section */}
      <section className="py-16 bg-gradient-to-b from-amber-50 to-amber-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Devenez <span className="text-amber-600">Expert en Cocktails</span> à Domicile avec Akanda Apéro
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                Créez des cocktails comme un professionnel, directement chez vous. Grâce à nos kits cocktails complets, nous vous livrons tous les ingrédients, l'alcool et les softs nécessaires pour réaliser vos créations. Les accessoires pour préparer vos boissons seront également disponibles à la vente.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <div className="font-bold mb-2 flex items-center">
                    <span className="text-amber-600 mr-2">📎</span> Ingrédients pré-dosés
                  </div>
                  <p className="text-sm text-gray-600">Ingrédients pré-dosés pour garantir des cocktails parfaits à chaque préparation</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <div className="font-bold mb-2 flex items-center">
                    <span className="text-amber-600 mr-2">🎥</span> Tutoriels inclus
                  </div>
                  <p className="text-sm text-gray-600">Fiches recettes et tutoriels vidéo inclus pour vous guider pas à pas</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <div className="font-bold mb-2 flex items-center">
                    <span className="text-amber-600 mr-2">👥</span> Pour tous les groupes
                  </div>
                  <p className="text-sm text-gray-600">Kits adaptés pour 2 à 10 personnes, selon vos besoins et occasions</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <div className="font-bold mb-2 flex items-center">
                    <span className="text-amber-600 mr-2">🎉</span> Expérience festive
                  </div>
                  <p className="text-sm text-gray-600">Profitez d'une expérience cocktail à domicile où chaque moment devient une fête</p>
                </div>
              </div>
              <Button className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-6 rounded-lg">
                Découvrir nos kits cocktails
              </Button>
            </div>
            <div className="md:w-1/2 relative">
              <div className="relative rounded-xl overflow-hidden shadow-2xl transform md:rotate-3 transition-transform hover:rotate-0 duration-500">
                <Image
                  src="https://i.imgur.com/YdAsyA8.jpg"
                  alt="Kits Cocktails Akanda Apéro"
                  width={600}
                  height={400}
                  className="object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
                  <p className="text-white font-bold text-xl">Kits Cocktails Complets</p>
                  <p className="text-white text-sm">Recettes, ingrédients et accessoires livrés chez vous</p>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white p-3 rounded-lg shadow-lg transform rotate-6 hidden md:block">
                <p className="text-amber-600 font-bold">Nouveau !</p>
                <p className="text-sm">Kits disponibles pour 2, 4 ou 10 personnes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Football Kits Section */}
      <section className="py-16 relative" style={{ 
        backgroundImage: `url('https://i.imgur.com/rqR7zgB.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col-reverse md:flex-row items-center justify-between">
            <div className="md:w-1/2 relative mt-8 md:mt-0">
              <div className="relative rounded-xl overflow-hidden shadow-2xl transform md:-rotate-3 transition-transform hover:rotate-0 duration-500">
                <Image
                  src="https://i.imgur.com/mLt5IU3.jpg"
                  alt="Kits Soirée Football"
                  width={600}
                  height={400}
                  className="object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
                  <p className="text-white font-bold text-xl">Supportez votre équipe avec style</p>
                  <p className="text-white text-sm">Tout ce qu'il faut pour une soirée foot réussie</p>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white bg-opacity-90 p-3 rounded-lg shadow-lg transform -rotate-6 hidden md:block backdrop-blur-sm">
                <p className="text-green-600 font-bold">Promo !</p>
                <p className="text-sm">-15% sur tous les kits match</p>
              </div>
            </div>
            <div className="md:w-1/2 md:pl-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Kits <span className="text-green-400">Soirée Football</span> pour les passionnés
              </h2>
              <p className="text-gray-200 mb-6 text-lg">
                Ne manquez plus jamais un match important ! Nos kits spéciaux contiennent tout ce dont vous avez besoin pour profiter pleinement des matchs avec vos amis, livrés directement chez vous.  
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-white bg-opacity-90 p-4 rounded-lg shadow-md backdrop-blur-sm">
                  <div className="font-bold mb-2 flex items-center">
                    <span className="text-green-600 mr-2">🍻</span> Kit Classique
                  </div>
                  <p className="text-sm text-gray-700">6 bières premium, chips assorties et cacahuètes</p>
                </div>
                <div className="bg-white bg-opacity-90 p-4 rounded-lg shadow-md backdrop-blur-sm">
                  <div className="font-bold mb-2 flex items-center">
                    <span className="text-green-600 mr-2">🥘</span> Kit Gourmand
                  </div>
                  <p className="text-sm text-gray-700">Assortiment de mini-pizzas, wings de poulet et boissons</p>
                </div>
                <div className="bg-white bg-opacity-90 p-4 rounded-lg shadow-md backdrop-blur-sm">
                  <div className="font-bold mb-2 flex items-center">
                    <span className="text-green-600 mr-2">🍾</span> Kit Premium
                  </div>
                  <p className="text-sm text-gray-700">Champagne, planche de charcuterie fine et fromages sélectionnés</p>
                </div>
                <div className="bg-white bg-opacity-90 p-4 rounded-lg shadow-md backdrop-blur-sm">
                  <div className="font-bold mb-2 flex items-center">
                    <span className="text-green-600 mr-2">👪</span> Kit Famille
                  </div>
                  <p className="text-sm text-gray-700">Sodas, jus, popcorn et snacks pour petits et grands</p>
                </div>
              </div>
              <Button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg mt-4">
                Commander un kit match
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Ce que nos clients disent</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map(testimonial => (
              <div key={testimonial.id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <div className="mr-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <Image 
                        src={testimonial.avatar} 
                        alt={testimonial.name} 
                        width={48} 
                        height={48} 
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold">{testimonial.name}</h3>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          size={16} 
                          className={i < testimonial.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Footer */}
      <Footer />
    </div>
  );
}
