'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '../../components/layout/Header';
import { 
  Clock, 
  Star, 
  Users, 
  Timer, 
  ShoppingCart, 
  MapPin, 
  Truck,
  ChefHat,
  Wine,
  Sparkles,
  Loader2,
  Gift,
  Calculator,
  Filter,
  Play,
  BookOpen,
  Package,
  Plus,
  Heart,
  PartyPopper,
  Calendar,
  Home,
  Briefcase
} from 'lucide-react';
import { useCocktailsMaison } from '../../hooks/useCocktailsMaison';
import { CocktailMaison, Mocktail, CocktailOption } from '../../types/supabase';

// Mapping des images pour les cocktails
const getCocktailImage = (cocktailName: string): string => {
  const name = cocktailName.toLowerCase();
  
  // Images disponibles dans public/images/cocktails
  const imageMap: Record<string, string> = {
    'mojito': '/images/cocktails/mojito.jpg',
    'piña colada': '/images/cocktails/pina-colada.jpg',
    'pina colada': '/images/cocktails/pina-colada.jpg',
    'cosmopolitan': '/images/cocktails/cosmopolitan.jpg',
    'margarita': '/images/cocktails/margarita.jpg',
    'mai tai': '/images/cocktails/mai-tai.jpg',
    'tequila sunrise': '/images/cocktails/tequila-sunrise.jpg',
    'whisky sour': '/images/cocktails/whisky-sour.jpg',
    'french 75': '/images/cocktails/french-75.jpg',
    'espresso martini': '/images/cocktails/espresso-martini.jpg',
    'dark n stormy': '/images/cocktails/dark-n-stormy.jpg',
    "dark 'n' stormy": '/images/cocktails/dark-n-stormy.jpg',
    // Cocktails signature Akanda
    'ndoss mix': '/images/cocktails/ndoss-mix.jpg',
    'lambar cocktail': '/images/cocktails/lambar-cocktail.jpg',
    'okoumé sunset': '/images/cocktails/okoume-sunset.jpg',
    'okoume sunset': '/images/cocktails/okoume-sunset.jpg',
    'bissap breeze': '/images/cocktails/bissap-breeze.jpg',
    // Mocktails
    'virgin planteur': '/images/cocktails/virgin-planteur.jpg',
    'limonade tropicale': '/images/cocktails/limonade-tropicale.jpg',
    'smoothie cocktail': '/images/cocktails/smoothie-cocktail.jpg',
    'zébu-fizz': '/images/cocktails/zebu-fizz.jpg',
    'zebu-fizz': '/images/cocktails/zebu-fizz.jpg',
    'pink banana': '/images/cocktails/pink-banana.jpg',
    'mango tango': '/images/cocktails/mango-tango.jpg',
    'cocokids': '/images/cocktails/cocokids.jpg'
  };
  
  // Retourner l'image correspondante ou une image par défaut
  return imageMap[name] || '/images/placeholder-product.svg';
};

// Types d'événements pour le filtre
interface EventType {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

const eventTypes: EventType[] = [
  {
    id: 'all',
    name: 'Tous les événements',
    icon: '🎉',
    color: 'from-orange-100 to-orange-200',
    description: 'Tous nos cocktails'
  },
  {
    id: 'famille-amis',
    name: 'Famille & amis',
    icon: '🏡',
    color: 'from-green-100 to-green-200',
    description: 'Cocktails conviviaux pour réunions familiales'
  },
  {
    id: 'anniversaire',
    name: 'Anniversaire',
    icon: '🎂',
    color: 'from-purple-100 to-purple-200',
    description: 'Cocktails festifs pour anniversaires'
  },
  {
    id: 'romantique',
    name: 'Romantique',
    icon: '💕',
    color: 'from-red-100 to-red-200',
    description: 'Cocktails pour moments intimes'
  },
  {
    id: 'local',
    name: 'Local',
    icon: '🇬🇦',
    color: 'from-yellow-100 to-yellow-200',
    description: 'Cocktails inspirés du terroir gabonais'
  },
  {
    id: 'sans-alcool',
    name: 'Sans alcool',
    icon: '🚫',
    color: 'from-blue-100 to-blue-200',
    description: 'Boissons sans alcool pour enfants et adultes'
  }
];

export default function CocktailsMaisonPage() {
  const { 
    cocktails, 
    mocktails, 
    options, 
    loading, 
    error 
  } = useCocktailsMaison();

  const [guestCount, setGuestCount] = useState(8);
  const [eventDuration, setEventDuration] = useState('4h');
  const [eventType, setEventType] = useState('all');
  const [expandedRecipes, setExpandedRecipes] = useState<Set<string>>(new Set());
  const [cart, setCart] = useState<any[]>([]);

  // Fonction pour calculer le prix selon le nombre d'invités
  const calculatePriceForGuests = (basePrice: number, guests: number): number => {
    // Prix de base pour 4 personnes, ajustement proportionnel
    const basePeople = 4;
    return Math.round((basePrice * guests) / basePeople);
  };

  // Fonction pour basculer l'affichage des recettes
  const toggleRecipe = (id: string) => {
    const newExpanded = new Set(expandedRecipes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRecipes(newExpanded);
  };

  // Fonction pour filtrer les cocktails par catégorie
  const getFilteredCocktails = () => {
    if (!cocktails) return [];
    if (eventType === 'all') return cocktails;
    
    // Mapping des IDs de filtre vers les catégories de la base de données
    const categoryMapping: { [key: string]: string } = {
      'famille-amis': 'Famille & amis',
      'anniversaire': 'Anniversaire', 
      'romantique': 'Romantique',
      'local': 'Local'
    };
    
    const targetCategory = categoryMapping[eventType];
    if (!targetCategory) return cocktails;
    
    return cocktails.filter(cocktail => cocktail.category === targetCategory);
  };
  
  // Fonction pour filtrer les mocktails
  const getFilteredMocktails = () => {
    if (!mocktails) return [];
    if (eventType === 'all') return mocktails;
    if (eventType === 'sans-alcool') return mocktails;
    return [];
  };

  // Fonction pour ajouter au panier
  const addToCart = (item: any, type: 'cocktail' | 'mocktail' | 'option') => {
    const cartItem = {
      ...item,
      type,
      quantity: 1,
      calculatedPrice: type === 'option' 
        ? calculatePriceForGuests(item.price, guestCount)
        : calculatePriceForGuests(item.base_price, guestCount)
    };
    setCart([...cart, cartItem]);
  };

  // Calcul du total du panier
  const cartTotal = cart.reduce((total, item) => total + item.calculatedPrice, 0);
  const cartItemCount = cart.length;

  // Fonction pour formater les prix
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des cocktails...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur lors du chargement: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50">
      <Header />
      {/* Hero Section Parallax */}
      <div className="relative h-[60vh] sm:h-[70vh] lg:h-[80vh] overflow-hidden">
        {/* Image de fond avec effet parallax */}
        <motion.div 
          className="absolute inset-0 scale-110"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
        >
          <Image
            src="/Images/banner_akanda.jpg"
            alt="Cocktails Akanda"
            fill
            className="object-cover"
            priority
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
        </motion.div>
        
        {/* Contenu superposé */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center text-white px-4 sm:px-6 lg:px-8">
            <motion.h1 
              className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black mb-4 sm:mb-6 drop-shadow-2xl leading-tight"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              🍹 Cocktails Maison
            </motion.h1>
            <motion.p 
              className="text-lg sm:text-xl md:text-2xl font-light mb-6 sm:mb-8 drop-shadow-lg max-w-4xl mx-auto px-4 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              Recevez tous les ingrédients de votre cocktail, ingrédients, alcools et accessoires – devenez le barman chez vous.
            </motion.p>
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.1 }}
            >
              <button className="px-6 sm:px-8 py-3 sm:py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl text-sm sm:text-base">
                Découvrir nos cocktails
              </button>
            </motion.div>
          </div>
        </div>
        
        {/* Indicateur de scroll */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="flex flex-col items-center">
            <span className="text-sm mb-2">Faites défiler</span>
            <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Layout avec barre latérale */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          
          {/* Barre latérale */}
          <div className="lg:w-80 space-y-4 sm:space-y-6">
            
            {/* Préparer votre Cocktail */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calculator className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Préparer votre Cocktail
                </h2>
              </div>

              {/* Nombre d'invités */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Users className="inline h-4 w-4 mr-2" />
                  Nombre d'invités: <span className="font-bold text-orange-600">{guestCount}</span>
                </label>
                <input
                  type="range"
                  min="2"
                  max="50"
                  value={guestCount}
                  onChange={(e) => setGuestCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>2</span>
                  <span>50</span>
                </div>
              </div>

              {/* Durée de l'événement */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Timer className="inline h-4 w-4 mr-2" />
                  Durée de l'événement
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['2h', '4h', '6h+'].map((duration) => (
                    <button
                      key={duration}
                      onClick={() => setEventDuration(duration)}
                      className={`p-2 rounded-lg text-sm font-medium transition-all ${
                        eventDuration === duration
                          ? 'bg-orange-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {duration}
                    </button>
                  ))}
                </div>
              </div>

              {/* Résumé */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 border border-orange-200">
                <h3 className="font-semibold text-gray-900 mb-2">Résumé de votre événement</h3>
                <div className="space-y-1 text-sm text-gray-700">
                  <p><strong>{guestCount}</strong> invités</p>
                  <p>Durée: <strong>{eventDuration}</strong></p>
                  <p>Estimation: <strong>{Math.ceil(guestCount * 2.5)}</strong> cocktails</p>
                </div>
              </div>
            </motion.div>




          </div>

          {/* Contenu principal */}
          <div className="flex-1 space-y-8">
            {/* Filtre d'ambiance */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Filter className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Filtrer par ambiance
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {eventTypes.map((type) => (
                  <motion.button
                    key={type.id}
                    onClick={() => setEventType(type.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-3 rounded-xl border-2 transition-all text-center ${
                      eventType === type.id
                        ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-orange-100 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl">{type.icon}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{type.name}</h3>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Grille des cocktails */}
            {(eventType === 'all' || ['reunion-familiale', 'anniversaire-festif', 'ambiance-romantique', 'cocktails-gabonais'].includes(eventType)) && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8"
              >
                <h2 className="col-span-full text-2xl sm:text-3xl font-black text-gray-900 mb-4 sm:mb-6">
                  Cocktails à faire soi même
                </h2>
                {getFilteredCocktails().length > 0 ? (
                  getFilteredCocktails().map((cocktail, index) => (
                <motion.div
                  key={cocktail.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative h-48 bg-gradient-to-br from-orange-100 to-orange-200 overflow-hidden">
                    {cocktail.image_url ? (
                      <Image
                        src={cocktail.image_url}
                        alt={cocktail.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                          // Fallback vers l'image statique puis emoji si l'image ne charge pas
                          const target = e.target as HTMLImageElement;
                          const staticImage = getCocktailImage(cocktail.name);
                          if (target.src !== staticImage) {
                            target.src = staticImage;
                          } else {
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent && !parent.querySelector('.emoji-fallback')) {
                              const emojiDiv = document.createElement('div');
                              emojiDiv.className = 'emoji-fallback absolute inset-0 flex items-center justify-center text-6xl';
                              emojiDiv.textContent = '🍹';
                              parent.appendChild(emojiDiv);
                            }
                          }
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-6xl">
                        🍹
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-black text-gray-900 mb-2">{cocktail.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{cocktail.description}</p>
                    
                    {/* Prix avec calcul automatique */}
                    <div className="mb-4">
                      <div className="text-sm text-gray-500 mb-1">
                        Prix pour {guestCount} invités
                      </div>
                      <div className="text-2xl font-black text-orange-600">
                        {formatPrice(calculatePriceForGuests(cocktail.base_price, guestCount))} FCFA
                      </div>
                      <div className="text-xs text-gray-400">
                        Base: {formatPrice(cocktail.base_price)} FCFA
                      </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className="space-y-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleRecipe(cocktail.id)}
                        className="w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:from-blue-500 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
                      >
                        <BookOpen className="w-4 h-4" />
                        {expandedRecipes.has(cocktail.id) ? 'Masquer la recette' : 'Voir la recette'}
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => addToCart(cocktail, 'cocktail')}
                        className="w-full bg-gradient-to-r from-orange-400 to-orange-600 text-white px-4 py-2 rounded-xl font-bold hover:from-orange-500 hover:to-orange-700 transition-all flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Ajouter au panier
                      </motion.button>
                    </div>

                    {/* Recette dépliable */}
                    <AnimatePresence>
                      {expandedRecipes.has(cocktail.id) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl"
                        >
                          <h4 className="font-black text-gray-900 mb-3 flex items-center gap-2">
                            🍹 Recette - {cocktail.name}
                          </h4>
                          
                          {/* Ingrédients */}
                          {cocktail.cocktail_ingredients && cocktail.cocktail_ingredients.length > 0 && (
                            <div className="mb-4">
                              <h5 className="font-bold text-gray-800 mb-2">🧑‍🍳 Ingrédients:</h5>
                              <ul className="space-y-1">
                                {cocktail.cocktail_ingredients.map((ingredient, idx) => (
                                  <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                                    {ingredient.quantity} {ingredient.unit} de {ingredient.name}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Instructions */}
                          {cocktail.cocktail_instructions && cocktail.cocktail_instructions.length > 0 && (
                            <div>
                              <h5 className="font-bold text-gray-800 mb-2">📝 Instructions:</h5>
                              <ol className="space-y-2">
                                {cocktail.cocktail_instructions.map((instruction, idx) => (
                                  <li key={idx} className="text-sm text-gray-700 flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                      {instruction.step_number}
                                    </span>
                                    <span>{instruction.instruction}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}

                          {/* Message par défaut si pas de recette */}
                          {(!cocktail.cocktail_ingredients || cocktail.cocktail_ingredients.length === 0) && 
                           (!cocktail.cocktail_instructions || cocktail.cocktail_instructions.length === 0) && (
                            <div className="text-center text-gray-500 py-4">
                              📝 Recette détaillée disponible avec votre commande
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <div className="text-6xl mb-4">🍸</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun cocktail disponible</h3>
                    <p className="text-gray-500">Aucun cocktail ne correspond à cette catégorie pour le moment.</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Grille des mocktails */}
            {(eventType === 'all' || eventType === 'mocktails-sans-alcool') && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <h2 className="col-span-full text-3xl font-black text-gray-900 mb-6">
                  🥤 Mocktails (Sans alcool)
                </h2>
                {getFilteredMocktails().length > 0 ? (
                  getFilteredMocktails().map((mocktail, index) => (
                <motion.div
                  key={mocktail.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (index + 5) * 0.1 }}
                  className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative h-48 bg-gradient-to-br from-green-100 to-green-200 overflow-hidden">
                    {mocktail.image_url ? (
                      <Image
                        src={mocktail.image_url}
                        alt={mocktail.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                          // Fallback vers l'image statique puis emoji si l'image ne charge pas
                          const target = e.target as HTMLImageElement;
                          const staticImage = getCocktailImage(mocktail.name);
                          if (target.src !== staticImage) {
                            target.src = staticImage;
                          } else {
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent && !parent.querySelector('.emoji-fallback')) {
                              const emojiDiv = document.createElement('div');
                              emojiDiv.className = 'emoji-fallback absolute inset-0 flex items-center justify-center text-6xl';
                              emojiDiv.textContent = '🥤';
                              parent.appendChild(emojiDiv);
                            }
                          }
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-6xl">
                        🥤
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-black text-gray-900">{mocktail.name}</h3>
                      <span className="inline-block bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
                        Sans alcool
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{mocktail.description}</p>
                    
                    {/* Prix avec calcul automatique */}
                    <div className="mb-4">
                      <div className="text-sm text-gray-500 mb-1">
                        Prix pour {guestCount} invités
                      </div>
                      <div className="text-2xl font-black text-green-600">
                        {formatPrice(calculatePriceForGuests(mocktail.base_price, guestCount))} FCFA
                      </div>
                      <div className="text-xs text-gray-400">
                        Base: {formatPrice(mocktail.base_price)} FCFA
                      </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className="space-y-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleRecipe(mocktail.id)}
                        className="w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:from-blue-500 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
                      >
                        <BookOpen className="w-4 h-4" />
                        {expandedRecipes.has(mocktail.id) ? 'Masquer la recette' : 'Voir la recette'}
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => addToCart(mocktail, 'mocktail')}
                        className="w-full bg-gradient-to-r from-green-400 to-green-600 text-white px-4 py-2 rounded-xl font-bold hover:from-green-500 hover:to-green-700 transition-all flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Ajouter au panier
                      </motion.button>
                    </div>

                    {/* Recette dépliable */}
                    <AnimatePresence>
                      {expandedRecipes.has(mocktail.id) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl"
                        >
                          <h4 className="font-black text-gray-900 mb-3 flex items-center gap-2">
                            🥤 Recette - {mocktail.name}
                          </h4>
                          
                          {/* Ingrédients */}
                          {mocktail.mocktail_ingredients && mocktail.mocktail_ingredients.length > 0 && (
                            <div className="mb-4">
                              <h5 className="font-bold text-gray-800 mb-2">🧑‍🍳 Ingrédients:</h5>
                              <ul className="space-y-1">
                                {mocktail.mocktail_ingredients.map((ingredient, idx) => (
                                  <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                    {ingredient.quantity} {ingredient.unit} de {ingredient.name}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Instructions par défaut pour mocktails */}
                          <div>
                            <h5 className="font-bold text-gray-800 mb-2">📝 Instructions:</h5>
                            <ol className="space-y-2">
                              <li className="text-sm text-gray-700 flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                  1
                                </span>
                                <span>Mélanger tous les ingrédients dans un shaker avec des glaçons</span>
                              </li>
                              <li className="text-sm text-gray-700 flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                  2
                                </span>
                                <span>Secouer vigoureusement pendant 10-15 secondes</span>
                              </li>
                              <li className="text-sm text-gray-700 flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                  3
                                </span>
                                <span>Filtrer et servir dans un verre refroidi avec des glaçons</span>
                              </li>
                              <li className="text-sm text-gray-700 flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                  4
                                </span>
                                <span>Décorer selon vos préférences et servir immédiatement</span>
                              </li>
                            </ol>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <div className="text-6xl mb-4">🥤</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun mocktail disponible</h3>
                    <p className="text-gray-500">Aucun mocktail ne correspond à cette catégorie pour le moment.</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Section Options Supplémentaires */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-12"
            >
              <h2 className="text-3xl font-black text-gray-900 mb-6 text-center">
                ✨ Options supplémentaires
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {options?.map((option, index) => (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (index + 10) * 0.1 }}
                    className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <div className="h-32 bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                      <span className="text-4xl">
                        {option.name.includes('Kit') ? '🧰' : 
                         option.name.includes('Verre') ? '🥃' : 
                         option.name.includes('Décoration') ? '🎨' : 
                         option.name.includes('Glaçon') ? '🧊' : '✨'}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-black text-gray-900 mb-2">{option.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">{option.description}</p>
                      
                      {/* Prix avec calcul automatique */}
                      <div className="mb-3">
                        <div className="text-sm text-gray-500 mb-1">
                          Prix pour {guestCount} invités
                        </div>
                        <div className="text-xl font-black text-purple-600">
                          {formatPrice(calculatePriceForGuests(option.price, guestCount))} FCFA
                        </div>
                        <div className="text-xs text-gray-400">
                          Base: {formatPrice(option.price)} FCFA
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => addToCart(option, 'option')}
                        className="w-full bg-gradient-to-r from-purple-400 to-purple-600 text-white px-4 py-2 rounded-xl font-bold hover:from-purple-500 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Ajouter l'option
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>


        </div>
      </div>
    </div>
  );
}
