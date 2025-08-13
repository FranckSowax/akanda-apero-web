'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Percent, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  ChefHat, 
  Package, 
  Settings, 
  Zap, 
  Plus, 
  Minus,
  Wine,
  Coffee,
  Sparkles,
  Heart,
  Gift,
  X,
  Loader2,
  Check,
  Volume2,
  Droplets,
  Search,
  Filter,
  Star
} from 'lucide-react';
import { ReadyCocktail, CocktailContainer, AlcoholDosage, ReadyCocktailVariant } from '../../types/supabase';
import { ReadyCocktailsService } from '../../services/ready-cocktails-service';
import { useAppContext } from '../../context/AppContext';
import { formatPrice } from '../../lib/utils';
import { Header } from '../../components/layout/Header';
import { toast } from 'react-hot-toast';

// Mapping des images pour les cocktails
const getCocktailImage = (cocktailName: string): string => {
  const name = cocktailName.toLowerCase();
  
  const imageMap: Record<string, string> = {
    'mojito': '/images/cocktails/mojito.jpg',
    'mojito classic': '/images/cocktails/mojito.jpg',
    'piña colada': '/images/cocktails/pina-colada.jpg',
    'pina colada': '/images/cocktails/pina-colada.jpg',
    'cosmopolitan': '/images/cocktails/cosmopolitan.jpg',
    'long island': '/images/cocktails/long-island.jpg',
    'margarita': '/images/cocktails/margarita.jpg',
    'sex on the beach': '/images/cocktails/sex-on-beach.jpg',
    'blue lagoon': '/images/cocktails/blue-lagoon.jpg',
    'tequila sunrise': '/images/cocktails/tequila-sunrise.jpg',
    'caipirinha': '/images/cocktails/caipirinha.jpg',
    'akanda special': '/images/cocktails/signature.jpg',
    'libreville sunset': '/images/cocktails/sunset.jpg'
  };
  
  return imageMap[name] || '/Images/banner_akanda.jpg';
};

interface CocktailCardProps {
  cocktail: ReadyCocktail;
  containers: CocktailContainer[];
  dosages: AlcoholDosage[];
  onAddToCart: (cocktailId: string, containerId: string, dosageId: string, finalPrice: number) => void;
}



export default function CocktailsPage() {
  const { addToCart } = useAppContext();
  const [cocktails, setCocktails] = useState<ReadyCocktail[]>([]);
  const [containers, setContainers] = useState<CocktailContainer[]>([]);
  const [dosages, setDosages] = useState<AlcoholDosage[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour les filtres
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [cocktailsData, containersData, dosagesData, categoriesData] = await Promise.all([
        ReadyCocktailsService.getReadyCocktails(),
        ReadyCocktailsService.getContainers(),
        ReadyCocktailsService.getDosages(),
        ReadyCocktailsService.getCategories()
      ]);

      setCocktails(cocktailsData);
      setContainers(containersData);
      setDosages(dosagesData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      setError('Erreur lors du chargement des cocktails');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (cocktailId: string, containerId: string, dosageId: string, finalPrice: number) => {
    try {
      const cocktail = cocktails.find(c => c.id === cocktailId);
      const container = containers.find(c => c.id === containerId);
      const dosage = dosages.find(d => d.id === dosageId);

      if (!cocktail || !container || !dosage) {
        toast.error('Erreur lors de l\'ajout au panier');
        return;
      }

      // Créer un objet Product compatible avec le système de panier existant
      // Utiliser l'ID réel du cocktail au lieu d'un UUID généré
      const cartItem = {
        id: cocktailId, // Utiliser l'ID réel du cocktail depuis la base de données
        name: `${cocktail.name} (${container.name}, ${dosage.name})`,
        description: `${cocktail.description || cocktail.short_description} - Contenant: ${container.name} (${container.volume_ml}ml) - Dosage: ${dosage.name}`,
        price: finalPrice,
        base_price: finalPrice,
        imageUrl: cocktail.image_url || '/Images/banner_akanda.jpg',
        image_url: cocktail.image_url || '/Images/banner_akanda.jpg',
        emoji: cocktail.emoji,
        category: cocktail.category || 'Cocktails Prêts',
        categorySlug: (cocktail.category || 'cocktails-prets').toLowerCase().replace(/\s+/g, '-'),
        currency: 'XAF',
        stock: 100,
        product_type: 'ready_cocktail' as const,
        ready_cocktail_data: {
          cocktail_id: cocktailId,
          container_id: containerId,
          dosage_id: dosageId,
          variant_id: `${cocktailId}-${containerId}-${dosageId}`
        }
      };

      addToCart(cartItem, 1);
      toast.success(`${cocktail.name} ajouté au panier !`);
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      toast.error('Erreur lors de l\'ajout au panier');
    }
  };

  const filteredCocktails = cocktails.filter(cocktail => {
    const matchesCategory = selectedCategory === 'all' || cocktail.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      cocktail.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cocktail.main_ingredients && cocktail.main_ingredients.some(ingredient => 
        ingredient.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 text-lg">Chargement des cocktails...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-red-600 mb-4 text-lg">{error}</p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadData}
            className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-semibold"
          >
            Réessayer
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50">
      <Header />
      
      {/* Hero Section */}
      <div className="relative h-[60vh] sm:h-[70vh] lg:h-[80vh] overflow-hidden">
        <motion.div 
          className="absolute inset-0 scale-110"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
        >
          <Image
            src="/Images/replicate-prediction-pxvekbrr9xrmc0crk90bdtyje8.webp"
            alt="Cocktails Akanda"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
        </motion.div>
        
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center text-white px-4 sm:px-6 lg:px-8">
            <motion.h1 
              className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black mb-4 sm:mb-6 drop-shadow-2xl leading-tight"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              🍹 Cocktails Prêts
            </motion.h1>
            <motion.p 
              className="text-lg sm:text-xl md:text-2xl font-light mb-6 sm:mb-8 drop-shadow-lg max-w-4xl mx-auto px-4 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              Cocktails artisanaux préparés par nos barmans et servis dans des gobelets fermés. Personnalisez votre dosage d'alcool selon vos préférences.
            </motion.p>
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.1 }}
            >
              <button 
                onClick={() => document.getElementById('cocktails-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl text-sm sm:text-base"
              >
                Découvrir nos cocktails
              </button>
            </motion.div>
          </div>
        </div>
        
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

      {/* Section principale */}
      <div id="cocktails-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        
        {/* Menu déroulant mobile pour les catégories */}
        <div className="lg:hidden mb-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100"
          >
            {/* Barre de recherche mobile */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Rechercher un cocktail..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
            
            {/* Dropdown des catégories */}
            <div className="relative">
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4" />
                  <span>
                    {selectedCategory === 'all' 
                      ? 'Toutes les catégories' 
                      : selectedCategory
                    }
                  </span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {filteredCocktails.length}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: showCategoryDropdown ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {showCategoryDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-64 overflow-y-auto"
                  >
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setSelectedCategory('all');
                          setShowCategoryDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-between ${
                          selectedCategory === 'all'
                            ? 'bg-orange-500 text-white'
                            : 'text-gray-700 hover:bg-orange-50'
                        }`}
                      >
                        <span>🍹 Tous les cocktails</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          selectedCategory === 'all'
                            ? 'bg-white/20 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {cocktails.length}
                        </span>
                      </button>
                      {categories.map(category => {
                        const count = cocktails.filter(c => c.category === category).length;
                        const emoji = category.includes('Classique') ? '🥃' : 
                                     category.includes('Tropical') ? '🌴' : 
                                     category.includes('Signature') ? '⭐' : 
                                     category.includes('Sans Alcool') ? '🚫' : '🍸';
                        return (
                          <button
                            key={category}
                            onClick={() => {
                              setSelectedCategory(category);
                              setShowCategoryDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-between ${
                              selectedCategory === category
                                ? 'bg-orange-500 text-white'
                                : 'text-gray-700 hover:bg-orange-50'
                            }`}
                          >
                            <span>{emoji} {category}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              selectedCategory === category
                                ? 'bg-white/20 text-white'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          
          {/* Barre latérale - Desktop uniquement */}
          <div className="hidden lg:block lg:w-80 space-y-4 sm:space-y-6">
            
            {/* Informations sur le service */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl shadow-xl p-6 border border-orange-100 relative overflow-hidden"
            >
              {/* Décoration de fond */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200/20 to-red-200/20 rounded-full -translate-y-16 translate-x-16"></div>
              
              <div className="relative">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-6">
                  Service Cocktails
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <ChefHat className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Expertise Professionnelle</h3>
                      <p className="text-sm text-gray-600">Cocktails préparés par nos barmans experts</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Conditionnement Premium</h3>
                      <p className="text-sm text-gray-600">Servis dans des gobelets fermés (500ml ou 750ml)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Settings className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Personnalisation</h3>
                      <p className="text-sm text-gray-600">Dosage personnalisable selon vos préférences</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Service Express</h3>
                      <p className="text-sm text-gray-600">Prêts à déguster immédiatement</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Filtres */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Filter className="h-5 w-5 text-orange-500" />
                Filtres
              </h3>
              
              {/* Recherche */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Nom ou ingrédient..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Catégories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Catégories</label>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-50 text-gray-700 hover:bg-orange-50'
                    }`}
                  >
                    Tous les cocktails ({cocktails.length})
                  </button>
                  {categories.map(category => {
                    const count = cocktails.filter(c => c.category === category).length;
                    return (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedCategory === category
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-50 text-gray-700 hover:bg-orange-50'
                        }`}
                      >
                        {category} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Contenu principal */}
          <div className="flex-1">
            {/* En-tête de section - Desktop uniquement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 hidden lg:block"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {selectedCategory === 'all' ? 'Tous nos cocktails' : selectedCategory}
              </h2>
              <p className="text-gray-600">
                {filteredCocktails.length} cocktail{filteredCocktails.length > 1 ? 's' : ''} disponible{filteredCocktails.length > 1 ? 's' : ''}
              </p>
            </motion.div>
            
            {/* En-tête mobile simplifié */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 lg:hidden"
            >
              <h2 className="text-xl font-bold text-gray-900">
                {selectedCategory === 'all' ? 'Nos cocktails' : selectedCategory}
              </h2>
            </motion.div>

            {/* Grille des cocktails */}
            <AnimatePresence>
              <motion.div 
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
              >
                {filteredCocktails.map((cocktail, index) => (
                  <motion.div
                    key={cocktail.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <CocktailCard
                      cocktail={cocktail}
                      containers={containers}
                      dosages={dosages}
                      onAddToCart={handleAddToCart}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* État vide */}
            {filteredCocktails.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun cocktail trouvé</h3>
                <p className="text-gray-600 mb-4">
                  Essayez de modifier vos critères de recherche ou de filtrage.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const CocktailCard: React.FC<CocktailCardProps> = ({ 
  cocktail, 
  containers, 
  dosages, 
  onAddToCart 
}) => {
  const [selectedContainer, setSelectedContainer] = useState<string>('');
  const [selectedDosage, setSelectedDosage] = useState<string>('');
  const [finalPrice, setFinalPrice] = useState<number>(cocktail.base_price);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (containers.length > 0 && !selectedContainer) {
      setSelectedContainer(containers[0].id); // Sélectionner le premier contenant par défaut
    }
    if (dosages.length > 0 && !selectedDosage) {
      // Chercher le dosage "Standard" par nom, sinon prendre le premier
      const standardDosage = dosages.find(d => d.name.toLowerCase() === 'standard');
      setSelectedDosage(standardDosage?.id || dosages[0].id);
    }
  }, [containers, dosages, selectedContainer, selectedDosage]);

  useEffect(() => {
    if (selectedContainer && selectedDosage) {
      const container = containers.find(c => c.id === selectedContainer);
      const dosage = dosages.find(d => d.id === selectedDosage);
      
      if (container && dosage) {
        setFinalPrice(cocktail.base_price + container.base_price + dosage.price_modifier);
      }
    }
  }, [selectedContainer, selectedDosage, cocktail.base_price, containers, dosages]);

  const handleAddToCart = () => {
    if (!selectedContainer || !selectedDosage) {
      toast.error('Veuillez sélectionner un contenant et un dosage');
      return;
    }
    
    onAddToCart(cocktail.id, selectedContainer, selectedDosage, finalPrice);
  };

  const getColorThemeClass = (theme: string | null) => {
    switch (theme) {
      case 'green': return 'from-green-400 to-green-600';
      case 'blue': return 'from-blue-400 to-blue-600';
      case 'pink': return 'from-pink-400 to-pink-600';
      case 'yellow': return 'from-yellow-400 to-yellow-600';
      case 'lime': return 'from-lime-400 to-lime-600';
      case 'orange': return 'from-orange-400 to-orange-600';
      case 'amber': return 'from-amber-400 to-amber-600';
      case 'gold': return 'from-yellow-500 to-yellow-700';
      case 'sunset': return 'from-orange-500 to-pink-500';
      default: return 'from-purple-400 to-purple-600';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'tropical':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'classique':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'fruité':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'signature':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'créatif':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'local':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'famille & amis':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'romantique':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'détox':
        return 'bg-lime-100 text-lime-800 border-lime-200';
      case 'anniversaire':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      {/* Image et header */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={cocktail.image_url || getCocktailImage(cocktail.name)}
          alt={cocktail.name}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
        />
        {/* Overlay de couleur seulement si pas d'image uploadée */}
        {!cocktail.image_url && (
          <div className={`absolute inset-0 bg-gradient-to-t ${getColorThemeClass(cocktail.color_theme)} opacity-80`} />
        )}
        {/* Overlay sombre léger pour la lisibilité du texte si image uploadée */}
        {cocktail.image_url && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        )}
        
        {/* Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="flex flex-col gap-2">
            {cocktail.is_featured && (
              <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                <Star className="h-3 w-3" />
                Populaire
              </div>
            )}
          </div>
        </div>

        {/* Prix de base - réduit */}
        <div className="absolute bottom-4 right-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1">

          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-6">
        {/* Titre et profil de saveur - maintenant sous l'image */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{cocktail.name}</h3>
          <p className="text-gray-600 text-sm">{cocktail.flavor_profile}</p>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
          {cocktail.short_description || cocktail.description}
        </p>

        {/* Badges de catégories avec codes couleur */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {cocktail.categories && cocktail.categories.length > 0 ? (
              cocktail.categories.map((category, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(category)}`}
                >
                  {category}
                </span>
              ))
            ) : cocktail.category ? (
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(cocktail.category)}`}
              >
                {cocktail.category}
              </span>
            ) : null}
          </div>
        </div>

        {/* Ingrédients principaux */}
        {cocktail.main_ingredients && cocktail.main_ingredients.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Ingrédients principaux</p>
            <div className="flex flex-wrap gap-1">
              {cocktail.main_ingredients.slice(0, 3).map((ingredient: any, index: any) => (
                <span key={index} className="bg-orange-50 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                  {ingredient}
                </span>
              ))}
              {cocktail.main_ingredients.length > 3 && (
                <span className="text-gray-500 text-xs self-center">+{cocktail.main_ingredients.length - 3} autres</span>
              )}
            </div>
          </div>
        )}



        {/* Bouton d'accordéon */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors border border-blue-200 rounded-lg mb-4 hover:bg-blue-50"
        >
          <span>{isExpanded ? 'Masquer les options' : 'Personnaliser mon cocktail'}</span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {/* Personnalisation */}
        <motion.div
          initial={false}
          animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
          className="overflow-hidden"
        >
          <div className="space-y-5">
          {/* Sélection du contenant */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              <Volume2 className="inline h-4 w-4 mr-1" />
              Choisissez votre contenant
            </label>
            <div className="grid grid-cols-1 gap-3">
              {containers.map((container) => (
                <button
                  key={container.id}
                  onClick={() => setSelectedContainer(container.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                    selectedContainer === container.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 text-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-base">{container.name}</div>
                      <div className="text-sm text-gray-500">{container.volume_ml}ml</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        {container.base_price > 0 ? `+${formatPrice(container.base_price)}` : 'Inclus'}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sélection du dosage */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              <Droplets className="inline h-4 w-4 mr-1" />
              Choisissez votre dosage d'alcool
            </label>
            <div className="grid grid-cols-1 gap-3">
              {dosages.map((dosage) => (
                <button
                  key={dosage.id}
                  onClick={() => setSelectedDosage(dosage.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                    selectedDosage === dosage.id
                      ? 'border-green-500 bg-green-50 text-green-700 shadow-md'
                      : 'border-gray-200 hover:border-green-300 text-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-base">{dosage.name}</div>

                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        {dosage.price_modifier > 0 ? `+${formatPrice(dosage.price_modifier)}` : 'Inclus'}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

        {/* Prix final et bouton d'ajout */}
        <div className="border-t border-gray-100 pt-6 mt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-sm text-gray-500 font-medium">Prix total</span>
              <div className="text-3xl font-bold text-gray-900">{formatPrice(finalPrice)}</div>
              <span className="text-xs text-gray-400">prix pour un cocktail</span>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddToCart}
            disabled={!selectedContainer || !selectedDosage}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-lg font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ShoppingCart className="h-5 w-5" />
            Ajouter au panier
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
