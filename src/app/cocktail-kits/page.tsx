'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { supabase } from '../../lib/supabase/client';
import { CocktailKit, CocktailKitIngredient } from '../../types/supabase';

// Types de cocktails pour le filtrage
type CocktailCategory = 'Tous' | 'Rhum' | 'Whisky' | 'Vodka' | 'Gin' | 'Tequila' | 'Sans alcool';
type DifficultyLevel = 'Tous' | 'Facile' | 'Moyen' | 'Difficile';
type SortOption = 'prix-asc' | 'prix-desc' | 'difficulte-asc' | 'difficulte-desc' | 'nom-asc' | 'nom-desc';

interface Cocktail {
  id: string;
  name: string;
  image: string;
  description: string;
  ingredients: string[];
  difficulty: string;
  basePrice: number;
  perPersonPrice: number;
  category: string;
  isNew?: boolean;
  isPopular?: boolean;
}

// Composant de slider pleine page
const FullPageSlider = () => {
  const slides = [
    {
      id: 1,
      image: "https://i.imgur.com/7cOi9S4.jpg",
      title: "Des kits cocktails premium livrés chez vous",
      subtitle: "Créez des cocktails de bar professionnel dans le confort de votre maison"
    },
    {
      id: 2,
      image: "https://i.imgur.com/4KAYU2f.jpg",
      title: "Tous les ingrédients pré-dosés pour une réussite garantie",
      subtitle: "Des produits sélectionnés avec soin par nos mixologues"
    },
    {
      id: 3,
      image: "https://i.imgur.com/KZePDgy.jpg",
      title: "Partagez une expérience inoubliable",
      subtitle: "Parfait pour vos soirées entre amis ou en famille"
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Image de fond avec overlay */}
          <div className="absolute inset-0 bg-black/50 z-10" />
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            priority={index === 0}
            className="object-cover"
          />
          
          {/* Contenu du slide */}
          <div className="absolute inset-0 flex flex-col justify-center items-center p-4 md:p-8 z-20 text-white text-center">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 max-w-2xl">{slide.title}</h2>
            <p className="text-sm sm:text-base md:text-xl max-w-2xl">{slide.subtitle}</p>
          </div>
        </div>
      ))}
      
      {/* Navigation */}
      <button
        className="absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 p-2 rounded-full text-white transition-colors"
        onClick={goToPrevSlide}
        aria-label="Slide précédente"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      
      <button
        className="absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 p-2 rounded-full text-white transition-colors"
        onClick={goToNextSlide}
        aria-label="Slide suivante"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
      
      {/* Indicateurs */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`h-2 w-2 sm:h-3 sm:w-3 rounded-full ${index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'} touch-manipulation`}
            onClick={() => goToSlide(index)}
            aria-label={`Aller à la slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

// Composant de présentation des cocktails
const CocktailShowcase = () => {
  const { addToCart } = useAppContext();
  const [cocktails, setCocktails] = useState<Cocktail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CocktailCategory>('Tous');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyLevel>('Tous');
  const [sortOption, setSortOption] = useState<SortOption>('prix-asc');
  const [expandedIngredients, setExpandedIngredients] = useState<Record<string, boolean>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchCocktailKits = async () => {
      try {
        setLoading(true);
        
        // Récupérer les kits cocktails
        const { data: cocktailKits, error: cocktailKitsError } = await supabase
          .from('cocktail_kits')
          .select('*');
        
        if (cocktailKitsError) throw cocktailKitsError;
        
        // Récupérer les ingrédients pour chaque kit
        const { data: ingredients, error: ingredientsError } = await supabase
          .from('cocktail_kit_ingredients')
          .select('*');
        
        if (ingredientsError) throw ingredientsError;
        
        // Transformer les données en format pour l'affichage
        const formattedCocktails: Cocktail[] = cocktailKits.map((kit: CocktailKit) => {
          const kitIngredients = ingredients
            .filter((ing: CocktailKitIngredient) => ing.cocktail_kit_id === kit.id)
            .map((ing: CocktailKitIngredient) => ing.name);
          
          return {
            id: kit.id,
            name: kit.name,
            image: kit.image_url || 'https://i.imgur.com/cZ5PBHI.jpg', // image par défaut
            description: kit.description,
            ingredients: kitIngredients,
            difficulty: kit.difficulty_level,
            basePrice: kit.base_price,
            perPersonPrice: kit.per_person_price,
            category: kit.category,
            isNew: kit.is_new,
            isPopular: kit.is_popular
          };
        });
        
        setCocktails(formattedCocktails);
        
        // Initialiser les quantités
        const initialQuantities: Record<string, number> = {};
        formattedCocktails.forEach(cocktail => {
          initialQuantities[cocktail.id] = 2; // 2 personnes par défaut
        });
        setQuantities(initialQuantities);
        
      } catch (error) {
        console.error('Erreur lors du chargement des kits cocktails:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCocktailKits();
  }, []);

  const toggleIngredients = (id: string) => {
    setExpandedIngredients(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleQuantityChange = (id: string, value: number) => {
    if (value >= 1) {
      setQuantities(prev => ({
        ...prev,
        [id]: value
      }));
    }
  };

  const calculatePrice = (basePrice: number, perPersonPrice: number, quantity: number) => {
    if (quantity <= 2) {
      return basePrice;
    }
    return basePrice + (quantity - 2) * perPersonPrice;
  };

  const handleAddToCart = (cocktail: Cocktail, quantity: number) => {
    const calculatedPrice = calculatePrice(cocktail.basePrice, cocktail.perPersonPrice, quantity);
    
    addToCart({
      id: cocktail.id,
      name: `Kit Cocktail ${cocktail.name} (${quantity} pers.)`,
      price: calculatedPrice,
      image: cocktail.image,
      category: 'kit-cocktail'
    }, 1);
  };

  const getDifficultyValue = (difficulty: string): number => {
    switch(difficulty) {
      case 'Facile': return 1;
      case 'Moyen': return 2;
      case 'Difficile': return 3;
      default: return 0;
    }
  }

  const categories: CocktailCategory[] = ['Tous', 'Rhum', 'Whisky', 'Vodka', 'Gin', 'Tequila', 'Sans alcool'];
  const difficulties: DifficultyLevel[] = ['Tous', 'Facile', 'Moyen', 'Difficile'];

  // Filtrage et tri des cocktails
  const filteredCocktails = cocktails.filter(cocktail => {
    const matchesSearch = !searchTerm || 
      cocktail.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      cocktail.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'Tous' || 
      cocktail.category.toLowerCase() === categoryFilter.toLowerCase();
    
    const matchesDifficulty = difficultyFilter === 'Tous' || 
      cocktail.difficulty === difficultyFilter;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Tri des cocktails
  const sortedCocktails = [...filteredCocktails].sort((a, b) => {
    switch(sortOption) {
      case 'prix-asc':
        return a.basePrice - b.basePrice;
      case 'prix-desc':
        return b.basePrice - a.basePrice;
      case 'difficulte-asc':
        return getDifficultyValue(a.difficulty) - getDifficultyValue(b.difficulty);
      case 'difficulte-desc':
        return getDifficultyValue(b.difficulty) - getDifficultyValue(a.difficulty);
      case 'nom-asc':
        return a.name.localeCompare(b.name);
      case 'nom-desc':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  return (
    <div className="py-20 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-10 text-white">Nos kits cocktails signatures</h2>
        
        {/* Filtres et recherche */}
        <div className="bg-gradient-to-r from-[#f5a623] to-[#e09000] p-4 sm:p-6 rounded-lg mb-6 sm:mb-12 text-white shadow-lg">
          {/* Recherche - toujours en haut pour un accès facile sur mobile */}
          <div className="mb-4">
            <label htmlFor="search" className="block text-sm font-medium text-white mb-1">Rechercher un cocktail</label>
            <div className="relative">
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nom ou ingrédient..."
                className="w-full p-2 pl-3 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
              />
              {searchTerm && (
                <button 
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                  onClick={() => setSearchTerm('')}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          
          {/* Filtres et tri - en colonnes sur desktop, en pile sur mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtre par catégorie */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-white mb-1">Catégorie</label>
              <select
                id="category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as CocktailCategory)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            {/* Filtre par difficulté */}
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-white mb-1">Difficulté</label>
              <select
                id="difficulty"
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value as DifficultyLevel)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
              >
                {difficulties.map(diff => (
                  <option key={diff} value={diff}>{diff}</option>
                ))}
              </select>
            </div>
            
            {/* Tri des produits */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label htmlFor="sort" className="block text-sm font-medium text-white mb-1">Trier par</label>
              <select
                id="sort"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
              >
                <option value="prix-asc">Prix croissant</option>
                <option value="prix-desc">Prix décroissant</option>
                <option value="difficulte-asc">Difficulté (facile à difficile)</option>
                <option value="difficulte-desc">Difficulté (difficile à facile)</option>
                <option value="nom-asc">Nom (A-Z)</option>
                <option value="nom-desc">Nom (Z-A)</option>
              </select>
            </div>

            {/* Bouton de réinitialisation des filtres pour mobile et tablette */}
            <div className="mt-2 sm:col-span-2 lg:col-span-1 flex items-end">
              <button
                className="w-full py-2 px-4 bg-white text-[#f5a623] font-medium rounded hover:bg-gray-100 transition-colors"
                onClick={() => {
                  setCategoryFilter('Tous');
                  setDifficultyFilter('Tous');
                  setSearchTerm('');
                  setSortOption('prix-asc');
                }}
              >
                Réinitialiser les filtres
              </button>
            </div>
          </div>  
        </div>
      </div>

      {sortedCocktails.length === 0 ? (
        <div className="bg-white p-4 sm:p-8 rounded-lg text-center">
          <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">Aucun kit cocktail trouvé</h3>
          <p className="text-gray-600 mb-4">Aucun kit ne correspond à vos critères de recherche.</p>
          <Button 
            className="bg-[#f5a623] hover:bg-[#e09000] text-white"
            onClick={() => {
              setCategoryFilter('Tous');
              setDifficultyFilter('Tous');
              setSearchTerm('');
              setSortOption('prix-asc');
            }}
          >
            Réinitialiser les filtres
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {sortedCocktails.map(cocktail => (
            <div key={cocktail.id} className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 relative">
              {/* Badges Nouveau et Populaire */}
              <div className="absolute top-0 left-0 w-full flex justify-between px-2 pt-2 z-10">
                <div>
                  {cocktail.isPopular && (
                    <div className="bg-red-600 text-white py-1 px-2 rounded-full text-xs font-bold">
                      Populaire
                    </div>
                  )}
                </div>
                <div>
                  {cocktail.isNew && (
                    <div className="bg-blue-600 text-white py-1 px-2 rounded-full text-xs font-bold">
                      Nouveau
                    </div>
                  )}
                </div>
              </div>
              
              {/* Image */}
              <div className="relative h-48 sm:h-56 md:h-64">
                <Image
                  src={cocktail.image}
                  alt={cocktail.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              
              {/* Contenu */}
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{cocktail.name}</h3>
                  <div className="flex items-center text-gray-500 text-sm">
                    <span className={`inline-block h-3 w-3 rounded-full mr-1 ${
                      cocktail.difficulty === 'Facile' ? 'bg-green-500' :
                      cocktail.difficulty === 'Moyen' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></span>
                    {cocktail.difficulty}
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{cocktail.description}</p>
                
                {/* Ingrédients avec toggle pour les voir tous */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-900">Ingrédients</h4>
                    <button 
                      className="text-[#f5a623] text-sm hover:underline font-medium"
                      onClick={() => toggleIngredients(cocktail.id)}
                    >
                      {expandedIngredients[cocktail.id] ? 'Masquer' : 'Voir tous'}
                    </button>
                  </div>
                  
                  <ul className="text-sm text-gray-600 space-y-1">
                    {cocktail.ingredients.slice(0, expandedIngredients[cocktail.id] ? undefined : 3).map((ingredient, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-[#f5a623] mr-2">•</span>
                        {ingredient}
                      </li>
                    ))}
                    {!expandedIngredients[cocktail.id] && cocktail.ingredients.length > 3 && (
                      <li className="text-gray-400 italic">+ {cocktail.ingredients.length - 3} autres ingrédients</li>
                    )}
                  </ul>
                </div>
                
                {/* Sélecteur de quantité et prix */}
                <div className="bg-gray-50 -mx-6 px-6 py-4 mb-4 sm:mb-6 mt-4 sm:mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor={`quantity-${cocktail.id}`} className="text-sm font-medium text-gray-700">
                      Nombre de personnes:
                    </label>
                    <div className="flex items-center">
                      <button
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
                        onClick={() => handleQuantityChange(cocktail.id, (quantities[cocktail.id] || 2) - 1)}
                        disabled={(quantities[cocktail.id] || 2) <= 1}
                      >
                        -
                      </button>
                      <span className="mx-3 font-medium">{quantities[cocktail.id] || 2}</span>
                      <button
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
                        onClick={() => handleQuantityChange(cocktail.id, (quantities[cocktail.id] || 2) + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Prêt en 15 minutes</span>
                    </div>
                    <div className="text-xl font-bold text-[#f5a623]">
                      {calculatePrice(cocktail.basePrice, cocktail.perPersonPrice, quantities[cocktail.id] || 2).toLocaleString()} XAF
                    </div>
                  </div>
                </div>
                
                {/* Bouton d'ajout au panier */}
                <div className="mt-auto flex justify-end">
                  <Button
                    className="bg-[#f5a623] hover:bg-[#e09000] text-white w-full sm:w-2/3 text-sm py-1.5 rounded-md"
                    onClick={() => handleAddToCart(cocktail, quantities[cocktail.id] || 2)}
                  >
                    Ajouter au panier
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Composant wrapper pour gérer l'hydratation sécurisée
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null; // Évite le rendu côté serveur qui cause des problèmes d'hydratation
  }

  return <>{children}</>;
}

export default function CocktailKitsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <ClientOnly>
        <FullPageSlider />
        <CocktailShowcase />
      </ClientOnly>
    </main>
  );
}
