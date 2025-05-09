'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ParallaxSection } from '../components/ui/parallax-section';
import { Header } from '../components/layout/Header';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { useState, useEffect } from 'react';
import { formatPrice } from '../lib/utils/formatters';
import styles from './landing.module.css';
import { Star, ArrowRight, Instagram } from 'lucide-react';
import { HeroSlider, HeroSlideProps } from '../components/ui/hero-slider';
import { useFeaturedProducts } from '../hooks/supabase/useFeaturedProducts';
import { useCategories } from '../hooks/supabase/useCategories';
import { Product, Category } from '../types/supabase';

// Données pour le slider hero
const heroSlides: HeroSlideProps[] = [
  {
    id: 1,
    backgroundUrl: "https://imgur.com/Hzxantr.jpg",
    title: "Savourez",
    subtitle: "l'essence de l'apéro",
    description: "Akanda Apéro livre directement chez vous des boissons fraîches et des snacks savoureux en moins de 60 minutes.",
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
    title: "Livraison rapide",
    subtitle: "en moins de 60 min",
    description: "Service de livraison express disponible dans toute la ville de Libreville. Vos boissons préférées à la bonne température.",
    buttonText: "Commander maintenant",
    buttonLink: "/category",
    secondaryButtonText: "Nos zones de livraison",
    secondaryButtonLink: "#delivery",
    statValue: "97%",
    statLabel: "de nos livraisons arrivent en moins d'une heure"
  }
];

// Avantages
const benefits = [
  {
    id: 1,
    name: "Fraîcheur",
    description: "Produits frais livrés rapidement",
    icon: "🌱"
  },
  {
    id: 2,
    name: "Qualité",
    description: "Ingrédients sélectionnés",
    icon: "⭐"
  },
  {
    id: 3,
    name: "Rapidité",
    description: "Livraison en moins d'une heure",
    icon: "⚡"
  },
  {
    id: 4,
    name: "Local",
    description: "Produits locaux du Gabon",
    icon: "🌍"
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
  
  // Récupérer les catégories
  const { data: categoriesData, isLoading: categoriesLoading } = getCategories();
  
  // Récupérer les produits en fonction de la catégorie active
  const { data: productsData, isLoading: productsLoading } = 
    activeCategory === 'bestseller' 
      ? getFeaturedProducts() 
      : getProductsByCategory(activeCategory);
  
  // Produit mis en avant (utilise le premier produit en vedette si disponible)
  const featuredProduct = productsData && productsData.length > 0 ? productsData[0] : {
    id: '1',
    name: 'Pack Tout-en-Un',
    description: '1 Boîte (12 Canettes)',
    price: 18000,
    compare_at_price: 22000,
    slug: 'pack-tout-en-un',
    product_images: [{ image_url: 'https://picsum.photos/seed/pack1/600/600', position: 1, id: '1', product_id: '1', alt_text: 'Pack Tout-en-Un', created_at: '' }],
    is_featured: true,
    is_active: true,
    stock_quantity: 10,
    low_stock_threshold: 3,
    created_at: '',
    updated_at: ''
  };
  
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
  
  // Récupérer l'estimation du délai de livraison
  const getDeliveryEstimate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1); // +1 jour
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  };
  
  // Fonction pour ajouter un produit au panier
  const handleAddToCart = (product: Product) => {
    const imageUrl = product.product_images && product.product_images.length > 0 
      ? product.product_images[0].image_url 
      : 'https://picsum.photos/seed/default/600/600';
    
    addToCart({
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      quantity: 1,
      image: imageUrl
    });
  };
  
  // Fonction de défilement vers une section
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Catégories de produits
  const categories = categoriesLoading || !categoriesData 
    ? [{ id: 'bestseller', name: 'Best-sellers' }]
    : [{ id: 'bestseller', name: 'Best-sellers' }, ...(categoriesData || []).map((cat: Category) => ({
        id: cat.id,
        name: cat.name
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
                    <div className={`absolute inset-0 bg-gradient-to-br from-amber-500 to-amber-600 opacity-80`}></div>
                    <div className="relative p-3 sm:p-4 flex flex-col items-center justify-center h-24 sm:h-28 text-white">
                      <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">📦</div>
                      <div className="font-medium text-center text-sm sm:text-base leading-tight">{category.name}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
