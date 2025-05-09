'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

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
    <div className="relative h-[80vh] sm:h-screen w-full overflow-hidden">
      {/* Slides */}
      <div className="h-full w-full">
        {slides.map((slide, index) => (
          <div 
            key={slide.id}
            className={`absolute top-0 left-0 h-full w-full transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div className="relative h-full w-full">
              <Image 
                src={slide.image} 
                alt={slide.title}
                fill
                className="object-cover"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center text-white p-4 sm:p-6 text-center">
                <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 max-w-4xl leading-tight">{slide.title}</h1>
                <p className="text-base sm:text-lg md:text-2xl max-w-2xl">{slide.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      <button 
        className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black bg-opacity-50 text-white p-1 sm:p-3 rounded-full hover:bg-opacity-75 touch-manipulation"
        onClick={goToPrevSlide}
        aria-label="Slide précédente"
      >
        <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
      </button>
      <button 
        className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black bg-opacity-50 text-white p-1 sm:p-3 rounded-full hover:bg-opacity-75 touch-manipulation"
        onClick={goToNextSlide}
        aria-label="Slide suivante"
      >
        <ChevronRight size={20} className="sm:w-6 sm:h-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-12 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
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

// Types de cocktails pour le filtrage
type CocktailCategory = 'Tous' | 'Rhum' | 'Whisky' | 'Vodka' | 'Gin' | 'Tequila' | 'Sans alcool';
type DifficultyLevel = 'Tous' | 'Facile' | 'Moyen' | 'Difficile';
type SortOption = 'prix-asc' | 'prix-desc' | 'difficulte-asc' | 'difficulte-desc' | 'nom-asc' | 'nom-desc';

interface Cocktail {
  id: number;
  name: string;
  image: string;
  description: string;
  ingredients: string[];
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  basePrice: number;
  perPersonPrice: number;
  category: CocktailCategory;
  isNew?: boolean;
  isPopular?: boolean;
}

// Composant de présentation des cocktails
const CocktailShowcase = () => {
  const { addToCart } = useAppContext();
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [categoryFilter, setCategoryFilter] = useState<CocktailCategory>('Tous');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyLevel>('Tous');
  const [sortOption, setSortOption] = useState<SortOption>('prix-asc');
  const [searchTerm, setSearchTerm] = useState('');

  const cocktails: Cocktail[] = [
    {
      id: 1,
      name: "Kit Mojito Royal",
      image: "https://imgur.com/7tXcRY2.jpg",
      description: "Un cocktail rafraîchissant à base de rhum blanc, menthe fraîche, citron vert et sucre de canne, avec une touche de champagne pour l'élégance.",
      ingredients: ["Rhum blanc", "Menthe fraîche", "Citron vert", "Sucre de canne", "Champagne"],
      difficulty: "Facile",
      basePrice: 9800,  // Prix de base pour 2 personnes en XAF
      perPersonPrice: 4500, // Prix par personne supplémentaire
      category: "Rhum",
      isPopular: true
    },
    {
      id: 2,
      name: "Kit Old Fashioned",
      image: "https://imgur.com/hr8w6tp.jpg",
      description: "Ce cocktail classique combine whisky bourbon, sucre, angostura bitters et zeste d'orange pour une expérience riche et complexe.",
      ingredients: ["Bourbon", "Sucre", "Angostura bitters", "Zeste d'orange"],
      difficulty: "Moyen",
      basePrice: 12500, // Prix de base pour 2 personnes en XAF
      perPersonPrice: 5800, // Prix par personne supplémentaire
      category: "Whisky",
      isPopular: true
    },
    {
      id: 3,
      name: "Kit Gin Tonic Deluxe",
      image: "https://imgur.com/DmkfqHC.jpg",
      description: "Une version élaborée du Gin Tonic classique avec des botaniques premium, baies de genévrier, zestes d'agrumes et tonic artisanal.",
      ingredients: ["Gin premium", "Tonic artisanal", "Baies de genévrier", "Zestes d'agrumes", "Concombre"],
      difficulty: "Facile",
      basePrice: 10500,
      perPersonPrice: 4800,
      category: "Gin",
      isNew: true
    },
    {
      id: 4,
      name: "Kit Margarita Passion",
      image: "https://imgur.com/nLqbdNf.jpg",
      description: "Une version exotique de la Margarita classique, enrichie de fruits de la passion pour une expérience gustative unique.",
      ingredients: ["Tequila silver", "Triple sec", "Fruits de la passion", "Citron vert", "Sel fin"],
      difficulty: "Moyen",
      basePrice: 11800,
      perPersonPrice: 5200,
      category: "Tequila"
    },
    {
      id: 5,
      name: "Kit Moscow Mule Premium",
      image: "https://imgur.com/EoM9zRi.jpg",
      description: "Un cocktail vif et épicé qui mélange vodka, ginger beer artisanal et citron vert frais pour une explosion de saveurs.",
      ingredients: ["Vodka premium", "Ginger beer artisanal", "Citron vert", "Menthe fraîche", "Sirop de gingembre"],
      difficulty: "Facile",
      basePrice: 9500,
      perPersonPrice: 4200,
      category: "Vodka"
    },
    {
      id: 6,
      name: "Kit Virgin Colada",
      image: "https://imgur.com/k7MbdX9.jpg",
      description: "Version sans alcool de la Piña Colada, parfaite pour toute la famille. Goûtez aux saveurs tropicales de l'ananas et de la noix de coco.",
      ingredients: ["Jus d'ananas", "Lait de coco", "Sirop de sucre de canne", "Ananas frais", "Glace pilée"],
      difficulty: "Facile",
      basePrice: 7500,
      perPersonPrice: 3500,
      category: "Sans alcool",
      isNew: true
    }
  ];

  // Initialiser les quantités à 2 personnes par défaut
  useEffect(() => {
    const initialQuantities: Record<number, number> = {};
    cocktails.forEach(cocktail => {
      initialQuantities[cocktail.id] = 2; // 2 personnes par défaut
    });
    setQuantities(initialQuantities);
  }, []);

  const handleQuantityChange = (cocktailId: number, quantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [cocktailId]: quantity
    }));
  };

  const calculatePrice = (basePrice: number, perPersonPrice: number, quantity: number) => {
    if (quantity <= 2) {
      return basePrice; // Prix de base pour 2 personnes
    }
    // Prix de base + prix par personne supplémentaire pour chaque personne au-delà de 2
    return basePrice + (quantity - 2) * perPersonPrice;
  };

  const handleAddToCart = (cocktail: Cocktail, quantity: number) => {
    const price = calculatePrice(cocktail.basePrice, cocktail.perPersonPrice, quantity);
    const productToAdd = {
      id: cocktail.id,
      name: `${cocktail.name} (${quantity} personnes)`,
      description: cocktail.description,
      price: price,
      imageUrl: cocktail.image,
      currency: "XAF",
      categorySlug: "cocktail-kits",
      stock: 100
    };
    
    addToCart(productToAdd, 1);
    alert(`${cocktail.name} pour ${quantity} personnes ajouté au panier.`);
  };

  // Filtrage des cocktails
  const filteredCocktails = cocktails.filter(cocktail => {
    const matchesCategory = categoryFilter === 'Tous' || cocktail.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === 'Tous' || cocktail.difficulty === difficultyFilter;
    const matchesSearch = cocktail.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          cocktail.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          cocktail.ingredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  // Tri des cocktails
  const sortedCocktails = [...filteredCocktails].sort((a, b) => {
    switch (sortOption) {
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

  function getDifficultyValue(difficulty: string): number {
    switch (difficulty) {
      case 'Facile': return 1;
      case 'Moyen': return 2;
      case 'Difficile': return 3;
      default: return 0;
    }
  }

  const categories: CocktailCategory[] = ['Tous', 'Rhum', 'Whisky', 'Vodka', 'Gin', 'Tequila', 'Sans alcool'];
  const difficulties: DifficultyLevel[] = ['Tous', 'Facile', 'Moyen', 'Difficile'];

  return (
    <section className="py-20 bg-gradient-to-b from-black to-gray-900">
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
                placeholder="Mojito, Gin, Ananas..."
                className="w-full p-2 pl-3 pr-8 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
              />
              {searchTerm && (
                <button 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700" 
                  onClick={() => setSearchTerm('')}
                  aria-label="Effacer la recherche"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
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
            
            {/* Options de tri */}
            <div className="sm:col-span-2 md:col-span-1 mt-3 sm:mt-0">
              <label htmlFor="sort" className="block text-sm font-medium text-white mb-1">Trier par</label>
              <select
                id="sort"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
              >
                <option value="prix-asc">Prix croissant</option>
                <option value="prix-desc">Prix décroissant</option>
                <option value="difficulte-asc">Difficulté: du plus facile</option>
                <option value="difficulte-desc">Difficulté: du plus difficile</option>
                <option value="nom-asc">Nom A-Z</option>
                <option value="nom-desc">Nom Z-A</option>
              </select>
            </div>
            
            {/* Bouton réinitialiser - toujours visible */}
            <div className="mt-3 sm:mt-0 pt-0 sm:pt-6 flex items-end">
              <button
                className="w-full p-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition duration-150 text-sm"
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

        {sortedCocktails.length === 0 ? (
          <div className="bg-white p-8 rounded-lg text-center">
            <h3 className="text-2xl font-bold mb-4">Aucun kit cocktail trouvé</h3>
            <p className="text-gray-600 mb-4">Aucun kit ne correspond à vos critères de recherche.</p>
            <Button 
              className="bg-[#f5a623] hover:bg-[#e09000] text-white"
              onClick={() => {
                setCategoryFilter('Tous');
                setDifficultyFilter('Tous');
                setSearchTerm('');
              }}
            >
              Réinitialiser les filtres
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
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
                <div className="p-4 sm:p-5">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg sm:text-xl font-bold line-clamp-1">{cocktail.name}</h3>
                    <span className="bg-gray-100 text-gray-800 py-0.5 px-2 rounded-full text-xs font-medium">
                      {cocktail.category}
                    </span>
                  </div>
                  
                  {/* Description avec nombre de lignes limité */}
                  <p className="text-gray-600 mb-3 text-sm line-clamp-3">{cocktail.description}</p>
                  
                  {/* Ingrédients limités */}
                  <div className="mb-3">
                    <div className="flex items-center">
                      <h4 className="font-bold text-gray-900 text-xs sm:text-sm">Ingrédients:</h4>
                      <span className="text-gray-500 text-xs ml-1 italic">{cocktail.ingredients.length} éléments</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {cocktail.ingredients.slice(0, 3).map((ingredient, index) => (
                        <span key={index} className="bg-gray-50 text-xs px-1.5 py-0.5 rounded border border-gray-100">
                          {ingredient}
                        </span>
                      ))}
                      {cocktail.ingredients.length > 3 && (
                        <span className="bg-gray-50 text-xs px-1.5 py-0.5 rounded border border-gray-100">+{cocktail.ingredients.length - 3}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Prix et sélecteur de quantité */}
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-800 text-xs py-0.5 px-1.5 rounded bg-gray-50 border border-gray-100">
                        {cocktail.difficulty}
                      </span>
                      <span className="text-lg sm:text-xl font-bold text-[#f5a623]">
                        {calculatePrice(
                          cocktail.basePrice, 
                          cocktail.perPersonPrice, 
                          quantities[cocktail.id] || 2
                        ).toLocaleString()} XAF
                      </span>
                    </div>
                    
                    <div className="flex flex-row justify-between items-center gap-2">
                      <div className="w-1/3">
                        <label htmlFor={`quantity-${cocktail.id}`} className="sr-only">Personnes</label>
                        <select
                          id={`quantity-${cocktail.id}`}
                          value={quantities[cocktail.id] || 2}
                          onChange={(e) => handleQuantityChange(cocktail.id, parseInt(e.target.value))}
                          className="block w-full py-1.5 px-2 text-sm border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#f5a623] focus:border-[#f5a623]"
                          aria-label="Sélectionner le nombre de personnes"
                        >
                          {[2, 4, 6, 8, 10].map((num) => (
                            <option key={num} value={num}>{num} pers.</option>
                          ))}
                        </select>
                      </div>
                      
                      <Button 
                        className="bg-[#f5a623] hover:bg-[#e09000] text-white w-2/3 text-sm py-1.5 rounded-md"
                        onClick={() => handleAddToCart(cocktail, quantities[cocktail.id] || 2)}
                      >
                        Ajouter au panier
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
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
