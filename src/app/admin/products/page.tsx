'use client';

import React, { useState, useEffect } from 'react';
import { useProducts } from '../../../hooks/supabase/useProducts';
import { Product, Category } from '../../../types/supabase';
import { ClientOnly } from '../../../components/ui/client-only';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import { Checkbox } from '../../../components/ui/checkbox';
import { PackageOpen, Plus, Filter, Search, Edit, Trash2, Upload, X, Camera } from 'lucide-react';

// Fonction utilitaire pour obtenir une URL d'image fiable
const getProductImageUrl = (product: any): string => {
  if (product?.product_images && Array.isArray(product.product_images) && product.product_images.length > 0) {
    const imageUrl = product.product_images[0].image_url;
    
    // Vérifier si l'URL est un blob local (ne fonctionnera pas pour le rendu)
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('blob:')) {
      // Renvoyer une URL d'image aléatoire pour le développement
      return `https://source.unsplash.com/random/800x600?sig=${product.id}`;
    }
    
    return imageUrl;
  }
  
  // Image par défaut si aucune image n'est disponible
  return 'https://picsum.photos/seed/default/600/600';
};

export default function ProductsPage() {
  const { getProducts, getCategories, createProduct, updateProduct, deleteProduct } = useProducts();
  const { data: productsData, isLoading, error, refetch } = getProducts();
  const { data: categories, isLoading: isCategoriesLoading } = getCategories();
  
  // Utiliser un état local pour gérer les produits et permettre une mise à jour optimiste
  const [localProducts, setLocalProducts] = useState<any[]>([]);
  
  // Synchroniser l'état local avec les données de React Query
  useEffect(() => {
    if (productsData) {
      setLocalProducts(productsData);
    }
  }, [productsData]);

  // État pour le formulaire
  const [formData, setFormData] = useState({
    product: {
      name: '',
      slug: '',
      description: '',
      price: 0,
      stock_quantity: 0,
      is_active: true,
      is_featured: false,
      low_stock_threshold: 5
    },
    images: [] as { image_url: string; alt_text?: string }[],
    categories: [] as string[]
  });
  
  // État pour indiquer si nous sommes en mode édition
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  
  // État pour la prévisualisation des images
  const [imagePreview, setImagePreview] = useState<string[]>([]);

  // État pour la recherche et le filtrage
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Gérer le changement des valeurs du formulaire
  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        product: {
          ...prev.product,
          [name]: target.checked
        }
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        product: {
          ...prev.product,
          [name]: Number(value)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        product: {
          ...prev.product,
          [name]: value
        }
      }));
    }
  };
  
  // Gérer le changement des catégories
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setFormData(prev => ({ ...prev, categories: selectedOptions }));
  };
  
  // Gérer l'ajout d'images
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Filtrer d'abord les fichiers non-images
      const validFiles = Array.from(e.target.files).filter(file => {
        const isImageFile = file.type.startsWith('image/');
        if (!isImageFile) {
          alert(`Le fichier ${file.name} n'est pas une image valide.`);
          return false;
        }
        return true;
      });
      
      const newImages = validFiles.map(file => {

        // Créer une URL pour la prévisualisation
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(prev => [...prev, previewUrl]);
        
        // Avec une vraie application backend, on enverrait le fichier à un service comme Supabase Storage
        // et on aurait une URL permanente. Pour cette démo, on simule ce comportement.

        let imageUrl = '';

        // Option 1: Convertir l'image en Data URL (base64) - FONCTIONNE POUR TOUTES LES IMAGES
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target && event.target.result) {
            // Mettre à jour l'image avec le data URL
            // Cette action est asynchorne, donc on doit mettre à jour formData après que reader.onload soit exécuté
            const dataUrl = event.target.result as string;
            
            // Mettre à jour l'URL dans les images du formulaire
            setFormData(prev => {
              const updatedImages = [...prev.images];
              const indexToUpdate = updatedImages.findIndex(img => 
                img.alt_text === file.name && img.image_url.startsWith('placeholder-'));
              
              if (indexToUpdate !== -1) {
                updatedImages[indexToUpdate].image_url = dataUrl;
              }
              
              return {
                ...prev,
                images: updatedImages
              };
            });
          }
        };
        
        // Démarrer la lecture du fichier en tant que Data URL
        reader.readAsDataURL(file);
        
        // Créer un placeholder en attendant que le Data URL soit prêt
        imageUrl = `placeholder-${Date.now()}-${file.name}`;
        
        return {
          image_url: imageUrl,
          alt_text: file.name
        };
      });
      
      // Les images sont maintenant toutes valides (pas de null)
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    }
  };
  
  // Retirer une image
  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    
    // Libérer l'URL de prévisualisation
    URL.revokeObjectURL(imagePreview[index]);
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };
  
  // Générer automatiquement un slug à partir du nom
  const generateSlug = () => {
    const slug = formData.product.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Retirer les accents
      .replace(/[^a-z0-9]+/g, '-') // Remplacer les caractères non alphanumériques par des tirets
      .replace(/^-+|-+$/g, '') // Retirer les tirets au début et à la fin
      .trim();
    
    setFormData(prev => ({
      ...prev,
      product: {
        ...prev.product,
        slug
      }
    }));
  };
  
  // Mettre en place le formulaire en mode édition
  const setupEditForm = (product: Product) => {
    // Récupérer les ID de catégories si disponibles
    const categoryIds = product.product_categories 
      ? product.product_categories.map(pc => pc.category_id)
      : [];
    
    // Configuration des images si disponibles
    const images = product.product_images 
      ? product.product_images.map(img => ({
          image_url: img.image_url,
          alt_text: img.alt_text || undefined
        }))
      : [];
    
    // Configuration des URL de prévisualisation
    if (product.product_images) {
      const previews = product.product_images.map(img => img.image_url);
      setImagePreview(previews);
    } else {
      setImagePreview([]);
    }
    
    setFormData({
      product: {
        name: product.name,
        slug: product.slug,
        description: product.description || '',
        price: product.price,
        stock_quantity: product.stock_quantity,
        is_active: product.is_active,
        is_featured: product.is_featured,
        low_stock_threshold: product.low_stock_threshold || 5
      },
      images,
      categories: categoryIds
    });
    
    setCurrentProductId(product.id);
    setIsEditMode(true);
    setShowForm(true);
  };
  
  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      product: {
        name: '',
        slug: '',
        description: '',
        price: 0,
        stock_quantity: 0,
        is_active: true,
        is_featured: false,
        low_stock_threshold: 5
      },
      images: [],
      categories: []
    });
    
    // Libérer les URL de prévisualisation
    imagePreview.forEach(url => URL.revokeObjectURL(url));
    setImagePreview([]);
    
    setCurrentProductId(null);
    setIsEditMode(false);
  };
  
  // Soumettre le formulaire (création ou mise à jour)
  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode && currentProductId) {
        // Mode mise à jour
        await updateProduct.mutateAsync({
          id: currentProductId,
          formData
        });
      } else {
        // Mode création
        await createProduct.mutateAsync(formData);
      }
      
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error(`Erreur lors de la ${isEditMode ? 'mise à jour' : 'création'} du produit:`, error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        // Mettre à jour l'état local immédiatement pour une interface réactive
        // Ceci est une mise à jour optimiste avant la confirmation de la base de données
        setLocalProducts(prevProducts => prevProducts.filter(product => product.id !== id));
        
        // Effectuer l'opération sur la base de données
        await deleteProduct.mutateAsync(id);
        
        // Rafraîchir les données après la suppression pour s'assurer que tout est synchronisé
        setTimeout(() => {
          refetch();
        }, 300);
      } catch (error) {
        console.error('Erreur lors de la suppression du produit:', error);
        alert(`Erreur: Impossible de supprimer le produit. ${error instanceof Error ? error.message : ''}`);
        
        // En cas d'erreur, recharger les données pour rétablir l'état correct
        refetch();
      }
    }
  };

  // Annuler l'édition
  const handleCancelEdit = () => {
    resetForm();
    setShowForm(false);
  };
  
  // Filtrer les produits selon la recherche et la catégorie
  const filteredProducts = localProducts.filter(product => {
    // Filtre de recherche
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtre de catégorie
    const matchesCategory = 
      categoryFilter === 'all' || 
      (product.product_categories && 
       product.product_categories.some((pc: { category_id: string }) => pc.category_id === categoryFilter));
    
    return matchesSearch && matchesCategory;
  });

  return (
    <ClientOnly>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Gestion des produits</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 w-64"
              />
            </div>
            {!isCategoriesLoading && categories && (
              <select 
                className="border rounded-md p-2 text-sm"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">Toutes les catégories</option>
                {categories.map((category: Category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}
            <Button
              onClick={() => {
                if (showForm) {
                  handleCancelEdit();
                } else {
                  resetForm();
                  setShowForm(true);
                }
              }}
              className="bg-[#f5a623] hover:bg-[#e09000] text-white"
            >
              {showForm ? 'Annuler' : <><Plus className="h-4 w-4 mr-2" /> Ajouter un produit</>}
            </Button>
          </div>
        </div>
        
        {/* Formulaire d'ajout ou de modification */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">
              {isEditMode ? 'Modifier le produit' : 'Ajouter un produit'}
            </h2>
            <form onSubmit={handleSubmitProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="product-name" className="block text-sm font-medium mb-1">Nom du produit</Label>
                  <Input
                    id="product-name"
                    name="name"
                    type="text"
                    value={formData.product.name}
                    onChange={handleProductChange}
                    onBlur={() => formData.product.slug === '' && generateSlug()}
                    className="w-full"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="product-slug" className="block text-sm font-medium mb-1">Slug</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="product-slug"
                      name="slug"
                      type="text"
                      value={formData.product.slug}
                      onChange={handleProductChange}
                      className="w-full"
                      required
                    />
                    <Button 
                      type="button" 
                      onClick={generateSlug} 
                      variant="outline"
                      className="whitespace-nowrap"
                    >
                      Générer
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="product-price" className="block text-sm font-medium mb-1">Prix (XAF)</Label>
                  <Input
                    id="product-price"
                    name="price"
                    type="number"
                    value={formData.product.price}
                    onChange={handleProductChange}
                    className="w-full"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="product-stock" className="block text-sm font-medium mb-1">Quantité en stock</Label>
                  <Input
                    id="product-stock"
                    name="stock_quantity"
                    type="number"
                    value={formData.product.stock_quantity}
                    onChange={handleProductChange}
                    className="w-full"
                    min="0"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="product-description" className="block text-sm font-medium mb-1">Description</Label>
                <textarea
                  id="product-description"
                  name="description"
                  value={formData.product.description || ''}
                  onChange={handleProductChange}
                  className="w-full rounded-md border p-2"
                  rows={3}
                />
              </div>
              
              {/* Sélection des catégories */}
              <div>
                <Label htmlFor="product-categories" className="block text-sm font-medium mb-1">Catégories</Label>
                <select
                  id="product-categories"
                  multiple
                  value={formData.categories}
                  onChange={handleCategoryChange}
                  className="w-full rounded-md border p-2"
                  size={3}
                >
                  {!isCategoriesLoading && categories && categories.map((category: Category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Maintenez Ctrl pour sélectionner plusieurs catégories</p>
              </div>
              
              {/* Gestionnaire d'images */}
              <div>
                <Label className="block text-sm font-medium mb-2">Photos du produit</Label>
                
                {/* Aperçu des images existantes */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                    {formData.images.map((image, index) => {
                      // Vérifier si l'image est un placeholder en attente de conversion
                      const isPlaceholder = image.image_url.startsWith('placeholder-');
                      
                      return (
                        <div key={index} className="relative h-24 w-full border rounded overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center">
                            {isPlaceholder ? (
                              <div className="flex items-center justify-center w-full h-full bg-gray-100">
                                <div className="animate-pulse flex space-x-2">
                                  <div className="h-3 w-3 bg-gray-400 rounded-full"></div>
                                  <div className="h-3 w-3 bg-gray-400 rounded-full"></div>
                                  <div className="h-3 w-3 bg-gray-400 rounded-full"></div>
                                </div>
                              </div>
                            ) : (
                              <img 
                                src={image.image_url} 
                                alt={image.alt_text || ''} 
                                className="h-full w-full object-cover" 
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  target.src = 'https://picsum.photos/seed/default/300/300';
                                }}
                              />
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            aria-label="Supprimer l'image"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Bouton d'ajout d'image */}
                <div className="flex items-center mb-2">
                  <label htmlFor="image-upload" className="cursor-pointer flex items-center justify-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors">
                    <Upload className="w-4 h-4 mr-2" />
                    <span>Ajouter des images</span>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      multiple
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">Formats acceptés: JPG, PNG. Taille max: 5MB.</p>
              </div>
              {/* Options avancées */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="low_stock_threshold" className="block text-sm font-medium mb-1">Seuil de stock bas</Label>
                  <Input
                    id="low_stock_threshold"
                    name="low_stock_threshold"
                    type="number"
                    value={formData.product.low_stock_threshold}
                    onChange={handleProductChange}
                    className="w-full"
                    min="1"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={formData.product.is_active}
                    onChange={handleProductChange}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="is_active" className="text-sm font-medium">Produit actif</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_featured"
                    name="is_featured"
                    checked={formData.product.is_featured}
                    onChange={handleProductChange}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="is_featured" className="text-sm font-medium">Produit en vedette</Label>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  onClick={handleCancelEdit}
                  variant="outline"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="bg-[#f5a623] hover:bg-[#e09000] text-white"
                  disabled={createProduct.isPending || updateProduct.isPending}
                >
                  {isEditMode ? 'Mettre à jour' : 'Ajouter le produit'}
                  {(createProduct.isPending || updateProduct.isPending) && (
                    <span className="ml-2 inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
        
        {/* Statut de chargement */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#f5a623] mb-2"></div>
            <p>Chargement des produits...</p>
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            <p>Erreur: {error.message}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-2 bg-red-600 hover:bg-red-700 text-white"
            >
              Réessayer
            </Button>
          </div>
        )}

        {/* Liste des produits */}
        {!isLoading && !error && (
          <div className="bg-white rounded-lg shadow-sm">
            {filteredProducts && filteredProducts.length > 0 ? (
              <>
                {/* Table pour les écrans moyens et grands */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center">
                                <img 
                                  src={getProductImageUrl(product)} 
                                  alt={product.name} 
                                  className="h-10 w-10 rounded-md object-cover" 
                                  onError={(e) => {
                                    // Remplacer par une icône si l'image ne charge pas
                                    const parent = e.currentTarget.parentElement;
                                    if (parent) {
                                      parent.innerHTML = '<div class="flex items-center justify-center w-full h-full"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5 text-gray-400"><path d="M21 16V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z"></path><polyline points="3 16 8 10 13 15"></polyline><polyline points="15 12 17 10 21 14"></polyline></svg></div>';
                                    }
                                  }}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="font-medium text-gray-900">{product.name}</div>
                                <div className="text-sm text-gray-500">{product.slug}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {product.price.toLocaleString()} XAF
                            {product.compare_at_price && (
                              <span className="text-xs text-gray-500 line-through ml-2">
                                {product.compare_at_price.toLocaleString()} XAF
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`${
                              product.stock_quantity <= (product.low_stock_threshold || 5) 
                                ? 'text-orange-600' 
                                : 'text-green-600'
                            }`}>
                              {product.stock_quantity}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {product.is_active ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 mr-2"
                              onClick={() => setupEditForm(product)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Modifier
                            </Button>
                            <Button
                              variant="ghost" 
                              size="sm"
                              className="text-red-600 hover:text-red-900 hover:bg-red-50"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Supprimer
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Cards pour les écrans mobiles */}
                <div className="grid grid-cols-1 gap-3 md:hidden">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                      {/* En-tête de la carte avec image et info de base */}
                      <div className="flex items-center p-3 border-b border-gray-100">
                        <div className="relative h-14 w-14 rounded-md flex-shrink-0 overflow-hidden bg-gray-50">
                          <img 
                            src={getProductImageUrl(product)} 
                            alt={product.name} 
                            className="h-full w-full object-cover" 
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.onerror = null;
                              target.src = 'https://picsum.photos/seed/default/50/50';
                            }}
                          />
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                          <div className="flex items-center justify-between mt-0.5">
                            <p className="text-xs text-gray-500 truncate">{product.slug}</p>
                            <span className={`ml-2 px-2 py-0.5 text-xs leading-none font-medium rounded-full ${
                              product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {product.is_active ? 'Actif' : 'Inactif'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Corps de la carte avec détails */}
                      <div className="grid grid-cols-2 gap-2 p-3 text-sm border-b border-gray-100">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Prix</div>
                          <div className="font-medium">
                            {product.price.toLocaleString()} XAF
                            {product.compare_at_price && (
                              <div className="text-xs text-gray-400 line-through">
                                {product.compare_at_price.toLocaleString()} XAF
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Stock</div>
                          <div className={`font-medium ${
                            product.stock_quantity <= (product.low_stock_threshold || 5) 
                              ? 'text-orange-600' 
                              : 'text-green-600'
                          }`}>
                            {product.stock_quantity} unités
                          </div>
                        </div>
                      </div>
                      
                      {/* Pied de carte avec actions */}
                      <div className="flex p-2 bg-gray-50 justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => {
                            window.scrollTo(0, 0); // Défilement vers le haut pour voir le formulaire
                            setupEditForm(product);
                          }}
                        >
                          <Edit className="h-3.5 w-3.5 mr-1.5" /> Modifier
                        </Button>
                        <Button
                          variant="outline" 
                          size="sm"
                          className="h-8 text-xs text-red-600 border-red-200"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Supprimer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            
            ) : (
              <div className="p-6 text-center">
                <PackageOpen className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <h3 className="text-lg font-medium text-gray-900">Aucun produit trouvé</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery ? 'Aucun résultat ne correspond à votre recherche.' : 'Vous n\'avez pas encore ajouté de produits.'}
                </p>
                {searchQuery && (
                  <Button
                    onClick={() => setSearchQuery('')}
                    className="mt-3"
                    variant="outline"
                  >
                    Effacer la recherche
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </ClientOnly>
  );
}
