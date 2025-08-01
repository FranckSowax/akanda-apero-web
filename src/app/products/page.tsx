'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Grid, List, ShoppingCart, Star, Eye, Menu, X, Heart, ChevronDown, Package, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { supabaseService } from '../../services/supabaseService';
import { useCart } from '../../hooks/useCart';
import { useProductPageSync } from '../../hooks/useProductSync';
import { getCategoryEmoji } from '../../utils/categoryEmojis';
import AddToCartButton from '../../components/AddToCartButton';
import { Header } from '../../components/layout/Header';

interface Product {
  id: string;
  name: string;
  description: string;
  base_price: number;
  sale_price?: number;
  image_url?: string;
  emoji?: string;
  rating?: number;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  categories?: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  emoji?: string;
  color: string;
  is_active: boolean;
}

// La fonction getCategoryEmoji est maintenant importée depuis utils/categoryEmojis

// Composant qui gère les paramètres URL
function ProductsPageWrapper() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const categoryNameParam = searchParams.get('categoryName');
  
  return (
    <ProductsContent 
      categoryParam={categoryParam}
      categoryNameParam={categoryNameParam}
    />
  );
}

// Composant principal avec la logique métier
function ProductsContent({ 
  categoryParam, 
  categoryNameParam 
}: { 
  categoryParam: string | null;
  categoryNameParam: string | null;
}) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'rating'>('name');
  const [favorites, setFavorites] = useState<string[]>([]);
  
  const { addToCart, getItemQuantity, updateQuantity, getCartItemCount } = useCart();
  
  // Fonctions de chargement pour la synchronisation
  const loadProducts = async () => {
    const productsData = await supabaseService.getAllProducts();
    setProducts(productsData);
  };
  
  const loadCategories = async () => {
    const categoriesData = await supabaseService.getAllCategories();
    setCategories(categoriesData);
  };
  
  // Hook de synchronisation pour recharger automatiquement les données
  useProductPageSync(loadProducts, loadCategories);

  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          supabaseService.getAllProducts(),
          supabaseService.getAllCategories()
        ]);
        
        setProducts(productsData);
        setCategories(categoriesData);
        setFilteredProducts(productsData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Détecter les paramètres d'URL pour le filtre de catégorie
  useEffect(() => {
    if (categoryParam && categoryParam !== 'all') {
      setSelectedCategory(categoryParam);
      console.log(`🎯 Filtre de catégorie appliqué depuis l'URL: ${categoryNameParam || categoryParam}`);
    }
  }, [categoryParam, categoryNameParam]);

  // Filtrer et trier les produits
  useEffect(() => {
    let filtered = products.filter(product => {
      const matchesCategory = selectedCategory === 'all' || product.categories?.id === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch && product.is_active;
    });

    // Trier les produits
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return (a.sale_price || a.base_price) - (b.sale_price || b.base_price);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchTerm, sortBy]);

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const getPrice = (product: Product) => {
    return product.sale_price || product.base_price || 0;
  };

  const hasDiscount = (product: Product) => {
    return product.sale_price && product.sale_price < product.base_price;
  };

  const getDiscountPercentage = (product: Product) => {
    if (!hasDiscount(product)) return 0;
    return Math.round(((product.base_price - (product.sale_price || 0)) / product.base_price) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">

      {/* Section Titre et Recherche */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900">À Boire</h1>
              <p className="text-gray-600 mt-1">Découvrez notre sélection de boissons premium</p>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent w-64"
                />
              </div>
              
              {/* Mode d'affichage */}
              <div className="flex bg-gray-100 rounded-full p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-full transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-full transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Filtres */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtres
              </h3>
              
              {/* Catégories */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-3">Catégories</h4>
                
                {/* Liste déroulante pour mobile */}
                <div className="block md:hidden">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                  >
                    <option value="all">🏷️ Toutes les catégories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {getCategoryEmoji(category.name, category.icon)} {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Liste de boutons pour desktop */}
                <div className="hidden md:block space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === 'all' 
                        ? 'bg-green-100 text-green-700 font-medium' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Toutes les catégories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        selectedCategory === category.id 
                          ? 'bg-green-100 text-green-700 font-medium' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-lg">{getCategoryEmoji(category.name, category.icon)}</span>
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Tri */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Trier par</h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'rating')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="name">Nom (A-Z)</option>
                  <option value="price">Prix (croissant)</option>
                  <option value="rating">Note (décroissant)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="flex-1">
            {/* Résultats */}
            <div className="mb-6">
              <p className="text-gray-600">
                {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
                {selectedCategory !== 'all' && (
                  <span> dans "{categories.find(c => c.id === selectedCategory)?.name}"</span>
                )}
              </p>
            </div>

            {/* Grille de produits */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto mb-4" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun produit trouvé</h3>
                <p className="text-gray-600">Essayez de modifier vos critères de recherche</p>
              </div>
            ) : (
              <AnimatePresence>
                <div className={`grid gap-3 sm:gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1'
                }`}>
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group relative ${
                        viewMode === 'list' ? 'flex' : ''
                      }`}
                    >
                      {/* Image */}
                      <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-square'}`}>
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <span className="text-4xl">{product.emoji || '🍹'}</span>
                          </div>
                        )}
                        
                        {/* Badge réduction */}
                        {hasDiscount(product) && (
                          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-500 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-bold">
                            -{getDiscountPercentage(product)}%
                          </div>
                        )}
                        
                        {/* Actions - masquées sur mobile pour économiser l'espace */}
                        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 hidden sm:flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => toggleFavorite(product.id)}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors ${
                              favorites.includes(product.id)
                                ? 'bg-red-500 text-white'
                                : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500'
                            }`}
                          >
                            <Heart className="w-3 h-3 sm:w-4 sm:h-4" fill={favorites.includes(product.id) ? 'currentColor' : 'none'} />
                          </button>
                          <button className="w-7 h-7 sm:w-8 sm:h-8 bg-white text-gray-600 rounded-full flex items-center justify-center hover:bg-blue-50 hover:text-blue-500 transition-colors">
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Contenu */}
                      <div className="p-2 sm:p-4 flex-1">
                        <div className="flex items-start justify-between mb-1 sm:mb-2">
                          <h3 className="font-bold text-gray-900 text-sm sm:text-lg group-hover:text-green-600 transition-colors line-clamp-2 sm:line-clamp-1">
                            {product.name}
                          </h3>
                          {/* Rating supprimé pour éliminer le "0" */}
                        </div>
                        
                        {/* Description masquée sur mobile */}
                        <p className="text-gray-600 text-sm mb-2 sm:mb-4 hidden sm:block overflow-hidden text-ellipsis whitespace-nowrap">
                          {product.description}
                        </p>
                        
                        {/* Prix */}
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            {hasDiscount(product) && (
                              <span className="text-gray-400 line-through text-xs sm:text-sm">
                                {product.base_price.toLocaleString()} XAF
                              </span>
                            )}
                            <span className="font-bold text-sm sm:text-xl text-gray-900">
                              {getPrice(product).toLocaleString()} XAF
                            </span>
                          </div>

                          
                          {getItemQuantity(product.id) > 0 && (
                            <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
                              <button 
                                onClick={() => updateQuantity(product.id, Math.max(0, getItemQuantity(product.id) - 1))}
                                className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors flex items-center justify-center text-xs sm:text-sm"
                              >
                                -
                              </button>
                              <span className="font-bold text-xs sm:text-sm min-w-[1rem] sm:min-w-[1.5rem] text-center">
                                {getItemQuantity(product.id)}
                              </span>
                              <button 
                                onClick={() => updateQuantity(product.id, getItemQuantity(product.id) + 1)}
                                className="w-5 h-5 sm:w-6 sm:h-6 bg-[#f5a623] text-white rounded-full hover:bg-[#e09000] transition-colors flex items-center justify-center text-xs sm:text-sm"
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {/* Stock */}
                        {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                          <p className="text-orange-600 text-xs mt-1 sm:mt-2 font-medium">
                            Plus que {product.stock_quantity} en stock !
                          </p>
                        )}
                        {product.stock_quantity === 0 && (
                          <p className="text-red-600 text-xs mt-1 sm:mt-2 font-medium">Rupture de stock</p>
                        )}
                      </div>
                      
                      {/* Bouton Add to Cart - inline sur mobile, absolu sur desktop */}
                      <div className="sm:absolute sm:bottom-2 sm:right-2 flex justify-end mt-2 sm:mt-0">
                        <AddToCartButton
                          product={{
                            id: product.id || '',
                            name: product.name,
                            description: product.description,
                            price: getPrice(product),
                            imageUrl: product.image_url || '',
                            currency: 'XAF',
                            categorySlug: 'cocktails',
                            stock: 100,
                            discount: hasDiscount(product) ? getDiscountPercentage(product) : 0
                          }}
                          inline={true}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

// Composant principal avec Suspense boundary
export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des produits...</p>
        </div>
      </div>
    }>
      <ProductsPageWrapper />
    </Suspense>
  );
}
