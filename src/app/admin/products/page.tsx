'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase/client';
import { supabaseService } from '../../../services/supabaseService';
import { useProductSync } from '../../../hooks/useProductSync';
import { 
  Package, Plus, Search, Edit, Trash2, X, 
  Star, AlertCircle, Save, Eye, EyeOff, 
  ChevronDown, ChevronUp, Image as ImageIcon
} from 'lucide-react';

// Types
interface Product {
  id: string;
  category_id: string;
  name: string;
  description: string;
  short_description?: string;
  image_url?: string;
  emoji?: string;
  base_price: number;
  sale_price?: number;
  product_type?: 'simple' | 'bundle' | 'cocktail_kit';
  sku?: string;
  stock_quantity: number;
  min_stock_level?: number;
  is_active: boolean;
  is_featured: boolean;
  rating?: number;
  rating_count?: number;
  weight_grams?: number;
  alcohol_percentage?: number;
  volume_ml?: number;
  origin_country?: string;
  brand?: string;
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
  created_at?: string;
  updated_at?: string;
  categories?: { name: string; icon: string };
  product_options?: ProductOption[];
}

interface ProductOption {
  id: string;
  product_id: string;
  name: string;
  description?: string;
  price_modifier: number;
  stock_quantity: number;
  is_default: boolean;
  is_active: boolean;
  sort_order: number;
  image_url?: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color_class: string;
}

// Composants UI simples
const Button = ({ children, onClick, className = '', variant = 'primary', disabled = false, type = 'button' }: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  type?: 'button' | 'submit';
}) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Input = ({ value, onChange, placeholder, className = '', type = 'text', ...props }: {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  type?: string;
  [key: string]: any;
}) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
    {...props}
  />
);

const Label = ({ children, htmlFor, className = '' }: {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 ${className}`}>
    {children}
  </label>
);

export default function ProductsPage() {
  // États
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Hook de synchronisation
  const { triggerSync } = useProductSync();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_price: 0,
    stock_quantity: 0,
    category_id: '',
    is_featured: false,
    is_active: true,
    image_url: ''
  });
  const [productOptions, setProductOptions] = useState<Omit<ProductOption, 'id' | 'product_id'>[]>([]);

  // Charger les données
  useEffect(() => {
    loadData();
  }, []);

  // Synchronisation forcée du modal
  useEffect(() => {
    if (showForm && isEditMode && currentProduct) {
      console.log('🔄 Synchronisation forcée du modal:', {
        showForm,
        isEditMode,
        currentProduct: currentProduct.name,
        formDataName: formData.name
      });
      
      // Vérifier que le modal est bien visible dans le DOM
      setTimeout(() => {
        const modalElement = document.querySelector('form[class*="space-y"]') ||
                           document.querySelector('div[class*="bg-white rounded-lg shadow-sm"]');
        
        if (!modalElement) {
          console.warn('⚠️ Modal non trouvé dans le DOM, nouvelle tentative...');
          setShowForm(false);
          setTimeout(() => setShowForm(true), 50);
        } else {
          console.log('✅ Modal confirmé visible dans le DOM');
        }
      }, 100);
    }
  }, [showForm, isEditMode, currentProduct, formData.name]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger les produits avec leurs catégories et options
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          categories (name, icon),
          product_options (*)
        `)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // Charger les catégories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesError) throw categoriesError;

      setProducts(productsData || []);
      setCategories(categoriesData || []);
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les produits
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (isEditMode && currentProduct) {
        // Mise à jour
        const { error } = await supabase
          .from('products')
          .update(formData)
          .eq('id', currentProduct.id);
          
        if (error) throw error;
        
        // Mettre à jour les options si nécessaire
        await updateProductOptions(currentProduct.id);
        
        // Déclencher la synchronisation pour les produits modifiés
        triggerSync({
          type: 'product_updated',
          productId: currentProduct.id,
          categoryId: formData.category_id
        });
        
        // Notifier le service de cache
        supabaseService.notifyDataChange('products', 'updated', currentProduct.id);
      } else {
        // Création
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert([formData])
          .select()
          .single();
          
        if (error) throw error;
        
        // Ajouter les options si nécessaire
        if (newProduct && productOptions.length > 0) {
          await updateProductOptions(newProduct.id);
        }
        
        // Déclencher la synchronisation pour les nouveaux produits
        triggerSync({
          type: 'product_added',
          productId: newProduct.id,
          categoryId: newProduct.category_id
        });
        
        // Notifier le service de cache
        supabaseService.notifyDataChange('products', 'added', newProduct.id);
      }
      
      await loadData();
      resetForm();
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour les options du produit
  const updateProductOptions = async (productId: string) => {
    if (productOptions.length === 0) return;
    
    // Supprimer les anciennes options
    await supabase
      .from('product_options')
      .delete()
      .eq('product_id', productId);
    
    // Ajouter les nouvelles options
    const optionsToInsert = productOptions.map((option, index) => ({
      ...option,
      product_id: productId,
      sort_order: index
    }));
    
    await supabase
      .from('product_options')
      .insert(optionsToInsert);
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      base_price: 0,
      stock_quantity: 0,
      category_id: '',
      is_featured: false,
      is_active: true,
      image_url: ''
    });
    setProductOptions([]);
    setShowForm(false);
    setIsEditMode(false);
    setCurrentProduct(null);
  };

  // Fonction de normalisation des données produit
  const normalizeProductData = (product: any): Product => {
    console.log('🔄 Normalisation des données produit:', product);
    
    const normalized = {
      id: product.id || `temp-${Date.now()}`,
      category_id: product.category_id || '',
      name: product.name || 'Produit sans nom',
      description: product.description || '',
      short_description: product.short_description || '',
      image_url: product.image_url || '',
      emoji: product.emoji || '',
      base_price: Number(product.base_price) || 0,
      sale_price: product.sale_price ? Number(product.sale_price) : undefined,
      product_type: product.product_type || 'simple',
      sku: product.sku || '',
      stock_quantity: Number(product.stock_quantity) || 0,
      min_stock_level: product.min_stock_level ? Number(product.min_stock_level) : undefined,
      is_active: Boolean(product.is_active),
      is_featured: Boolean(product.is_featured),
      rating: product.rating ? Number(product.rating) : undefined,
      rating_count: product.rating_count ? Number(product.rating_count) : undefined,
      weight_grams: product.weight_grams ? Number(product.weight_grams) : undefined,
      alcohol_percentage: product.alcohol_percentage ? Number(product.alcohol_percentage) : undefined,
      volume_ml: product.volume_ml ? Number(product.volume_ml) : undefined,
      origin_country: product.origin_country || '',
      brand: product.brand || '',
      tags: Array.isArray(product.tags) ? product.tags : [],
      meta_title: product.meta_title || '',
      meta_description: product.meta_description || '',
      created_at: product.created_at || new Date().toISOString(),
      updated_at: product.updated_at || new Date().toISOString(),
      categories: product.categories || null,
      product_options: Array.isArray(product.product_options) ? product.product_options : []
    };
    
    console.log('✅ Données normalisées:', normalized);
    return normalized;
  };

  // Gérer l'édition avec diagnostic ultra-détaillé
  const handleEdit = async (rawProduct: any) => {
    const productName = rawProduct?.name || 'Produit inconnu';
    const isBombaySapphire = productName.toLowerCase().includes('bombay');
    
    console.log('=== EDIT PRODUCT START ===');
    console.log('📝 Produit:', productName);
    console.log('🔍 Bombay Sapphire détecté:', isBombaySapphire);
    console.log('📝 Données brutes reçues:', rawProduct);
    
    // Diagnostic spécial pour Bombay Sapphire
    if (isBombaySapphire) {
      console.log('🍸 === DIAGNOSTIC SPÉCIAL BOMBAY SAPPHIRE ===');
      console.log('🔍 États actuels:', { showForm, isEditMode, isProcessing, currentProduct: currentProduct?.name });
      console.log('🔍 Données Bombay:', JSON.stringify(rawProduct, null, 2));
    }
    
    // Éviter les clics multiples
    if (isProcessing) {
      console.log('⚠️ Édition déjà en cours, ignoré');
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Diagnostic spécial pour Bombay Sapphire
      if (isBombaySapphire) {
        console.log('🍸 Début traitement Bombay Sapphire...');
        
        // Forcer la fermeture de tout modal existant
        setShowForm(false);
        setIsEditMode(false);
        setCurrentProduct(null);
        
        // Attendre un peu plus longtemps pour Bombay
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log('🍸 Reset complet effectué pour Bombay');
      }
      
      // Normaliser les données produit
      const product = normalizeProductData(rawProduct);
      
      if (isBombaySapphire) {
        console.log('🍸 Données Bombay normalisées:', product);
      }
      
      // Validation minimale
      if (!product.id || product.id === `temp-${Date.now()}`) {
        console.warn('⚠️ ID produit manquant ou temporaire, mais on continue...');
      }
      
      console.log('📝 Configuration du formulaire pour:', product.name);
      
      // Configurer le produit courant
      setCurrentProduct(product);
      
      // Préparer les données du formulaire avec fallbacks complets
      const newFormData = {
        name: String(product.name || ''),
        description: String(product.description || ''),
        base_price: Number(product.base_price) || 0,
        stock_quantity: Number(product.stock_quantity) || 0,
        category_id: String(product.category_id || ''),
        is_featured: Boolean(product.is_featured),
        is_active: Boolean(product.is_active !== false),
        image_url: String(product.image_url || '')
      };
      
      if (isBombaySapphire) {
        console.log('🍸 FormData Bombay préparé:', newFormData);
      }
      
      setFormData(newFormData);
      
      // Gestion des options produit
      let options: Omit<ProductOption, 'id' | 'product_id'>[] = [];
      
      if (Array.isArray(product.product_options) && product.product_options.length > 0) {
        options = product.product_options.map((opt: any, index: number) => ({
          name: String(opt.name || `Option ${index + 1}`),
          description: String(opt.description || ''),
          price_modifier: Number(opt.price_modifier) || 0,
          stock_quantity: Number(opt.stock_quantity) || 0,
          is_default: Boolean(opt.is_default),
          is_active: Boolean(opt.is_active !== false),
          sort_order: Number(opt.sort_order) || index,
          image_url: String(opt.image_url || '')
        }));
      }
      
      setProductOptions(options);
      
      // Attendre la synchronisation
      await new Promise(resolve => setTimeout(resolve, isBombaySapphire ? 100 : 10));
      
      // Activer le mode édition
      console.log('✅ Activation du mode édition...');
      setIsEditMode(true);
      
      if (isBombaySapphire) {
        console.log('🍸 Mode édition activé pour Bombay');
      }
      
      // Attendre encore un peu
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Forcer l'affichage du formulaire
      setShowForm(true);
      
      if (isBombaySapphire) {
        console.log('🍸 ShowForm activé pour Bombay');
        
        // Tentatives multiples pour Bombay Sapphire
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            console.log(`🍸 Tentative ${i + 1}/3 d'affichage modal Bombay`);
            setShowForm(true);
            setIsEditMode(true);
            
            // Vérifier le DOM
            setTimeout(() => {
              const modal = document.querySelector('form[class*="space-y"]') ||
                           document.querySelector('div[class*="bg-white rounded-lg shadow-sm"]');
              
              if (modal) {
                console.log(`🍸 ✅ Modal Bombay visible (tentative ${i + 1})`);
              } else {
                console.log(`🍸 ❌ Modal Bombay non visible (tentative ${i + 1})`);
                
                // Forcer l'affichage en modifiant le style directement
                const allForms = document.querySelectorAll('form');
                allForms.forEach(form => {
                  if (form.style.display === 'none') {
                    form.style.display = 'block';
                    console.log('🍸 🔧 Formulaire forcé visible via CSS');
                  }
                });
              }
            }, 100);
          }, (i + 1) * 100);
        }
      } else {
        // Vérification standard pour les autres produits
        setTimeout(() => {
          setShowForm(true);
          console.log('🔄 Vérification supplémentaire: showForm forcé à true');
        }, 50);
      }
      
      console.log('✅ Édition configurée pour:', product.name);
      console.log('✅ isEditMode:', true, '| showForm:', true);
      console.log('✅ Modal DOIT être visible maintenant');
      
      if (isBombaySapphire) {
        console.log('🍸 === FIN DIAGNOSTIC BOMBAY SAPPHIRE ===');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'édition:', error);
      
      if (isBombaySapphire) {
        console.error('🍸 ❌ Erreur spécifique Bombay:', error);
      }
      
      // Même en cas d'erreur, forcer l'ouverture
      setIsEditMode(true);
      setShowForm(true);
      
    } finally {
      setIsProcessing(false);
      console.log('=== EDIT PRODUCT END ===');
    }
  };

  // Gérer la suppression
  const handleDelete = async (productId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
        
      if (error) throw error;
      
      // Déclencher la synchronisation pour la suppression
      triggerSync({
        type: 'product_deleted',
        productId: productId
      });
      
      // Notifier le service de cache
      supabaseService.notifyDataChange('products', 'deleted', productId);
      
      await loadData();
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  // Ajouter une option de produit
  const addProductOption = () => {
    setProductOptions([...productOptions, {
      name: '',
      description: '',
      price_modifier: 0,
      stock_quantity: 0,
      is_default: false,
      is_active: true,
      sort_order: productOptions.length,
      image_url: ''
    }]);
  };

  // Supprimer une option de produit
  const removeProductOption = (index: number) => {
    setProductOptions(productOptions.filter((_, i) => i !== index));
  };

  // Gérer l'upload d'image
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier la taille du fichier (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Le fichier est trop volumineux. Taille maximale: 5MB');
      return;
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide.');
      return;
    }

    try {
      // Créer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Upload vers Supabase Storage
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (error) {
        console.error('Erreur upload:', error);
        alert('Erreur lors de l\'upload de l\'image');
        return;
      }

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      // Mettre à jour le formData avec l'URL de l'image
      setFormData({ ...formData, image_url: publicUrl });
    } catch (err) {
      console.error('Erreur lors de l\'upload:', err);
      alert('Erreur lors de l\'upload de l\'image');
    }
  };

  // Gérer l'upload d'image pour les options
  const handleOptionImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, optionIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier la taille du fichier (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Le fichier est trop volumineux. Taille maximale: 5MB');
      return;
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide.');
      return;
    }

    try {
      // Créer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-option-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `product-options/${fileName}`;

      // Upload vers Supabase Storage
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (error) {
        console.error('Erreur upload option:', error);
        alert('Erreur lors de l\'upload de l\'image de l\'option');
        return;
      }

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      // Mettre à jour l'option avec l'URL de l'image
      const newOptions = [...productOptions];
      newOptions[optionIndex].image_url = publicUrl;
      setProductOptions(newOptions);
    } catch (err) {
      console.error('Erreur lors de l\'upload de l\'option:', err);
      alert('Erreur lors de l\'upload de l\'image de l\'option');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <h1 className="text-xl font-semibold mt-4 text-gray-700">Chargement des produits...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadData}>Réessayer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestion des produits</h1>
          <p className="text-gray-600">Gérez vos produits et leurs options</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un produit
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total produits</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Eye className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Actifs</p>
              <p className="text-2xl font-bold text-gray-900">{products.filter(p => p.is_active).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Star className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Vedettes</p>
              <p className="text-2xl font-bold text-gray-900">{products.filter(p => p.is_featured).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Stock faible</p>
              <p className="text-2xl font-bold text-gray-900">{products.filter(p => p.stock_quantity < 10).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un produit..."
                className="pl-10"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Toutes les catégories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {isEditMode ? 'Modifier le produit' : 'Ajouter un produit'}
            </h2>
            <Button variant="secondary" onClick={resetForm}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom du produit</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Nom du produit"
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Catégorie</Label>
                <select
                  id="category"
                  value={formData.category_id}
                  onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Description du produit"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Prix (FCFA)</Label>
                <Input
                  id="price"
                  type="number"
                  step="1"
                  value={formData.base_price}
                  onChange={(e) => setFormData({...formData, base_price: parseFloat(e.target.value) || 0})}
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({...formData, stock_quantity: parseInt(e.target.value) || 0})}
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="image_upload">Image du produit</Label>
              <div className="space-y-2">
                <input
                  id="image_upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {formData.image_url && (
                  <div className="mt-2">
                    <img
                      src={formData.image_url}
                      alt="Aperçu"
                      className="h-20 w-20 object-cover rounded-lg border"
                    />
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  Formats acceptés: JPG, PNG, GIF (max 5MB)
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Produit vedette</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Actif</span>
              </label>
            </div>

            {/* Options de soft */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Options de soft</Label>
                <Button type="button" variant="secondary" onClick={addProductOption}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une option
                </Button>
              </div>
              
              {productOptions.map((option, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-2">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">Option {index + 1}</h4>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => removeProductOption(index)}
                      className="text-xs px-2 py-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Input
                      value={option.name}
                      onChange={(e) => {
                        const newOptions = [...productOptions];
                        newOptions[index].name = e.target.value;
                        setProductOptions(newOptions);
                      }}
                      placeholder="Nom de l'option"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      value={option.price_modifier}
                      onChange={(e) => {
                        const newOptions = [...productOptions];
                        newOptions[index].price_modifier = parseFloat(e.target.value) || 0;
                        setProductOptions(newOptions);
                      }}
                      placeholder="Modificateur de prix (FCFA)"
                    />
                  </div>
                  
                  <div className="mt-2 space-y-2">
                    <label className="block text-xs font-medium text-gray-700">Image de l'option</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleOptionImageUpload(e, index)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {option.image_url && (
                      <div className="flex items-center space-x-2">
                        <img
                          src={option.image_url}
                          alt="Aperçu option"
                          className="h-12 w-12 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newOptions = [...productOptions];
                            newOptions[index].image_url = '';
                            setProductOptions(newOptions);
                          }}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="secondary" onClick={resetForm}>
                Annuler
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                {isEditMode ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des produits */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Options
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.image_url && (
                          <img
                            className="h-10 w-10 rounded-lg object-cover mr-3"
                            src={product.image_url}
                            alt={product.name}
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {product.categories?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {product.base_price.toLocaleString('fr-FR')} FCFA
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.stock_quantity < 10 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {product.is_active ? (
                          <Eye className="h-4 w-4 text-green-500" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                        {product.is_featured && (
                          <Star className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">
                        {product.product_options?.length || 0} option(s)
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="secondary"
                          onClick={() => handleEdit(product)}
                          className="text-xs px-2 py-1"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleDelete(product.id)}
                          className="text-xs px-2 py-1"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit trouvé</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Aucun produit ne correspond à vos critères de recherche.'
                : 'Commencez par ajouter votre premier produit.'
              }
            </p>
            {!searchTerm && selectedCategory === 'all' && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un produit
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
