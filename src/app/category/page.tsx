'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  ShoppingCart, 
  Star, 
  Eye, 
  Menu, 
  X, 
  Heart, 
  ChevronDown, 
  Package, 
  Loader2,
  ArrowLeft,
  SlidersHorizontal,
  TrendingUp
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Separator } from '../../components/ui/separator';
import { useProducts } from '../../hooks/supabase/useProducts';
import { useCategories } from '../../hooks/supabase/useCategories';
import { getCategoryEmoji } from '../../utils/categoryEmojis';
import AddToCartButton from '../../components/AddToCartButton';
import { Header } from '../../components/layout/Header';
import { useMonitoring } from '../../components/MonitoringProvider';
import { ProductCard } from './ProductCard';

// Types pour les produits et catégories
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

// Fonction utilitaire pour vérifier si un produit appartient à une catégorie
function productBelongsToCategory(product: Product, categoryId: string): boolean {
  if (Array.isArray(product.categories)) {
    return product.categories.some((cat: { id: string }) => cat.id === categoryId);
  }
  // Fallback pour l'ancienne structure
  return (product.categories as any)?.id === categoryId;
}

// Fonction utilitaire pour compter les produits d'une catégorie
function countProductsInCategory(products: Product[], categoryId: string, featuredOnly = false): number {
  return products.filter((product: Product) => {
    const belongsToCategory = productBelongsToCategory(product, categoryId);
    return featuredOnly ? belongsToCategory && product.is_featured : belongsToCategory;
  }).length;
}

// Composant wrapper avec Suspense pour gérer les paramètres URL
function CategoryPageWrapper() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('id');
  const categoryName = searchParams.get('name');
  
  return (
    <CategoryContent 
      categoryId={categoryId} 
      categoryName={categoryName}
    />
  );
}

// Composant principal avec la logique métier
function CategoryContent({ 
  categoryId, 
  categoryName 
}: { 
  categoryId: string | null;
  categoryName: string | null;
}) {
  const router = useRouter();
  const { trackEvent, trackPageView } = useMonitoring();
  
  // États locaux
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Hooks pour récupérer les données
  const { data: categories = [], isLoading: categoriesLoading } = useCategories().getCategories();
  const { data: allProducts = [], isLoading: productsLoading } = useProducts().getProducts();
  
  // Trouver la catégorie actuelle
  const currentCategory = categories.find((cat: Category) => 
    cat.id === categoryId || 
    cat.name.toLowerCase() === categoryName?.toLowerCase()
  );
  
  // Filtrer les produits par catégorie
  const categoryProducts = currentCategory 
    ? allProducts.filter((product: Product) => productBelongsToCategory(product, currentCategory.id))
    : [];
  
  // Appliquer les filtres
  const filteredProducts = categoryProducts.filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const price = product.sale_price || product.base_price;
    const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
    
    return matchesSearch && matchesPrice && product.is_active;
  });
  
  // Trier les produits
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return (a.sale_price || a.base_price) - (b.sale_price || b.base_price);
      case 'price-desc':
        return (b.sale_price || b.base_price) - (a.sale_price || a.base_price);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });
  
  // Tracking de la page
  useEffect(() => {
    if (currentCategory) {
      trackPageView(`/category/${currentCategory.name}`);
      trackEvent('category_viewed', {
        category_id: currentCategory.id,
        category_name: currentCategory.name,
        products_count: categoryProducts.length
      });
    }
  }, [currentCategory, categoryProducts.length, trackPageView, trackEvent]);
  
  // Loading state
  if (categoriesLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-600" />
            <p className="text-gray-600">Chargement des produits...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Si aucune catégorie spécifique n'est trouvée, afficher toutes les catégories
  if (!currentCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
        <Header />
        
        {/* En-tête des catégories */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-3xl text-white shadow-lg">
                  🏪
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Nos Catégories</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Découvrez notre sélection de produits organisés par catégories pour faciliter votre shopping
              </p>
              <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  {categories.filter((cat: Category) => cat.is_active).length} catégories actives
                </span>
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  {allProducts.length} produits au total
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Grille des catégories */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {categories.filter((cat: Category) => cat.is_active).length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune catégorie disponible</h3>
              <p className="text-gray-600 mb-6">Il n'y a actuellement aucune catégorie active.</p>
              <Button 
                onClick={() => router.push('/products')}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Voir tous les produits
              </Button>
            </div>
          ) : (
            <>
              {/* Barre de recherche pour les catégories */}
              <div className="mb-8">
                <div className="relative max-w-md mx-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Rechercher une catégorie..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 py-3 text-center"
                  />
                </div>
              </div>
              
              {/* Grille des catégories */}
              <motion.div 
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              >
                {categories
                  .filter((cat: Category) => {
                    const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                         cat.description.toLowerCase().includes(searchTerm.toLowerCase());
                    return cat.is_active && matchesSearch;
                  })
                  .map((category: Category) => {
                    // Compter les produits pour cette catégorie
                    const productCount = countProductsInCategory(allProducts, category.id);
                    const featuredCount = countProductsInCategory(allProducts, category.id, true);
                    
                    return (
                      <motion.div
                        key={category.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        whileHover={{ y: -5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Link 
                          href={`/products?category=${category.id}&categoryName=${encodeURIComponent(category.name)}`}
                          onClick={() => {
                            // Tracking de clic sur catégorie
                            trackEvent('category_click', {
                              category_id: category.id,
                              category_name: category.name,
                              products_count: productCount,
                              source: 'categories_index'
                            });
                          }}
                        >
                          <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 shadow-lg overflow-hidden h-full">
                            <CardHeader className="p-0">
                              <div 
                                className="h-32 flex items-center justify-center text-4xl relative overflow-hidden"
                                style={{ 
                                  background: `linear-gradient(135deg, ${category.color}20, ${category.color}40)` 
                                }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                                <span className="relative z-10 group-hover:scale-110 transition-transform duration-300">
                                  {getCategoryEmoji(category.name) || category.emoji || category.icon}
                                </span>
                                
                                {/* Badge produits en vedette */}
                                {featuredCount > 0 && (
                                  <Badge className="absolute top-3 right-3 bg-blue-500 hover:bg-blue-600 shadow-lg">
                                    {featuredCount} vedette{featuredCount > 1 ? 's' : ''}
                                  </Badge>
                                )}
                              </div>
                            </CardHeader>
                            
                            <CardContent className="p-6">
                              <div className="text-center">
                                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                                  {category.name}
                                </h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                  {category.description}
                                </p>
                                
                                <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Package className="w-4 h-4" />
                                    {productCount} produit{productCount > 1 ? 's' : ''}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                            
                            <CardFooter className="p-6 pt-0">
                              <Button 
                                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-lg group-hover:shadow-xl transition-all duration-300"
                                size="lg"
                              >
                                Explorer cette catégorie
                                <ChevronDown className="w-4 h-4 ml-2 rotate-[-90deg]" />
                              </Button>
                            </CardFooter>
                          </Card>
                        </Link>
                      </motion.div>
                    );
                  })
                }
              </motion.div>
              
              {/* Message si aucune catégorie trouvée après recherche */}
              {searchTerm && categories.filter((cat: Category) => {
                const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                     cat.description.toLowerCase().includes(searchTerm.toLowerCase());
                return cat.is_active && matchesSearch;
              }).length === 0 && (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune catégorie trouvée</h3>
                  <p className="text-gray-600 mb-6">
                    Aucune catégorie ne correspond à "{searchTerm}"
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchTerm('')}
                  >
                    Effacer la recherche
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Section d'appel à l'action */}
        <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Vous ne trouvez pas ce que vous cherchez ?</h2>
              <p className="text-xl mb-8 opacity-90">
                Découvrez tous nos produits ou contactez-nous pour des recommandations personnalisées
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  variant="secondary"
                  onClick={() => router.push('/products')}
                  className="bg-white text-orange-600 hover:bg-gray-50"
                >
                  <Package className="w-5 h-5 mr-2" />
                  Voir tous les produits
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => router.push('/contact')}
                  className="border-white text-white hover:bg-white hover:text-orange-600"
                >
                  Nous contacter
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      <Header />
      
      {/* En-tête de catégorie */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.back()}
                className="mb-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <div 
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl`}
              style={{ backgroundColor: currentCategory.color + '20' }}
            >
              {getCategoryEmoji(currentCategory.name) || currentCategory.emoji || currentCategory.icon}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{currentCategory.name}</h1>
              <p className="text-gray-600 mt-1">{currentCategory.description}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  {sortedProducts.length} produit{sortedProducts.length > 1 ? 's' : ''}
                </span>
                {sortedProducts.some(p => p.is_featured) && (
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    {sortedProducts.filter(p => p.is_featured).length} en vedette
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Barre de recherche et filtres */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Recherche */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Rechercher des produits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Contrôles */}
            <div className="flex items-center gap-3">
              {/* Tri */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nom (A-Z)</SelectItem>
                  <SelectItem value="price-asc">Prix croissant</SelectItem>
                  <SelectItem value="price-desc">Prix décroissant</SelectItem>
                  <SelectItem value="rating">Mieux notés</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Filtres */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? 'bg-orange-50 border-orange-200' : ''}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filtres
              </Button>
              
              {/* Mode d'affichage */}
              <div className="flex border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Panneau de filtres */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 pt-4 border-t"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fourchette de prix
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                        className="w-24"
                      />
                      <span className="text-gray-500">-</span>
                      <Input
                        type="number"
                        placeholder="Max"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                        className="w-24"
                      />
                      <span className="text-sm text-gray-500">XAF</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Grille de produits */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {sortedProducts.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun produit trouvé</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? `Aucun produit ne correspond à "${searchTerm}" dans cette catégorie.`
                : "Il n'y a actuellement aucun produit dans cette catégorie."
              }
            </p>
            {searchTerm && (
              <Button 
                variant="outline" 
                onClick={() => setSearchTerm('')}
                className="mr-3"
              >
                Effacer la recherche
              </Button>
            )}
            <Button 
              onClick={() => router.push('/products')}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Voir tous les produits
            </Button>
          </div>
        ) : (
          <motion.div 
            layout
            className={viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
            }
          >
            {sortedProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                viewMode={viewMode}
                onProductClick={() => {
                  trackEvent('product_clicked', {
                    product_id: product.id,
                    product_name: product.name,
                    category_id: currentCategory.id,
                    category_name: currentCategory.name,
                    source: 'category_page'
                  });
                }}
              />
            ))}
          </motion.div>
        )}
      </div>
      
      {/* Catégories suggérées */}
      {sortedProducts.length > 0 && (
        <div className="bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Autres catégories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {categories
                .filter((cat: Category) => cat.id !== currentCategory.id && cat.is_active)
                .slice(0, 6)
                .map((category: Category) => {
                  const productCount = countProductsInCategory(allProducts, category.id);
                  return (
                    <Link 
                      key={category.id} 
                      href={`/products?category=${category.id}&categoryName=${encodeURIComponent(category.name)}`}
                    >
                      <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                        <CardContent className="p-6 text-center">
                          <div 
                            className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center text-lg group-hover:scale-110 transition-transform"
                            style={{ backgroundColor: category.color + '20' }}
                          >
                            {getCategoryEmoji(category.name) || category.emoji || category.icon}
                          </div>
                          <h3 className="font-semibold text-gray-900 text-sm mb-1">{category.name}</h3>
                          <p className="text-xs text-gray-500">
                            {productCount} produit{productCount > 1 ? 's' : ''}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant principal avec Suspense boundary
export default function CategoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-600" />
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      </div>
    }>
      <CategoryPageWrapper />
    </Suspense>
  );
}
